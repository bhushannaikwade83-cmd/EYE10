# 🎨 EYE10 Theme Customization Guide

## Quick Start - Change Your Website's Look Instantly!

### **Main Theme File: `src/styles/theme.css`**

This is the **ONLY file you need to edit** to change the entire website's appearance!

---

## 🎯 How to Change Colors

### Option 1: Edit CSS Variables (Recommended)

Open `src/styles/theme.css` and change these variables:

```css
:root {
  /* Change Primary Color */
  --primary: #6366f1;           /* Your main brand color */
  --primary-dark: #4f46e5;      /* Darker shade for hover */
  --primary-light: #818cf8;    /* Lighter shade for accents */
  
  /* Change Hero Gradient */
  --gradient-hero: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  /* Change Button Gradient */
  --gradient-primary: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}
```

### Option 2: Use Pre-built Themes

Uncomment one of these themes in `src/styles/theme.css`:

**Purple Theme:**
```css
:root {
  --primary: #8b5cf6;
  --primary-dark: #7c3aed;
  --primary-light: #a78bfa;
  --gradient-hero: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
  --gradient-primary: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}
```

**Green Theme:**
```css
:root {
  --primary: #10b981;
  --primary-dark: #059669;
  --primary-light: #34d399;
  --gradient-hero: linear-gradient(135deg, #34d399 0%, #059669 100%);
  --gradient-primary: linear-gradient(135deg, #10b981 0%, #059669 100%);
}
```

**Orange Theme:**
```css
:root {
  --primary: #f59e0b;
  --primary-dark: #d97706;
  --primary-light: #fbbf24;
  --gradient-hero: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
  --gradient-primary: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}
```

---

## 📝 All Available Variables

### Colors
- `--primary` - Main brand color
- `--primary-dark` - Darker shade
- `--primary-light` - Lighter shade
- `--secondary` - Secondary color
- `--accent` - Accent color
- `--dark` - Text color
- `--light` - Background color
- `--gray` - Gray text
- `--border` - Border color

### Gradients
- `--gradient-primary` - Primary button gradient
- `--gradient-hero` - Hero section gradient
- `--gradient-secondary` - Secondary button gradient
- `--gradient-background` - Page background gradient

### Typography
- `--font-family` - Main font
- `--font-size-*` - Font sizes (xs, sm, base, lg, xl, 2xl, etc.)

### Spacing
- `--spacing-*` - Spacing values (xs, sm, md, lg, xl, 2xl, etc.)

### Shadows
- `--shadow-sm` - Small shadow
- `--shadow-md` - Medium shadow
- `--shadow-lg` - Large shadow
- `--shadow-xl` - Extra large shadow

### Border Radius
- `--radius-sm` - Small radius (8px)
- `--radius-md` - Medium radius (12px)
- `--radius-lg` - Large radius (16px)
- `--radius-xl` - Extra large radius (20px)

---

## 🎨 Quick Theme Examples

### Modern Blue (Current)
```css
--primary: #6366f1;
--gradient-hero: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Elegant Purple
```css
--primary: #8b5cf6;
--gradient-hero: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
```

### Fresh Green
```css
--primary: #10b981;
--gradient-hero: linear-gradient(135deg, #34d399 0%, #059669 100%);
```

### Warm Orange
```css
--primary: #f59e0b;
--gradient-hero: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
```

---

## 🔧 Advanced Customization

### Change Fonts

Edit in `src/styles/theme.css`:
```css
:root {
  --font-family: 'Your Font Name', sans-serif;
}
```

Don't forget to add the font import in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Your+Font+Name&display=swap" rel="stylesheet">
```

### Change Spacing

Edit spacing values:
```css
:root {
  --spacing-lg: 32px;  /* Change from 24px to 32px */
  --spacing-xl: 48px;  /* Change from 32px to 48px */
}
```

### Change Shadows

Make shadows more/less prominent:
```css
:root {
  --shadow-lg: 0 15px 30px -5px rgba(0, 0, 0, 0.2);  /* Stronger shadow */
  --shadow-md: 0 2px 4px rgba(0, 0, 0, 0.1);        /* Lighter shadow */
}
```

---

## 📱 Responsive Breakpoints

Edit breakpoints in `src/styles/theme.css` (if needed):
```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
```

---

## 🚀 Quick Tips

1. **Always save** `src/styles/theme.css` after making changes
2. **Refresh your browser** to see changes (or use hot reload)
3. **Test on mobile** after changing spacing/sizes
4. **Use color pickers** to find perfect color combinations
5. **Keep contrast** - ensure text is readable on backgrounds

---

## 🎯 Common Customizations

### Make buttons more rounded:
```css
--radius-md: 20px;  /* Change from 12px */
```

### Make shadows stronger:
```css
--shadow-lg: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
```

### Change background color:
```css
--light: #ffffff;  /* Pure white */
--light-gray: #f5f5f5;  /* Light gray */
```

---

## 📞 Need Help?

- All colors use hex format: `#RRGGBB`
- Gradients use: `linear-gradient(direction, color1, color2)`
- Shadows use: `0 Xpx Ypx rgba(0, 0, 0, opacity)`

**Remember:** Edit only `src/styles/theme.css` to change the entire website's appearance!
