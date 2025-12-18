import { Icons } from '../utils/icons.js';
import { Toast } from '../utils/toast.js';

export const SettingsPage = {
    render: () => {
        const container = document.getElementById('settings-content');
        if (!container) return;
        SettingsPage.renderLayout(container, 'profile');
    },

    renderLayout: (container, activeTab) => {
        container.innerHTML = `
            <div class="settings-container" style="display: grid; grid-template-columns: 280px 1fr; gap: 40px; align-items: start;">
                <nav class="settings-menu" style="display: flex; flex-direction: column; gap: 4px; background: white; padding: 12px; border-radius: 24px; border: 1px solid var(--border);">
                    <button class="settings-btn ${activeTab === 'profile' ? 'active' : ''}" onclick="App.pages.settings.switchTab('profile')">
                        ${Icons.user} Профіль
                    </button>
                    <button class="settings-btn ${activeTab === 'account' ? 'active' : ''}" onclick="App.pages.settings.switchTab('account')">
                        ${Icons.lock} Обліковий запис
                    </button>
                    <button class="settings-btn ${activeTab === 'notifications' ? 'active' : ''}" onclick="App.pages.settings.switchTab('notifications')">
                        ${Icons.flag} Сповіщення
                    </button>
                    <button class="settings-btn ${activeTab === 'privacy' ? 'active' : ''}" onclick="App.pages.settings.switchTab('privacy')">
                        ${Icons.shield} Конфіденційність
                    </button>
                    <button class="settings-btn ${activeTab === 'appearance' ? 'active' : ''}" onclick="App.pages.settings.switchTab('appearance')">
                        ${Icons.desktop} Зовнішній вигляд
                    </button>
                    <button class="settings-btn ${activeTab === 'billing' ? 'active' : ''}" onclick="App.pages.settings.switchTab('billing')">
                        ${Icons.chart} Оплата та підписки
                    </button>
                    <div style="height: 1px; background: var(--border); margin: 8px 12px;"></div>
                    <button class="settings-btn" style="color: var(--danger);" onclick="App.pages.settings.logout()">
                        ${Icons.logout} Вийти
                    </button>
                </nav>

                <div id="settings-panel" class="settings-panel" style="background: white; padding: 40px; border-radius: 32px; border: 1px solid var(--border); min-height: 600px;">
                    ${SettingsPage.getContent(activeTab)}
                </div>
            </div>
        `;
    },

    switchTab: (tabName) => {
        const container = document.getElementById('settings-content');
        SettingsPage.renderLayout(container, tabName);
    },

    getContent: (tab) => {
        switch(tab) {
            case 'profile': return SettingsPage.getProfileHtml();
            case 'account': return SettingsPage.getAccountHtml();
            case 'notifications': return SettingsPage.getNotificationsHtml();
            case 'privacy': return SettingsPage.getPrivacyHtml();
            case 'appearance': return SettingsPage.getAppearanceHtml();
            case 'billing': return SettingsPage.getBillingHtml();
            default: return SettingsPage.getProfileHtml();
        }
    },

    getProfileHtml: () => {
        const name = localStorage.getItem('mq_user_name') || 'Вадим Голубков';
        const avatar = localStorage.getItem('mq_user_avatar') || `https://ui-avatars.com/api/?name=${encodeURI(name)}&background=0f172a&color=fff`;

        return `
            <div style="max-width: 600px;">
                <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800;">Публічний профіль</h2>
                <p style="color: var(--text-muted); margin-bottom: 32px; font-size: 15px;">Ця інформація буде видимою для викладачів та інших студентів у рейтингу.</p>
                
                <div style="display: flex; align-items: center; gap: 32px; margin-bottom: 40px; padding: 32px; background: var(--bg-body); border-radius: 24px; border: 1px dashed var(--border);">
                    <div style="position: relative;">
                        <img id="preview-avatar" src="${avatar}" style="width: 120px; height: 120px; border-radius: 30px; object-fit: cover; border: 4px solid white; box-shadow: var(--shadow-lg);">
                        <button onclick="document.getElementById('avatar-upload').click()" style="position: absolute; bottom: -10px; right: -10px; width: 40px; height: 40px; background: var(--primary); color: white; border-radius: 12px; border: 4px solid white; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s;">
                            ${Icons.plus}
                        </button>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 4px 0; font-size: 18px;">Фото профілю</h4>
                        <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 16px;">Рекомендовано: квадратне фото, мін. 400x400px.</p>
                        <input type="file" id="avatar-upload" style="display:none" accept="image/*" onchange="App.pages.settings.handleAvatarUpload(this)">
                        <button class="btn-secondary" onclick="document.getElementById('avatar-upload').click()">Вибрати нове фото</button>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" style="text-transform: uppercase; letter-spacing: 1px; font-size: 11px; color: var(--text-muted);">Повне ім'я (ФІО)</label>
                    <input type="text" id="setting-name" class="form-control" value="${name}" placeholder="Наприклад: Олександр Петренко" style="font-size: 16px; padding: 14px 20px; border-radius: 16px;">
                </div>

                <div class="form-group">
                    <label class="form-label" style="text-transform: uppercase; letter-spacing: 1px; font-size: 11px; color: var(--text-muted);">Коротко про себе</label>
                    <textarea class="form-control" placeholder="Студент 1-го курсу факультету ФІОТ..." style="min-height: 100px; border-radius: 16px; padding: 14px 20px; resize: none;"></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label" style="text-transform: uppercase; letter-spacing: 1px; font-size: 11px; color: var(--text-muted);">Місто / Локація</label>
                    <input type="text" class="form-control" placeholder="Київ, Україна" style="border-radius: 12px;">
                </div>

                <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid var(--border); display: flex; gap: 12px;">
                    <button class="btn-primary" style="width: auto; padding: 14px 40px; border-radius: 16px;" onclick="App.pages.settings.saveProfile()">Зберегти зміни</button>
                    <button class="btn-secondary" style="width: auto; padding: 14px 24px; border-radius: 16px;" onclick="location.reload()">Скасувати</button>
                </div>
            </div>
        `;
    },

    getAccountHtml: () => `
        <div style="max-width: 600px;">
            <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800;">Обліковий запис</h2>
            <p style="color: var(--text-muted); margin-bottom: 32px; font-size: 15px;">Керуйте доступом до вашого акаунту та безпекою.</p>
            
            <div class="form-group">
                <label class="form-label">Електронна пошта</label>
                <div style="display: flex; gap: 12px;">
                    <input type="email" class="form-control" value="goluvkovvaadim@gmail.com" disabled style="background: var(--bg-body);">
                    <span class="badge badge-success" style="display: flex; align-items: center; white-space: nowrap;">Підтверджено</span>
                </div>
                <p style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">${Icons.info} Пошта керується вашим навчальним закладом.</p>
            </div>

            <div style="margin-top: 40px;">
                <h4 style="margin-bottom: 20px; font-size: 18px;">Зміна паролю</h4>
                <div class="form-group"><label class="form-label">Поточний пароль</label><input type="password" class="form-control" placeholder="••••••••"></div>
                <div class="form-group"><label class="form-label">Новий пароль</label><input type="password" class="form-control" placeholder="••••••••"></div>
                <button class="btn-secondary" disabled>Оновити пароль</button>
            </div>

            <div style="margin-top: 40px; padding: 24px; background: #fff1f2; border: 1px solid #fecaca; border-radius: 20px;">
                <h4 style="margin: 0 0 8px 0; color: var(--danger-text);">Видалити акаунт</h4>
                <p style="font-size: 14px; color: #991b1b; margin-bottom: 16px;">Після видалення всі ваші результати та прогрес будуть втрачені назавжди.</p>
                <button class="btn-ghost" style="background: white; border: 1px solid #fca5a5; color: var(--danger-text); padding: 10px 20px;">Запитати видалення</button>
            </div>
        </div>
    `,

    getNotificationsHtml: () => `
        <div style="max-width: 600px;">
            <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800;">Сповіщення</h2>
            <p style="color: var(--text-muted); margin-bottom: 32px; font-size: 15px;">Виберіть, які повідомлення ви хочете отримувати.</p>
            
            <div style="display: flex; flex-direction: column; gap: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div><div style="font-weight: 700;">Нові тести</div><div style="font-size: 13px; color: var(--text-muted);">Коли викладач публікує новий тест для вашої групи</div></div>
                    <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div><div style="font-weight: 700;">Результати перевірки</div><div style="font-size: 13px; color: var(--text-muted);">Коли ваші відповіді перевірено та виставлено бали</div></div>
                    <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div><div style="font-weight: 700;">Нагадування про дедлайни</div><div style="font-size: 13px; color: var(--text-muted);">За 24 години до закінчення терміну складання</div></div>
                    <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div><div style="font-weight: 700;">Маркетингові пропозиції</div><div style="font-size: 13px; color: var(--text-muted);">Новини платформи та акції на PRO версію</div></div>
                    <label class="switch"><input type="checkbox"><span class="slider"></span></label>
                </div>
            </div>
        </div>
    `,

    getPrivacyHtml: () => `
        <div style="max-width: 600px;">
            <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800;">Конфіденційність</h2>
            <p style="color: var(--text-muted); margin-bottom: 32px; font-size: 15px;">Налаштуйте видимість ваших даних.</p>
            
            <div style="display: flex; flex-direction: column; gap: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div><div style="font-weight: 700;">Публічний профіль</div><div style="font-size: 13px; color: var(--text-muted);">Дозволити іншим бачити вашу активність</div></div>
                    <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div><div style="font-weight: 700;">Відображення в рейтингу</div><div style="font-size: 13px; color: var(--text-muted);">Ваше ім'я буде видно в лідербордах тестів</div></div>
                    <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div><div style="font-weight: 700;">Індексація пошуковими системами</div><div style="font-size: 13px; color: var(--text-muted);">Дозволити Google знаходити вашу сторінку</div></div>
                    <label class="switch"><input type="checkbox"><span class="slider"></span></label>
                </div>
            </div>
        </div>
    `,

    getAppearanceHtml: () => `
        <div style="max-width: 600px;">
            <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800;">Зовнішній вигляд</h2>
            <p style="color: var(--text-muted); margin-bottom: 32px; font-size: 15px;">Персоналізуйте інтерфейс MyQuiz під себе.</p>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px;">
                <div style="cursor: pointer; border: 2px solid var(--primary); padding: 12px; border-radius: 16px; text-align: center;">
                    <div style="height: 60px; background: #f8fafc; border-radius: 8px; margin-bottom: 8px; border: 1px solid var(--border);"></div>
                    <span style="font-size: 13px; font-weight: 700;">Світла</span>
                </div>
                <div style="cursor: pointer; border: 1px solid var(--border); padding: 12px; border-radius: 16px; text-align: center; opacity: 0.6;">
                    <div style="height: 60px; background: #1e293b; border-radius: 8px; margin-bottom: 8px;"></div>
                    <span style="font-size: 13px; font-weight: 600;">Темна (PRO)</span>
                </div>
                <div style="cursor: pointer; border: 1px solid var(--border); padding: 12px; border-radius: 16px; text-align: center; opacity: 0.6;">
                    <div style="height: 60px; background: linear-gradient(135deg, #f8fafc 50%, #1e293b 50%); border-radius: 8px; margin-bottom: 8px;"></div>
                    <span style="font-size: 13px; font-weight: 600;">Системна</span>
                </div>
            </div>

            <h4 style="margin-bottom: 16px; font-size: 16px;">Акцентний колір</h4>
            <div style="display: flex; gap: 12px;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: #4f46e5; cursor: pointer; border: 3px solid white; box-shadow: 0 0 0 2px #4f46e5;"></div>
                <div style="width: 32px; height: 32px; border-radius: 50%; background: #06b6d4; cursor: pointer; border: 2px solid white;"></div>
                <div style="width: 32px; height: 32px; border-radius: 50%; background: #ec4899; cursor: pointer; border: 2px solid white;"></div>
                <div style="width: 32px; height: 32px; border-radius: 50%; background: #f59e0b; cursor: pointer; border: 2px solid white;"></div>
                <div style="width: 32px; height: 32px; border-radius: 50%; background: #10b981; cursor: pointer; border: 2px solid white;"></div>
            </div>
        </div>
    `,

    getBillingHtml: () => `
        <div style="max-width: 600px;">
            <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800;">Оплата та підписки</h2>
            <p style="color: var(--text-muted); margin-bottom: 32px; font-size: 15px;">Керуйте вашим тарифним планом та способами оплати.</p>
            
            <div style="padding: 24px; background: var(--primary-light); border: 1px solid var(--primary); border-radius: 24px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-size: 12px; font-weight: 800; color: var(--primary); text-transform: uppercase; margin-bottom: 4px;">Ваш поточний план</div>
                    <div style="font-size: 20px; font-weight: 800; color: var(--text-main);">PRO Student</div>
                    <div style="font-size: 14px; color: var(--primary); margin-top: 4px;">Діє до 18 січня 2026 року</div>
                </div>
                <button class="btn-primary" style="width: auto; padding: 10px 20px; border-radius: 12px;">Подовжити</button>
            </div>

            <h4 style="margin-bottom: 16px; font-size: 18px;">Спосіб оплати</h4>
            <div style="padding: 16px; border: 1px solid var(--border); border-radius: 16px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px;">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 48px; height: 32px; background: #f1f5f9; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 10px;">VISA</div>
                    <div style="font-weight: 600;">•••• 4455</div>
                </div>
                <button class="btn-ghost" style="color: var(--text-muted); font-size: 13px;">Змінити</button>
            </div>

            <h4 style="margin-bottom: 16px; font-size: 18px;">Історія транзакцій</h4>
            <div style="border: 1px solid var(--border); border-radius: 16px; overflow: hidden;">
                <div style="padding: 12px 20px; background: #f8fafc; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: var(--text-muted);">
                    <span>ДАТА</span><span>СУМА</span>
                </div>
                <div style="padding: 16px 20px; display: flex; justify-content: space-between; font-size: 14px; border-bottom: 1px solid #f1f5f9;">
                    <span>18 Гру 2025</span><span style="font-weight: 700;">₴149.00</span>
                </div>
                <div style="padding: 16px 20px; display: flex; justify-content: space-between; font-size: 14px;">
                    <span>18 Лис 2025</span><span style="font-weight: 700;">₴149.00</span>
                </div>
            </div>
        </div>
    `,

    handleAvatarUpload: (input) => {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('preview-avatar').src = e.target.result;
            };
            reader.readAsDataURL(input.files[0]);
        }
    },

    saveProfile: () => {
        const name = document.getElementById('setting-name').value.trim();
        if(!name) { 
            Toast.show('Помилка: Ім\'я не може бути порожнім'); 
            return; 
        }
        
        localStorage.setItem('mq_user_name', name);
        const avatarSrc = document.getElementById('preview-avatar').src;
        localStorage.setItem('mq_user_avatar', avatarSrc);

        App.initProfile();
        Toast.show('Профіль успішно оновлено');
    },

    logout: () => {
        App.showConfirm('Вийти з акаунту?', () => Toast.show('Вихід...'));
    }
};