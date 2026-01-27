"use strict";

/* English-only code */
const APP_VERSION = "v14-zindex-fix";
const DATA_URL = "data/places.json";

const state = {
  data: null,
  cityKey: "phuket",
  filter: "all", // all | restaurant | shop
  map: null,
  markers: []
};

function el(id) { return document.getElementById(id); }

function showDebug(msg) {
  const d = el("debug");
  d.hidden = false;
  d.textContent = "DEBUG: " + msg;
}

function hideDebug() {
  const d = el("debug");
  d.hidden = true;
  d.textContent = "";
}

function setMainTopFromHeader() {
  const header = el("topbar");
  const main = el("main");
  if (!header || !main) return;
  const h = Math.ceil(header.getBoundingClientRect().height);
  main.style.top = h + "px";
}

function mapsPlaceUrl(lat, lng, name) {
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat + "," + lng)}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name || "")}`;
}

function mapsDirectionsUrl(originLat, originLng, destLat, destLng) {
  const o = `${originLat},${originLng}`;
  const d = `${destLat},${destLng}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(o)}&destination=${encodeURIComponent(d)}&travelmode=driving`;
}

function haversineKm(aLat, aLng, bLat, bLng) {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const q = s1 * s1 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * s2 * s2;
  return 2 * R * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q));
}

function tryOpenGrab() {
  const deepLink = "grab://open";
  const fallback = "https://www.grab.com/";
  window.location.href = deepLink;
  setTimeout(() => { window.location.href = fallback; }, 900);
}

function closeSheet() {
  el("sheet").classList.remove("open");
  el("sheet").setAttribute("aria-hidden", "true");
  el("backdrop").hidden = true;
}

function getSmartAITip(km, city) {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0=Sun, 5=Fri, 6=Sat
  
  const isNight = (hour >= 20 || hour < 6);
  const isHot = (hour >= 11 && hour <= 16);
  const isRushHour = (hour >= 7 && hour < 9) || (hour >= 17 && hour < 19);
  const isShabbat = (day === 5 && hour >= 15) || (day === 6 && hour < 20);
  
  const walkMinutes = Math.round(km * 12); // ~12 min per km
  const driveMinutes = Math.round(km * 3); // ~3 min per km in traffic
  
  let tip = `📍 Distance: ~${km.toFixed(2)} km from hotel\n\n`;
  
  if (km < 0.8) {
    tip += `🚶 **Walk recommended** (${walkMinutes} min)\n`;
  } else if (km < 1.5) {
    tip += `🚶/🚗 **Walk or Grab** (${walkMinutes} min walk / ${driveMinutes} min drive)\n`;
  } else {
    tip += `🚗 **Grab/Taxi recommended** (~${driveMinutes} min, ${isRushHour ? '+10 min in traffic' : ''})\n`;
  }
  
  // Price estimates (Thai Baht)
  if (km >= 1.0) {
    const minPrice = Math.round(km * 40);
    const maxPrice = Math.round(km * 60);
    tip += `💰 Est. fare: ${minPrice}-${maxPrice} ฿\n`;
  }
  
  // Contextual warnings/tips
  if (isNight) {
    tip += `\n🌙 **Night time** - Consider Grab for safety`;
  }
  
  if (isHot) {
    tip += `\n☀️ **Very hot now** (${hour}:00) - Bring water! AC transport recommended`;
  }
  
  if (isRushHour) {
    tip += `\n🚗 **Rush hour** - Traffic may add 10-15 minutes`;
  }
  
  if (isShabbat) {
    tip += `\n🕯️ **Shabbat** - Plan ahead, limited transport options`;
  }
  
  return tip;
}

function openSheet(item) {
  const city = state.data.cities.find(c => c.cityKey === state.cityKey);
  if (!city) return;

  el("sheetTitle").textContent = item.name || "Place";
  el("sheetSub").textContent =
    `${city.labelHe} | ${item.kind}${item.kosher ? " | " + item.kosher : ""}${item.address ? " | " + item.address : ""}`;

  el("btnPlace").href = mapsPlaceUrl(item.lat, item.lng, item.name);
  el("btnDirections").href = mapsDirectionsUrl(city.hotelLat, city.hotelLng, item.lat, item.lng);

  const w = el("btnWebsite");
  if (item.website) {
    w.style.display = "flex";
    w.href = item.website;
  } else {
    w.style.display = "none";
    w.href = "#";
  }

  const km = haversineKm(city.hotelLat, city.hotelLng, item.lat, item.lng);
  
  // Enhanced AI logic
  const hour = new Date().getHours();
  const isNight = hour >= 20 || hour < 6;
  const isHot = hour >= 11 && hour <= 16; // midday heat
  const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
  
  let tipText = "";
  let mode = "walk"; // walk, grab, taxi
  
  if (km < 0.8) {
    // Very close
    if (isNight) {
      mode = "caution";
      tipText = `Distance: ${km.toFixed(2)} km (10 mins walk). 🌙 It's night - consider safety. Well-lit streets recommended or Grab if unsure.`;
    } else if (isHot) {
      tipText = `Distance: ${km.toFixed(2)} km (10 mins walk). ☀️ Midday heat - bring water! Shaded route if possible.`;
    } else {
      tipText = `Distance: ${km.toFixed(2)} km (~10 mins walk). 🚶 Perfect walking distance! Enjoy the scenery.`;
    }
  } else if (km < 1.5) {
    // Walkable but...
    if (isNight) {
      mode = "grab";
      tipText = `Distance: ${km.toFixed(2)} km (18 mins walk). 🌙 Night time - Grab recommended for safety (~50-80 THB, 5 mins).`;
    } else if (isHot) {
      mode = "grab";
      tipText = `Distance: ${km.toFixed(2)} km (18 mins walk). 🌡️ Very hot now! Consider Grab to avoid heatstroke (~50-80 THB).`;
    } else {
      tipText = `Distance: ${km.toFixed(2)} km (15-20 mins walk). 🚶‍♂️ Walkable, but Grab is cheap (~50-70 THB, 5 mins).`;
    }
  } else if (km < 4) {
    // Medium distance
    mode = "grab";
    if (isRushHour) {
      tipText = `Distance: ${km.toFixed(2)} km. 🚗 Grab recommended (~80-150 THB). ⚠️ Rush hour - expect 15-25 mins with traffic.`;
    } else {
      tipText = `Distance: ${km.toFixed(2)} km. 🚗 Grab recommended (~80-150 THB, 10-15 mins).`;
    }
  } else {
    // Far
    mode = "taxi";
    if (isRushHour) {
      tipText = `Distance: ${km.toFixed(2)} km. 🚖 Taxi/Grab required (~150-250 THB). ⚠️ Rush hour - allow 30-45 mins.`;
    } else {
      tipText = `Distance: ${km.toFixed(2)} km. 🚖 Taxi/Grab required (~150-250 THB, 20-30 mins).`;
    }
  }
  
  // Add context-specific tips
  if (item.notes) {
    tipText += `\n\n📌 Note: ${item.notes}`;
  }
  
  // Add Shabbat/Holiday tip if relevant
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 5 && hour >= 14) { // Friday afternoon
    tipText += `\n\n🕯️ Shabbat approaching - confirm restaurant hours!`;
  }
  
  el("aiTip").textContent = tipText;

  const grabBtn = el("btnGrab");
  grabBtn.style.display = (mode === "grab" || mode === "taxi") ? "flex" : "none";
  grabBtn.onclick = (e) => { e.preventDefault(); tryOpenGrab(); };

  el("foot").textContent = item.status ? `Status: ${item.status}` : "";

  el("backdrop").hidden = false;
  el("sheet").classList.add("open");
  el("sheet").setAttribute("aria-hidden", "false");
}

