'use client';

import Link from 'next/link';
import { CSSProperties, useEffect, useRef } from 'react';
import styles from './home.module.css';

export default function HomePage() {
  const overviewRef = useRef<HTMLElement>(null);
  const experienceRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-scroll-item]'));
    if (!items.length) {
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      items.forEach(item => item.classList.add(styles.inView));
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.inView);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
    );

    items.forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      return;
    }

    let locked = false;
    let unlockId = 0;

    const onWheel = (event: WheelEvent) => {
      if (locked || event.deltaY <= 12) {
        return;
      }

      const hero = overviewRef.current;
      const experience = experienceRef.current;
      if (!hero || !experience) {
        return;
      }

      const heroRect = hero.getBoundingClientRect();
      const experienceRect = experience.getBoundingClientRect();

      const heroDominant = heroRect.top <= 90 && heroRect.bottom >= window.innerHeight * 0.55;
      const notAtNextSection = experienceRect.top > window.innerHeight * 0.1;

      if (heroDominant && notAtNextSection) {
        event.preventDefault();
        locked = true;
        experience.scrollIntoView({ behavior: 'smooth', block: 'start' });
        unlockId = window.setTimeout(() => {
          locked = false;
        }, 900);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', onWheel);
      if (unlockId) {
        window.clearTimeout(unlockId);
      }
    };
  }, []);

  return (
    <>
      <section id="overview" ref={overviewRef} className={styles.hero}>
        <p className={`${styles.heroKicker} ${styles.reveal} ${styles.reveal1}`}>X-CAR RENT</p>
        <h1 className={`${styles.heroTitle} ${styles.reveal} ${styles.reveal2}`}>
          Аренда такси в Москве и других городах России
        </h1>
        <p className={`${styles.heroSubtitle} ${styles.reveal} ${styles.reveal3}`}>
          Выберите город, примените фильтры и подберите автомобиль для работы. Чистая структура сохраняет фокус на
          главном действии.
        </p>

        <div className={`${styles.heroActions} ${styles.reveal} ${styles.reveal4}`}>
          <Link className={`${styles.btn} ${styles.btnPrimary}`} href="/apps">
            Выбрать автомобиль
          </Link>
          <Link className={`${styles.btn} ${styles.btnGhost}`} href="/contacts">
            Связаться
          </Link>
        </div>

        <div className={`${styles.heroPills} ${styles.reveal} ${styles.reveal5}`}>
          <span>Любой город</span>
          <span>Фильтры поиска</span>
          <span>Подключение таксопарка</span>
        </div>
      </section>

      <section id="experience" ref={experienceRef} className={styles.spotlight}>
        <div
          className={`${styles.spotlightCopy} ${styles.scrollItem} ${styles.scrollFromLeft}`}
          data-scroll-item
          style={{ '--scroll-delay': '40ms' } as CSSProperties}
        >
          <p className={styles.sectionLabel}>Для водителей и парков</p>
          <h2 className={styles.spotlightTitle}>Простой путь к выходу на линию</h2>
          <p>
            Интерфейс построен вокруг понятного сценария аренды: сначала город, затем условия, после этого быстрый
            старт и подключение к заказам.
          </p>
          <ul>
            <li>Выберите город</li>
            <li>Примените фильтры</li>
            <li>Начните работать в такси</li>
          </ul>
        </div>

        <div
          className={`${styles.spotlightMedia} ${styles.scrollItem} ${styles.scrollFromRight}`}
          data-scroll-item
          style={{ '--scroll-delay': '140ms' } as CSSProperties}
          aria-hidden="true"
        >
          <div className={styles.mediaShell}>
            <img src="/xcar/img_kia_white.png" alt="Автомобиль X-CAR" />
          </div>
          <span className={styles.mediaGlow}></span>
        </div>
      </section>

      <section id="details" className={styles.featureGrid}>
        <article
          className={`${styles.scrollItem} ${styles.scrollFromUp}`}
          data-scroll-item
          style={{ '--scroll-delay': '40ms' } as CSSProperties}
        >
          <h3>01. Гибкий выбор</h3>
          <p>Аренда доступна в разных городах и позволяет быстро подобрать подходящий формат работы.</p>
        </article>
        <article
          className={`${styles.scrollItem} ${styles.scrollFromUp}`}
          data-scroll-item
          style={{ '--scroll-delay': '120ms' } as CSSProperties}
        >
          <h3>02. Быстрые действия</h3>
          <p>Ключевые шаги вынесены на первый экран: выбрать город, отфильтровать варианты и оставить заявку.</p>
        </article>
        <article
          className={`${styles.scrollItem} ${styles.scrollFromUp}`}
          data-scroll-item
          style={{ '--scroll-delay': '200ms' } as CSSProperties}
        >
          <h3>03. Поддержка старта</h3>
          <p>Инструменты для водителей и таксопарков собраны в одном потоке без перегрузки интерфейса.</p>
        </article>
      </section>

      <section className={styles.routeTeasers}>
        <Link href="/docs">
          <h3>Документы</h3>
          <p>Договор фрахтования, политика конфиденциальности и оферты в одном месте.</p>
        </Link>
        <Link href="/apps">
          <h3>Приложение</h3>
          <p>Ссылки на загрузку для Google Play, App Gallery, App Store и RuStore.</p>
        </Link>
        <Link href="/contacts">
          <h3>Контакты</h3>
          <p>Реквизиты компании и быстрые варианты связи с командой сервиса.</p>
        </Link>
      </section>
    </>
  );
}
