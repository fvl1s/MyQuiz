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
        if (btn) btn.innerText = ManagePage.state.sort === 'asc' ? 'AZ' : 'ZA';
        ManagePage.renderList();
    },

    renderList: () => {
        const container = document.getElementById('list-manage');
        if (!container) return;

        let quizzes = Storage.getQuizzes().filter(q => !q.isArchived);

        if (ManagePage.state.search) {
            quizzes = quizzes.filter(q => q.title.toLowerCase().includes(ManagePage.state.search));
        }

        quizzes.sort((a, b) => ManagePage.state.sort === 'asc' 
            ? a.title.localeCompare(b.title) 
            : b.title.localeCompare(a.title));

        if (!quizzes.length) {
            container.innerHTML = `
                <div class="archive-empty-zen">
                    <div class="empty-icon">${Icons.manage}</div>
                    <h3>${ManagePage.state.search ? 'Нічого не знайдено' : 'Список тестів порожній'}</h3>
                    <p>Створіть свій перший тест, щоб почати роботу.</p>
                </div>`;
            return;
        }

        container.innerHTML = quizzes.map((q, index) => {
            const isClosed = q.isClosed === true;
            return `
            <div class="quiz-card manage-mode ${isClosed ? 'is-closed' : 'is-active'}" style="animation-delay: ${index * 0.05}s">
                <div class="quiz-content card-content-padded">
                    <div class="quiz-header card-header-row">
                        <div class="header-main">
                            <div class="card-status ${isClosed ? 'expired' : 'active'} status-label-inline">
                                ${isClosed ? Icons.lock : Icons.check} ${isClosed ? 'Закритий' : 'Активний'}
                            </div>
                            <h3 class="quiz-title card-title-text">${q.title}</h3>
                        </div>
                        <button onclick="App.pages.manage.removeQuiz('${q.id}')" class="btn-icon-danger" title="Видалити">
                            ${Icons.trash}
                        </button>
                    </div>
                    <div class="quiz-meta card-meta-bottom">
                        <div class="meta-item">${Icons.book} <span>${q.questions.length} питань</span></div>
                        <div class="meta-item">${Icons.calendar} <span>${new Date(q.created).toLocaleDateString()}</span></div>
                    </div>
                </div>
                
                <div class="manage-actions-area">
                    <button onclick="App.pages.editor.init('${q.id}')" class="btn-edit-main">
                        ${Icons.manage} Редагувати тест
                    </button>
                    <div class="manage-tools-grid">
                        <button onclick="App.pages.manage.copyLink('${q.id}')" class="tool-btn" title="Копіювати посилання">${Icons.link}</button>
                        <button onclick="App.pages.manage.duplicate('${q.id}')" class="tool-btn" title="Створити копію">${Icons.archive}</button>
                        <button onclick="App.pages.manage.toggleStatus('${q.id}')" class="tool-btn" title="${isClosed ? 'Відкрити' : 'Закрити'}">${isClosed ? Icons.check : Icons.lock}</button>
                        <button onclick="App.pages.manage.moveToArchive('${q.id}')" class="tool-btn" title="В архів">${Icons.shield}</button>
                    </div>
                </div>
            </div>`;
        }).join('');
    },

    toggleStatus: (id) => {
        const quiz = Storage.getQuizById(id);
        if (!quiz) return;
        quiz.isClosed = !quiz.isClosed;
        Storage.saveQuiz(quiz);
        Toast.show(quiz.isClosed ? 'Тест закрито для проходження' : 'Тест відкрито для проходження');
        ManagePage.renderList();
    },

    copyLink: (id) => {
        const url = `${window.location.origin}${window.location.pathname}?page=run&id=${id}`;
        navigator.clipboard.writeText(url).then(() => Toast.show('Посилання скопійовано в буфер'));
    },

    moveToArchive: (id) => {
        const quiz = Storage.getQuizById(id);
        if (!quiz) return;
        quiz.isArchived = true;
        quiz.isClosed = true;
        Storage.saveQuiz(quiz);
        Toast.show('Тест переміщено в архів');
        ManagePage.renderList();
    },

    duplicate: (id) => {
        Storage.duplicateQuiz(id);
        Toast.show('Копію тесту створено');
        ManagePage.renderList();
    },

    removeQuiz: (id) => {
        App.showConfirm('Видалити цей тест та всі його результати?', () => {
            Storage.deleteQuiz(id);
            Toast.show('Тест повністю видалено');
            ManagePage.renderList();
        });
    }
};