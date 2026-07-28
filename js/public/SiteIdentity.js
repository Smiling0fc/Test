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
            .querySelectorAll(".logo img")
            .forEach(image => image.alt = siteName);

        const heroTitle = document.querySelector(
            ".hero-content h1"
        );
        const heroDescription = document.querySelector(
            ".hero-description"
        );

        if (
            heroTitle &&
            !document.getElementById("homeHero")?.dataset.collectionId
        ) {
            heroTitle.textContent = siteName;
        }

        if (
            heroDescription &&
            !document.getElementById("homeHero")?.dataset.collectionId
        ) {
            heroDescription.textContent = description;
        }

        document
            .querySelectorAll(".contact-link")
            .forEach(contact => {
                contact.innerHTML = `${this.escape(buttonText)} <span aria-hidden="true">→</span>`;
                contact.href = "#contactDrawer";
                contact.hidden = false;
                contact.removeAttribute("target");
                contact.removeAttribute("rel");
                contact.setAttribute(
                    "aria-controls",
                    "contactDrawer"
                );
                contact.setAttribute(
                    "aria-expanded",
                    "false"
                );
            });

        if (typeof ContactDrawer !== "undefined") {
            ContactDrawer.setData(data);
        }

        this.applySocial("Telegram", data.telegramUrl);
        this.applySocial("VK", data.vkUrl);
        this.applySocial("Instagram", data.instagramUrl);

        document
            .querySelectorAll(".site-footer-copy p")
            .forEach(copy => {
                copy.textContent = `© ${year} ${siteName}`;
            });

        document
            .querySelectorAll(".editorial-footer-description")
            .forEach(element => {
                element.textContent = description;
            });

        const location = String(
            data.location || ""
        ).trim();

        document
            .querySelectorAll(".editorial-footer-location")
            .forEach(element => {
                element.textContent = location || "ViJoy’s Journal";
                element.hidden = !location;
                element.setAttribute(
                    "aria-hidden",
                    String(!location)
                );
            });
    }

    static applySocial(name, value) {
        const links = document.querySelectorAll(
            `.site-footer-socials a[aria-label="${name}"]`
        );
        const url = this.normalizeExternalUrl(value);

        links.forEach(link => {
            link.hidden = !url;

            if (url) {
                link.href = url;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
            } else {
                link.removeAttribute("href");
                link.removeAttribute("target");
                link.removeAttribute("rel");
            }
        });
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
