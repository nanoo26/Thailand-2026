# תאילנד 2026 - Thailand Kosher Places Map

🇮🇱 מפה אינטראקטיבית למקומות כשרים בתאילנד | Interactive map for kosher places in Thailand

## 📱 About / אודות

This is a mobile-first, RTL Hebrew static web application that helps Jewish travelers find kosher restaurants and shops in Thailand. The app uses Leaflet.js with OpenStreetMap (no API keys required) to display kosher places across three major cities: Phuket, Koh Samui, and Bangkok.

אפליקציית אינטרנט סטטית בעברית עם תמיכה ב-RTL, מותאמת למובייל, שעוזרת לתיירים יהודים למצוא מסעדות וחנויות כשרות בתאילנד. האפליקציה משתמשת ב-Leaflet.js עם OpenStreetMap (ללא צורך במפתחות API) להצגת מקומות כשרים בשלושה ערים מרכזיות: פוקט, קוסמוי ובנגקוק.

## 🌟 Features / תכונות

### Core Features / תכונות עיקריות
- **RTL Hebrew Interface** / ממשק בעברית מימין לשמאל
- **Mobile-First Design** / עיצוב מותאם מובייל תחילה
- **Three City Layers** / שלוש שכבות עיר:
  - **Phuket** - Four Points by Sheraton Patong
  - **Koh Samui** - OZO Chaweng Samui
  - **Bangkok** - LiT Bangkok Hotel
- **Interactive Map** / מפה אינטראקטיבית with Leaflet + OpenStreetMap
- **No API Keys Required** / ללא צורך במפתחות API

### Navigation Features / תכונות ניווט
- **City Switcher** / מעבר בין ערים - Easy switching between Phuket, Samui, and Bangkok
- **Category Filter** / סינון קטגוריות - Filter by restaurants (מסעדות) or shops (חנויות)
- **Search Function** / חיפוש - Search places by name or address
- **Hotel Origins** / נקודות מלון - Each city shows your hotel as the starting point

### Place Details / פרטי מקום
When you tap on a marker, a bottom sheet shows:
- Place name and category
- Full address
- Distance from hotel (Haversine calculation)
- Website link (if available)
- **AI-Powered Tip** / טיפ חכם:
  - Walking recommended if < 1.2km
  - Grab recommended for longer distances
  - Night/hot weather bias for safety and comfort

### Quick Actions / פעולות מהירות
- **📍 Open in Google Maps** - View location on Google Maps
- **🧭 Get Directions** - Walking directions from hotel
- **🚗 Order Grab** - Opens Grab app if installed, falls back to browser
- **🌐 Visit Website** - Direct link to place's website

## 🗺️ Cities & Hotels / ערים ומלונות

### Phuket / פוקט
- **Hotel**: Four Points by Sheraton Patong
- **Coordinates**: 7.8935°N, 98.2968°E
- **Kosher Places**: Chabad House Phuket, Kosher Kitchen Patong

### Koh Samui / קוסמוי
- **Hotel**: OZO Chaweng Samui
- **Coordinates**: 9.2281°N, 100.0847°E
- **Kosher Places**: Chabad Koh Samui, Kosher Shop Samui

### Bangkok / בנגקוק
- **Hotel**: LiT Bangkok Hotel
- **Coordinates**: 13.7278°N, 100.5720°E
- **Kosher Places**: Chabad House Bangkok, Beit Hamorim Restaurant, Kosher Delight, Jerusalem Kosher Shop

## 📁 File Structure / מבנה קבצים

```
Thailand-2026/
├── index.html              # Main application file
├── data/
│   ├── cities.json        # Hotel locations and city data
│   └── places.json        # Kosher restaurants and shops
├── README.md              # This file
└── LICENSE                # MIT License
```

## 📊 Data Format / פורמט נתונים

### cities.json
```json
[
  {
    "id": "phuket",
    "name": "פוקט",
    "nameEn": "Phuket",
    "hotel": "Four Points by Sheraton Patong",
    "lat": 7.8935,
    "lng": 98.2968
  }
]
```

