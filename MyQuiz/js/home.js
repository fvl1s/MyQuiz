const Home = {
    deleteTargetId: null,
    render: () => {
        const grid = document.getElementById('grid-home');
        const list = Data.getQuizzes();
        
        if (list.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📂</div>
                    <h3>Тут поки що порожньо</h3>
                    <p style="margin:0">Створіть свій перший тест!</p>
                </div>`;
            return;
        }

        grid.innerHTML = list.map(q => {
            const isPassed = Data.getResults().some(r => r.quizId === q.id);
            const isLocked = !q.allowRetake && isPassed;

            let btnHtml = '';
            if (isLocked) {
                btnHtml = `<div class="btn-disabled">Вже пройдено</div>`;
            } else {
                btnHtml = `<button onclick="Runner.start('${q.id}')" class="btn-primary" style="width:100%">Пройти тест</button>`;
            }

            return `
            <div class="card">
                <h3>${q.title}</h3>
                <p>${q.questions.length} питань</p>
                <div class="card-footer">
                    ${btnHtml}
                </div>
            </div>`;
        }).join('');
    },

    renderManage: () => {
        const grid = document.getElementById('grid-manage');
        const list = Data.getQuizzes();
        
        if (list.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">✏️</div>
                    <h3>Немає тестів</h3>
                    <p style="margin:0">Перейдіть у вкладку "Створити".</p>
                </div>`;
            return;
        }

        grid.innerHTML = list.map(q => `
            <div class="card">
                <h3>${q.title}</h3>
                <p>${q.questions.length} питань</p>
                <div class="card-footer" style="border-top:1px solid var(--border); padding-top:15px; margin-top:15px;">
                     <button onclick="Builder.edit('${q.id}')" class="btn-icon" title="Редагувати">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                     </button>
                     <button onclick="Home.askDel('${q.id}')" class="btn-icon del" title="Видалити">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                     </button>
                </div>
            </div>
        `).join('');
    },

    renderHistory: () => {
        const div = document.getElementById('history-list');
        const results = Data.getResults().sort((a,b) => new Date(b.date) - new Date(a.date));
        
        if(results.length === 0) {
            div.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📈</div>
                    <h3>Історія порожня</h3>
                    <p style="margin:0">Результати з'являться тут.</p>
                </div>`;
            return;
        }

        div.innerHTML = results.map(r => {
            let scoreClass = 'avg'; 
            if (r.percent >= 80) scoreClass = 'good'; // Зеленый
            else if (r.percent < 50) scoreClass = 'bad'; // Красный

            return `
            <div class="history-item">
                <div>
                    <div class="h-date">${new Date(r.date).toLocaleString('uk-UA')}</div>
                    <div class="h-title">${r.quizTitle}</div>
                </div>
                <div style="display:flex; align-items:center; gap:20px;">
                    <div class="h-score ${scoreClass}">${r.percent}%</div>
                    <button onclick="Results.showReview('${r.date}')" class="btn-icon" title="Переглянути звіт">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                </div>
            </div>`;
        }).join('');
    },

    askDel: (id) => {
        Home.deleteTargetId = id;
        const modal = document.getElementById('modal-delete');
        if(modal) {
            modal.classList.remove('hidden');
            setTimeout(() => modal.classList.add('open'), 10);
        }
    },

    closeModal: () => {
        const modal = document.getElementById('modal-delete');
        if(modal) {
            modal.classList.remove('open');
            setTimeout(() => modal.classList.add('hidden'), 300);
        }
        Home.deleteTargetId = null;
    },

    confirmDel: () => {
        if (Home.deleteTargetId) {
            Data.deleteFull(Home.deleteTargetId);
            Home.renderManage();
            
            const t = document.getElementById('toast');
            if(t) {
                t.innerText = "Тест видалено";
                t.classList.add('show');
                setTimeout(()=>t.classList.remove('show'), 3000);
            }
        }
        Home.closeModal();
    }
};