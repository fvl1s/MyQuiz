import { Icons } from '../utils/icons.js';

export const PlansPage = {
    render: () => {
        const container = document.getElementById('plans-content');
        if (!container) return;

        const check = `<span class="check-icon">✓</span>`;

        container.innerHTML = `
            <div style="text-align: center; max-width: 700px; margin: 0 auto 50px auto; animation: fadeIn 0.5s ease-out;">
                <h1 style="font-size:36px; margin-bottom: 16px;">Інвестуйте у своє навчання</h1>
                <p style="color: var(--text-secondary); font-size: 18px; line-height:1.6;">
                    Оберіть тарифний план, що відповідає вашим амбіціям. Розблокуйте повний потенціал платформи MyQuiz.
                </p>
            </div>

            <div class="plans-grid">
                <div class="plan-item">
                    <div class="plan-name">Basic Student</div>
                    <div class="plan-cost">₴0</div>
                    <div class="plan-period">назавжди</div>
                    <p class="plan-desc">Базовий доступ до проходження відкритих тестів.</p>
                    
                    <ul class="plan-features">
                        <li>${check} Доступ до публічних тестів</li>
                        <li>${check} Історія останніх 10 результатів</li>
                        <li>${check} Базова статистика</li>
                    </ul>
                    
                    <button class="btn-secondary" style="width:100%; justify-content:center;">Ваш поточний план</button>
                </div>

                <div class="plan-item popular">
                    <div class="plan-tag">Рекомендовано</div>
                    <div class="plan-name" style="color:var(--primary);">PRO Student</div>
                    <div class="plan-cost">₴149</div>
                    <div class="plan-period">на місяць</div>
                    <p class="plan-desc">Для тих, хто прагне максимальної ефективності.</p>
                    
                    <ul class="plan-features">
                        <li>${check} <strong>Необмежена</strong> історія результатів</li>
                        <li>${check} Детальний аналіз помилок</li>
                        <li>${check} Порівняння з успішністю групи</li>
                        <li>${check} Експорт сертифікатів PDF</li>
                        <li>${check} Темна тема інтерфейсу</li>
                    </ul>
                    
                    <button class="btn-primary" style="width:100%; justify-content:center; font-size:16px; padding:16px;">Спробувати PRO</button>
                </div>

                <div class="plan-item">
                    <div class="plan-name">Group Leader</div>
                    <div class="plan-cost">₴499</div>
                    <div class="plan-period">на місяць</div>
                    <p class="plan-desc">Спеціальні можливості для кураторів та викладачів.</p>
                    
                    <ul class="plan-features">
                        <li>${check} Всі можливості PRO</li>
                        <li>${check} Створення власних тестів</li>
                        <li>${check} Аналітика успішності групи</li>
                        <li>${check} Експорт звітів у CSV/Excel</li>
                        <li>${check} Пріоритетна підтримка</li>
                    </ul>
                    
                    <button class="btn-secondary" style="width:100%; justify-content:center;">Зв'язатись з нами</button>
                </div>
            </div>
            
            <div style="text-align:center; margin-top:60px; color:var(--text-muted); font-size:14px;">
                Потрібна допомога з вибором? <a href="#" style="color:var(--primary); text-decoration:none;">Напишіть нам</a>
            </div>
        `;
    }
};