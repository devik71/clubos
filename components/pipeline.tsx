'use client';

import { useEffect, useState } from 'react';
import { DemoLabel, Detail, Segmented, Waveform } from './ui';

export const stages = [
  ['Event timeline', 'Контекст уже є.', 'Хто, де й коли грає; які камери, master input, папка та контакт належать цьому сету. Зміни таймінгу оновлюють заплановані дії.'],
  ['Pre-flight', 'Перевірити до старту.', 'Сигнали камер, аудіо, OBS, вільний диск, синхронізація часу, шлях запису та метадані. Відсутній критичний вхід блокує готовність.'],
  ['Capture', 'Зберегти джерела.', 'Вчасно почати й закрити відео та RAW WAV. Перевірити, що файли реально записуються. Оригінали зберігаються незмінними.'],
  ['Live Director', 'Обрати наступний кадр.', 'Аналіз камер + аудіо + історія монтажу + правила + контекст. Рішення проходить технічну перевірку; людина завжди може втрутитися.'],
  ['Health Monitor', 'Помітити відмову.', 'Чорні та завмерлі кадри, зникнення сигналу, переповнення диска, дрейф синхронізації. Небезпечне джерело вилучається з пулу.'],
  ['Raw storage', 'Зафіксувати джерело правди.', 'Кожен файл має ідентифікатор, контрольну суму й зв’язок із подією та артистом. RAW не перезаписується.'],
  ['Sync', 'Одна шкала часу.', 'Timecode, часові мітки, кореляція аудіохвиль та маркери події. Невпевнене вирівнювання передається на перевірку.'],
  ['Auto edit', 'Підготувати монтаж.', 'Межі сету, валідні камери, правила тривалості кадрів. Монтаж — версія, яку можна відхилити, поправити або згенерувати знову.'],
  ['Audio master', 'Обробити копію.', 'Аналіз → gain staging → за потреби EQ → compression → limiting → loudness normalization. Збережений RAW дозволяє перебудувати master.'],
  ['Render', 'Зібрати результат.', 'Відтворюваний рендер із конкретних джерел, монтажної версії та аудіопрофілю. Помилка створює задачу на повтор, а не загублений файл.'],
  ['QC', 'Перевірити перед передачею.', 'Тривалість, чорні кадри, тиша, кліпінг, синхронізація й цілісність файлу. Сумнівний результат очікує людину.'],
  ['Upload', 'Дочекатися підтвердження.', 'Завантаження з повторними спробами та перевіркою результату. Посилання не вважається готовим, поки файл не доступний.'],
  ['Artist delivery', 'Не забути нікого.', 'Погоджений результат надходить за контактом артиста. Заборона публікації зупиняє передачу. Статус доставки записується.'],
  ['Archive', 'Залишити порядок.', 'Подія → артист → джерела → проєкт → master → доставка. Archivist додає новий матеріал у той самий індекс.'],
];

export function Pipeline() {
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setSelected(n => n < stages.length - 1 ? n + 1 : n), 1300);
    return () => clearInterval(timer);
  }, [playing]);
  useEffect(() => { if (selected === stages.length - 1) setPlaying(false); }, [selected]);
  return <div className="pipeline"><div className="panel-heading"><span>ВІД ПОДІЇ ДО АРХІВУ</span><button className="text-button" onClick={() => { if (selected === stages.length - 1) setSelected(0); setPlaying(!playing); }}>{playing ? 'Ⅱ Пауза' : '▷ Пройти шлях'}</button></div><div className="pipeline-nodes">{stages.map(([name], i) => <button key={name} className={`pipeline-node ${i === selected ? 'selected' : ''} ${i < selected ? 'passed' : ''}`} onClick={() => { setSelected(i); setPlaying(false); }} aria-pressed={i === selected}><span>{String(i + 1).padStart(2, '0')}</span><strong>{name}</strong><span aria-hidden="true">{i < selected ? '✓' : '↗'}</span></button>)}</div><div className="pipeline-description" role="status"><span className="large-index">{String(selected + 1).padStart(2, '0')}</span><div><h3>{stages[selected][1]}</h3><p>{stages[selected][2]}</p></div></div><p className="footnote">Натисніть на будь-який етап. Це концептуальний шлях; моніторинг і режисура працюють паралельно із записом.</p></div>;
}

const postSteps = [['03:00:00', 'Artist set end'], ['03:00:10', 'Recording closed'], ['03:00:18', 'Files validated'], ['03:01', 'Proxy ready'], ['03:02', 'Sync started'], ['03:06', 'Audio processing'], ['03:12', 'Edit generated'], ['03:18', 'QC passed'], ['03:20', 'Upload started'], ['READY', 'Artist delivery']];

