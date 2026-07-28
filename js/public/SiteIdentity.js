class SiteIdentity {

    static data = {};
    static loaded = false;

    static async init() {
        try {
            const response = await PublicApi.getSiteSettings();
            const data = response.appearance || {};

            if (typeof EditorialFooter !== "undefined") {
                EditorialFooter.hydrate(data);
            }

            this.apply(data);
            this.markReady(data);
        } catch (error) {
            if (typeof EditorialFooter !== "undefined") {
                EditorialFooter.hydrate({});
            }

            this.markReady({});

            console.warn(
                "Основные данные сайта недоступны:",
                error.message
            );
        }
    }

    static markReady(data = {}) {
        this.data = { ...data };
        this.loaded = true;

        document.dispatchEvent(
            new CustomEvent("site-identity:ready", {
                detail: this.data
            })
        );
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
        const aboutTitle = String(
            data.aboutTitle || "Живые истории без лишнего шума"
        );
        const aboutText = String(
            data.aboutText ||
            "Я сохраняю не постановку, а ощущение момента: движение, свет, характер и детали, которые обычно ускользают. Каждая съёмка становится небольшой главой личного визуального журнала."
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
        const aboutTitleElement = document.querySelector(
            ".about-editorial-copy h2"
        );
        const aboutTextElement = document.querySelector(
            ".about-editorial-copy p"
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

        if (aboutTitleElement) {
            aboutTitleElement.textContent = aboutTitle;
        }

        if (aboutTextElement) {
            aboutTextElement.textContent = aboutText;
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
