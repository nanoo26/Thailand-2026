# Thailand 2026 - Kosher Map (Mobile)

A mobile-first interactive map for Phuket, Koh Samui, and Bangkok.
Shows kosher restaurants and shops (plus optional hotels as reference).

## How to use (GitHub Pages)
1. Repo Settings -> Pages
2. Source: Deploy from a branch
3. Branch: main, Folder: / (root)
4. Save, wait for the Pages URL

## How to Update Places Data

Edit the `data/places.json` file to add, remove, or modify locations:

```json
{
  "cities": [
    {
      "cityKey": "phuket",
      "labelHe": "פוקט",
      "hotelLat": 7.904425,
      "hotelLng": 98.29728,
      "zoom": 13
    }
  ],
  "places": [
    {
      "cityKey": "phuket",
      "kind": "restaurant",
      "name": "Restaurant Name",
      "lat": 7.904425,
      "lng": 98.29728,
      "kosher": "Badatz",
      "address": "123 Main St",
      "website": "https://example.com",
      "status": "Open"
    }
  ]
}
```

After editing, commit and push. GitHub Pages will automatically deploy.

## How to Force Refresh

If users see old cached versions, update the cache-busting version number in `index.html`:

```html
<link rel="stylesheet" href="assets/styles.css?v=13" />
<script src="assets/app.js?v=13"></script>
```

Also update `APP_VERSION` in `assets/app.js`:

```javascript
const APP_VERSION = "v13-description";
```

## Which Files Are Canonical

**Use these files (in `/assets/`):**
- `/assets/styles.css` - Current CSS
- `/assets/app.js` - Current JavaScript
- `/data/places.json` - Data source

**Do NOT edit these (legacy folders):**
- `/css/` - Old CSS (not referenced by `index.html`)
- `/js/` - Old JavaScript (not referenced by `index.html`)

See `css/README_LEGACY.md` and `js/README_LEGACY.md` for details.

## Testing Checklist

### Desktop Browser
- [ ] Open site URL
- [ ] Console shows no errors
- [ ] Map renders immediately
- [ ] Version stamp shows correct version (bottom left)
- [ ] City tabs work (פוקט, קוסמוי, בנגקוק)
- [ ] Filter chips work (הכל, מסעדות, חנויות)
- [ ] Click marker → sheet opens from bottom
- [ ] Click backdrop → sheet closes
- [ ] Click סגור button → sheet closes
- [ ] Google Maps buttons open correct links
- [ ] Grab button shows/hides based on distance

### Mobile (Touch Device)
- [ ] Map is draggable and zoomable
- [ ] Tapping marker opens sheet
- [ ] Sheet doesn't block map when closed
- [ ] Buttons are touch-friendly (44px tall)
- [ ] RTL layout works correctly
- [ ] No horizontal scroll

## Troubleshooting

### Map doesn't load
- Check browser console for JavaScript errors
- Verify `data/places.json` is valid JSON
- Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Old version still showing
- Clear browser cache
- Bump version in `index.html` query strings
- Add `?v=` random number to URL in browser

### Markers not clickable
- Check `assets/app.js` has complete `init()` function
- Verify Leaflet library loaded (check Network tab)

## Notes
- The app geocodes addresses using Nominatim (OpenStreetMap). It throttles to ~1 request/second.
- First load may take a bit, then it caches results in localStorage.
- "Status: claimed" means the business claims kosher on its own pages. Verify locally if you need strict confirmation.
