'use client';

import { useEffect, useState } from 'react';
import { DemoLabel, Segmented, Waveform } from './ui';

export function LightPlayground({ locale = 'uk' }: { locale?: 'uk' | 'en' }) {
  const en = locale === 'en';
  const [energy, setEnergy] = useState(64);
  const [threshold, setThreshold] = useState(20);
  const [release, setRelease] = useState(420);
  const [spread, setSpread] = useState(55);
  const [playing, setPlaying] = useState(false);
  const [blackout, setBlackout] = useState(false);
  const [preset, setPreset] = useState(0);
  const output = blackout ? 0 : Math.max(0, (energy - threshold) / (100 - threshold));
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const timer = setInterval(() => { frame++; setEnergy(Math.round(48 + Math.sin(frame * .19) * 29 + Math.sin(frame * .37) * 9)); }, 150);
    return () => clearInterval(timer);
  }, [playing]);
  function changePreset(n: number) {
    setPreset(n); setPlaying(false); setBlackout(false);
    setEnergy([64, 82, 28][n]); setThreshold([20, 10, 35][n]); setRelease([420, 850, 1200][n]); setSpread([55, 88, 22][n]);
  }
  return <div className="light-playground"><div className="light-stage"><div className="light-stage-top"><span>STAGE / PREVIEW</span><DemoLabel>{en ? 'Schematic light · demo signal' : 'Схематичне світло · демосигнал'}</DemoLabel></div><svg viewBox="0 0 800 440" role="img" aria-label={en ? `Lighting composition: output ${Math.round(output * 100)} percent` : `Світлова композиція: вихід ${Math.round(output * 100)} відсотків`}>
    <defs><linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="white" stopOpacity=".64" /><stop offset="100%" stopColor="white" stopOpacity="0" /></linearGradient><radialGradient id="floor"><stop stopColor="white" stopOpacity=".2" /><stop offset="100%" stopColor="white" stopOpacity="0" /></radialGradient></defs>
    <path d="M 70 74 H 730 M 70 79 H 730" fill="none" stroke="#444" strokeWidth="1" />
    {[130, 238, 346, 454, 562, 670].map((x, i) => <g key={x}><path d={`M ${x - 5} 92 L ${x - 35 - spread * .75 + (i - 2.5) * spread * .25} 391 L ${x + 35 + spread * .75 + (i - 2.5) * spread * .25} 391 L ${x + 5} 92 Z`} fill="url(#beam)" opacity={output * (.5 + i % 2 * .25)} style={{ transition: `opacity ${release}ms ease-out, d 400ms ease-out` }} /><rect x={x - 9} y="77" width="18" height="14" rx="3" fill="#888" /><rect x={x - 5} y="89" width="10" height="3" fill="#eee" opacity={.15 + output * .85} /></g>)}
    <ellipse cx="400" cy="385" rx={190 + spread * 1.4} ry="34" fill="url(#floor)" opacity={output} /><path d="M 65 387 H 735" stroke="#333" /><rect x="310" y="322" width="180" height="65" fill="#171717" stroke="#555" strokeWidth=".7" /><path d="M 330 323 L 340 316 H 455 L 470 323" fill="#333" /><circle cx="400" cy="281" r="10" fill="#333" /><path d="M 378 318 Q 377 295 400 295 Q 423 295 422 318" fill="#303030" />
  </svg><div className="light-stage-bottom"><span>{blackout ? 'MANUAL BLACKOUT' : 'LOW → GROUP A / DIMMER'}</span><span>OUTPUT {Math.round(output * 100)}%</span></div></div><div className="light-controls"><div className="panel-heading"><span>{en ? 'PEOPLE CHOOSE THE BEHAVIOR' : 'ПОВЕДІНКУ ОБИРАЄ ЛЮДИНА'}</span><button className="text-button" onClick={() => setPlaying(!playing)}>{playing ? (en ? 'Ⅱ Stop signal' : 'Ⅱ Зупинити сигнал') : (en ? '▷ Demo signal' : '▷ Демо-сигнал')}</button></div><Segmented label={en ? 'Artistic preset' : 'Художній пресет'} options={en ? ['Smooth', 'Space', 'Silence'] : ['Плавно', 'Простір', 'Тиша']} value={preset} onChange={changePreset} /><div className="light-sliders">{[
    { name: 'Low energy', value: energy, min: 0, max: 100, unit: '%', change: (n: number) => { setPlaying(false); setEnergy(n); } },
    { name: 'Threshold', value: threshold, min: 0, max: 90, unit: '%', change: setThreshold },
    { name: 'Release', value: release, min: 80, max: 1500, unit: 'ms', change: setRelease },
    { name: 'Movement scale', value: spread, min: 0, max: 100, unit: '%', change: setSpread },
  ].map(({ name, value, min, max, unit, change }) => <label key={name}><span>{name}<b>{value} {unit}</b></span><input type="range" min={min} max={max} value={value} onChange={e => change(Number(e.target.value))} /></label>)}</div><div className="light-rule"><span className="micro">{en ? 'RULE' : 'ПРАВИЛО'}</span><p>{blackout ? (en ? 'A person switched off the lights. No signal can override blackout.' : 'Людина вимкнула світло. Жоден сигнал не скасує blackout.') : energy <= threshold ? (en ? 'The signal is below the threshold. Group A ignores weak hits.' : 'Сигнал нижче порога. Група A не реагує на слабкі удари.') : (en ? 'Stronger bass → more light. Release controls how smoothly it fades.' : 'Сильніший бас → більше світла. Release визначає плавність згасання.')}</p></div><button className="blackout-button" aria-pressed={blackout} onClick={() => setBlackout(!blackout)}>{blackout ? (en ? 'Return control to the rule' : 'Повернути керування правилу') : (en ? 'Blackout / manual off' : 'Blackout / ручне вимкнення')}</button></div></div>;
}

