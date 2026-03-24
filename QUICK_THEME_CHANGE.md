# 🎨 QUICK THEME CHANGE GUIDE

## ⚡ ONE FILE TO RULE THEM ALL!

**File Location:** `src/styles/theme.css`

---

## 🚀 How to Change Your Website's Look

### Step 1: Open the Theme File
Open: `src/styles/theme.css`

### Step 2: Change Colors
Find this section and change the colors:

```css
:root {
  /* CHANGE THESE COLORS */
  --primary: #6366f1;           /* Main color - change this! */
  --primary-dark: #4f46e5;      /* Darker shade */
  --primary-light: #818cf8;    /* Lighter shade */
  
  /* CHANGE HERO GRADIENT */
  --gradient-hero: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  /* CHANGE BUTTON GRADIENT */
  --gradient-primary: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}
```

### Step 3: Save and Refresh
1. Save the file
2. Refresh your browser
3. Done! ✨

---

## 🎨 Quick Color Examples

### Blue (Current)
```css
--primary: #6366f1;
--gradient-hero: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Purple
```css
--primary: #8b5cf6;
--gradient-hero: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
```

### Green
```css
--primary: #10b981;
--gradient-hero: linear-gradient(135deg, #34d399 0%, #059669 100%);
```

### Orange
```css
--primary: #f59e0b;
--gradient-hero: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
```

### Red
```css
--primary: #ef4444;
--gradient-hero: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
```

### Teal
```css
--primary: #14b8a6;
--gradient-hero: linear-gradient(135deg, #5eead4 0%, #0d9488 100%);
```

---

## 📝 What Each Variable Does

| Variable | What It Changes |
|----------|----------------|
| `--primary` | Buttons, links, highlights |
| `--primary-dark` | Button hover states |
| `--primary-light` | Accents, borders |
| `--gradient-hero` | Hero section background |
| `--gradient-primary` | Button backgrounds |
| `--dark` | Text color |
| `--light` | Page background |
| `--border` | Border colors |

---

## 💡 Pro Tips

1. **Use a color picker** - Pick colors from your logo or brand
2. **Keep contrast** - Dark text on light backgrounds
3. **Test gradients** - Make sure colors blend well
4. **Save often** - Changes appear instantly

---

## 🎯 That's It!

Just edit `src/styles/theme.css` and change the colors. The entire website will update automatically!

**No other files need to be changed!** 🎉
