'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export function SectionHeading({ number, label, title, children }: { number: string; label: string; title: ReactNode; children?: ReactNode }) {
  return <div className="section-heading"><div className="eyebrow"><span>{number}</span>{label}</div><h2>{title}</h2>{children && <p className="lead">{children}</p>}</div>;
}

export function Segmented({ options, value, onChange, label }: { options: string[]; value: number; onChange: (n: number) => void; label: string }) {
  return <div className="segmented" role="group" aria-label={label}>{options.map((option, i) => <button key={option} type="button" aria-pressed={i === value} onClick={() => onChange(i)}>{option}</button>)}</div>;
}

export function DemoLabel({ children = 'Інтерактивна симуляція · демодані' }: { children?: ReactNode }) {
  return <span className="demo-label"><span className="dot" />{children}</span>;
}

export function Detail({ title, children }: { title: string; children: ReactNode }) {
  return <details className="detail"><summary>{title}<span aria-hidden="true">+</span></summary><div className="detail-content">{children}</div></details>;
}

export function Waveform({ seed = 1, className = '' }: { seed?: number; className?: string }) {
  return <div className={`waveform ${className}`} aria-hidden="true">{Array.from({ length: 72 }, (_, i) => <i key={i} style={{ height: `${12 + Math.abs(Math.sin(i * 1.71 + seed) * Math.cos(i * .21 + seed)) * 88}%` }} />)}</div>;
}

export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add('revealed'); observer.disconnect(); }
    }, { threshold: .08 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}
