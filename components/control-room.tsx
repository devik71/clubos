'use client';

import { useEffect, useReducer, useState } from 'react';
import { engineReducer, initialEngine, available, formatTime, type Camera } from '../lib/engine';
import { DemoLabel, Detail, Segmented, Waveform } from './ui';

const cameras: Camera[] = ['A', 'B', 'C'];

function CameraScene({ camera, frozen = false }: { camera: Camera; frozen?: boolean }) {
  return <div className={`camera-scene scene-${camera} ${frozen ? 'frozen' : ''}`} aria-hidden="true">
    <div className="stage-lines" /><div className="stage-light light-one" /><div className="stage-light light-two" />
    <div className="booth"><div className="performer"><i /><b /></div><div className="decks"><i /><i /></div></div>
    <div className="audience">{Array.from({ length: 13 }, (_, i) => <i key={i} style={{ '--person': i } as React.CSSProperties} />)}</div>
    <span className="frame-cross top-left" /><span className="frame-cross bottom-right" />
  </div>;
}

export function ControlRoom() {
  const [state, dispatch] = useReducer(engineReducer, initialEngine);
  const [persistent, setPersistent] = useState(false);
  const [delay, setDelay] = useState(false);
  const [stream, setStream] = useState(true);
  useEffect(() => {
    const timer = setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => clearInterval(timer);
  }, []);
  const incidentActive = state.incident >= 0 && state.incident < 8;
  const failed = state.incident === 8 && state.failRecovery;
  const status = incidentActive ? 'Відновлення CAM B' : failed ? 'Потрібна людина · CAM B' : 'Система під наглядом';
  return <div className="control-room">
    <div className="console-top"><div><span className="console-title">LIVE CONTROL</span><span className="muted"> BRUKXT / Artist A</span></div><DemoLabel /></div>
    <div className="console-toolbar"><span className="status"><span className="dot" />{status}</span><div className="toolbar-actions"><span className="timecode">{formatTime(state.clock)}</span><button className="icon-button" onClick={() => dispatch({ type: 'pause' })} aria-label={state.running ? 'Призупинити симуляцію' : 'Продовжити симуляцію'}>{state.running ? 'Ⅱ' : '▷'}</button><button className="text-button" onClick={() => { dispatch({ type: 'reset' }); setStream(true); setDelay(false); }}>Скинути ↺</button></div></div>
    <div className="multiview">{cameras.map((camera, i) => {
      const ready = available(state, camera);
      const isProgram = state.program === camera;
      return <div key={camera} className={`camera ${isProgram ? 'on-air' : ''} ${!ready ? 'unavailable' : ''}`}>
        <div className="camera-top"><span>CAM {camera}</span><span>{!ready ? 'OUT OF POOL' : isProgram ? '● PROGRAM' : 'PREVIEW'}</span></div>
        <div className="camera-picture"><CameraScene camera={camera} frozen={!ready || !state.running} />{!ready && <div className="camera-overlay"><span>∥</span>{state.excluded.includes(camera) ? 'Заміна батареї' : failed ? 'Джерело недоступне' : 'Сигнал завмер'}</div>}<span className="camera-caption">{['DJ CLOSE', 'WIDE', 'CROWD'][i]}</span></div>
        <div className="camera-data"><span>{state.excluded.includes(camera) ? 'MANUAL EXCLUDE' : !ready ? 'RECOVERY' : state.mode === 'manual' && isProgram ? 'MANUAL LOCK' : 'AUTO'}</span><span>Q {ready ? [96, 91, 89][i] : '—'}% <span className="muted">/ M {ready ? [42, 31, 78][i] : '—'}%</span></span></div>
      </div>;
    })}</div>
    <div className="director-strip"><div><span className="micro">MUSIC / DEMO</span><Waveform seed={3} /><span className="micro">ENERGY 82% · SECTION DROP</span></div><div><span className="micro">PROGRAM</span><strong data-testid="program">CAM {state.program}</strong><span className="micro">SHOT AGE {state.shotAge.toFixed(1)}s</span></div><div className="decision"><span className="micro">{state.mode === 'manual' ? 'HUMAN DECISION' : 'DIRECTOR REASONING'}</span><p>{state.mode === 'manual' ? 'Кадр обираєте ви. Автоматичні перемикання зупинені.' : incidentActive || failed ? 'CAM B відхилено. Безпечне джерело має пріоритет над творчим рішенням.' : 'Музична фраза + тривалість кадру. Technical Judge перевіряє доступність джерела.'}</p><span className="micro">{state.mode === 'manual' ? 'HEALTH MONITOR STILL ACTIVE' : 'PROPOSAL → SAFETY CHECK → CUT'}</span></div></div>
    <div className="human-controls"><div><span className="micro">ВИ ЗАВЖДИ МАЄТЕ ОСТАННЄ СЛОВО</span><div className="button-row">{cameras.map(camera => <button key={camera} disabled={!available(state, camera)} onClick={() => dispatch({ type: 'force', camera })} aria-pressed={state.mode === 'manual' && state.program === camera}>Force {camera}</button>)}<button onClick={() => dispatch({ type: 'lock' })}>Lock scene</button></div></div><Segmented label="Режим режисера" options={['AUTO', 'MANUAL']} value={state.mode === 'auto' ? 0 : 1} onChange={n => dispatch({ type: n === 0 ? 'auto' : 'lock' })} /></div>
    <div className="incident-demo"><div className="incident-intro"><span className="micro">СПРОБУЙТЕ ЗЛАМАТИ</span><h3>Камера зникла.<br />Ефір залишився.</h3><p>Відмова — частина сценарію. Спробуйте обидва варіанти.</p><label className="check-label"><input type="checkbox" checked={persistent} onChange={e => setPersistent(e.target.checked)} /> Відновлення не вдається</label><button className="inverse-button" disabled={incidentActive} onClick={() => dispatch({ type: 'fail', persistent })}>Вивести CAM B з ладу <span>↗</span></button><p className="micro">{incidentActive ? 'СЦЕНАРІЙ ТРИВАЄ · РУЧНИЙ КОНТРОЛЬ ДОСТУПНИЙ' : 'FAIL CAM B · БЕЗПЕЧНА СИМУЛЯЦІЯ'}</p></div><div className="event-log"><div className="log-heading"><span>EVENT LOG</span><span>{!stream ? 'STREAM STOPPED BY HUMAN' : 'PROGRAM SAFE'}</span></div><div className="log-entries" role="log" aria-label="Журнал рішень" aria-live="off">{state.logs.map((entry, i) => <div key={`${entry}-${i}`} className={i === 0 ? 'latest' : ''}><span>{entry.slice(0, 8)}</span><p>{entry.slice(11)}</p></div>)}</div><div className="log-foot" role="status">{failed ? 'CAM B недоступна. Ефір у безпеці. Людину повідомлено.' : state.incident === 8 ? 'Відновлено й перевірено. Вплив на ефір у цьому сценарії: 0 с.' : incidentActive ? 'Джерело виключене. Відновлення під контролем.' : 'Кожне рішення можна пояснити й перевірити.'}</div></div></div>
    <Detail title="Ще більше людського контролю"><div className="override-grid"><div><h4>Фізична робота</h4><p>Виключена камера не повернеться в пул без вашої команди, навіть після відновлення сигналу.</p><button aria-pressed={state.excluded.includes('B')} onClick={() => dispatch({ type: 'exclude', camera: 'B' })}>{state.excluded.includes('B') ? 'Повернути CAM B' : 'CAM B: міняю батарею'}</button></div><div><h4>Таймінг і запис</h4><p>{delay ? 'Початок перенесено на 5 хв. Розклад запису очікує нового часу.' : 'Artist A · 02:00–03:00. План запису слідує за таймлайном.'}</p><button aria-pressed={delay} onClick={() => setDelay(!delay)}>{delay ? 'Відновити таймінг' : 'Відкласти запис на 5 хв'}</button></div><div><h4>Ефір</h4><p>{stream ? 'Демо-ефір працює. Health Monitor залишається активним.' : 'Ефір зупинено вручну. Сигнали камер продовжують перевірятись.'}</p><button onClick={() => setStream(!stream)}>{stream ? 'Зупинити демо-ефір' : 'Відновити демо-ефір'}</button></div></div></Detail>
  </div>;
}

