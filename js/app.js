"use strict";

const DATA_URL = "data/places.json";

const state = {
  data: null,
  cityKey: "phuket",
  filter: "all", // all | restaurant | shop
  map: null,
  markers: []
};

function el(id){ return document.getElementById(id); }

function showDebug(msg){
  const d = el("debug");
  d.hidden = false;
  d.textContent = "DEBUG: " + msg;
}

function hideDebug(){
  const d = el("debug");
  d.hidden = true;
  d.textContent = "";
}

function mapsPlaceUrl(lat, lng, name){
  if(Number.isFinite(lat) && Number.isFinite(lng)){
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat + "," + lng)}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name || "")}`;
}

function mapsDirectionsUrl(originLat, originLng, destLat, destLng){
  const o = `${originLat},${originLng}`;
  const d = `${destLat},${destLng}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(o)}&destination=${encodeURIComponent(d)}&travelmode=driving`;
}

function haversineKm(aLat, aLng, bLat, bLng){
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const q = s1 * s1 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * s2 * s2;
  return 2 * R * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q));
}

function tryOpenGrab(){
  const deepLink = "grab://open";
  const fallback = "https://www.grab.com/";
  window.location.href = deepLink;
  setTimeout(() => { window.location.href = fallback; }, 900);
}

function closeSheet(){
  el("sheet").classList.remove("open");
  el("sheet").setAttribute("aria-hidden", "true");
  el("backdrop").hidden = true;
}

function openSheet(item){
  const city = state.data.cities.find(c => c.cityKey === state.cityKey);
  if(!city) return;

  el("sheetTitle").textContent = item.name || "Place";
  el("sheetSub").textContent = `${city.labelHe} | ${item.kind} | ${item.kosher || ""}${item.address ? " | " + item.address : ""}`;

  const placeUrl = mapsPlaceUrl(item.lat, item.lng, item.name);
  el("btnPlace").href = placeUrl;

  const dirUrl = mapsDirectionsUrl(city.hotelLat, city.hotelLng, item.lat, item.lng);
  el("btnDirections").href = dirUrl;

  const w = el("btnWebsite");
  if(item.website){
    w.style.display = "flex";
    w.href = item.website;
  }else{
    w.style.display = "none";
    w.href = "#";
  }

  const km = haversineKm(city.hotelLat, city.hotelLng, item.lat, item.lng);
  const preferWalk = km < 1.2;

  el("aiTip").textContent = preferWalk
    ? `המלצת AI: ללכת ברגל. מרחק משוער ${km.toFixed(2)} ק"מ מהמלון.`
    : `המלצת AI: מונית/Grab. מרחק משוער ${km.toFixed(2)} ק"מ מהמלון.`;

  const grabBtn = el("btnGrab");
  grabBtn.style.display = preferWalk ? "none" : "flex";
  grabBtn.onclick = (e) => { e.preventDefault(); tryOpenGrab(); };

  el("foot").textContent = item.status ? `Status: ${item.status}` : "";

  el("backdrop").hidden = false;
  el("sheet").classList.add("open");
  el("sheet").setAttribute("aria-hidden", "false");
}

function clearMarkers(){
  state.markers.forEach(m => state.map.removeLayer(m));
  state.markers = [];
}

function renderTabs(){
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

function setChip(activeId){
  ["chipAll","chipRestaurants","chipShops"].forEach(id => el(id).classList.remove("on"));
  el(activeId).classList.add("on");
}

function bindFilters(){
  el("chipAll").onclick = () => { state.filter = "all"; setChip("chipAll"); render(); };
  el("chipRestaurants").onclick = () => { state.filter = "restaurant"; setChip("chipRestaurants"); render(); };
  el("chipShops").onclick = () => { state.filter = "shop"; setChip("chipShops"); render(); };
}

function render(){
  closeSheet();
  clearMarkers();

  const city = state.data.cities.find(c => c.cityKey === state.cityKey);
  if(!city){
    showDebug("City not found in data");
    return;
  }

  state.map.setView([city.hotelLat, city.hotelLng], city.zoom || 13);

  const items = state.data.places
    .filter(p => p.cityKey === state.cityKey)
    .filter(p => state.filter === "all" ? true : p.kind === state.filter);

  items.forEach(item => {
    if(!Number.isFinite(item.lat) || !Number.isFinite(item.lng)) return;
    const m = L.marker([item.lat, item.lng]).addTo(state.map);
    m.on("click", () => openSheet(item));
    state.markers.push(m);
  });
}

async function loadData(){
  const res = await fetch(DATA_URL, { cache: "no-store" });
  if(!res.ok) throw new Error(`Failed to load ${DATA_URL} (${res.status})`);
  return res.json();
}

async function init(){
  try{
    state.map = L.map("map", { zoomControl: true, tap: true });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 19,
      attribution: "© OpenStreetMap, © CARTO"
    }).addTo(state.map);

    el("backdrop").hidden = true;
    el("backdrop").onclick = closeSheet;
    el("btnClose").onclick = closeSheet;

    bindFilters();

    state.data = await loadData();
    hideDebug();
    renderTabs();
    render();
  }catch(e){
    showDebug(e && e.message ? e.message : String(e));
  }
}

