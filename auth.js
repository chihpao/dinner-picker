// Google OAuth 登入，確保只有登入者才能讀寫自己的資料
async function ensureSignedIn(redirectPath = window.location.pathname) {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  // 如果 Google 登入後帶回 code，換取 session 並清掉網址參數
  if (code) {
    await supa.auth.exchangeCodeForSession(code);
    url.searchParams.delete('code');
    url.searchParams.delete('state');
    history.replaceState({}, document.title, url.toString());
  }

  const { data } = await supa.auth.getSession();
  if (data?.session?.user) return data.session.user;

  // 未登入就發起 Google OAuth
  await supa.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}${redirectPath}`,
    },
  });
  return null;
}

async function signOutAndReload() {
  await supa.auth.signOut();
  window.location.reload();
}
