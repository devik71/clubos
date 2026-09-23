import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'ClubOS — Meaningful work. One shared system.', template: '%s / ClubOS' },
  description: 'A shared BRUKXT vision for operations, reactive light, media, and the archive.',
};

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div lang="en">{children}</div>;
}