document.addEventListener("DOMContentLoaded", init);  aiTip: null,
  btnGrab: null
};

function $(id){ return document.getElementById(id); }

function showStatus(msg){
  els.status.textContent = msg;
  els.status.style.display = "block";
  clearTimeout(showStatus._t);
  showStatus._t = setTimeout(() => { els.status.style.display = "none"; }, 2400);
}

function haversineKm(a, b){
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const q = s1 * s1 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * s2 * s2;
  const c = 2 * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q));
  return R * c;
}

function isNightNow(){
  const h = new Date().getHours();
  return (h >= 20 || h < 6);
}

function normalize(str){
  return (str || "").toString().trim().toLowerCase();
}

function categoryLabel(cat){
  if(cat === "restaurant") return "מסעדה";
  if(cat === "shop") return "חנות";
  return "מקום";
}

function buildGoogleMapsPlaceUrl(place){
  // Prefer coordinates for accuracy
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.lat + "," + place.lng)}`;
}

function buildGoogleMapsDirectionsUrl(origin, dest){
  const o = `${origin.lat},${origin.lng}`;
  const d = `${dest.lat},${dest.lng}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(o)}&destination=${encodeURIComponent(d)}&travelmode=driving`;
}

function tryOpenGrab(){
  // Best-effort: app open attempt, then fallback to Play Store
  const fallback = "https://play.google.com/store/apps/details?id=com.grabtaxi.passenger";

  // This intent may or may not be handled depending on device/app.
  // We keep it simple and honest: open app shell only.
  const intentUrl = "intent://#Intent;package=com.grabtaxi.passenger;end";

  window.location.href = intentUrl;
  setTimeout(() => { window.location.href = fallback; }, 900);
}

function setActiveCity(cityKey){
  STATE.activeCityKey = cityKey;
  activeCity = STATE.cities.find(c => c.cityKey === cityKey) || STATE.cities[0];

  els.cityButtons.forEach(btn => {
    const selected = btn.dataset.city === cityKey;
    btn.setAttribute("aria-selected", selected ? "true" : "false");
  });

  if(activeCity){
    map.setView([activeCity.hotelLat, activeCity.hotelLng], activeCity.defaultZoom || 13);
  }

  renderCityHotelMarker();
  renderMarkers();
}

function renderCityHotelMarker(){
  cityMarkerGroup.clearLayers();
  if(!activeCity) return;

  const icon = L.divIcon({
    className: "hotel-pin",
    html: `<div style="background:rgba(34,197,94,.18);border:1px solid rgba(34,197,94,.35);padding:8px 10px;border-radius:999px;font-weight:800">מלון</div>`
  });

  L.marker([activeCity.hotelLat, activeCity.hotelLng], { icon })
    .addTo(cityMarkerGroup)
    .bindPopup(`<b>${escapeHtml(activeCity.hotelName)}</b><br>${escapeHtml(activeCity.hotelAddress || "")}`);
}

function escapeHtml(s){
  return (s || "").replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
  }[c]));
}

function filterPlaces(){
  const cityKey = STATE.activeCityKey;
  const cat = STATE.category;
  const q = normalize(STATE.search);

  return STATE.places
    .filter(p => p.cityKey === cityKey)
    .filter(p => (cat === "all" ? true : p.category === cat))
    .filter(p => {
      if(!q) return true;
      const hay = normalize(`${p.nameHe || ""} ${p.nameEn || ""}`);
      return hay.includes(q);
    });
}

function renderMarkers(){
  markersLayer.clearLayers();

  const list = filterPlaces();
  if(list.length === 0){
    showStatus("אין עדיין מקומות להצגה. עדכן data/places.json עם מקומות כשרים.");
    return;
  }

  list.forEach(place => {
    if(typeof place.lat !== "number" || typeof place.lng !== "number") return;

    const marker = L.marker([place.lat, place.lng]);
    marker.on("click", () => openSheet(place));
    marker.addTo(markersLayer);
  });

  showStatus(`${list.length} מקומות מוצגים`);
}

function getAiRecommendation(place){
  const origin = { lat: activeCity.hotelLat, lng: activeCity.hotelLng };
  const dest = { lat: place.lat, lng: place.lng };
  const km = haversineKm(origin, dest);

  const night = isNightNow();
  const hot = STATE.hot;

  let mode = (km < 1.2) ? "walk" : "grab";
  if(night && km > 0.6) mode = "grab";
  if(hot && km > 0.8) mode = "grab";

  const reasons = [];
  reasons.push(`מרחק משוער: ${km.toFixed(2)} ק"מ מהמלון`);
  if(night) reasons.push("שעה מאוחרת, עדיף מונית");
  if(hot) reasons.push("חם מאוד, עדיף מונית");

  const title = (mode === "walk") ? "המלצת AI: ללכת ברגל" : "המלצת AI: להזמין Grab";
  const note = (mode === "walk")
    ? "אם אין לך ציוד כבד, זו הליכה סבירה. עדיין אפשר לפתוח ניווט בגוגל מפות."
    : "פתח ניווט בגוגל מפות ואז הזנק Grab כדי להגיע בנוחות.";

  return { mode, title, reasons, note };
}

