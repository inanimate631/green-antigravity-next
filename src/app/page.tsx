import Link from 'next/link';
import styles from './home.module.css';

export default function HomePage() {
  return (
    <>
      <section id="overview" className={styles.hero}>
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

      <section id="experience" className={styles.spotlight}>
        <div className={styles.spotlightCopy}>
          <p className={styles.sectionLabel}>Для водителей и парков</p>
          <h2>Простой путь к выходу на линию</h2>
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

        <div className={styles.spotlightMedia} aria-hidden="true">
          <div className={styles.mediaShell}>
            <img src="/xcar/img_kia_white.png" alt="Автомобиль X-CAR" />
          </div>
          <span className={styles.mediaGlow}></span>
        </div>
      </section>

      <section id="details" className={styles.featureGrid}>
        <article>
          <h3>01. Гибкий выбор</h3>
          <p>Аренда доступна в разных городах и позволяет быстро подобрать подходящий формат работы.</p>
        </article>
        <article>
          <h3>02. Быстрые действия</h3>
          <p>Ключевые шаги вынесены на первый экран: выбрать город, отфильтровать варианты и оставить заявку.</p>
        </article>
        <article>
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
