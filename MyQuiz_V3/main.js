import { HomePage } from './src/pages/HomePage.js';
import { ManagePage } from './src/pages/ManagePage.js';
import { EditorPage } from './src/pages/EditorPage.js';
import { AnalyticsPage } from './src/pages/AnalyticsPage.js';
import { QuizPage } from './src/pages/QuizPage.js';
import { PlansPage } from './src/pages/PlansPage.js';
import { SettingsPage } from './src/pages/SettingsPage.js';
import { HelpPage } from './src/pages/HelpPage.js';
import { ArchivePage } from './src/pages/ArchivePage.js';
import { Icons } from './src/utils/icons.js';

export class App {
    constructor() {
        this.appContainer = document.getElementById('app-content');
        this.pages = {
            home: HomePage,
            manage: ManagePage,
            editor: EditorPage,
            analytics: AnalyticsPage,
            quiz: QuizPage,
            plans: PlansPage,
            settings: SettingsPage,
            help: HelpPage,
            archive: ArchivePage
        };
        
        window.onpopstate = (event) => {
            if (event.state) this.render(event.state.page);
            else this.render('home');
        };

        this.initProfile();
        this.initGlobalListeners();

        const currentPath = window.location.search.replace('?page=', '') || 'home';
        this.render(currentPath);
    }

    initProfile() {
        if (!localStorage.getItem('mq_user_name')) {
            localStorage.setItem('mq_user_name', 'Вадим Голубков');
        }
        const name = localStorage.getItem('mq_user_name');
        const avatar = localStorage.getItem('mq_user_avatar');
        const nameEl = document.querySelector('.sidebar .user-name');
        const avatarEl = document.querySelector('.sidebar .user-avatar img');

        if(nameEl) nameEl.innerText = name;
        if(avatarEl) {
            avatarEl.src = avatar || `https://ui-avatars.com/api/?name=${encodeURI(name)}&background=0f172a&color=fff`;
        }
    }

