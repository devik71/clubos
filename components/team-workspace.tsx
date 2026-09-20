'use client';

import Link from 'next/link';
import { useState } from 'react';
import { barItems, calculateBar } from '../lib/bar';
import { DemoLabel, Segmented } from './ui';

const signals = [
  { id: 1, project: 'BRUKXT', title: 'Прайс бару оновлено. Потрібно погодити доплату.', source: 'Постачальник / прайс v3', time: 'сьогодні, 11:20', decision: true, detail: 'Демо-документ: вода 22 ₴, тонік 38 ₴, стакани 3 ₴. Витрати перераховуються в просторі барменеджера.', action: 'Погодити бюджет закупівлі після перевірки кількості.' },
  { id: 2, project: 'Продакшн', title: 'Перед суботою потрібен ще один CDJ.', source: 'Технічний чат / райдер Artist A', time: 'сьогодні, 10:45', decision: true, detail: 'Демо-фрагмент: «У райдері два CDJ. На місці підтверджений один». Джерела зіставлено; бронювання ще не підтверджене.', action: 'Обрати постачальника та відповідального за оренду.' },
  { id: 3, project: 'BRUKXT', title: 'Час відкриття відрізняється в двох джерелах.', source: 'Командний чат + календар', time: 'сьогодні, 10:10', decision: true, detail: 'Календар: 18:00. Демо-повідомлення: «Можливо, відкриємось о 19:00». Це пропозиція, не підтверджена зміна.', action: 'Уточнити час; не перезаписувати календар автоматично.' },
  { id: 4, project: 'Архів', title: 'Індекс матеріалів готовий до перевірки.', source: 'Archivist / звіт сканування', time: 'сьогодні, 09:30', decision: false, detail: 'Демо-звіт: зв’язки з подією запропоновані. Невідомі файли збережені. Жодне джерело не переміщено.', action: 'Переглянути зв’язки, коли буде зручно.' },
  { id: 5, project: 'Продакшн', title: 'Світловий тест: правило low → dimmer підготовлено.', source: 'Light / журнал прототипу', time: 'вчора, 18:40', decision: false, detail: 'Браузерний прототип готовий. Поведінку на фізичному приладі ще потрібно перевірити разом із Ксенією.', action: 'Домовитися про короткий тест у просторі.' },
  { id: 6, project: 'BRUKXT', title: 'Звіт каси застарів. Не використовувати як факт.', source: 'Каса / ручний імпорт', time: '3 дні тому', decision: true, detail: 'Останній демо-знімок не відображає поточний залишок. До звірки система показує дату й невизначеність.', action: 'Запросити звірку каси; не вважати старі дані поточними.' },
];
const money = (n: number) => new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 2 }).format(n) + ' ₴';

function Pulse() {
  const [filter, setFilter] = useState(0);
  const [project, setProject] = useState('Усі справи');
  const [seen, setSeen] = useState<number[]>([]);
  const visible = signals.filter(s => (project === 'Усі справи' || s.project === project) && (filter === 1 || s.decision && !seen.includes(s.id)));
  return <div className="pulse"><div className="workspace-title"><div><span className="eyebrow">МИКОЛА / ПУЛЬС СПРАВ</span><h3>Що змінилося.<br />Де потрібне рішення.</h3></div><span className="pulse-count">{signals.filter(s => s.decision && !seen.includes(s.id)).length}<small>ПОТРЕБУЮТЬ УВАГИ</small></span></div><div className="pulse-filters"><Segmented label="Фільтр подій" options={['Потребує рішення', 'Усі сигнали']} value={filter} onChange={setFilter} /><label>Напрям<select value={project} onChange={e => setProject(e.target.value)}>{['Усі справи', 'BRUKXT', 'Продакшн', 'Архів'].map(p => <option key={p}>{p}</option>)}</select></label></div><div className="signal-feed">{visible.length ? visible.map(s => <article key={s.id}><div className="signal-meta"><span>{s.project}</span><span>{s.time} · демо</span></div><h4>{s.title}</h4><p>{s.action}</p><details><summary>Джерело: {s.source} <span>↗</span></summary><p>{s.detail}</p></details><button className="text-button" onClick={() => setSeen(v => v.includes(s.id) ? v.filter(id => id !== s.id) : [...v, s.id])}>{seen.includes(s.id) ? 'Повернути до уваги ↺' : 'Ознайомився ✓'}</button></article>) : <div className="feed-empty"><h3>Поточні сигнали переглянуто.</h3><p>Позначка «ознайомився» не означає, що задача виконана.</p><button onClick={() => { setSeen([]); setProject('Усі справи'); }}>Скинути демо</button></div>}</div><p className="footnote">Вигадані приклади. Канали не підключені. У робочій системі — дозволені джерела, посилання на оригінал, час оновлення та явне позначення суперечностей.</p></div>;
}

