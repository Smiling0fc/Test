class Gallery {

    static container = null;

    static async init() {

        this.container =
            document.getElementById(
                "collections"
            );

        if (!this.container) {

            console.error(
                "Контейнер #collections не найден."
            );

            return;

        }

        this.renderLoading(
            "Загружаем коллекции..."
        );

        try {

            const collections =
                await GalleryService
                    .loadCollections();

            await Promise.all(

                collections.map(
                    collection =>
                        GalleryService
                            .loadPhotos(
                                collection.id
                            )
                            .catch(error => {

                                console.error(
                                    `Не удалось загрузить фотографии коллекции ${collection.id}:`,
                                    error
                                );

                                return [];

                            })
                )

            );

            this.renderCollections();

        } catch (error) {

            console.error(error);

            this.renderError(
                error.message ||
                "Не удалось загрузить коллекции."
            );

        }

    }

    static renderCollections() {

        const collections =
            GalleryService.getCollections();

        if (collections.length === 0) {

            this.container.innerHTML = `

                <div class="gallery-message">

                    <h2>
                        Коллекций пока нет
                    </h2>

                    <p>
                        Здесь скоро появятся новые истории.
                    </p>

                </div>

            `;

            return;

        }

        this.container.className =
            "collections";

        this.container.innerHTML =
            collections
                .map(collection => {

                    const photos =
                        GalleryService.getPhotos(
                            collection.id
                        );

                    const cover =
                        photos[0] || null;

                    const coverMarkup =
                        cover
                            ? `

                                <img
                                    src="${GalleryService.getThumbnailUrl(
                                        cover.fileId,
                                        900
                                    )}"
                                    srcset="
                                        ${GalleryService.getThumbnailUrl(
                                            cover.fileId,
                                            500
                                        )} 500w,
                                        ${GalleryService.getThumbnailUrl(
                                            cover.fileId,
                                            900
                                        )} 900w,
                                        ${GalleryService.getThumbnailUrl(
                                            cover.fileId,
                                            1400
                                        )} 1400w
                                    "
                                    sizes="
                                        (max-width: 700px) 100vw,
                                        (max-width: 1200px) 50vw,
                                        33vw
                                    "
                                    alt="${this.escapeHtml(
                                        collection.name
                                    )}"
                                    loading="lazy"
                                    decoding="async">

                            `
                            : `

                                <div
                                    class="collection-placeholder">

                                    <span>
                                        Пока без фотографий
                                    </span>

                                </div>

                            `;

                    return `

                        <article
                            class="collection-card ${this.normalizeSize(
                                collection.size
                            )}"
                            data-collection-id="${collection.id}"
                            tabindex="0"
                            role="button">

                            <div class="collection-glass">

                                <div class="collection-cover">

                                    ${coverMarkup}

                                </div>

                            </div>

                            <div class="collection-card-info">

                                <h2 class="collection-title">

                                    ${this.escapeHtml(
                                        collection.name
                                    )}

                                </h2>

                                <p class="collection-count">

                                    ${photos.length}
                                    ${this.getPhotoWord(
                                        photos.length
                                    )}

                                </p>

                            </div>

                        </article>

                    `;

                })
                .join("");

        this.bindCollectionEvents();

    }

    static bindCollectionEvents() {

        this.container.onclick = event => {

            const card =
                event.target.closest(
                    ".collection-card"
                );

            if (!card) {
                return;
            }

            this.openCollection(
                card.dataset.collectionId
            );

        };

        this.container.onkeydown = event => {

            if (
                event.key !== "Enter" &&
                event.key !== " "
            ) {
                return;
            }

            const card =
                event.target.closest(
                    ".collection-card"
                );

            if (!card) {
                return;
            }

            event.preventDefault();

            this.openCollection(
                card.dataset.collectionId
            );

        };

    }

    static openCollection(collectionId) {

        const collection =
            GalleryService.getCollectionById(
                collectionId
            );

        const photos =
            GalleryService.getPhotos(
                collectionId
            );

        if (!collection) {

            this.renderError(
                "Коллекция не найдена."
            );

            return;

        }

        this.container.className =
            "public-collection-view";

        this.container.innerHTML = `

            <div class="public-collection-header">

                <button
                    id="backToCollections"
                    class="public-back-button"
                    type="button">

                    ← Все коллекции

                </button>

                <div>

                    <h1>

                        ${this.escapeHtml(
                            collection.name
                        )}

                    </h1>

                    <p>

                        ${photos.length}
                        ${this.getPhotoWord(
                            photos.length
                        )}

                    </p>

                </div>

            </div>

            <div class="public-photo-grid">

                ${photos.length > 0
                    ? photos
                        .map(photo => `

                            <figure class="public-photo">

                                <img
                                    src="${GalleryService.getThumbnailUrl(
                                        photo.fileId,
                                        900
                                    )}"
                                    srcset="
                                        ${GalleryService.getThumbnailUrl(
                                            photo.fileId,
                                            500
                                        )} 500w,
                                        ${GalleryService.getThumbnailUrl(
                                            photo.fileId,
                                            900
                                        )} 900w,
                                        ${GalleryService.getThumbnailUrl(
                                            photo.fileId,
                                            1600
                                        )} 1600w
                                    "
                                    sizes="
                                        (max-width: 700px) 100vw,
                                        (max-width: 1200px) 50vw,
                                        33vw
                                    "
                                    alt="${this.escapeHtml(
                                        photo.name
                                    )}"
                                    loading="lazy"
                                    decoding="async">

                            </figure>

                        `)
                        .join("")
                    : `

                        <div class="gallery-message">

                            <h2>
                                В этой коллекции пока нет фотографий
                            </h2>

                        </div>

                    `
                }

            </div>

        `;

        document
            .getElementById(
                "backToCollections"
            )
            .addEventListener(
                "click",
                () => {

                    this.renderCollections();

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });

                }
            );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

    static renderLoading(message) {

        this.container.className =
            "gallery-state";

        this.container.innerHTML = `

            <div class="gallery-message">

                <div class="gallery-loader"></div>

                <p>
                    ${this.escapeHtml(message)}
                </p>

            </div>

        `;

    }

    static renderError(message) {

        this.container.className =
            "gallery-state";

        this.container.innerHTML = `

            <div class="gallery-message">

                <h2>
                    Не удалось загрузить галерею
                </h2>

                <p>
                    ${this.escapeHtml(message)}
                </p>

                <button
                    id="retryGallery"
                    class="public-back-button"
                    type="button">

                    Повторить

                </button>

            </div>

        `;

        document
            .getElementById(
                "retryGallery"
            )
            .addEventListener(
                "click",
                () => Gallery.init()
            );

    }

    static normalizeSize(size) {

        return [
            "small",
            "medium",
            "large"
        ].includes(size)
            ? size
            : "medium";

    }

    static getPhotoWord(count) {

        const lastTwoDigits =
            count % 100;

        const lastDigit =
            count % 10;

        if (
            lastTwoDigits >= 11 &&
            lastTwoDigits <= 14
        ) {
            return "фотографий";
        }

        if (lastDigit === 1) {
            return "фотография";
        }

        if (
            lastDigit >= 2 &&
            lastDigit <= 4
        ) {
            return "фотографии";
        }

        return "фотографий";

    }

    static escapeHtml(value) {

        return String(value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }

}

window.addEventListener(
    "DOMContentLoaded",
    () => {

        Gallery.init();

    }
);
