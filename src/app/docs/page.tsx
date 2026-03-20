import styles from './page.module.css';

export default function DocsPage() {
  return (
    <section className={styles.docsPage}>
      <section className={styles.docsHero}>
        <div className={styles.docsCopy}>
          <p className={styles.kicker}>Документы</p>
          <h1>Единый центр юридических материалов X-CAR</h1>
          <p>
            Все ключевые документы собраны в одном месте: договор, политика и оферты. Структура сделана короткой и
            понятной, чтобы вы находили нужный файл за несколько секунд.
          </p>
          <div className={styles.chips}>
            <span>Для водителей</span>
            <span>Для пассажиров</span>
            <span>Для таксопарков</span>
          </div>
        </div>

        <aside className={styles.docsPreview} aria-hidden="true">
          <div className={styles.previewMap}></div>
          <div className={styles.previewCard}>
            <p>Доступно документов</p>
            <strong>4</strong>
            <span>Актуальные версии в одном разделе</span>
          </div>
        </aside>
      </section>

      <section className={styles.docsGrid}>
        <a href="https://x-car.ru/terms" target="_blank" rel="noopener noreferrer">
          <img src="/xcar/ic_conditions.svg" alt="Договор фрахтования" />
          <h2>Договор фрахтования</h2>
          <p>Основные условия использования сервиса и аренды.</p>
        </a>
        <a href="https://x-car.ru/privacy" target="_blank" rel="noopener noreferrer">
          <img src="/xcar/ic_documents.svg" alt="Политика конфиденциальности" />
          <h2>Политика конфиденциальности</h2>
          <p>Как обрабатываются и защищаются персональные данные.</p>
        </a>
        <a href="https://x-car.ru/offer_driver" target="_blank" rel="noopener noreferrer">
          <img src="/xcar/ic_offer_driver.svg" alt="Оферта для водителей" />
          <h2>Оферта для водителей</h2>
          <p>Условия подключения к сервису и начала работы на линии.</p>
        </a>
        <a href="https://x-car.ru/offer_pass" target="_blank" rel="noopener noreferrer">
          <img src="/xcar/ic_offer_pass.svg" alt="Оферта для пассажиров" />
          <h2>Оферта для пассажиров</h2>
          <p>Правила поездок и использования приложения пассажирами.</p>
        </a>
      </section>

      <section className={styles.docsFlow} aria-label="Порядок работы с документами">
        <article>
          <span>01</span>
          <h3>Выберите нужный раздел</h3>
          <p>Откройте документ для водителя, пассажира или общий юридический блок.</p>
        </article>
        <article>
          <span>02</span>
          <h3>Проверьте условия</h3>
          <p>Сфокусируйтесь на ключевых пунктах: обязанности, порядок оплаты и ответственность сторон.</p>
        </article>
        <article>
          <span>03</span>
          <h3>Перейдите к подключению</h3>
          <p>После ознакомления сразу переходите к выбору авто и запуску работы в системе.</p>
        </article>
      </section>
    </section>
  );
}
