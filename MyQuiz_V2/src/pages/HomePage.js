import { Storage } from '../storage/storage.js';

export const HomePage = {
    state: {
        search: '',
        sort: 'asc' // 'asc' or 'desc'
    },

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
        if(btn) btn.innerText = HomePage.state.sort === 'asc' ? 'AZ' : 'ZA';
        HomePage.renderList();
    },

    renderList: () => {
        const container = document.getElementById('list-home');
        if(!container) return;

        let quizzes = Storage.getQuizzes();
        const results = Storage.getResults();

        // Filter
        if (HomePage.state.search) {
            quizzes = quizzes.filter(q => q.title.toLowerCase().includes(HomePage.state.search));
        }

        // Sort
        quizzes.sort((a, b) => {
            if (HomePage.state.sort === 'asc') {
                return a.title.localeCompare(b.title);
            } else {
                return b.title.localeCompare(a.title);
            }
        });
        
        if (!quizzes.length) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <span class="empty-icon">📂</span>
                    <h3>${HomePage.state.search ? 'Нічого не знайдено' : 'Немає доступних тестів'}</h3>
                    ${!HomePage.state.search ? '<p>Створіть свій перший тест, щоб почати.</p><button onclick="App.route(\'create\')" class="btn-primary" style="margin-top:20px;">Створити тест</button>' : ''}
                </div>
            `;
            return;
        }

        container.innerHTML = quizzes.map(q => {
            const passed = results.some(r => r.quizId === q.id);
            const isDisabled = passed && q.allowRetake === false;
            
            let badge = '';
            if (passed) {
                badge = '<span class="badge badge-success">Пройдено</span>';
            }
            
            const qCount = q.questions.length;
            const qWord = HomePage.getPlural(qCount, 'питання', 'питання', 'питань');
            
            let meta = `<div style="font-size:13px; color:var(--text-light); margin-bottom: 20px;">
                <span>📝 ${qCount} ${qWord}</span>`;
            
            if (q.timeLimit > 0) {
                const h = Math.floor(q.timeLimit / 3600);
                const m = Math.floor((q.timeLimit % 3600) / 60);
                let timeStr = '';
                if (h > 0) timeStr += `${h} год `;
                if (m > 0 || h === 0) timeStr += `${m} хв`;
                meta += ` &nbsp;•&nbsp; ⏱️ ${timeStr}`;
            }
            meta += `</div>`;

            const safeTitle = q.title.replace(/'/g, "&apos;").replace(/"/g, "&quot;");
            const safeDesc = (q.description || '').replace(/'/g, "&apos;").replace(/"/g, "&quot;").replace(/\n/g, "\\n");

            return `
            <div class="card ${isDisabled ? 'card-disabled' : ''}">
                <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:12px;">
                    ${badge || '<div></div>'}
                    <button class="btn-icon" title="Інформація" onclick="App.showInfo('${safeTitle}', '${safeDesc}')">i</button>
                </div>
                <h3>${q.title}</h3>
                ${meta}
                <button onclick="App.pages.quiz.init('${q.id}')" class="btn-primary" style="width:100%" ${isDisabled ? 'disabled' : ''}>
                    ${isDisabled ? 'Тест пройдено' : 'Почати'}
                </button>
            </div>`;
        }).join('');
    },

    getPlural: (n, one, two, five) => {
        let nAbs = Math.abs(n);
        nAbs %= 100;
        if (nAbs >= 5 && nAbs <= 20) {
            return five;
        }
        nAbs %= 10;
        if (nAbs === 1) {
            return one;
        }
        if (nAbs >= 2 && nAbs <= 4) {
            return two;
        }
        return five;
    }
};