class ContactDrawer {

    static data = {};
    static drawer = null;
    static backdrop = null;
    static triggers = [];
    static activeTrigger = null;

    static init() {
        this.triggers = Array.from(
            document.querySelectorAll(".contact-link")
        );

        if (!this.triggers.length) {
            return;
        }

        this.render();
        this.bind();
    }

    static setData(data = {}) {
        this.data = {
            instagramUrl: this.normalizeExternalUrl(data.instagramUrl),
            telegramUrl: this.normalizeExternalUrl(data.telegramUrl),
            vkUrl: this.normalizeExternalUrl(data.vkUrl),
            email: String(data.email || "").trim()
        };

        this.updateMethods();
    }

    static render() {
        this.backdrop = document.createElement("div");
        this.backdrop.className = "contact-drawer-backdrop";
        this.backdrop.setAttribute("aria-hidden", "true");

        this.drawer = document.createElement("aside");
        this.drawer.className = "contact-drawer";
        this.drawer.id = "contactDrawer";
        this.drawer.setAttribute("aria-hidden", "true");
        this.drawer.setAttribute("aria-labelledby", "contactDrawerTitle");
        this.drawer.innerHTML = `
            <div class="contact-drawer-header">
                <div>
                    <span class="contact-drawer-kicker">Связь</span>
                    <h2 id="contactDrawerTitle" class="contact-drawer-title">
                        Выберите удобный способ
                    </h2>
                </div>

                <button
                    class="contact-drawer-close"
                    type="button"
                    aria-label="Закрыть меню связи">
                    ×
                </button>
            </div>

            <p class="contact-drawer-copy">
                Напишите фотографу в удобной социальной сети.
            </p>

            <div class="contact-methods">
                ${this.renderMethod("instagram", "Instagram", "Открыть Direct")}
                ${this.renderMethod("telegram", "Telegram", "Группа или личный профиль")}
                ${this.renderMethod("vk", "VK", "Открыть страницу")}
                ${this.renderMethod("email", "Email", "Скоро будет доступно", true)}
            </div>

            <div class="contact-drawer-footer">
                Ответ обычно приходит в выбранном приложении.
            </div>
        `;

        document.body.append(this.backdrop, this.drawer);
        this.updateMethods();
    }

    static renderMethod(id, title, note, disabled = false) {
        return `
            <a
                class="contact-method${disabled ? " is-disabled" : ""}"
                data-contact-method="${id}"
                href="#"
                ${disabled ? 'aria-disabled="true" tabindex="-1"' : ""}>
                <span>
                    <strong>${title}</strong>
                    <small>${note}</small>
                </span>
                <span class="contact-method-arrow" aria-hidden="true">→</span>
            </a>
        `;
    }

    static bind() {
        this.triggers.forEach(trigger => {
            trigger.addEventListener("click", event => {
                event.preventDefault();
                this.open(trigger);
            });
        });

        this.drawer
            ?.querySelector(".contact-drawer-close")
            ?.addEventListener("click", () => this.close());

        this.backdrop?.addEventListener("click", () => this.close());

        document.addEventListener("keydown", event => {
            if (
                event.key === "Escape" &&
                this.drawer?.classList.contains("is-open")
            ) {
                this.close();
            }
        });
    }

    static updateMethods() {
        if (!this.drawer) {
            return;
        }

        this.setMethod("instagram", this.data.instagramUrl);
        this.setMethod("telegram", this.data.telegramUrl);
        this.setMethod("vk", this.data.vkUrl);
        this.setMethod("email", "", true);
    }

    static setMethod(id, url, forcedDisabled = false) {
        const link = this.drawer.querySelector(
            `[data-contact-method="${id}"]`
        );

        if (!link) {
            return;
        }

        const disabled = forcedDisabled || !url;
        link.classList.toggle("is-disabled", disabled);
        link.setAttribute("aria-disabled", String(disabled));

        if (disabled) {
            link.href = "#";
            link.removeAttribute("target");
            link.removeAttribute("rel");
            link.addEventListener("click", this.blockDisabledClick);
            return;
        }

        link.removeEventListener("click", this.blockDisabledClick);
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
    }

    static blockDisabledClick(event) {
        event.preventDefault();
    }

    static open(trigger = null) {
        this.activeTrigger = trigger || this.triggers[0] || null;

        this.triggers.forEach(item =>
            item.setAttribute("aria-expanded", "false")
        );

        this.activeTrigger?.setAttribute(
            "aria-expanded",
            "true"
        );

        this.drawer?.classList.add("is-open");
        this.backdrop?.classList.add("is-open");
        this.drawer?.setAttribute("aria-hidden", "false");
        this.backdrop?.setAttribute("aria-hidden", "false");
        document.body.classList.add("contact-drawer-open");

        this.drawer
            ?.querySelector(".contact-drawer-close")
            ?.focus();
    }

    static close() {
        const returnFocus = this.activeTrigger;

        this.drawer?.classList.remove("is-open");
        this.backdrop?.classList.remove("is-open");
        this.drawer?.setAttribute("aria-hidden", "true");
        this.backdrop?.setAttribute("aria-hidden", "true");

        this.triggers.forEach(item =>
            item.setAttribute("aria-expanded", "false")
        );

        document.body.classList.remove("contact-drawer-open");
        this.activeTrigger = null;
        returnFocus?.focus();
    }

    static normalizeExternalUrl(value) {
        const raw = String(value || "").trim();

        if (!raw) {
            return "";
        }

        if (/^https?:\/\//i.test(raw)) {
            return raw;
        }

        return `https://${raw.replace(/^\/+/, "")}`;
    }
}

window.addEventListener(
    "DOMContentLoaded",
    () => ContactDrawer.init()
);
