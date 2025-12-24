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
import { Toast } from './src/utils/toast.js';

export class App {
    constructor() {
        this.appContainer = document.getElementById('app-content');
        this.pages = {
            home: HomePage, manage: ManagePage, editor: EditorPage,
            analytics: AnalyticsPage, quiz: QuizPage, plans: PlansPage,
            settings: SettingsPage, help: HelpPage, archive: ArchivePage
        };
        
        window.onpopstate = (event) => {
            const page = event.state ? event.state.page : 'home';
            this.render(page);
        };

        this.initTheme();
        this.initProfile();
        this.initIcons();
        this.initGlobalListeners();

        const params = new URLSearchParams(window.location.search);
        const page = params.get('page') || 'home';
        const id = params.get('id');

        if (page === 'run' && id) {
            this.pages.quiz.init(id);
        } else {
            this.render(page);
        }
    }

    initTheme() {
        const theme = localStorage.getItem('mq_theme') || 'light';
        const accent = localStorage.getItem('mq_accent_color');
        
        document.documentElement.setAttribute('data-theme', theme);
        if (accent) {
            document.documentElement.style.setProperty('--primary', accent);
        }
    }

    initProfile() {
        const name = localStorage.getItem('mq_user_name') || 'Вадим Голубков';
        const avatar = localStorage.getItem('mq_user_avatar');
        const nameEl = document.querySelector('.sidebar .user-name');
        const avatarEl = document.querySelector('.sidebar .user-avatar img');
        if(nameEl) nameEl.innerText = name;
        if(avatarEl) avatarEl.src = avatar || `https://ui-avatars.com/api/?name=${encodeURI(name)}&background=0f172a&color=fff`;
    }

    initIcons() {
        const iconMapping = {
            'icon-home': Icons.home, 'icon-analytics': Icons.analytics,
            'icon-plus': Icons.plus, 'icon-manage': Icons.manage,
            'icon-archive': Icons.archive, 'icon-plans': Icons.chart,
            'icon-help': Icons.help, 'icon-settings': Icons.settings
        };
        for (const [id, svg] of Object.entries(iconMapping)) {
            const el = document.getElementById(id);
            if (el) el.innerHTML = svg;
        }
    }

