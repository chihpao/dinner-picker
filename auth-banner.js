// 在頁面頂部顯示登入/登出按鈕（不自動跳登入）
document.addEventListener('DOMContentLoaded', async () => {
  const mount = document.getElementById('authBar');
  if (!mount) return;

  function render(user) {
    const isAuthed = !!user;
    const initial = user?.email ? user.email.trim().charAt(0).toUpperCase() : '';
    if (isAuthed) {
      mount.innerHTML = `
        <div class="auth-pill">
          <span class="auth-status">已登入：${initial}</span>
          <button type="button" class="btn btn-sm" id="btnLogout">登出</button>
        </div>
      `;
      const btnLogout = document.getElementById('btnLogout');
      if (btnLogout) btnLogout.onclick = () => signOutAndReload();
    } else {
      mount.innerHTML = `
        <button type="button" class="btn btn-google" id="btnLogin">
          <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path fill="#EA4335" d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.55-2.48C13.58.89 11.48 0 9 0 5.48 0 2.44 1.99.96 4.9l2.96 2.3C4.4 5.09 6.48 3.48 9 3.48Z"/><path fill="#4285F4" d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62Z"/><path fill="#FBBC05" d="M3.92 10.79c-.19-.57-.3-1.18-.3-1.79s.11-1.22.3-1.79l-2.96-2.3C.63 6.23 0 7.97 0 9s.63 2.77 1.72 4.09l2.2-1.71Z"/><path fill="#34A853" d="M9 18c2.48 0 4.58-.82 6.11-2.23l-2.84-2.2c-.76.53-1.79.9-3.27.9-2.52 0-4.6-1.61-5.36-3.81l-2.96 2.3C2.44 16.01 5.48 18 9 18Z"/><path fill="none" d="M0 0h18v18H0Z"/></svg>
          登入
        </button>
      `;
      const btnLogin = document.getElementById('btnLogin');
      if (btnLogin) btnLogin.onclick = () => signInWithGoogle(window.location.pathname);
    }
  }

  const user = await getCurrentUser(window.location.pathname);
  render(user);
});
