class SiteSettingsService {

    static settings = {
        heroCollectionId: "",
        collectionHeroFocus: {}
    };

    static loaded = false;

    static clampPercent(value, fallback) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return fallback;
        }

        return Math.max(
            0,
            Math.min(100, Math.round(number))
        );
    }

    static normalizeFocusPoint(value) {
        if (
            !value ||
            typeof value !== "object" ||
            Array.isArray(value)
        ) {
            return null;
        }

        return {
            x: this.clampPercent(value.x, 50),
            y: this.clampPercent(value.y, 0)
        };
    }

    static normalizeFocusMap(value) {
        if (
            !value ||
            typeof value !== "object" ||
            Array.isArray(value)
        ) {
            return {};
        }

        const normalized = {};

        Object.entries(value).forEach(
            ([collectionId, point]) => {
                const id = String(
                    collectionId || ""
                ).trim();

                const normalizedPoint =
                    this.normalizeFocusPoint(point);

                if (id && normalizedPoint) {
                    normalized[id] = normalizedPoint;
                }
            }
        );

        return normalized;
    }

    static applyResponse(response, reset = false) {
        const incoming = response?.settings || {};

        const hasHeroCollectionId =
            Object.prototype.hasOwnProperty.call(
                incoming,
                "heroCollectionId"
            );

        const hasFocusMap =
            Object.prototype.hasOwnProperty.call(
                incoming,
                "collectionHeroFocus"
            );

        this.settings = {
            heroCollectionId: hasHeroCollectionId
                ? String(
                    incoming.heroCollectionId || ""
                )
                : reset
                    ? ""
                    : this.settings.heroCollectionId,
            collectionHeroFocus: hasFocusMap
                ? this.normalizeFocusMap(
                    incoming.collectionHeroFocus
                )
                : reset
                    ? {}
                    : this.settings.collectionHeroFocus
        };

        this.loaded = true;

        return this.settings;
    }

    static async load() {
        const response =
            await ApiService.getSiteSettings();

        return this.applyResponse(
            response,
            true
        );
    }

    static get() {
        return this.settings;
    }

    static getCollectionHeroFocus(collectionId) {
        const id = String(
            collectionId || ""
        ).trim();

        if (!id) {
            return null;
        }

        const point =
            this.settings.collectionHeroFocus[id];

        return point
            ? { ...point }
            : null;
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

        return this.applyResponse(response);
    }

    static async setCollectionHeroFocus(
        collectionId,
        point
    ) {
        const id = String(
            collectionId || ""
        ).trim();

        const normalizedPoint =
            this.normalizeFocusPoint(point);

        if (!id || !normalizedPoint) {
            throw new Error(
                "Не удалось определить точку фокуса Hero."
            );
        }

        if (!this.loaded) {
            await this.load();
        }

        const collectionHeroFocus = {
            ...this.settings.collectionHeroFocus,
            [id]: normalizedPoint
        };

        const response =
            await ApiService.updateSiteSettings({
                collectionHeroFocus
            });

        this.applyResponse(response);

        const savedPoint =
            this.getCollectionHeroFocus(id);

        if (!savedPoint) {
            throw new Error(
                "Сервер не сохранил фокус Hero. Обновите SiteSettings.gs и опубликуйте новую версию GAS."
            );
        }

        return savedPoint;
    }

}