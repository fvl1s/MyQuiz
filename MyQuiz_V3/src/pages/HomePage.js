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
        document.querySelectorAll('.dropdown-menu').forEach(m => m.id !== `menu-${id}` && m.classList.remove('show'));
        const menu = document.getElementById(`menu-${id}`);
        if (menu) menu.classList.toggle('show');
    },
    togglePin: (id) => { 
        Storage.toggleQuizPin(id);
        HomePage.renderList(); 
    },
    showInfo: (id) => {
        const q = Storage.getQuizById(id);
        if (window.App && window.App.showInfo) {
            window.App.showInfo(q.title, q.description);
        }
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
            return HomePage.state.sort === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        });
        if (!quizzes.length) {
            container.innerHTML = `<div class="empty-state"><div class="empty-icon">${Icons.book}</div><h3 style="font-size:22px; font-weight:800; margin-bottom:8px;">${HomePage.state.search ? 'Нічого не знайдено' : 'Наразі немає активних тестів'}</h3></div>`;
            return;
        }
        container.innerHTML = quizzes.map((q, index) => {
            const passed = results.some(r => r.quizId === q.id);
            const isLocked = q.isClosed === true || (q.deadline && new Date() > new Date(q.deadline));
            let cardStateClass = 'active';
            let statusBadge = `<div class="card-status active">${Icons.check} Активний</div>`;
            let btnText = 'Почати тест';
            let btnDisabled = false;
            if (passed) {
                cardStateClass = 'passed';
                statusBadge = `<div class="card-status passed">${Icons.check} Пройдено</div>`;
                btnText = q.allowRetake ? 'Пройти ще раз' : 'Завершено';
                if (!q.allowRetake) btnDisabled = true;
            } else if (isLocked) {
                cardStateClass = 'expired';
                statusBadge = `<div class="card-status expired">${Icons.lock} Закритий</div>`;
                btnText = 'Доступ обмежено';
                btnDisabled = true;
            }
            return `
            <div class="quiz-card ${cardStateClass} ${q.isPinned ? 'pinned' : ''}" style="animation-delay: ${index * 0.05}s">
                ${q.isPinned ? `<div class="pin-badge">${Icons.shield} Закріплено</div>` : ''}
                <div class="quiz-content" style="padding: 28px;">
                    <div class="quiz-header">
                        <h3 class="quiz-title">${q.title}</h3>
                        <div style="position: relative;">
                            <button class="menu-btn" onclick="event.stopPropagation(); App.pages.home.toggleMenu('${q.id}')">⋮</button>
                            <div id="menu-${q.id}" class="dropdown-menu">
                                <button class="dropdown-item" onclick="App.pages.home.togglePin('${q.id}')">${Icons.shield} ${q.isPinned ? 'Відкріпити' : 'Закріпити'}</button>
                            </div>
                        </div>
                    </div>
                    ${statusBadge}
                    <div class="quiz-meta" style="margin-top: auto; padding-top: 16px; border-top: 1px solid #f1f5f9;">
                        <div class="meta-item">${Icons.book} <span>${q.questions.length} питань</span></div>
                        <div class="meta-item">${Icons.calendar} <span>Дедлайн: ${q.deadline ? new Date(q.deadline).toLocaleDateString() : 'Немає'}</span></div>
                    </div>
                </div>
                <div class="quiz-footer">
                    <button onclick="App.pages.quiz.init('${q.id}')" class="btn-primary" ${btnDisabled ? 'disabled' : ''} style="flex: 1;">${btnText}</button>
                    <button onclick="App.pages.home.showInfo('${q.id}')" class="btn-info-circle">${Icons.info}</button>
                </div>
            </div>`;
        }).join('');
    }
};