    initGlobalListeners() {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-container')) {
                document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
            }
        });
    }

    route(pageName, id = null) {
        let url = `?page=${pageName}`;
        if (id) url += `&id=${id}`;
        window.history.pushState({ page: pageName, id: id }, '', url);
        this.render(pageName);
    }

    render(pageName) {
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('onclick')?.includes(`'${pageName}'`)) btn.classList.add('active');
        });

        switch(pageName) {
            case 'home':
                this.renderTemplate(`
                    <div class="page-header sticky" style="border-bottom: none;">
                        <h1>Огляд тестів</h1>
                        <div class="header-actions">
                            <div style="position: relative; width: 320px;">
                                <input type="text" class="form-control" placeholder="Пошук тестів..." oninput="App.pages.home.search(this.value)" style="height: 48px; border-radius: 14px; padding-left: 44px; background: var(--bg-body);">
                                <div style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted);">${Icons.search}</div>
                            </div>
                            <button class="btn-secondary" onclick="App.pages.home.toggleSort()" id="sort-btn-home" style="height: 48px; min-width: 54px;">AZ</button>
                            <button class="btn-primary" onclick="App.route('create')" style="height: 48px;">${Icons.plus} Створити</button>
                        </div>
                    </div>
                    <div class="content-body" style="padding-top: 0;"><div id="list-home" class="quiz-grid" style="margin-top: 24px;"></div></div>
                `);
                HomePage.render();
                break;

            case 'run':
                this.renderTemplate(`
                    <div class="content-body" style="display:flex; align-items:center; justify-content:center; min-height:100vh; padding:20px;">
                        <div id="run-start-card"></div>
                        <div id="run-process" class="hidden" style="width:100%; max-width:800px;">
                            <div class="card" style="padding:40px; border-radius:32px; position:relative;">
                                <div id="run-timer-container" class="hidden" style="position:absolute; top:40px; right:40px; font-weight:800; font-size:18px; color:var(--primary);">00:00</div>
                                <div style="margin-bottom:32px;">
                                    <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:13px; font-weight:700; color:var(--text-muted);">
                                        <span>ПИТАННЯ <span id="run-current">1</span> З <span id="run-total">1</span></span>
                                    </div>
                                    <div style="height:6px; background:var(--bg-body); border-radius:10px; overflow:hidden;">
                                        <div id="run-progress" style="height:100%; width:0%; background:var(--primary); transition:0.3s;"></div>
                                    </div>
                                </div>
                                <div id="run-card-content"></div>
                                <div id="run-actions" style="margin-top:40px; display:flex; gap:16px; justify-content:flex-end;"></div>
                            </div>
                        </div>
                    </div>
                `);
                break;

            case 'finish':
                this.renderTemplate(`
                    <div class="content-body" style="display:flex; align-items:center; justify-content:center; min-height:100vh;">
                        <div class="run-card-wide" style="text-align:center;">
                            <div style="font-size:64px; margin-bottom:24px;">🏆</div>
                            <h1 style="font-size:32px; font-weight:900; margin-bottom:8px;">Тест завершено!</h1>
                            <p style="color:var(--text-secondary); margin-bottom:40px;">Ваші результати успішно збережені в системі.</p>
                            <div style="background:var(--bg-body); padding:32px; border-radius:24px; margin-bottom:40px;">
                                <div id="res-score" style="font-size:56px; font-weight:900; color:var(--primary); line-height:1;">0%</div>
                                <div id="res-info" style="margin-top:12px; font-weight:700; color:var(--text-muted);">0 з 0 балів</div>
                            </div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                                <button class="btn-secondary" onclick="App.route('home')" style="height:56px;">На головну</button>
                                <button class="btn-primary" onclick="App.route('analytics')" style="height:56px;">Аналітика</button>
                            </div>
                        </div>
                    </div>
                `);
                break;
            
            case 'manage':
                this.renderTemplate(`<div class="page-header sticky"><h1>Керування</h1><div class="header-actions"><div style="position:relative; width:320px;"><input type="text" class="form-control" placeholder="Пошук тестів..." oninput="App.pages.manage.search(this.value)" style="height:48px; border-radius:14px; padding-left:44px; background:var(--bg-body);"><div style="position:absolute; left:16px; top:50%; transform:translateY(-50%); color:var(--text-muted);">${Icons.search}</div></div><button class="btn-secondary" onclick="App.pages.manage.toggleSort()" id="sort-btn-manage" style="height:48px; min-width:54px;">AZ</button></div></div><div class="content-body"><div id="list-manage" class="quiz-grid" style="margin-top:24px;"></div></div>`);
                ManagePage.render();
                break;

            case 'create':
                EditorPage.render();
                break;

            case 'analytics':
                this.renderTemplate(`
                    <div class="page-header sticky">
                        <div class="header-left">
                            <h1>Аналітика</h1>
                            <div id="ana-breadcrumbs" class="analytics-breadcrumb" style="font-size: 14px; font-weight: 600; color: var(--text-secondary);"></div>
                        </div>
                        <div class="header-actions">
                            <div style="position: relative; width: 280px;" id="ana-search-box">
                                <input type="text" class="form-control" placeholder="Пошук..." oninput="App.pages.analytics.search(this.value)" style="height: 44px; border-radius: 12px; padding-left: 40px; background: var(--bg-body);">
                                <div style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted);">${Icons.search}</div>
                            </div>
                            <button id="ana-main-action-btn" class="btn-primary" style="height: 44px; padding: 0 20px;">
                                ${Icons.link} Експорт результатів
                            </button>
                        </div>
                    </div>
                    <div class="content-body">
                        <div id="ana-chart-container" style="height:300px; margin-bottom:32px;"><canvas id="globalChart"></canvas></div>
                        <div id="ana-view-general" class="table-card">
                            <table class="ana-table">
                                <thead>
                                    <tr>
                                        <th class="text-left">Назва тесту</th>
                                        <th class="text-center">Спроб</th>
                                        <th class="text-center">Сер. успішність</th>
                                        <th class="text-right">Дії</th>
                                    </tr>
                                </thead>
                                <tbody id="ana-list-general"></tbody>
                            </table>
                        </div>
                        <div id="ana-view-quiz" class="table-card hidden"></div>
                        <div id="ana-view-result" class="hidden"></div>
                    </div>
                `);
                AnalyticsPage.render();
                break;

            case 'settings':
                this.renderTemplate(`
                    <div class="page-header sticky">
                        <h1>Налаштування профілю</h1>
                    </div>
                    <div class="content-body" id="settings-content"></div>
                `);
                setTimeout(() => { if (typeof SettingsPage !== 'undefined') SettingsPage.render(); }, 0);
                break;
            case 'plans':
                this.renderTemplate(`<div class="page-header sticky"><h1>Тарифні плани</h1></div><div class="content-body" id="plans-content"></div>`);
                setTimeout(() => PlansPage.render(), 0);
                break;
            case 'help':
                this.renderTemplate(`<div class="page-header sticky"><h1>Центр підтримки</h1></div><div class="content-body" id="help-content"></div>`);
                setTimeout(() => HelpPage.render(), 0);
                break;
            case 'archive':
                this.renderTemplate(`
                    <div class="page-header sticky">
                        <h1>Архів</h1>
                        <div class="header-actions">
                            <div style="position:relative; width:320px;">
                                <input type="text" class="form-control" placeholder="Пошук тестів..." oninput="App.pages.archive.search(this.value)" style="height:48px; border-radius:14px; padding-left:44px; background:var(--bg-body);">
                                <div style="position:absolute; left:16px; top:50%; transform:translateY(-50%); color:var(--text-muted);">${Icons.search}</div>
                            </div>
                            <button class="btn-secondary" onclick="App.pages.archive.toggleSort()" id="sort-btn-archive" style="height:48px; min-width:54px;">AZ</button>
                        </div>
                    </div>
                    <div class="content-body">
                        <div id="list-archive" class="quiz-grid"></div>
                    </div>
                `);
                ArchivePage.render();
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
        const box = modal.querySelector('.modal-box');
        
        box.innerHTML = `
            <div class="info-modal-icon">${Icons.info}</div>
            <h3 id="info-title" style="word-break: break-word;">${title}</h3>
            <div style="max-height: 300px; overflow-y: auto; margin-bottom: 24px;">
                <p id="info-desc" style="word-break: break-word; overflow-wrap: anywhere; white-space: pre-wrap; color: var(--text-secondary); line-height: 1.6; margin: 0;">${text ? text.replace(/\n/g, '<br>') : 'Опис відсутній.'}</p>
            </div>
            <button onclick="document.getElementById('info-modal').classList.add('hidden')" class="modal-btn-full">Зрозуміло</button>
        `;
        
        modal.classList.remove('hidden');
    }
}

const myApp = new App();
window.App = myApp;