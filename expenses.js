(() => {
  const DOM = {
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
  };

  let currentUser = null;
  let todayISO = toISODate(new Date());

  // 初始化：檢查登入並拉取資料
  async function init() {
    currentUser = await getCurrentUser('/expenses.html');

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

    // 已登入
    if (DOM.clearBtn) DOM.clearBtn.disabled = false;
    DOM.authGate.hidden = true;
    todayISO = toISODate(new Date());

    try {
      state.entries = await ExpenseService.getAll(currentUser.id);
    } catch (err) {
      console.error('Fetch error', err);
      alert('資料載入異常，僅顯示本機資料。');
    }

    renderEntries();
    renderSummaries();
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
      
      // 本日
      if (isSameDay(entryDate, today)) {
        acc.today += entry.amount;
      }
      // 本週
      if (entryDate >= weekStart && entryDate < weekEnd) {
        acc.week += entry.amount;
      }
      // 本月
      if (entryDate >= monthStart && entryDate < monthEnd) {
        acc.month += entry.amount;
      }
      return acc;
    }, { today: 0, week: 0, month: 0 });

    DOM.todayTotal.textContent = formatCurrency(totals.today);
    DOM.weekTotal.textContent = formatCurrency(totals.week);
    DOM.monthTotal.textContent = formatCurrency(totals.month);
  }

  // 刪除單筆
  DOM.list.addEventListener('click', async (event) => {
    const btn = event.target;
    if (btn.dataset.action !== 'delete') return;
    const article = btn.closest('.entry-card');
    const id = article?.dataset?.id;
    if (!id) return;

    try {
      const updatedLocal = await ExpenseService.deleteEntry(currentUser.id, id);
      // 注意：deleteEntry 回傳的是過濾後的本機資料，但若我們希望 UI 立即反映，也可以直接改 state
      state.entries = state.entries.filter(e => e.id !== id);
      renderEntries();
      renderSummaries();
    } catch (err) {
      alert(`刪除失敗：${err.message}`);
    }
  });

  // 清空全部
  DOM.clearBtn.addEventListener('click', async () => {
    if (!state.entries.length) return;
    if (!confirm('確定要刪除所有紀錄嗎？此操作無法復原。')) return;

    try {
      await ExpenseService.clearAll(currentUser.id);
      state.entries = [];
      renderEntries();
      renderSummaries();
    } catch (err) {
      alert(`清空失敗：${err.message}`);
    }
  });

  init();
})();