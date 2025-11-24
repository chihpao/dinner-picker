(() => {
  const STORAGE_KEY = 'dinnerPicker.expenses.v1'; // 雲端資料的本機備份
  const PENDING_KEY = 'dinnerPicker.expenses.pending'; // 尚未同步的暫存
  const TABLE = 'expenses';
  const DOM = {
    body: document.body,
    emptyState: document.getElementById('emptyState'),
    list: document.getElementById('expenseList'),
    clearBtn: document.getElementById('clearAll'),
    todayTotal: document.getElementById('todayTotal'),
    weekTotal: document.getElementById('weekTotal'),
    monthTotal: document.getElementById('monthTotal'),
    authGate: document.getElementById('authGate'),
    btnLogin: document.getElementById('btnLogin'),
  };

  const state = {
    entries: [],
    loading: false,
  };

  let currentUser = null;
  let todayISO = toISODate(new Date());

  function loadLocalEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(entry => entry.user_id === currentUser?.id);
    } catch (err) {
      console.error('Failed to parse local entries', err);
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
      console.error('Failed to parse pending entries', err);
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

  async function fetchEntriesFromSupabase() {
    state.loading = true;
    const { data, error } = await supa
      .from(TABLE)
      .select('*')
      .eq('user_id', currentUser.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    state.loading = false;
    if (error) throw error;
    const remote = (data ?? []).map(entry => ({
      id: entry.id,
      date: entry.date,
      amount: entry.amount,
      note: entry.note ?? '',
      createdAt: entry.created_at ? new Date(entry.created_at).getTime() : Date.now(),
      user_id: entry.user_id,
    }));
    return remote;
  }

  async function syncPending() {
    if (!currentUser) return;
    const pending = loadPendingEntries();
    if (!pending.length) return;
    const stillPending = [];
    for (const entry of pending) {
      try {
        const payload = {
          id: entry.id,
          date: entry.date,
          amount: entry.amount,
          note: entry.note ?? '',
          created_at: new Date(entry.createdAt).toISOString(),
          user_id: currentUser.id,
        };
        const { error } = await supa.from(TABLE).insert(payload);
        if (error) throw error;
      } catch (err) {
        console.error('Retry pending failed', err);
        stillPending.push(entry);
      }
    }
    savePendingEntries(stillPending);
  }

  function mergePending(entries) {
    const pending = loadPendingEntries();
    if (!pending.length) return entries;
    const existingIds = new Set(entries.map(e => e.id));
    const merged = [...pending.filter(e => !existingIds.has(e.id)), ...entries];
    return merged;
  }

  function renderEntries() {
    if (!state.entries.length) {
      DOM.emptyState.hidden = false;
      DOM.list.innerHTML = '';
      return;
    }
    DOM.emptyState.hidden = true;
    DOM.list.innerHTML = state.entries.map(entry => `
      <article class="entry-card" data-id="${entry.id}">
        <div class="entry-meta">
          <p class="entry-date">${formatDate(entry.date)}</p>
        </div>
        <p class="entry-amount">${formatCurrency(entry.amount)}</p>
        ${entry.note ? `<p class="entry-note">${escapeHTML(entry.note)}</p>` : ''}
        <button class="btn btn-sm" data-action="delete" type="button">刪除</button>
      </article>
    `).join('');
  }

  function renderSummaries() {
    const today = parseISODate(todayISO);
    const weekStart = startOfWeek(today);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const totals = state.entries.reduce((acc, entry) => {
      const entryDate = parseISODate(entry.date);
      if (isSameDay(entryDate, today)) acc.today += entry.amount;
      if (entryDate >= weekStart && entryDate < weekEnd) acc.week += entry.amount;
      if (entryDate >= monthStart && entryDate < monthEnd) acc.month += entry.amount;
      return acc;
    }, { today: 0, week: 0, month: 0 });

    DOM.todayTotal.textContent = formatCurrency(totals.today);
    DOM.weekTotal.textContent = formatCurrency(totals.week);
    DOM.monthTotal.textContent = formatCurrency(totals.month);
  }

  function escapeHTML(text = '') {
    return text.replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[c]);
  }

  DOM.list.addEventListener('click', async (event) => {
    const btn = event.target;
    if (btn.dataset.action !== 'delete') return;
    const article = btn.closest('.entry-card');
    const id = article?.dataset?.id;
    if (!id) return;
    try {
      const { error } = await supa.from(TABLE).delete().eq('id', id).eq('user_id', currentUser.id);
      if (error) throw error;
      state.entries = state.entries.filter(entry => entry.id !== id);
      saveLocalEntries(state.entries);
      renderEntries();
      renderSummaries();
    } catch (err) {
      alert(`刪除失敗：${err.message}`);
    }
  });

  DOM.clearBtn.addEventListener('click', async () => {
    if (!state.entries.length) return;
    const confirmClear = confirm('確定要刪除所有紀錄嗎？此操作無法復原。');
    if (!confirmClear) return;
    try {
      const { error } = await supa.from(TABLE).delete().eq('user_id', currentUser.id);
      if (error) throw error;
      state.entries = [];
      saveLocalEntries([]);
      savePendingEntries([]);
      renderEntries();
      renderSummaries();
    } catch (err) {
      alert(`清空失敗：${err.message}`);
    }
  });

  function init() {
    // 監聽登入狀態變化，確保 UI 即時反應
    supa.auth.onAuthStateChange(async (event, session) => {
      currentUser = session?.user ?? null;

      if (!currentUser) {
        DOM.emptyState.hidden = true;
        DOM.list.innerHTML = '';
        if (DOM.clearBtn) DOM.clearBtn.disabled = true;

        DOM.authGate.hidden = false;
        if (DOM.btnLogin) {
          DOM.btnLogin.onclick = () => signInWithGoogle('/expenses.html');
        }
        return;
      }

      // User is logged in
      if (DOM.clearBtn) DOM.clearBtn.disabled = false;
      DOM.authGate.hidden = true;
      todayISO = toISODate(new Date());

      try {
        await syncPending(); // 先把未送出的補送
      } catch (err) {
        console.error('sync pending failed', err);
      }

      try {
        const remoteEntries = await fetchEntriesFromSupabase();
        state.entries = mergePending(remoteEntries);
        saveLocalEntries(state.entries);
      } catch (err) {
        console.error('Supabase 讀取失敗，改用本機資料', err);
        state.entries = mergePending(loadLocalEntries());
        alert('雲端讀取失敗，先顯示本機備份與待同步資料。');
      }

      renderEntries();
      renderSummaries();
    });
  }

  init();
})();