    initGlobalListeners() {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-btn') && !e.target.closest('.dropdown-menu')) {
                document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show'));
            }
        });
    }

    route(pageName) {
        if (window.location.search !== `?page=${pageName}`) {
            window.history.pushState({ page: pageName }, '', `?page=${pageName}`);
        }
        this.render(pageName);
    }

    render(pageName) {
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('onclick')?.includes(`'${pageName}'`)) btn.classList.add('active');
        });

        const searchPlaceholder = "Пошук тестів за назвою...";

        switch(pageName) {
            case 'home':
                this.renderTemplate(`
                    <div class="page-header sticky">
                        <h1>Огляд тестів</h1>
                        <div class="header-actions">
                            <input type="text" class="search-input" placeholder="${searchPlaceholder}" oninput="App.pages.home.search(this.value)">
                            <button class="btn-secondary" onclick="App.pages.home.toggleSort()" id="sort-btn-home">AZ</button>
                            <button class="btn-primary" onclick="App.route('create')">${Icons.plus} Створити тест</button>
                        </div>
                    </div>
                    <div class="content-body">
                        <div id="list-home" class="quiz-grid"></div>
                    </div>
                `);
                HomePage.render();
                break;

            case 'manage':
                this.renderTemplate(`
                    <div class="page-header sticky">
                        <h1>Керування</h1>
                        <div class="header-actions">
                            <input type="text" class="search-input" placeholder="${searchPlaceholder}" oninput="App.pages.manage.search(this.value)">
                            <button class="btn-secondary" onclick="App.pages.manage.toggleSort()" id="sort-btn-manage">AZ</button>
                        </div>
                    </div>
                    <div class="content-body">
                        <div id="list-manage" class="quiz-grid"></div>
                    </div>
                `);
                ManagePage.render();
                break;
            
            case 'archive':
                this.renderTemplate(`
                    <div class="page-header sticky">
                        <h1>Архів тестів</h1>
                        <div class="header-actions">
                            <input type="text" class="search-input" placeholder="Пошук в архіві..." oninput="App.pages.archive.search(this.value)">
                            <button class="btn-secondary" onclick="App.pages.archive.toggleSort()" id="sort-btn-archive">AZ</button>
                        </div>
                    </div>
                    <div class="content-body">
                        <div id="list-archive" class="quiz-grid"></div>
                    </div>
                `);
                ArchivePage.render();
                break;

            case 'analytics':
    this.renderTemplate(`
        <div class="page-header sticky">
            <h1>Аналітика результатів</h1>
            <div class="header-actions">
                <input type="text" class="search-input" placeholder="Пошук тестів..." oninput="App.pages.analytics.search(this.value)">
                <button class="btn-secondary" onclick="App.pages.analytics.toggleSort()" id="sort-btn-analytics">AZ</button>
                <button class="btn-primary" onclick="App.pages.analytics.exportGlobalCSV()" style="width: auto; padding: 0 20px;">
                    ${Icons.link} Експорт
                </button>
            </div>
        </div>
        <div class="content-body" style="max-width: 1200px;">
            <div id="ana-stats-grid" class="stats-overview-grid"></div>
            <div id="ana-breadcrumbs" class="analytics-breadcrumb" style="margin-top: 32px;"></div>
            
            <div id="ana-view-general" class="table-card" style="animation: fadeUp 0.4s ease-out;">
                <table>
                    <thead>
                        <tr>
                            <th>Тест</th>
                            <th style="text-align: center;">Студентів</th>
                            <th style="text-align: center;">Сер. успішність</th>
                            <th style="text-align: center;">Останній запис</th>
                            <th style="text-align: right;">Деталі</th>
                        </tr>
                    </thead>
                    <tbody id="ana-list-general"></tbody>
                </table>
            </div>
            
            <div id="ana-view-quiz" class="table-card hidden">
                </div>
            <div id="ana-view-result" class="hidden">
                <div id="ana-result-content" style="max-width:800px; margin:0 auto;"></div>
            </div>
        </div>
    `);
    AnalyticsPage.render();
    break;

            case 'create':
                this.renderTemplate(`
                    <div class="page-header sticky">
                        <h1 id="editor-heading">Конструктор</h1>
                        <div class="header-actions">
                            <button class="btn-secondary" onclick="App.route('manage')">Скасувати</button>
                            <button class="btn-primary" onclick="App.pages.editor.save()">${Icons.check} Зберегти тест</button>
                        </div>
                    </div>
                    <div class="content-body" style="max-width: 1000px;">
                        <div class="card" style="margin-bottom: 32px; border-radius: 28px; padding: 40px;">
                            <div class="form-group"><label class="form-label">Назва тесту</label><input type="text" id="build-title" class="form-control" placeholder="Наприклад: Модульна контрольна робота №1"></div>
                            <div class="form-group"><label class="form-label">Опис для студентів</label><textarea id="build-desc" class="form-control" placeholder="Про що цей тест?" style="min-height:100px;"></textarea></div>
                            <div class="settings-grid">
                                <div class="switch-group"><label class="switch"><input type="checkbox" id="check-timer" onchange="App.pages.editor.toggleTimer(this)"><span class="slider"></span></label><span class="switch-text">Обмежити час</span></div>
                                <div class="switch-group"><label class="switch"><input type="checkbox" id="check-deadline" onchange="App.pages.editor.toggleDeadline(this)"><span class="slider"></span></label><span class="switch-text">Дедлайн проходження</span></div>
                                <div class="switch-group"><label class="switch"><input type="checkbox" id="check-retake"><span class="slider"></span></label><span class="switch-text">Перескладання</span></div>
                                <div class="switch-group"><label class="switch"><input type="checkbox" id="check-answers"><span class="slider"></span></label><span class="switch-text">Показати відповіді</span></div>
                                <div class="switch-group"><label class="switch"><input type="checkbox" id="check-backtracking"><span class="slider"></span></label><span class="switch-text">Повернення назад</span></div>
                                <div class="switch-group"><label class="switch"><input type="checkbox" id="check-leaderboard"><span class="slider"></span></label><span class="switch-text">Таблиця лідерів</span></div>
                            </div>
                            <div id="timer-block" class="hidden" style="margin-top:24px; display:flex; align-items:center; gap:12px; background:var(--bg-body); padding:20px; border-radius:20px; border:1px solid var(--border);">
                                <span style="font-weight:700;">Ліміт:</span>
                                <input type="text" id="time-h" class="form-control" placeholder="00" oninput="App.pages.editor.validateTime(this)" style="width:70px; text-align:center;"> <span>год</span>
                                <input type="text" id="time-m" class="form-control" placeholder="30" oninput="App.pages.editor.validateTime(this)" style="width:70px; text-align:center;"> <span>хв</span>
                            </div>
                            <div id="deadline-block" class="hidden" style="margin-top:24px; background:var(--bg-body); padding:20px; border-radius:20px; border:1px solid var(--border);">
                                <label class="form-label">Приймати відповіді до:</label>
                                <input type="datetime-local" id="deadline-input" class="form-control" style="max-width:300px;">
                            </div>
                        </div>
                        <div id="build-questions"></div>
                        <div style="text-align:center; margin-top: 40px; padding-bottom: 80px;"><button class="btn-dashed" onclick="App.pages.editor.addQuestion()">${Icons.plus} Додати запитання</button></div>
                    </div>
                `);
                EditorPage.loadData();
                break;

            case 'run':
                this.renderTemplate(`
                    <div id="run-start-card" class="content-body" style="max-width: 500px; margin-top: 80px; text-align: center;">
                        <div class="card" style="border-radius: 32px; padding: 48px;">
                            <div style="width:80px; height:80px; background:var(--primary-light); color:var(--primary); border-radius:24px; display:flex; align-items:center; justify-content:center; font-size:32px; margin:0 auto 24px auto;">🚀</div>
                            <h1 id="run-title" style="margin-bottom:12px;">Назва</h1>
                            <p id="run-info-meta" style="color:var(--text-muted); margin-bottom:32px; font-weight: 500;"></p>
                            <input type="text" id="run-name" class="form-control" placeholder="Введіть ваше ім'я" style="margin-bottom:24px; text-align:center; height: 56px; font-size: 16px;">
                            <button class="btn-primary" onclick="App.pages.quiz.start()" style="height: 56px; font-size: 16px;">Почати проходження</button>
                        </div>
                    </div>
                    <div id="run-process" class="hidden content-body" style="max-width: 750px;">
                        <div class="run-header">
                            <div><div style="font-size:20px; font-weight:700;"><span id="run-current">1</span> / <span id="run-total">10</span></div></div>
                            <div id="run-timer-container" class="timer-pill hidden">00:00:00</div>
                        </div>
                        <div class="progress-container"><div id="run-progress" class="progress-bar" style="width:0%"></div></div>
                        <div id="run-card-content" class="card" style="min-height: 300px; border-radius: 32px; margin-top: 32px; padding: 40px;"></div>
                        <div id="run-actions" style="margin-top: 32px; display: flex; justify-content: flex-end; gap: 16px;"></div>
                    </div>
                `);
                break;

            case 'finish':
                this.renderTemplate(`
                    <div class="content-body" style="max-width: 480px; margin-top: 60px; text-align: center;">
                        <div class="card" style="border-radius: 40px; padding: 60px;">
                            <div style="font-size: 72px; margin-bottom: 16px;">🎉</div>
                            <h2 id="res-msg">Тест завершено!</h2>
                            <div id="res-score" class="finish-score">0%</div>
                            <p id="res-info" style="color:var(--text-muted); margin-bottom:40px; font-size:16px;">0 з 0 правильних</p>
                            <div id="finish-actions" style="display:grid; gap:12px;"></div>
                        </div>
                    </div>
                `);
                break;

            case 'review':
                this.renderTemplate(`
                    <div class="page-header sticky"><h1>Робота над помилками</h1><button class="btn-secondary" onclick="App.route('home')">Закрити</button></div>
                    <div class="content-body" style="max-width: 800px;"><div id="review-content"></div></div>
                `);
                break;

            case 'help':
                this.renderTemplate(`
                    <div class="page-header sticky"><h1>Центр підтримки</h1><button class="btn-secondary" onclick="window.open('mailto:support@univ.edu')">Зв'язатись з нами</button></div>
                    <div class="content-body" id="help-content"></div>
                `);
                HelpPage.render();
                break;

            case 'settings':
                this.renderTemplate(`
                    <div class="page-header sticky"><h1>Налаштування</h1></div>
                    <div class="content-body" id="settings-content"></div>
                `);
                SettingsPage.render();
                break;

            case 'plans':
                this.renderTemplate(`
                    <div class="page-header sticky"><h1>Тарифні плани</h1></div>
                    <div class="content-body" id="plans-content"></div>
                `);
                PlansPage.render();
                break;
        }
    }

    renderTemplate(html) {
        this.appContainer.innerHTML = html;
        this.appContainer.scrollTop = 0;
    }

    showConfirm(message, onConfirm) {
        const modal = document.getElementById('confirm-modal');
        document.getElementById('modal-msg').innerText = message;
        modal.classList.remove('hidden');
        document.getElementById('modal-cancel').onclick = () => modal.classList.add('hidden');
        document.getElementById('modal-yes').onclick = () => { onConfirm(); modal.classList.add('hidden'); };
    }

    showInfo(title, text) {
    const modal = document.getElementById('info-modal');
    const titleEl = document.getElementById('info-title');
    const descEl = document.getElementById('info-desc');
    
    if(titleEl) titleEl.innerText = title;
    if(descEl) descEl.innerHTML = text ? text.replace(/\n/g, '<br>') : 'Опис відсутній.';
    
    modal.classList.remove('hidden');
}
}

const myApp = new App();
window.App = myApp;