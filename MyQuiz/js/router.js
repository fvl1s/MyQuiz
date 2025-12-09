const Router = {
    to: (pageId) => {
        if (pageId !== 'create') {
            Builder.currentId = null;
        }

        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        const target = document.getElementById('view-' + pageId);
        if (target) target.classList.add('active');
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if(btn.dataset.page === pageId) btn.classList.add('active');
        });

        if (pageId === 'home') Home.render();
        if (pageId === 'manage') Home.renderManage();
        if (pageId === 'history') Home.renderHistory();
        
        window.scrollTo(0, 0);
    }
};