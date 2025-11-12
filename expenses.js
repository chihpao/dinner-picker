(() => {
  const STORAGE_KEY = 'dinnerPicker.expenses.v1';
  const THEME_STORAGE_KEY = 'theme';

  const DOM = {
    body: document.body,
    themeToggle: document.getElementById('expenseThemeToggle'),
    form: document.getElementById('expenseForm'),
    emptyState: document.getElementById('emptyState'),
    list: document.getElementById('expenseList'),
    clearBtn: document.getElementById('clearAll'),
    todayTotal: document.getElementById('todayTotal'),
    weekTotal: document.getElementById('weekTotal'),
    monthTotal: document.getElementById('monthTotal'),
  };

  const state = {
    entries: [],
    theme: 'light',
  };

  const todayISO = toISODate(new Date());
  DOM.form.elements.date.value = todayISO;

  function toISODate(date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  function parseISODate(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  }

  function formatCurrency(amount) {
    return `NT$ ${amount.toLocaleString('zh-TW', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  }

  function formatDate(str) {
    const date = parseISODate(str);
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return `${date.getMonth() + 1}/${date.getDate()}（${days[date.getDay()]}）`;
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

  function loadEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        state.entries = parsed.map(entry => ({
          id: entry.id ?? crypto.randomUUID?.() ?? String(Date.now()),
          date: entry.date ?? todayISO,
          amount: Number(entry.amount) || 0,
          note: entry.note ?? '',
          createdAt: entry.createdAt ?? Date.now(),
        })).sort((a, b) => {
          if (a.date === b.date) return (b.createdAt ?? 0) - (a.createdAt ?? 0);
          return a.date > b.date ? -1 : 1;
        });
      } else {
        state.entries = [];
      }
    } catch (err) {
      console.error('Failed to parse local entries', err);
      state.entries = [];
    }
  }

  function persistEntries() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.entries));
  }

  function setTheme(mode) {
    state.theme = mode;
    DOM.body.setAttribute('data-theme', mode);
    DOM.themeToggle.textContent = mode === 'dark' ? '🌙' : '🌞';
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }

  DOM.themeToggle.addEventListener('click', () => {
    setTheme(state.theme === 'light' ? 'dark' : 'light');
  });

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

  function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  function isSameMonth(a, b) {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth();
  }

  function startOfWeek(date) {
    const clone = parseISODate(toISODate(date));
    const weekday = clone.getDay(); // 0(日) - 6(六)
    const diff = (weekday + 6) % 7; // 以週一為第一天
    clone.setDate(clone.getDate() - diff);
    return clone;
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
      date: formData.get('date') || todayISO,
      amount: Math.round(amount),
      note: (formData.get('note') || '').trim(),
      createdAt: Date.now(),
    };

    state.entries = [entry, ...state.entries].sort((a, b) => {
      if (a.date === b.date) return (b.createdAt ?? 0) - (a.createdAt ?? 0);
      return a.date > b.date ? -1 : 1;
    });
    persistEntries();
    renderEntries();
    renderSummaries();
    DOM.form.reset();
    DOM.form.elements.date.value = entry.date;
  });

  DOM.list.addEventListener('click', (event) => {
    const btn = event.target;
    if (btn.dataset.action !== 'delete') return;
    const article = btn.closest('.entry-card');
    const id = article?.dataset?.id;
    if (!id) return;
    state.entries = state.entries.filter(entry => entry.id !== id);
    persistEntries();
    renderEntries();
    renderSummaries();
  });

  DOM.clearBtn.addEventListener('click', () => {
    if (!state.entries.length) return;
    const confirmClear = confirm('確定要刪除所有紀錄嗎？此操作無法復原。');
    if (!confirmClear) return;
    state.entries = [];
    persistEntries();
    renderEntries();
    renderSummaries();
  });

  function init() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
    setTheme(savedTheme);
    loadEntries();
    renderEntries();
    renderSummaries();
  }

  init();
})();
