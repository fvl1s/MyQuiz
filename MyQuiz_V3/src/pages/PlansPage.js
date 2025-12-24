import { Icons } from '../utils/icons.js';
import { Toast } from '../utils/toast.js';

export const PlansPage = {
    plans: [
        {
            id: 'basic',
            name: 'Basic Student',
            price: '0',
            period: 'назавжди',
            desc: 'Оптимальний вибір для ознайомлення з платформою та базового навчання.',
            features: [
                'Доступ до публічних тестів',
                'Історія останніх 10 результатів',
                'Базова статистика успішності',
                'Спільнота студентів'
            ],
            buttonText: 'Ваш поточний план',
            isPopular: false,
            isCurrent: true
        },
        {
            id: 'pro',
            name: 'PRO Student',
            price: '149',
            period: 'на місяць',
            desc: 'Максимальна ефективність завдяки глибокій аналітиці та персоналізації.',
            features: [
                'Необмежена історія результатів',
                'Детальний аналіз помилок',
                'Експорт сертифікатів у PDF',
                'Порівняння з успішністю групи',
                'Пріоритетний доступ до функцій'
            ],
            buttonText: 'Активувати PRO',
            isPopular: true,
            isCurrent: false
        },
        {
            id: 'leader',
            name: 'Group Leader',
            price: '499',
            period: 'на місяць',
            desc: 'Розширені інструменти для моніторингу та управління освітніми процесами.',
            features: [
                'Всі можливості плану PRO',
                'Створення власних тестів',
                'Аналітика всієї групи',
                'Експорт звітів у CSV/Excel',
                'Пряма підтримка 24/7'
            ],
            buttonText: 'Зв\'язатися з нами',
            isPopular: false,
            isCurrent: false
        }
    ],

    render: () => {
        const container = document.getElementById('plans-content');
        if (!container) return;

        const plansHtml = PlansPage.plans.map(plan => `
            <div class="plan-card-zen ${plan.isPopular ? 'popular' : ''} ${plan.isCurrent ? 'current' : ''}">
                ${plan.isPopular ? `<div class="plan-badge-zen">${Icons.shield} Рекомендовано</div>` : ''}
                <div class="plan-header-zen">
                    <h3>${plan.name}</h3>
                    <div class="plan-price-wrap">
                        <span class="currency">₴</span>
                        <span class="amount">${plan.price}</span>
                        <span class="period">/ ${plan.period}</span>
                    </div>
                    <p class="plan-desc-zen">${plan.desc}</p>
                </div>
                <div class="plan-body-zen">
                    <ul class="plan-features-zen">
                        ${plan.features.map(f => `<li>${Icons.check} <span>${f}</span></li>`).join('')}
                    </ul>
                </div>
                <div class="plan-footer-zen">
                    <button class="${plan.isPopular ? 'btn-primary' : 'btn-secondary'}" 
                            onclick="App.pages.plans.selectPlan('${plan.id}')" 
                            ${plan.isCurrent ? 'disabled' : ''}>
                        ${plan.isCurrent ? Icons.check + ' Поточний план' : plan.buttonText}
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="plans-container-pro">
                <div class="plans-hero-zen">
                    <h1>Інвестуйте у свою освіту</h1>
                    <p>Оберіть план, який допоможе вам досягти академічних вершин швидше та ефективніше.</p>
                </div>
                <div class="plans-grid-pro">
                    ${plansHtml}
                </div>
                <div class="plans-extra-zen">
                    <div class="extra-card-zen">
                        <div class="extra-icon-zen">${Icons.calendar}</div>
                        <div class="extra-text-zen">
                            <h4>Річна підписка</h4>
                            <p>Заощаджуйте до 20% при оплаті за рік одним платежем.</p>
                        </div>
                        <button class="btn-secondary" onclick="Toast.show('Функція скоро з\\'явиться')">Дізнатись більше</button>
                    </div>
                    <div class="extra-card-zen">
                        <div class="extra-icon-zen">${Icons.book}</div>
                        <div class="extra-text-zen">
                            <h4>Для навчальних закладів</h4>
                            <p>Отримайте спеціальні умови для цілих факультетів та університетів.</p>
                        </div>
                        <button class="btn-secondary" onclick="Toast.show('Запит надіслано')">Запитати прайс</button>
                    </div>
                </div>
            </div>
        `;
    },

    selectPlan: (id) => {
        if (id === 'leader') {
            window.open('mailto:sales@myquiz.pro');
        } else {
            Toast.show('Перехід до платіжної системи...');
        }
    }
};