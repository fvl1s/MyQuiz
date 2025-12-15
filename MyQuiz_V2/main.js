import { HomePage } from './src/pages/HomePage.js';
import { ManagePage } from './src/pages/ManagePage.js';
import { EditorPage } from './src/pages/EditorPage.js';
import { AnalyticsPage } from './src/pages/AnalyticsPage.js';
import { QuizPage } from './src/pages/QuizPage.js';

export class App {
    constructor() {
        this.appContainer = document.getElementById('app-content');
        this.pages = {
            home: HomePage,
            manage: ManagePage,
            editor: EditorPage,
            analytics: AnalyticsPage,
            quiz: QuizPage
        };
        
        window.onpopstate = (event) => {
            if (event.state) {
                this.render(event.state.page);
            } else {
                this.render('home');
            }
        };

        const currentPath = window.location.search.replace('?page=', '') || 'home';
        this.render(currentPath);
    }

    route(pageName) {
        if (window.location.search !== `?page=${pageName}`) {
            window.history.pushState({ page: pageName }, '', `?page=${pageName}`);
        }
        this.render(pageName);
    }

    render(pageName) {
        document.querySelectorAll('.menu-item').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('onclick')?.includes(pageName)) btn.classList.add('active');
        });

        switch(pageName) {
            case 'home':
                this.renderTemplate(`
                    <div class="page-header">
                        <h1>Огляд тестів</h1>
                        <div class="header-actions">
                            <input type="text" class="search-input" placeholder="Пошук..." oninput="App.pages.home.search(this.value)">
                            <button class="btn-sort" onclick="App.pages.home.toggleSort()" id="sort-btn-home" title="Сортування">AZ</button>
                            <button class="btn-primary" onclick="App.route('create')">+ Новий</button>
                        </div>
                    </div>
                    <div id="list-home" class="quiz-grid"></div>
                `);
                HomePage.render();
                break;

            case 'manage':
                this.renderTemplate(`
                    <div class="page-header">
                        <h1>Керування</h1>
                        <div class="header-actions">
                            <input type="text" class="search-input" placeholder="Пошук..." oninput="App.pages.manage.search(this.value)">
                            <button class="btn-sort" onclick="App.pages.manage.toggleSort()" id="sort-btn-manage" title="Сортування">AZ</button>
                        </div>
                    </div>
                    <div id="list-manage" class="quiz-grid"></div>
                `);
                ManagePage.render();
                break;

            case 'create':
                this.renderTemplate(`
                    <div style="max-width: 800px; margin: 0 auto;">
                        <div class="page-header">
                            <h1 id="editor-heading">Конструктор</h1>
                            <div style="display:flex; gap: 10px;">
                                <button class="btn-secondary" onclick="App.route('manage')">Скасувати</button>
                                <button class="btn-primary" onclick="App.pages.editor.save()">Зберегти</button>
                            </div>
                        </div>
                        <div class="card" style="margin-bottom: 24px;">
                            <div class="form-group">
                                <label>Назва тесту</label>
                                <input type="text" id="build-title" class="form-control" placeholder="Введіть назву">
                            </div>
                            <div class="form-group">
                                <label>Опис (для інформаційного вікна)</label>
                                <textarea id="build-desc" class="form-control" placeholder="Про що цей тест?"></textarea>
                            </div>
                            
                            <div class="form-group" style="background:#f8fafc; padding:16px; border-radius:8px; border:1px solid #e2e8f0;">
                                <div class="switch-group">
                                    <label class="switch">
                                        <input type="checkbox" id="check-timer" onchange="App.pages.editor.toggleTimer(this)">
                                        <span class="slider"></span>
                                    </label>
                                    <span class="switch-text" onclick="document.getElementById('check-timer').click()">Обмежити час</span>
                                </div>
                                
                                <div id="timer-block" class="hidden" style="margin-top:16px; display:flex; align-items:center; gap:12px;">
                                    <div style="flex:1">
                                        <label style="margin-bottom:4px; font-size:11px; color:#64748b;">Год.</label>
                                        <input type="text" id="time-h" class="form-control" placeholder="0" maxlength="2" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                                    </div>
                                    <div style="flex:1">
                                        <label style="margin-bottom:4px; font-size:11px; color:#64748b;">Хв.</label>
                                        <input type="text" id="time-m" class="form-control" placeholder="0" maxlength="2" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                                    </div>
                                </div>
                            </div>

                            <div style="display:flex; flex-direction:column; gap:10px; margin-top:20px;">
                                <div class="switch-group">
                                    <label class="switch">
                                        <input type="checkbox" id="check-retake">
                                        <span class="slider"></span>
                                    </label>
                                    <span class="switch-text" onclick="document.getElementById('check-retake').click()">Дозволити перескладання</span>
                                </div>
                                <div class="switch-group">
                                    <label class="switch">
                                        <input type="checkbox" id="check-answers">
                                        <span class="slider"></span>
                                    </label>
                                    <span class="switch-text" onclick="document.getElementById('check-answers').click()">Показувати відповіді</span>
                                </div>
                            </div>
                        </div>
                        
                        <div id="build-questions"></div>
                        
                        <button class="btn-dashed" onclick="App.pages.editor.addQuestion()">+ Додати запитання</button>
                    </div>
                `);
                EditorPage.loadData();
                break;

            case 'analytics':
                this.renderTemplate(`
                    <div class="page-header">
                        <h1>Аналітика</h1>
                        <div class="header-actions">
                            <input type="text" class="search-input" placeholder="Пошук..." oninput="App.pages.analytics.search(this.value)">
                            <button class="btn-sort" onclick="App.pages.analytics.toggleSort()" id="sort-btn-analytics" title="Сортування">AZ</button>
                        </div>
                    </div>
                    <div class="card" style="padding:0; border:none; box-shadow: var(--shadow-sm);">
                        <table style="width:100%">
                            <thead>
                                <tr>
                                    <th>Тест</th>
                                    <th>Проходжень</th>
                                    <th>Сер. бал</th>
                                    <th>Сер. %</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody id="ana-list-general"></tbody>
                        </table>
                    </div>
                `);
                AnalyticsPage.render();
                break;

            case 'analytics-detail':
                this.renderTemplate(`
                    <div class="page-header">
                        <h1 id="ana-title-detail">Деталі тесту</h1>
                        <button class="btn-secondary" onclick="App.route('analytics')">← Назад</button>
                    </div>
                    
                    <div id="ana-error-box" class="hidden"></div>

                    <div class="card" style="padding:0; border:none;">
                        <table style="width:100%">
                            <thead>
                                <tr>
                                    <th>Студент</th>
                                    <th>Дата</th>
                                    <th>Бали</th>
                                    <th>Результат</th>
                                    <th>Дії</th>
                                </tr>
                            </thead>
                            <tbody id="ana-list-detail"></tbody>
                        </table>
                    </div>
                `);
                break;
            
            case 'run':
                this.renderTemplate(`
                    <div id="run-start-card" style="max-width: 500px; margin: 80px auto; text-align: center;">
                        <div class="card">
                            <div style="width:60px; height:60px; background:#e0e7ff; color:var(--primary); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:24px; margin:0 auto 20px auto;">🚀</div>
                            <h1 id="run-title" style="margin-bottom:12px; font-size: 24px;">Назва</h1>
                            <p id="run-info-meta" style="color:#64748b; margin-bottom:32px"></p>
                            <input type="text" id="run-name" class="form-control" placeholder="Введіть ваше ім'я" style="margin-bottom:20px; text-align:center; font-weight:600;">
                            <button class="btn-primary" style="width:100%; padding:16px;" onclick="App.pages.quiz.start()">Почати тестування</button>
                        </div>
                    </div>

                    <div id="run-process" class="hidden" style="max-width: 700px; margin: 0 auto;">
                        <div class="run-header">
                            <div>
                                <span style="font-size:12px; font-weight:600; text-transform:uppercase; color:#94a3b8;">Питання</span>
                                <div style="font-size:20px; font-weight:700;"><span id="run-current">1</span> / <span id="run-total">10</span></div>
                            </div>
                            <div id="run-timer-container" class="timer-pill hidden">00:00:00</div>
                        </div>
                        <div class="progress-container"><div id="run-progress" class="progress-bar" style="width:0%"></div></div>
                        
                        <div id="run-card-content" class="card" style="min-height: 300px; justify-content:center; padding-bottom: 80px;"></div>
                        
                        <div id="run-actions" style="margin-top: 20px; display: flex; justify-content: flex-end;"></div>
                    </div>
                `);
                break;

            case 'finish':
                this.renderTemplate(`
                    <div style="max-width: 480px; margin: 60px auto; text-align: center;">
                        <div class="card">
                            <div style="font-size: 64px; margin-bottom: 10px;">🎉</div>
                            <h2 id="res-msg" style="margin:0; color:var(--text-main);">Тест завершено!</h2>
                            <div id="res-score" class="finish-score">0%</div>
                            <p id="res-info" style="color:var(--text-light); margin-bottom:32px; font-size:16px;">0 з 0 правильних</p>
                            <div id="finish-actions" style="display:grid; gap:12px;"></div>
                        </div>
                    </div>
                `);
                break;

            case 'review':
                this.renderTemplate(`
                    <div style="max-width: 800px; margin: 0 auto;">
                        <div class="page-header">
                            <h1>Робота над помилками</h1>
                            <button class="btn-secondary" onclick="App.route('home')">Закрити</button>
                        </div>
                        <div id="review-content"></div>
                    </div>
                `);
                break;
        }
    }

    renderTemplate(html) {
        this.appContainer.innerHTML = html;
        this.appContainer.scrollTop = 0;
    }

    showConfirm(message, onConfirm) {
        const modal = document.getElementById('confirm-modal');
        const msgEl = document.getElementById('modal-msg');
        const yesBtn = document.getElementById('modal-yes');
        const cancelBtn = document.getElementById('modal-cancel');

        msgEl.innerText = message;
        modal.classList.remove('hidden');

        const close = () => {
            modal.classList.add('hidden');
            yesBtn.onclick = null;
        };

        cancelBtn.onclick = close;
        yesBtn.onclick = () => {
            onConfirm();
            close();
        };
    }

    showInfo(title, text) {
        const modal = document.getElementById('info-modal');
        document.getElementById('info-title').innerText = title;
        document.getElementById('info-desc').innerText = text || 'Опис відсутній.';
        modal.classList.remove('hidden');
    }
}

const myApp = new App();
window.App = myApp;