import { Storage } from '../storage/storage.js';
import { Toast } from '../utils/toast.js';

export const QuizPage = {
    quiz: null,
    idx: 0,
    score: 0,
    maxScore: 0,
    answers: [],
    wrongIndices: [],
    timer: null,
    timeLeft: 0,
    studentName: '',
    currentSelection: [],

    init: (id) => {
        App.route('run'); 

        const q = Storage.getQuizById(id);
        if (!q) return;

        if (q.allowRetake === false) {
            const hasResult = Storage.getResults().some(r => r.quizId === id);
            if (hasResult) {
                Toast.show('Ви вже проходили цей тест');
                App.route('home');
                return;
            }
        }

        QuizPage.quiz = q;
        document.getElementById('run-title').innerText = q.title;
        
        const qCount = q.questions.length;
        let meta = `${qCount} питань`;
        if (q.timeLimit > 0) {
            const m = Math.ceil(q.timeLimit / 60);
            meta += ` • ${m} хв`;
        }
        document.getElementById('run-info-meta').innerText = meta;
        document.getElementById('run-name').value = '';
        
        document.getElementById('run-start-card').classList.remove('hidden');
        document.getElementById('run-process').classList.add('hidden');
    },

    start: () => {
        const name = document.getElementById('run-name').value.trim();
        if (!name) {
            Toast.show('Представтеся, будь ласка');
            document.getElementById('run-name').focus();
            return;
        }
        QuizPage.studentName = name;
        QuizPage.idx = 0;
        QuizPage.score = 0;
        QuizPage.maxScore = 0;
        QuizPage.answers = [];
        QuizPage.wrongIndices = [];

        QuizPage.quiz.questions.forEach(q => {
            QuizPage.maxScore += (q.points || 1);
        });

        if (QuizPage.quiz.timeLimit > 0) {
            QuizPage.timeLeft = QuizPage.quiz.timeLimit;
            QuizPage.timer = setInterval(QuizPage.tick, 1000);
            document.getElementById('run-timer-container').classList.remove('hidden');
            QuizPage.updateTimerUI();
        } else {
            document.getElementById('run-timer-container').classList.add('hidden');
        }

        document.getElementById('run-start-card').classList.add('hidden');
        document.getElementById('run-process').classList.remove('hidden');
        QuizPage.render();
    },

    tick: () => {
        QuizPage.timeLeft--;
        QuizPage.updateTimerUI();
        if (QuizPage.timeLeft <= 0) {
            clearInterval(QuizPage.timer);
            Toast.show('Час вийшов!');
            QuizPage.finish();
        }
    },

    updateTimerUI: () => {
        const h = Math.floor(QuizPage.timeLeft / 3600);
        const m = Math.floor((QuizPage.timeLeft % 3600) / 60);
        const s = QuizPage.timeLeft % 60;
        document.getElementById('run-timer-container').innerText = 
            `${h>0?h+':':''}${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        
        if(QuizPage.timeLeft < 60) {
            document.getElementById('run-timer-container').style.color = 'var(--danger)';
            document.getElementById('run-timer-container').style.background = '#fee2e2';
        }
    },

    render: () => {
        const q = QuizPage.quiz.questions[QuizPage.idx];
        const total = QuizPage.quiz.questions.length;
        const isMulti = q.type === 'multi';
        QuizPage.currentSelection = []; 

        document.getElementById('run-current').innerText = QuizPage.idx + 1;
        document.getElementById('run-total').innerText = total;
        
        const progress = ((QuizPage.idx) / total) * 100;
        document.getElementById('run-progress').style.width = `${progress}%`;
        
        const actionsDiv = document.getElementById('run-actions');
        if (isMulti) {
            actionsDiv.innerHTML = `<button class="btn-primary" onclick="App.pages.quiz.confirmMultiAnswer()">Відповісти</button>`;
        } else {
            actionsDiv.innerHTML = '';
        }

        const typeLabel = isMulti ? '<span style="font-size:12px; background:#e0e7ff; color:var(--primary); padding:2px 6px; border-radius:4px; margin-left:10px;">Множинний вибір</span>' : '';

        const card = document.getElementById('run-card-content');
        card.innerHTML = `
            <div style="margin-bottom:20px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start">
                    <div style="display:flex; gap:12px; align-items:flex-start; padding-right:10px;">
                        <span class="q-num-badge">${QuizPage.idx+1}</span>
                        <h2 style="margin:0; font-size:20px; line-height:1.4; padding-top:2px;">${q.text}</h2>
                    </div>
                    <span style="font-size:12px; color:var(--text-light); white-space:nowrap; margin-left:10px;">${q.points || 1} бал(ів)</span>
                </div>
                ${typeLabel}
            </div>
            ` + 
            q.options.map((opt, i) => {
                const clickHandler = isMulti 
                    ? `App.pages.quiz.toggleMultiSelection(this, ${i})`
                    : `App.pages.quiz.answerSingle(${i})`;
                
                const iconShape = isMulti ? 'border-radius:4px;' : 'border-radius:50%;';

                return `<div class="run-opt" onclick="${clickHandler}" id="opt-${i}">
                    <div class="opt-icon" style="width:24px; height:24px; background:#f1f5f9; ${iconShape} margin-right:15px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; color:#64748b; border:1px solid #cbd5e1;">${isMulti ? '' : String.fromCharCode(65+i)}</div>
                    ${opt.text}
                </div>`;
            }).join('');
    },

    answerSingle: (i) => {
        const q = QuizPage.quiz.questions[QuizPage.idx];
        QuizPage.answers.push(i);
        
        if (q.options[i].isCorrect) {
            QuizPage.score += (q.points || 1);
        } else {
            QuizPage.wrongIndices.push(QuizPage.idx);
        }
        QuizPage.next();
    },

    toggleMultiSelection: (el, i) => {
        el.classList.toggle('selected');
        const icon = el.querySelector('.opt-icon');
        
        if (QuizPage.currentSelection.includes(i)) {
            QuizPage.currentSelection = QuizPage.currentSelection.filter(idx => idx !== i);
            icon.style.background = '#f1f5f9';
            icon.style.color = '#64748b';
            icon.innerText = '';
        } else {
            QuizPage.currentSelection.push(i);
            icon.style.background = 'var(--primary)';
            icon.style.color = 'white';
            icon.innerText = '✓';
        }
    },

    confirmMultiAnswer: () => {
        if (QuizPage.currentSelection.length === 0) {
            Toast.show('Виберіть хоча б один варіант');
            return;
        }

        const q = QuizPage.quiz.questions[QuizPage.idx];
        QuizPage.answers.push([...QuizPage.currentSelection]);

        const correctIndices = q.options.map((o, idx) => o.isCorrect ? idx : -1).filter(idx => idx !== -1);
        
        const isAllCorrect = correctIndices.length === QuizPage.currentSelection.length && 
                             correctIndices.every(val => QuizPage.currentSelection.includes(val));

        if (isAllCorrect) {
            QuizPage.score += (q.points || 1);
        } else {
            QuizPage.wrongIndices.push(QuizPage.idx);
        }
        
        QuizPage.next();
    },

    next: () => {
        QuizPage.idx++;
        if (QuizPage.idx < QuizPage.quiz.questions.length) {
            QuizPage.render();
        } else {
            document.getElementById('run-progress').style.width = '100%';
            QuizPage.finish();
        }
    },

    finish: () => {
        if (QuizPage.timer) clearInterval(QuizPage.timer);
        
        const totalPoints = QuizPage.maxScore;
        const pct = totalPoints > 0 ? Math.round((QuizPage.score / totalPoints) * 100) : 0;

        Storage.saveResult({
            quizId: QuizPage.quiz.id,
            quizTitle: QuizPage.quiz.title,
            student: QuizPage.studentName,
            score: QuizPage.score,
            max: totalPoints,
            percent: pct,
            wrongIndices: QuizPage.wrongIndices,
            date: new Date().toISOString()
        });

        App.route('finish');

        document.getElementById('res-score').innerText = pct + '%';
        const msg = document.getElementById('res-msg');
        
        if(pct >= 80) {
            msg.innerText = 'Чудово!';
        } else if (pct >= 50) {
            msg.innerText = 'Добрий результат';
        } else {
            msg.innerText = 'Треба потренуватися';
        }
        
        document.getElementById('res-info').innerText = `Ви набрали ${QuizPage.score} з ${totalPoints} балів`;
        
        const actions = document.getElementById('finish-actions');
        let html = `<button onclick="App.route('home')" class="btn-primary">На головну</button>`;
        
        if (QuizPage.quiz.showAnswers) {
            html += `<button onclick="App.pages.quiz.review()" class="btn-secondary">Переглянути помилки</button>`;
        }
        actions.innerHTML = html;
    },

    review: () => {
        App.route('review');
        const container = document.getElementById('review-content');

        const headerHtml = `
            <div class="card" style="margin-bottom: 24px; text-align: center; border-color: var(--primary);">
                <h2 style="margin:0; font-size:18px; color:var(--text-light)">Ваш результат</h2>
                <div class="finish-score" style="font-size: 48px; margin: 10px 0;">${QuizPage.score} / ${QuizPage.maxScore}</div>
                <div style="font-weight:600; color:var(--text-main)">балів</div>
            </div>
        `;

        const listHtml = QuizPage.quiz.questions.map((q, qIdx) => {
            const userChoice = QuizPage.answers[qIdx];
            
            const optsHtml = q.options.map((opt, oIdx) => {
                const isCorrect = opt.isCorrect;
                const isSelected = Array.isArray(userChoice) 
                    ? userChoice.includes(oIdx) 
                    : userChoice === oIdx;

                let cls = '';
                let icon = '';
                let label = '';

                if (isSelected && isCorrect) {
                    cls = 'opt-correct-selected';
                    icon = '✅';
                    label = '<span class="status-label">Ваш вибір (Вірно)</span>';
                } else if (isSelected && !isCorrect) {
                    cls = 'opt-wrong-selected';
                    icon = '❌';
                    label = '<span class="status-label">Ваш вибір (Невірно)</span>';
                } else if (!isSelected && isCorrect) {
                    cls = 'opt-correct-missed';
                    icon = '💡';
                    label = '<span class="status-label" style="color:#15803d">Правильна відповідь</span>';
                } else {
                    cls = 'opt-neutral';
                }

                return `<div class="review-opt ${cls}">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <span style="font-weight:bold; min-width:20px; text-align:center;">${icon}</span>
                                <span>${opt.text}</span>
                            </div>
                            ${label}
                        </div>`;
            }).join('');

            return `<div class="review-card">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                    <div style="display:flex; gap:12px; align-items:flex-start;">
                         <span class="q-num-badge">${qIdx+1}</span>
                         <h3 style="margin:0; font-size:16px; line-height:1.4; padding-top:2px;">${q.text}</h3>
                    </div>
                    <span class="badge badge-neutral" style="flex-shrink:0; margin-left:10px;">${q.points||1} б.</span>
                </div>
                <div>${optsHtml}</div>
            </div>`;
        }).join('');

        container.innerHTML = headerHtml + listHtml;
    }
};