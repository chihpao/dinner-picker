// ---- 基礎工具 ----
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// HTML Escape
function escapeHTML(text = '') {
  return text.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c]);
}

// ---- 日期與格式化 ----
function toISODate(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseISODate(str) {
  if (!str) return new Date();
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function formatCurrency(amount) {
  return `NT$ ${Number(amount).toLocaleString('zh-TW', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatDate(str) {
  const date = parseISODate(str);
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  return `${date.getMonth() + 1}/${date.getDate()}（${days[date.getDay()]}）`;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfWeek(date) {
  const clone = new Date(date);
  const weekday = clone.getDay(); // 0(Sun) - 6(Sat)
  // 假設週一為一週開始：Mon=0, ..., Sun=6
  // 原生 getDay: Sun=0, Mon=1 ...
  // 我們要回推到最近的週一
  // (day + 6) % 7 轉換：Sun(0)->6, Mon(1)->0, Tue(2)->1
  const diff = (weekday + 6) % 7; 
  clone.setDate(clone.getDate() - diff);
  clone.setHours(0,0,0,0);
  return clone;
}

// ---- 系統工具：複製文字 ----
async function copyText(text) {
  try {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) { /* fallthrough */ }
  
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    if (ok) return true;
  } catch (e) { /* fallthrough */ }
  
  window.prompt('請複製以下內容：', text);
  return false;
}

// ---- 服務：ExpenseService (記帳邏輯中心) ----
// 封裝 Supabase + LocalStorage 的雙向同步邏輯
const ExpenseService = {
  TABLE: 'expenses',
  STORAGE_KEY: 'dinnerPicker.expenses.v1',
  PENDING_KEY: 'dinnerPicker.expenses.pending',

  // 讀取本地快取
  getLocal(userId) {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((e) => e.user_id === userId);
    } catch (e) {
      console.error('Load local error', e);
      return [];
    }
  },

  // 儲存本地快取 (保留其他使用者的資料)
  saveLocal(userId, entries) {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      const others = Array.isArray(existing)
        ? existing.filter((e) => e.user_id !== userId)
        : [];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...others, ...entries]));
    } catch (e) {
      console.error('Save local error', e);
    }
  },

  // 讀取待同步清單
  getPending(userId) {
    try {
      const raw = localStorage.getItem(this.PENDING_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((e) => e.user_id === userId);
    } catch (e) {
      return [];
    }
  },

  // 儲存待同步清單
  savePending(userId, entries) {
    try {
      const raw = localStorage.getItem(this.PENDING_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      const others = Array.isArray(existing)
        ? existing.filter((e) => e.user_id !== userId)
        : [];
      localStorage.setItem(this.PENDING_KEY, JSON.stringify([...others, ...entries]));
    } catch (e) {
      console.error('Save pending error', e);
    }
  },

  // 嘗試同步單筆資料到 Supabase
  async _syncOne(entry, userId) {
    const payload = {
      id: entry.id,
      date: entry.date,
      amount: entry.amount,
      note: entry.note || '',
      created_at: new Date(entry.createdAt).toISOString(),
      user_id: userId,
    };
    const { error } = await supa.from(this.TABLE).insert(payload);
    if (error) throw error;
  },

  // 背景同步所有 Pending
  async syncPending(userId) {
    if (!userId) return;
    const pending = this.getPending(userId);
    if (!pending.length) return;

    const stillPending = [];
    for (const entry of pending) {
      try {
        await this._syncOne(entry, userId);
      } catch (e) {
        console.warn('Sync failed, keep pending', e);
        stillPending.push(entry);
      }
    }
    this.savePending(userId, stillPending);
  },

  // 新增一筆 (樂觀更新：先存本地+Pending，再背景同步)
  async addEntry(userId, rawData) {
    const entry = {
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      date: rawData.date || toISODate(new Date()),
      amount: Math.round(Number(rawData.amount)),
      note: rawData.note || '',
      createdAt: Date.now(),
      user_id: userId,
    };

    // 1. Update Pending
    const pending = this.getPending(userId);
    pending.unshift(entry);
    this.savePending(userId, pending);

    // 2. Update Local View
    const local = this.getLocal(userId);
    local.unshift(entry);
    this.saveLocal(userId, local);

    // 3. Try Network
    try {
      await this._syncOne(entry, userId);
      // Success: remove from pending
      const currentPending = this.getPending(userId);
      this.savePending(userId, currentPending.filter(e => e.id !== entry.id));
    } catch (e) {
      console.warn('Network failed, saved to pending');
      throw e; // Re-throw to let UI know it's offline/saved locally
    }
    return entry;
  },

  // 刪除 (直接刪除雲端，成功後更新本地)
  async deleteEntry(userId, id) {
    const { error } = await supa.from(this.TABLE).delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    
    const local = this.getLocal(userId).filter(e => e.id !== id);
    this.saveLocal(userId, local);
    return local;
  },

  // 清空
  async clearAll(userId) {
    const { error } = await supa.from(this.TABLE).delete().eq('user_id', userId);
    if (error) throw error;
    
    this.saveLocal(userId, []);
    this.savePending(userId, []);
  },

  // 獲取完整清單 (先同步 Pending，再拉雲端，失敗則回傳本地)
  async getAll(userId) {
    await this.syncPending(userId); // Try sync first

    try {
      const { data, error } = await supa
        .from(this.TABLE)
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      const remote = (data || []).map(e => ({
        id: e.id,
        date: e.date,
        amount: e.amount,
        note: e.note || '',
        createdAt: e.created_at ? new Date(e.created_at).getTime() : Date.now(),
        user_id: e.user_id
      }));

      // Merge pending that are NOT in remote (in case sync failed partially)
      const pending = this.getPending(userId);
      const remoteIds = new Set(remote.map(r => r.id));
      const merged = [...pending.filter(p => !remoteIds.has(p.id)), ...remote];
      
      this.saveLocal(userId, merged); // Update cache
      return merged;
    } catch (e) {
      console.warn('Fetch remote failed, using local', e);
      // Merge pending into local just in case
      const local = this.getLocal(userId);
      const pending = this.getPending(userId);
      const localIds = new Set(local.map(l => l.id));
      return [...pending.filter(p => !localIds.has(p.id)), ...local];
    }
  }
};