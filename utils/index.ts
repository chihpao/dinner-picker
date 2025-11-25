// 共用的小工具：日期與格式化

export function toISODate(date: Date): string {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
}

export function parseISODate(str: string): Date {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function formatCurrency(amount: number): string {
    return `NT$ ${amount.toLocaleString('zh-TW', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
}

export function formatDate(str: string): string {
    const date = parseISODate(str);
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return `${date.getMonth() + 1}/${date.getDate()}（${days[date.getDay()]}）`;
}

export function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}

export function isSameMonth(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth();
}

export function startOfWeek(date: Date): Date {
    const clone = parseISODate(toISODate(date));
    const weekday = clone.getDay(); // 0(日) - 6(六)
    const diff = (weekday + 6) % 7; // 以週一為第一天
    clone.setDate(clone.getDate() - diff);
    return clone;
}

export function generateUUID(): string {
    // 優先使用 Web Crypto API
    try {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
    } catch (e) {
        // 忽略錯誤，降級處理
    }

    // Fallback: RFC 4122 v4 compliant
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const toRad = (x: number) => x * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
