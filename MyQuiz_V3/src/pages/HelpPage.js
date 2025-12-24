import { Icons } from '../utils/icons.js';
import { Toast } from '../utils/toast.js';

export const HelpPage = {
    topics: [
        {
            id: 'start',
            title: 'Швидкий старт',
            icon: Icons.rocket,
            theme: 'primary',
            desc: 'Покрокове керівництво зі створення вашого першого професійного тесту.',
            content: `
                <div class="h-modal-section">
                    <h4>Алгоритм дій:</h4>
                    <ul class="zen-list">
                        <li>Відкрийте розділ <b>"Створити тест"</b> через бічну панель.</li>
                        <li>Заповніть метадані: назву, опис та виберіть обкладинку.</li>
                        <li>Використовуйте конструктор для додавання питань різних типів.</li>
                        <li>Налаштуйте параметри доступу та часові ліміти в нижній частині редактора.</li>
                        <li>Натисніть <b>"Зберегти"</b> для публікації.</li>
                    </ul>
                </div>
            `
        },
        {
            id: 'export',
            title: 'Експорт даних',
            icon: Icons.link,
            theme: 'success',
            desc: 'Як вивантажувати результати тестування у формати CSV та Excel.',
            content: `
                <div class="h-modal-section">
                    <h4>Формати та методи:</h4>
                    <p>Для формування звітності перейдіть у розділ <b>"Аналітика"</b>. Ви можете завантажити загальний звіт або результати окремого студента.</p>
                    <div class="info-note">
                        ${Icons.info} Система автоматично формує таблицю з відсотками успішності та часом проходження.
                    </div>
                </div>
            `
        },
        {
            id: 'timer',
            title: 'Контроль часу',
            icon: Icons.calendar,
            theme: 'warning',
            desc: 'Налаштування таймерів, дедлайнів та обмежень для проходження.',
            content: `
                <div class="h-modal-section">
                    <h4>Параметри обмежень:</h4>
                    <ul class="zen-list">
                        <li><b>Загальний таймер:</b> Обмежує час на весь тест (наприклад, 45 хвилин).</li>
                        <li><b>Дедлайн:</b> Дата та час, після яких доступ до тесту буде автоматично закрито.</li>
                        <li><b>Перескладання:</b> Ви можете заборонити повторні спроби для одного користувача.</li>
                    </ul>
                </div>
            `
        },
        {
            id: 'types',
            title: 'Типологія питань',
            icon: Icons.book,
            theme: 'info',
            desc: 'Детальний огляд механік: вибір, текст, відповідність та множинність.',
            content: `
                <div class="h-modal-section">
                    <div class="type-grid">
                        <div class="type-item">
                            <h5>${Icons.check} Single Choice</h5>
                            <p>Класичний варіант з однією вірною відповіддю.</p>
                        </div>
                        <div class="type-item">
                            <h5>${Icons.plus} Multi Choice</h5>
                            <p>Студент повинен знайти всі правильні варіанти для отримання балу.</p>
                        </div>
                        <div class="type-item">
                            <h5>${Icons.manage} Open Text</h5>
                            <p>Система порівнює введену відповідь з еталоном (без врахування регістру).</p>
                        </div>
                    </div>
                </div>
            `
        },
        {
            id: 'archive',
            title: 'Архівування',
            icon: Icons.archive,
            theme: 'neutral',
            desc: 'Керування застарілими тестами та безпечне видалення даних.',
            content: `
                <div class="h-modal-section">
                    <h4>Управління життєвим циклом:</h4>
                    <p>Замість видалення ми рекомендуємо використовувати <b>Архів</b>. Це приховує тест від студентів, але зберігає всю аналітику та результати.</p>
                </div>
            `
        },
        {
            id: 'security',
            title: 'Безпека та доступ',
            icon: Icons.lock,
            theme: 'danger',
            desc: 'Захист ваших тестів, налаштування приватності та рівні доступу.',
            content: `
                <div class="h-modal-section">
                    <h4>Конфіденційність:</h4>
                    <p>Ви можете приховати результати тестування від інших студентів у налаштуваннях профілю. Таблиця лідерів також є опціональною функцією.</p>
                </div>
            `
        }
    ],

    render: () => {
        const container = document.getElementById('help-content');
        if (!container) return;

        const cardsHtml = HelpPage.topics.map(topic => `
            <div class="help-card-pro" onclick="App.pages.help.openTopic('${topic.id}')">
                <div class="h-card-top">
                    <div class="h-icon-box theme-${topic.theme}">
                        ${topic.icon}
                    </div>
                    <div class="h-arrow-icon">${Icons.plus}</div>
                </div>
                <div class="h-card-body">
                    <h3>${topic.title}</h3>
                    <p>${topic.desc}</p>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="help-container-pro">
                <div class="help-header-pro">
                    <div class="h-header-text">
                        <h2>Центр підтримки та знань</h2>
                        <p>Оберіть розділ для отримання детальної технічної документації</p>
                    </div>
                    <div class="h-search-bar">
                        <input type="text" placeholder="Пошук інструкції за ключовим словом..." class="h-search-input">
                        <div class="h-search-icon">${Icons.search}</div>
                    </div>
                </div>
                <div class="help-main-grid">
                    ${cardsHtml}
                </div>
                <div class="help-footer-pro">
                    <div class="h-footer-card">
                        <div class="h-footer-icon">${Icons.user}</div>
                        <div class="h-footer-content">
                            <h4>Не знайшли відповідь?</h4>
                            <p>Наша технічна підтримка працює в режимі 24/7 для користувачів тарифу PRO.</p>
                        </div>
                        <button class="btn-primary" onclick="App.pages.help.contactSupport()">Створити тікет</button>
                    </div>
                </div>
            </div>
            <div id="help-modal-root"></div>
        `;
    },

    openTopic: (id) => {
        const topic = HelpPage.topics.find(t => t.id === id);
        if (!topic) return;

        const modalRoot = document.getElementById('help-modal-root');
        modalRoot.innerHTML = `
            <div class="zen-modal-overlay" onclick="App.pages.help.handleOutsideClick(event)">
                <div class="zen-modal-container">
                    <div class="zen-modal-header">
                        <div class="h-icon-box theme-${topic.theme} sm">
                            ${topic.icon}
                        </div>
                        <div class="zen-modal-title">
                            <h3>${topic.title}</h3>
                            <span>Технічна документація</span>
                        </div>
                        <button class="zen-close-btn" onclick="App.pages.help.closeModal()">✕</button>
                    </div>
                    <div class="zen-modal-body">
                        ${topic.content}
                    </div>
                    <div class="zen-modal-footer">
                        <button class="btn-secondary" onclick="App.pages.help.closeModal()">Закрити</button>
                        <button class="btn-primary" onclick="App.pages.help.printDoc()">Друк інструкції</button>
                    </div>
                </div>
            </div>
        `;
        document.body.classList.add('modal-open');
    },

    handleOutsideClick: (e) => {
        if (e.target.classList.contains('zen-modal-overlay')) {
            HelpPage.closeModal();
        }
    },

    closeModal: () => {
        const root = document.getElementById('help-modal-root');
        if (root) root.innerHTML = '';
        document.body.classList.remove('modal-open');
    },

    contactSupport: () => {
        Toast.show('Запит надіслано в службу підтримки');
    },

    printDoc: () => {
        window.print();
    }
};