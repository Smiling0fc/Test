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
                contact.target = href.startsWith("http") ? "_blank" : "";
                contact.rel = href.startsWith("http")
                    ? "noopener noreferrer"
                    : "";
            } else {
                contact.hidden = true;
                contact.removeAttribute("href");
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
        const url = this.normalizeExternalUrl(value);

        if (!link) {
            return;
        }

        link.hidden = !url;

        if (url) {
            link.href = url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
        } else {
            link.removeAttribute("href");
        }
    }

    static getContactHref(data) {
        const telegram = this.normalizeExternalUrl(
            data.telegramUrl
        );

        if (telegram) {
            return telegram;
        }

        const email = String(data.email || "").trim();
        if (email) {
            return `mailto:${email}`;
        }

        const phone = String(data.phone || "").trim();
        if (phone) {
            return `tel:${phone.replace(/[^+\d]/g, "")}`;
        }

        return "";
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
