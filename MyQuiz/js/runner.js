const Runner = {
    quiz: null, idx: 0, answers: {},

    start: (id) => {
        const q = Data.getQuizById(id);
        if(!q) return;
        if(!q.allowRetake && Data.getResults().some(r=>r.quizId===id)) {
            showToast('Цей тест вже пройдено!');
            return;
        }
        Runner.quiz = q; Runner.idx = 0; Runner.answers = {};
        Router.to('run');
        Runner.render();
    },

    render: () => {
        const q = Runner.quiz.questions[Runner.idx];
        const total = Runner.quiz.questions.length;
        
        document.getElementById('run-bar').style.width = ((Runner.idx / total) * 100) + '%';
        const card = document.getElementById('run-card');
        
        let optsHtml = '';
        q.options.forEach((opt, i) => {
            const isSelected = (Runner.answers[Runner.idx] || []).includes(i);
            optsHtml += `<div class="run-opt ${isSelected?'selected':''}" onclick="Runner.select(this, ${i}, '${q.type}')">${opt.text}</div>`;
        });
        
        const hasAns = Runner.answers[Runner.idx] && Runner.answers[Runner.idx].length > 0;
        
        card.innerHTML = `
            <div class="q-meta">ПИТАННЯ ${Runner.idx + 1} / ${total}</div>
            <h2 style="font-size:24px; margin-bottom:30px;">${q.text}</h2>
            <div>${optsHtml}</div>
            <button id="btn-next" class="btn-primary" style="margin-top:30px; width:100%; transition:0.3s; opacity:${hasAns?1:0.5}; pointer-events:${hasAns?'auto':'none'}" onclick="Runner.next()">
                ${Runner.idx === total - 1 ? 'Завершити тест' : 'Далі'}
            </button>
        `;
    },

    select: (el, i, type) => {
        if(type==='single') {
            document.querySelectorAll('.run-opt').forEach(o=>o.classList.remove('selected'));
            el.classList.add('selected');
            Runner.answers[Runner.idx] = [i];
        } else {
            el.classList.toggle('selected');
            const cur = Runner.answers[Runner.idx] || [];
            if(el.classList.contains('selected')) cur.push(i); else cur.splice(cur.indexOf(i),1);
            Runner.answers[Runner.idx] = cur;
        }
        const btn = document.getElementById('btn-next');
        const has = Runner.answers[Runner.idx] && Runner.answers[Runner.idx].length > 0;
        btn.style.opacity = has?1:0.5; btn.style.pointerEvents = has?'auto':'none';
    },

    next: () => {
        Runner.idx++;
        if(Runner.idx < Runner.quiz.questions.length) Runner.render();
        else Runner.finish();
    },

    finish: () => {
        let score = 0; let max = 0;
        Runner.quiz.questions.forEach((q, i) => {
            max += q.points;
            const u = (Runner.answers[i]||[]).sort().toString();
            const c = q.options.map((o,x)=>o.isCorrect?x:-1).filter(x=>x!==-1).sort().toString();
            if(u===c) score += q.points;
        });
        const percent = max===0?0:Math.round((score/max)*100);
        
        const result = {
            quizId: Runner.quiz.id, quizTitle: Runner.quiz.title,
            date: new Date().toISOString(), score, max, percent,
            details: Runner.answers, snapshot: Runner.quiz
        };
        const list = Data.getResults(); list.push(result); Data.saveResults(list);
        Results.lastResult = result;

        Router.to('finish');
        
        setTimeout(() => {
            const circle = document.getElementById('res-circle');
            const text = document.getElementById('res-text');
            const btns = document.querySelector('#view-finish .flex-center');
            
            if(circle) {
                circle.innerText = percent + '%';
                if(percent >= 80) circle.style.borderColor = '#58CC02'; 
                else if(percent >= 50) circle.style.borderColor = '#FFA502'; 
                else circle.style.borderColor = '#FF4757';
                circle.style.color = circle.style.borderColor;
            }
            if(text) text.innerText = `Ви набрали ${score} з ${max} балів`;

            let btnsHtml = `
                <button onclick="Results.showLastReview()" class="btn-outline">Детальний звіт</button>
                <button onclick="Router.to('home')" class="btn-primary">На головну</button>
            `;
            
            if (Runner.quiz.allowRetake) {
                btnsHtml += `<button onclick="Runner.start('${Runner.quiz.id}')" class="btn-ghost" style="margin-left:0;">Пройти ще раз</button>`;
            }
            
            btns.innerHTML = btnsHtml;
            
        }, 50);
    }
};