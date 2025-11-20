(() => {
  const STORAGE_KEY = 'dinnerPicker.expenses.v1';
  const DOM = {
    body: document.body,
    form: document.getElementById('entryForm'),
  };

  function toISODate(date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  function loadEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Failed to load entries', err);
      return [];
    }
  }

  function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  function initForm() {
    const todayISO = toISODate(new Date());
    DOM.form.elements.date.value = todayISO;
  }

  DOM.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(DOM.form);
    const amount = Number(formData.get('amount'));
    if (!Number.isFinite(amount) || amount <= 0) {
      alert('請輸入正確的金額');
      return;
    }

    const entries = loadEntries();
    const entry = {
      id: crypto.randomUUID?.() ?? `${Date.now()}`,
      date: formData.get('date') || toISODate(new Date()),
      amount: Math.round(amount),
      note: '',
      createdAt: Date.now(),
    };

    entries.unshift(entry);
    entries.sort((a, b) => {
      if (a.date === b.date) return (b.createdAt ?? 0) - (a.createdAt ?? 0);
      return a.date > b.date ? -1 : 1;
    });
    saveEntries(entries);

    window.location.href = './expenses.html';
  });

  function init() {
    initForm();
  }

  init();
})();
