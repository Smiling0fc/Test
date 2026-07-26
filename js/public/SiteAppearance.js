class SiteAppearance {

    static allowedThemes = [
        "pearl",
        "ivory",
        "linen",
        "blush",
        "mist",
        "sage"
    ];

    static async load() {
        let theme = "pearl";

        try {
            const response = await PublicApi.get(
                "getSiteAppearance"
            );

            theme = String(
                response.appearance?.backgroundTheme ||
                "pearl"
            );
        } catch (error) {
            console.warn(
                "Оформление сайта пока недоступно:",
                error.message
            );
        }

        this.apply(theme);
    }

    static apply(theme) {
        const safeTheme = this.allowedThemes.includes(theme)
            ? theme
            : "pearl";

        document.documentElement.dataset.siteTheme = safeTheme;
    }
}

SiteAppearance.load();
