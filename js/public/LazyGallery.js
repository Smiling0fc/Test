(() => {
    const originalOpenCollection = Gallery.openCollection.bind(Gallery);
    const photoRequests = new Map();
    let coverObserver = null;

    const loadPhotosOnce = collectionId => {
        const id = String(collectionId);

        if (GalleryService.photos.has(id)) {
            return Promise.resolve(
                GalleryService.getPhotos(id)
            );
        }

        if (!photoRequests.has(id)) {
            photoRequests.set(
                id,
                GalleryService.loadPhotos(id)
                    .finally(() => photoRequests.delete(id))
            );
        }

        return photoRequests.get(id);
    };

    Gallery.init = async function () {
        this.container = document.getElementById("collections");

        if (!this.container) {
            console.error("Контейнер #collections не найден.");
            return;
        }

        this.renderLoading("Загружаем коллекции...");

        try {
            const collections = await GalleryService.loadCollections();

            this.renderCollections();
            this.observeCollectionCovers();

            this.loadHeroCollection(collections).catch(error => {
                console.warn(
                    "Не удалось подготовить главную коллекцию:",
                    error.message
                );
            });
        } catch (error) {
            console.error(error);
            this.renderError(
                error.message || "Не удалось загрузить коллекции."
            );
        }
    };

    Gallery.loadHeroCollection = async function (collections) {
        if (!Array.isArray(collections) || collections.length === 0) {
            await HomePage.render([]);
            return;
        }

        let heroCollectionId = "";

        try {
            const response = await PublicApi.getSiteSettings();
            heroCollectionId = String(
                response.settings?.heroCollectionId || ""
            );
        } catch (error) {
            console.warn(
                "Не удалось определить выбранную коллекцию:",
                error.message
            );
        }

        const heroCollection = collections.find(collection =>
            String(collection.id) === heroCollectionId
        ) || collections[0];

        await loadPhotosOnce(heroCollection.id);
        await HomePage.render(collections);
        this.updateCollectionCard(heroCollection.id);
    };

    Gallery.renderCollections = function () {
        const collections = GalleryService.getCollections();

        if (coverObserver) {
            coverObserver.disconnect();
            coverObserver = null;
        }

        if (collections.length === 0) {
            this.container.innerHTML = `
                <div class="gallery-message">
                    <h2>Коллекций пока нет</h2>
                    <p>Здесь скоро появятся новые истории.</p>
                </div>
            `;
            return;
        }

        this.container.className = "collections";
        this.container.innerHTML = collections.map(collection => {
            const description = this.escapeHtml(
                collection.description || ""
            );
            const knownCount = Number.isFinite(
                Number(collection.photoCount)
            ) ? Number(collection.photoCount) : null;
            const coverFileId = String(
                collection.coverFileId || ""
            );

            return `
                <article
                    class="collection-card"
                    data-collection-id="${collection.id}"
                    tabindex="0"
                    role="button">
                    <div class="collection-heading">
                        <h2 class="collection-title">
                            ${this.escapeHtml(collection.name)}
                        </h2>
                        <p class="collection-description">
                            ${description}
                        </p>
                    </div>
                    <div class="collection-glass">
                        <div class="collection-cover" data-cover>
                            ${coverFileId
                                ? this.renderLazyCover(collection, coverFileId)
                                : `
                                    <div class="collection-cover-skeleton" aria-hidden="true">
                                        <span></span>
                                    </div>
                                `}
                        </div>
                    </div>
                    <div class="collection-footer">
                        <p class="collection-count" data-photo-count>
                            ${knownCount === null
                                ? "Загружаем обложку…"
                                : `${knownCount} ${this.getPhotoWord(knownCount)}`}
                        </p>
                        <span class="collection-arrow" aria-hidden="true">→</span>
                    </div>
                </article>
            `;
        }).join("");

        this.bindCollectionEvents();
    };

    Gallery.renderLazyCover = function (collection, fileId) {
        return `
            <img
                src="${GalleryService.getThumbnailUrl(fileId, 500)}"
                srcset="
                    ${GalleryService.getThumbnailUrl(fileId, 500)} 500w,
                    ${GalleryService.getThumbnailUrl(fileId, 800)} 800w,
                    ${GalleryService.getThumbnailUrl(fileId, 1200)} 1200w
                "
                sizes="
                    (max-width: 700px) 100vw,
                    (max-width: 1200px) 50vw,
                    33vw
                "
                alt="${this.escapeHtml(collection.name)}"
                loading="lazy"
                decoding="async">
        `;
    };

    Gallery.observeCollectionCovers = function () {
        const cards = Array.from(
            this.container.querySelectorAll(".collection-card")
        );

        if (!("IntersectionObserver" in window)) {
            cards.slice(0, 3).forEach(card =>
                this.hydrateCollectionCard(
                    card.dataset.collectionId
                )
            );
            return;
        }

        coverObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    return;
                }

                coverObserver.unobserve(entry.target);
                this.hydrateCollectionCard(
                    entry.target.dataset.collectionId
                );
            });
        }, {
            rootMargin: "500px 0px",
            threshold: 0.01
        });

        cards.forEach(card => coverObserver.observe(card));
    };

    Gallery.hydrateCollectionCard = async function (collectionId) {
        try {
            await loadPhotosOnce(collectionId);
            this.updateCollectionCard(collectionId);
        } catch (error) {
            const card = this.container.querySelector(
                `.collection-card[data-collection-id="${CSS.escape(String(collectionId))}"]`
            );
            const count = card?.querySelector("[data-photo-count]");

            if (count) {
                count.textContent = "Не удалось загрузить";
            }

            console.warn(
                `Не удалось загрузить обложку коллекции ${collectionId}:`,
                error.message
            );
        }
    };

    Gallery.updateCollectionCard = function (collectionId) {
        const collection = GalleryService.getCollectionById(collectionId);
        const photos = GalleryService.getPhotos(collectionId);
        const card = this.container.querySelector(
            `.collection-card[data-collection-id="${CSS.escape(String(collectionId))}"]`
        );

        if (!collection || !card) {
            return;
        }

        const cover = photos.find(photo =>
            String(photo.id) === String(collection.coverPhotoId || "")
        ) || photos[0] || null;
        const coverRoot = card.querySelector("[data-cover]");
        const count = card.querySelector("[data-photo-count]");

        if (coverRoot) {
            coverRoot.innerHTML = cover
                ? this.renderLazyCover(collection, cover.fileId)
                : `
                    <div class="collection-placeholder">
                        <span>Пока без фотографий</span>
                    </div>
                `;
        }

        if (count) {
            count.textContent = `${photos.length} ${this.getPhotoWord(photos.length)}`;
        }
    };

    Gallery.openCollection = async function (collectionId) {
        const collection = GalleryService.getCollectionById(collectionId);

        if (!collection) {
            this.renderError("Коллекция не найдена.");
            return;
        }

        if (!GalleryService.photos.has(String(collectionId))) {
            this.container.className = "public-collection-view";
            this.container.innerHTML = `
                <div class="collection-open-loading" aria-live="polite">
                    <span></span>
                    <h2>${this.escapeHtml(collection.name)}</h2>
                    <p>Готовим фотографии…</p>
                    <div><i></i><i></i><i></i></div>
                </div>
            `;

            try {
                await loadPhotosOnce(collectionId);
            } catch (error) {
                this.renderError(
                    error.message || "Не удалось загрузить фотографии."
                );
                return;
            }
        }

        originalOpenCollection(collectionId);
    };
})();