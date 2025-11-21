// Google OAuth：提供「查詢現有 session」與「手動觸發登入/登出」
function authRedirectUrl(pathname = window.location.pathname) {
  return `${window.location.origin}${pathname}`;
}

// 檢查是否已有登入；若網址帶 code 則交換成 session，最後回傳 user 或 null
async function getCurrentUser(pathname = window.location.pathname) {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (code) {
    await supa.auth.exchangeCodeForSession(code);
    url.searchParams.delete('code');
    url.searchParams.delete('state');
    history.replaceState({}, document.title, url.toString());
  }

  const { data } = await supa.auth.getSession();
  return data?.session?.user ?? null;
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
