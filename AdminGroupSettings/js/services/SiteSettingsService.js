class SiteSettingsService {

    static settings = {
        heroCollectionId: ""
    };

    static async load() {

        const response =
            await ApiService.getSiteSettings();

        this.settings = {
            heroCollectionId: String(
                response.settings?.heroCollectionId || ""
            )
        };

        return this.settings;
    }

    static get() {
        return this.settings;
    }

    static async setHeroCollection(
        collectionId
    ) {

        const response =
            await ApiService.updateSiteSettings({
                heroCollectionId: String(
                    collectionId || ""
                )
            });

        this.settings = {
            heroCollectionId: String(
                response.settings?.heroCollectionId || ""
            )
        };

        return this.settings;
    }
}
