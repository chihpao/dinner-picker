// 共用的小工具：日期與格式化
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
