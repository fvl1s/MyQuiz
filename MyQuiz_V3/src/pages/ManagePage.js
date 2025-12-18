import { Storage } from '../storage/storage.js';
import { Toast } from '../utils/toast.js';
import { Icons } from '../utils/icons.js';

export const ManagePage = {
    state: { search: '', sort: 'asc' },
    render: () => {
        ManagePage.state.search = '';
        ManagePage.state.sort = 'asc';
        ManagePage.renderList();
    },
    search: (val) => {
        ManagePage.state.search = val.toLowerCase();
        ManagePage.renderList();
    },
    toggleSort: () => {
        ManagePage.state.sort = ManagePage.state.sort === 'asc' ? 'desc' : 'asc';
        const btn = document.getElementById('sort-btn-manage');
        if(btn) btn.innerText = ManagePage.state.sort === 'asc' ? 'AZ' : 'ZA';
        ManagePage.renderList();
    },
    renderList: () => {
        const container = document.getElementById('list-manage');
        if (!container) return;
        let quizzes = Storage.getQuizzes().filter(q => !q.isArchived);
        if (ManagePage.state.search) quizzes = quizzes.filter(q => q.title.toLowerCase().includes(ManagePage.state.search));
        quizzes.sort((a, b) => ManagePage.state.sort === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));
        
        if (!quizzes.length) {
            container.innerHTML = `<div class="empty-state"><div class="empty-icon">${Icons.manage}</div><h3>${ManagePage.state.search ? 'Нічого не знайдено' : 'Список порожній'}</h3></div>`;
            return;
        }

        container.innerHTML = quizzes.map(q => {
            const isClosed = q.isClosed === true;
            const statusClass = isClosed ? 'expired' : 'active';
            const statusText = isClosed ? 'Закритий' : 'Активний';
            return `
            <div class="quiz-card manage-mode ${isClosed ? 'expired' : ''}">
                <div class="quiz-content" style="padding: 28px;">
                    <div class="quiz-header" style="margin-bottom: 20px;">
                        <h3 class="quiz-title">${q.title}</h3>
                        <button class="btn-icon-link" onclick="App.pages.manage.copyLink('${q.id}')">${Icons.link}</button>
                    </div>
                    <div class="card-status ${statusClass}" style="margin-bottom: 24px;">
                        ${isClosed ? Icons.lock : Icons.check} ${statusText}
                    </div>
                    <div class="quiz-meta" style="padding-top: 20px; border-top: 1px solid var(--border);">
                        <div class="meta-item">${Icons.book} <span>${q.questions.length} питань</span></div>
                        <div class="meta-item">${Icons.calendar} <span>${new Date(q.created).toLocaleDateString()}</span></div>
                    </div>
                </div>
                <div class="manage-footer-grid">
                    <button onclick="App.pages.editor.init('${q.id}')" class="manage-tile">${Icons.manage} <span>Змінити</span></button>
                    <button onclick="App.pages.manage.duplicate('${q.id}')" class="manage-tile">${Icons.archive} <span>Копія</span></button>
                    <button onclick="App.pages.manage.toggleStatus('${q.id}')" class="manage-tile">${isClosed ? Icons.check : Icons.lock} <span>${isClosed ? 'Відкрити' : 'Закрити'}</span></button>
                    <button onclick="App.pages.manage.moveToArchive('${q.id}')" class="manage-tile">${Icons.shield} <span>Архів</span></button>
                    <button onclick="App.pages.manage.delete('${q.id}')" class="manage-tile-danger" style="grid-column: span 2;">${Icons.trash} <span>Видалити</span></button>
                </div>
            </div>`;
        }).join('');
    },
    toggleStatus: (id) => {
        const quiz = Storage.getQuizById(id);
        if (!quiz) return;
        quiz.isClosed = !quiz.isClosed;
        Storage.saveQuiz(quiz); 
        Toast.show(quiz.isClosed ? 'Тест закрито' : 'Тест відкрито');
        ManagePage.renderList(); 
    },
    copyLink: (id) => {
        const url = `${window.location.origin}${window.location.pathname}?page=run&id=${id}`;
        navigator.clipboard.writeText(url).then(() => Toast.show('Посилання скопійовано'));
    },
    moveToArchive: (id) => {
        const quiz = Storage.getQuizById(id);
        quiz.isArchived = true; quiz.isClosed = true;
        Storage.saveQuiz(quiz);
        Toast.show('В архіві');
        ManagePage.renderList();
    },
    duplicate: (id) => { Storage.duplicateQuiz(id); Toast.show('Копію створено'); ManagePage.renderList(); },
    delete: (id) => { App.showConfirm('Видалити тест?', () => { Storage.deleteQuiz(id); Toast.show('Видалено'); ManagePage.renderList(); }); }
};