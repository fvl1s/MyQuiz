import { Storage } from '../storage/storage.js';
import { Icons } from '../utils/icons.js';
import { Toast } from '../utils/toast.js';

export const AnalyticsPage = {
    state: { 
        view: 'general', 
        currentQuizId: null, 
        currentResult: null 
    },

    render: () => {
        AnalyticsPage.state.view = 'general';
        AnalyticsPage.state.currentQuizId = null;
        AnalyticsPage.renderGeneral();
    },

    search: (val) => {
        const term = val.toLowerCase();
        const rows = document.querySelectorAll('.ana-table tbody tr');
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    },

    renderGeneral: () => {
        const container = document.getElementById('ana-view-general');
        const listContainer = document.getElementById('ana-list-general');
        const actionBtn = document.getElementById('ana-main-action-btn');
        const chartContainer = document.getElementById('ana-chart-container');
        
        if (!container) return;

        document.getElementById('ana-breadcrumbs').innerHTML = `<span class="bc-item active">Загальний огляд</span>`;
        container.classList.remove('hidden');
        document.getElementById('ana-view-quiz').classList.add('hidden');
        document.getElementById('ana-view-result').classList.add('hidden');
        chartContainer.classList.remove('hidden');

        actionBtn.innerHTML = `${Icons.link} Експорт CSV (Всі)`;
        actionBtn.onclick = () => AnalyticsPage.exportGlobalCSV();

        const quizzes = Storage.getQuizzes().filter(q => !q.isArchived);
        const results = Storage.getResults();

        AnalyticsPage.initChart(quizzes, results);

        const tableHeader = document.querySelector('#ana-view-general table thead tr');
        if (tableHeader) {
            tableHeader.innerHTML = `
                <th style="text-align: center; vertical-align: middle; padding: 16px; width: 40%;">Назва тесту</th>
                <th style="text-align: center; vertical-align: middle; padding: 16px; width: 15%;">Спроб</th>
                <th style="text-align: center; vertical-align: middle; padding: 16px; width: 30%;">Сер. успішність</th>
                <th style="text-align: center; vertical-align: middle; padding: 16px; width: 15%;">Дії</th>
            `;
        }

        if (quizzes.length === 0) {
            listContainer.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center; padding: 40px;">
                        <div class="empty-state" style="min-height: 200px; border:none; box-shadow:none; padding:0;">
                            <div class="empty-icon" style="margin: 0 auto 16px;">${Icons.chart}</div>
                            <h3>Дані відсутні</h3>
                            <p>Створіть перший тест для відображення статистики</p>
                        </div>
                    </td>
                </tr>`;
            return;
        }

        listContainer.innerHTML = quizzes.map(q => {
            const qRes = results.filter(r => r.quizId === q.id);
            const count = qRes.length;
            const avgPct = count > 0 ? Math.round(qRes.reduce((a, b) => a + b.percent, 0) / count) : 0;
            
            let scoreColor = 'var(--text-muted)';
            if (count > 0) scoreColor = avgPct >= 80 ? 'var(--success)' : (avgPct >= 50 ? 'var(--warning)' : 'var(--danger)');

            return `
            <tr class="user-row" onclick="App.pages.analytics.openQuizDetail('${q.id}')">
                <td style="text-align: center; vertical-align: middle;">
                    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px;">
                        <span class="badge-flat" style="font-size:10px; text-transform:uppercase;">${q.category || 'Загальне'}</span>
                        <span style="font-weight:700; font-size:15px;">${q.title}</span>
                    </div>
                </td>
                <td style="text-align: center; vertical-align: middle;">
                    <span class="count-pill">${count}</span>
                </td>
                <td style="text-align: center; vertical-align: middle;">
                    <div style="display: flex; align-items: center; justify-content: center; width: 100%; gap: 12px;">
                        <div style="width: 80px; height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden;">
                            <div style="width: ${avgPct}%; background: ${scoreColor}; height: 100%;"></div>
                        </div>
                        <div style="font-size: 13px; font-weight: 800; width: 40px; text-align: left;">${count > 0 ? avgPct + '%' : '-'}</div>
                    </div>
                </td>
                <td style="text-align: center; vertical-align: middle;">
                    <div style="display: flex; justify-content: center;">
                        <button class="btn-icon-link">${Icons.chart}</button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    },

    openQuizDetail: (quizId) => {
        AnalyticsPage.state.view = 'quiz';
        AnalyticsPage.state.currentQuizId = quizId;
        
        const quiz = Storage.getQuizById(quizId);
        const results = Storage.getResults().filter(r => r.quizId === quizId).sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const actionBtn = document.getElementById('ana-main-action-btn');
        const generalView = document.getElementById('ana-view-general');
        const quizView = document.getElementById('ana-view-quiz');
        const chartContainer = document.getElementById('ana-chart-container');

        document.getElementById('ana-breadcrumbs').innerHTML = `
            <span class="bc-item link" onclick="App.pages.analytics.render()">Огляд</span> 
            <span class="bc-sep">/</span>
            <span class="bc-item active">${quiz ? quiz.title : 'Архівний тест'}</span>
        `;

        actionBtn.innerHTML = `${Icons.link} Експорт звіту`;
        actionBtn.onclick = () => AnalyticsPage.exportQuizCSV(quizId);

        generalView.classList.add('hidden');
        chartContainer.classList.add('hidden');
        quizView.classList.remove('hidden');

        if (!quiz && results.length === 0) {
            quizView.innerHTML = `<div class="empty-state"><h3>Тест не знайдено</h3></div>`;
            return;
        }

        const avgScore = results.length ? Math.round(results.reduce((acc, r) => acc + r.percent, 0) / results.length) : 0;
        const passCount = results.filter(r => r.percent >= 50).length;

        quizView.innerHTML = `
            <div class="ana-stats-grid">
                <div class="stat-card">
                    <div class="stat-icon theme-primary">${Icons.user}</div>
                    <div>
                        <span class="stat-value">${results.length}</span>
                        <span class="stat-label">Проходжень</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon theme-success">${Icons.chart}</div>
                    <div>
                        <span class="stat-value">${avgScore}%</span>
                        <span class="stat-label">Сер. бал</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon theme-info">${Icons.check}</div>
                    <div>
                        <span class="stat-value">${passCount}</span>
                        <span class="stat-label">Успішних</span>
                    </div>
                </div>
            </div>

            <div class="ana-table-container">
                <table class="ana-table">
                    <thead>
                        <tr>
                            <th style="text-align: center; vertical-align: middle; padding: 16px; width: 30%;">Студент</th>
                            <th style="text-align: center; vertical-align: middle; padding: 16px; width: 25%;">Результат</th>
                            <th style="text-align: center; vertical-align: middle; padding: 16px; width: 30%;">Дата</th>
                            <th style="text-align: center; vertical-align: middle; padding: 16px; width: 15%;">Дії</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.length === 0 ? '<tr><td colspan="4" style="text-align:center; padding:40px; color:var(--text-muted);">Результатів поки немає</td></tr>' : 
                        results.map(r => `
                        <tr class="user-row" onclick="App.pages.analytics.openUserResult('${r.date}')">
                            <td style="text-align: center; vertical-align: middle;">
                                <div style="font-weight:700; font-size:14px;">${r.student}</div>
                            </td>
                            <td style="text-align: center; vertical-align: middle;">
                                <span class="badge ${r.percent >= 80 ? 'badge-success' : (r.percent >= 50 ? 'badge-warning' : 'badge-danger')}">
                                    ${r.score}/${r.max} (${r.percent}%)
                                </span>
                            </td>
                            <td style="text-align: center; vertical-align: middle;">
                                <div style="font-size:13px; color:var(--text-secondary);">${new Date(r.date).toLocaleDateString()}</div> 
                                <div style="color:var(--text-muted); font-size:11px;">${new Date(r.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            </td>
                            <td style="text-align: center; vertical-align: middle;">
                                <div style="display: flex; justify-content: center;">
                                    <button class="btn-table-action" onclick="event.stopPropagation(); App.pages.analytics.deleteResult('${r.date}')" title="Видалити">
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

    openUserResult: (dateStr) => {
        const res = Storage.getResults().find(r => r.date === dateStr);
        if (!res) {
            Toast.show("Результат не знайдено");
            AnalyticsPage.render();
            return;
        }

        AnalyticsPage.state.view = 'result';
        AnalyticsPage.state.currentResult = res;
        
        const quiz = Storage.getQuizById(res.quizId);
        const quizTitle = quiz ? quiz.title : "Невідомий тест";
        const actionBtn = document.getElementById('ana-main-action-btn');

        document.getElementById('ana-breadcrumbs').innerHTML = `
            <span class="bc-item link" onclick="App.pages.analytics.render()">Огляд</span> 
            <span class="bc-sep">/</span>
            <span class="bc-item link" onclick="App.pages.analytics.openQuizDetail('${res.quizId}')">${quizTitle}</span>
            <span class="bc-sep">/</span>
            <span class="bc-item active">${res.student}</span>
        `;

        actionBtn.innerHTML = `${Icons.desktop} Друк`;
        actionBtn.onclick = () => window.print();

        document.getElementById('ana-view-quiz').classList.add('hidden');
        const resView = document.getElementById('ana-view-result');
        resView.classList.remove('hidden');

        const color = res.percent >= 80 ? 'var(--success)' : (res.percent >= 50 ? 'var(--warning)' : 'var(--danger)');

        resView.innerHTML = `
            <div class="print-report-card">
                <div style="display:flex; justify-content:center; margin-bottom:32px;">
                    <div style="width:120px; height:120px; border-radius:50%; background:conic-gradient(${color} ${res.percent}%, #f1f5f9 0); display:flex; align-items:center; justify-content:center; box-shadow:0 10px 30px rgba(0,0,0,0.05);">
                        <div style="width:100px; height:100px; background:white; border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                            <span style="font-size:28px; font-weight:900; color:${color}; line-height:1;">${res.percent}%</span>
                            <span style="font-size:10px; font-weight:700; text-transform:uppercase; color:var(--text-muted);">Результат</span>
                        </div>
                    </div>
                </div>

                <h2 style="font-size: 26px; font-weight:800; margin-bottom: 8px;">${res.student}</h2>
                <div style="display:inline-block; padding:6px 16px; background:var(--bg-body); border-radius:20px; font-size:14px; color:var(--text-secondary); margin-bottom:40px; font-weight:600;">
                    ${quizTitle}
                </div>

                <div class="res-info-grid">
                    <div class="res-info-item">
                        <span>Набрано балів</span>
                        <strong>${res.score} з ${res.max}</strong>
                    </div>
                    <div class="res-info-item">
                        <span>Дата проходження</span>
                        <strong>${new Date(res.date).toLocaleString('uk-UA')}</strong>
                    </div>
                     <div class="res-info-item">
                        <span>Статус</span>
                        <strong style="color:${color}">${res.percent >= 50 ? 'Зараховано' : 'Незараховано'}</strong>
                    </div>
                </div>

                <div style="margin-top: 40px; display: flex; gap: 16px; justify-content: center;" class="no-print">
                    <button class="btn-secondary" onclick="AnalyticsPage.exportSingleResultCSV(App.pages.analytics.state.currentResult)">
                        ${Icons.link} CSV
                    </button>
                </div>
            </div>
        `;
    },

    initChart: (quizzes, results) => {
        const ctx = document.getElementById('globalChart');
        if(!ctx) return;
        
        if (window.myGlobalChart instanceof Chart) {
            window.myGlobalChart.destroy();
        }

        const activeQuizzes = quizzes.slice(0, 10);
        const labels = activeQuizzes.map(q => q.title.length > 15 ? q.title.substring(0, 15) + '...' : q.title);
        const data = activeQuizzes.map(q => {
            const qRes = results.filter(r => r.quizId === q.id);
            return qRes.length > 0 ? Math.round(qRes.reduce((a, b) => a + b.percent, 0) / qRes.length) : 0;
        });

        window.myGlobalChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Успішність',
                    data: data,
                    backgroundColor: '#4f46e5',
                    borderRadius: 6,
                    barThickness: 24
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: { family: 'Inter', size: 13 },
                        bodyFont: { family: 'Inter', size: 13 },
                        displayColors: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: '#f1f5f9' },
                        ticks: { font: { family: 'Inter', size: 11 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: 'Inter', size: 11 } }
                    }
                }
            }
        });
    },

    deleteResult: (dateStr) => {
        App.showConfirm('Ви впевнені, що хочете видалити цей результат? Дію не можна скасувати.', () => {
            Storage.deleteResult(dateStr);
            Toast.show('Результат успішно видалено');
            
            if (AnalyticsPage.state.view === 'quiz') {
                AnalyticsPage.openQuizDetail(AnalyticsPage.state.currentQuizId);
            } else {
                AnalyticsPage.renderGeneral();
            }
        });
    },

    escapeCSV: (str) => {
        if (!str) return '';
        const stringValue = String(str);
        if (stringValue.includes(',') || stringValue.includes(';') || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    },

    downloadFile: (csvContent, fileName) => {
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    exportGlobalCSV: () => {
        const results = Storage.getResults();
        const quizzes = Storage.getQuizzes();
        
        if (results.length === 0) {
            Toast.show("Дані відсутні");
            return;
        }

        let csv = "Дата;Студент;Тест;Категорія;Бали;Макс;Відсоток;Статус\n";

        results.forEach(r => {
            const q = quizzes.find(qz => qz.id === r.quizId);
            const quizTitle = q ? q.title : "Видалений";
            const category = q ? (q.category || '-') : '-';
            const status = r.percent >= 50 ? "Зараховано" : "Незараховано";
            const date = new Date(r.date).toLocaleString('uk-UA');

            csv += `${AnalyticsPage.escapeCSV(date)};${AnalyticsPage.escapeCSV(r.student)};${AnalyticsPage.escapeCSV(quizTitle)};${AnalyticsPage.escapeCSV(category)};${r.score};${r.max};${r.percent}%;${status}\n`;
        });

        AnalyticsPage.downloadFile(csv, `Global_Export_${new Date().toISOString().slice(0,10)}.csv`);
    },

    exportQuizCSV: (quizId) => {
        const results = Storage.getResults().filter(r => r.quizId === quizId);
        const quiz = Storage.getQuizById(quizId);
        
        if (results.length === 0) {
            Toast.show("Результати відсутні");
            return;
        }

        let csv = "Студент;Дата;Бали;Макс;Відсоток;Статус\n";

        results.forEach(r => {
            const status = r.percent >= 50 ? "Зараховано" : "Незараховано";
            const date = new Date(r.date).toLocaleString('uk-UA');
            csv += `${AnalyticsPage.escapeCSV(r.student)};${date};${r.score};${r.max};${r.percent}%;${status}\n`;
        });

        const fileName = `Quiz_${quiz ? quiz.title.replace(/\s/g, '_') : 'Export'}.csv`;
        AnalyticsPage.downloadFile(csv, fileName);
    },

    exportSingleResultCSV: (res) => {
        if (!res) return;
        const q = Storage.getQuizById(res.quizId);
        
        let csv = "Параметр;Значення\n";
        csv += `Студент;${AnalyticsPage.escapeCSV(res.student)}\n`;
        csv += `Тест;${AnalyticsPage.escapeCSV(q ? q.title : 'Видалений')}\n`;
        csv += `Дата;${new Date(res.date).toLocaleString('uk-UA')}\n`;
        csv += `Бали;${res.score}\n`;
        csv += `Макс;${res.max}\n`;
        csv += `Відсоток;${res.percent}%\n`;

        AnalyticsPage.downloadFile(csv, `Result_${res.student.replace(/\s/g, '_')}.csv`);
    }
};