// Google OAuth：提供「查詢現有 session」與「手動觸發登入/登出」
function authRedirectUrl(pathname = window.location.pathname) {
  return `${window.location.origin}${pathname}`;
}

let _currentUserPromise = null;

// 檢查是否已有登入；若網址帶 code 則交換成 session，最後回傳 user 或 null
// 使用 Promise 單例模式避免多個元件同時呼叫時發生 Race Condition（導致 code 重複使用失效）
function getCurrentUser(pathname = window.location.pathname) {
  if (_currentUserPromise) return _currentUserPromise;

  _currentUserPromise = (async () => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    // state 檢查可選，視 Supabase 設定而定

    if (code) {
      // 若有 code，嘗試交換 session
      const { error } = await supa.auth.exchangeCodeForSession(code);
      if (!error) {
        // 只有成功交換才清除 URL，避免失敗後無限重試或殘留
        url.searchParams.delete('code');
        url.searchParams.delete('state');
        history.replaceState({}, document.title, url.toString());
      } else {
        console.warn('Auth code exchange failed:', error);
        // 若交換失敗（可能是 code 已被用過），這裡不 throw，而是嘗試直接獲取 getSession
        // 因為有可能是重新整理頁面，code 還在但 session 其實已建立
      }
    }

    const { data } = await supa.auth.getSession();
    return data?.session?.user ?? null;
  })();

  return _currentUserPromise;
}

// 由使用者點擊後才觸發登入
async function signInWithGoogle(pathname = window.location.pathname) {
  await supa.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: authRedirectUrl(pathname),
    },
  });
}

async function signOutAndReload() {
  await supa.auth.signOut();
  try {
    // Supabase 會把 session 存在 localStorage 的 sb-<ref>-auth-token key，這裡強制清掉
    const clearStore = (store) => {
      if (!store) return;
      const keys = [];
      for (let i = 0; i < store.length; i += 1) {
        const key = store.key(i);
        if (key && (key.startsWith('sb-') || key.includes('supabase.auth'))) {
          keys.push(key);
        }
      }
      keys.forEach(k => store.removeItem(k));
    };
    clearStore(window.localStorage);
    clearStore(window.sessionStorage);
  } catch (e) { /* noop */ }
  // 回到當前頁（去掉可能殘留的查詢字串）
  window.location.href = window.location.pathname;
}