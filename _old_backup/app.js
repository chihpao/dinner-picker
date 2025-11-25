// ---- 可調參數 ----
const GLOBAL_MAX_DIST_KM = 1.2; // 距離條滿格代表的公里數（相同距離→相同條長）

// ---- 小工具 ----
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchJSON(path) {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetch ${path} failed: ${res.status}`);
  return res.json();
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 更強韌的複製（支援舊瀏覽器/iOS）
async function copyText(text) {
  try {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) { /* fallthrough */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    const sel = document.getSelection();
    const prev = sel && sel.rangeCount ? sel.getRangeAt(0) : null;
    ta.select(); ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    if (prev) { sel.removeAllRanges(); sel.addRange(prev); }
    if (ok) return true;
  } catch (e) { /* fallthrough */ }
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
  };

  const DOM = {
    body: document.body,
    toolbar: $('#toolbar'),
    list: $('#restaurant-list'),
    loader: $('#loader'),
  };

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
    withDistance.sort((a, b) => {
      const da = a.distances?.[sortKey] ?? Infinity;
      const db = b.distances?.[sortKey] ?? Infinity;
      return da - db;
    });

    return withDistance;
  }

  // 距離摘要（突出最短，其餘精簡顯示）
  function createDistanceSummary(distances) {
    const rows = [
      { key: 'current', label: '目前', icon: '📍', dist: distances.current },
      { key: 'home', label: '住家', icon: '🏠', dist: distances.home },
      { key: 'work', label: '公司', icon: '🏢', dist: distances.work },
    ].filter(r => Number.isFinite(r.dist));

    if (rows.length === 0) return '<div class="distance-summary is-empty"></div>';

    const ranked = rows.slice().sort((a, b) => a.dist - b.dist);
    const tierFor = (idx) => idx === 0 ? 'near' : idx === 1 ? 'mid' : 'far';

    const primary = ranked[0];
    const secondaries = ranked.slice(1);

    const primaryHtml = `
      <div class="dist-primary tier-${tierFor(0)}">
        <span class="dist-icon" aria-hidden="true">${primary.icon}</span>
        <span class="dist-label">${primary.label}</span>
        <span class="dist-km">${primary.dist.toFixed(1)} km</span>
      </div>
    `;

    const secondaryHtml = secondaries.length ? `
      <div class="dist-secondary">
        ${secondaries.map((r, idx) => {
      const tier = tierFor(idx + 1);
      return `${idx ? ' • ' : ''}${r.icon} <span class="dist-km tier-${tier}">${r.dist.toFixed(1)} km</span>`;
    }).join('')}
      </div>
    ` : '';

    return `<div class="distance-summary">${primaryHtml}${secondaryHtml}</div>`;
  }

  function createRestaurantCard(r) {
    const { id, name, orderUrl, distances = {} } = r;
    const avatar = getCategoryIcon(name);
    return `
      <div class="card">
        <button class="copy-icon-btn copy-link-btn" data-id="${id}" data-url="${orderUrl}" aria-label="複製連結">
          <span class="copy-icon copy-default" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M9 9.75A2.25 2.25 0 0 1 11.25 7.5h6A2.25 2.25 0 0 1 19.5 9.75v6a2.25 2.25 0 0 1-2.25 2.25h-6A2.25 2.25 0 0 1 9 15.75v-6Z"/><path d="M5.25 14.25A2.25 2.25 0 0 1 3 12V6.75A2.75 2.75 0 0 1 5.75 4h5.5" stroke-linecap="round"/></svg>
          </span>
          <span class="copy-icon copy-check" aria-hidden="true" style="display:none;">
            <svg viewBox="0 0 24 24"><path d="M5 12.5 10 17l9-10" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <span class="copy-tooltip">複製</span>
        </button>
        <div class="card-title">
          <div class="avatar ${avatar.bg}">${avatar.icon}</div>
          <a href="${orderUrl}" target="_blank" rel="noopener" class="restaurant-link" data-tooltip="前往訂購">
            ${name}
          </a>
        </div>
        ${createDistanceSummary(distances)}
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

  function getCategoryIcon(name = '') {
    const n = name.toLowerCase();
    if (n.includes('能量') || n.includes('力')) return { icon: '⚡' };
    if (n.includes('蛋') || n.includes('肌')) return { icon: '🥚' };
    if (n.includes('燃') || n.includes('火')) return { icon: '🔥' };
    if (n.includes('樂') || n.includes('蔬') || n.includes('輕')) return { icon: '🥗' };
    return { icon: '🍴' };
  }

  // 複製深連結（最穩組法：取「目錄 URL」再加查詢）
  function bindCardEvents() {
    $$('.copy-link-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const shopId = btn.dataset.id;
        const explicitUrl = btn.dataset.url;
        if (!shopId) return;

        const found = appState.restaurants.find(r => r.id === shopId);
        const orderUrl = explicitUrl || found?.orderUrl;
        if (!orderUrl) {
          alert('找不到訂購連結，請稍後再試');
          return;
        }

        const ok = await copyText(orderUrl).catch(() => false);
        if (!ok) return;

        const iconDefault = btn.querySelector('.copy-default');
        const iconCheck = btn.querySelector('.copy-check');
        const tooltip = btn.querySelector('.copy-tooltip');
        
        if (tooltip) tooltip.textContent = '已複製';
        btn.classList.add('is-copied');
        
        if (iconDefault && iconCheck) {
          iconDefault.style.display = 'none';
          iconCheck.style.display = '';
        }

        await sleep(1500);
        
        if (iconDefault && iconCheck) {
          iconDefault.style.display = '';
          iconCheck.style.display = 'none';
        }
        
        btn.classList.remove('is-copied');
        if (tooltip) tooltip.textContent = '複製';
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
  (async function init() {
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
            () => resolve(null),
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
