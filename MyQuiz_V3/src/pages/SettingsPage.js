import { Icons } from '../utils/icons.js';
import { Toast } from '../utils/toast.js';

export const SettingsPage = {
    render: () => {
        const container = document.getElementById('settings-content');
        if (!container) return;
        const activeTab = localStorage.getItem('mq_settings_tab') || 'profile';
        SettingsPage.renderLayout(container, activeTab);
    },

    renderLayout: (container, activeTab) => {
        localStorage.setItem('mq_settings_tab', activeTab);
        container.innerHTML = `
            <div class="settings-container-pro">
                <aside class="settings-sidebar-zen">
                    <div class="settings-nav-list">
                        <button class="s-nav-item ${activeTab === 'profile' ? 'active' : ''}" onclick="App.pages.settings.switchTab('profile')">
                            ${Icons.user} <span>Профіль</span>
                        </button>
                        <button class="s-nav-item ${activeTab === 'system' ? 'active' : ''}" onclick="App.pages.settings.switchTab('system')">
                            ${Icons.settings} <span>Система</span>
                        </button>
                        <button class="s-nav-item ${activeTab === 'appearance' ? 'active' : ''}" onclick="App.pages.settings.switchTab('appearance')">
                            ${Icons.desktop} <span>Вигляд</span>
                        </button>
                        <button class="s-nav-item ${activeTab === 'billing' ? 'active' : ''}" onclick="App.pages.settings.switchTab('billing')">
                            ${Icons.chart} <span>Оплата</span>
                        </button>
                    </div>
                    <div class="s-nav-divider"></div>
                    <button class="s-nav-item danger" onclick="App.pages.settings.logout()">
                        ${Icons.logout} <span>Вийти</span>
                    </button>
                </aside>

                <div id="settings-panel-root" class="settings-panel-zen">
                    ${SettingsPage.getTabContent(activeTab)}
                </div>
            </div>
        `;
    },

    switchTab: (tab) => {
        const container = document.getElementById('settings-content');
        SettingsPage.renderLayout(container, tab);
    },

    getTabContent: (tab) => {
        switch(tab) {
            case 'profile': return SettingsPage.getProfileHtml();
            case 'system': return SettingsPage.getSystemHtml();
            case 'appearance': return SettingsPage.getAppearanceHtml();
            case 'billing': return SettingsPage.getBillingHtml();
            default: return SettingsPage.getProfileHtml();
        }
    },

    getProfileHtml: () => {
        const name = localStorage.getItem('mq_user_name') || 'Вадим Голубков';
        const bio = localStorage.getItem('mq_user_bio') || '';
        const loc = localStorage.getItem('mq_user_loc') || '';
        const avatar = localStorage.getItem('mq_user_avatar') || `https://ui-avatars.com/api/?name=${encodeURI(name)}&background=0f172a&color=fff`;

        return `
            <div class="s-content-fade">
                <div class="s-header-zen">
                    <h2>Мій профіль</h2>
                    <p>Налаштуйте те, як вас бачать інші користувачі та викладачі.</p>
                </div>

                <div class="s-avatar-section">
                    <div class="s-avatar-wrapper">
                        <img id="preview-avatar" src="${avatar}" alt="Avatar">
                        <button class="s-avatar-edit" onclick="document.getElementById('avatar-input').click()">${Icons.plus}</button>
                    </div>
                    <div class="s-avatar-info">
                        <h4>Фото профілю</h4>
                        <p>Натисніть на іконку, щоб завантажити зображення.</p>
                        <input type="file" id="avatar-input" hidden accept="image/*" onchange="App.pages.settings.uploadAvatar(this)">
                    </div>
                </div>

                <div class="s-form-grid">
                    <div class="form-group">
                        <label class="form-label">Повне ім'я</label>
                        <input type="text" id="s-name" class="form-control" value="${name}" placeholder="Прізвище та ім'я">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Місто / Локація</label>
                        <input type="text" id="s-loc" class="form-control" value="${loc}" placeholder="Наприклад: Київ, Україна">
                    </div>
                    <div class="form-group full-width">
                        <label class="form-label">Біографія</label>
                        <textarea id="s-bio" class="form-control" placeholder="Розкажіть трохи про себе..." style="min-height:100px; resize:none;">${bio}</textarea>
                    </div>
                </div>

                <div class="s-footer-actions">
                    <button class="btn-primary" onclick="App.pages.settings.saveProfile()">Зберегти зміни</button>
                </div>
            </div>
        `;
    },

    getSystemHtml: () => {
        const getVal = (key) => localStorage.getItem(key) === 'true';
        return `
            <div class="s-content-fade">
                <div class="s-header-zen">
                    <h2>Системні налаштування</h2>
                    <p>Керуйте сповіщеннями та безпекою вашого облікового запису.</p>
                </div>
                <div class="s-settings-list">
                    <div class="s-setting-row" onclick="App.pages.settings.toggleItem(this, 'mq_notify_new')">
                        <div class="s-row-text">
                            <h4>Нові тести</h4>
                            <p>Отримувати сповіщення, коли з'являються нові доступні тести.</p>
                        </div>
                        <label class="switch"><input type="checkbox" ${getVal('mq_notify_new') ? 'checked' : ''}><span class="slider"></span></label>
                    </div>
                    <div class="s-setting-row" onclick="App.pages.settings.toggleItem(this, 'mq_notify_res')">
                        <div class="s-row-text">
                            <h4>Результати перевірки</h4>
                            <p>Сповіщати, коли викладач виставив бали за ваші відповіді.</p>
                        </div>
                        <label class="switch"><input type="checkbox" ${getVal('mq_notify_res') ? 'checked' : ''}><span class="slider"></span></label>
                    </div>
                    <div class="s-setting-row" onclick="App.pages.settings.toggleItem(this, 'mq_privacy_mode')">
                        <div class="s-row-text">
                            <h4>Режим інкогніто</h4>
                            <p>Приховати ваше ім'я в загальній таблиці лідерів.</p>
                        </div>
                        <label class="switch"><input type="checkbox" ${getVal('mq_privacy_mode') ? 'checked' : ''}><span class="slider"></span></label>
                    </div>
                </div>
            </div>
        `;
    },

    getAppearanceHtml: () => {
        const currentAccent = localStorage.getItem('mq_accent_color') || '#4f46e5';
        const isDark = localStorage.getItem('mq_theme') === 'dark';
        const colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
        
        return `
            <div class="s-content-fade">
                <div class="s-header-zen">
                    <h2>Зовнішній вигляд</h2>
                    <p>Налаштуйте кольорову гаму та тему інтерфейсу.</p>
                </div>

                <div class="s-appearance-group" style="margin-bottom: 32px;">
                    <h4 style="margin-bottom: 16px;">Тема інтерфейсу</h4>
                    <div class="s-setting-row" onclick="App.pages.settings.toggleTheme(this)">
                        <div class="s-row-text">
                            <h4>Темний режим</h4>
                            <p>Зменшує навантаження на очі та економить заряд батареї.</p>
                        </div>
                        <label class="switch"><input type="checkbox" ${isDark ? 'checked' : ''}><span class="slider"></span></label>
                    </div>
                </div>

                <div class="s-appearance-group">
                    <h4 style="margin-bottom: 16px;">Акцентний колір</h4>
                    <div class="s-color-grid">
                        ${colors.map(c => `
                            <div class="s-color-circle ${currentAccent === c ? 'active' : ''}" 
                                 style="background:${c}" 
                                 onclick="App.pages.settings.setAccent('${c}')">
                                 ${currentAccent === c ? Icons.check : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    getBillingHtml: () => `
        <div class="s-content-fade">
            <div class="s-header-zen">
                <h2>Оплата та підписка</h2>
                <p>Керуйте вашим тарифом та історією платежів.</p>
            </div>
            <div class="s-billing-card">
                <div class="s-plan-info">
                    <div class="s-plan-badge">PRO v3.0</div>
                    <h3>PRO Student</h3>
                    <p>Ваша підписка активна до 18 січня 2026</p>
                </div>
                <button class="btn-secondary" onclick="App.route('plans')">Змінити тариф</button>
            </div>
        </div>
    `,

    uploadAvatar: (input) => {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('preview-avatar').src = e.target.result;
            };
            reader.readAsDataURL(input.files[0]);
        }
    },

    saveProfile: () => {
        const name = document.getElementById('s-name').value.trim();
        const bio = document.getElementById('s-bio').value.trim();
        const loc = document.getElementById('s-loc').value.trim();
        const avatar = document.getElementById('preview-avatar').src;

        if (!name) return Toast.show('Ім\'я обов\'язкове');

        localStorage.setItem('mq_user_name', name);
        localStorage.setItem('mq_user_bio', bio);
        localStorage.setItem('mq_user_loc', loc);
        localStorage.setItem('mq_user_avatar', avatar);

        App.initProfile();
        Toast.show('Профіль оновлено');
    },

    toggleItem: (el, key) => {
        const cb = el.querySelector('input');
        cb.checked = !cb.checked;
        localStorage.setItem(key, cb.checked);
        Toast.show('Налаштування збережено');
    },

    toggleTheme: (el) => {
        const cb = el.querySelector('input');
        cb.checked = !cb.checked;
        const theme = cb.checked ? 'dark' : 'light';
        localStorage.setItem('mq_theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        Toast.show(theme === 'dark' ? 'Темну тему увімкнено' : 'Світлу тему увімкнено');
    },

    setAccent: (color) => {
        localStorage.setItem('mq_accent_color', color);
        document.documentElement.style.setProperty('--primary', color);
        SettingsPage.switchTab('appearance');
        Toast.show('Колір оновлено');
    },

    logout: () => {
        App.showConfirm('Ви впевнені, що хочете вийти?', () => {
            Toast.show('Вихід з акаунту...');
        });
    }
};