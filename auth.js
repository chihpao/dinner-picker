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
  window.location.reload();
}
