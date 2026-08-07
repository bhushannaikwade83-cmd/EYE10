#!/usr/bin/env python3
"""Remove the vignette-tan background from the EYE10 logo.
The background isn't flat (it's a subtle vignette from white corners to
tan mid-edges), so we flood-fill from the border comparing each pixel to
the NEIGHBOR that discovered it (local tolerance) rather than a single
global reference color. This follows the gradient without leaking into
the dark letterforms, which have a much bigger jump in value."""
from PIL import Image
from collections import deque

SRC = r"D:\Github Repos\EYE10\src\assets\eye10-logo-original-backup.jpg"
OUT = r"D:\Github Repos\EYE10\src\assets\eye10-logo.png"

LOCAL_TOL = 14  # per-channel distance allowed between adjacent bg pixels

def close(a, b, tol=LOCAL_TOL):
    return abs(a[0] - b[0]) <= tol and abs(a[1] - b[1]) <= tol and abs(a[2] - b[2]) <= tol

def main():
    img = Image.open(SRC).convert("RGBA")
    w, h = img.size
    rgb = img.convert("RGB").load()
    px = img.load()

    visited = bytearray(w * h)
    q = deque()

    def seed(x, y):
        idx = y * w + x
        if not visited[idx]:
            visited[idx] = 1
            q.append((x, y))

    for x in range(w):
        seed(x, 0)
        seed(x, h - 1)
    for y in range(h):
        seed(0, y)
        seed(w - 1, y)

    while q:
        x, y = q.popleft()
        cur_color = rgb[x, y]
        r, g, b, a = px[x, y]
        px[x, y] = (r, g, b, 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h:
                nidx = ny * w + nx
                if not visited[nidx] and close(rgb[nx, ny], cur_color):
                    visited[nidx] = 1
                    q.append((nx, ny))

    img.save(OUT, "PNG")
    transparent = sum(1 for y in range(h) for x in range(w) if px[x, y][3] == 0)
    print(f"Saved {OUT} ({w}x{h}); transparent px: {transparent} / {w*h} ({100*transparent/(w*h):.1f}%)")

if __name__ == "__main__":
    main()