function clearMarkers() {
  state.markers.forEach(m => state.map.removeLayer(m));
  state.markers = [];
}

function renderTabs() {
  const wrap = el("cityTabs");
  wrap.innerHTML = "";
  state.data.cities.forEach(c => {
    const b = document.createElement("button");
    b.className = "tab" + (c.cityKey === state.cityKey ? " on" : "");
    b.type = "button";
    b.textContent = c.labelHe;
    b.onclick = () => {
      state.cityKey = c.cityKey;
      renderTabs();
      render();
    };
    wrap.appendChild(b);
  });
}

function setChip(activeId) {
  ["chipAll", "chipRestaurants", "chipShops"].forEach(id => el(id).classList.remove("on"));
  el(activeId).classList.add("on");
}

function bindFilters() {
  el("chipAll").onclick = () => { state.filter = "all"; setChip("chipAll"); render(); };
  el("chipRestaurants").onclick = () => { state.filter = "restaurant"; setChip("chipRestaurants"); render(); };
  el("chipShops").onclick = () => { state.filter = "shop"; setChip("chipShops"); render(); };
}

function render() {
  closeSheet();
  clearMarkers();

  const city = state.data.cities.find(c => c.cityKey === state.cityKey);
  if (!city) {
    showDebug("City not found in data/places.json");
    return;
  }

  state.map.setView([city.hotelLat, city.hotelLng], city.zoom || 13);

  const items = state.data.places
    .filter(p => p.cityKey === state.cityKey)
    .filter(p => state.filter === "all" ? true : p.kind === state.filter);

  items.forEach(item => {
    if (!Number.isFinite(item.lat) || !Number.isFinite(item.lng)) return;
    const m = L.marker([item.lat, item.lng]).addTo(state.map);
    m.on("click", () => openSheet(item));
    state.markers.push(m);
  });

  setTimeout(() => state.map.invalidateSize(true), 80);
}

async function loadData() {
  const res = await fetch(DATA_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${DATA_URL} (${res.status})`);
  return res.json();
}

async function init() {
  try {
    state.map = L.map("map", { zoomControl: true, tap: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(state.map);

    el("backdrop").hidden = true;
    el("backdrop").onclick = closeSheet;
    el("btnClose").onclick = closeSheet;
    
    bindFilters();
    
    setMainTopFromHeader();
    window.addEventListener("resize", setMainTopFromHeader);

    state.data = await loadData();
    hideDebug();
    renderTabs();
    render();
    
    el("ver").textContent = APP_VERSION;
    el("verBadge").textContent = APP_VERSION;
  } catch (e) {
    showDebug(e && e.message ? e.message : String(e));
  }
}

document.addEventListener("DOMContentLoaded", init);
