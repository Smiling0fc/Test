/* ==================================================
   Site Settings
   Add this file to the same Google Apps Script project
================================================== */

const SITE_SETTINGS_KEYS = {
    heroCollectionId: "heroCollectionId"
};

function getSiteSettings() {

    const properties =
        PropertiesService.getScriptProperties();

    const savedHeroCollectionId = String(
        properties.getProperty(
            SITE_SETTINGS_KEYS.heroCollectionId
        ) || ""
    ).trim();

    const collections = getCollections();

    const selectedCollection =
        collections.find(collection =>
            String(collection.id) ===
            savedHeroCollectionId
        ) || null;

    const fallbackCollection =
        collections.find(collection =>
            collection.published !== false
        ) || collections[0] || null;

    const heroCollectionId =
        selectedCollection
            ? String(selectedCollection.id)
            : fallbackCollection
                ? String(fallbackCollection.id)
                : "";

    if (
        heroCollectionId &&
        heroCollectionId !== savedHeroCollectionId
    ) {
        properties.setProperty(
            SITE_SETTINGS_KEYS.heroCollectionId,
            heroCollectionId
        );
    }

    if (!heroCollectionId && savedHeroCollectionId) {
        properties.deleteProperty(
            SITE_SETTINGS_KEYS.heroCollectionId
        );
    }

    return {
        heroCollectionId
    };
}

function updateSiteSettings(data) {

    const heroCollectionId = String(
        data.heroCollectionId || ""
    ).trim();

    const properties =
        PropertiesService.getScriptProperties();

    if (!heroCollectionId) {
        properties.deleteProperty(
            SITE_SETTINGS_KEYS.heroCollectionId
        );

        return {
            success: true,
            settings: getSiteSettings()
        };
    }

    const collectionExists =
        getCollections().some(collection =>
            String(collection.id) ===
            heroCollectionId
        );

    if (!collectionExists) {
        throw new Error(
            "Выбранная коллекция не найдена."
        );
    }

    properties.setProperty(
        SITE_SETTINGS_KEYS.heroCollectionId,
        heroCollectionId
    );

    return {
        success: true,
        settings: {
            heroCollectionId
        }
    };
}
