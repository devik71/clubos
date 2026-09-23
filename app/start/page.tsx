import type { Metadata } from 'next';
import { SiteFooter, SiteHeader } from '../../components/site-shell';
import SetupGuide from '../../components/setup-guide';
import './setup.css';

export const metadata: Metadata = { title: 'Перший запуск агента', description: 'Покрокове встановлення Claude Code та Codex на Windows і macOS. Від термінала до першої власної сторінки.' };

export default function StartPage() {
  return <><SiteHeader current="start" /><main className="setup-page"><SetupGuide /></main><SiteFooter /></>;
}