export function AfterSet() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hold, setHold] = useState(false);
  const [preview, setPreview] = useState(false);
  const [version, setVersion] = useState(1);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setStep(n => Math.min(9, n + 1)), 700);
    return () => clearInterval(timer);
  }, [playing]);
  useEffect(() => { if (step === 9) setPlaying(false); }, [step]);
  const ready = step === 9 && !hold;
  return <div className="after-set"><div className="after-timeline"><div className="panel-heading"><span>ПІСЛЯ СЕТУ</span><button className="text-button" onClick={() => { if (step === 9) setStep(0); setPlaying(!playing); }}>{playing ? 'Ⅱ Пауза' : step === 9 ? '↺ Ще раз' : '▷ Завершити сет'}</button></div>{postSteps.map(([time, name], i) => <button className={`post-step ${i <= step ? 'complete' : ''}`} key={time} onClick={() => { setStep(i); setPlaying(false); }} aria-label={`Перейти: ${name}`}><span>{time}</span><i /><strong>{name}</strong><b>{i < step ? '✓' : i === step ? '←' : ''}</b></button>)}<p className="footnote">Час ілюстративний, анімація прискорена. Це не обіцянка швидкості обробки.</p></div><div className="delivery"><div className="delivery-top"><span>ARTIST DELIVERY</span><DemoLabel>DEMO</DemoLabel></div><div className={`delivery-card ${ready ? 'ready' : ''}`}><div className="delivery-symbol" aria-hidden="true">{ready ? '↗' : hold && step === 9 ? 'Ⅱ' : '↳'}</div><span className="eyebrow">BRUKXT / ARTIST A</span><h3>{ready ? 'Ваш сет готовий.' : hold && step === 9 ? 'Очікує вашого рішення.' : 'Сет закінчився. Система працює.'}</h3><p>{ready ? 'Запис, до якого не довелося нагадувати. Перегляд, завантаження й місце в архіві.' : hold && step === 9 ? 'Публікацію та доставку призупинено. Без вашого дозволу артист нічого не отримає.' : postSteps[step][1] + ' · жоден артист не губиться між етапами.'}</p><div className="button-row"><button className="primary-button" disabled={!ready} onClick={() => setPreview(!preview)}>{preview ? 'Закрити прев’ю' : 'Watch demo'} <span>↗</span></button><a className={`outline-button ${!ready ? 'disabled' : ''}`} aria-disabled={!ready} tabIndex={ready ? 0 : -1} href={ready ? '/demo-manifest.txt' : undefined} download>Demo manifest ↓</a></div>{preview && ready && <div className="delivery-preview"><Waveform /><p>ARTIST A / MASTER v{version}</p><span>Макет перегляду. Реального відеофайлу немає.</span></div>}</div><div className="delivery-controls"><label className="check-label"><input type="checkbox" checked={hold} onChange={e => setHold(e.target.checked)} /> Не публікувати й не надсилати</label><button className="text-button" onClick={() => { setVersion(v => v + 1); setStep(6); setPlaying(false); setPreview(false); }}>Відхилити монтаж → нова версія</button><span className="micro">EDIT v{version} · {hold ? 'PUBLICATION HOLD' : 'REVIEW POLICY APPLIED'}</span></div></div></div>;
}

export function MediaTimeline() {
  const [position, setPosition] = useState(35);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setPosition(p => p >= 100 ? 0 : p + .5), 100);
    return () => clearInterval(timer);
  }, [playing]);
  return <div className="media-timeline"><div className="panel-heading"><span>ONE MEDIA TIMELINE</span><button className="text-button" onClick={() => setPlaying(!playing)}>{playing ? 'Ⅱ Пауза' : '▷ Відтворити'}</button></div><div className="timeline-ruler"><span>02:00</span><span>03:00</span><span>04:00</span><span>05:00</span></div><div className="timeline-tracks"><div className="playhead" style={{ left: `calc(74px + (100% - 74px) * ${position / 100})` }} />{['CAM A', 'CAM B', 'CAM C', 'AUDIO'].map((name, i) => <div className="timeline-track" key={name}><span>{name}</span><div className={`track-media track-${i}`}><Waveform seed={i + 1} /></div></div>)}<div className="timeline-track event-track"><span>EVENT</span><div><b>Artist A</b><b>Artist B</b><b>Artist C</b></div></div></div><input type="range" min="0" max="100" step=".5" value={position} onChange={e => { setPosition(Number(e.target.value)); setPlaying(false); }} aria-label="Позиція на спільному медіатаймлайні" /><p className="footnote">Timecode → timestamps → audio correlation → event markers → fallback alignment. Результат — машинозчитуваний таймлайн; низька впевненість потребує перевірки.</p></div>;
}

