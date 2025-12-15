import { Storage } from '../storage/storage.js';
import { Toast } from '../utils/toast.js';

export const ManagePage = {
    state: {
        search: '',
        sort: 'asc'
    },

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
        
        let quizzes = Storage.getQuizzes();

        if (ManagePage.state.search) {
            quizzes = quizzes.filter(q => q.title.toLowerCase().includes(ManagePage.state.search));
        }

        quizzes.sort((a, b) => {
            return ManagePage.state.sort === 'asc' 
                ? a.title.localeCompare(b.title) 
                : b.title.localeCompare(a.title);
        });
        
        if (!quizzes.length) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <span class="empty-icon">📝</span>
                    <h3>${ManagePage.state.search ? 'Нічого не знайдено' : 'Список порожній'}</h3>
                    ${!ManagePage.state.search ? '<button onclick="App.route(\'create\')" class="btn-primary" style="margin-top:15px;">Створити тест</button>' : ''}
                </div>`;
            return;
        }

        container.innerHTML = quizzes.map(q => `
            <div class="card">
                <div style="margin-bottom:16px;">
                    <h3>${q.title}</h3>
                    <span style="color:var(--text-light); font-size:12px;">Створено: ${Storage.formatDate(q.created)}</span>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:auto;">
                    <button onclick="App.pages.editor.init('${q.id}')" class="btn-secondary">Змінити</button>
                    <button onclick="App.pages.manage.duplicate('${q.id}')" class="btn-secondary">Копія</button>
                    <button onclick="App.pages.manage.delete('${q.id}')" class="btn-danger" style="grid-column: span 2;">Видалити</button>
                </div>
            </div>`).join('');
    },

    duplicate: (id) => {
        Storage.duplicateQuiz(id);
        Toast.show('Тест дубльовано');
        ManagePage.renderList();
    },

    delete: (id) => {
        App.showConfirm('Ви впевнені, що хочете видалити цей тест? Цю дію неможливо скасувати.', () => {
            Storage.deleteQuiz(id);
            Toast.show('Тест видалено');
            ManagePage.renderList();
        });
    }
};