class MaintenanceMode {
    static async init() {
        try {
            const response = await PublicApi.getSiteSettings();
            const data = response.appearance || {};
            const enabled = data.maintenanceEnabled === true || data.maintenanceEnabled === 'true';

            if (!enabled) return;

            this.show(data);
        } catch (error) {
            console.warn('Режим техработ недоступен:', error.message);
        }
    }

    static show(data = {}) {
        const screen = document.getElementById('maintenanceScreen');
        if (!screen) return;

        const title = String(data.maintenanceTitle || 'Сайт скоро вернётся');
        const message = String(data.maintenanceMessage || 'Мы обновляем галерею и готовим новые истории. Загляните немного позже.');
        const buttonText = String(data.maintenanceButtonText || 'Обновить страницу');

        screen.querySelector('h1').textContent = title;
        screen.querySelector('p').textContent = message;
        screen.querySelector('button').textContent = buttonText;
        screen.hidden = false;
        document.body.classList.add('maintenance-open');

        screen.querySelector('button').addEventListener('click', () => window.location.reload());
    }
}

window.addEventListener('DOMContentLoaded', () => MaintenanceMode.init());