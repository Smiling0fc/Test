class Gallery {

    static async init() {

        const container =
            document.getElementById(
                "collections"
            );

        if (!container) {
            return;
        }

        container.innerHTML = `

            <div class="gallery-loading">

                Загружаем коллекции...

            </div>

        `;

        try {

            await GalleryService
                .loadCollections();

            this.renderCollections();

        } catch (error) {

            console.error(error);

            container.innerHTML = `

                <div class="gallery-error">

                    Не удалось загрузить коллекции.

                </div>

            `;

        }

    }

    static renderCollections() {

        const container =
            document.getElementById(
                "collections"
            );

        const collections =
            GalleryService.getCollections();

        if (collections.length === 0) {

            container.innerHTML = `

                <div class="gallery-empty">

                    Коллекций пока нет.

                </div>

            `;

            return;

        }

        container.innerHTML =
            collections
                .map(collection => `

                    <article
                        class="public-collection-card"
                        data-id="${collection.id}">

                        <div
                            class="public-collection-cover">

                            <span>
                                ${collection.name}
                            </span>

                        </div>

                        <h2>
                            ${collection.name}
                        </h2>

                    </article>

                `)
                .join("");

        this.bindEvents();

    }

    static bindEvents() {

        const container =
            document.getElementById(
                "collections"
            );

        container.onclick = event => {

            const card =
                event.target.closest(
                    ".public-collection-card"
                );

            if (!card) {
                return;
            }

            this.openCollection(
                card.dataset.id
            );

        };

    }

    static async openCollection(
        collectionId
    ) {

        const container =
            document.getElementById(
                "collections"
            );

        container.innerHTML = `

            <div class="gallery-loading">

                Загружаем фотографии...

            </div>

        `;

        try {

            await GalleryService
                .loadPhotos(
                    collectionId
                );

            this.renderPhotos(
                collectionId
            );

        } catch (error) {

            console.error(error);

            container.innerHTML = `

                <div class="gallery-error">

                    Не удалось загрузить фотографии.

                </div>

            `;

        }

    }

    static renderPhotos(
        collectionId
    ) {

        const container =
            document.getElementById(
                "collections"
            );

        const collection =
            GalleryService
                .getCollections()
                .find(
                    item =>
                        item.id ===
                        String(collectionId)
                );

        const photos =
            GalleryService.getPhotos(
                collectionId
            );

        container.innerHTML = `

            <div class="public-collection-view">

                <button
                    id="backToCollections"
                    class="public-back-button">

                    ← Все коллекции

                </button>

                <h1>
                    ${collection?.name || ""}
                </h1>

                <div class="public-photo-grid">

                    ${photos.map(photo => `

                        <img
                            src="https://lh3.googleusercontent.com/d/${photo.fileId}=w900"
                            srcset="
                                https://lh3.googleusercontent.com/d/${photo.fileId}=w500 500w,
                                https://lh3.googleusercontent.com/d/${photo.fileId}=w900 900w,
                                https://lh3.googleusercontent.com/d/${photo.fileId}=w1400 1400w
                            "
                            sizes="
                                (max-width: 700px) 100vw,
                                (max-width: 1200px) 50vw,
                                33vw
                            "
                            alt="${photo.name}"
                            loading="lazy"
                            decoding="async">

                    `).join("")}

                </div>

            </div>

        `;

        document
            .getElementById(
                "backToCollections"
            )
            .addEventListener(
                "click",
                () => this.renderCollections()
            );

    }

}

window.addEventListener(
    "DOMContentLoaded",
    () => {

        Gallery.init();

    }
);