export function AudioPipeline() {
  const [mode, setMode] = useState(0);
  return <div className="audio-panel"><div className="panel-heading"><span>AUDIO / NON-DESTRUCTIVE</span><Segmented label="Аудіоверсія" options={['RAW', 'MASTER']} value={mode} onChange={setMode} /></div><div className="audio-wave"><Waveform seed={5} className={mode ? 'mastered' : ''} /></div><div className="audio-caption"><strong>{mode ? 'MASTER / VERSION 01' : 'RAW WAV / IMMUTABLE'}</strong><span>{mode ? 'Оброблену версію можна перебудувати.' : 'Джерело збережене. Завжди.'}</span></div><div className="audio-chain">{['Master input', 'Raw WAV', 'Analysis', 'Gain', 'EQ*', 'Compression', 'Limiter', 'Loudness', 'Master'].map((s, i) => <span key={s} className={mode || i < 2 ? 'active' : ''}>{s}</span>)}</div><p className="footnote">* Коригувальний EQ — лише за потреби. Схематичні хвилі, без відтворення аудіо.</p></div>;
}

export function Archive({ locale = 'uk' }: { locale?: 'uk' | 'en' }) {
  const en = locale === 'en';
  const [phase, setPhase] = useState(0);
  const [indexed, setIndexed] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [applied, setApplied] = useState(false);
  const files = ['final_FINAL_2.mp4', 'GH010492.MP4', 'BRUKXT_set.wav', 'Untitled_04.prproj', 'export_old.mp4', '20250412_B.mov', 'copy (2).mp4'];
  const copy = en ? {
    label: 'Archive workflow phases', source: indexed ? 'INDEX / SOURCES UNCHANGED' : 'YEARS OF MATERIAL', phase: ['UNDERSTAND FIRST', 'VERIFY NEXT', 'ORGANIZE LAST'], heading: ['Order starts with an index.', 'Uncertainty is a reason to ask.', 'A plan becomes structure.'], body: ['Folders, metadata, time, video, audio, projects, renders, and event history. The system finds connections while preserving originals.', 'A possible duplicate is not a disposable file. Check its relation to an event and artist; keep unknown material separate.', 'After verification comes controlled reorganization. Archivist keeps new recordings organized from then on.'], action: [indexed ? '✓ Index built' : 'Build sample index ↗', reviewed ? '✓ Links verified' : indexed ? 'Confirm links; preserve unknown material' : 'Build the index first', applied ? '✓ Sample plan applied' : reviewed ? 'Apply sample plan ↗' : 'Verify links first'], tree: [applied ? 'Reorganized in this simulation. Unknown material is preserved.' : reviewed ? 'Links verified. Unknown material is never deleted.' : 'Proposed structure · waiting for review'], footer: 'No silent deletions. No accidental renames.'
  } : {
    label: 'Фази роботи з архівом', source: indexed ? 'ІНДЕКС / ДЖЕРЕЛА НЕ ЗМІНЕНІ' : 'РОКИ МАТЕРІАЛІВ', phase: ['СПОЧАТКУ ЗРОЗУМІТИ', 'ПОТІМ ПЕРЕВІРИТИ', 'ЛИШЕ ТОДІ ВПОРЯДКУВАТИ'], heading: ['Порядок починається з індексу.', 'Сумнів — привід запитати.', 'План стає структурою.'], body: ['Папки, метадані, час, відео, аудіо, проєкти, рендери та історія подій. Система шукає зв’язки, зберігаючи оригінали.', 'Можливий дублікат не означає зайвий файл. Перевіряємо прив’язку до події та артиста. Невідоме зберігається окремо.', 'Після перевірки — контрольована реорганізація. Для нових записів Archivist підтримує порядок постійно.'], action: [indexed ? '✓ Індекс побудовано' : 'Побудувати демо-індекс ↗', reviewed ? '✓ Зв’язки перевірено' : indexed ? 'Підтвердити зв’язки; зберегти невідоме' : 'Спочатку побудуйте індекс', applied ? '✓ Демо-план застосовано' : reviewed ? 'Застосувати демо-план ↗' : 'Спочатку перевірте зв’язки'], tree: [applied ? 'Реорганізовано в симуляції. Невідоме збережено.' : reviewed ? 'Зв’язки підтверджено. Невідоме не видаляється.' : 'Запропонована структура · очікує перевірки'], footer: 'Жодних тихих видалень. Жодних випадкових перейменувань.'
  };
  return <div className="archive"><div className="panel-heading"><span>GARBAGE GENIE / ARCHIVIST</span><DemoLabel>{en ? 'Interactive simulation · sample data' : undefined}</DemoLabel></div><Segmented label={copy.label} options={['01 Index', '02 Verify', '03 Reorganize']} value={phase} onChange={setPhase} /><div className="archive-body"><div className={`archive-files ${indexed ? 'indexed' : ''}`}><span className="micro">{copy.source}</span>{files.map((name, i) => <div key={name}><span className="file-icon">{i === 3 ? '↳' : '▤'}</span><span>{name}</span><small>{indexed ? i === 6 ? '? DUPLICATE' : 'INDEXED' : '—'}</small></div>)}</div><div className="archive-result"><span className="micro">{copy.phase[phase]}</span><h3>{copy.heading[phase]}</h3><p>{copy.body[phase]}</p>{phase === 0 ? <button className="primary-button" onClick={() => setIndexed(true)}>{copy.action[0]}</button> : phase === 1 ? <button className="primary-button" disabled={!indexed} onClick={() => setReviewed(true)}>{copy.action[1]}</button> : <button className="primary-button" disabled={!reviewed} onClick={() => setApplied(true)}>{copy.action[2]}</button>}{indexed && <div className="archive-tree" role="status"><strong>BRUKXT / 2025-04-12</strong><span>├ Artist A</span><small>│　CAM_A · CAM_B · AUDIO_RAW<br />│　PROJECT · MASTER</small><span>├ Artist B</span><span>└ Needs review / copy (2).mp4</span><b>{copy.tree[0]}</b></div>}</div></div><div className="archive-bottom">{copy.footer}<span>INDEX → VERIFY → REORGANIZE</span></div></div>;
}

