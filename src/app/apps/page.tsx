import styles from './page.module.css';

export default function AppsPage() {
  return (
    <section className={styles.appsPage}>
      <section className={styles.appsHero}>
        <div className={styles.appsCopy}>
          <p className={styles.kicker}>Приложение</p>
          <h1>Запуск в 3 шага через мобильное приложение X-CAR</h1>
          <p>
            Скачайте приложение на удобной платформе, выберите город и подберите автомобиль. Интерфейс сохраняет ту же
            простую логику, что и главная страница.
          </p>
          <div className={styles.chips}>
            <span>Быстрое подключение</span>
            <span>Понятный сценарий</span>
            <span>Поддержка 24/7</span>
          </div>
        </div>

        <aside className={styles.appsVisual} aria-hidden="true">
          <div className={styles.visualBg}></div>
          <img src="/xcar/img_kia_white.png" alt="Автомобиль X-CAR" />
        </aside>
      </section>

      <section className={styles.stores} aria-label="Площадки для загрузки приложения">
        <a href="https://play.google.com/store/apps/details?id=com.xcar.driver" target="_blank" rel="noopener noreferrer">
          <img src="/xcar/ic_google_play.svg" alt="Google Play" />
        </a>
        <a href="https://appgallery.huawei.com/app/C107690323" target="_blank" rel="noopener noreferrer">
          <img src="/xcar/ic_app_gallery.svg" alt="App Gallery" />
        </a>
        <a
          href="https://apps.apple.com/ru/app/%D0%B8%D0%BA%D1%81%D0%BA%D0%B0%D1%80-%D0%B2%D0%BE%D0%B4%D0%B8%D1%82%D0%B5%D0%BB%D1%8C/id6476111759"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/xcar/ic_app_store.svg" alt="App Store" />
        </a>
        <a href="https://www.rustore.ru/catalog/app/com.xcar.driver" target="_blank" rel="noopener noreferrer">
          <img src="/xcar/ic_ru_store.svg" alt="RuStore" />
        </a>
      </section>

      <section className={styles.steps}>
        <article>
          <span>01</span>
          <h2>Скачайте приложение</h2>
          <p>Установите X-CAR Driver из удобного магазина приложений.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Выберите город и авто</h2>
          <p>Примените фильтры, сравните условия и отправьте заявку.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Выходите на линию</h2>
          <p>После подтверждения можно сразу начинать рабочую смену.</p>
        </article>
      </section>

      <section className={styles.benefits}>
        <article>
          <h3>Чистая навигация</h3>
          <p>Все основные действия находятся в зоне первого экрана, без лишней вложенности меню.</p>
        </article>
        <article>
          <h3>Единый подход</h3>
          <p>Логика интерфейса повторяет веб-версию, поэтому переход между устройствами остается привычным.</p>
        </article>
        <article>
          <h3>Быстрый старт</h3>
          <p>Путь от установки до первой смены занимает минимум времени благодаря короткому сценарию.</p>
        </article>
      </section>
    </section>
  );
}
