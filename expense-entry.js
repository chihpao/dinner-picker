(() => {
  const STORAGE_KEY = 'dinnerPicker.expenses.v1'; // 雲端資料的本機備份
  const PENDING_KEY = 'dinnerPicker.expenses.pending'; // 雲端尚未送出的暫存
  const TABLE = 'expenses';
  const DOM = {
    body: document.body,
    form: document.getElementById('entryForm'),
    authGate: document.getElementById('authGate'),
    btnLogin: document.getElementById('btnLogin'),
  };

  let currentUser = null;
  let hasBootstrappedUser = false;

  function loadLocalEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(entry => entry.user_id === currentUser?.id);
    } catch (err) {
      console.error('Failed to load entries', err);
      return [];
    }
  }

  function saveLocalEntries(entries) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      const others = Array.isArray(existing) ? existing.filter(e => e.user_id !== currentUser?.id) : [];
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...others, ...entries]));
    } catch (err) {
      console.error('Failed to save local entries', err);
    }
  }

  function loadPendingEntries() {
    try {
      const raw = localStorage.getItem(PENDING_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(entry => entry.user_id === currentUser?.id);
    } catch (err) {
      console.error('Failed to load pending entries', err);
      return [];
    }
  }

  function savePendingEntries(entries) {
    try {
      const raw = localStorage.getItem(PENDING_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      const others = Array.isArray(existing) ? existing.filter(e => e.user_id !== currentUser?.id) : [];
      localStorage.setItem(PENDING_KEY, JSON.stringify([...others, ...entries]));
    } catch (err) {
      console.error('Failed to save pending entries', err);
    }
  }

  async function saveToSupabase(entry) {
    const payload = {
      id: entry.id,
      date: entry.date,
      amount: entry.amount,
      note: entry.note ?? '',
      created_at: new Date(entry.createdAt).toISOString(),
      user_id: currentUser?.id,
    };
    const { error } = await supa.from(TABLE).insert(payload);
    if (error) throw error;
  }

  // 把舊的 pending 嘗試補送
  async function syncPending() {
    if (!currentUser) return;
    const pending = loadPendingEntries();
    if (!pending.length) return;
    const stillPending = [];
    for (const entry of pending) {
      try {
        await saveToSupabase(entry);
      } catch (err) {
        console.error('Retry pending failed', err);
        stillPending.push(entry);
      }
    }
    savePendingEntries(stillPending);
  }

  DOM.form.addEventListener('submit', (event) => {
    event.preventDefault();

    // 嚴格檢查登入狀態
    if (!currentUser || !currentUser.id) {
      alert('請先登入才能記帳');
      return;
    }

    const formData = new FormData(DOM.form);
    const amountVal = formData.get('amount');
    const amount = Number(amountVal);

    if (!amountVal || !Number.isFinite(amount) || amount <= 0) {
      alert('請輸入正確的金額');
      return;
    }

    const entry = {
      id: generateUUID(),
      date: formData.get('date') || toISODate(new Date()),
      amount: Math.round(amount),
      note: '',
      createdAt: Date.now(),
      user_id: currentUser.id,
    };

    (async () => {
      // 1. Optimistic Save: 先存入 Pending
      const pending = loadPendingEntries();
      pending.unshift(entry);
      savePendingEntries(pending);

      try {
        // 2. 嘗試同步到雲端
        await saveToSupabase(entry);

        // 3. 同步成功：從 Pending 移除，並更新本機快取
        const remainingPending = loadPendingEntries().filter(e => e.id !== entry.id);
        savePendingEntries(remainingPending);

        const entries = loadLocalEntries();
        entries.unshift(entry);
        saveLocalEntries(entries);
      } catch (err) {
        console.warn('雲端同步失敗，保留在 Pending 稍後重試', err);
        // 這裡不 alert，以免打斷使用者流程，因為已經有本機備份了
      }

      // 4. 轉跳回列表頁
      window.location.href = './expenses.html';
    })();
  });

  async function applyAuthState(user) {
    const userChanged = user?.id !== currentUser?.id;
    currentUser = user ?? null;

    if (!currentUser) {
      hasBootstrappedUser = false;
      DOM.form.style.display = 'none';
      DOM.authGate.hidden = false;
      if (DOM.btnLogin) {
        DOM.btnLogin.onclick = () => signInWithGoogle('/expense-entry.html');
      }
      return;
    }

    DOM.form.style.display = '';
    DOM.authGate.hidden = true;

    if (!hasBootstrappedUser || userChanged) {
      initForm();
      try {
        await syncPending();
      } catch (err) {
        console.error('sync pending failed', err);
      }
      hasBootstrappedUser = true;
    }
  }

  async function init() {
    try {
      const initialUser = await getCurrentUser('/expense-entry.html');
      await applyAuthState(initialUser);
    } catch (err) {
      console.error('Failed to read current session', err);
    }

    // 監聽登入狀態變化，確保 UI 即時反應
    supa.auth.onAuthStateChange(async (_event, session) => {
      await applyAuthState(session?.user ?? null);
    });
  }

  function initForm() {
    const todayISO = toISODate(new Date());
    DOM.form.elements.date.value = todayISO;
  }

  init();
})();
