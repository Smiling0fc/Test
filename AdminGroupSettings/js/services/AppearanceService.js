class AppearanceService {

    static defaults = {
        backgroundTheme: "pearl",
        watermarkEnabled: false,
        watermarkPosition: "bottom-right",
        watermarkSize: 14,
        watermarkOpacity: 45,
        watermarkOnCovers: true,
        watermarkOnPhotos: true
    };

    static normalize(data = {}) {
        return {
            backgroundTheme: String(
                data.backgroundTheme || this.defaults.backgroundTheme
            ),
            watermarkEnabled: this.toBoolean(
                data.watermarkEnabled,
                this.defaults.watermarkEnabled
            ),
            watermarkPosition: String(
                data.watermarkPosition || this.defaults.watermarkPosition
            ),
            watermarkSize: Number(
                data.watermarkSize || this.defaults.watermarkSize
            ),
            watermarkOpacity: Number(
                data.watermarkOpacity || this.defaults.watermarkOpacity
            ),
            watermarkOnCovers: this.toBoolean(
                data.watermarkOnCovers,
                this.defaults.watermarkOnCovers
            ),
            watermarkOnPhotos: this.toBoolean(
                data.watermarkOnPhotos,
                this.defaults.watermarkOnPhotos
            )
        };
    }

    static toBoolean(value, fallback = false) {
        if (value === true || value === "true") {
            return true;
        }

        if (value === false || value === "false") {
            return false;
        }

        return fallback;
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
            backgroundTheme
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
