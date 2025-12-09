const Results = {
    lastResult: null,

    showLastReview: () => {
        if(Results.lastResult) Results.buildReview(Results.lastResult);
    },

    showReview: (dateKey) => {
        const res = Data.getResults().find(r => r.date === dateKey);
        if(res) Results.buildReview(res);
    },

    buildReview: (res) => {
        Router.to('review');
        const container = document.getElementById('review-content');
        const quiz = res.snapshot || Data.getQuizById(res.quizId);

        if(!quiz) { container.innerHTML = 'Дані втрачено.'; return; }

        let scoreClass = 'avg';
        if (res.percent >= 80) scoreClass = 'good';
        else if (res.percent < 50) scoreClass = 'bad';

        let html = `
            <div class="summary-card">
                <div class="score-big ${scoreClass}">${res.score} / ${res.max}</div>
                <div style="font-weight:700">${res.percent>=50?'Чудовий результат!':'Спробуйте ще раз.'}</div>
                <div style="font-size:13px; color:#999; margin-top:5px;">${new Date(res.date).toLocaleString('uk-UA')}</div>
            </div>
        `;

        quiz.questions.forEach((q, i) => {
            const uAns = res.details[i] || [];
            const cAns = q.options.map((o,x)=>o.isCorrect?x:-1).filter(x=>x!==-1);
            const isRight = uAns.sort().toString() === cAns.sort().toString();

            html += `<div class="review-item">
                <span class="q-badge ${isRight?'correct':'wrong'}">${isRight?'+'+q.points:'0'} бал</span>
                
                <div class="review-q-header">
                    <span class="review-q-num">${i+1}.</span>
                    <span class="review-q-text">${q.text}</span>
                </div>`;
            
            q.options.forEach((opt, idx) => {
                const isSelected = uAns.includes(idx);
                const isCorrect = opt.isCorrect;
                
                let cls = 'scenario-neutral';
                let icon = '';

                if (isSelected && isCorrect) {
                    cls = 'scenario-correct';
                    icon = '✓';
                } else if (isSelected && !isCorrect) {
                    cls = 'scenario-wrong';
                    icon = '✕';
                } else if (!isSelected && isCorrect) {
                    cls = 'scenario-missed';
                    icon = '✓';
                }

                html += `<div class="review-opt ${cls}">
                    <span class="review-icon">${icon}</span> <span>${opt.text}</span>
                </div>`;
            });
            html += `</div>`;
        });

        container.innerHTML = html;
    }
};