### places.json
```json
[
  {
    "city": "phuket",
    "name": "Chabad House Phuket",
    "cat": "מסעדה",
    "lat": 7.8946,
    "lng": 98.2975,
    "address": "94 Thaweewong Road, Patong",
    "site": "https://www.chabadphuket.com"
  }
]
```

## 🚀 Deployment / הפעלה

### GitHub Pages
1. Go to repository Settings
2. Navigate to Pages section
3. Select branch (main or copilot/create-mobile-rtl-hebrew-app)
4. Save and wait for deployment
5. Access at: `https://nanoo26.github.io/Thailand-2026/`

### Local Development / פיתוח מקומי
```bash
# Clone the repository
git clone https://github.com/nanoo26/Thailand-2026.git

# Navigate to directory
cd Thailand-2026

# Serve locally (Python 3)
python -m http.server 8000

# Or use Node.js
npx http-server

# Open browser to http://localhost:8000
```

## 🛠️ Technology Stack / טכנולוגיות

- **HTML5** - Semantic markup with RTL support
- **CSS3** - Modern styling with gradients, flexbox, and mobile-first design
- **Vanilla JavaScript** - No frameworks, pure ES6+
- **Leaflet.js 1.9.4** - Interactive maps
- **OpenStreetMap** - Map tiles (no API key needed)

## 📐 Technical Details / פרטים טכניים

### Haversine Distance Calculation
The app calculates walking distance from the hotel to each place using the Haversine formula:
```javascript
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}
```

### AI Tip Logic
The app provides smart recommendations based on:
- **Distance**: < 1.2km → walking, ≥ 1.2km → Grab
- **Time of day**: Night (before 6 AM or after 8 PM) → safety warning
- **Weather**: Hot hours (11 AM - 4 PM) → hydration reminder

### Grab Integration
```javascript
// Tries to open Grab app first
grab://open?screenType=BOOKING&pick-up={hotel}&drop-off={destination}

// Falls back to Grab website if app not installed
https://www.grab.com/th/en/
```

## 🎨 Design Features / תכונות עיצוב

- **Purple Gradient Header** - Modern and eye-catching
- **RTL Layout** - Proper right-to-left Hebrew support
- **Bottom Sheet UI** - Native mobile app feel
- **Emoji Icons** - Universal visual language (🏨 🍽️ 🏪)
- **Responsive Design** - Works on all screen sizes
- **Touch-Friendly** - Large tap targets for mobile use

## 📝 How to Add Places / כיצד להוסיף מקומות

To add a new kosher place, edit `data/places.json`:

```json
{
  "city": "bangkok",
  "name": "Your Place Name",
  "cat": "מסעדה",  // or "חנות"
  "lat": 13.7320,
  "lng": 100.5680,
  "address": "Full address here",
  "site": "https://website.com"  // optional
}
```

## 🌐 Browser Support / תמיכה בדפדפנים

- Chrome/Edge (latest)
- Safari (iOS 12+)
- Firefox (latest)
- Samsung Internet
- Any modern mobile browser

## 📱 Mobile Optimizations / אופטימיזציות מובייל

- Viewport locked to prevent zooming
- Touch-optimized buttons and controls
- Bottom sheet for comfortable thumb reach
- No page scrolling (map takes full viewport)
- Smooth animations and transitions

## 🔒 Privacy / פרטיות

- No tracking or analytics
- No user data collection
- No cookies
- All data loaded from local JSON files
- External links: Google Maps and Grab only

## 📄 License / רישיון

MIT License - See LICENSE file for details

## 🤝 Contributing / תרומה

To contribute:
1. Fork the repository
2. Add your kosher place to `data/places.json`
3. Submit a pull request
4. Include name, accurate coordinates, and verification of kosher status

## 📞 Contact / יצירת קשר

For questions or to report incorrect information, please open an issue on GitHub.

## 🙏 Credits / קרדיטים

- Map data © [OpenStreetMap](https://www.openstreetmap.org/) contributors
- Mapping library: [Leaflet.js](https://leafletjs.com/)
- Kosher information: Local Chabad Houses and community

---

**Bon Voyage! 🇹🇭 בטוח נסיעה!**

Enjoy your kosher culinary journey through Thailand 2026!