import { Storage } from '../storage/storage.js';
import { Toast } from '../utils/toast.js';

export const EditorPage = {
    currentId: null,

    // Вызывается при нажатии кнопки в меню
    init: (editId = null) => {
        EditorPage.currentId = editId;
        App.route('create'); // Рендерит шаблон, затем loadData вызывается из main.js
    },

    // Вызывается ПОСЛЕ рендера шаблона в main.js
    loadData: () => {
        const qList = document.getElementById('build-questions');
        qList.innerHTML = '';

        if (EditorPage.currentId) {
            const quiz = Storage.getQuizById(EditorPage.currentId);
            document.getElementById('build-title').value = quiz.title;
            document.getElementById('build-desc').value = quiz.description;
            document.getElementById('check-retake').checked = quiz.allowRetake !== false;
            document.getElementById('check-answers').checked = quiz.showAnswers !== false;
            
            if (quiz.timeLimit > 0) {
                document.getElementById('check-timer').checked = true;
                document.getElementById('timer-block').classList.remove('hidden');
                document.getElementById('time-h').value = Math.floor(quiz.timeLimit / 3600);
                document.getElementById('time-m').value = Math.floor((quiz.timeLimit % 3600) / 60);
            } else {
                document.getElementById('check-timer').checked = false;
                document.getElementById('timer-block').classList.add('hidden');
            }

            document.getElementById('editor-heading').innerText = 'Редагування';
            quiz.questions.forEach(q => EditorPage.addQuestion(q));
        } else {
            // Новый тест
            document.getElementById('build-title').value = '';
            document.getElementById('build-desc').value = '';
            document.getElementById('check-timer').checked = false;
            document.getElementById('timer-block').classList.add('hidden');
            document.getElementById('check-retake').checked = true;
            document.getElementById('check-answers').checked = true;
            document.getElementById('time-h').value = '';
            document.getElementById('time-m').value = '';
            document.getElementById('editor-heading').innerText = 'Новий тест';
            EditorPage.addQuestion();
        }
    },

    toggleTimer: (cb) => {
        const blk = document.getElementById('timer-block');
        if (cb.checked) blk.classList.remove('hidden');
        else blk.classList.add('hidden');
    },

    addQuestion: (data = null) => {
        const container = document.getElementById('build-questions');
        const qId = Date.now() + Math.random();
        
        const div = document.createElement('div');
        div.className = 'card';
        div.style.marginBottom = '24px';
        
        const qText = data ? data.text : '';
        const qPoints = data && data.points ? data.points : 1;
        const qType = data && data.type ? data.type : 'single'; // single | multi

        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:16px; border-bottom:1px solid #f1f5f9; padding-bottom:16px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-weight:600; color:var(--primary);">Питання</span>
                    <select class="form-control q-type" onchange="App.pages.editor.changeType(this, '${qId}')" style="width: auto; padding: 6px; font-size: 13px;">
                        <option value="single" ${qType === 'single' ? 'selected' : ''}>Один правильний</option>
                        <option value="multi" ${qType === 'multi' ? 'selected' : ''}>Множинний вибір</option>
                    </select>
                </div>
                <button class="btn-ghost" style="color:var(--danger)" onclick="this.closest('.card').remove()">Видалити</button>
            </div>
            
            <div class="form-group" style="display:flex; gap: 10px; align-items:center;">
                <input class="form-control q-text" value="${qText}" placeholder="Введіть текст питання..." style="font-weight:500; flex:1">
                 <div style="display:flex; align-items:center; gap:5px; width: 100px;">
                    <input type="text" class="form-control q-points" value="${qPoints}" 
                        style="margin:0; padding:10px; text-align:center" 
                        maxlength="3"
                        oninput="this.value = this.value.replace(/[^0-9.,]/g, '')"
                        title="Кількість балів">
                    <span style="font-size:12px; color:#64748b">балів</span>
                </div>
            </div>
            
            <div class="q-opts-list" style="margin-top:16px; display:grid; gap:12px;"></div>
            <button onclick="App.pages.editor.addOption(this, '${qId}')" class="btn-ghost" style="margin-top:16px;">+ Додати варіант відповіді</button>
        `;
        
        container.appendChild(div);
        
        const listDiv = div.querySelector('.q-opts-list');
        const inputType = qType === 'single' ? 'radio' : 'checkbox';

        if (data && data.options) {
            data.options.forEach(opt => EditorPage.appendOptionHtml(listDiv, qId, opt.text, opt.isCorrect, inputType));
        } else {
            EditorPage.appendOptionHtml(listDiv, qId, '', false, inputType);
            EditorPage.appendOptionHtml(listDiv, qId, '', false, inputType);
        }
    },

    changeType: (select, qId) => {
        const card = select.closest('.card');
        const type = select.value;
        const inputType = type === 'single' ? 'radio' : 'checkbox';
        
        // Меняем тип всех инпутов в этой карточке
        card.querySelectorAll('.opt-select-input').forEach(input => {
            input.type = inputType;
            input.checked = false; // Сбрасываем выбор во избежание конфликтов
        });
    },

    addOption: (btn, qId) => {
        const listDiv = btn.previousElementSibling;
        const card = btn.closest('.card');
        const type = card.querySelector('.q-type').value;
        const inputType = type === 'single' ? 'radio' : 'checkbox';
        EditorPage.appendOptionHtml(listDiv, qId, '', false, inputType);
    },

    appendOptionHtml: (container, groupName, text, isChecked, type) => {
        const div = document.createElement('div');
        div.className = 'opt-row';
        div.style.display = 'flex';
        div.style.gap = '12px';
        div.style.alignItems = 'center';
        
        div.innerHTML = `
            <input type="${type}" name="rad_${groupName}" class="opt-select-input" ${isChecked ? 'checked' : ''} style="cursor:pointer; width:18px; height:18px; accent-color:var(--primary);">
            <input type="text" class="form-control" value="${text}" placeholder="Варіант відповіді" style="margin:0">
            <button onclick="this.parentElement.remove()" class="btn-ghost" style="color:#cbd5e1; padding:4px 8px;">✕</button>
        `;
        container.appendChild(div);
    },

    save: () => {
        const title = document.getElementById('build-title').value.trim();
        if (!title) {
            Toast.show('Помилка: Введіть назву тесту');
            return;
        }

        let time = 0;
        if (document.getElementById('check-timer').checked) {
            const h = parseInt(document.getElementById('time-h').value) || 0;
            const m = parseInt(document.getElementById('time-m').value) || 0;
            time = h * 3600 + m * 60;
        }

        const qCards = document.querySelectorAll('#build-questions .card');
        const questions = [];
        
        if (qCards.length === 0) {
            Toast.show('Помилка: Додайте хоча б одне питання');
            return;
        }

        for (let i = 0; i < qCards.length; i++) {
            const card = qCards[i];
            const txt = card.querySelector('.q-text').value.trim();
            const pointsStr = card.querySelector('.q-points').value.replace(',', '.');
            const points = parseFloat(pointsStr);
            const type = card.querySelector('.q-type').value;
            
            if (!txt) {
                Toast.show(`Питання №${i+1}: Введіть текст питання`);
                return;
            }
            if (isNaN(points) || points < 0) {
                Toast.show(`Питання №${i+1}: Некоректна кількість балів`);
                return;
            }

            const opts = [];
            let hasCorrect = false;
            let correctCount = 0;

            const rows = card.querySelectorAll('.opt-row');
            if (rows.length < 2) {
                Toast.show(`Питання №${i+1}: Потрібно мінімум 2 варіанти відповіді`);
                return;
            }

            for(let row of rows) {
                const optTxt = row.querySelector('input[type=text]').value.trim();
                const isCorr = row.querySelector('.opt-select-input').checked;
                
                if (!optTxt) {
                    Toast.show(`Питання №${i+1}: Введіть текст для всіх варіантів`);
                    return;
                }
                
                if (isCorr) {
                    hasCorrect = true;
                    correctCount++;
                }

                opts.push({ text: optTxt, isCorrect: isCorr });
            }
            
            if (!hasCorrect) {
                Toast.show(`Питання №${i+1}: Виберіть правильну відповідь`);
                return;
            }

            // Для одиночного типа может быть только 1 правильный (хотя радио и так ограничивает, но проверим)
            if (type === 'single' && correctCount > 1) {
                 Toast.show(`Питання №${i+1}: Тип "Один правильний" не може мати кілька правильних відповідей`);
                 return;
            }

            questions.push({ text: txt, points: points, type: type, options: opts });
        }

        const quizData = {
            id: EditorPage.currentId || 'qz_' + Date.now(),
            title,
            description: document.getElementById('build-desc').value,
            timeLimit: time,
            allowRetake: document.getElementById('check-retake').checked,
            showAnswers: document.getElementById('check-answers').checked,
            questions,
            created: new Date().toISOString()
        };

        const list = Storage.getQuizzes();
        if (EditorPage.currentId) {
            const idx = list.findIndex(q => q.id === EditorPage.currentId);
            list[idx] = quizData;
        } else {
            list.push(quizData);
        }
        
        Storage.saveQuizzes(list);
        Toast.show('Тест успішно збережено');
        App.route('manage');
    }
};