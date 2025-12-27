import { Storage } from '../storage/storage.js';
import { Toast } from '../utils/toast.js';
import { Icons } from '../utils/icons.js';

export const QuizPage = {
    quiz: null, 
    idx: 0, 
    score: 0, 
    maxScore: 0, 
    answers: [], 
    timer: null, 
    timeLeft: 0, 
    studentName: '',

    init: (id) => {
        const q = Storage.getQuizById(id);
        if (!q) return;
        QuizPage.quiz = q;
        App.route('run');
        setTimeout(() => QuizPage.renderStart(), 0);
    },

    renderStart: () => {
        const container = document.getElementById('run-start-card');
        if (!container) return;

        const isLocked = QuizPage.quiz.isClosed || (QuizPage.quiz.deadline && new Date() > new Date(QuizPage.quiz.deadline));
        
        if (isLocked) {
            container.innerHTML = `
                <div class="run-card-wide" style="text-align: center; padding: 60px;">
                    <div style="font-size:64px; margin-bottom:24px;">🔒</div>
                    <h1 style="font-size:28px; font-weight:800; margin-bottom:16px;">Тест закритий</h1>
                    <p style="color:var(--text-secondary); margin-bottom:32px;">Термін проходження вичерпано або тест деактивовано викладачем.</p>
                    <button onclick="App.route('home')" class="btn-primary" style="width:100%;">Повернутися назад</button>
                </div>`;
            return;
        }

        container.innerHTML = `
            <div class="run-card-wide" style="text-align: center; animation: fadeUp 0.4s ease; max-width: 600px; margin: 0 auto;">
                <div style="font-size:48px; margin-bottom:24px;">🚀</div>
                <h1 style="font-size:28px; font-weight:900; margin-bottom:16px; line-height:1.3; word-wrap: break-word;">${QuizPage.quiz.title}</h1>
                
                <div style="font-size:15px; color:var(--text-secondary); margin-bottom:32px; text-align: left; background: #f8fafc; padding: 20px; border-radius: 20px; border: 1px solid var(--border);">
                    <div style="white-space: pre-wrap; word-break: break-word; overflow-wrap: break-word;">${QuizPage.quiz.description || 'Опис відсутній'}</div>
                </div>
                
                <div style="background: white; border: 1px solid var(--border); padding: 24px; border-radius: 24px; margin-bottom: 32px; text-align: left; box-shadow: var(--shadow-sm);">
                    <label class="form-label" style="font-size:12px; text-transform:uppercase; margin-bottom:8px; font-weight: 700; color: var(--text-muted);">Ваше ім'я та прізвище</label>
                    <input type="text" id="run-name" class="form-control" placeholder="Голубков Вадим" style="height:56px; font-size:16px; font-weight:600; border-radius: 16px;">
                </div>

                <div class="run-meta-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:32px;">
                     <div style="background:#f1f5f9; padding:12px; border-radius:16px; font-size:13px; font-weight:700; color:var(--text-secondary); display:flex; align-items:center; justify-content:center; gap:8px;">
                        ${Icons.book} ${QuizPage.quiz.questions.length} питань
                     </div>
                     <div style="background:#f1f5f9; padding:12px; border-radius:16px; font-size:13px; font-weight:700; color:var(--text-secondary); display:flex; align-items:center; justify-content:center; gap:8px;">
                        ${Icons.help} ${QuizPage.quiz.timeLimit > 0 ? Math.floor(QuizPage.quiz.timeLimit / 60) + ' хв' : 'Без ліміту'}
                     </div>
                </div>

                <button onclick="App.pages.quiz.start()" class="btn-primary" style="width:100%; height:60px; font-size:18px; border-radius:20px;">Почати тест</button>
            </div>
        `;
        document.getElementById('run-process').classList.add('hidden');
    },

    start: () => {
        const nameInput = document.getElementById('run-name');
        const name = nameInput ? nameInput.value.trim() : "";
        const nameRegex = /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ' -]{3,}$/;

        if (!name) {
            nameInput.classList.add('error-field');
            return Toast.show('⚠️ Введіть ваше ім\'я');
        }
        if (!nameRegex.test(name)) {
            nameInput.classList.add('error-field');
            return Toast.show('⚠️ Введіть коректне Прізвище та Ім\'я');
        }
        
        QuizPage.studentName = name;
        QuizPage.idx = 0; 
        QuizPage.answers = []; 
        QuizPage.score = 0;
        QuizPage.maxScore = QuizPage.quiz.questions.reduce((a, b) => {
            return b.type === 'info' ? a : a + (parseFloat(b.points) || 0);
        }, 0);

        if (QuizPage.quiz.timeLimit > 0) {
            QuizPage.timeLeft = QuizPage.quiz.timeLimit;
            QuizPage.updateTimerUI();
            
            QuizPage.timer = setInterval(() => {
                QuizPage.timeLeft--;
                QuizPage.updateTimerUI();
                if (QuizPage.timeLeft <= 0) {
                    clearInterval(QuizPage.timer);
                    Toast.show('⏰ Час вичерпано!');
                    QuizPage.finish();
                }
            }, 1000);
        }

        document.getElementById('run-start-card').classList.add('hidden');
        document.getElementById('run-process').classList.remove('hidden');
        QuizPage.render();
    },

    updateTimerUI: () => {
        const timerEl = document.getElementById('quiz-timer-display');
        if (!timerEl) return;
        const h = Math.floor(QuizPage.timeLeft / 3600);
        const m = Math.floor((QuizPage.timeLeft % 3600) / 60);
        const s = QuizPage.timeLeft % 60;
        
        timerEl.innerText = `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        
        if (QuizPage.timeLeft < 60) {
            timerEl.style.color = '#ef4444';
            timerEl.style.backgroundColor = '#fef2f2';
            timerEl.style.borderColor = '#fee2e2';
        }
    },

    render: () => {
        const q = QuizPage.quiz.questions[QuizPage.idx];
        const total = QuizPage.quiz.questions.length;
        
        const prog = document.getElementById('run-progress');
        if (prog) prog.style.width = `${((QuizPage.idx + 1) / total) * 100}%`;

        const headerContainer = document.getElementById('run-header-info');
        if (headerContainer) {
            headerContainer.innerHTML = `
                <div style="display: flex; gap: 12px; width: 100%;">
                    <div style="flex: 1; background: #f8fafc; padding: 10px 16px; border-radius: 14px; display: flex; flex-direction: column; align-items: center; border: 1px solid var(--border);">
                        <span style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Питання</span>
                        <span style="font-size: 16px; font-weight: 800; color: var(--text-main);">${QuizPage.idx + 1} <span style="color: var(--text-muted); font-size: 14px;">/ ${total}</span></span>
                    </div>
                    ${QuizPage.quiz.timeLimit > 0 ? `
                    <div style="flex: 1; background: #f0f9ff; padding: 10px 16px; border-radius: 14px; display: flex; flex-direction: column; align-items: center; border: 1px solid #e0f2fe; transition: 0.3s;" id="quiz-timer-box">
                        <span style="font-size: 10px; font-weight: 700; color: #0284c7; text-transform: uppercase;">Таймер</span>
                        <span id="quiz-timer-display" style="font-size: 16px; font-weight: 800; color: #0284c7; font-feature-settings: 'tnum';">--:--</span>
                    </div>` : ''}
                    ${q.type !== 'info' ? `
                    <div style="flex: 1; background: #fdf2f8; padding: 10px 16px; border-radius: 14px; display: flex; flex-direction: column; align-items: center; border: 1px solid #fce7f3;">
                        <span style="font-size: 10px; font-weight: 700; color: #db2777; text-transform: uppercase;">Бали</span>
                        <span style="font-size: 16px; font-weight: 800; color: #db2777;">${q.points}</span>
                    </div>` : ''}
                </div>
            `;
            if (QuizPage.quiz.timeLimit > 0) QuizPage.updateTimerUI();
        }

        let content = '';
        
        if (q.type === 'info') {
            content = `
                <div class="info-block-run" style="background: linear-gradient(135deg, #eff6ff, #ffffff); padding: 32px; border-radius: 24px; border: 1px solid #bfdbfe; display: flex; flex-direction: column; gap: 16px; margin-top: 24px;">
                    <div style="display:flex; align-items:center; gap:12px; color: var(--primary);">
                        ${Icons.info} <span style="font-weight:800; font-size:14px; text-transform:uppercase;">Інформація</span>
                    </div>
                    <div style="font-size: 16px; line-height: 1.6; color: var(--text-main); white-space: pre-wrap;">${q.text}</div>
                </div>`;
        } 
        else if (q.type === 'boolean') {
            const currentAns = QuizPage.answers[QuizPage.idx];
            content = `
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:32px;">
                    <button class="tf-btn true ${currentAns === true ? 'selected' : ''}" onclick="App.pages.quiz.setBoolean(true)">
                        <span class="tf-icon">👍</span> ПРАВДА
                    </button>
                    <button class="tf-btn false ${currentAns === false ? 'selected' : ''}" onclick="App.pages.quiz.setBoolean(false)">
                        <span class="tf-icon">👎</span> ХИБНО
                    </button>
                </div>
                <style>
                    .tf-btn { height: 100px; border-radius: 24px; border: 2px solid var(--border); background: white; font-size: 16px; font-weight: 800; color: var(--text-secondary); transition: 0.2s; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; }
                    .tf-btn:hover { border-color: var(--primary); transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
                    .tf-btn .tf-icon { font-size: 24px; }
                    .tf-btn.true.selected { background: #ecfdf5; border-color: #10b981; color: #047857; }
                    .tf-btn.false.selected { background: #fef2f2; border-color: #ef4444; color: #b91c1c; }
                </style>`;
        } 
        else if (q.type === 'matching') {
            const currentAnsMap = QuizPage.answers[QuizPage.idx] || {};
            content = `
            <div style="display:flex; flex-direction:column; gap:16px; margin-top:32px;">
                ${q.pairs.map(p => `
                <div class="match-row-run" style="background: white; padding: 16px; border: 1px solid var(--border); border-radius: 20px; display: grid; grid-template-columns: 1fr 30px 1fr; align-items: center; gap: 16px; box-shadow: var(--shadow-sm);">
                    <div style="font-weight: 600; font-size: 15px; color: var(--text-main);">${p.left}</div>
                    <div style="text-align: center; color: var(--text-muted); font-size: 18px;">→</div>
                    <div class="select-wrapper" style="position: relative;">
                        <select class="form-control match-select" data-left="${p.left}" onchange="App.pages.quiz.setMatch(this)" style="background: var(--bg-body); border-radius: 12px; height: 48px; padding-left: 16px; font-weight: 600; cursor: pointer; border: 1px solid var(--border); width: 100%; appearance: none;">
                            <option value="" disabled selected>Оберіть пару...</option>
                            ${q.pairs.map(pair => `<option value="${pair.right}" ${currentAnsMap[p.left] === pair.right ? 'selected' : ''}>${pair.right}</option>`).join('')}
                        </select>
                        <div style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--text-muted); font-size: 12px;">▼</div>
                    </div>
                </div>`).join('')}
            </div>`;
        } 
        else if (q.type === 'text') {
            content = `
                <div style="margin-top:32px;">
                    <label class="form-label" style="margin-bottom: 12px; display: block; font-weight: 600; color: var(--text-secondary);">Ваша відповідь:</label>
                    <input type="text" class="form-control" placeholder="Введіть текст..." 
                    value="${QuizPage.answers[QuizPage.idx] || ''}" 
                    style="height:64px; font-size:18px; padding:0 24px; border-radius: 20px; border: 2px solid var(--border); transition: 0.2s;" 
                    oninput="App.pages.quiz.setText(this.value)">
                </div>`;
        } 
        else {
            const ansArr = QuizPage.answers[QuizPage.idx];
            content = `
            <div class="options-grid" style="display: flex; flex-direction: column; gap: 14px; margin-top: 32px;">
                ${q.options.map((opt, i) => {
                    const isSel = q.type === 'multi' 
                        ? (Array.isArray(ansArr) && ansArr.includes(i))
                        : (ansArr === i);
                    
                    return `
                    <div class="run-opt ${isSel ? 'selected' : ''}" onclick="App.pages.quiz.select(${i}, '${q.type}')" 
                        style="display: flex; align-items: center; gap: 16px; padding: 18px 24px; border: 2px solid var(--border); border-radius: 20px; cursor: pointer; transition: all 0.2s; background: white;">
                        <div class="opt-key" style="width: 36px; height: 36px; background: var(--bg-body); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; color: var(--text-secondary); transition: 0.2s; flex-shrink: 0;">
                            ${String.fromCharCode(65+i)}
                        </div>
                        <span style="font-size: 16px; font-weight: 500; line-height: 1.5; color: var(--text-main);">${opt.text}</span>
                        ${isSel ? `<div style="margin-left: auto; color: var(--primary); animation: fadeIn 0.2s;">${Icons.check}</div>` : ''}
                    </div>`;
                }).join('')}
            </div>
            <style>
                .run-opt:hover { border-color: var(--primary); background: var(--primary-fade); transform: translateX(4px); }
                .run-opt.selected { border-color: var(--primary); background: var(--primary-light); }
                .run-opt.selected .opt-key { background: var(--primary); color: white; }
            </style>`;
        }

        const questionTitle = q.type === 'info' 
            ? '' 
            : `<h2 style="font-size: 24px; font-weight: 800; line-height: 1.4; margin: 0; color: var(--text-main); overflow-wrap: break-word;">${q.text}</h2>`;

        document.getElementById('run-card-content').innerHTML = `
            <div style="margin-bottom: 12px;">${questionTitle}</div>
            ${content}
        `;
        
        const canGoBack = QuizPage.quiz.allowBacktracking !== false; 
        
        document.getElementById('run-actions').innerHTML = `
            ${canGoBack && QuizPage.idx > 0 ? `<button class="btn-secondary" style="height:56px; padding:0 32px; border-radius: 16px;" onclick="App.pages.quiz.prev()">Назад</button>` : '<div></div>'}
            <button class="btn-primary" style="height:56px; padding:0 40px; margin-left:auto; border-radius: 16px; font-size: 16px;" onclick="App.pages.quiz.next()">
                ${QuizPage.idx === total - 1 ? 'Завершити тест' : 'Далі'} ${Icons.arrowRight || '→'}
            </button>
        `;
    },

    setBoolean: (val) => { QuizPage.answers[QuizPage.idx] = val; QuizPage.render(); },
    setText: (val) => { QuizPage.answers[QuizPage.idx] = val; },
    setMatch: (select) => {
        if (!QuizPage.answers[QuizPage.idx]) QuizPage.answers[QuizPage.idx] = {};
        QuizPage.answers[QuizPage.idx][select.getAttribute('data-left')] = select.value;
    },
    
    select: (i, type) => {
        if (type === 'single') {
            QuizPage.answers[QuizPage.idx] = i;
        } else {
            if (!Array.isArray(QuizPage.answers[QuizPage.idx])) QuizPage.answers[QuizPage.idx] = [];
            const currentArr = QuizPage.answers[QuizPage.idx];
            const pos = currentArr.indexOf(i);
            if (pos === -1) currentArr.push(i);
            else currentArr.splice(pos, 1);
        }
        QuizPage.render();
    },

    next: () => {
        if (QuizPage.idx === QuizPage.quiz.questions.length - 1) {
            QuizPage.finish();
        } else {
            QuizPage.idx++;
            QuizPage.render();
        }
    },
    prev: () => { 
        if (QuizPage.idx > 0) { 
            QuizPage.idx--; 
            QuizPage.render(); 
        } 
    },

    finish: () => {
        if (QuizPage.timer) clearInterval(QuizPage.timer);
        QuizPage.score = 0;
        
        QuizPage.quiz.questions.forEach((q, i) => {
            const ans = QuizPage.answers[i];
            
            if (q.type === 'info') return;

            if (q.type === 'single') {
                if (ans !== undefined && ans !== null && q.options[ans]?.isCorrect) QuizPage.score += q.points;
            } 
            else if (q.type === 'multi') {
                const correctIndices = q.options.map((o, idx) => o.isCorrect ? idx : -1).filter(idx => idx !== -1);
                const studentIndices = ans || [];
                const correctCount = correctIndices.length;
                
                const studentCorrect = studentIndices.filter(idx => correctIndices.includes(idx)).length;
                const studentWrong = studentIndices.filter(idx => !correctIndices.includes(idx)).length;
                
                if (correctCount > 0) {
                    let res = (studentCorrect - studentWrong) / correctCount;
                    if (res > 0) QuizPage.score += res * q.points;
                }
            } 
            else if (q.type === 'boolean') {
                if (ans === q.correctBoolean) QuizPage.score += q.points;
            } 
            else if (q.type === 'text') {
                if (ans && ans.toLowerCase().trim() === q.correctText.toLowerCase().trim()) QuizPage.score += q.points;
            } 
            else if (q.type === 'matching') {
                let correctPairs = 0;
                const totalPairs = q.pairs.length;
                q.pairs.forEach(p => { 
                    if (ans && ans[p.left] === p.right) correctPairs++; 
                });
                if(totalPairs > 0) QuizPage.score += (correctPairs / totalPairs) * q.points;
            }
        });

        const pct = QuizPage.maxScore > 0 ? Math.round((QuizPage.score / QuizPage.maxScore) * 100) : 0;
        
        Storage.saveResult({
            id: Date.now(),
            quizId: QuizPage.quiz.id,
            student: QuizPage.studentName,
            score: parseFloat(QuizPage.score.toFixed(1)),
            max: QuizPage.maxScore,
            percent: pct,
            date: new Date().toISOString()
        });

        QuizPage.renderFinishScreen(pct);
    },

    renderFinishScreen: (pct) => {
        const container = document.getElementById('app-content');
        
        let actionsHtml = `<button class="btn-secondary" onclick="App.route('home')" style="height:56px; flex:1; border-radius: 16px;">На головну</button>`;
        
        if (QuizPage.quiz.allowRetake) {
            actionsHtml += `<button class="btn-primary" onclick="App.pages.quiz.init('${QuizPage.quiz.id}')" style="height:56px; flex:1; border-radius: 16px;">Спробувати знову</button>`;
        }
        
        let reviewBtn = '';
        if (QuizPage.quiz.showAnswers) {
            reviewBtn = `<button class="btn-dashed-lg" onclick="App.pages.quiz.renderReview()" style="margin-bottom:24px; min-height:56px; border-radius: 16px;">${Icons.search} Переглянути помилки та відповіді</button>`;
        }

        const color = pct >= 80 ? '#10b981' : (pct >= 50 ? '#f59e0b' : '#ef4444');
        const bg = pct >= 80 ? '#ecfdf5' : (pct >= 50 ? '#fffbeb' : '#fef2f2');
        const msg = pct >= 80 ? 'Чудовий результат!' : (pct >= 50 ? 'Непогано!' : 'Треба ще попрацювати.');
        
        const shareBtn = `
            <button class="btn-secondary" onclick="App.pages.quiz.shareResult(${pct})" style="height:56px; width:56px; border-radius: 16px; display:flex; align-items:center; justify-content:center; font-size:20px;" title="Поділитися">
                🚀
            </button>
        `;

        const certBtn = pct >= 50 ? `
            <button class="btn-secondary" onclick="App.pages.quiz.downloadCertificate(${pct})" style="height:56px; flex:1; border-radius: 16px; gap:8px;">
                ${Icons.book} Завантажити сертифікат
            </button>
        ` : '';

        container.innerHTML = `
             <div class="content-body" style="display:flex; align-items:center; justify-content:center; min-height:80vh;">
                <div class="run-card-wide" style="text-align:center; max-width:600px; padding:48px; animation:fadeUp 0.5s ease; width: 100%;">
                    <div style="font-size:72px; margin-bottom:24px;">${pct >= 50 ? '🎉' : '📚'}</div>
                    <h1 style="font-size:32px; font-weight:900; margin-bottom:8px;">Тест завершено</h1>
                    <p style="color:var(--text-secondary); margin-bottom:40px; font-size: 16px;">${msg}</p>
                    
                    <div style="background:${bg}; padding:40px; border-radius:32px; margin-bottom:32px; position:relative; overflow:hidden; border: 1px solid ${color}40;">
                         <div style="font-size:14px; font-weight:800; color:${color}; text-transform:uppercase; margin-bottom:12px; letter-spacing: 1px;">Ваш результат</div>
                         <div style="font-size:80px; font-weight:900; color:${color}; line-height:1; margin-bottom:12px;">${pct}%</div>
                         <div style="font-size:18px; font-weight:700; color:var(--text-main);">${QuizPage.score.toFixed(1)} з ${QuizPage.maxScore} балів</div>
                    </div>

                    <div style="display:flex; gap:16px; margin-bottom:24px;">
                        ${certBtn}
                        ${shareBtn}
                    </div>

                    ${reviewBtn}

                    <div style="display:flex; gap:16px;">
                        ${actionsHtml}
                    </div>
                </div>
            </div>
        `;
    },

    renderReview: () => {
        const container = document.getElementById('app-content');
        let contentHtml = QuizPage.quiz.questions.map((q, i) => {
            if (q.type === 'info') return ''; 

            const ans = QuizPage.answers[i];
            let status = 'neutral';
            let detail = '';

            if (q.type === 'single') {
                const correctOpt = q.options.findIndex(o => o.isCorrect);
                const isCorrect = ans === correctOpt;
                status = isCorrect ? 'correct' : 'wrong';
                detail = `
                    <div style="font-size:14px; margin-top:8px;">
                        <div>Ваша відповідь: <strong>${ans !== undefined ? q.options[ans].text : 'Не надано'}</strong></div>
                        ${!isCorrect ? `<div style="color:var(--success-text); margin-top:4px;">Правильно: <strong>${q.options[correctOpt].text}</strong></div>` : ''}
                    </div>`;
            } 
            else if (q.type === 'text') {
                const isCorrect = ans && ans.toLowerCase().trim() === q.correctText.toLowerCase().trim();
                status = isCorrect ? 'correct' : 'wrong';
                detail = `<div>Ваше: <strong>${ans || '-'}</strong> <span style="color:var(--text-muted);">/</span> Правильно: <strong>${q.correctText}</strong></div>`;
            }
            
            const color = status === 'correct' ? 'var(--success-bg)' : (status === 'wrong' ? 'var(--danger-bg)' : 'var(--bg-body)');
            const border = status === 'correct' ? 'var(--success)' : (status === 'wrong' ? 'var(--danger)' : 'var(--border)');

            return `
                <div style="background:white; border:2px solid ${border}; border-left-width:8px; border-radius:20px; padding:24px; margin-bottom:24px; box-shadow: var(--shadow-sm);">
                    <div style="font-size:12px; font-weight:800; color:var(--text-muted); margin-bottom:8px; text-transform: uppercase;">ПИТАННЯ ${i+1} (${q.points} б.)</div>
                    <div style="font-weight:700; font-size:18px; margin-bottom:16px; color: var(--text-main);">${q.text}</div>
                    <div style="background:${color}; padding:16px; border-radius:12px; font-size:15px;">
                        ${detail || '<i>Детальна перевірка для цього типу питання недоступна в демо-режимі</i>'}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="page-header sticky">
                <h1>Робота над помилками</h1>
                <div class="header-actions">
                    <button class="btn-primary" onclick="App.route('home')">Завершити перегляд</button>
                </div>
            </div>
            <div class="content-body" style="max-width:800px; margin:0 auto; padding-top: 32px;">
                ${contentHtml}
                <button class="btn-secondary" onclick="App.route('home')" style="width:100%; height:64px; margin-top:32px; font-size: 16px; border-radius: 20px;">Повернутися на головну</button>
            </div>
        `;
    },

    shareResult: (pct) => {
        const shareData = {
            title: 'MyQuiz Pro Результат',
            text: `Я склав тест "${QuizPage.quiz.title}" на ${pct}%! Спробуй перевершити мене.`,
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData)
                .then(() => Toast.show('Успішно надіслано!'))
                .catch((err) => console.log('Error sharing:', err));
        } else {
            navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
            Toast.show('Посилання скопійовано в буфер обміну');
        }
    },

    downloadCertificate: (pct) => {
        Toast.show('Генерація сертифікату...');
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = 1200;
        const height = 800;
        canvas.width = width;
        canvas.height = height;

        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#4f46e5');
        gradient.addColorStop(1, '#818cf8');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(40, 40, width - 80, height - 80);

        ctx.strokeStyle = '#eef2ff';
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.arc(100, 100, 150, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(width - 100, height - 100, 150, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.fillStyle = '#1e293b';
        
        ctx.font = 'bold 60px "Inter", sans-serif';
        ctx.fillText('СЕРТИФІКАТ', width / 2, 180);
        
        ctx.font = '30px "Inter", sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('про успішне проходження тестування', width / 2, 240);

        ctx.font = 'bold 70px "Inter", sans-serif';
        ctx.fillStyle = '#4f46e5';
        ctx.fillText(QuizPage.studentName, width / 2, 380);
        
        ctx.beginPath();
        ctx.moveTo(width / 2 - 200, 410);
        ctx.lineTo(width / 2 + 200, 410);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.font = 'bold 40px "Inter", sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.fillText(`Тест: "${QuizPage.quiz.title}"`, width / 2, 500);

        ctx.font = 'bold 50px "Inter", sans-serif';
        ctx.fillStyle = pct >= 80 ? '#10b981' : '#f59e0b';
        ctx.fillText(`Результат: ${pct}%`, width / 2, 580);

        ctx.font = '24px "Inter", sans-serif';
        ctx.fillStyle = '#94a3b8';
        const date = new Date().toLocaleDateString('uk-UA');
        ctx.fillText(`Дата видачі: ${date}`, width / 2, 700);
        
        ctx.font = 'bold 24px "Inter", sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('MyQuiz Pro • Education Platform', width / 2, 740);

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [width, height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        pdf.save(`Certificate_${QuizPage.studentName}.pdf`);
    }
};