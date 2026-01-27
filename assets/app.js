"use strict";

/* English-only code */
const APP_VERSION = "v11-clean";
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
  const preferWalk = km < 1.2;

  el("aiTip").textContent = preferWalk
    ? `Tip: ~${km.toFixed(2)} km from hotel. Walking likely easiest.`
    : `Tip: ~${km.toFixed(2)} km from hotel. Grab/taxi likely better.`;

  const grabBtn = el("btnGrab");
  grabBtn.style.display = preferWalk ? "none" : "flex";
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
  if
