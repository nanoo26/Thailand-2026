/* English-only code as requested */

const DATA_URL = "./data/places.json";

const state = {
  data: null,
  cityKey: "phuket",
  filters: {
    restaurants: true,
    shops: true,
    stays: false
  },
  geocodeCache: new Map(), // key: address -> {lat, lon}
  markers: {
    cluster: null,
    all: [] // {item, marker}
  },
  map: null
};

function $(id){ return document.getElementById(id); }

function setCity(key){
  state.cityKey = key;
  renderTabs();
  refresh();
}

function toggleFilter(key){
  state.filters[key] = !state.filters[key];
  renderChips();
  refresh();
}

function renderTabs(){
  const el = $("cityTabs");
  el.innerHTML = "";
  const cities = state.data.cities;

  Object.keys(cities).forEach((key) => {
    const btn = document.createElement("button");
    btn.className = "seg-btn" + (key === state.cityKey ? " on" : "");
    btn.type = "button";
    btn.textContent = cities[key].label;
    btn.addEventListener("click", () => setCity(key));
    el.appendChild(btn);
  });
}

function renderChips(){
  $("filterRestaurants").className = "chip" + (state.filters.restaurants ? " chip-on" : "");
  $("filterShops").className = "chip" + (state.filters.shops ? " chip-on" : "");
  $("filterStays").className = "chip" + (state.filters.stays ? " chip-on" : "");
}

function initMap(){
  const map = L.map("map", { zoomControl: true });

  // Higher-quality tiles (no key needed)
  const tiles = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    {
      subdomains: "abcd",
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>'
    }
  );
  tiles.addTo(map);

  state.markers.cluster = L.markerClusterGroup({
    showCoverageOnHover: false,
    spiderfyOnMaxZoom: true,
    maxClusterRadius: 46
  });
  map.addLayer(state.markers.cluster);

  state.map = map;
}

function makeIcon(kind){
  const emoji = kind === "restaurant" ? "🍽️" : kind === "shop" ? "🛒" : "🏨";
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:38px;height:38px;border-radius:14px;
        background:rgba(124,92,255,.18);
        border:1px solid rgba(124,92,255,.30);
        display:flex;align-items:center;justify-content:center;
        box-shadow: 0 10px 22px rgba(0,0,0,.35);
        ">
        <div style="font-size:18px;transform:translateY(1px)">${emoji}</div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -34]
  });
}

function normalizeAddress(addr){
  return (addr || "").trim().replace(/\s+/g, " ");
}

function cacheKeyForAddress(addr){
  return "geo:" + normalizeAddress(addr).toLowerCase();
}

function loadCacheFromLocalStorage(){
  try{
    for(let i=0;i<localStorage.length;i++){
      const k = localStorage.key(i);
      if(!k || !k.startsWith("geo:")) continue;
      const raw = localStorage.getItem(k);
      if(!raw) continue;
      const val = JSON.parse(raw);
      if(val && val.lat && val.lon){
        state.geocodeCache.set(k, val);
      }
    }
  }catch(_e){}
}

function saveToLocalStorage(addr, point){
  try{
    const k = cacheKeyForAddress(addr);
    localStorage.setItem(k, JSON.stringify(point));
  }catch(_e){}
}

async function geocodeAddress(address){
  const addr = normalizeAddress(address);
  if(!addr) return null;

  const key = cacheKeyForAddress(addr);
  if(state.geocodeCache.has(key)) return state.geocodeCache.get(key);

  // Nominatim (OpenStreetMap) public endpoint
  // Throttle is handled by queue caller
  const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encodeURIComponent(addr);
  const res = await fetch(url, { method: "GET" });
  if(!res.ok) return null;

  const json = await res.json();
  if(!Array.isArray(json) || json.length === 0) return null;

  const hit = json[0];
  const point = { lat: Number(hit.lat), lon: Number(hit.lon) };
  if(!Number.isFinite(point.lat) || !Number.isFinite(point.lon)) return null;

  state.geocodeCache.set(key, point);
  saveToLocalStorage(addr, point);
  return point;
}

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

