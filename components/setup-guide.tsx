'use client';

import { useEffect, useRef, useState } from 'react';
import { getGuideSteps, osNames, sources, toolNames, type SetupOS, type SetupTool } from '../lib/setup-guide';

type Progress = { step: number; done: number[] };
type Saved = { os: SetupOS; tool: SetupTool; routes: Record<string, Progress> };
const storageKey = 'clubos-setup-v1';
const empty: Saved = { os: 'windows', tool: 'claude', routes: {} };

function CopyBlock({ text, label = 'Команда для термінала' }: { text: string; label?: string }) {
  const [message, setMessage] = useState('');
  useEffect(() => { setMessage(''); }, [text]);
  async function copy() {
    try { await navigator.clipboard.writeText(text); setMessage('Скопійовано'); }
    catch { setMessage('Виділи текст нижче та скопіюй вручну.'); }
  }
  return <div className="setup-command"><div><span>{label}</span><button onClick={copy}>Скопіювати</button></div><pre tabIndex={0}>{text}</pre><span className="setup-copy-status" role="status">{message}</span></div>;
}

export default function SetupGuide() {
  const [saved, setSaved] = useState<Saved>(empty);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const interacted = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const candidate = JSON.parse(raw);
        if (candidate && ['windows', 'mac'].includes(candidate.os) && ['claude', 'codex'].includes(candidate.tool)) {
          const routes: Record<string, Progress> = {};
          for (const os of ['windows', 'mac'] as const) for (const tool of ['claude', 'codex'] as const) {
            const key = `${os}-${tool}`;
            const value = candidate.routes?.[key];
            const count = getGuideSteps(os, tool).length;
            if (value && Number.isInteger(value.step) && Array.isArray(value.done)) {
              routes[key] = { step: Math.max(0, Math.min(count, value.step)), done: [...new Set<number>(value.done.filter((n: unknown) => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n < count))] };
            }
          }
          setSaved({ os: candidate.os, tool: candidate.tool, routes });
        }
      }
    } catch { setStorageError(true); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(storageKey, JSON.stringify(saved)); }
    catch { setStorageError(true); }
  }, [saved, ready]);

  const { os, tool } = saved;
  const route = `${os}-${tool}`;
  const steps = getGuideSteps(os, tool);
  const progress = saved.routes[route] ?? { step: 0, done: [] };
  const current = steps[progress.step];
  const complete = progress.done.length === steps.length;
  const percent = Math.round(progress.done.length / steps.length * 100);

  useEffect(() => {
    setShowHelp(false);
    if (interacted.current) {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }, [route, progress.step]);

  function go(step: number, confirm = false) {
    interacted.current = true;
    setSaved(previous => ({ ...previous, routes: { ...previous.routes, [route]: {
      step, done: confirm ? [...new Set([...progress.done, progress.step])] : progress.done,
    } } }));
  }

  function choose(nextOS: SetupOS, nextTool: SetupTool) {
    interacted.current = true;
    setSaved(previous => ({ ...previous, os: nextOS, tool: nextTool }));
  }

  const report = `Мій перший запуск / ClubOS\nСистема: ${osNames[os]}\nІнструмент: ${toolNames[tool]}\nПідтверджено кроків: ${progress.done.length}/${steps.length}\n${complete ? 'Готово: встановлення, вхід і сторінку hello.html перевірено мною.' : `Зараз: ${current?.title ?? 'підсумок — є непідтверджені кроки'}.`}\nНаступний крок: ${complete ? 'показати сторінку команді та обрати маленьку задачу.' : 'описати, що бачу, й завершити перевірку.'}`;
  const helpReport = `Потрібна допомога / ClubOS\nСистема: ${osNames[os]}\nІнструмент: ${toolNames[tool]}\nКрок: ${current?.title ?? 'Підсумок'}\nЩо зробив/зробила: …\nОчікував/очікувала: ${current?.expected ?? 'Завершити встановлення'}\nНасправді бачу: …\nТекст помилки (без паролів, ключів і кодів входу): …`;

  return <div className="setup-wrap">
    <div className="setup-intro"><div><span className="setup-eyebrow">CLUBOS / ПРАКТИКА 01</span><h1>Твій перший<br /><span>запуск агента.</span></h1><p>Від порожнього термінала до власної сторінки.<br />Один крок, одна дія, видимий результат.</p></div><div className="setup-intro-note"><span>ДЛЯ ПЕРШОГО ЗАНЯТТЯ</span><strong>Почнемо<br />з твого комп’ютера.</strong><p>Знання коду не потрібне. Знадобляться інтернет, акаунт із доступом та трохи часу на встановлення.</p></div></div>

    <div className="setup-choices">
      <fieldset disabled={!ready}><legend>01 / Твоя система</legend><div>{(['windows', 'mac'] as const).map(value => <button key={value} aria-pressed={os === value} onClick={() => choose(value, tool)}>{osNames[value]} <span>{os === value ? '✓' : '+'}</span></button>)}</div></fieldset>
      <fieldset disabled={!ready}><legend>02 / Твій інструмент</legend><div>{(['claude', 'codex'] as const).map(value => <button key={value} aria-pressed={tool === value} onClick={() => choose(os, value)}>{toolNames[value]} <span>{tool === value ? '✓' : '+'}</span></button>)}</div></fieldset>
      <p>Хочеш обидва? Пройди один, потім перемкни інструмент. Прогрес кожного маршруту зберігається окремо.</p>
    </div>

    <div className="setup-layout">
      <aside className="setup-sidebar"><div className="setup-progress-label"><span>ТВІЙ МАРШРУТ</span><strong>{progress.done.length} / {steps.length}</strong></div><progress aria-label="Підтверджені кроки" value={progress.done.length} max={steps.length} /><nav aria-label="Кроки встановлення">{steps.map((step, index) => <button disabled={!ready} key={step.title} aria-current={progress.step === index ? 'step' : undefined} onClick={() => go(index)}><span>{progress.done.includes(index) ? '✓' : String(index + 1).padStart(2, '0')}</span>{step.title}</button>)}<button disabled={!ready} aria-current={!current ? 'step' : undefined} onClick={() => go(steps.length)}><span>↗</span>Підсумок</button></nav><p>{storageError ? 'Браузер не дозволяє зберігати прогрес. У цій вкладці все працює, але після оновлення позначки можуть зникнути.' : 'Прогрес зберігається лише в цьому браузері.'}</p><p>Ти підтверджуєш результат самостійно. Сайт не перевіряє твій комп’ютер.</p><details><summary>Почати маршрут заново</summary><p>Скинуться лише позначки цього маршруту. Встановлені програми та файли залишаться.</p><button className="setup-reset" onClick={() => { interacted.current = true; setSaved(previous => ({ ...previous, routes: { ...previous.routes, [route]: { step: 0, done: [] } } })); }}>Скинути позначки</button></details></aside>

      <section className="setup-card" aria-busy={!ready}>
        {!ready ? <p>Відновлюємо твій маршрут…</p> : current ? <>
          <div className="setup-card-meta"><span>{osNames[os]} / {toolNames[tool]}</span><span>КРОК {String(progress.step + 1).padStart(2, '0')}</span></div>
          <h2 ref={heading} tabIndex={-1}>{current.title}</h2><p className="setup-why">{current.why}</p>
          <ol className="setup-actions">{current.actions.map(action => <li key={action}>{action}</li>)}</ol>
          {current.link && <a className="setup-source-link" href={current.link.href} target="_blank" rel="noreferrer">{current.link.title}</a>}
          {current.command && <CopyBlock text={current.command} label={current.prompt ? 'Промпт — встав у поле агента' : `Команда — встав у ${os === 'windows' ? 'PowerShell' : 'Terminal'}`} />}
          <div className="setup-expected"><span>✓</span><div><strong>Що має вийти</strong><p>{current.expected}</p></div></div>
          <div className="setup-navigation"><button className="setup-next" onClick={() => go(progress.step + 1, true)}>{progress.done.includes(progress.step) ? 'Підтверджено · Далі' : 'Вийшло · Підтвердити'} <span>→</span></button><button className="setup-help-toggle" aria-expanded={showHelp} aria-controls="setup-help" onClick={() => setShowHelp(value => !value)}>У мене інший результат {showHelp ? '−' : '+'}</button></div>
          {showHelp && <div className="setup-help" id="setup-help"><h3>Знайдемо, де ти застряг.</h3>{current.help.map(item => <details key={item.title}><summary>{item.title}</summary><p>{item.text}</p></details>)}<details><summary>Потрібна допомога Віктора</summary><p>Скопіюй шаблон, допиши фактичний результат і надішли у канал допомоги вашого Discord. Прибери з повідомлення та скриншота паролі, ключі й коди входу.</p><CopyBlock text={helpReport} label="Повідомлення для Discord" /></details></div>}
          <div className="setup-bottom"><button disabled={progress.step === 0} onClick={() => go(progress.step - 1)}>← Назад</button><button onClick={() => go(progress.step + 1)}>Переглянути далі без підтвердження →</button></div>
        </> : <>
          <div className="setup-card-meta"><span>ТВІЙ РЕЗУЛЬТАТ</span><span>{percent}%</span></div><h2 ref={heading} tabIndex={-1}>{complete ? 'Перший запуск — є.' : 'Залишилось перевірити.'}</h2><p className="setup-why">{complete ? 'Ти встановив інструмент, увійшов і відкрив створену ним сторінку. Тепер є з чого почати спільну розробку.' : 'Перегляд кроку не означає виконання. Повернись до непідтверджених кроків і перевір результат.'}</p>
          {!complete && <div className="setup-missing">{steps.map((step, index) => !progress.done.includes(index) && <button key={index} onClick={() => go(index)}>{String(index + 1).padStart(2, '0')} / {step.title} →</button>)}</div>}
          <CopyBlock text={report} label="Твій звіт для Discord" />
          <p className="setup-summary-note">Скопіюй звіт і надішли його в канал прогресу. Якщо сторінка готова — додай скриншот. Сайт нічого не надсилає автоматично.</p>
          <button className="setup-next" onClick={() => choose(os, tool === 'claude' ? 'codex' : 'claude')}>Перейти до {tool === 'claude' ? 'Codex CLI' : 'Claude Code'} →</button>
          <div className="setup-next-lesson"><span className="setup-eyebrow">ДАЛІ НА ЗАНЯТТІ</span><h3>Від першого файлу до командної задачі.</h3><p>Редактор коду, Node.js для запуску проєкту, історія змін у Git і маленька функція для твого напряму.</p><a href="/team#start-together">Подивитися перші задачі ↗</a></div>
        </>}
      </section>
    </div>
    <footer className="setup-sources"><span>Джерела перевірено 20.09.2026 · Команди й умови доступу можуть оновлюватися.</span><div><a href={sources.claude} target="_blank" rel="noreferrer">Claude Code: встановлення ↗</a><a href={sources.auth} target="_blank" rel="noreferrer">Claude: вхід ↗</a><a href={sources.codex} target="_blank" rel="noreferrer">Codex CLI ↗</a><a href={sources.codexWindows} target="_blank" rel="noreferrer">Codex: Windows installer ↗</a></div></footer>
  </div>;
}
