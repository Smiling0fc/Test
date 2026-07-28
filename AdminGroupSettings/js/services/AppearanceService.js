class AppearanceService {

    static defaults = {
        backgroundTheme: "pearl",
        siteName: "ViJoy’s Photo Gallery",
        siteDescription: "Истории, которые хочется сохранить.",
        location: "",
        contactButtonText: "Связаться",
        phone: "",
        email: "",
        telegramUrl: "",
        vkUrl: "",
        instagramUrl: "",
        footerYear: String(new Date().getFullYear()),
        maintenanceEnabled: false,
        maintenanceTitle: "Сайт скоро вернётся",
        maintenanceMessage: "Мы обновляем галерею и готовим новые истории. Загляните немного позже.",
        maintenanceButtonText: "Обновить страницу"
    };

    static normalize(data = {}) {
        return Object.fromEntries(
            Object.entries(this.defaults).map(([key, fallback]) => [
                key,
                typeof fallback === "boolean"
                    ? data[key] === true || data[key] === "true"
                    : String(data[key] ?? fallback)
            ])
        );
    }

    static async load() {
        const response = await ApiService.get(
            "getSiteAppearance"
        );

        return this.normalize(
            response.appearance || {}
        );
    }

    static async save(backgroundTheme) {
        return this.saveAll({
            backgroundTheme: String(
                backgroundTheme || this.defaults.backgroundTheme
            )
        });
    }

    static async saveAll(data = {}) {
        const response = await ApiService.post(
            "updateSiteAppearance",
            data
        );

        return this.normalize(
            response.appearance || data
        );
    }
}