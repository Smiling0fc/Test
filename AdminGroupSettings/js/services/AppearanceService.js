class AppearanceService {

    static defaultTheme = "pearl";

    static async load() {
        const response = await ApiService.get(
            "getSiteAppearance"
        );

        return {
            backgroundTheme: String(
                response.appearance?.backgroundTheme ||
                this.defaultTheme
            )
        };
    }

    static async save(backgroundTheme) {
        const response = await ApiService.post(
            "updateSiteAppearance",
            {
                backgroundTheme: String(
                    backgroundTheme || this.defaultTheme
                )
            }
        );

        return {
            backgroundTheme: String(
                response.appearance?.backgroundTheme ||
                this.defaultTheme
            )
        };
    }
}
