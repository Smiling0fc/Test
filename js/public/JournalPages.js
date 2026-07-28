class JournalPages {
    static escape(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    static previewId(photo) {
        return String(
            photo?.previewFileId ||
            photo?.galleryFileId ||
            photo?.fileId ||
            ""
        );
    }

    static galleryId(photo) {
        return String(
            photo?.galleryFileId ||
            photo?.previewFileId ||
            photo?.fileId ||
            ""
        );
    }

    static coverFor(collection, photos) {
        return photos.find(photo =>
            String(photo.id) === String(collection.coverPhotoId || "")
        ) || photos[0] || null;
    }

    static async loadCollectionBundle(collection) {
        const photos = await GalleryService.loadPhotos(collection.id);
        return {
            collection,
            photos,
            cover: this.coverFor(collection, photos)
        };
    }

    static collectionCard(bundle) {
        const { collection, photos, cover } = bundle;
        const fileId = this.previewId(cover);
        const description = this.escape(collection.description || "");
        const count = photos.length;

        return `
            <a
                class="journal-collection-link"
                href="collection.html?id=${encodeURIComponent(collection.id)}">
                <article class="collection-card">
                    <div class="collection-heading">
                        <h2 class="collection-title">
                            ${this.escape(collection.name)}
                        </h2>
                        <p class="collection-description">
                            ${description}
                        </p>
                    </div>

                    <div class="collection-glass">
                        <div class="collection-cover">
                            ${fileId
                                ? `<img
                                    src="${GalleryService.getThumbnailUrl(fileId, 800)}"
                                    alt="${this.escape(collection.name)}"
                                    loading="lazy"
                                    decoding="async">`
                                : `<div class="collection-placeholder">
                                    <span>Пока без фотографий</span>
                                </div>`}
                        </div>
                    </div>

                    <div class="collection-footer">
                        <p class="collection-count">
                            ${count} ${this.photoWord(count)}
                        </p>
                        <span class="collection-arrow" aria-hidden="true">→</span>
                    </div>
                </article>
            </a>
        `;
    }

    static photoWord(number) {
        const value = Math.abs(Number(number)) % 100;
        const last = value % 10;

        if (value > 10 && value < 20) {
            return "фотографий";
        }

        if (last === 1) {
            return "фотография";
        }

        if (last >= 2 && last <= 4) {
            return "фотографии";
        }

        return "фотографий";
    }

    static async initHome() {
        const latestRoot = document.getElementById("latestStoriesGrid");
        const aboutVisual = document.getElementById("aboutVisual");

        try {
            const collections = await GalleryService.loadCollections();
            const selected = collections.slice(0, 3);
            const bundles = await Promise.all(
                selected.map(collection => this.loadCollectionBundle(collection))
            );

            if (latestRoot) {
                latestRoot.innerHTML = bundles.length
                    ? bundles.map(bundle => this.collectionCard(bundle)).join("")
                    : `<div class="journal-message">Истории скоро появятся.</div>`;
            }

            const visualPhotos = bundles
                .flatMap(bundle => bundle.photos)
                .slice(0, 2);

            if (aboutVisual) {
                aboutVisual.innerHTML = visualPhotos.map(photo => `
                    <figure>
                        <img
                            src="${GalleryService.getThumbnailUrl(this.galleryId(photo), 1600)}"
                            alt="Авторская фотография"
                            loading="lazy"
                            decoding="async">
                    </figure>
                `).join("");
            }

            const heroBundle = bundles[0];
            if (heroBundle?.cover) {
                const hero = document.getElementById("homeHero");
                hero?.style.setProperty(
                    "--hero-image",
                    `url("${GalleryService.getThumbnailUrl(this.galleryId(heroBundle.cover), 1600)}")`
                );
            }
        } catch (error) {
            console.error(error);
            if (latestRoot) {
                latestRoot.innerHTML = `
                    <div class="journal-message">
                        Не удалось загрузить последние истории.
                    </div>
                `;
            }
        }
    }

    static async initArchive() {
        const root = document.getElementById("archiveGrid");

        if (!root) {
            return;
        }

        try {
            const collections = await GalleryService.loadCollections();
            const bundles = await Promise.all(
                collections.map(collection => this.loadCollectionBundle(collection))
            );

            root.innerHTML = bundles.length
                ? bundles.map(bundle => this.collectionCard(bundle)).join("")
                : `<div class="journal-message">Коллекций пока нет.</div>`;
        } catch (error) {
            console.error(error);
            root.innerHTML = `
                <div class="journal-message">
                    Не удалось загрузить коллекции.
                </div>
            `;
        }
    }

    static renderPhoto(photo, index) {
        const smallId = this.previewId(photo);
        const largeId = this.galleryId(photo);
        const description = String(photo.description || "").trim();
        const story = description && ["story-left", "story-right"].includes(photo.layout);
        const eager = index < 2;

        if (story) {
            return `
                <article class="photo-story ${photo.layout}">
                    <figure class="public-photo photo-story-image">
                        <img
                            src="${GalleryService.getThumbnailUrl(largeId, 1600)}"
                            alt="${this.escape(photo.name)}"
                            loading="${eager ? "eager" : "lazy"}"
                            fetchpriority="${eager ? "high" : "auto"}"
                            decoding="async">
                    </figure>
                    <div class="photo-story-text">
                        <span class="photo-story-label">История кадра</span>
                        <p>${this.escape(description)}</p>
                    </div>
                </article>
            `;
        }

        return `
            <figure class="public-photo">
                <img
                    src="${GalleryService.getThumbnailUrl(smallId, 800)}"
                    srcset="
                        ${GalleryService.getThumbnailUrl(smallId, 800)} 800w,
                        ${GalleryService.getThumbnailUrl(largeId, 1600)} 1600w
                    "
                    sizes="(max-width: 700px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    alt="${this.escape(photo.name)}"
                    loading="${eager ? "eager" : "lazy"}"
                    fetchpriority="${eager ? "high" : "auto"}"
                    decoding="async">
            </figure>
        `;
    }

    static async initCollection() {
        const params = new URLSearchParams(window.location.search);
        const collectionId = params.get("id");
        const hero = document.getElementById("collectionIssueHero");
        const gallery = document.getElementById("issueGalleryRoot");

        if (!collectionId || !hero || !gallery) {
            return;
        }

        try {
            await GalleryService.loadCollections();
            const collection = GalleryService.getCollectionById(collectionId);

            if (!collection) {
                throw new Error("Коллекция не найдена.");
            }

            const photos = await GalleryService.loadPhotos(collectionId);
            const cover = this.coverFor(collection, photos);
            const coverId = this.galleryId(cover);

            document.title = `${collection.name} | ViJoy’s`;
            hero.innerHTML = `
                <div class="collection-issue-media">
                    ${coverId
                        ? `<img
                            src="${GalleryService.getThumbnailUrl(coverId, 1600)}"
                            alt="${this.escape(collection.name)}"
                            fetchpriority="high">`
                        : ""}
                </div>
                <div class="collection-issue-shade"></div>
                <div class="collection-issue-copy">
                    <small>Фотографическая история</small>
                    <h1>${this.escape(collection.name)}</h1>
                    <p>${this.escape(
                        collection.description ||
                        "История, собранная из света, движения и живых мгновений."
                    )}</p>
                    <div class="collection-issue-meta">
                        <span>${photos.length} ${this.photoWord(photos.length)}</span>
                        <span>ViJoy’s Journal</span>
                    </div>
                    <a class="collection-issue-scroll" href="#issueGallery">
                        Читать историю ↓
                    </a>
                </div>
            `;

            gallery.innerHTML = photos.length
                ? `<div class="public-photo-grid">${photos.map((photo, index) =>
                    this.renderPhoto(photo, index)
                ).join("")}</div>`
                : `<div class="journal-message">В этой истории пока нет фотографий.</div>`;
        } catch (error) {
            console.error(error);
            hero.innerHTML = `
                <div class="collection-issue-copy">
                    <small>ViJoy’s Journal</small>
                    <h1>История не найдена</h1>
                    <p>${this.escape(error.message)}</p>
                    <a class="collection-issue-scroll" href="collections.html">
                        Вернуться к коллекциям
                    </a>
                </div>
            `;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.journalPage;

    if (page === "home") {
        JournalPages.initHome();
    }

    if (page === "archive") {
        JournalPages.initArchive();
    }

    if (page === "collection") {
        JournalPages.initCollection();
    }
});