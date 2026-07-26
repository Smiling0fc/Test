class HomePage {

    static async render(collections) {

        const hero = document.getElementById(
            "homeHero"
        );
        const featured = document.getElementById(
            "featuredCollection"
        );

        if (!hero || !featured) {
            return;
        }

        let heroCollectionId = "";

        try {
            const [siteResponse, appearanceResponse] =
                await Promise.all([
                    PublicApi.getSiteSettings(),
                    PublicApi.get("getSiteAppearance")
                ]);

            heroCollectionId = String(
                siteResponse.settings?.heroCollectionId || ""
            );

            this.applyBackgroundTheme(
                appearanceResponse.appearance?.backgroundTheme
            );

        } catch (error) {
            console.warn(
                "Настройки сайта пока недоступны:",
                error.message
            );
            this.applyBackgroundTheme("pearl");
        }

        const collection = collections.find(item =>
            String(item.id) === heroCollectionId
        ) || collections[0] || null;

        if (!collection) {
            hero.hidden = true;
            featured.hidden = true;
            return;
        }

        const photos = GalleryService.getPhotos(
            collection.id
        );

        const cover = photos.find(photo =>
            String(photo.id) ===
            String(collection.coverPhotoId || "")
        ) || photos[0] || null;

        if (!cover) {
            hero.hidden = true;
            featured.hidden = true;
            return;
        }

        const imageUrl =
            GalleryService.getThumbnailUrl(
                cover.fileId,
                2200
            );

        const description = String(
            collection.description || ""
        ).trim();

        hero.hidden = false;
        hero.dataset.collectionId = collection.id;
        hero.style.setProperty(
            "--hero-image",
            `url("${imageUrl}")`
        );

        const heroKicker = hero.querySelector(
            ".hero-kicker"
        );
        const heroTitle = hero.querySelector(
            ".hero-content h1"
        );
        const heroDescription = hero.querySelector(
            ".hero-description"
        );
        const heroButton = hero.querySelector(
            ".hero-button"
        );

        if (heroKicker) {
            heroKicker.textContent =
                "Selected Story";
        }

        if (heroTitle) {
            heroTitle.textContent = collection.name;
        }

        if (heroDescription) {
            heroDescription.textContent =
                description ||
                "История, которую хочется сохранить.";
        }

        if (heroButton) {
            heroButton.innerHTML = `
                Открыть историю
                <span aria-hidden="true">→</span>
            `;

            heroButton.setAttribute(
                "aria-label",
                `Открыть коллекцию ${collection.name}`
            );

            heroButton.onclick = event => {
                event.preventDefault();
                Gallery.openCollection(
                    collection.id
                );
            };
        }

        featured.hidden = false;
        featured.innerHTML = `
            <div class="featured-marker" aria-hidden="true">
                <span></span>
                <i></i>
                <small>LATEST STORY</small>
            </div>

            <div class="featured-copy">
                <span class="featured-kicker">
                    Выбранная история
                </span>

                <h2>
                    ${Gallery.escapeHtml(
                        collection.name
                    )}
                </h2>

                <p class="featured-description">
                    ${Gallery.escapeHtml(
                        description ||
                        "Откройте коллекцию целиком и погрузитесь в атмосферу этой истории."
                    )}
                </p>

                <span class="featured-count">
                    ${photos.length}
                    ${Gallery.getPhotoWord(
                        photos.length
                    )}
                </span>

                <button
                    class="featured-open"
                    type="button"
                    data-collection-id="${collection.id}">
                    Открыть историю
                    <span aria-hidden="true">→</span>
                </button>
            </div>

            <button
                class="featured-image"
                type="button"
                data-collection-id="${collection.id}"
                aria-label="Открыть коллекцию ${Gallery.escapeHtml(
                    collection.name
                )}">

                <img
                    src="${imageUrl}"
                    alt="${Gallery.escapeHtml(
                        collection.name
                    )}">
            </button>
        `;

        featured
            .querySelectorAll(
                "[data-collection-id]"
            )
            .forEach(button => {
                button.addEventListener(
                    "click",
                    () => Gallery.openCollection(
                        button.dataset.collectionId
                    )
                );
            });

    }

    static applyBackgroundTheme(value) {
        const allowed = [
            "pearl",
            "ivory",
            "linen",
            "blush",
            "mist",
            "sage"
        ];

        const theme = String(value || "pearl");

        document.documentElement.dataset.siteTheme =
            allowed.includes(theme)
                ? theme
                : "pearl";
    }

}