function Bar() {
  const [items, setItems] = useState(barItems.map(i => ({ ...i })));
  const [cash, setCash] = useState(2500);
  const [reserve, setReserve] = useState(1000);
  const [updated, setUpdated] = useState(true);
  const [draft, setDraft] = useState(false);
  const calculation = calculateBar(items, cash, reserve, updated);
  const previous = calculateBar(items, cash, reserve, false);
  function number(value: string) { return Math.min(1000000, Math.max(0, Number(value) || 0)); }
  return <div className="bar-space"><div className="workspace-title"><div><span className="eyebrow">БАРМЕНЕДЖЕР / ПЛАН ЗАКУПІВЕЛЬ</span><h3>Потреба відома.<br />Гроші пораховані.</h3></div><span className="micro">BRUKXT / СУБОТА<br />УМОВНИЙ ПЛАН</span></div><div className="bar-inputs"><label>Готівка в барі, ₴<input type="number" min="0" max="1000000" value={cash} onChange={e => { setCash(number(e.target.value)); setDraft(false); }} /></label><label>Залишити в касі, ₴<input type="number" min="0" max="1000000" value={reserve} onChange={e => { setReserve(number(e.target.value)); setDraft(false); }} /></label><label className="check-label"><input type="checkbox" checked={updated} onChange={e => { setUpdated(e.target.checked); setDraft(false); }} /> Оновлений прайс v3</label></div><div className="bar-table-wrap"><table className="bar-table"><caption>Демонстраційні товари й ціни · змініть цільовий запас</caption><thead><tr><th>Товар</th><th>Є</th><th>Потрібно</th><th>Докупити</th><th>Ціна</th><th>Сума</th></tr></thead><tbody>{calculation.rows.map((item, i) => <tr key={item.name}><th>{item.name}<small>{item.unit}</small></th><td>{item.stock}</td><td><input aria-label={`Цільовий запас: ${item.name}`} type="number" min="0" max="10000" value={item.target} onChange={e => { setItems(items.map((row, ri) => ri === i ? { ...row, target: Math.floor(Math.min(10000, number(e.target.value))) } : row)); setDraft(false); }} /></td><td>{item.buy}</td><td>{money(item.unitPrice)}</td><td>{money(item.buy * item.unitPrice)}</td></tr>)}</tbody></table></div><div className="bar-summary"><div><span>Закупівля</span><strong data-testid="bar-total">{money(calculation.total)}</strong><small>{updated ? `Зміна прайсу: +${money(calculation.total - previous.total)}` : 'Попередній прайс v2 · для порівняння'}</small></div><div><span>Доступно після резерву</span><strong>{money(calculation.available)}</strong><small>Готівка мінус {money(reserve)} резерву</small></div><div className="bar-needed"><span>Потрібно надати</span><strong data-testid="bar-needed">{money(calculation.needed)}</strong><small>{calculation.reserveGap ? `Включно з ${money(calculation.reserveGap)} для поповнення резерву` : 'Резерв каси збережено'}</small></div></div><div className="bar-draft"><button className="primary-button" onClick={() => setDraft(true)}>Підготувати запит на кошти <span>↗</span></button>{draft && <p role="status">Чернетка: надати {money(calculation.needed)}. Закупівля {money(calculation.total)}, прайс {updated ? 'v3' : 'v2'}. Нічого не надіслано й не оплачено.</p>}</div><p className="footnote">Каса й залишки — введені демодані. Робочий сценарій потребує актуальної звірки, підтвердженого прайсу та рішення відповідальної людини.</p></div>;
}

function Creative() {
  return <div className="creative-space"><div><span className="eyebrow">КСЕНІЯ / АВТОРКА ПОВЕДІНКИ</span><h3>«Нехай світло<br />накопичує напругу».</h3><p>Це вже корисне технічне завдання. Визначаємо разом, що змінюється, який сигнал керує рухом і як виглядає правильний результат.</p><Link href="/light" className="primary-button">Відкрити світловий playground <span>↗</span></Link></div><div className="creative-score"><span className="micro">ІДЕЯ → ПРАВИЛО → ПОВЕДІНКА</span><div className="score-bars" aria-hidden="true">{[10, 18, 24, 34, 47, 64, 80, 92, 68, 41, 25, 13].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div><p>Більше енергії → ширший рух.<br />М’яке згасання → release 850 ms.</p><span className="micro">ЛЮДИНА ВИЗНАЧАЄ, ЩО ВИГЛЯДАЄ ПРАВИЛЬНО</span></div></div>;
}

export function TeamWorkspace() {
  const [role, setRole] = useState(0);
  return <div className="team-workspace"><div className="panel-heading"><Segmented label="Робочий простір за роллю" options={['Ксенія', 'Микола', 'Барменеджер']} value={role} onChange={setRole} /><DemoLabel>Інтерактивний макет · усі дані умовні</DemoLabel></div>{role === 0 ? <Creative /> : role === 1 ? <Pulse /> : <Bar />}</div>;
}
