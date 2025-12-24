import { Storage } from '../storage/storage.js';
import { Toast } from '../utils/toast.js';
import { Icons } from '../utils/icons.js';

export const ArchivePage = {
    state: { search: '', sort: 'asc' },

    render: () => {
        ArchivePage.state.search = '';
        ArchivePage.state.sort = 'asc';
        ArchivePage.renderList();
    },

    search: (val) => {
        ArchivePage.state.search = val.toLowerCase();
        ArchivePage.renderList();
    },

    toggleSort: () => {
        ArchivePage.state.sort = ArchivePage.state.sort === 'asc' ? 'desc' : 'asc';
        const btn = document.getElementById('sort-btn-archive');
        if (btn) btn.innerText = ArchivePage.state.sort === 'asc' ? 'AZ' : 'ZA';
        ArchivePage.renderList();
    },

    renderList: () => {
        const container = document.getElementById('list-archive');
        if (!container) return;

        let quizzes = Storage.getQuizzes().filter(q => q.isArchived === true);

        if (ArchivePage.state.search) {
            quizzes = quizzes.filter(q => q.title.toLowerCase().includes(ArchivePage.state.search));
        }

        quizzes.sort((a, b) => {
            return ArchivePage.state.sort === 'asc' 
                ? a.title.localeCompare(b.title) 
                : b.title.localeCompare(a.title);
        });

        if (!quizzes.length) {
            container.innerHTML = `
                <div class="archive-empty-zen">
                    <div class="empty-icon">${Icons.archive}</div>
                    <h3>${ArchivePage.state.search ? 'Нічого не знайдено' : 'Архів порожній'}</h3>
                    <p>Тут з’являться тести, які ви вирішите тимчасово приховати.</p>
                </div>`;
            return;
        }

        container.innerHTML = quizzes.map((q, index) => `
            <div class="quiz-card manage-mode archive-card" style="animation-delay: ${index * 0.05}s">
                <div class="quiz-content card-content-padded">
                    <div class="quiz-header card-header-row">
                        <div class="header-main">
                            <div class="card-status expired status-label-inline">
                                ${Icons.lock} Архівний
                            </div>
                            <h3 class="quiz-title card-title-text">${q.title}</h3>
                        </div>
                        <button onclick="App.pages.archive.removeQuiz('${q.id}')" class="btn-icon-danger" title="Видалити назавжди">
                            ${Icons.trash}
                        </button>
                    </div>
                    <div class="quiz-meta card-meta-bottom">
                        <div class="meta-item">${Icons.book} <span>${q.questions.length} питань</span></div>
                        <div class="meta-item">${Icons.calendar} <span>${Storage.formatDate(q.created)}</span></div>
                    </div>
                </div>
                <div class="quiz-footer footer-no-padding">
                    <button onclick="App.pages.archive.restore('${q.id}')" class="btn-restore-full">
                        ${Icons.check} Відновити тест
                    </button>
                </div>
            </div>`).join('');
    },

    restore: (id) => {
        const q = Storage.getQuizById(id);
        if (!q) return;
        q.isArchived = false;
        q.isClosed = false;
        Storage.saveQuiz(q);
        Toast.show('Тест відновлено');
        ArchivePage.renderList();
    },

    removeQuiz: (id) => {
        App.showConfirm('Видалити цей тест назавжди? Цю дію неможливо скасувати.', () => {
            Storage.deleteQuiz(id);
            Toast.show('Тест видалено остаточно');
            ArchivePage.renderList();
        });
    }
};