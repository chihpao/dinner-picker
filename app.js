// ---- 可調參數 ----
const GLOBAL_MAX_DIST_KM = 1.2; // 距離條滿格代表的公里數（相同距離→相同條長）

// ---- 小工具 ----
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchJSON(path){
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetch ${path} failed: ${res.status}`);
  return res.json();
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return 2*R*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// 更強韌的複製（支援舊瀏覽器/iOS）
async function copyText(text){
  try {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch(e){ /* fallthrough */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly','');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    const sel = document.getSelection();
    const prev = sel && sel.rangeCount ? sel.getRangeAt(0) : null;
    ta.select(); ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    if (prev){ sel.removeAllRanges(); sel.addRange(prev); }
    if (ok) return true;
  } catch(e){ /* fallthrough */ }
  window.prompt('複製下列連結：', text);
  return false;
}

// ---- App ----
document.addEventListener('DOMContentLoaded', () => {
  const appState = {
    restaurants: [],
    profile: null,
    userLocation: null,
    isLoading: true,
    theme: 'light',
  };

  const DOM = {
    body: document.body,
    toolbar: $('#toolbar'),
    list: $('#restaurant-list'),
    loader: $('#loader'),
    themeToggle: $('#themeToggle'),
  };

  // Theme
  function setTheme(mode){
    appState.theme = mode;
    DOM.body.setAttribute('data-theme', mode);
    DOM.themeToggle.textContent = mode === 'dark' ? '🌙' : '🌞';
    localStorage.setItem('theme', mode);
  }
  DOM.themeToggle.addEventListener('click', () => {
    setTheme(appState.theme === 'light' ? 'dark' : 'light');
  });

  // Toolbar
  function renderToolbar() {
    const hasLocation = !!appState.userLocation;
    DOM.toolbar.innerHTML = hasLocation ? '' : `<button id="btnLoc" class="btn danger">📍 允許目前位置</button>`;
    if (!hasLocation) {
      $('#btnLoc').addEventListener('click', requestLocation);
    }
  }

  // 距離計算 + 排序
  function processRestaurants() {
    const withDistance = appState.restaurants.map(r => {
      const distances = {};
      if (appState.userLocation) {
        distances.current = haversine(appState.userLocation.lat, appState.userLocation.lng, r.lat, r.lng);
      }
      if (appState.profile?.home) {
        distances.home = haversine(appState.profile.home.lat, appState.profile.home.lng, r.lat, r.lng);
      }
      if (appState.profile?.work) {
        distances.work = haversine(appState.profile.work.lat, appState.profile.work.lng, r.lat, r.lng);
      }
      return { ...r, distances };
    });

    const sortKey = appState.userLocation ? 'current' : (appState.profile?.home ? 'home' : 'work');
    withDistance.sort((a,b) => {
      const da = a.distances?.[sortKey] ?? Infinity;
      const db = b.distances?.[sortKey] ?? Infinity;
      return da - db;
    });

    return withDistance;
  }

  // 距離條（統一比例 + 遠距離自動變淡）
  function createDistanceBars(distances) {
    const rows = [
      { key: 'current', label: '目前', icon: '📍', dist: distances.current },
      { key: 'home',    label: '住家', icon: '🏠', dist: distances.home },
      { key: 'work',    label: '公司', icon: '🏢', dist: distances.work },
    ].filter(r => Number.isFinite(r.dist));

    if (rows.length === 0) return '<div class="distance-panel is-empty"></div>';

    const max = GLOBAL_MAX_DIST_KM;
    const html = rows.map(r => {
      const ratio = r.dist / max;
      const clamp = Math.min(1, ratio);
      const pct = Math.max(6, clamp * 100);
      const isFar = ratio > 1;
      return `
        <div class="dist-row">
          <div class="dist-meta">
            <span class="dist-icon" aria-hidden="true">${r.icon}</span>
            <span class="dist-label">${r.label}</span>
          </div>
          <div class="dist-bar" role="img" aria-label="${r.label} 距離 ${r.dist.toFixed(1)} 公里">
            <div class="dist-fill ${isFar ? 'far' : ''}" style="width:${pct}%; --ratio:${clamp.toFixed(3)};"></div>
          </div>
          <div class="dist-km">${r.dist.toFixed(1)} km</div>
        </div>
      `;
    }).join('');

    return `<div class="distance-panel">${html}</div>`;
  }

  function createRestaurantCard(r) {
    const { id, name, orderUrl, distances = {} } = r;
    const avatarText = name?.trim()?.slice(0, 1) || '?';
    return `
      <div class="card">
        <div class="card-title">
          <div class="avatar">${avatarText}</div>
          <span>${name}</span>
        </div>
        ${createDistanceBars(distances)}
        <div class="card-actions">
          <a href="${orderUrl}" target="_blank" class="btn primary" rel="noopener">前往訂購</a>
          <button class="btn copy-link-btn" data-id="${id}">複製連結</button>
        </div>
      </div>
    `;
  }

  function render() {
    if (appState.isLoading) {
      appState.isLoading = false;
      DOM.loader.style.display = 'none';
    }
    renderToolbar();
    const processed = processRestaurants();
    DOM.list.innerHTML = processed.map(createRestaurantCard).join('');
    bindCardEvents();
  }

  // 複製深連結（最穩組法：取「目錄 URL」再加查詢）
  function bindCardEvents() {
    $$('.copy-link-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const shopId = e.currentTarget?.dataset?.id;
        if (!shopId) return;

        const baseDir = new URL('.', window.location.href).toString(); // 取得目錄 URL（處理 /username/repo/）
        const url = `${baseDir}?shop=${encodeURIComponent(shopId)}&autorun=1`;

        const ok = await copyText(url);
        e.currentTarget.textContent = ok ? '已複製!' : '已顯示連結';
        await sleep(1500);
        e.currentTarget.textContent = '複製連結';
      });
    });
  }

  // 定位
  function requestLocation() {
    if (!navigator.geolocation) return alert("您的瀏覽器不支援定位功能。");
    const btn = $('#btnLoc');
    btn.textContent = '定位中...'; btn.disabled = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => { appState.userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude }; render(); },
      () => { alert("定位失敗，請檢查您的定位權限設定。"); render(); },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  // 初始化：載入 JSON +（若帶 autorun）做 Deep Link
  (async function init(){
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);

    // 先並行請求資料與定位
    const params = new URLSearchParams(location.search);
    const deepShop = params.get('shop');
    const deepAuto = params.get('autorun') === '1';

    try {
      const [restaurants, profile, userLoc] = await Promise.all([
        fetchJSON('./restaurants.json'),
        fetchJSON('./profile.json'),
        new Promise(resolve => {
          if (!navigator.geolocation) return resolve(null);
          navigator.geolocation.getCurrentPosition(
            pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            ()  => resolve(null),
            { enableHighAccuracy: true, timeout: 8000 }
          );
        })
      ]);
      appState.restaurants = Array.isArray(restaurants) ? restaurants : [];
      appState.profile = profile || null;
      appState.userLocation = userLoc;

      // Deep Link（資料已就緒才處理）
      if (deepShop && deepAuto) {
        const r = appState.restaurants.find(x => x.id === deepShop);
        if (r?.orderUrl) return location.replace(r.orderUrl);
      }
    } catch (err) {
      console.error(err);
      DOM.loader.innerHTML = `<p style="color:#a00">資料載入失敗，請重新整理</p>`;
      return;
    }

    render();
  })();
});
