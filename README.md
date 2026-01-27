# Thailand 2026 - Kosher Map (Mobile)

A mobile-first interactive map for Phuket, Koh Samui, and Bangkok.
Shows kosher restaurants and shops (plus optional hotels as reference).

## How to use (GitHub Pages)
1. Repo Settings -> Pages
2. Source: Deploy from a branch
3. Branch: main, Folder: / (root)
4. Save, wait for the Pages URL

## How to Update Places Data

Edit `data/places.json` to add, remove, or modify locations.

### JSON Structure Example:
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
      "name": "Kosher Restaurant Name",
      "lat": 7.905,
      "lng": 98.298,
      "address": "123 Main Street",
      "kosher": "Badatz",
      "website": "https://example.com",
      "status": "Open"
    }
  ]
}
```

### Field Definitions:
- **kind**: `"restaurant"` or `"shop"`
- **kosher**: Certification type (optional)
- **address**: Street address (optional)
- **website**: URL (optional)
- **status**: Current status like "Open", "Closed", "Temporarily closed" (optional)

## How to Force Refresh (Cache Busting)

When you make changes to CSS or JavaScript:

1. **Update version numbers** in `index.html`:
   ```html
   <link rel="stylesheet" href="assets/styles.css?v=12" />
   <script src="assets/app.js?v=12"></script>
   ```

2. **Update APP_VERSION** in `assets/app.js`:
   ```javascript
   const APP_VERSION = "v12-fixed";
   ```

3. **Commit and push changes** to GitHub

4. **Users should hard refresh**:
   - Desktop: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Mobile: Clear browser cache or add `?v=12` to URL

## Which Files Are Canonical

| Purpose | Canonical File | Legacy/Unused |
|---------|---------------|---------------|
| **Styles** | `/assets/styles.css` | `/css/styles.css` ❌ |
| **JavaScript** | `/assets/app.js` | `/js/app.js` ❌ |
| **Data** | `/data/places.json` | - |
| **HTML** | `/index.html` | - |

⚠️ **Important**: Only edit files in `/assets/` folder. Files in `/css/` and `/js/` are legacy and NOT loaded by `index.html`.

## Local Development

### Option 1: Simple HTTP Server (Python)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open: `http://localhost:8000`

### Option 2: Live Server (VS Code Extension)
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

### Testing Your Changes:
1. Edit `data/places.json` or `assets/app.js`
2. Refresh browser
3. Check browser console for errors (F12)
4. Verify map functionality

## Testing Checklist

Before committing changes:

### Desktop Testing:
- [ ] No console errors (F12 → Console)
- [ ] Map renders and loads tiles
- [ ] City tabs switch locations
- [ ] Filter chips work (All/Restaurants/Shops)
- [ ] Markers appear on map
- [ ] Clicking marker opens bottom sheet
- [ ] Clicking backdrop closes sheet
- [ ] Close button (סגור) works
- [ ] Google Maps links open correctly
- [ ] Grab button appears/disappears based on distance
- [ ] Version stamp shows correct version (bottom-left)

### Mobile Testing:
- [ ] Map is draggable (touch and drag)
- [ ] Map is pinch-zoomable
- [ ] Tapping marker opens sheet
- [ ] Sheet slides up smoothly
- [ ] Backdrop tap closes sheet
- [ ] No horizontal scrolling
- [ ] Buttons are touch-friendly (44px minimum)
- [ ] RTL layout works correctly

### Data Testing:
- [ ] All places load from `places.json`
- [ ] Switching cities filters places correctly
- [ ] Distance calculation shows reasonable values
- [ ] All place properties display correctly

## Troubleshooting

### Map doesn't load
- Check browser console for errors
- Verify `data/places.json` is valid JSON
- Check that Leaflet CDN is accessible
- Clear browser cache and hard refresh

### Markers don't appear
- Verify lat/lng values are valid numbers
- Check that places have matching `cityKey`
- Ensure filter chip isn't excluding places

### Bottom sheet doesn't open
- Check console for JavaScript errors
- Verify all required DOM elements exist in `index.html`
- Clear cache and reload with `?v=NEW_VERSION`

### Styling looks broken
- Verify you're editing `/assets/styles.css` (NOT `/css/styles.css`)
- Check that version query string is updated in `index.html`
- Clear browser cache

### Changes don't appear on GitHub Pages
- Verify files are committed and pushed to `main` branch
- Wait 1-2 minutes for GitHub Pages to rebuild
- Do a hard refresh in browser
- Add query parameter to URL: `?v=timestamp`

### Mobile scrolling issues
- Ensure `index.html` references `/assets/styles.css`
- Check that `.topbar` has `position: fixed`
- Verify `.main` has correct `top` value set by JavaScript

## Notes
- The app uses Leaflet.js for maps with OpenStreetMap tiles
- Version stamp appears in bottom-left corner for debugging
- "Status: claimed" means the business claims kosher on its own pages. Verify locally if you need strict confirmation.
- Distance calculation uses haversine formula (as the crow flies)
- Grab deep link may not work on all devices/browsers
