export const Storage = {
    getQuizzes: () => {
        return JSON.parse(localStorage.getItem('mq_quizzes') || '[]');
    },

    saveQuizzes: (list) => {
        localStorage.setItem('mq_quizzes', JSON.stringify(list));
    },

    saveQuiz: (quiz) => {
        const list = Storage.getQuizzes();
        const idx = list.findIndex(q => q.id === quiz.id);
        if (idx >= 0) {
            list[idx] = quiz;
        } else {
            list.push(quiz);
        }
        Storage.saveQuizzes(list);
    },
    
    getResults: () => {
        return JSON.parse(localStorage.getItem('mq_results') || '[]');
    },

    saveResult: (result) => {
        const list = Storage.getResults();
        list.push(result);
        localStorage.setItem('mq_results', JSON.stringify(list));
    },

    deleteResult: (dateStr) => {
        const list = Storage.getResults().filter(r => r.date !== dateStr);
        localStorage.setItem('mq_results', JSON.stringify(list));
    },

    getQuizById: (id) => {
        return Storage.getQuizzes().find(q => q.id === id);
    },

    deleteQuiz: (id) => {
        const quizzes = Storage.getQuizzes().filter(q => q.id !== id);
        Storage.saveQuizzes(quizzes);
        
        const results = Storage.getResults().filter(r => r.quizId !== id);
        localStorage.setItem('mq_results', JSON.stringify(results));
    },

    duplicateQuiz: (id) => {
        const list = Storage.getQuizzes();
        const original = list.find(q => q.id === id);
        if (original) {
            const copy = JSON.parse(JSON.stringify(original));
            copy.id = 'qz_' + Date.now();
            copy.title += ' (Копія)';
            copy.created = new Date().toISOString();
            copy.isPinned = false; 
            list.push(copy);
            Storage.saveQuizzes(list);
        }
    },

    toggleQuizPin: (id) => {
        const list = Storage.getQuizzes();
        const quiz = list.find(q => q.id === id);
        if (quiz) {
            quiz.isPinned = !quiz.isPinned;
            Storage.saveQuizzes(list);
        }
    },

    formatDate: (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    }
};