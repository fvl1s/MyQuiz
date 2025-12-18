import { Storage } from '../storage/storage.js';
import { Toast } from '../utils/toast.js';
import { Icons } from '../utils/icons.js';

export const EditorPage = {
    currentId: null,

    init: (editId = null) => {
        EditorPage.currentId = editId;
        App.route('create'); 
    },

    render: () => {
        const container = document.getElementById('create-content');
        if (!container) return;

        container.innerHTML = `
            <div class="page-header sticky">
                <h1 id="editor-heading">Новий тест</h1>
                <div class="header-actions">
                    <button class="btn-secondary" onclick="App.route('manage')">Скасувати</button>
                    <button class="btn-primary" onclick="App.pages.editor.save()">${Icons.check} Зберегти тест</button>
                </div>
            </div>

            <div class="content-body" style="max-width: 900px;">
                <div class="card" style="margin-bottom: 32px; padding: 40px; border-radius: 32px;">
                    <div class="form-group">
                        <label class="form-label">Назва тесту</label>
                        <input type="text" id="build-title" class="form-control" placeholder="Введіть назву..." style="font-size: 20px; font-weight: 700; padding: 18px 24px; border-radius: 18px;">
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label class="form-label">Опис тесту</label>
                        <textarea id="build-desc" class="form-control" placeholder="Короткий опис для студентів..." style="min-height: 80px; border-radius: 16px; resize: none;"></textarea>
                    </div>
                </div>

                <div id="build-questions"></div>

                <button onclick="App.pages.editor.addQuestion()" class="btn-dashed-lg">
                    ${Icons.plus} Додати запитання
                </button>

                <div class="card" style="margin-top: 40px; padding: 32px; border-radius: 32px;">
                    <h3 style="margin: 0 0 24px 0; font-size: 18px; font-weight: 800;">Налаштування доступу та логіки</h3>
                    
                    <div class="settings-grid">
                        <div class="switch-group" onclick="const c = this.querySelector('input'); c.checked = !c.checked;">
                            <label class="switch"><input type="checkbox" id="check-retake" checked><span class="slider"></span></label>
                            <div>Дозволити перездачу</div>
                        </div>

                        <div class="switch-group" onclick="const c = this.querySelector('input'); c.checked = !c.checked;">
                            <label class="switch"><input type="checkbox" id="check-answers" checked><span class="slider"></span></label>
                            <div>Показувати відповіді</div>
                        </div>

                        <div class="switch-group" onclick="const c = this.querySelector('input'); c.checked = !c.checked;">
                            <label class="switch"><input type="checkbox" id="check-backtracking" checked><span class="slider"></span></label>
                            <div>Повернення назад</div>
                        </div>

                        <div class="switch-group" onclick="const c = this.querySelector('input'); c.checked = !c.checked;">
                            <label class="switch"><input type="checkbox" id="check-leaderboard"><span class="slider"></span></label>
                            <div>Таблиця лідерів</div>
                        </div>

                        <div class="switch-group" onclick="const c = this.querySelector('input'); c.checked = !c.checked;">
                            <label class="switch"><input type="checkbox" id="check-timer" onchange="App.pages.editor.toggleTimer(this)"><span class="slider"></span></label>
                            <div>Обмежити час</div>
                        </div>

                        <div class="switch-group" onclick="const c = this.querySelector('input'); c.checked = !c.checked;">
                            <label class="switch"><input type="checkbox" id="check-deadline" onchange="App.pages.editor.toggleDeadline(this)"><span class="slider"></span></label>
                            <div>Дедлайн проходження</div>
                        </div>
                    </div>

                    <div id="timer-block" class="hidden" style="margin-top: 20px; padding: 20px; background: var(--bg-body); border-radius: 16px;">
                        <label class="form-label">Час на тест (години : хвилини)</label>
                        <div style="display:flex; gap:10px; align-items:center;">
                            <input type="number" id="time-h" class="form-control" value="0" min="0" style="width:80px;">
                            <span>:</span>
                            <input type="number" id="time-m" class="form-control" value="30" min="0" max="59" style="width:80px;">
                        </div>
                    </div>

                    <div id="deadline-block" class="hidden" style="margin-top: 20px; padding: 20px; background: var(--bg-body); border-radius: 16px;">
                        <label class="form-label">Кінцевий термін</label>
                        <input type="datetime-local" id="deadline-input" class="form-control" style="width: auto;">
                    </div>
                </div>
            </div>
        `;
        EditorPage.loadData();
    },

    loadData: () => {
        const qList = document.getElementById('build-questions');
        if (!qList) return;
        qList.innerHTML = '';

        if (EditorPage.currentId) {
            const quiz = Storage.getQuizById(EditorPage.currentId);
            document.getElementById('build-title').value = quiz.title || '';
            document.getElementById('build-desc').value = quiz.description || '';
            document.getElementById('check-retake').checked = quiz.allowRetake !== false;
            document.getElementById('check-answers').checked = quiz.showAnswers !== false;
            document.getElementById('check-leaderboard').checked = quiz.showLeaderboard === true;
            document.getElementById('check-backtracking').checked = quiz.allowBacktracking !== false;

            if (quiz.timeLimit > 0) {
                document.getElementById('check-timer').checked = true;
                document.getElementById('timer-block').classList.remove('hidden');
                document.getElementById('time-h').value = Math.floor(quiz.timeLimit / 3600);
                document.getElementById('time-m').value = Math.floor((quiz.timeLimit % 3600) / 60);
            }

            if (quiz.deadline) {
                document.getElementById('check-deadline').checked = true;
                document.getElementById('deadline-block').classList.remove('hidden');
                document.getElementById('deadline-input').value = quiz.deadline;
            }

            document.getElementById('editor-heading').innerText = 'Редагування тесту';
            quiz.questions.forEach(q => EditorPage.addQuestion(q));
        } else {
            EditorPage.addQuestion();
        }
        EditorPage.updateQuestionNumbers();
    },

    toggleTimer: (cb) => {
        document.getElementById('timer-block').classList.toggle('hidden', !cb.checked);
    },

    toggleDeadline: (cb) => {
        document.getElementById('deadline-block').classList.toggle('hidden', !cb.checked);
    },

    addQuestion: (data = null) => {
        const container = document.getElementById('build-questions');
        const qId = 'q_' + Math.random().toString(36).substr(2, 9);
        const div = document.createElement('div');
        div.className = 'question-card';
        div.setAttribute('data-id', qId);
        
        const qType = data ? data.type : 'single';

        div.innerHTML = `
            <div class="q-card-header">
                <div class="q-header-left" style="display:flex; align-items:center; gap:16px;">
                    <div class="q-number">ПИТАННЯ</div>
                    <select class="type-select" onchange="App.pages.editor.changeType(this, '${qId}')">
                        <option value="single" ${qType === 'single' ? 'selected' : ''}>Один правильний</option>
                        <option value="multi" ${qType === 'multi' ? 'selected' : ''}>Множинний вибір</option>
                        <option value="text" ${qType === 'text' ? 'selected' : ''}>Текстова відповідь</option>
                    </select>
                </div>
                <div class="q-header-right" style="display:flex; align-items:center; gap:16px;">
                    <div class="points-widget">
                        <span>БАЛИ</span>
                        <input type="number" class="q-points-input q-points" value="${data ? data.points : 1}" min="0.5" step="0.5">
                    </div>
                    <button class="btn-icon-danger" onclick="this.closest('.question-card').remove(); App.pages.editor.updateQuestionNumbers();" title="Видалити">
                        ${Icons.trash}
                    </button>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Зміст запитання</label>
                <textarea class="form-control q-text" placeholder="Введіть питання..." style="min-height:100px; border-radius:16px; resize:none;">${data ? data.text : ''}</textarea>
            </div>
            
            <div class="q-content-area" style="background:var(--bg-body); padding:24px; border-radius:20px; border:1px solid var(--border);"></div>
        `;
        
        container.appendChild(div);
        EditorPage.updateQuestionNumbers();
        EditorPage.renderSpecificContent(div.querySelector('.q-content-area'), qId, qType, data);
    },

    updateQuestionNumbers: () => {
        document.querySelectorAll('.question-card .q-number').forEach((el, index) => {
            el.innerText = `ПИТАННЯ ${index + 1}`;
        });
    },

    changeType: (select, qId) => {
        const area = select.closest('.question-card').querySelector('.q-content-area');
        area.innerHTML = '';
        EditorPage.renderSpecificContent(area, qId, select.value, null);
    },

    renderSpecificContent: (container, qId, type, data) => {
        if (type === 'text') {
            container.innerHTML = `
                <div class="form-group" style="margin:0;">
                    <label class="form-label">Очікувана правильна відповідь</label>
                    <input type="text" class="form-control q-correct-text" value="${data ? data.correctText : ''}" placeholder="Текст відповіді...">
                </div>`;
        } else {
            container.innerHTML = `
                <label class="form-label">Варіанти відповідей</label>
                <div class="q-opts-list" style="display:grid; gap:12px;"></div>
                <button onclick="App.pages.editor.addOption(this, '${qId}')" class="btn-secondary" style="margin-top:16px; border-style:dashed;">${Icons.plus} Додати варіант</button>`;
            const list = container.querySelector('.q-opts-list');
            const inType = type === 'single' ? 'radio' : 'checkbox';
            if (data && data.options) {
                data.options.forEach(opt => EditorPage.appendOptionHtml(list, qId, opt.text, opt.isCorrect, inType));
            } else {
                EditorPage.appendOptionHtml(list, qId, '', true, inType);
                EditorPage.appendOptionHtml(list, qId, '', false, inType);
            }
        }
    },

    addOption: (btn, qId) => {
        const type = btn.closest('.question-card').querySelector('.type-select').value;
        EditorPage.appendOptionHtml(btn.previousElementSibling, qId, '', false, type === 'single' ? 'radio' : 'checkbox');
    },

    appendOptionHtml: (container, qId, text, isChecked, type) => {
        const div = document.createElement('div');
        div.className = 'opt-row-editor';
        div.style = "display:flex; align-items:center; gap:12px; margin-bottom:8px;";
        div.innerHTML = `
            <input type="${type}" name="rad_${qId}" class="opt-check" ${isChecked ? 'checked' : ''} style="width:20px; height:20px; accent-color:var(--primary);">
            <div class="opt-input-wrapper" style="flex:1; position:relative;">
                <input type="text" class="form-control opt-text-input" value="${text}" placeholder="Текст варіанту..." style="border-radius:12px; padding-right:40px;">
                <button onclick="this.closest('.opt-row-editor').remove()" class="btn-opt-delete" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--text-muted); cursor:pointer;">${Icons.trash}</button>
            </div>`;
        container.appendChild(div);
    },

    save: () => {
        const title = document.getElementById('build-title').value.trim();
        if (!title) return Toast.show('Введіть назву тесту');

        const questions = [];
        document.querySelectorAll('.question-card').forEach(card => {
            const type = card.querySelector('.type-select').value;
            const qObj = {
                type,
                text: card.querySelector('.q-text').value.trim(),
                points: parseFloat(card.querySelector('.q-points').value) || 0
            };

            if (type === 'text') {
                qObj.correctText = card.querySelector('.q-correct-text').value.trim();
            } else {
                qObj.options = [];
                card.querySelectorAll('.opt-row-editor').forEach(row => {
                    qObj.options.push({
                        text: row.querySelector('.opt-text-input').value.trim(),
                        isCorrect: row.querySelector('.opt-check').checked
                    });
                });
            }
            questions.push(qObj);
        });

        const quizData = {
            id: EditorPage.currentId || 'qz_' + Date.now(),
            title,
            description: document.getElementById('build-desc').value,
            allowRetake: document.getElementById('check-retake').checked,
            showAnswers: document.getElementById('check-answers').checked,
            showLeaderboard: document.getElementById('check-leaderboard').checked,
            allowBacktracking: document.getElementById('check-backtracking').checked,
            timeLimit: document.getElementById('check-timer').checked ? (parseInt(document.getElementById('time-h').value || 0) * 3600 + parseInt(document.getElementById('time-m').value || 0) * 60) : 0,
            deadline: document.getElementById('check-deadline').checked ? document.getElementById('deadline-input').value : null,
            questions,
            isArchived: false,
            isClosed: false,
            created: new Date().toISOString()
        };

        Storage.saveQuiz(quizData);
        Toast.show('Тест збережено!');
        App.route('manage');
    }
};