const checks = [['Camera A', 'ONLINE'], ['Camera B', 'ONLINE'], ['Camera C', 'ONLINE'], ['Audio', 'PRESENT'], ['OBS', 'READY'], ['Storage', '3.8 TB FREE'], ['Time sync', 'OK'], ['Stream', 'READY'], ['Recording path', 'VALID'], ['Artist metadata', 'FOUND'], ['Delivery contact', 'FOUND']];

export function Preflight() {
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setProgress(p => Math.min(checks.length, p + 1)), 180);
    return () => clearInterval(timer);
  }, [running]);
  useEffect(() => { if (progress === checks.length) setRunning(false); }, [progress]);
  const done = progress === checks.length;
  return <div className="preflight"><div className="preflight-copy"><span className="eyebrow">ДО ПЕРШОГО КАДРУ</span><h3>Проблему краще<br />знайти до сету.</h3><p>ClubOS передає артиста, сцену, час і контакт. Media Engine перевіряє, чи все готове до запису.</p><button className="primary-button" onClick={() => { setProgress(0); setRunning(true); }}>{running ? 'Почати перевірку знову ↺' : done ? 'Перевірити ще раз ↺' : 'Запустити pre-flight ↗'}</button><label className="check-label"><input type="checkbox" checked={missing} onChange={e => { setMissing(e.target.checked); setProgress(0); setRunning(false); }} /> Спробувати без master audio</label></div><div className="check-panel"><div className="panel-heading"><span>PRE-FLIGHT / ARTIST A</span><DemoLabel>DEMO</DemoLabel></div><div className="check-grid">{checks.map(([name, value], i) => <div key={name} className={i < progress ? 'checked' : ''}><span>{name}</span><b>{i < progress ? missing && i === 3 ? '× MISSING' : `✓ ${value}` : '—'}</b></div>)}</div><div className="check-result" role="status">{done ? missing ? 'NOT READY · перевірте master input' : '✓ MEDIA READY' : running ? 'Перевіряємо сигнали та контекст…' : 'Готовність — це перевірка, а не припущення.'}</div></div></div>;
}
