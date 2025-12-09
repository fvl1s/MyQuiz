const Builder = {
    currentId: null,

    startNew: () => {
        Builder.currentId = null;
        const titleInput = document.getElementById('build-title');
        titleInput.value = '';
        titleInput.classList.remove('error');

        document.getElementById('build-retake').checked = true;
        document.getElementById('build-list').innerHTML = '';
        Builder.addQ(); 
        Router.to('create');
    },

    edit: (id) => {
        const q = Data.getQuizById(id);
        if(!q) return;
        Builder.currentId = id;
        const titleInput = document.getElementById('build-title');
        titleInput.value = q.title;
        titleInput.classList.remove('error');

        document.getElementById('build-retake').checked = q.allowRetake;
        
        const list = document.getElementById('build-list');
        list.innerHTML = '';
        
        q.questions.forEach(qu => {
            const card = Builder.addQ(qu.text, qu.points, qu.type);
            const optsDiv = card.querySelector('.opts');
            optsDiv.innerHTML = '';
            qu.options.forEach(o => Builder.addOpt(optsDiv, qu.type, o.text, o.isCorrect));
        });
        Router.to('create');
    },

    addQ: (text = '', points = 1, type = 'single') => {
        const div = document.createElement('div');
        div.className = 'card q-card';
        div.innerHTML = `
            <button class="btn-del-q" onclick="this.parentElement.remove()" title="Видалити питання">✕</button>
            <input class="input-base" value="${text}" placeholder="Питання" style="width:100%; margin-bottom:15px; background:#F7F9FC; padding-right: 40px;">
            
            <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                <div style="display:flex; gap:10px; align-items:center;">
                    <span style="font-weight:700; color:#636E72; font-size:14px;">БАЛИ</span>
                    <input type="number" step="0.5" class="input-base input-score" value="${points}">
                </div>
                <select class="input-base q-type" onchange="Builder.refreshType(this)">
                    <option value="single" ${type==='single'?'selected':''}>Один правильний</option>
                    <option value="multi" ${type==='multi'?'selected':''}>Кілька правильних</option>
                </select>
            </div>
            
            <div class="opts"></div>
            <button onclick="Builder.clickAddOpt(this)" class="btn-text" style="color:var(--primary)">+ Додати варіант</button>
        `;
        document.getElementById('build-list').appendChild(div);
        
        if(!text) {
            const opts = div.querySelector('.opts');
            Builder.addOpt(opts, type);
            Builder.addOpt(opts, type);
        }
        return div;
    },

    clickAddOpt: (btn) => {
        const card = btn.closest('.q-card');
        Builder.addOpt(card.querySelector('.opts'), card.querySelector('.q-type').value);
    },

    addOpt: (container, type, text='', isCorrect=false) => {
        const div = document.createElement('div');
        div.className = 'opt-row';
        div.innerHTML = `
            <div class="custom-check ${type==='single'?'':'square'} ${isCorrect?'active':''}" onclick="Builder.toggle(this)"></div>
            <input class="input-base" value="${text}" placeholder="Відповідь" style="flex-grow:1;">
            <button class="btn-del-opt" onclick="this.parentElement.remove()">✕</button>
        `;
        container.appendChild(div);
    },

    toggle: (el) => {
        const card = el.closest('.q-card');
        if(card.querySelector('.q-type').value === 'single') {
            card.querySelectorAll('.custom-check').forEach(c => c.classList.remove('active'));
        }
        el.classList.toggle('active');
    },

    refreshType: (sel) => {
        const card = sel.closest('.q-card');
        card.querySelectorAll('.custom-check').forEach(c => {
            c.classList.remove('active');
            if(sel.value==='single') c.classList.remove('square'); 
            else c.classList.add('square');
        });
    },

    save: () => {
        const titleInput = document.getElementById('build-title');
        const title = titleInput.value.trim();
        
        if(!title) {
            showToast("⚠️ Введіть назву тесту!");
            titleInput.classList.add('error');
            titleInput.focus();
            return;
        } else {
            titleInput.classList.remove('error');
        }

        const cards = document.querySelectorAll('.q-card');
        const questions = [];

        for (let i = 0; i < cards.length; i++) {
            const c = cards[i];
            const text = c.querySelector('input').value.trim();
            const points = parseFloat(c.querySelector('.input-score').value) || 0;
            const type = c.querySelector('.q-type').value;
            const opts = [];
            
            const optRows = c.querySelectorAll('.opt-row');
            
            let hasCorrect = false;
            let hasEmptyOpt = false;

            optRows.forEach(r => {
                const optText = r.querySelector('input').value.trim();
                const isCorrect = r.querySelector('.custom-check').classList.contains('active');
                if (!optText) hasEmptyOpt = true;
                if (isCorrect) hasCorrect = true;
                opts.push({ text: optText, isCorrect });
            });

            if (!text) {
                showToast(`⚠️ Питання №${i+1} без тексту!`);
                return;
            }
            if (opts.length < 2) {
                showToast(`⚠️ Питання №${i+1}: мінімум 2 варіанти!`);
                return;
            }
            if (hasEmptyOpt) {
                showToast(`⚠️ Питання №${i+1}: заповніть всі варіанти!`);
                return;
            }
            if (!hasCorrect) {
                showToast(`⚠️ Питання №${i+1}: виберіть правильну відповідь!`);
                return;
            }

            questions.push({ text, points, type, options: opts });
        }

        if(questions.length === 0) {
            showToast("⚠️ Додайте хоча б одне питання!");
            return;
        }

        const newQuiz = {
            id: Builder.currentId || Date.now().toString(),
            title,
            questions,
            allowRetake: document.getElementById('build-retake').checked,
            created: new Date().toISOString()
        };

        const list = Data.getQuizzes();
        if(Builder.currentId) {
            const idx = list.findIndex(q => q.id === Builder.currentId);
            list[idx] = newQuiz;
        } else {
            list.push(newQuiz);
        }
        Data.saveQuizzes(list);
        showToast("✅ Тест збережено!");
        Router.to('home');
    }
};