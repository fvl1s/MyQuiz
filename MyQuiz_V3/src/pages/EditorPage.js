import { Storage } from '../storage/storage.js';
import { Toast } from '../utils/toast.js';
import { Icons } from '../utils/icons.js';

export const EditorPage = {
    currentId: null,

    init: (editId = null) => {
        EditorPage.currentId = editId;
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-select-container')) {
                document.querySelectorAll('.custom-select-options').forEach(el => el.classList.add('hidden'));
                document.querySelectorAll('.custom-select-trigger').forEach(el => el.classList.remove('active'));
            }
        });
        App.route('create'); 
    },

    render: () => {
        const container = document.getElementById('app-content');
        if (!container) return;

        const categories = ['Загальне', 'Програмування', 'Математика', 'Історія', 'Мови', 'Наука', 'IQ Тест'];

        container.innerHTML = `
            <div class="page-header sticky">
                <div style="display:flex; flex-direction:column;">
                    <span style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">Режим редагування</span>
                    <h1 id="editor-heading">${EditorPage.currentId ? 'Редагування тесту' : 'Новий тест'}</h1>
                </div>
                <div class="header-actions">
                    <button class="btn-secondary" onclick="App.route('manage')">Скасувати</button>
                    <button class="btn-primary" onclick="App.pages.editor.save()">${Icons.check} Зберегти тест</button>
                </div>
            </div>

            <div class="content-body" style="max-width: 900px; margin: 0 auto;">
                <div class="card" style="margin-bottom: 32px; padding: 40px; border-radius: 32px; border: 1px solid var(--border); box-shadow: var(--shadow-sm);">
                    
                    <div style="display:grid; grid-template-columns: 1fr 2fr; gap: 24px; margin-bottom: 24px;">
                         <div class="form-group">
                            <label class="form-label">Категорія</label>
                            ${EditorPage.renderCustomSelect('build-category', 'Оберіть предмет...', categories.map(c => ({value: c, label: c})))}
                        </div>
                        <div class="form-group">
                            <label class="form-label">Назва тесту</label>
                            <input type="text" id="build-title" class="form-control" placeholder="Введіть назву тесту..." style="height: 52px; font-size: 16px; font-weight: 700;">
                        </div>
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 32px;">
                        <label class="form-label">Опис та інструкції</label>
                        <textarea id="build-desc" class="form-control" placeholder="Додайте опис, який побачать студенти перед початком..." style="min-height: 100px; border-radius: 16px; resize: none; line-height: 1.6;"></textarea>
                    </div>

                    <div style="background: #f8fafc; border-radius: 24px; padding: 24px; border: 1px solid var(--border);">
                        <h4 style="margin: 0 0 20px 0; font-size: 16px; display:flex; align-items:center; gap:8px;">${Icons.settings} Налаштування проходження</h4>
                        
                        <div class="settings-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            ${EditorPage.renderSwitch('check-timer', 'Обмеження часу', 'Встановлює ліміт часу на проходження всього тесту.')}
                            ${EditorPage.renderSwitch('check-deadline', 'Дедлайн доступу', 'Тест буде доступний тільки до вказаної дати.')}
                            ${EditorPage.renderSwitch('check-retake', 'Дозволити перескладання', 'Студент може проходити тест кілька разів.')}
                            ${EditorPage.renderSwitch('check-answers', 'Показувати відповіді', 'Показати правильні відповіді після завершення.')}
                            ${EditorPage.renderSwitch('check-backtracking', 'Вільна навігація', 'Дозволити повертатися до попередніх питань.')}
                            ${EditorPage.renderSwitch('check-leaderboard', 'Таблиця лідерів', 'Показувати рейтинг студентів.')}
                        </div>

                        <div id="timer-block" class="hidden" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; animation: fadeIn 0.3s ease;">
                            <label class="form-label" style="margin-bottom: 8px;">Встановіть час (Години : Хвилини)</label>
                            <div style="display:flex; gap:12px; align-items:center;">
                                <div style="position:relative; width:100px;">
                                    <input type="number" id="time-h" class="form-control no-arrows" value="0" min="0" oninput="EditorPage.validateNumber(this)" style="text-align:center; font-weight:700;">
                                    <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%); font-size:10px; color:var(--text-muted); font-weight:700;">ГОД</span>
                                </div>
                                <span style="font-weight:700; color:var(--text-muted);">:</span>
                                <div style="position:relative; width:100px;">
                                    <input type="number" id="time-m" class="form-control no-arrows" value="30" min="1" oninput="EditorPage.validateNumber(this)" style="text-align:center; font-weight:700;">
                                    <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%); font-size:10px; color:var(--text-muted); font-weight:700;">ХВ</span>
                                </div>
                            </div>
                        </div>

                        <div id="deadline-block" class="hidden" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; animation: fadeIn 0.3s ease;">
                            <label class="form-label">Кінцева дата та час</label>
                            <input type="datetime-local" id="deadline-input" class="form-control" style="width: auto; font-weight:600;">
                        </div>
                    </div>
                </div>

                <div id="build-questions-container" style="display:flex; flex-direction:column; gap:24px;"></div>

                <div style="margin-top: 32px; padding-bottom: 60px;">
                    <button onclick="App.pages.editor.addQuestion()" class="btn-dashed-lg">
                        <div style="background:var(--primary); color:white; width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center;">${Icons.plus}</div>
                        <span>Додати нове запитання</span>
                    </button>
                </div>
            </div>

            <style>
                input[type=number]::-webkit-inner-spin-button, 
                input[type=number]::-webkit-outer-spin-button { 
                    -webkit-appearance: none; 
                    margin: 0; 
                }
                input[type=number] {
                    -moz-appearance: textfield;
                }

                .custom-select-container { position: relative; width: 100%; user-select: none; }
                .custom-select-trigger {
                    display: flex; align-items: center; justify-content: space-between;
                    height: 52px; padding: 0 16px; background: white; border: 1px solid var(--border);
                    border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer; transition: 0.2s;
                }
                .custom-select-trigger.active { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-fade); }
                .custom-select-options {
                    position: absolute; top: 105%; left: 0; right: 0; background: white;
                    border: 1px solid var(--border); border-radius: 12px; box-shadow: var(--shadow-lg);
                    z-index: 50; overflow: hidden; max-height: 250px; overflow-y: auto;
                    display: flex; flex-direction: column; animation: fadeIn 0.1s ease;
                }
                .custom-option {
                    padding: 12px 16px; cursor: pointer; font-size: 14px; font-weight: 500; transition: 0.1s;
                }
                .custom-option:hover { background: var(--bg-body); color: var(--primary); }
                .custom-option.selected { background: var(--primary-light); color: var(--primary); font-weight: 700; }
                .error-field { border-color: var(--danger) !important; box-shadow: 0 0 0 3px var(--danger-bg) !important; }
            </style>
        `;
        EditorPage.loadData();
    },

    renderCustomSelect: (id, placeholder, options, initialValue = '') => {
        const optionsHtml = options.map(opt => 
            `<div class="custom-option" data-value="${opt.value}" onclick="App.pages.editor.handleSelectOption(this, '${id}')">${opt.label}</div>`
        ).join('');
        
        return `
            <div class="custom-select-container" id="container-${id}">
                <input type="hidden" id="${id}" value="${initialValue}">
                <div class="custom-select-trigger" onclick="App.pages.editor.toggleCustomSelect('${id}')">
                    <span class="select-text">${placeholder}</span>
                    <span style="color:var(--text-muted); font-size:10px;">▼</span>
                </div>
                <div class="custom-select-options hidden" id="options-${id}">
                    ${optionsHtml}
                </div>
            </div>
        `;
    },

    toggleCustomSelect: (id) => {
        const options = document.getElementById(`options-${id}`);
        const trigger = document.getElementById(`container-${id}`).querySelector('.custom-select-trigger');
        const isHidden = options.classList.contains('hidden');
        
        document.querySelectorAll('.custom-select-options').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.custom-select-trigger').forEach(el => el.classList.remove('active'));

        if (isHidden) {
            options.classList.remove('hidden');
            trigger.classList.add('active');
        }
    },

    handleSelectOption: (el, id) => {
        const value = el.getAttribute('data-value');
        const text = el.innerText;
        const container = document.getElementById(`container-${id}`);
        
        container.querySelector('input').value = value;
        container.querySelector('.select-text').innerText = text;
        container.querySelector('.select-text').style.color = 'var(--text-main)';
        
        container.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
        el.classList.add('selected');

        if(id.startsWith('type-')) {
            const qId = id.replace('type-', '');
            EditorPage.changeType(value, qId);
        }

        document.getElementById(`options-${id}`).classList.add('hidden');
        container.querySelector('.custom-select-trigger').classList.remove('active');
    },

    setCustomSelectValue: (id, value) => {
        const container = document.getElementById(`container-${id}`);
        if (!container) return;
        const option = container.querySelector(`.custom-option[data-value="${value}"]`);
        if (option) {
            container.querySelector('input').value = value;
            container.querySelector('.select-text').innerText = option.innerText;
            option.classList.add('selected');
        }
    },

    renderSwitch: (id, label, infoText) => `
        <div class="switch-group" style="padding: 12px 16px; background: white; border: 1px solid #e2e8f0; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: 0.2s;" onclick="App.pages.editor.toggleSwitch(this, '${id}')">
            <div style="display:flex; align-items:center; gap:12px;">
                <label class="switch" style="margin:0;"><input type="checkbox" id="${id}" onchange="App.pages.editor.handleSettingsToggle('${id}', this)"><span class="slider"></span></label>
                <div style="font-weight: 600; font-size: 14px;">${label}</div>
            </div>
            <button class="btn-icon-link" onclick="event.stopPropagation(); App.showInfo('${label}', '${infoText}')" style="width: 28px; height: 28px; border:none; background:transparent;">${Icons.info}</button>
        </div>
    `,

    toggleSwitch: (el, id) => {
        if (event.target.closest('button')) return;

        if (event.target.closest('.switch')) return;

        const cb = el.querySelector('input');
        cb.checked = !cb.checked;
        cb.dispatchEvent(new Event('change'));
    },

    handleSettingsToggle: (id, cb) => {
        if (id === 'check-timer') document.getElementById('timer-block').classList.toggle('hidden', !cb.checked);
        if (id === 'check-deadline') document.getElementById('deadline-block').classList.toggle('hidden', !cb.checked);
    },

    validatePoints: (input) => {
        let val = input.value.replace(/[^0-9.,]/g, '');
        if (val.length > 3) val = val.slice(0, 3);
        input.value = val;
    },

    validateNumber: (input) => {
        input.value = input.value.replace(/[^0-9]/g, '');
    },

    loadData: () => {
        const container = document.getElementById('build-questions-container');
        if (!container) return;
        
        if (EditorPage.currentId) {
            const quiz = Storage.getQuizById(EditorPage.currentId);
            document.getElementById('build-title').value = quiz.title || '';
            document.getElementById('build-desc').value = quiz.description || '';
            
            EditorPage.setCustomSelectValue('build-category', quiz.category);

            document.getElementById('check-retake').checked = quiz.allowRetake;
            document.getElementById('check-answers').checked = quiz.showAnswers;
            document.getElementById('check-leaderboard').checked = quiz.showLeaderboard;
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
            quiz.questions.forEach(q => EditorPage.addQuestion(q));
        } else {
            EditorPage.addQuestion(); 
        }
        EditorPage.updateQuestionNumbers();
    },

    addQuestion: (data = null) => {
        const container = document.getElementById('build-questions-container');
        const qId = 'q_' + Math.random().toString(36).substr(2, 9);
        const div = document.createElement('div');
        div.className = 'question-card';
        div.style.cssText = `background: white; border-radius: 24px; padding: 32px; border: 1px solid var(--border); box-shadow: var(--shadow-sm); position: relative; animation: fadeUp 0.3s ease;`;
        div.setAttribute('data-id', qId);
        
        const qType = data ? data.type : 'single';
        const points = data ? data.points : 1;

        const types = [
            {value: 'single', label: '🔵 Один варіант'},
            {value: 'multi', label: '🔲 Декілька варіантів'},
            {value: 'boolean', label: '👍👎 Правда / Хибно'},
            {value: 'matching', label: '🔗 Зіставлення'},
            {value: 'text', label: '✍️ Текстова відповідь'},
            {value: 'info', label: 'ℹ️ Інфо-блок (без балів)'}
        ];

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
                <div style="display: flex; align-items: center; gap: 16px; flex: 1;">
                    <div class="q-number" style="background:var(--primary); color:white; padding:6px 12px; border-radius:10px; font-weight:800; font-size:12px; letter-spacing:0.5px; white-space:nowrap;">ПИТАННЯ</div>
                    <div style="width: 240px;">
                        ${EditorPage.renderCustomSelect(`type-${qId}`, 'Тип запитання', types, qType)}
                    </div>
                </div>
                <div class="q-header-right" style="display: flex; align-items: center; gap: 12px;">
                    ${qType !== 'info' ? `
                    <div class="points-widget" style="display: flex; align-items: center; background: #f8fafc; padding: 4px; border-radius: 12px; border: 1px solid #e2e8f0;">
                        <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); padding: 0 10px; text-transform: uppercase;">Бали</span>
                        <input type="text" class="q-points-input q-points" value="${points}" oninput="App.pages.editor.validatePoints(this)" style="width: 50px; height: 32px; border: 1px solid #cbd5e1; border-radius: 8px; text-align: center; font-weight: 700; color: var(--primary);">
                    </div>` : ''}
                    <button class="btn-icon-danger" onclick="this.closest('.question-card').remove(); App.pages.editor.updateQuestionNumbers();" title="Видалити запитання">${Icons.trash}</button>
                </div>
            </div>

            <div class="form-group">
                <textarea class="form-control q-text" placeholder="${qType === 'info' ? 'Введіть інформаційний текст або матеріал для вивчення...' : 'Введіть текст запитання...'}" style="min-height: 90px; border-radius: 16px; resize: none; font-size: 15px; border: 1px solid #cbd5e1;">${data ? data.text : ''}</textarea>
            </div>

            <div class="q-content-area" style="background: #f8fafc; border-radius: 20px; padding: 24px; border: 1px solid #f1f5f9;"></div>
        `;
        
        container.appendChild(div);
        EditorPage.setCustomSelectValue(`type-${qId}`, qType);
        EditorPage.updateQuestionNumbers();
        EditorPage.renderSpecificContent(div.querySelector('.q-content-area'), qId, qType, data);
        
        div.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },

    changeType: (newType, qId) => {
        const card = document.querySelector(`.question-card[data-id="${qId}"]`);
        if (!card) return;
        
        const area = card.querySelector('.q-content-area');
        const pointsWidget = card.querySelector('.points-widget');
        const headerRight = card.querySelector('.q-header-right');
        const textArea = card.querySelector('.q-text');

        if (newType === 'info') {
            if(pointsWidget) pointsWidget.remove();
            textArea.placeholder = 'Введіть інформаційний текст або матеріал для вивчення...';
        } else {
            textArea.placeholder = 'Введіть текст запитання...';
            if (!pointsWidget) {
                const widgetHtml = `<div class="points-widget" style="display: flex; align-items: center; background: #f8fafc; padding: 4px; border-radius: 12px; border: 1px solid #e2e8f0;">
                        <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); padding: 0 10px; text-transform: uppercase;">Бали</span>
                        <input type="text" class="q-points-input q-points" value="1" oninput="App.pages.editor.validatePoints(this)" style="width: 50px; height: 32px; border: 1px solid #cbd5e1; border-radius: 8px; text-align: center; font-weight: 700; color: var(--primary);">
                    </div>`;
                headerRight.insertAdjacentHTML('afterbegin', widgetHtml);
            }
        }
        EditorPage.renderSpecificContent(area, qId, newType, null);
    },

    renderSpecificContent: (container, qId, type, data) => {
        container.innerHTML = '';
        if (type === 'info') { container.style.display = 'none'; return; }
        container.style.display = 'block';

        if (type === 'text') {
            container.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <label class="form-label" style="margin:0; font-size:12px; text-transform:uppercase;">Правильна відповідь (текст)</label>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div style="color:var(--success);">${Icons.check}</div>
                        <input type="text" class="form-control q-correct-text" value="${data ? data.correctText : ''}" placeholder="Введіть правильну відповідь..." style="border-color:var(--success);">
                    </div>
                </div>`;
        } 
        else if (type === 'boolean') {
            const isTrue = data ? data.correctBoolean === true : true;
            container.innerHTML = `
                <label class="form-label" style="text-align:center; display:block; margin-bottom:16px;">Яке твердження є правильним?</label>
                <div class="tf-container" style="display:grid; grid-template-columns:1fr 1fr; gap:16px; max-width:400px; margin:0 auto;">
                    <button class="tf-btn true ${isTrue ? 'selected' : ''}" onclick="App.pages.editor.setBoolean(this, true)" style="height:60px; border-radius:16px; border:2px solid #e2e8f0; background:white; font-weight:800; color:var(--text-secondary); transition:0.2s; font-size:16px;">ПРАВДА</button>
                    <button class="tf-btn false ${!isTrue ? 'selected' : ''}" onclick="App.pages.editor.setBoolean(this, false)" style="height:60px; border-radius:16px; border:2px solid #e2e8f0; background:white; font-weight:800; color:var(--text-secondary); transition:0.2s; font-size:16px;">ХИБНО</button>
                    <input type="hidden" class="q-boolean-val" value="${isTrue}">
                </div>
                <style>
                    .tf-btn.selected.true { background:var(--success-bg) !important; border-color:var(--success) !important; color:var(--success-text) !important; }
                    .tf-btn.selected.false { background:var(--danger-bg) !important; border-color:var(--danger) !important; color:var(--danger-text) !important; }
                    .tf-btn:hover:not(.selected) { border-color:var(--primary); color:var(--primary); }
                </style>`;
        } 
        else if (type === 'matching') {
            container.innerHTML = `
                <div class="match-list" style="display:flex; flex-direction:column; gap:12px;"></div>
                <button class="btn-secondary" style="margin-top:16px; width:100%; border:2px dashed #cbd5e1; color:var(--text-secondary);" onclick="App.pages.editor.addMatchRow(this, '${qId}')">${Icons.plus} Додати пару</button>
            `;
            const list = container.querySelector('.match-list');
            if (data && data.pairs) data.pairs.forEach(p => EditorPage.appendMatchHtml(list, p.left, p.right));
            else { EditorPage.appendMatchHtml(list, '', ''); EditorPage.appendMatchHtml(list, '', ''); }
        } 
        else {
            const isMulti = type === 'multi';
            container.innerHTML = `
                <div class="q-opts-list" style="display:flex; flex-direction:column; gap:12px;"></div>
                <button onclick="App.pages.editor.addOption(this, '${qId}')" class="btn-secondary" style="margin-top:16px; width:100%; border:2px dashed #cbd5e1; color:var(--text-secondary);">${Icons.plus} Додати варіант</button>
            `;
            const list = container.querySelector('.q-opts-list');
            const inputType = isMulti ? 'checkbox' : 'radio';
            if (data && data.options) data.options.forEach(opt => EditorPage.appendOptionHtml(list, qId, opt.text, opt.isCorrect, inputType));
            else { EditorPage.appendOptionHtml(list, qId, '', true, inputType); EditorPage.appendOptionHtml(list, qId, '', false, inputType); }
        }
    },

    setBoolean: (btn, val) => {
        const container = btn.parentElement;
        container.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        container.querySelector('.q-boolean-val').value = val;
    },

    addMatchRow: (btn, qId) => EditorPage.appendMatchHtml(btn.previousElementSibling, '', ''),

    appendMatchHtml: (container, left, right) => {
        const div = document.createElement('div');
        div.className = 'opt-row-editor';
        div.style.cssText = 'display:grid; grid-template-columns: 1fr 20px 1fr 40px; align-items:center; gap:12px; animation:fadeIn 0.2s ease;';
        div.innerHTML = `
            <input type="text" class="form-control match-left" value="${left}" placeholder="Ключ">
            <div style="color:var(--text-muted); text-align:center;">→</div>
            <input type="text" class="form-control match-right" value="${right}" placeholder="Значення">
            <button class="btn-icon-danger" style="width:36px; height:36px;" onclick="if(this.closest('.match-list').children.length > 1) this.parentElement.remove(); else App.showInfo('Помилка', 'Має бути мінімум 1 пара');">
                ${Icons.trash}
            </button>
        `;
        container.appendChild(div);
    },

    addOption: (btn, qId) => {
        const typeContainer = document.getElementById(`type-${qId}`);
        const type = typeContainer ? typeContainer.value : 'single';
        EditorPage.appendOptionHtml(btn.previousElementSibling, qId, '', false, type === 'single' ? 'radio' : 'checkbox');
    },

    appendOptionHtml: (container, qId, text, isChecked, type) => {
        const div = document.createElement('div');
        div.className = 'opt-row-editor';
        div.style.cssText = 'display:flex; align-items:center; gap:12px; background:white; padding:8px 12px; border-radius:12px; border:1px solid #e2e8f0; animation:fadeIn 0.2s ease;';
        
        div.innerHTML = `
            <div style="position:relative; display:flex; align-items:center;">
                <input type="${type}" name="rad_${qId}" class="opt-check" ${isChecked ? 'checked' : ''} style="width:20px; height:20px; accent-color:var(--primary); cursor:pointer;">
            </div>
            <input type="text" class="form-control opt-text-input" value="${text}" placeholder="Варіант відповіді..." style="border:none; box-shadow:none; padding:8px 0; background:transparent;">
            <button onclick="if(this.closest('.q-opts-list').children.length > 2) this.parentElement.remove(); else App.showInfo('Помилка', 'Має бути мінімум 2 варіанти');" class="btn-icon-danger" style="width:32px; height:32px; opacity:0.6;">
                ${Icons.trash}
            </button>`;
        container.appendChild(div);
    },

    updateQuestionNumbers: () => {
        document.querySelectorAll('.question-card .q-number').forEach((el, i) => el.innerText = `ПИТАННЯ ${i + 1}`);
    },

    save: () => {
        document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));

        const categoryInput = document.getElementById('build-category');
        const titleInput = document.getElementById('build-title');
        
        const category = categoryInput.value;
        const title = titleInput.value.trim();
        const domQuestions = document.querySelectorAll('.question-card');

        let isValid = true;
        let errorMsg = '';

        if (!category) {
            categoryInput.parentElement.querySelector('.custom-select-trigger').classList.add('error-field');
            isValid = false;
            errorMsg = 'Оберіть категорію тесту';
        }
        if (!title) {
            titleInput.classList.add('error-field');
            isValid = false;
            if(!errorMsg) errorMsg = 'Введіть назву тесту';
        }
        if (domQuestions.length === 0) {
            isValid = false;
            if(!errorMsg) errorMsg = 'Додайте хоча б одне запитання';
        }

        const questions = [];

        domQuestions.forEach((card, index) => {
            const typeInput = card.querySelector(`input[type="hidden"]`);
            const type = typeInput ? typeInput.value : 'single';
            const textInput = card.querySelector('.q-text');
            const text = textInput.value.trim();
            const pointsInput = card.querySelector('.q-points');
            const pointsStr = pointsInput ? pointsInput.value.replace(',', '.') : '0';
            const points = parseFloat(pointsStr) || 0;

            if (!text) {
                isValid = false;
                textInput.classList.add('error-field');
                if(!errorMsg) errorMsg = `Питання №${index+1}: введіть текст`;
            }

            const qObj = { type, text, points };

            if (type === 'single' || type === 'multi') {
                qObj.options = [];
                let hasCorrect = false;
                card.querySelectorAll('.opt-row-editor').forEach(row => {
                    const optInput = row.querySelector('.opt-text-input');
                    const optText = optInput.value.trim();
                    const isCorrect = row.querySelector('.opt-check').checked;
                    
                    if (optText) {
                        if (isCorrect) hasCorrect = true;
                        qObj.options.push({ text: optText, isCorrect });
                    }
                });
                
                if (qObj.options.length < 2) {
                    isValid = false;
                    if(!errorMsg) errorMsg = `Питання №${index+1}: додайте мінімум 2 варіанти`;
                } else if (!hasCorrect && type === 'single') {
                    isValid = false;
                    if(!errorMsg) errorMsg = `Питання №${index+1}: позначте правильну відповідь`;
                } else if (!hasCorrect && type === 'multi') {
                    isValid = false;
                     if(!errorMsg) errorMsg = `Питання №${index+1}: позначте хоча б одну правильну відповідь`;
                }
            } 
            else if (type === 'text') {
                const correctInput = card.querySelector('.q-correct-text');
                qObj.correctText = correctInput.value.trim();
                if (!qObj.correctText) {
                    isValid = false;
                    correctInput.classList.add('error-field');
                    if(!errorMsg) errorMsg = `Питання №${index+1}: введіть правильну відповідь`;
                }
            } 
            else if (type === 'boolean') {
                qObj.correctBoolean = card.querySelector('.q-boolean-val').value === 'true';
            } 
            else if (type === 'matching') {
                qObj.pairs = [];
                let pairsValid = true;
                card.querySelectorAll('.opt-row-editor').forEach(row => {
                    const leftInput = row.querySelector('.match-left');
                    const rightInput = row.querySelector('.match-right');
                    const left = leftInput.value.trim();
                    const right = rightInput.value.trim();
                    
                    if (!left || !right) {
                        pairsValid = false;
                        if(!left) leftInput.classList.add('error-field');
                        if(!right) rightInput.classList.add('error-field');
                    }
                    qObj.pairs.push({ left, right });
                });
                if (!pairsValid || qObj.pairs.length === 0) {
                    isValid = false;
                    if(!errorMsg) errorMsg = `Питання №${index+1}: заповніть усі пари`;
                }
            }
            questions.push(qObj);
        });

        if (!isValid) {
            Toast.show(`⚠️ ${errorMsg}`);
            return;
        }

        Storage.saveQuiz({
            id: EditorPage.currentId || 'qz_' + Date.now(),
            title, category,
            description: document.getElementById('build-desc').value,
            allowRetake: document.getElementById('check-retake').checked,
            showAnswers: document.getElementById('check-answers').checked,
            showLeaderboard: document.getElementById('check-leaderboard').checked,
            allowBacktracking: document.getElementById('check-backtracking').checked,
            timeLimit: document.getElementById('check-timer').checked ? (parseInt(document.getElementById('time-h').value || 0) * 3600 + parseInt(document.getElementById('time-m').value || 0) * 60) : 0,
            deadline: document.getElementById('check-deadline').checked ? document.getElementById('deadline-input').value : null,
            questions, isArchived: false, created: new Date().toISOString()
        });

        Toast.show('✅ Тест успішно збережено');
        App.route('manage');
    }
};