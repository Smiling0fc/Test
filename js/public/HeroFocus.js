class PublicHeroFocus {

    static settingsPromise = null;

    static clamp(value, fallback) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return fallback;
        }

        return Math.max(
            0,
            Math.min(100, Math.round(number))
        );
    }

    static normalizePoint(value, fallback) {
        if (
            !value ||
            typeof value !== "object" ||
            Array.isArray(value)
        ) {
            return { ...fallback };
        }

        return {
            x: this.clamp(value.x, fallback.x),
            y: this.clamp(value.y, fallback.y)
        };
    }

    static loadSettings() {
        if (!this.settingsPromise) {
            this.settingsPromise = PublicApi
                .getEditorialSettings()
                .then(response =>
                    response.settings || {}
                )
                .catch(error => {
                    console.warn(
                        "Настройки Hero недоступны:",
                        error.message
                    );

                    return {};
                });
        }

        return this.settingsPromise;
    }

    static pointFor(
        settings,
        collectionId,
        fallback
    ) {
        const map =
            settings?.collectionHeroFocus;

        const value = map &&
            typeof map === "object" &&
            !Array.isArray(map)
                ? map[String(collectionId || "")]
                : null;

        return this.normalizePoint(
            value,
            fallback
        );
    }

    static async applyHome(settings) {
        const hero = document.getElementById(
            "homeHero"
        );

        if (!hero) {
            return;
        }

        const collections =
            GalleryService.getCollections();

        if (!collections.length) {
            return;
        }

        const selectedId = String(
            settings?.heroCollectionId || ""
        );

        const collection =
            collections.find(item =>
                String(item.id) === selectedId
            ) || collections[0];

        const collectionId = String(
            collection.id
        );

        try {
            let photos =
                GalleryService.getPhotos(
                    collectionId
                );

            if (!photos.length) {
                photos = await GalleryService
                    .loadPhotos(collectionId);
            }

            const cover = JournalPages.coverFor(
                collection,
                photos
            );

            const coverId =
                JournalPages.galleryId(cover);

            if (coverId) {
                hero.style.setProperty(
                    "--hero-image",
                    `url("${GalleryService.getThumbnailUrl(
                        coverId,
                        1600
                    )}")`
                );
            }
        } catch (error) {
            console.warn(
                "Не удалось применить выбранную Hero-коллекцию:",
                error.message
            );
        }

        const point = this.pointFor(
            settings,
            collectionId,
            { x: 50, y: 50 }
        );

        hero.dataset.collectionId = collectionId;
        hero.style.backgroundPosition =
            `${point.x}% ${point.y}%`;
    }

    static applyCollection(settings) {
        const params = new URLSearchParams(
            window.location.search
        );

        const collectionId = String(
            params.get("id") || ""
        );

        const heroImage = document.querySelector(
            "#collectionIssueHero .collection-issue-media img"
        );

        if (!collectionId || !heroImage) {
            return;
        }

        const point = this.pointFor(
            settings,
            collectionId,
            { x: 50, y: 0 }
        );

        heroImage.style.objectPosition =
            `${point.x}% ${point.y}%`;
    }

    static install() {
        const originalHome =
            JournalPages.initHome.bind(JournalPages);

        const originalCollection =
            JournalPages.initCollection.bind(
                JournalPages
            );

        JournalPages.initHome = async function () {
            const settingsPromise =
                PublicHeroFocus.loadSettings();

            await originalHome();

            const settings =
                await settingsPromise;

            await PublicHeroFocus.applyHome(
                settings
            );
        };

        JournalPages.initCollection =
            async function () {
                const settingsPromise =
                    PublicHeroFocus.loadSettings();

                await originalCollection();

                const settings =
                    await settingsPromise;

                PublicHeroFocus.applyCollection(
                    settings
                );
            };
    }

}

PublicHeroFocus.install();
