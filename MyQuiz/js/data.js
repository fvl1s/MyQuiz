const Data = {
    getQuizzes: () => JSON.parse(localStorage.getItem('mq_quizzes') || '[]'),
    
    saveQuizzes: (list) => localStorage.setItem('mq_quizzes', JSON.stringify(list)),
    
    getResults: () => JSON.parse(localStorage.getItem('mq_results') || '[]'),
    
    saveResults: (list) => localStorage.setItem('mq_results', JSON.stringify(list)),

    getQuizById: (id) => Data.getQuizzes().find(q => q.id === id),

    deleteFull: (id) => {
        const quizzes = Data.getQuizzes().filter(q => q.id !== id);
        Data.saveQuizzes(quizzes);
        
        const results = Data.getResults().filter(r => r.quizId !== id);
        Data.saveResults(results);
    }
};