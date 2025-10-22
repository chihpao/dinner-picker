// ---- 可調參數 ----
const GLOBAL_MAX_DIST_KM = 1.5; // 距離條滿格代表的公里數（相同距離→相同條長）

// ---- 店家與個人設定（純前端版）----
const RESTAURANTS = [
  { id: "01", name: "蛋白盒子", orderUrl: "https://order.ocard.co/theproteinbox/wJoWlQ", lat: 25.061211941014733, lng: 121.5390232531607 },
  { id: "02", name: "燃食",     orderUrl: "https://imenu.com.tw/Ranshi/Ranshihealthybox/menu", lat: 25.061173065897304, lng: 121.54168400438355 },
  { id: "03", name: "樂芙",     orderUrl: "https://iding.tw/stores/8f5078eb/menu", lat: 25.060235517056498, lng: 121.546343268503 }
];

const PROFILE = {
  home: { label: "住家", lat: 25.062718339099956, lng: 121.54144385241743 },
  work: { label: "公司", lat: 25.05818551542524,  lng: 121.54833875427008 }
};

// ---- Deep Link：?shop=xx&autorun=1 直接外連 ----
(function handleDeepLink() {
  const usp = new URLSearchParams(location.search);
  const shop = usp.get('shop');
  const autorun = usp.get('autorun');
  if (shop && autorun === '1') {
    const r = RESTAURANTS.find(x => x.id === shop);
    if (r?.orderUrl) location.replace(r.orderUrl);
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const appState = {
    restaurants: RESTAURANTS,
    profile: PROFILE,
    userLocation: null,
    isLoading: true,
    theme: 'light',
  };

  const DOM = {
    body: document.body,
    toolbar: document.getElementById('toolbar'),
    list: document.getElementById('restaurant-list'),
    loader: document.getElementById('loader'),
    themeToggle: document.getElementById('themeToggle'),
  };

  // Theme
  function setTheme(mode) {
    appState.theme = mode;
    DOM.body.setAttribute('data-theme', mode);
    DOM.themeToggle.textContent = mode === 'dark' ? '🌙' : '🌞';
    localStorage.setItem('theme', mode);
  }
  DOM.themeToggle.addEventListener('click', () => {
    setTheme(appState.theme === 'light' ? 'dark' : 'light');
  });

  // Render
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

  function renderToolbar() {
    const hasLocation = !!appState.userLocation;
    DOM.toolbar.innerHTML = hasLocation
      ? ''
      : `<button id="btnLoc" class="btn danger">📍 允許目前位置</button>`;
    if (!hasLocation) {
      document.getElementById('btnLoc').addEventListener('click', requestLocation);
    }
  }

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

    // 自動排序鍵：有定位→current；否則 home→否則 work
    const sortKey = appState.userLocation ? 'current' : (appState.profile?.home ? 'home' : 'work');

    withDistance.sort((a,b) => {
      const da = a.distances?.[sortKey] ?? Infinity;
      const db = b.distances?.[sortKey] ?? Infinity;
      return da - db;
    });

    return withDistance;
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
      const pct = Math.max(6, clamp * 100); // 視覺下限 6%
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

  function bindCardEvents() {
    // 複製深連結（把目前站點路徑 + 參數）
    document.querySelectorAll('.copy-link-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const shopId = e.currentTarget?.dataset?.id;
        if (!shopId) return;

        // 兼容 GitHub Pages 子路徑（/username/repo/）
        const base = new URL(window.location.href);
        base.search = ''; base.hash = '';
        const url = `${base.toString()}?shop=${shopId}&autorun=1`;

        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(url);
          } else {
            const ta = document.createElement('textarea');
            ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
          }
          e.currentTarget.textContent = '已複製!';
          setTimeout(() => { e.currentTarget.textContent = '複製連結'; }, 1500);
        } catch {
          alert('複製失敗，請手動複製：\n' + url);
        }
      });
    });
  }

  // 小工具
  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const toRad = x => x * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
    return 2*R*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  // 定位
  function requestLocation() {
    if (!navigator.geolocation) return alert("您的瀏覽器不支援定位功能。");
    const btn = document.getElementById('btnLoc');
    btn.textContent = '定位中...';
    btn.disabled = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => { appState.userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude }; render(); },
      () => { alert("定位失敗，請檢查您的定位權限設定。"); render(); },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  // 初始化
  (async function init(){
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
    // 嘗試先抓位置（不阻塞 render）
    const locationPromise = new Promise(resolve => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
    appState.userLocation = await locationPromise;
    render();
  })();
});
