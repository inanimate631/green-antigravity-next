import Link from 'next/link';
import styles from './page.module.css';

export default function ContactsPage() {
  return (
    <section className={styles.contactsPage}>
      <section className={styles.contactsHero}>
        <div className={styles.contactsCopy}>
          <p className={styles.kicker}>Контакты</p>
          <h1>Свяжитесь с командой X-CAR по любому рабочему вопросу</h1>
          <p>
            Ниже собраны реквизиты, адрес и полезные ссылки. Блоки выстроены так, чтобы нужная информация находилась
            быстро и без перегрузки.
          </p>
        </div>

        <aside className={styles.contactsLinks}>
          <a href="https://x-car.ru/contacts" target="_blank" rel="noopener noreferrer">
            Официальная страница контактов
          </a>
          <a href="https://x-car.ru/privacy" target="_blank" rel="noopener noreferrer">
            Политика конфиденциальности
          </a>
          <a href="https://x-car.ru/partner" target="_blank" rel="noopener noreferrer">
            Подключить таксопарк
          </a>
        </aside>
      </section>

      <section className={styles.contactsLayout}>
        <div className={styles.infoGrid}>
          <article>
            <h2>Компания</h2>
            <p>АО «Икс Кар Групп»</p>
          </article>
          <article>
            <h2>Адрес</h2>
            <p>123112, г. Москва, наб. Пресненская, дом 10, стр. 2, помещение 5Н</p>
          </article>
          <article>
            <h2>ИНН / КПП</h2>
            <p>9724043566 / 772401001</p>
          </article>
          <article>
            <h2>ОГРН</h2>
            <p>1217700155265</p>
          </article>
        </div>

        <aside className={styles.mapCard} aria-hidden="true">
          <div className={styles.mapImage}></div>
          <div className={styles.mapNote}>
            <h3>География работы</h3>
            <p>Москва и другие города России. Подключение для водителей и таксопарков.</p>
          </div>
        </aside>
      </section>

      <section className={styles.channels}>
        <article>
          <h3>Для водителей</h3>
          <p>Вопросы по подключению, документам и запуску смены.</p>
          <Link href="/apps">Открыть раздел приложения</Link>
        </article>
        <article>
          <h3>Для таксопарков</h3>
          <p>Сотрудничество, подключение новых машин и условия партнерства.</p>
          <a href="https://x-car.ru/partner" target="_blank" rel="noopener noreferrer">
            Партнерская форма
          </a>
        </article>
        <article>
          <h3>Юридические вопросы</h3>
          <p>Проверка договоров, оферт и политики обработки данных.</p>
          <Link href="/docs">Перейти к документам</Link>
        </article>
      </section>
    </section>
  );
}
