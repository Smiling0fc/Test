class EditorialFooter {
    static footer = null;
    static hydrated = false;

    static renderSkeleton() {
        this.footer = document.querySelector(".site-footer");

        if (!this.footer) {
            return;
        }

        this.footer.classList.add("editorial-footer", "is-loading");
        this.footer.setAttribute("aria-busy", "true");
        this.footer.innerHTML = `
            <div class="editorial-footer-inner">
                <div class="editorial-footer-skeleton" aria-hidden="true">
                    <div class="editorial-footer-skeleton-main">
                        <div class="editorial-footer-skeleton-copy">
                            <span class="editorial-footer-skeleton-bar is-kicker"></span>
                            <span class="editorial-footer-skeleton-bar is-title"></span>
                            <span class="editorial-footer-skeleton-bar is-title-short"></span>
                            <span class="editorial-footer-skeleton-bar is-copy"></span>
                            <span class="editorial-footer-skeleton-bar is-copy-short"></span>
                        </div>
                        <span class="editorial-footer-skeleton-button"></span>
                    </div>
                    <div class="editorial-footer-skeleton-links">
                        <span class="editorial-footer-skeleton-bar"></span>
                        <span class="editorial-footer-skeleton-bar"></span>
                        <span class="editorial-footer-skeleton-circle"></span>
                        <span class="editorial-footer-skeleton-circle"></span>
                        <span class="editorial-footer-skeleton-circle"></span>
                    </div>
                    <div class="editorial-footer-skeleton-bottom">
                        <span class="editorial-footer-skeleton-bar"></span>
                        <span class="editorial-footer-skeleton-bar"></span>
                        <span class="editorial-footer-skeleton-bar"></span>
                    </div>
                </div>
            </div>
        `;
    }

    static hydrate(data = {}) {
        if (!this.footer) {
            this.footer = document.querySelector(".site-footer");
        }

        if (!this.footer) {
            return;
        }

        const siteName = String(
            data.siteName || "ViJoy’s Photo Gallery"
        );
        const description = String(
            data.siteDescription ||
            "Расскажите о съёмке, событии или идее. Вместе соберём серию, к которой захочется возвращаться."
        );
        const contactText = String(
            data.contactButtonText || "Связаться"
        );
        const year = String(
            data.footerYear || new Date().getFullYear()
        );
        const location = String(
            data.location || ""
        ).trim();

        this.footer.innerHTML = `
            <div class="editorial-footer-inner">
                <div class="editorial-footer-main">
                    <div>
                        <small class="editorial-footer-kicker">
                            Новая история
                        </small>
                        <h2 class="editorial-footer-title">
                            Давайте сохраним вашу историю
                        </h2>
                        <p class="editorial-footer-description">
                            ${this.escape(description)}
                        </p>
                    </div>

                    <a
                        class="contact-link editorial-footer-contact"
                        href="#contactDrawer"
                        aria-controls="contactDrawer"
                        aria-expanded="false">
                        ${this.escape(contactText)}
                        <span aria-hidden="true">→</span>
                    </a>
                </div>

                <div class="editorial-footer-links">
                    <div class="editorial-footer-group">
                        <small>Навигация</small>
                        <nav class="editorial-footer-nav" aria-label="Навигация в подвале">
                            <a href="./">Главная</a>
                            <a href="collections.html">Коллекции</a>
                            <a href="./#about">О фотографе</a>
                            <a href="./#latestStories">Последние истории</a>
                        </nav>
                    </div>

                    <div class="editorial-footer-group">
                        <small>Социальные сети</small>
                        <div class="site-footer-socials editorial-footer-socials" aria-label="Социальные сети">
                            ${this.socialLink("Instagram", this.instagramIcon())}
                            ${this.socialLink("VK", this.vkIcon())}
                            ${this.socialLink("Telegram", this.telegramIcon())}
                        </div>
                    </div>
                </div>

                <div class="editorial-footer-bottom">
                    <span
                        class="editorial-footer-location"
                        ${location ? "" : "hidden"}
                        aria-hidden="${String(!location)}">
                        ${this.escape(location || "ViJoy’s Journal")}
                    </span>

                    <div class="site-footer-copy">
                        <p>© ${this.escape(year)} ${this.escape(siteName)}</p>
                        <span>Все права защищены</span>
                    </div>

                    <div class="site-footer-legal">
                        <a href="#">Политика конфиденциальности</a>
                        <span aria-hidden="true">·</span>
                        <a href="#">Условия использования</a>
                    </div>
                </div>
            </div>
        `;

        this.footer.classList.remove("is-loading");
        this.footer.classList.add("is-ready");
        this.footer.setAttribute("aria-busy", "false");
        this.hydrated = true;

        document.dispatchEvent(
            new CustomEvent("editorial-footer:ready")
        );
    }

    static socialLink(name, icon) {
        return `
            <a aria-label="${name}" hidden>
                ${icon}
            </a>
        `;
    }

    static instagramIcon() {
        return `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5.2"></rect>
                <circle cx="12" cy="12" r="4.15"></circle>
                <circle class="icon-fill" cx="17.45" cy="6.65" r="1.05"></circle>
            </svg>
        `;
    }

    static vkIcon() {
        return `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path class="icon-fill" d="M3.1 6.9h3.25c.35 0 .55.18.67.52.88 2.35 1.98 4.2 3.31 5.55.31.31.51.23.51-.19V7.55c0-.42.22-.65.65-.65h2.76c.42 0 .65.23.65.65v3.28c0 .42.18.51.47.2 1.22-1.31 2.21-2.83 2.98-4.56.15-.35.4-.52.76-.52h3.23c.56 0 .74.34.46.82-.88 1.55-1.94 3.02-3.18 4.42-.28.31-.28.59.02.86 1.36 1.24 2.57 2.55 3.62 3.94.36.48.17.85-.43.85h-3.58c-.42 0-.72-.14-1.01-.46l-2.12-2.28c-.29-.31-.47-.22-.47.2v1.9c0 .42-.22.64-.65.64h-1.62c-4.18 0-7.74-3.07-10.69-9.22-.25-.51-.06-.83.51-.83Z"></path>
            </svg>
        `;
    }

    static telegramIcon() {
        return `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path class="icon-fill" d="M21.64 3.2 2.95 10.4c-1.28.51-1.27 1.22-.23 1.54l4.8 1.5 1.84 5.65c.24.68.12.95.82.95.54 0 .78-.25 1.08-.54l2.6-2.52 5.4 3.98c.99.55 1.7.27 1.94-.92L24.48 4.6c.34-1.53-.59-2.22-1.84-1.4ZM8.27 13.1l10.82-6.83c.54-.33 1.03-.15.63.21l-8.93 8.06-.35 3.75-2.17-5.19Z"></path>
            </svg>
        `;
    }

    static escape(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
}

EditorialFooter.renderSkeleton();
