import { Icons } from '../utils/icons.js';

export const HelpPage = {
    render: () => {
        const container = document.getElementById('help-content');
        if (!container) return;

        container.innerHTML = `
            <div class="help-grid">
                <div class="help-card" onclick="App.route('create')">
                    <div class="help-icon">${Icons.plus}</div>
                    <div class="help-title">Створення тесту</div>
                    <div class="help-desc">Дізнайтесь, як створювати тести різних типів та налаштовувати час проходження.</div>
                    <div class="help-link">Перейти до конструктора →</div>
                </div>

                <div class="help-card" onclick="App.route('analytics')">
                    <div class="help-icon">${Icons.analytics}</div>
                    <div class="help-title">Аналітика та звіти</div>
                    <div class="help-desc">Як інтерпретувати статистику успішності та виявляти складні питання.</div>
                    <div class="help-link">Дивитись статистику →</div>
                </div>

                <div class="help-card" onclick="App.route('settings')">
                    <div class="help-icon">${Icons.shield}</div>
                    <div class="help-title">Безпека акаунту</div>
                    <div class="help-desc">Налаштування двоетапної перевірки та зміна паролю.</div>
                    <div class="help-link">Налаштування безпеки →</div>
                </div>

                <div class="help-card">
                    <div class="help-icon">${Icons.book}</div>
                    <div class="help-title">База знань</div>
                    <div class="help-desc">Повні інструкції з використання платформи та відео-уроки.</div>
                    <div class="help-link">Читати документацію →</div>
                </div>
            </div>

            <div style="margin-top:48px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px; border-radius: 32px; color: white; position: relative; overflow: hidden; box-shadow: var(--shadow-lg);">
                <div style="position: relative; z-index: 10; display: flex; align-items: center; justify-content: space-between; gap: 32px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 24px;">
                        <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.1); border-radius: 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                            <span style="font-size: 28px;">🚀</span>
                        </div>
                        <div>
                            <h3 style="margin: 0 0 4px 0; color: white; font-size: 22px; font-weight: 800;">Потрібна консультація?</h3>
                            <p style="color: #94a3b8; margin: 0; font-size: 15px;">Наша команда підтримки працює 24/7 для користувачів PRO.</p>
                        </div>
                    </div>
                    <button class="btn-primary" style="width: auto; padding: 16px 32px; background: white; color: #0f172a; border: none;" onclick="window.open('mailto:support@univ.edu')">
                        Зв'язатися з нами
                    </button>
                </div>
            </div>

            <div class="easter-egg" title="🙏">
                <span>+11?</span> ${Icons.praying}
            </div>
        `;
    }
};