const crew = [
  ['Camera Operators', 'Стежать за кожним відеоджерелом: доступність, рух, експозиція, якість. Віддають спостереження, а не керують ефіром.'],
  ['Director', 'Пропонує наступну камеру з доступного пулу. Враховує кадр, музику, контекст і правила монтажу.'],
  ['Audio Monitor', 'Контролює master input, тишу, кліпінг і стан RAW-запису.'],
  ['Technical Judge', 'Перевіряє кожне рішення режисера: джерело доступне, не виключене людиною, не порушує інваріанти.'],
  ['Health Monitor', 'Помічає black / frozen frames, втрату сигналу, диск і sync drift. Публікує стан системи.'],
  ['Recovery Handler', 'Виконує обмежені спроби відновлення, перевіряє результат і кличе людину після невдачі.'],
  ['Archivist', 'Пов’язує події, артистів і файли. Індексує історичний хаос і підтримує новий архів.'],
  ['QC Agent', 'Перевіряє готовий результат. Сумнівний рендер не проходить у доставку автоматично.'],
  ['Human Supervisor', 'Бачить стан і пояснення, задає правила, змінює таймінг, відхиляє монтаж і може перебрати керування на будь-якому рівні.'],
];

export function Crew() {
  const [selected, setSelected] = useState(8);
  return <div className="crew"><div className="crew-nodes">{crew.map(([name], i) => <button key={name} className={`${i === 8 ? 'supervisor' : ''} ${selected === i ? 'selected' : ''}`} aria-pressed={selected === i} onClick={() => setSelected(i)}><span>{i === 8 ? '◎' : String(i + 1).padStart(2, '0')}</span>{name}<span>↗</span></button>)}</div><div className="crew-description"><span className="eyebrow">СПІЛЬНИЙ СТАН + ЖУРНАЛ ПОДІЙ</span><h3>{crew[selected][0]}</h3><p>{crew[selected][1]}</p><span className="micro">Роль ≠ окрема велика мовна модель</span></div></div>;
}

export function Fallback() {
  const [level, setLevel] = useState(0);
  const names = ['AI Director', 'Rule-based Director', 'Safe camera', 'Human intervention'];
  return <div className="fallback"><div className="fallback-levels">{names.map((name, i) => <button key={name} className={i === level ? 'selected' : i < level ? 'unavailable' : ''} onClick={() => setLevel(i)}><span>0{i + 1}</span><strong>{name}</strong><small>{i < level ? 'UNAVAILABLE' : i === level ? 'ACTIVE' : 'STANDBY'}</small></button>)}</div><div className="fallback-copy"><p>{['AI пропонує. Локальні правила перевіряють. Модель не має прямого доступу до OBS.', 'Зовнішній AI зник. Локальні правила продовжують режисуру.', 'Режисура недоступна. Тримаємо перевірену безпечну камеру.', 'Безпечної камери немає. Викликаємо людину; не обіцяємо ефір без справного джерела.'][level]}</p><button className="text-button" onClick={() => setLevel(l => (l + 1) % 4)}>{level === 3 ? '↺ Відновити всі рівні' : 'Вимкнути поточний рівень →'}</button></div></div>;
}
