# ⚠️ LEGACY FOLDER - NOT USED

## This folder is NOT referenced by the current site

The **canonical JavaScript file** is located at:
```
/assets/app.js
```

### Why This Folder Exists
This folder contains an **older version** of the JavaScript that was used in a previous iteration of the site. It is no longer referenced by `index.html`.

### Current References in index.html
```html
<script src="assets/app.js?v=12"></script>
```

### What to Do
- ✅ **Edit `/assets/app.js`** for changes that affect the live site
- ❌ **DO NOT edit this folder** - changes here won't appear on the site
- 📚 **This folder serves as reference** in case recovery is needed
- 🗑️ **This folder can be safely deleted** if no longer needed for reference

### Key Differences
This legacy JavaScript file has:
- No `APP_VERSION` constant
- No `setMainTopFromHeader()` function
- Different AI tip text (Hebrew vs English)
- Missing version stamp population

The canonical `/assets/app.js` file has been updated with:
- Version tracking and display
- Responsive header height calculation
- English UI text for international users
- Complete initialization flow

---

**Last Updated:** 2026-01-27  
**Status:** Legacy / Not Active
