# ⚠️ LEGACY FOLDER - NOT USED

## This folder is NOT referenced by the current site

The **canonical CSS file** is located at:
```
/assets/styles.css
```

### Why This Folder Exists
This folder contains an **older version** of the stylesheet that was used in a previous iteration of the site. It is no longer referenced by `index.html`.

### Current References in index.html
```html
<link rel="stylesheet" href="assets/styles.css?v=12" />
```

### What to Do
- ✅ **Edit `/assets/styles.css`** for changes that affect the live site
- ❌ **DO NOT edit this folder** - changes here won't appear on the site
- 🗑️ **This folder can be safely deleted** if no longer needed for reference

### Key Differences
This legacy stylesheet uses different positioning and z-index values:
- `.topbar`: `position: sticky` (should be `fixed`)
- `.main`: `position: relative` (should be `fixed`)
- `.sheet`: `z-index: 40` (should be `80`)
- `.backdrop`: `z-index: 35` (should be `70`)

These differences would cause layout and interaction issues on mobile.

---

**Last Updated:** 2026-01-27  
**Status:** Legacy / Not Active
