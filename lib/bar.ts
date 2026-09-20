export type StockItem = { name: string; unit: string; stock: number; target: number; oldPrice: number; price: number };
export const barItems: StockItem[] = [
  { name: 'Вода', unit: 'пляш.', stock: 48, target: 120, oldPrice: 18, price: 22 },
  { name: 'Тонік', unit: 'пляш.', stock: 12, target: 48, oldPrice: 34, price: 38 },
  { name: 'Стакани', unit: 'шт.', stock: 65, target: 200, oldPrice: 2.5, price: 3 },
];
export function calculateBar(items: StockItem[], cash: number, reserve: number, updated: boolean) {
  const rows = items.map(item => ({ ...item, buy: Math.max(0, item.target - item.stock), unitPrice: updated ? item.price : item.oldPrice }));
  const total = Math.round(rows.reduce((sum, item) => sum + item.buy * item.unitPrice, 0) * 100) / 100;
  const available = Math.max(0, cash - reserve);
  const reserveGap = Math.max(0, reserve - cash);
  return { rows, total, available, reserveGap, needed: Math.round((Math.max(0, total - available) + reserveGap) * 100) / 100 };
}
