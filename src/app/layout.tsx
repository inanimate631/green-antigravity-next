import type { Metadata } from 'next';
import './globals.css';
import SiteShell from '@/components/site-shell';

export const metadata: Metadata = {
  title: 'X-CAR RENT',
  description: 'Аренда такси в Москве и других городах России'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
