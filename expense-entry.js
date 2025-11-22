(() => {
  const DOM = {
    form: document.getElementById('entryForm'),
    authGate: document.getElementById('authGate'),
    btnLogin: document.getElementById('btnLogin'),
  };

  let currentUser = null;

  // 初始化：檢查登入狀態
  async function init() {
    currentUser = await getCurrentUser('/expense-entry.html');

    if (!currentUser) {
      DOM.form.style.display = 'none';
      DOM.authGate.hidden = false;
      // 僅在有此按鈕時綁定（若按鈕在 authGate 內）
      if (DOM.btnLogin) {
        DOM.btnLogin.onclick = () => signInWithGoogle('/expense-entry.html');
      }
      return;
    }

    // 已登入
    DOM.form.style.display = '';
    DOM.authGate.hidden = true;
    initForm();

    // 背景嘗試同步舊資料
    ExpenseService.syncPending(currentUser.id).catch(console.error);
  }

  function initForm() {
    const todayISO = toISODate(new Date());
    if (DOM.form.elements.date) {
      DOM.form.elements.date.value = todayISO;
    }
  }

  DOM.form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(DOM.form);
    const amount = Number(formData.get('amount'));
    
    if (!Number.isFinite(amount) || amount <= 0) {
      alert('請輸入正確的金額');
      return;
    }

    const rawData = {
      date: formData.get('date'),
      amount: amount,
      note: '', // 目前簡易版表單沒有 note 欄位，預留
    };

    try {
      await ExpenseService.addEntry(currentUser.id, rawData);
      window.location.href = './expenses.html';
    } catch (err) {
      // addEntry 若拋出錯誤，通常是為了通知 UI 這是離線保存
      // 但我們在 Service 裡只有網路失敗才會 throw
      // 這裡可以提示使用者
      alert('網路連線異常，資料已暫存於本機，待連線恢復後將自動上傳。');
      window.location.href = './expenses.html';
    }
  });

  init();
})();