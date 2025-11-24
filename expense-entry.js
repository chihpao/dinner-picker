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
    const formData = new FormData(DOM.form);
    const amount = Number(formData.get('amount'));
    if (!Number.isFinite(amount) || amount <= 0) {
      alert('請輸入正確的金額');
      return;
    }

    const entry = {
      id: crypto.randomUUID?.() ?? `${Date.now()}`,
      date: formData.get('date') || toISODate(new Date()),
      amount: Math.round(amount),
      note: '',
      createdAt: Date.now(),
      user_id: currentUser?.id,
    };

    (async () => {
      // 先存 pending，確保不遺失
      const pending = loadPendingEntries();
      pending.unshift(entry);
      savePendingEntries(pending);

      try {
        await saveToSupabase(entry);

        // 雲端成功後，移除 pending，並保留一份本機備份
        const remainingPending = loadPendingEntries().filter(e => e.id !== entry.id);
        savePendingEntries(remainingPending);

        const entries = loadLocalEntries();
        entries.unshift(entry);
        saveLocalEntries(entries);

        window.location.href = './expenses.html';
      } catch (err) {
        alert(`雲端同步失敗，但已先保存在本機，之後會自動再試。\n${err.message}`);
      }
    })();
  });

  function init() {
    // 監聽登入狀態變化，確保 UI 即時反應
    supa.auth.onAuthStateChange(async (event, session) => {
      currentUser = session?.user ?? null;

      if (!currentUser) {
        DOM.form.style.display = 'none';
        DOM.authGate.hidden = false;
        if (DOM.btnLogin) {
          DOM.btnLogin.onclick = () => signInWithGoogle('/expense-entry.html');
        }
      } else {
        DOM.form.style.display = '';
        DOM.authGate.hidden = true;
        initForm();
        await syncPending();
      }
    });
  }

  function initForm() {
    const todayISO = toISODate(new Date());
    DOM.form.elements.date.value = todayISO;
  }

  init();
})();
