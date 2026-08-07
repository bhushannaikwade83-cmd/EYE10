#!/usr/bin/env python3
"""Flood-fill the flat/near-flat background out of a product photo.
Reference color comes from small patches at the four corners only
(robust against the border-scan touching the subject or its shadow).
Gate is local-neighbor + bounded-global, and the alpha edge is
feathered afterward so the cutout blends instead of looking jagged."""
import sys
from PIL import Image, ImageFilter
from collections import deque

def dist(a, b):
    return max(abs(a[0]-b[0]), abs(a[1]-b[1]), abs(a[2]-b[2]))

def corner_ref(rgb, w, h, patch=6):
    """Mode (not mean) of border-pixel colors, bucketed — robust against a
    stray dark shadow/edge contaminating a few border samples."""
    from collections import Counter
    buckets = Counter()
    bucket_repr = {}
    step = max(1, min(w, h) // 120)
    for x in range(0, w, step):
        for y in (0, h - 1):
            c = rgb[x, y]
            key = (c[0] // 8, c[1] // 8, c[2] // 8)
            buckets[key] += 1
            bucket_repr[key] = c
    for y in range(0, h, step):
        for x in (0, w - 1):
            c = rgb[x, y]
            key = (c[0] // 8, c[1] // 8, c[2] // 8)
            buckets[key] += 1
            bucket_repr[key] = c
    best = buckets.most_common(1)[0][0]
    return bucket_repr[best]

def cutout(src, out, local_tol=14, global_tol=70, feather=1.4):
    img = Image.open(src).convert("RGBA")
    w, h = img.size
    rgb = img.convert("RGB").load()
    px = img.load()

    ref = corner_ref(rgb, w, h)

    visited = bytearray(w * h)
    q = deque()

    def seed(x, y):
        idx = y * w + x
        if not visited[idx] and dist(rgb[x, y], ref) <= global_tol:
            visited[idx] = 1
            q.append((x, y))

    for x in range(w):
        seed(x, 0); seed(x, h - 1)
    for y in range(h):
        seed(0, y); seed(w - 1, y)

    while q:
        x, y = q.popleft()
        cur = rgb[x, y]
        r, g, b, a = px[x, y]
        px[x, y] = (r, g, b, 0)
        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)):
            nx, ny = x+dx, y+dy
            if 0 <= nx < w and 0 <= ny < h:
                nidx = ny*w+nx
                if not visited[nidx]:
                    cand = rgb[nx, ny]
                    if dist(cand, cur) <= local_tol and dist(cand, ref) <= global_tol:
                        visited[nidx] = 1
                        q.append((nx, ny))

    if feather > 0:
        alpha = img.split()[3].filter(ImageFilter.GaussianBlur(feather))
        img.putalpha(alpha)

    bbox = img.getbbox()
    if bbox:
        pad = 2
        bbox = (max(bbox[0]-pad,0), max(bbox[1]-pad,0), min(bbox[2]+pad,w), min(bbox[3]+pad,h))
        img = img.crop(bbox)
    img.save(out, "PNG")
    print(f"{src} -> {out}  ref={ref} size={img.size}")

if __name__ == "__main__":
    src, out = sys.argv[1], sys.argv[2]
    local_tol = int(sys.argv[3]) if len(sys.argv) > 3 else 14
    global_tol = int(sys.argv[4]) if len(sys.argv) > 4 else 70
    cutout(src, out, local_tol, global_tol)
