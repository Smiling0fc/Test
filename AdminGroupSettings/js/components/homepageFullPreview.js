(() => {

    const normalizeSize = value => {
        const size = String(value || "medium");

        return [
            "small",
            "medium",
            "large"
        ].includes(size)
            ? size
            : "medium";
    };

    const getPublishedCollections = () =>
        CollectionService
            .getAll()
            .filter(collection =>
                collection.published !== false
            )
            .slice()
            .sort(
                (first, second) =>
                    Number(first.order || 0) -
                    Number(second.order || 0)
            );

    const getCollectionPreview = async collection => {
        let photos = PhotoService.getByCollection(
            collection.id
        );

        if (!photos.length) {
            try {
                photos = await PhotoService.load(
                    collection.id
                );
            } catch (error) {
                console.warn(
                    `Не удалось загрузить обложку коллекции ${collection.id}:`,
                    error
                );
                photos = [];
            }
        }

        const cover = photos.find(photo =>
            String(photo.id) ===
            String(collection.coverPhotoId || "")
        ) || photos[0] || null;

        return {
            collection,
            photos,
            cover
        };
    };

    const renderCard = item => {
        const collection = item.collection;
        const size = normalizeSize(collection.size);
        const description = String(
            collection.description || ""
        ).trim();

        const imageMarkup = item.cover?.fileId
            ? `
                <img
                    src="https://lh3.googleusercontent.com/d/${encodeURIComponent(
                        item.cover.fileId
                    )}=w900"
                    alt="${Homepage.escapeHtml(
                        collection.name
                    )}"
                    loading="lazy"
                    decoding="async">
            `
            : `
                <div class="homepage-collection-placeholder">
                    <span>◇</span>
                    <small>Без обложки</small>
                </div>
            `;

        return `
            <button
                class="homepage-collection-card size-${size}"
                type="button"
                data-collection-id="${Homepage.escapeHtml(
                    collection.id
                )}"
                aria-label="Редактировать коллекцию ${Homepage.escapeHtml(
                    collection.name
                )}">

                <span class="homepage-collection-copy">
                    <small>COLLECTION</small>
                    <strong>${Homepage.escapeHtml(
                        collection.name
                    )}</strong>
                    ${description
                        ? `
                            <span class="homepage-collection-description">
                                ${Homepage.escapeHtml(description)}
                            </span>
                        `
                        : ""
                    }
                    <span class="homepage-collection-count">
                        ${item.photos.length}
                        ${Homepage.getPhotoWord(
                            item.photos.length
                        )}
                    </span>
                </span>

                <span class="homepage-collection-image">
                    ${imageMarkup}
                </span>

                <span class="homepage-preview-object-label">
                    ${size.toUpperCase()}
                </span>
            </button>
        `;
    };

    Homepage.renderCollectionsPreview = async function () {
        const stage = document.querySelector(
            ".homepage-stage"
        );

        if (!stage) {
            return;
        }

        let preview = document.getElementById(
            "homepageCollectionsPreview"
        );

        if (!preview) {
            preview = document.createElement("section");
            preview.id = "homepageCollectionsPreview";
            preview.className =
                "homepage-collections-preview";
            stage.appendChild(preview);
        }

        const collections = getPublishedCollections();
        const toolbarValue = document.querySelector(
            ".homepage-stage-toolbar span:last-child"
        );

        if (toolbarValue) {
            toolbarValue.textContent = collections.length
                ? `Hero + ${collections.length} коллекций`
                : "Hero";
        }

        preview.innerHTML = `
            <div class="homepage-collections-loading">
                Собираем страницу...
            </div>
        `;

        if (!collections.length) {
            preview.innerHTML = `
                <div class="homepage-collections-empty">
                    <span>◇</span>
                    <strong>Нет опубликованных коллекций</strong>
                    <small>
                        Опубликуйте коллекцию, и она появится
                        в предпросмотре главной страницы.
                    </small>
                </div>
            `;
            return;
        }

        const items = await Promise.all(
            collections.map(collection =>
                getCollectionPreview(collection)
            )
        );

        if (!document.body.contains(preview)) {
            return;
        }

        preview.innerHTML = `
            <div class="homepage-collections-intro-preview">
                <div>
                    <small>ПОРТФОЛИО</small>
                    <h2>Коллекции</h2>
                    <p>
                        Истории в каждом кадре. Выберите коллекцию
                        и погрузитесь в атмосферу момента.
                    </p>
                </div>

                <span>
                    ${collections.length}
                    ${collections.length === 1
                        ? "история"
                        : "историй"
                    }
                </span>
            </div>

            <div class="homepage-collections-grid-preview">
                ${items.map(renderCard).join("")}
            </div>

            <div class="homepage-footer-preview">
                <span>ViJoy's Photo Gallery</span>
                <small>© 2026 · Все права защищены</small>
            </div>
        `;

        preview
            .querySelectorAll(
                ".homepage-collection-card"
            )
            .forEach(card => {
                card.addEventListener(
                    "click",
                    () => Inspector.openCollection(
                        card.dataset.collectionId
                    )
                );
            });
    };

    const originalHomepageRender =
        Homepage.render.bind(Homepage);

    Homepage.render = async function () {
        await originalHomepageRender();
        await this.renderCollectionsPreview();
    };

    const previousClearSelection =
        Inspector.clearSelection.bind(Inspector);

    Inspector.clearSelection = function () {
        previousClearSelection();

        document
            .querySelectorAll(
                ".homepage-collection-card.is-selected"
            )
            .forEach(card =>
                card.classList.remove("is-selected")
            );
    };

    const previousMarkSelected =
        Inspector.markSelected.bind(Inspector);

    Inspector.markSelected = function (type, id) {
        previousMarkSelected(type, id);

        if (type !== "collection") {
            return;
        }

        document
            .querySelectorAll(
                ".homepage-collection-card[data-collection-id]"
            )
            .forEach(card => {
                card.classList.toggle(
                    "is-selected",
                    String(card.dataset.collectionId) ===
                    String(id)
                );
            });
    };

    const originalUpdateDetails =
        CollectionService.updateDetails.bind(
            CollectionService
        );

    CollectionService.updateDetails = async function (
        id,
        data
    ) {
        const result = await originalUpdateDetails(
            id,
            data
        );

        if (
            document.getElementById(
                "homepageHeroPreview"
            )
        ) {
            const settings = SiteSettingsService.get();

            await Homepage.renderPreview(
                settings.heroCollectionId
            );
            await Homepage.renderCollectionsPreview();
        }

        return result;
    };

})();
