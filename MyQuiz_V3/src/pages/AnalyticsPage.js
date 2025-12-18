import { Storage } from '../storage/storage.js';
import { Icons } from '../utils/icons.js';
import { Toast } from '../utils/toast.js';

export const AnalyticsPage = {
    state: { view: 'general', currentQuizId: null },

    render: () => {
        AnalyticsPage.state.view = 'general';
        AnalyticsPage.renderGeneral();
    },

    search: (val) => {
        const term = val.toLowerCase();
        document.querySelectorAll('#ana-list-general tr').forEach(row => {
            const title = row.querySelector('strong')?.innerText.toLowerCase() || '';
            row.style.display = title.includes(term) ? '' : 'none';
        });
    },

    renderGeneral: () => {
        const listContainer = document.getElementById('ana-list-general');
        if (!listContainer) return;

        document.getElementById('ana-breadcrumbs').innerHTML = '<span class="breadcrumb-current">Огляд результатів</span>';
        document.getElementById('ana-view-general').classList.remove('hidden');
        document.getElementById('ana-view-quiz').classList.add('hidden');
        document.getElementById('ana-view-result').classList.add('hidden');

        const quizzes = Storage.getQuizzes().filter(q => !q.isArchived);
        const results = Storage.getResults();

        if (quizzes.length === 0) {
            listContainer.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:60px;">Дані відсутні</td></tr>`;
            return;
        }

        const tableHeader = document.querySelector('#ana-view-general thead tr');
        if(tableHeader) {
            tableHeader.innerHTML = `
                <th>Тест</th>
                <th style="text-align:center">Студентів</th>
                <th style="text-align:center">Сер. успішність</th>
                <th style="text-align:center">Останній запис</th>
                <th style="text-align:center; width:100px;">Деталі</th>
            `;
        }

        listContainer.innerHTML = quizzes.map(q => {
            const qRes = results.filter(r => r.quizId === q.id);
            const count = qRes.length;
            const avgPct = count > 0 ? Math.round(qRes.reduce((a, b) => a + b.percent, 0) / count) : 0;
            const lastDate = count > 0 ? new Date(qRes[count - 1].date).toLocaleDateString() : '-';
            
            return `
            <tr class="user-row" onclick="App.pages.analytics.openQuizDetail('${q.id}')">
                <td>
                    <strong>${q.title}</strong><br>
                    <small style="color:var(--text-muted)">${q.questions.length} питань</small>
                </td>
                <td style="text-align:center"><span class="badge badge-neutral">${count}</span></td>
                <td style="text-align:center; font-weight:800; color:${avgPct >= 50 ? 'var(--success-text)' : 'var(--danger-text)'}">
                    ${count > 0 ? avgPct + '%' : '-'}
                </td>
                <td style="text-align:center; color:var(--text-muted)">${lastDate}</td>
                <td style="text-align:center; vertical-align:middle;">
                    <div style="display:flex; justify-content:center;">
                        <button class="btn-icon-sm" style="background:var(--bg-body); border:1px solid var(--border); border-radius:8px; width:32px; height:32px; cursor:pointer; display:flex; align-items:center; justify-content:center;">
                            ${Icons.plus}
                        </button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    },

    openQuizDetail: (quizId) => {
        AnalyticsPage.state.view = 'quiz';
        AnalyticsPage.state.currentQuizId = quizId;
        const quiz = Storage.getQuizById(quizId);
        if (!quiz) return;

        const results = Storage.getResults().filter(r => r.quizId === quizId);

        document.getElementById('ana-breadcrumbs').innerHTML = `
            <span class="breadcrumb-item" onclick="App.pages.analytics.render()" style="cursor:pointer; color:var(--primary);">Огляд результатів</span>
            <span class="breadcrumb-separator" style="margin:0 8px; color:var(--text-muted);">/</span>
            <span class="breadcrumb-current" style="font-weight:800;">${quiz.title}</span>
        `;

        const quizView = document.getElementById('ana-view-quiz');
        document.getElementById('ana-view-general').classList.add('hidden');
        document.getElementById('ana-view-result').classList.add('hidden');
        quizView.classList.remove('hidden');

        quizView.innerHTML = `
            <div class="table-card" style="background:white; border:1px solid var(--border); border-radius:20px; overflow:hidden;">
                <table style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr style="background:#f8fafc; border-bottom:1px solid var(--border);">
                            <th style="text-align:left; padding:16px 24px;">Студент</th>
                            <th style="text-align:center; padding:16px 24px;">Бали</th>
                            <th style="text-align:center; padding:16px 24px;">Успішність</th>
                            <th style="text-align:center; padding:16px 24px;">Дата</th>
                            <th style="text-align:right; padding:16px 24px; width:100px;">Дії</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.map(r => `
                        <tr class="user-row" onclick="App.pages.analytics.openUserResult('${r.id}')">
                            <td style="padding:16px 24px;"><strong>${r.student || 'Гість'}</strong></td>
                            <td style="padding:16px 24px; text-align:center;">${r.score} / ${r.max || 0}</td>
                            <td style="padding:16px 24px; text-align:center;">
                                <span class="badge ${r.percent >= 50 ? 'badge-success' : 'badge-danger'}" style="padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700;">${r.percent}%</span>
                            </td>
                            <td style="padding:16px 24px; text-align:center; color:var(--text-muted); font-size:12px;">
                                ${new Date(r.date).toLocaleString()}
                            </td>
                            <td style="padding:16px 24px; text-align:right;">
                                <div style="display:flex; justify-content:flex-end;">
                                    <button class="btn-icon-sm" style="color:var(--danger); background:var(--danger-bg); border:none; width:32px; height:32px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center;" onclick="event.stopPropagation(); App.pages.analytics.deleteResult('${r.id}')">
                                        ${Icons.trash}
                                    </button>
                                </div>
                            </td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    openUserResult: (resultId) => {
        const results = Storage.getResults();
        const res = results.find(r => String(r.id) === String(resultId));
        
        if (!res) {
            Toast.show('Помилка: Результат не знайдено');
            return;
        }

        AnalyticsPage.state.view = 'result';
        const quiz = Storage.getQuizById(res.quizId);
        if (!quiz) return;

        document.getElementById('ana-breadcrumbs').innerHTML = `
            <span class="breadcrumb-item" onclick="App.pages.analytics.render()" style="cursor:pointer; color:var(--primary);">Огляд</span> / 
            <span class="breadcrumb-item" onclick="App.pages.analytics.openQuizDetail('${quiz.id}')" style="cursor:pointer; color:var(--primary);">${quiz.title}</span> / 
            <span class="breadcrumb-current">${res.student}</span>
        `;

        document.getElementById('ana-view-quiz').classList.add('hidden');
        const resView = document.getElementById('ana-view-result');
        resView.classList.remove('hidden');

        let html = `
            <div class="run-card-wide" style="margin-bottom:32px; padding:32px; border-left:8px solid var(--primary); text-align:left;">
                <div style="font-size:14px; color:var(--text-muted); text-transform:uppercase; font-weight:800; margin-bottom:8px;">Детальний звіт</div>
                <div style="font-size:48px; font-weight:900; color:var(--text-main); line-height:1;">${res.percent}%</div>
                <div style="font-weight:700; margin-top:10px;">${res.score} з ${res.max} балів</div>
            </div>`;

        html += quiz.questions.map((q, i) => {
            const isWrong = res.wrongIndices && res.wrongIndices.includes(i);
            return `
                <div class="card" style="margin-bottom:16px; border-left:4px solid ${isWrong ? 'var(--danger)' : 'var(--success)'};">
                    <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                        <span class="q-number">ПИТАННЯ ${i + 1}</span>
                        <span style="font-weight:800; color:${isWrong ? 'var(--danger)' : 'var(--success)'};">${isWrong ? '❌ Невірно' : '✅ Вірно'}</span>
                    </div>
                    <p style="font-weight:700; font-size:16px;">${q.text}</p>
                </div>`;
        }).join('');

        resView.innerHTML = `<div style="max-width:800px; margin:0 auto;">${html}</div>`;
    },

    deleteResult: (resultId) => {
        App.showConfirm("Видалити цей результат?", () => {
            const results = Storage.getResults().filter(r => String(r.id) !== String(resultId));
            localStorage.setItem('mq_results', JSON.stringify(results));
            Toast.show("Результат видалено");
            
            if (AnalyticsPage.state.view === 'quiz') {
                AnalyticsPage.openQuizDetail(AnalyticsPage.state.currentQuizId);
            } else {
                AnalyticsPage.render();
            }
        });
    }
};