function openSheet(place){
  const rec = getAiRecommendation(place);

  els.sheetTitle.textContent = place.nameHe || place.nameEn || "מקום";
  els.sheetCategory.textContent = categoryLabel(place.category);
  els.sheetKosher.textContent = place.kosher || "כשרות: לא צוין";
  els.sheetAddress.textContent = place.address || "";
  els.sheetNotes.textContent = place.notes || "";

  const mapsUrl = buildGoogleMapsPlaceUrl(place);
  const dirUrl = buildGoogleMapsDirectionsUrl(
    { lat: activeCity.hotelLat, lng: activeCity.hotelLng },
    { lat: place.lat, lng: place.lng }
  );

  els.btnMaps.href = mapsUrl;
  els.btnDirections.href = dirUrl;

  if(place.website){
    els.btnWebsite.href = place.website;
    els.btnWebsite.style.display = "flex";
  } else {
    els.btnWebsite.href = "#";
    els.btnWebsite.style.display = "none";
  }

  els.aiTip.innerHTML = `
    <div style="font-weight:900;margin-bottom:6px">${escapeHtml(rec.title)}</div>
    <div style="color:rgba(238,242,255,.9);margin-bottom:8px">${escapeHtml(rec.note)}</div>
    <ul style="margin:0;padding:0 18px;color:rgba(238,242,255,.85);line-height:1.35">
      ${rec.reasons.map(r => `<li>${escapeHtml(r)}</li>`).join("")}
    </ul>
  `;

  els.btnGrab.style.display = (rec.mode === "grab") ? "flex" : "none";

  els.backdrop.hidden = false;
  els.sheet.classList.add("open");
  els.sheet.setAttribute("aria-hidden", "false");
}

function closeSheet(){
  els.sheet.classList.remove("open");
  els.sheet.setAttribute("aria-hidden", "true");
  els.backdrop.hidden = true;
}

async function loadJson(path){
  const res = await fetch(path, { cache: "no-store" });
  if(!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

async function init(){
  els.status = $("status");
  els.filter = $("categoryFilter");
  els.search = $("searchInput");
  els.hot = $("hotToggle");
  els.btnLocate = $("btnLocate");

  els.sheet = $("sheet");
  els.backdrop = $("backdrop");
  els.sheetClose = $("sheetClose");
  els.sheetTitle = $("sheetTitle");
  els.sheetCategory = $("sheetCategory");
  els.sheetKosher = $("sheetKosher");
  els.sheetAddress = $("sheetAddress");
  els.sheetNotes = $("sheetNotes");
  els.btnWebsite = $("btnWebsite");
  els.btnMaps = $("btnMaps");
  els.btnDirections = $("btnDirections");
  els.aiTip = $("aiTip");
  els.btnGrab = $("btnGrab");

  els.cityButtons = Array.from(document.querySelectorAll(".seg-btn"));

  map = L.map("map", { zoomControl: true, attributionControl: true });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
  cityMarkerGroup = L.layerGroup().addTo(map);

  try{
    STATE.cities = await loadJson("data/cities.json");
    STATE.places = await loadJson("data/places.json");
  }catch(e){
    showStatus("שגיאה בטעינת קבצי data. בדוק שהם קיימים.");
    return;
  }

  setActiveCity(STATE.activeCityKey);

  els.cityButtons.forEach(btn => {
    btn.addEventListener("click", () => setActiveCity(btn.dataset.city));
  });

  els.filter.addEventListener("change", () => {
    STATE.category = els.filter.value;
    renderMarkers();
  });

  els.search.addEventListener("input", () => {
    STATE.search = els.search.value || "";
    renderMarkers();
  });

  els.hot.addEventListener("change", () => {
    STATE.hot = !!els.hot.checked;
  });

  els.sheetClose.addEventListener("click", closeSheet);
  els.backdrop.addEventListener("click", closeSheet);

  els.btnGrab.addEventListener("click", (e) => {
    e.preventDefault();
    tryOpenGrab();
  });

  els.btnLocate.addEventListener("click", () => {
    if(!navigator.geolocation){
      showStatus("המכשיר לא תומך מיקום.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        STATE.userLatLng = { lat, lng };
        map.setView([lat, lng], 16);
        showStatus("מוקם לפי המיקום הנוכחי");
      },
      () => showStatus("לא הצלחתי לקבל מיקום. בדוק הרשאות."),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}

document.addEventListener("DOMContentLoaded", init);
