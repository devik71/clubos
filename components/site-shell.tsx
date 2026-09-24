import Link from 'next/link';

export type SiteLocale = 'uk' | 'en';
const sections = [
  ['/', 'vision', 'Візія', 'Vision'], ['/light', 'light', 'Світло', 'Light'],
  ['/media', 'media', 'Медіа', 'Media'], ['/files', 'files', 'Архів', 'Archive'],
  ['/team', 'team', 'Команда', 'People'],
] as const;
export const localizedHref = (href: string, locale: SiteLocale) => locale === 'en' ? `/en${href === '/' ? '' : href}` : href;

export function SiteHeader({ current = 'vision', locale = 'uk' }: { current?: string; locale?: SiteLocale }) {
  const currentHref = sections.find(([, id]) => id === current)?.[0] ?? '/';
  return <header className="header site-header"><Link className="wordmark" href={localizedHref('/', locale)}>ClubOS <span>/ {({ vision: 'Vision', light: 'Light', media: 'Media', files: 'Archive', team: 'People', start: 'Start' } as Record<string, string>)[current]}</span></Link><nav aria-label={locale === 'en' ? 'ClubOS sections' : 'Напрями ClubOS'}>{sections.map(([href, id, uk, en]) => <Link key={id} href={localizedHref(href, locale)} aria-current={current === id ? 'page' : undefined}>{locale === 'en' ? en : uk}</Link>)}</nav><div className="site-language" aria-label={locale === 'en' ? 'Language' : 'Мова'}><Link href={currentHref} lang="uk" aria-current={locale === 'uk' ? 'page' : undefined}>УКР</Link><span>/</span><Link href={localizedHref(currentHref, 'en')} lang="en" aria-current={locale === 'en' ? 'page' : undefined}>ENG</Link></div><span className="header-note">BRUKXT · WORK IN PROGRESS</span></header>;
}
export function SiteFooter({ locale = 'uk' }: { locale?: SiteLocale }) {
  return <footer className="site-footer wrap"><Link href={localizedHref('/', locale)}>ClubOS / BRUKXT</Link><span>{locale === 'en' ? 'Built together · sample data' : 'Спільна розробка · демонстраційні дані'}</span><Link href={`${localizedHref('/team', locale)}#start-together`}>{locale === 'en' ? 'Join the development ↗' : 'Долучитися до розробки ↗'}</Link></footer>;
}
export function PageIntro({ label, title, text }: { label: string; title: React.ReactNode; text: string }) {
  return <div className="page-intro wrap"><span className="eyebrow">{label}</span><h1>{title}</h1><p>{text}</p></div>;
}
