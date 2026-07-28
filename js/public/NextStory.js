class NextStory {
    static currentRoot = null;

    static escape(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    static number(value) {
        return String(value).padStart(2, "0");
    }

    static skeleton() {
        return `
            <section class="next-story next-story-loading" aria-live="polite">
                <div class="next-story-heading">
                    <span>Следующая история</span>
                    <i aria-hidden="true"></i>
                </div>

                <div class="next-story-skeleton loading-skeleton" aria-hidden="true">
                    <div class="next-story-skeleton-copy">
                        <span class="loading-skeleton-bar"></span>
                        <span class="loading-skeleton-bar"></span>
                        <span class="loading-skeleton-bar"></span>
                    </div>
                    <div class="loading-skeleton-media"></div>
                </div>
            </section>
        `;
    }

    static archiveFallback() {
        return `
            <section class="next-story next-story-archive">
                <div class="next-story-heading">
                    <span>Продолжить просмотр</span>
                    <i aria-hidden="true"></i>
                </div>

                <a class="next-story-archive-link" href="collections.html">
                    <small>ViJoy’s Journal</small>
                    <strong>Открыть все коллекции</strong>
                    <span aria-hidden="true">→</span>
                </a>
            </section>
        `;
    }

    static bindImage(section) {
        const media = section.querySelector(
            ".next-story-media"
        );
        const image = media?.querySelector("img");

        if (!media || !image) {
            return;
        }

        media.classList.add("image-loading-shell");

        const loaded = () => {
            media.classList.remove("is-image-error");
            media.classList.add("is-image-loaded");
        };

        const failed = () => {
            media.classList.remove("is-image-loaded");
            media.classList.add("is-image-error");
        };

        image.addEventListener("load", loaded, { once: true });
        image.addEventListener("error", failed, { once: true });

        if (image.complete) {
            requestAnimationFrame(() => {
                image.naturalWidth > 0
                    ? loaded()
                    : failed();
            });
        }
    }

    static reveal(section) {
        if (typeof EditorialLoadingMotion !== "undefined") {
            EditorialLoadingMotion.reveal(section);
            return;
        }

        section.classList.add("is-revealed");
    }

    static async render() {
        const root = document.getElementById(
            "issueGalleryRoot"
        );
        const params = new URLSearchParams(
            window.location.search
        );
        const currentId = String(
            params.get("id") || ""
        );

        if (!root || !currentId) {
            return;
        }

        root.querySelector(".next-story")?.remove();
        root.insertAdjacentHTML(
            "beforeend",
            this.skeleton()
        );

        const section = root.querySelector(
            ".next-story"
        );

        try {
            const collections =
                GalleryService.getCollections();
            const currentIndex = collections.findIndex(
                collection =>
                    String(collection.id) === currentId
            );

            if (
                collections.length < 2 ||
                currentIndex === -1
            ) {
                section.outerHTML =
                    this.archiveFallback();

                const fallback = root.querySelector(
                    ".next-story"
                );
                this.reveal(fallback);
                return;
            }

            const nextIndex =
                (currentIndex + 1) % collections.length;
            const collection = collections[nextIndex];
            const collectionId = String(collection.id);

            let photos = GalleryService.getPhotos(
                collectionId
            );

            if (!photos.length) {
                photos = await GalleryService.loadPhotos(
                    collectionId
                );
            }

            const cover = JournalPages.coverFor(
                collection,
                photos
            );
            const previewId = JournalPages.previewId(cover);
            const galleryId = JournalPages.galleryId(cover);
            const description = String(
                collection.description ||
                "Следующая глава авторского фотожурнала."
            ).trim();

            section.className = "next-story";
            section.innerHTML = `
                <div class="next-story-heading">
                    <span>Следующая история</span>
                    <i aria-hidden="true"></i>
                    <span>
                        ${this.number(nextIndex + 1)} / ${this.number(collections.length)}
                    </span>
                </div>

                <a
                    class="next-story-card"
                    href="collection.html?id=${encodeURIComponent(collectionId)}">
                    <div class="next-story-copy">
                        <small>Фотографическая история</small>
                        <h2>${this.escape(collection.name)}</h2>
                        <p>${this.escape(description)}</p>
                        <span class="next-story-open">
                            Открыть историю <b aria-hidden="true">→</b>
                        </span>
                    </div>

                    <div class="next-story-media">
                        ${previewId
                            ? `<img
                                src="${GalleryService.getThumbnailUrl(previewId, 800)}"
                                srcset="
                                    ${GalleryService.getThumbnailUrl(previewId, 800)} 800w,
                                    ${GalleryService.getThumbnailUrl(galleryId, 1600)} 1600w
                                "
                                sizes="(max-width: 760px) 100vw, 64vw"
                                alt="${this.escape(collection.name)}"
                                loading="lazy"
                                decoding="async">`
                            : `<div class="next-story-placeholder">
                                История скоро получит обложку
                            </div>`}
                    </div>
                </a>

                <div class="next-story-footer">
                    <a href="collections.html">← Все коллекции</a>
                    <span>ViJoy’s Journal</span>
                </div>
            `;

            this.bindImage(section);
            this.reveal(section);
        } catch (error) {
            console.warn(
                "Не удалось загрузить следующую историю:",
                error.message
            );

            section.outerHTML = this.archiveFallback();
            const fallback = root.querySelector(
                ".next-story"
            );
            this.reveal(fallback);
        }
    }

    static install() {
        const original =
            JournalPages.initCollection.bind(
                JournalPages
            );

        JournalPages.initCollection = async function () {
            await original();
            await NextStory.render();
        };
    }
}

NextStory.install();