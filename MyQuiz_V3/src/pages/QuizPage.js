import { Storage } from '../storage/storage.js';
import { Toast } from '../utils/toast.js';
import { Icons } from '../utils/icons.js';

export const QuizPage = {
    quiz: null, idx: 0, score: 0, maxScore: 0, answers: [], wrongIndices: [], timer: null, timeLeft: 0, studentName: '',
    init: (id) => {
        const q = Storage.getQuizById(id);
        if (!q) return;
        if (!q.allowRetake && Storage.getResults().some(r => r.quizId === id)) return Toast.show('Ви вже проходили цей тест');
        QuizPage.quiz = q;
        App.route('run');
        const container = document.getElementById('run-start-card');
        container.innerHTML = `<div class="run-card-wide"><div style="font-size:40px; margin-bottom:24px;">🚀</div><h1 style="font-size:28px; font-weight:800; margin-bottom:16px;">${q.title}</h1><div style="display:flex; justify-content:center; gap:12px; margin-bottom:32px;"><div class="badge badge-neutral">${q.questions.length} питань</div><div class="badge badge-neutral">${q.timeLimit ? Math.ceil(q.timeLimit/60)+' хв' : 'Без ліміту'}</div></div><div style="text-align:left; width:100%; max-width:400px; margin:0 auto 32px;"><label style="display:block; font-size:12px; font-weight:800; color:var(--text-muted); margin-bottom:8px; text-transform:uppercase;">Ваше ім'я</label><input type="text" id="run-name" style="width:100%; height:56px; border-radius:16px; border:2px solid var(--border); padding:0 20px; font-size:16px; font-weight:600; box-sizing:border-box;" placeholder="Олександр Петренко"></div><button onclick="App.pages.quiz.start()" class="btn-primary" style="width:100%; max-width:400px; height:56px; font-size:16px; margin: 0 auto;">Почати тест</button></div>`;
        document.getElementById('run-process').classList.add('hidden');
    },
    start: () => {
        const name = document.getElementById('run-name').value.trim();
        if (!name) return Toast.show('Введіть ім\'я');
        QuizPage.studentName = name;
        QuizPage.idx = 0; QuizPage.answers = []; QuizPage.wrongIndices = []; QuizPage.score = 0;
        QuizPage.maxScore = QuizPage.quiz.questions.reduce((a, b) => a + (parseFloat(b.points) || 0), 0);
        if (QuizPage.quiz.timeLimit > 0) {
            QuizPage.timeLeft = QuizPage.quiz.timeLimit;
            QuizPage.timer = setInterval(() => { QuizPage.timeLeft--; QuizPage.updateTimerUI(); if (QuizPage.timeLeft <= 0) QuizPage.finish(); }, 1000);
            document.getElementById('run-timer-container').classList.remove('hidden');
        }
        document.getElementById('run-start-card').classList.add('hidden');
        document.getElementById('run-process').classList.remove('hidden');
        QuizPage.render();
    },
    updateTimerUI: () => {
        const m = Math.floor(QuizPage.timeLeft / 60), s = QuizPage.timeLeft % 60;
        const el = document.getElementById('run-timer-container');
        el.innerText = `${m}:${s.toString().padStart(2, '0')}`;
        if (QuizPage.timeLeft < 60) { el.style.background = '#fee2e2'; el.style.color = 'var(--danger)'; }
    },
    render: () => {
        const q = QuizPage.quiz.questions[QuizPage.idx], total = QuizPage.quiz.questions.length;
        document.getElementById('run-progress').style.width = `${(QuizPage.idx / total) * 100}%`;
        document.getElementById('run-current').innerText = QuizPage.idx + 1;
        document.getElementById('run-total').innerText = total;
        let content = q.type === 'text' ? `<input type="text" id="run-text-input" class="form-control" value="${QuizPage.answers[QuizPage.idx] || ''}" placeholder="Ваша відповідь..." style="margin-top:20px; font-size:18px; padding:16px 24px; border-radius:18px;">` : (q.options || []).map((opt, i) => `<div class="run-opt ${QuizPage.answers[QuizPage.idx] === i ? 'selected' : ''}" onclick="App.pages.quiz.select(${i})"><div class="opt-icon">${String.fromCharCode(65+i)}</div><span>${opt.text}</span></div>`).join('');
        document.getElementById('run-card-content').innerHTML = `<div style="margin-bottom:32px;"><h2 style="font-size:24px; font-weight:800; line-height:1.4;">${q.text}</h2><div style="margin-top:12px; color:var(--text-muted); font-weight:600;">Балів: ${q.points || 1}</div></div><div class="options-grid">${content}</div>`;
        document.getElementById('run-actions').innerHTML = `<div style="display:flex; gap:16px; width:100%;">${QuizPage.quiz.allowBacktracking && QuizPage.idx > 0 ? `<button class="btn-secondary" style="flex:1; height:56px;" onclick="App.pages.quiz.prev()">Назад</button>` : ''}<button class="btn-primary" style="flex:2; height:56px; font-size:16px;" onclick="App.pages.quiz.next()">${QuizPage.idx === total - 1 ? 'Завершити тест' : 'Далі'}</button></div>`;
        const nav = document.getElementById('run-nav-grid');
        if (nav) nav.innerHTML = QuizPage.quiz.questions.map((_, i) => `<div class="nav-dot ${i === QuizPage.idx ? 'active' : (QuizPage.answers[i] !== undefined ? 'filled' : '')}" onclick="${QuizPage.quiz.allowBacktracking ? `App.pages.quiz.jump(${i})` : ''}">${i + 1}</div>`).join('');
    },
    select: (i) => { QuizPage.answers[QuizPage.idx] = i; QuizPage.render(); },
    jump: (i) => { QuizPage.idx = i; QuizPage.render(); },
    prev: () => { if (QuizPage.idx > 0) QuizPage.idx--, QuizPage.render(); },
    next: () => { if (QuizPage.idx === QuizPage.quiz.questions.length - 1) QuizPage.finish(); else QuizPage.idx++, QuizPage.render(); },
    finish: () => {
        if (QuizPage.timer) clearInterval(QuizPage.timer);
        QuizPage.score = 0; QuizPage.wrongIndices = [];
        QuizPage.quiz.questions.forEach((q, i) => {
            const ans = QuizPage.answers[i];
            let correct = (q.type === 'single' && q.options[ans]?.isCorrect) || (q.type === 'text' && String(ans).toLowerCase().trim() === String(q.correctText).toLowerCase().trim());
            if (correct) QuizPage.score += (parseFloat(q.points) || 0); else QuizPage.wrongIndices.push(i);
        });
        const pct = Math.round((QuizPage.score / QuizPage.maxScore) * 100);
        const resId = 'res_' + Date.now();
        Storage.saveResult({ id: resId, quizId: QuizPage.quiz.id, student: QuizPage.studentName, score: QuizPage.score, max: QuizPage.maxScore, percent: pct, wrongIndices: QuizPage.wrongIndices, date: new Date().toISOString() });
        App.route('finish');
        let lboard = '';
        if (QuizPage.quiz.showLeaderboard) {
            const leaders = Storage.getResults().filter(r => r.quizId === QuizPage.quiz.id).sort((a,b) => b.percent - a.percent).slice(0, 5);
            lboard = `<div class="finish-leaderboard"><h4>🏆 Рейтинг студентів</h4>${leaders.map((l, i) => `<div class="leader-row ${l.id === resId ? 'is-me' : ''}"><span style="font-weight:800; color:var(--primary); width:24px;">#${i+1}</span><span style="flex:1;">${l.student}</span><span style="font-weight:800;">${l.percent}%</span></div>`).join('')}</div>`;
        }
        document.getElementById('app-content').innerHTML = `<div class="run-card-wide"><div style="font-size:64px; margin-bottom:16px;">🎉</div><h1 style="font-size:32px; font-weight:900; margin-bottom:8px;">Тест завершено!</h1><div class="finish-score-circle"><span style="font-size:40px; font-weight:900; color:var(--primary);">${pct}%</span><span style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Результат</span></div><p style="color:var(--text-secondary); margin-bottom:32px;">Ви набрали <strong>${QuizPage.score}</strong> з <strong>${QuizPage.maxScore}</strong> балів.</p>${lboard}<div class="finish-buttons-grid"><button onclick="App.route('home')" class="btn-primary">На головну</button>${QuizPage.quiz.showAnswers ? `<button onclick="App.pages.quiz.review()" class="btn-secondary" style="grid-column: span 2;">Переглянути відповіді</button>` : ''}</div></div>`;
    }
};