async function geocodeQueue(items){
  // Respect Nominatim rate limits: ~1 request/second.
  for(const it of items){
    if(it.lat && it.lon) continue;
    if(!it.address) continue;

    const point = await geocodeAddress(it.address);
    if(point){
      it.lat = point.lat;
      it.lon = point.lon;
    }
    await sleep(1100);
  }
}

function computeDistanceKm(a, b){
  // Haversine
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);

  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * (Math.sin(dLon / 2) ** 2);

  return 2 * R * Math.asin(Math.sqrt(s));
}

function mapsDirectionsUrl(destinationAddress, mode){
  const dest = encodeURIComponent(destinationAddress);
  const travelmode = mode === "walking" ? "walking" : "driving";
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=${travelmode}`;
}

function openGrab(){
  // Try deep link first, then fallback to website
  const deepLink = "grab://open";
  const fallback = "https://www.grab.com/";

  window.location.href = deepLink;
  setTimeout(() => {
    window.location.href = fallback;
  }, 900);
}

function showSheet(item, stayPoint){
  const sheet = $("sheet");
  const backdrop = $("backdrop");

  $("sheetTitle").textContent = item.name;
  $("sheetSub").textContent = `${item.cityLabel} - ${item.kindLabel} - ${item.kosherLabel}`;

  const siteBtn = $("btnSite");
  if(item.website){
    siteBtn.style.display = "inline-block";
    siteBtn.href = item.website;
  }else{
    siteBtn.style.display = "none";
    siteBtn.href = "#";
  }

  $("btnMapsWalk").href = mapsDirectionsUrl(item.address || item.name, "walking");
  $("btnMapsDrive").href = mapsDirectionsUrl(item.address || item.name, "driving");

  $("btnGrab").onclick = (e) => {
    e.preventDefault();
    openGrab();
  };

  // Tip: distance-based, honest label
  let tip = "Tip: Enable location in Google Maps for best directions.";
  if(stayPoint && item.lat && item.lon){
    const km = computeDistanceKm(stayPoint, { lat: item.lat, lon: item.lon });
    const walkMin = Math.max(3, Math.round((km / 5) * 60));  // 5 km/h
    const taxiMin = Math.max(4, Math.round((km / 25) * 60)); // 25 km/h
    if(km <= 1.5){
      tip = `Tip: About ${km.toFixed(1)} km from your hotel. Walking is likely easiest (${walkMin} min).`;
    }else{
      tip = `Tip: About ${km.toFixed(1)} km from your hotel. Grab/taxi is likely better (${taxiMin} min).`;
    }
  }
  $("sheetTip").textContent = tip;

  const footerParts = [];
  if(item.statusNote) footerParts.push(item.statusNote);
  if(item.sourceNote) footerParts.push(item.sourceNote);
  $("sheetFooter").textContent = footerParts.join(" | ");

  sheet.classList.add("show");
  sheet.setAttribute("aria-hidden", "false");
  backdrop.classList.add("show");
  backdrop.setAttribute("aria-hidden", "false");

  backdrop.onclick = hideSheet;
}

function hideSheet(){
  const sheet = $("sheet");
  const backdrop = $("backdrop");
  sheet.classList.remove("show");
  sheet.setAttribute("aria-hidden", "true");
  backdrop.classList.remove("show");
  backdrop.setAttribute("aria-hidden", "true");
}

function clearMarkers(){
  state.markers.cluster.clearLayers();
  state.markers.all = [];
}

function clearList(){
  $("placesList").innerHTML = "";
}

function passesFilters(item){
  if(item.kind === "restaurant" && !state.filters.restaurants) return false;
  if(item.kind === "shop" && !state.filters.shops) return false;
  if(item.kind === "stay" && !state.filters.stays) return false;
  return true;
}

function buildViewItems(){
  const city = state.data.cities[state.cityKey];
  const cityLabel = city.label;

  const all = state.data.places
    .filter(p => p.city === state.cityKey)
    .map(p => ({
      ...p,
      cityLabel,
      kindLabel: p.kind === "restaurant" ? "Restaurant" : p.kind === "shop" ? "Shop" : "Hotel",
      kosherLabel: p.kosher || "Kosher",
      statusNote: p.status ? `Status: ${p.status}` : "",
      sourceNote: p.source ? `Source: ${p.source}` : ""
    }));

  return { city, items: all };
}

function sortByKindThenName(items){
  const order = { restaurant: 0, shop: 1, stay: 2 };
  return [...items].sort((a,b) => {
    const ka = order[a.kind] ?? 9;
    const kb = order[b.kind] ?? 9;
    if(ka !== kb) return ka - kb;
    return (a.name || "").localeCompare(b.name || "");
  });
}

function addListRow(item, index, stayPoint){
  const row = document.createElement("div");
  row.className = "row";

  const badge = document.createElement("div");
  badge.className = "badge";
  badge.textContent = item.kind === "restaurant" ? "🍽️" : item.kind === "shop" ? "🛒" : "🏨";

  const main = document.createElement("div");
  main.className = "row-main";

  const title = document.createElement("div");
  title.className = "row-title";
  title.textContent = item.name;

  const sub = document.createElement("div");
  sub.className = "row-sub";
  sub.textContent = item.address || "";

  const meta = document.createElement("div");
  meta.className = "row-meta";
  meta.textContent = item.kosher || "";

  main.appendChild(title);
  main.appendChild(sub);
  main.appendChild(meta);

  row.appendChild(badge);
  row.appendChild(main);

  row.addEventListener("click", () => {
    if(item.lat && item.lon){
      state.map.setView([item.lat, item.lon], Math.max(state.map.getZoom(), 15), { animate: true });
    }
    showSheet(item, stayPoint);
  });

  $("placesList").appendChild(row);
}

async function refresh(){
  const { city, items } = buildViewItems();

  $("panelTitle").textContent = city.label;
  $("panelMeta").textContent = "Loading addresses...";

  clearMarkers();
  clearList();
  hideSheet();

  // Include stay point for distance tips
  const stay = items.find(x => x.kind === "stay") || null;

  // Geocode only items that will be visible OR stay (for distance)
  const needed = items.filter(p => passesFilters(p) || (stay && p === stay));
  await geocodeQueue(needed);

  // Center map
  let center = city.center;
  if(!center){
    // fallback to stay point if we have it
    if(stay && stay.lat && stay.lon){
      center = { lat: stay.lat, lon: stay.lon, zoom: city.zoom || 13 };
    }else{
      center = { lat: 13.7563, lon: 100.5018, zoom: 12 }; // Bangkok fallback
    }
  }

  state.map.setView([center.lat, center.lon], center.zoom || 13, { animate: false });

  // Render markers and list
  const visible = sortByKindThenName(items.filter(passesFilters));

  let stayPoint = null;
  if(stay && stay.lat && stay.lon){
    stayPoint = { lat: stay.lat, lon: stay.lon };
  }

  visible.forEach((item, idx) => {
    addListRow(item, idx, stayPoint);

    if(item.lat && item.lon){
      const marker = L.marker([item.lat, item.lon], { icon: makeIcon(item.kind) });
      marker.on("click", () => showSheet(item, stayPoint));
      state.markers.cluster.addLayer(marker);
      state.markers.all.push({ item, marker });
    }
  });

  $("panelMeta").textContent = `${visible.length} places`;
}

async function loadData(){
  const res = await fetch(DATA_URL, { cache: "no-store" });
  if(!res.ok) throw new Error("Failed to load data");
  const json = await res.json();
  state.data = json;

  // Default city
  if(json.defaultCity) state.cityKey = json.defaultCity;

  renderTabs();
  renderChips();
  await refresh();
}

function bindUI(){
  $("filterRestaurants").addEventListener("click", () => toggleFilter("restaurants"));
  $("filterShops").addEventListener("click", () => toggleFilter("shops"));
  $("filterStays").addEventListener("click", () => toggleFilter("stays"));
}

(async function main(){
  loadCacheFromLocalStorage();
  initMap();
  bindUI();
  await loadData();
})();
