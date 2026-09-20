import Link from 'next/link';

export function SiteHeader({ current = 'vision' }: { current?: string }) {
  return <header className="header site-header"><Link className="wordmark" href="/">ClubOS <span>/ {({ vision: 'Vision', light: 'Light', media: 'Media', files: 'Archive', team: 'People' } as Record<string, string>)[current]}</span></Link><nav aria-label="Напрями ClubOS">{[['/', 'Візія', 'vision'], ['/light', 'Світло', 'light'], ['/media', 'Медіа', 'media'], ['/files', 'Архів', 'files'], ['/team', 'Команда', 'team']].map(([href, title, id]) => <Link key={id} href={href} aria-current={current === id ? 'page' : undefined}>{title}</Link>)}</nav><span className="header-note">BRUKXT · WORK IN PROGRESS</span></header>;
}
export function SiteFooter() {
  return <footer className="site-footer wrap"><Link href="/">ClubOS / BRUKXT</Link><span>Спільна розробка · демонстраційні дані</span><Link href="/team#start-together">Долучитися до розробки ↗</Link></footer>;
}
export function PageIntro({ label, title, text }: { label: string; title: React.ReactNode; text: string }) {
  return <div className="page-intro wrap"><span className="eyebrow">{label}</span><h1>{title}</h1><p>{text}</p></div>;
}
