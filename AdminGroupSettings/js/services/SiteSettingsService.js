class SiteSettingsService {
    static settings = {
        heroCollectionId: "",
        collectionHeroFocus: {},
        collectionMetadata: {}
    };

    static loaded = false;

    static clampPercent(value, fallback) {
        const number = Number(value);
        return Number.isFinite(number)
            ? Math.max(0, Math.min(100, Math.round(number)))
            : fallback;
    }

    static normalizeFocusPoint(value) {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
            return null;
        }

        return {
            x: this.clampPercent(value.x, 50),
            y: this.clampPercent(value.y, 0)
        };
    }

    static normalizeFocusMap(value) {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
            return {};
        }

        const normalized = {};
        Object.entries(value).forEach(([collectionId, point]) => {
            const id = String(collectionId || "").trim();
            const normalizedPoint = this.normalizeFocusPoint(point);
            if (id && normalizedPoint) {
                normalized[id] = normalizedPoint;
            }
        });
        return normalized;
    }

    static normalizeMetadataText(value, maxLength) {
        return String(value || "").trim().slice(0, maxLength);
    }

    static normalizeMetadataDate(value) {
        const date = String(value || "").trim();
        return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
    }

    static normalizeDisplayMode(value) {
        const mode = String(value || "mixed").trim();
        return ["gallery", "story", "mixed"].includes(mode)
            ? mode
            : "mixed";
    }

    static normalizeMetadataEntry(value) {
        const source = value && typeof value === "object" && !Array.isArray(value)
            ? value
            : {};

        return {
            category: this.normalizeMetadataText(source.category, 80),
            shootDate: this.normalizeMetadataDate(source.shootDate),
            location: this.normalizeMetadataText(source.location, 120),
            displayMode: this.normalizeDisplayMode(source.displayMode)
        };
    }

    static normalizeMetadataMap(value) {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
            return {};
        }

        const normalized = {};
        Object.entries(value).forEach(([collectionId, metadata]) => {
            const id = String(collectionId || "").trim();
            if (id) {
                normalized[id] = this.normalizeMetadataEntry(metadata);
            }
        });
        return normalized;
    }

    static applyResponse(response, reset = false) {
        const incoming = response?.settings || {};
        const has = key => Object.prototype.hasOwnProperty.call(incoming, key);

        this.settings = {
            heroCollectionId: has("heroCollectionId")
                ? String(incoming.heroCollectionId || "")
                : reset ? "" : this.settings.heroCollectionId,
            collectionHeroFocus: has("collectionHeroFocus")
                ? this.normalizeFocusMap(incoming.collectionHeroFocus)
                : reset ? {} : this.settings.collectionHeroFocus,
            collectionMetadata: has("collectionMetadata")
                ? this.normalizeMetadataMap(incoming.collectionMetadata)
                : reset ? {} : this.settings.collectionMetadata
        };

        this.loaded = true;
        return this.settings;
    }

    static async load() {
        return this.applyResponse(
            await ApiService.getSiteSettings(),
            true
        );
    }

    static get() {
        return this.settings;
    }

    static getCollectionHeroFocus(collectionId) {
        const id = String(collectionId || "").trim();
        const point = id ? this.settings.collectionHeroFocus[id] : null;
        return point ? { ...point } : null;
    }

    static getCollectionMetadata(collectionId) {
        const id = String(collectionId || "").trim();
        return this.normalizeMetadataEntry(
            id ? this.settings.collectionMetadata[id] : {}
        );
    }

    static async setHeroCollection(collectionId) {
        return this.applyResponse(
            await ApiService.updateSiteSettings({
                heroCollectionId: String(collectionId || "")
            })
        );
    }

    static async setCollectionHeroFocus(collectionId, point) {
        const id = String(collectionId || "").trim();
        const normalizedPoint = this.normalizeFocusPoint(point);

        if (!id || !normalizedPoint) {
            throw new Error("Не удалось определить точку фокуса Hero.");
        }

        if (!this.loaded) {
            await this.load();
        }

        const response = await ApiService.updateSiteSettings({
            collectionHeroFocus: {
                ...this.settings.collectionHeroFocus,
                [id]: normalizedPoint
            }
        });

        this.applyResponse(response);
        const savedPoint = this.getCollectionHeroFocus(id);

        if (!savedPoint) {
            throw new Error(
                "Сервер не сохранил фокус Hero. Обновите SiteSettings.gs и опубликуйте новую версию GAS."
            );
        }

        return savedPoint;
    }

    static async setCollectionMetadata(collectionId, metadata) {
        const id = String(collectionId || "").trim();
        if (!id) {
            throw new Error("Не удалось определить коллекцию.");
        }

        if (!this.loaded) {
            await this.load();
        }

        const normalized = this.normalizeMetadataEntry(metadata);
        const response = await ApiService.updateSiteSettings({
            collectionMetadata: {
                ...this.settings.collectionMetadata,
                [id]: normalized
            }
        });

        this.applyResponse(response);
        return this.getCollectionMetadata(id);
    }
}