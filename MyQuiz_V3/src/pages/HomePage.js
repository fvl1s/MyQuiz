import { Storage } from '../storage/storage.js';
import { Icons } from '../utils/icons.js';
import { Toast } from '../utils/toast.js';

export const HomePage = {
    state: { search: '', sort: 'asc' },

    render: () => {
        HomePage.state.search = ''; 
        HomePage.state.sort = 'asc';
        HomePage.renderList();
    },

    search: (val) => { 
        HomePage.state.search = val.toLowerCase(); 
        HomePage.renderList(); 
    },

    toggleSort: () => {
        HomePage.state.sort = HomePage.state.sort === 'asc' ? 'desc' : 'asc';
        const btn = document.getElementById('sort-btn-home');
        if (btn) btn.innerText = HomePage.state.sort === 'asc' ? 'AZ' : 'ZA';
        HomePage.renderList();
    },

    toggleMenu: (id) => {
        const allMenus = document.querySelectorAll('.dropdown-menu');
        allMenus.forEach(m => {
            if (m.id !== `menu-${id}`) m.classList.remove('show');
        });
        const menu = document.getElementById(`menu-${id}`);
        if (menu) menu.classList.toggle('show');
    },

    togglePin: (id) => { 
        Storage.toggleQuizPin(id);
        HomePage.renderList(); 
        Toast.show('Статус закріплення змінено');
    },

    escapeText: (text) => {
        if (!text) return '';
        return text.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, '\\n');
    },

    renderList: () => {
        const container = document.getElementById('list-home');
        if(!container) return;

        let quizzes = Storage.getQuizzes().filter(q => !q.isArchived);
        const results = Storage.getResults();

        if (HomePage.state.search) {
            quizzes = quizzes.filter(q => q.title.toLowerCase().includes(HomePage.state.search));
        }

        quizzes.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return HomePage.state.sort === 'asc' 
                ? a.title.localeCompare(b.title) 
                : b.title.localeCompare(a.title);
        });

        if (!quizzes.length) {
            container.innerHTML = `
                <div class="archive-empty-zen">
                    <div class="empty-icon">${Icons.book}</div>
                    <h3>${HomePage.state.search ? 'Нічого не знайдено' : 'Немає доступних тестів'}</h3>
                    <p>Тут з’являться тести, коли автор їх опублікує.</p>
                </div>`;
            return;
        }

        container.innerHTML = quizzes.map((q, index) => {
            const userResult = results.find(r => r.quizId === q.id);
            const isLocked = q.isClosed === true || (q.deadline && new Date() > new Date(q.deadline));
            
            let statusHtml = `<div class="card-status active status-label-inline" style="margin-bottom:8px;">${Icons.check} Активний</div>`;
            let btnText = 'Почати проходження';
            let btnClass = 'btn-primary-card';
            let isBtnDisabled = false;

            if (userResult) {
                statusHtml = `<div class="card-status passed status-label-inline" style="margin-bottom:8px;">${Icons.check} Пройдено • ${userResult.percent}%</div>`;
                btnText = q.allowRetake ? 'Спробувати знову' : 'Завершено';
                if (!q.allowRetake) isBtnDisabled = true;
            } else if (isLocked) {
                statusHtml = `<div class="card-status expired status-label-inline" style="margin-bottom:8px;">${Icons.lock} Доступ закрито</div>`;
                btnText = 'Термін вичерпано';
                isBtnDisabled = true;
            }

    
            const pinnedStyle = q.isPinned 
                ? `border: 2px solid var(--primary); background: linear-gradient(180deg, #ffffff 0%, #f5f3ff 100%); box-shadow: 0 10px 25px rgba(79, 70, 229, 0.15);` 
                : '';

            const pinnedBadge = q.isPinned
                ? `<div style="display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:800; text-transform:uppercase; color:var(--primary); background:var(--primary-light); padding:4px 8px; border-radius:6px; margin-left:auto;">${Icons.shield} Закріплено</div>`
                : '';

            const safeTitle = HomePage.escapeText(q.title);
            const safeDesc = HomePage.escapeText(q.description || 'Опис відсутній');

            return `
            <div class="quiz-card-zen ${isLocked ? 'locked-state' : ''}" style="animation-delay: ${index * 0.05}s; position: relative; display: flex; flex-direction: column; ${pinnedStyle}">
                
                <div class="quiz-content card-content-padded" style="flex: 1; padding: 24px;">
                    <div class="quiz-header card-header-row" style="margin-bottom: 12px; align-items: flex-start;">
                        <div class="header-main" style="width: 100%; padding-right: 0;">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                                ${statusHtml}
                                ${pinnedBadge}
                            </div>
                            
                            <h3 class="quiz-title card-title-text" style="
                                word-break: break-word; 
                                overflow-wrap: break-word; 
                                hyphens: auto; 
                                font-size: 18px; 
                                line-height: 1.4;
                            ">${q.title}</h3>
                        </div>
                        
                        <div class="menu-container" style="margin-left: 8px; flex-shrink: 0;">
                            <button class="menu-btn-round" onclick="event.stopPropagation(); HomePage.toggleMenu('${q.id}')">⋮</button>
                            <div id="menu-${q.id}" class="dropdown-menu">
                                <button class="dropdown-item" onclick="HomePage.togglePin('${q.id}')">
                                    ${Icons.shield} ${q.isPinned ? 'Відкріпити' : 'Закріпити'}
                                </button>
                                <button class="dropdown-item" onclick="App.showInfo('${safeTitle}', '${safeDesc}')">
                                    ${Icons.info} Деталі тесту
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="quiz-meta card-meta-bottom" style="margin-top: auto; padding-top:16px; border-top:1px solid rgba(0,0,0,0.05);">
                        <div class="meta-item" data-hint="Кількість питань">${Icons.book} <span>${q.questions.length}</span></div>
                        <div class="meta-item" data-hint="Кінцевий термін">${Icons.calendar} <span>${q.deadline ? new Date(q.deadline).toLocaleDateString('uk-UA') : '∞'}</span></div>
                        ${q.timeLimit > 0 ? `<div class="meta-item" data-hint="Ліміт часу">${Icons.help} <span>${Math.floor(q.timeLimit / 60)} хв</span></div>` : ''}
                    </div>
                </div>

                <div class="q-card-footer">
                    <button onclick="App.pages.quiz.init('${q.id}')" class="${btnClass}" ${isBtnDisabled ? 'disabled' : ''}>
                        ${btnText}
                    </button>
                    <button class="btn-info-square" data-hint="Інформація" onclick="App.showInfo('${safeTitle}', '${safeDesc}')">
                        ${Icons.info}
                    </button>
                </div>
            </div>`;
        }).join('');
    }
};

window.HomePage = HomePage;