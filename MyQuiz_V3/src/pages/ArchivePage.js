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
        if(btn) btn.innerText = ArchivePage.state.sort === 'asc' ? 'AZ' : 'ZA';
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
        <div class="empty-state">
            <div class="empty-icon">${Icons.archive}</div>
            <h3 style="font-size:22px; font-weight:800; margin-bottom:8px;">${ArchivePage.state.search ? 'В архіві нічого не знайдено' : 'Архів порожній'}</h3>
            <p style="color:var(--text-muted); max-width:320px; font-weight:500;">
                ${ArchivePage.state.search ? 'Спробуйте інше ключове слово.' : 'Заархівовані тести будуть зберігатися тут для відновлення або видалення.'}
            </p>
        </div>`;
    return;
}

        container.innerHTML = quizzes.map(q => `
            <div class="quiz-card manage-mode archived-item" style="opacity: 0.85;">
                <div class="quiz-content" style="padding: 28px;">
                    <div class="quiz-header" style="margin-bottom: 20px;">
                        <h3 class="quiz-title" style="color: var(--text-secondary);">${q.title}</h3>
                        <div class="card-status expired" style="margin: 0;">${Icons.lock} В архіві</div>
                    </div>
                    
                    <div class="quiz-meta" style="padding-top: 20px; border-top: 1px solid var(--border);">
                        <div class="meta-item">${Icons.book} <span>${q.questions.length} питань</span></div>
                        <div class="meta-item">${Icons.calendar} <span>Створено: ${Storage.formatDate(q.created)}</span></div>
                    </div>
                </div>
                
                <div class="manage-footer-grid">
                    <button onclick="App.pages.archive.restore('${q.id}')" class="manage-tile" style="grid-column: span 1;">
                        ${Icons.check} <span>Відновити</span>
                    </button>
                    <button onclick="App.pages.archive.delete('${q.id}')" class="manage-tile" style="grid-column: span 1; color: var(--danger);">
                        ${Icons.trash} <span>Видалити</span>
                    </button>
                </div>
            </div>`).join('');
    },

    restore: (id) => {
        const q = Storage.getQuizById(id);
        q.isArchived = false;
        Storage.saveQuiz(q);
        Toast.show('Тест відновлено');
        ArchivePage.renderList();
    },

    delete: (id) => {
        App.showConfirm('Видалити тест з архіву назавжди? Цю дію неможливо скасувати.', () => {
            Storage.deleteQuiz(id);
            Toast.show('Видалено остаточно');
            ArchivePage.renderList();
        });
    }
};