import type { Metadata } from 'next';
import './globals.css';
import './branches.css';

export const metadata: Metadata = {
  title: { default: 'ClubOS — Важлива робота. Спільна система.', template: '%s / ClubOS' },
  description: 'Спільна візія BRUKXT: операції, реактивне світло, медіа й архів. Команда створює власні інструменти разом з AI-агентами.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="uk"><body>{children}</body></html>;
}
