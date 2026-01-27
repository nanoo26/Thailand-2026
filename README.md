# Thailand 2026 - Kosher Map (Mobile)

A mobile-first interactive map for Phuket, Koh Samui, and Bangkok.
Shows kosher restaurants and shops (plus optional hotels as reference).

## 🚀 Quick Start

### View the Live Site
Visit: `https://nanoo26.github.io/Thailand-2026/`

### GitHub Pages Setup
1. Go to **Repo Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: **main**, Folder: **/ (root)**
4. Save and wait for the Pages URL

---

## 📁 File Structure

### ✅ Active/Canonical Files (Currently Used)
These files are actively used by the site:

```
/Thailand-2026/
├── index.html           # Main HTML file
├── assets/
│   ├── app.js          # Main JavaScript (v12-fixed)
│   └── styles.css      # Main stylesheet
├── data/
│   └── places.json     # Places data (cities, restaurants, shops)
└── README.md
```

### ⚠️ Legacy Files (NOT Used)
These folders exist but are **NOT referenced** by the current site:

```
/css/
└── styles.css          # Old stylesheet (not used)

/js/
└── app.js             # Old JavaScript (not used)
```

**Note:** Edit files in `/assets/` only. Changes to `/css/` or `/js/` won't affect the site.

---

## 📝 How to Update Places Data

### Edit `data/places.json`

The data file has two main sections:

#### 1. Cities
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
  ]
}
```

#### 2. Places
```json
{
  "places": [
    {
      "cityKey": "phuket",
      "name": "Restaurant Name",
      "kind": "restaurant",
      "kosher": "Badatz",
      "address": "123 Main St",
      "lat": 7.905,
      "lng": 98.298,
      "website": "https://example.com",
      "status": "Open"
    }
  ]
}
```

**Fields:**
- `cityKey`: Must match a city's cityKey (phuket/samui/bangkok)
- `kind`: "restaurant" or "shop"
- `kosher`: Kosher certification (optional)
- `lat`/`lng`: Required - GPS coordinates
- `website`: Optional - place website
- `status`: Optional - "Open", "Closed", etc.

### Getting Coordinates
1. Open Google Maps
2. Right-click on the location
3. Click the coordinates at the top to copy them
4. Format: `lat, lng` (e.g., `7.905123, 98.298456`)

---

## 🍽️ Adding More Kosher Places

To add a new restaurant or shop:

1. Find the exact location on Google Maps
2. Right-click → "What's here?" to get coordinates
3. Edit `data/places.json` and add:

```json
{
  "cityKey": "phuket",
  "kind": "restaurant",
  "name": "Your Restaurant Name",
  "address": "Full address",
  "lat": 7.1234,
  "lng": 98.5678,
  "website": "https://example.com",
  "kosher": "Supervision type",
  "status": "verified"
}
```

4. Commit and push - GitHub Pages will auto-update in 2 minutes

### Coordinate Tips:
- Use at least 4 decimal places for accuracy
- Positive lat = North, positive lng = East
- Verify on map after adding

---

## 🔄 Cache Busting (Force Browser Refresh)

When you update JavaScript or CSS, browsers may cache old versions. To force refresh:

### Method 1: Update Version Query String
In `index.html`, increment the version number:

```html
<!-- Before -->
<link rel="stylesheet" href="assets/styles.css?v=12" />
<script src="assets/app.js?v=12"></script>

<!-- After -->
<link rel="stylesheet" href="assets/styles.css?v=13" />
<script src="assets/app.js?v=13"></script>
```

### Method 2: Update APP_VERSION
In `assets/app.js`:

```javascript
const APP_VERSION = "v13-description"; // Increment version
```

The version number appears in the bottom-right corner of the page.

---

## 🛠️ Local Development

### Prerequisites
- A web browser (Chrome, Firefox, Safari)
- A local web server (required for fetch() to work)

### Option 1: Python Simple Server
```bash
# Python 3
cd /path/to/Thailand-2026
python3 -m http.server 8000

# Open http://localhost:8000
```

### Option 2: Node.js http-server
```bash
npm install -g http-server
cd /path/to/Thailand-2026
http-server -p 8000

# Open http://localhost:8000
```

### Option 3: VS Code Live Server
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

---

## 🧪 Testing Checklist

Before pushing changes, verify:

### Desktop Testing
- [ ] Open the page - no console errors
- [ ] Map renders with tiles
- [ ] City tabs switch correctly (פוקט, קוסמוי, בנגקוק)
- [ ] Filter chips work (הכל, מסעדות, חנויות)
- [ ] Click marker → bottom sheet opens
- [ ] Click backdrop or סגור → sheet closes
- [ ] Google Maps buttons work (Directions, Place)
- [ ] Website button shows only when available
- [ ] Grab button shows for distant places (>1.2km)
- [ ] Version stamp shows in bottom-right

### Mobile Testing (or Chrome DevTools)
- [ ] Map is draggable and zoomable
- [ ] Tap marker → sheet opens
- [ ] Sheet doesn't block map when closed
- [ ] All buttons are touch-friendly (44px+ height)
- [ ] RTL layout displays correctly
- [ ] No horizontal scroll

### Code Validation
```bash
# Check JavaScript syntax
node -c assets/app.js

# Validate JSON
node -e "console.log(JSON.parse(require('fs').readFileSync('data/places.json')))"
```

---

## 🐛 Debugging Tips

### Check Browser Console
Press **F12** (or **Cmd+Option+I** on Mac) to open DevTools:
- **Console tab:** See JavaScript errors
- **Network tab:** Check if files load (look for 404s)
- **Elements tab:** Inspect HTML structure

### Common Issues

**1. Map doesn't render**
- Check browser console for Leaflet errors
- Verify `data/places.json` loads successfully
- Check if `#map` element exists in HTML

**2. Markers don't appear**
- Verify `lat`/`lng` values are numbers (not strings)
- Check if places have matching `cityKey`
- Check filter selection (might be filtering them out)

**3. Bottom sheet won't open**
- Check if `openSheet()` function exists
- Verify all DOM IDs exist (sheetTitle, sheetSub, etc.)
- Check console for JavaScript errors

**4. Buttons don't work**
- Verify event listeners are bound in `init()`
- Check if button IDs match HTML
- Look for errors in button click handlers

---

## 📦 Version History

- **v12-fixed** (2026-01-27): Fixed truncated `assets/app.js`, restored `init()` function, added version stamp
- **v11-clean** (Earlier): Cleaned up code structure
- **v10 and earlier**: Initial versions

---

## 🤝 Contributing

### Making Changes
1. Edit files in `/assets/` and `data/`
2. Test locally (see Local Development section)
3. Update version numbers (query strings and APP_VERSION)
4. Commit and push to GitHub
5. Wait for GitHub Pages to deploy (~30 seconds)
6. Test on live site

### Reporting Issues
Found a bug? Please include:
- What you were doing when the bug occurred
- Browser and device (e.g., "Chrome on iPhone 13")
- Screenshot or console error message
- Steps to reproduce

---

## 📖 Technical Notes
- The app geocodes addresses using Nominatim (OpenStreetMap). It throttles to ~1 request/second.
- First load may take a bit, then it caches results in localStorage.
- "Status: claimed" means the business claims kosher on its own pages. Verify locally if you need strict confirmation.
- Distance calculation uses haversine formula (as the crow flies)
- Grab deep link may not work on all devices/browsers
