import { Storage } from '../storage/storage.js';
import { Toast } from '../utils/toast.js';

export const AnalyticsPage = {
    state: {
        search: '',
        sort: 'asc'
    },

    render: () => {
        AnalyticsPage.state.search = '';
        AnalyticsPage.state.sort = 'asc';
        AnalyticsPage.renderList();
    },

    search: (val) => {
        AnalyticsPage.state.search = val.toLowerCase();
        AnalyticsPage.renderList();
    },

    toggleSort: () => {
        AnalyticsPage.state.sort = AnalyticsPage.state.sort === 'asc' ? 'desc' : 'asc';
        const btn = document.getElementById('sort-btn-analytics');
        if(btn) btn.innerText = AnalyticsPage.state.sort === 'asc' ? 'AZ' : 'ZA';
        AnalyticsPage.renderList();
    },

    renderList: () => {
        const tbody = document.getElementById('ana-list-general');
        if (!tbody) return;

        let quizzes = Storage.getQuizzes();
        const results = Storage.getResults();

        if (AnalyticsPage.state.search) {
            quizzes = quizzes.filter(q => q.title.toLowerCase().includes(AnalyticsPage.state.search));
        }

        quizzes.sort((a, b) => {
            return AnalyticsPage.state.sort === 'asc' 
                ? a.title.localeCompare(b.title) 
                : b.title.localeCompare(a.title);
        });

        if (!quizzes.length) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--text-light)">Нічого не знайдено</td></tr>';
            return;
        }

        tbody.innerHTML = quizzes.map(q => {
            const qRes = results.filter(r => r.quizId === q.id);
            const count = qRes.length;
            
            let avgPct = 0;
            let avgScore = 0;
            
            if (count > 0) {
                const sumPct = qRes.reduce((acc, r) => acc + r.percent, 0);
                avgPct = Math.round(sumPct / count);
                
                const sumScore = qRes.reduce((acc, r) => acc + r.score, 0);
                avgScore = (sumScore / count).toFixed(1);
            }

            return `
            <tr>
                <td><strong>${q.title}</strong></td>
                <td><span class="badge badge-neutral">${count}</span></td>
                <td>${count ? avgScore : '-'}</td>
                <td style="font-weight:600; color:${avgPct>=50 ? 'var(--success)' : 'var(--danger)'}">${count ? avgPct + '%' : '-'}</td>
                <td style="text-align:right"><button onclick="App.pages.analytics.showDetail('${q.id}')" class="btn-ghost" style="color:var(--primary)">Детальніше →</button></td>
            </tr>`;
        }).join('');
    },

    showDetail: (id) => {
        App.route('analytics-detail');
        AnalyticsPage.currentQuizId = id; // Save ID for refresh
        const q = Storage.getQuizById(id);
        const results = Storage.getResults().filter(r => r.quizId === id).reverse();
        
        document.getElementById('ana-title-detail').innerText = q.title;
        
        const errorBox = document.getElementById('ana-error-box');
        if (results.length > 0) {
            const errorCounts = {};
            q.questions.forEach((_, idx) => errorCounts[idx] = 0);
            
            results.forEach(r => {
                if (r.wrongIndices) {
                    r.wrongIndices.forEach(idx => {
                        if (errorCounts[idx] !== undefined) errorCounts[idx]++;
                    });
                }
            });

            const sortedErrors = Object.entries(errorCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .filter(([,count]) => count > 0);

            if (sortedErrors.length > 0) {
                errorBox.className = 'error-stats-box';
                errorBox.innerHTML = '<h3 style="margin-top:0; color:#991b1b; font-size:16px;">Топ помилок</h3>' + 
                sortedErrors.map(([idx, count]) => {
                    const qText = q.questions[idx].text;
                    return `<div class="error-item">
                        <span>${parseInt(idx)+1}. ${qText}</span>
                        <span class="badge" style="background:#fee2e2; color:#991b1b">${count} помил.</span>
                    </div>`;
                }).join('');
            } else {
                errorBox.className = 'hidden';
            }
        } else {
            errorBox.className = 'hidden';
        }

        const tbody = document.getElementById('ana-list-detail');
        
        if (!results.length) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px;">Ніхто ще не проходив цей тест</td></tr>';
        } else {
            tbody.innerHTML = results.map(r => `
                <tr>
                    <td>
                        <div style="font-weight:600">${r.student}</div>
                    </td>
                    <td style="color:var(--text-light)">${Storage.formatDate(r.date)}</td>
                    <td>${r.score} з ${r.max}</td>
                    <td>
                        <span class="badge" style="background:${r.percent >= 50 ? '#dcfce7' : '#fee2e2'}; color:${r.percent >= 50 ? '#166534' : '#991b1b'}">
                            ${r.percent}%
                        </span>
                    </td>
                    <td>
                        <button class="btn-icon-del" title="Видалити результат" onclick="App.pages.analytics.deleteResult('${r.date}')">🗑️</button>
                    </td>
                </tr>
            `).join('');
        }
    },

    deleteResult: (dateStr) => {
        App.showConfirm('Видалити цей результат? Студент зможе пройти тест заново.', () => {
            Storage.deleteResult(dateStr);
            Toast.show('Результат видалено');
            if (AnalyticsPage.currentQuizId) {
                AnalyticsPage.showDetail(AnalyticsPage.currentQuizId);
            }
        });
    }
};