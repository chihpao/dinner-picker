(() => {
  const STORAGE_KEY = 'dinnerPicker.expenses.v1';
  const TABLE = 'expenses';
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

  function initForm() {
    const todayISO = toISODate(new Date());
    DOM.form.elements.date.value = todayISO;
  }

  function loadLocalEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Failed to load entries', err);
      return [];
    }
  }

  function saveLocalEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  async function saveToSupabase(entry) {
    const payload = {
      id: entry.id,
      date: entry.date,
      amount: entry.amount,
      note: entry.note ?? '',
      created_at: new Date(entry.createdAt).toISOString(),
    };
    const { error } = await supa.from(TABLE).insert(payload);
    if (error) throw error;
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
    };

    (async () => {
      try {
        await saveToSupabase(entry);
        // 雲端成功後，保留一份本機備份
        const entries = loadLocalEntries();
        entries.unshift(entry);
        saveLocalEntries(entries);
        window.location.href = './expenses.html';
      } catch (err) {
        alert(`上傳到雲端失敗，請稍後再試。\n${err.message}`);
      }
    })();
  });

  function init() {
    initForm();
  }

  init();
})();
