/* ==================================================
   Site Settings
   Add this file to the same Google Apps Script project
================================================== */

const SITE_SETTINGS_KEYS = {
    heroCollectionId: "heroCollectionId",
    collectionHeroFocus: "collectionHeroFocus",
    collectionMetadata: "collectionMetadata"
};

function hasOwnSiteSetting_(data, key) {
    return Boolean(
        data &&
        Object.prototype.hasOwnProperty.call(
            data,
            key
        )
    );
}

function clampHeroFocus_(value, fallback) {
    const number = Number(value);

    if (!isFinite(number)) {
        return fallback;
    }

    return Math.max(
        0,
        Math.min(100, Math.round(number))
    );
}

function normalizeHeroFocusPoint_(value) {
    if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value)
    ) {
        return null;
    }

    return {
        x: clampHeroFocus_(value.x, 50),
        y: clampHeroFocus_(value.y, 0)
    };
}

function readHeroFocusMap_(properties) {
    const raw = String(
        properties.getProperty(
            SITE_SETTINGS_KEYS.collectionHeroFocus
        ) || ""
    ).trim();

    if (!raw) {
        return {};
    }

    try {
        const parsed = JSON.parse(raw);

        return parsed &&
            typeof parsed === "object" &&
            !Array.isArray(parsed)
                ? parsed
                : {};
    } catch (error) {
        console.warn(
            "Не удалось прочитать настройки фокуса Hero:",
            error
        );

        return {};
    }
}

function normalizeHeroFocusMap_(value, collections) {
    const source = value &&
        typeof value === "object" &&
        !Array.isArray(value)
            ? value
            : {};

    const collectionIds = {};

    (collections || []).forEach(collection => {
        collectionIds[String(collection.id)] = true;
    });

    const normalized = {};

    Object.keys(source).forEach(collectionId => {
        const id = String(collectionId || "").trim();

        if (!id || !collectionIds[id]) {
            return;
        }

        const point = normalizeHeroFocusPoint_(
            source[collectionId]
        );

        if (point) {
            normalized[id] = point;
        }
    });

    return normalized;
}

function saveHeroFocusMap_(properties, map) {
    const keys = Object.keys(map || {});

    if (!keys.length) {
        properties.deleteProperty(
            SITE_SETTINGS_KEYS.collectionHeroFocus
        );
        return;
    }

    properties.setProperty(
        SITE_SETTINGS_KEYS.collectionHeroFocus,
        JSON.stringify(map)
    );
}

function normalizeCollectionMetadataText_(
    value,
    maxLength
) {
    return String(value || "")
        .trim()
        .slice(0, maxLength);
}

function normalizeCollectionShootDate_(value) {
    const date = String(value || "").trim();

    if (!date) {
        return "";
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return "";
    }

    const parsed = new Date(`${date}T12:00:00Z`);

    return isNaN(parsed.getTime())
        ? ""
        : date;
}

function normalizeCollectionMetadataEntry_(value) {
    if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value)
    ) {
        return null;
    }

    const metadata = {
        category: normalizeCollectionMetadataText_(
            value.category,
            80
        ),
        shootDate: normalizeCollectionShootDate_(
            value.shootDate
        ),
        location: normalizeCollectionMetadataText_(
            value.location,
            120
        )
    };

    return Object.values(metadata).some(Boolean)
        ? metadata
        : null;
}

function readCollectionMetadataMap_(properties) {
    const raw = String(
        properties.getProperty(
            SITE_SETTINGS_KEYS.collectionMetadata
        ) || ""
    ).trim();

    if (!raw) {
        return {};
    }

    try {
        const parsed = JSON.parse(raw);

        return parsed &&
            typeof parsed === "object" &&
            !Array.isArray(parsed)
                ? parsed
                : {};
    } catch (error) {
        console.warn(
            "Не удалось прочитать метаданные коллекций:",
            error
        );

        return {};
    }
}

function normalizeCollectionMetadataMap_(
    value,
    collections
) {
    const source = value &&
        typeof value === "object" &&
        !Array.isArray(value)
            ? value
            : {};

    const collectionIds = {};

    (collections || []).forEach(collection => {
        collectionIds[String(collection.id)] = true;
    });

    const normalized = {};

    Object.keys(source).forEach(collectionId => {
        const id = String(collectionId || "").trim();

        if (!id || !collectionIds[id]) {
            return;
        }

        const metadata =
            normalizeCollectionMetadataEntry_(
                source[collectionId]
            );

        if (metadata) {
            normalized[id] = metadata;
        }
    });

    return normalized;
}

function saveCollectionMetadataMap_(properties, map) {
    const keys = Object.keys(map || {});

    if (!keys.length) {
        properties.deleteProperty(
            SITE_SETTINGS_KEYS.collectionMetadata
        );
        return;
    }

    properties.setProperty(
        SITE_SETTINGS_KEYS.collectionMetadata,
        JSON.stringify(map)
    );
}

function getSiteSettings() {
    const properties =
        PropertiesService.getScriptProperties();

    const collections = getCollections();

    const savedHeroCollectionId = String(
        properties.getProperty(
            SITE_SETTINGS_KEYS.heroCollectionId
        ) || ""
    ).trim();

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

    const savedFocusMap = readHeroFocusMap_(
        properties
    );

    const collectionHeroFocus =
        normalizeHeroFocusMap_(
            savedFocusMap,
            collections
        );

    if (
        JSON.stringify(savedFocusMap) !==
        JSON.stringify(collectionHeroFocus)
    ) {
        saveHeroFocusMap_(
            properties,
            collectionHeroFocus
        );
    }

    const savedMetadataMap =
        readCollectionMetadataMap_(properties);

    const collectionMetadata =
        normalizeCollectionMetadataMap_(
            savedMetadataMap,
            collections
        );

    if (
        JSON.stringify(savedMetadataMap) !==
        JSON.stringify(collectionMetadata)
    ) {
        saveCollectionMetadataMap_(
            properties,
            collectionMetadata
        );
    }

    return {
        heroCollectionId,
        collectionHeroFocus,
        collectionMetadata
    };
}

function updateSiteSettings(data) {
    const payload = data || {};
    const properties =
        PropertiesService.getScriptProperties();

    if (
        hasOwnSiteSetting_(
            payload,
            "heroCollectionId"
        )
    ) {
        const heroCollectionId = String(
            payload.heroCollectionId || ""
        ).trim();

        if (!heroCollectionId) {
            properties.deleteProperty(
                SITE_SETTINGS_KEYS.heroCollectionId
            );
        } else {
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
        }
    }

    if (
        hasOwnSiteSetting_(
            payload,
            "collectionHeroFocus"
        )
    ) {
        const normalizedMap =
            normalizeHeroFocusMap_(
                payload.collectionHeroFocus,
                getCollections()
            );

        saveHeroFocusMap_(
            properties,
            normalizedMap
        );
    }

    if (
        hasOwnSiteSetting_(
            payload,
            "collectionMetadata"
        )
    ) {
        const normalizedMap =
            normalizeCollectionMetadataMap_(
                payload.collectionMetadata,
                getCollections()
            );

        saveCollectionMetadataMap_(
            properties,
            normalizedMap
        );
    }

    return {
        success: true,
        settings: getSiteSettings()
    };
}
