class MaintenanceSettings {
    static settings = { ...AppearanceService.defaults };

    static async render() {
        const root = document.querySelector('.settings-studio');
        if (!root) return;

        try {
            this.settings = await AppearanceService.load();
        } catch (error) {
            console.warn('Настройки техработ пока недоступны:', error.message);
        }

        const section = document.createElement('section');
        section.className = 'settings-panel maintenance-panel';
        section.innerHTML = `
            <div class="maintenance-toolbar">
                <div>
                    <span class="settings-kicker">ПУБЛИКАЦИЯ</span>
                    <h2>Режим техработ</h2>
                    <p>Временно закрывает публичную галерею отдельным экраном.</p>
                </div>
                <label class="maintenance-switch">
                    <input id="maintenanceEnabled" type="checkbox" ${this.settings.maintenanceEnabled ? 'checked' : ''}>
                    <span></span>
                    <strong>Включён</strong>
                </label>
            </div>
            <div class="maintenance-fields">
                ${this.field('maintenanceTitle','Заголовок','text',100)}
                ${this.field('maintenanceButtonText','Текст кнопки','text',40)}
                ${this.field('maintenanceMessage','Сообщение','textarea',300,'wide')}
            </div>
            <div class="maintenance-footer">
                <div id="maintenanceStatus" class="maintenance-status">Настройки загружены из GAS.</div>
                <button id="maintenanceSave" class="maintenance-save" type="button">Сохранить</button>
            </div>`;

        root.appendChild(section);
        document.getElementById('maintenanceSave')?.addEventListener('click', () => this.save());
    }

    static field(id,label,type,maxLength,className='') {
        const value = this.escape(this.settings[id] || '');
        const control = type === 'textarea'
            ? `<textarea id="${id}" maxlength="${maxLength}" rows="4">${value}</textarea>`
            : `<input id="${id}" type="${type}" maxlength="${maxLength}" value="${value}">`;
        return `<label class="maintenance-field ${className}"><span>${label}</span>${control}</label>`;
    }

    static async save() {
        const status = document.getElementById('maintenanceStatus');
        const button = document.getElementById('maintenanceSave');
        const payload = {
            maintenanceEnabled: document.getElementById('maintenanceEnabled')?.checked || false,
            maintenanceTitle: document.getElementById('maintenanceTitle')?.value.trim() || '',
            maintenanceMessage: document.getElementById('maintenanceMessage')?.value.trim() || '',
            maintenanceButtonText: document.getElementById('maintenanceButtonText')?.value.trim() || ''
        };

        status.textContent = 'Сохраняем режим техработ…';
        status.dataset.state = 'saving';
        button.disabled = true;

        try {
            this.settings = await AppearanceService.saveAll(payload);
            status.textContent = payload.maintenanceEnabled
                ? 'Режим техработ включён.'
                : 'Публичный сайт снова открыт.';
            status.dataset.state = 'saved';
            ActivityService.record(
                'maintenance-update',
                payload.maintenanceEnabled ? 'Включён режим техработ' : 'Выключен режим техработ'
            );
        } catch (error) {
            status.textContent = `Не удалось сохранить: ${error.message}`;
            status.dataset.state = 'error';
        } finally {
            button.disabled = false;
        }
    }

    static escape(value) {
        return String(value)
            .replaceAll('&','&amp;')
            .replaceAll('"','&quot;')
            .replaceAll('<','&lt;')
            .replaceAll('>','&gt;');
    }
}