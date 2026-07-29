/* ==================================================
   Site Settings
================================================== */

const SITE_SETTINGS_KEYS = {
    heroCollectionId: "heroCollectionId",
    collectionHeroFocus: "collectionHeroFocus",
    collectionMetadata: "collectionMetadata"
};

function hasOwnSiteSetting_(data, key) {
    return Boolean(
        data &&
        Object.prototype.hasOwnProperty.call(data, key)
    );
}

function readSiteSettingsMap_(properties, key) {
    const raw = String(properties.getProperty(key) || "").trim();

    if (!raw) {
        return {};
    }

    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
            ? parsed
            : {};
    } catch (error) {
        console.warn(`Не удалось прочитать настройку ${key}:`, error);
        return {};
    }
}

function saveSiteSettingsMap_(properties, key, map) {
    if (!Object.keys(map || {}).length) {
        properties.deleteProperty(key);
        return;
    }

    properties.setProperty(key, JSON.stringify(map));
}

function collectionIdMap_(collections) {
    const ids = {};
    (collections || []).forEach(collection => {
        ids[String(collection.id)] = true;
    });
    return ids;
}

function clampHeroFocus_(value, fallback) {
    const number = Number(value);
    return isFinite(number)
        ? Math.max(0, Math.min(100, Math.round(number)))
        : fallback;
}

function normalizeHeroFocusPoint_(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    return {
        x: clampHeroFocus_(value.x, 50),
        y: clampHeroFocus_(value.y, 0)
    };
}

function normalizeHeroFocusMap_(value, collections) {
    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value
        : {};
    const ids = collectionIdMap_(collections);
    const normalized = {};

    Object.keys(source).forEach(collectionId => {
        const id = String(collectionId || "").trim();
        const point = normalizeHeroFocusPoint_(source[collectionId]);

        if (id && ids[id] && point) {
            normalized[id] = point;
        }
    });

    return normalized;
}

function normalizeCollectionMetadataText_(value, maxLength) {
    return String(value || "").trim().slice(0, maxLength);
}

function normalizeCollectionShootDate_(value) {
    const date = String(value || "").trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return "";
    }

    const parsed = new Date(`${date}T12:00:00Z`);
    return isNaN(parsed.getTime()) ? "" : date;
}

function normalizeCollectionDisplayMode_(value) {
    const mode = String(value || "mixed").trim();
    return ["gallery", "story", "mixed"].indexOf(mode) !== -1
        ? mode
        : "mixed";
}

function normalizeCollectionMetadataEntry_(value) {
    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value
        : {};

    return {
        category: normalizeCollectionMetadataText_(source.category, 80),
        shootDate: normalizeCollectionShootDate_(source.shootDate),
        location: normalizeCollectionMetadataText_(source.location, 120),
        displayMode: normalizeCollectionDisplayMode_(source.displayMode)
    };
}

function normalizeCollectionMetadataMap_(value, collections) {
    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value
        : {};
    const ids = collectionIdMap_(collections);
    const normalized = {};

    Object.keys(source).forEach(collectionId => {
        const id = String(collectionId || "").trim();
        if (id && ids[id]) {
            normalized[id] = normalizeCollectionMetadataEntry_(
                source[collectionId]
            );
        }
    });

    return normalized;
}

function getSiteSettings() {
    const properties = PropertiesService.getScriptProperties();
    const collections = getCollections();
    const savedHeroCollectionId = String(
        properties.getProperty(SITE_SETTINGS_KEYS.heroCollectionId) || ""
    ).trim();

    const selectedCollection = collections.find(collection =>
        String(collection.id) === savedHeroCollectionId
    ) || null;
    const fallbackCollection = collections.find(collection =>
        collection.published !== false
    ) || collections[0] || null;
    const heroCollectionId = selectedCollection
        ? String(selectedCollection.id)
        : fallbackCollection
            ? String(fallbackCollection.id)
            : "";

    if (heroCollectionId) {
        properties.setProperty(
            SITE_SETTINGS_KEYS.heroCollectionId,
            heroCollectionId
        );
    } else {
        properties.deleteProperty(SITE_SETTINGS_KEYS.heroCollectionId);
    }

    const savedFocusMap = readSiteSettingsMap_(
        properties,
        SITE_SETTINGS_KEYS.collectionHeroFocus
    );
    const collectionHeroFocus = normalizeHeroFocusMap_(
        savedFocusMap,
        collections
    );
    saveSiteSettingsMap_(
        properties,
        SITE_SETTINGS_KEYS.collectionHeroFocus,
        collectionHeroFocus
    );

    const savedMetadataMap = readSiteSettingsMap_(
        properties,
        SITE_SETTINGS_KEYS.collectionMetadata
    );
    const collectionMetadata = normalizeCollectionMetadataMap_(
        savedMetadataMap,
        collections
    );
    saveSiteSettingsMap_(
        properties,
        SITE_SETTINGS_KEYS.collectionMetadata,
        collectionMetadata
    );

    return {
        heroCollectionId,
        collectionHeroFocus,
        collectionMetadata
    };
}

function updateSiteSettings(data) {
    const payload = data || {};
    const properties = PropertiesService.getScriptProperties();
    const collections = getCollections();

    if (hasOwnSiteSetting_(payload, "heroCollectionId")) {
        const heroCollectionId = String(payload.heroCollectionId || "").trim();

        if (!heroCollectionId) {
            properties.deleteProperty(SITE_SETTINGS_KEYS.heroCollectionId);
        } else if (collections.some(collection =>
            String(collection.id) === heroCollectionId
        )) {
            properties.setProperty(
                SITE_SETTINGS_KEYS.heroCollectionId,
                heroCollectionId
            );
        } else {
            throw new Error("Выбранная коллекция не найдена.");
        }
    }

    if (hasOwnSiteSetting_(payload, "collectionHeroFocus")) {
        saveSiteSettingsMap_(
            properties,
            SITE_SETTINGS_KEYS.collectionHeroFocus,
            normalizeHeroFocusMap_(payload.collectionHeroFocus, collections)
        );
    }

    if (hasOwnSiteSetting_(payload, "collectionMetadata")) {
        saveSiteSettingsMap_(
            properties,
            SITE_SETTINGS_KEYS.collectionMetadata,
            normalizeCollectionMetadataMap_(
                payload.collectionMetadata,
                collections
            )
        );
    }

    return {
        success: true,
        settings: getSiteSettings()
    };
}