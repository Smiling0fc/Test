class SiteIdentitySettings {

    static settings = {
        ...AppearanceService.defaults
    };

    static async render() {
        const root = document.querySelector(".settings-studio");

        if (!root) {
            return;
        }

        try {
            this.settings = await AppearanceService.load();
        } catch (error) {
            console.warn(
                "Основные данные сайта пока недоступны:",
                error.message
            );
        }

        const section = document.createElement("section");
        section.className = "settings-panel identity-panel";
        section.innerHTML = `
            <div class="settings-panel-heading">
                <div>
                    <span>Контент</span>
                    <h2>Основные данные сайта</h2>
                    <p>
                        Название, описание, контакты и ссылки,
                        которые видят посетители галереи.
                    </p>
                </div>
                <button id="identitySave" class="identity-save" type="button">
                    Сохранить
                </button>
            </div>

            <div class="identity-grid">
                ${this.field("siteName", "Название сайта", "text", 100)}
                ${this.field("contactButtonText", "Текст кнопки", "text", 40)}
                ${this.field("siteDescription", "Короткое описание", "textarea", 220, "wide")}
                ${this.field("location", "Город или регион", "text", 100)}
                ${this.field("footerYear", "Год в подвале", "number", 4)}
                ${this.field("phone", "Телефон", "tel", 60)}
                ${this.field("email", "Email", "email", 120)}
                ${this.field("telegramUrl", "Telegram, полная ссылка", "url", 300)}
                ${this.field("vkUrl", "VK, полная ссылка", "url", 300)}
                ${this.field("instagramUrl", "Instagram, полная ссылка", "url", 300)}
            </div>

            <div id="identityStatus" class="identity-status">
                Данные загружены из GAS.
            </div>
        `;

        root.appendChild(section);
        document
            .getElementById("identitySave")
            ?.addEventListener("click", () => this.save());
    }

    static field(id, label, type, maxLength, className = "") {
        const value = this.escape(this.settings[id] || "");
        const control = type === "textarea"
            ? `<textarea id="${id}" maxlength="${maxLength}" rows="3">${value}</textarea>`
            : `<input id="${id}" type="${type}" maxlength="${maxLength}" value="${value}">`;

        return `
            <label class="identity-field ${className}">
                <span>${label}</span>
                ${control}
            </label>
        `;
    }

    static async save() {
        const status = document.getElementById("identityStatus");
        const button = document.getElementById("identitySave");
        const payload = {};

        Object.keys(AppearanceService.defaults).forEach(key => {
            if (key === "backgroundTheme") {
                return;
            }

            payload[key] = document.getElementById(key)?.value.trim() || "";
        });

        status.textContent = "Сохраняем данные…";
        status.dataset.state = "saving";
        button.disabled = true;

        try {
            this.settings = await AppearanceService.saveAll(payload);
            status.textContent = "Основные данные сайта обновлены.";
            status.dataset.state = "saved";

            Promise.resolve(
                ActivityService.log({
                    type: "settings",
                    title: "Обновлены данные сайта",
                    details: this.settings.siteName
                })
            ).catch(() => {});
        } catch (error) {
            status.textContent = `Не удалось сохранить: ${error.message}`;
            status.dataset.state = "error";
        } finally {
            button.disabled = false;
        }
    }

    static escape(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll('"', "&quot;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;");
    }
}