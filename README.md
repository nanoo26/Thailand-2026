# Thailand 2026 - Kosher Map (Mobile)

A mobile-first interactive map for Phuket, Koh Samui, and Bangkok.
Shows kosher restaurants and shops (plus optional hotels as reference).

## How to use (GitHub Pages)
1. Repo Settings -> Pages
2. Source: Deploy from a branch
3. Branch: main, Folder: / (root)
4. Save, wait for the Pages URL

## Notes
- The app geocodes addresses using Nominatim (OpenStreetMap). It throttles to ~1 request/second.
- First load may take a bit, then it caches results in localStorage.
- "Status: claimed" means the business claims kosher on its own pages. Verify locally if you need strict confirmation.
