class SiteIdentity {

    static async init() {
        try {
            const response = await PublicApi.getSiteSettings();
            this.apply(response.appearance || {});
        } catch (error) {
            console.warn(
                "Основные данные сайта недоступны:",
                error.message
            );
        }
    }

    static apply(data = {}) {
        const siteName = String(
            data.siteName || "ViJoy’s Photo Gallery"
        );
        const description = String(
            data.siteDescription || "Истории, которые хочется сохранить."
        );
        const buttonText = String(
            data.contactButtonText || "Связаться"
        );
        const year = String(
            data.footerYear || new Date().getFullYear()
        );

        document.title = siteName;

        document
            .querySelectorAll('.logo img')
            .forEach(image => image.alt = siteName);

        const heroTitle = document.querySelector(
            ".hero-content h1"
        );
        const heroDescription = document.querySelector(
            ".hero-description"
        );
        const contact = document.querySelector(
            ".contact-link"
        );

        if (heroTitle && !document.getElementById("homeHero")?.dataset.collectionId) {
            heroTitle.textContent = siteName;
        }

        if (heroDescription && !document.getElementById("homeHero")?.dataset.collectionId) {
            heroDescription.textContent = description;
        }

        if (contact) {
            const href = this.getContactHref(data);
            contact.innerHTML = `${this.escape(buttonText)} <span aria-hidden="true">→</span>`;

            if (href) {
                contact.href = href;
                contact.hidden = false;
            } else {
                contact.hidden = true;
            }
        }

        this.applySocial("Telegram", data.telegramUrl);
        this.applySocial("VK", data.vkUrl);
        this.applySocial("Instagram", data.instagramUrl);

        const footerCopy = document.querySelector(
            ".site-footer-copy p"
        );
        const footerNote = document.querySelector(
            ".site-footer-copy span"
        );

        if (footerCopy) {
            footerCopy.textContent = `© ${year} ${siteName}`;
        }

        if (footerNote && data.location) {
            footerNote.textContent = String(data.location);
        }
    }

    static applySocial(name, value) {
        const link = document.querySelector(
            `.site-footer-socials a[aria-label="${name}"]`
        );
        const url = String(value || "").trim();

        if (!link) {
            return;
        }

        link.hidden = !url;

        if (url) {
            link.href = url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
        }
    }

    static getContactHref(data) {
        if (data.telegramUrl) {
            return String(data.telegramUrl);
        }

        if (data.email) {
            return `mailto:${String(data.email).trim()}`;
        }

        if (data.phone) {
            return `tel:${String(data.phone).replace(/[^+\d]/g, "")}`;
        }

        return "";
    }

    static escape(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;");
    }
}

window.addEventListener(
    "DOMContentLoaded",
    () => SiteIdentity.init()
);