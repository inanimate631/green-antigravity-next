'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import ParticleBackground from '@/components/particle-background';
import styles from './site-shell.module.css';

type SiteShellProps = {
  children: React.ReactNode;
};

const navItems = [
  { href: '/', label: 'Главная', exact: true },
  { href: '/docs', label: 'Документы' },
  { href: '/apps', label: 'Приложение' },
  { href: '/contacts', label: 'Контакты' }
];

export default function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();
  const pageRootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    return () => {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <main ref={pageRootRef} id="top" className={styles.page}>
      <ParticleBackground containerRef={pageRootRef} className={styles.particleCanvas} />

      <header className={styles.topbar}>
        <Link className={styles.brand} href="/" aria-label="X-CAR">
          <img src="/xcar/logo.svg" alt="X-CAR" />
        </Link>

        <nav className={styles.nav}>
          {navItems.map(item => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={active ? styles.isActive : undefined}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <section className={styles.routeShell}>{children}</section>

      <footer className={styles.siteFooter}>
        <p>АО «Икс Кар Групп» · аренда такси в Москве и других городах России</p>
        <a href="https://x-car.ru/privacy" target="_blank" rel="noopener noreferrer">
          Политика конфиденциальности
        </a>
      </footer>
    </main>
  );
}
