class CollectionModes {
    static escape(value) {
        return String(value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    static normalizeMode(value) {
        const mode = String(value || "mixed").trim();
        return ["gallery", "story", "mixed"].includes(mode)
            ? mode
            : "mixed";
    }

    static image(photo, index, sizes) {
        const smallId = JournalPages.previewId(photo);
        const largeId = JournalPages.galleryId(photo);
        const eager = index < 2;

        return `<img
            src="${GalleryService.getThumbnailUrl(smallId, 800)}"
            srcset="
                ${GalleryService.getThumbnailUrl(smallId, 800)} 800w,
                ${GalleryService.getThumbnailUrl(largeId, 1600)} 1600w
            "
            sizes="${sizes}"
            alt="${this.escape(photo.name)}"
            loading="${eager ? "eager" : "lazy"}"
            fetchpriority="${eager ? "high" : "auto"}"
            decoding="async">`;
    }

    static galleryPhoto(photo, index) {
        return `
            <figure class="collection-gallery-photo">
                ${this.image(
                    photo,
                    index,
                    "(max-width: 720px) 100vw, (max-width: 1200px) 50vw, 33vw"
                )}
            </figure>
        `;
    }

    static storyPhoto(photo, index) {
        const description = String(photo.description || "").trim();
        const side = index % 2 === 0 ? "story-copy-right" : "story-copy-left";
        const featured = index === 0 || index % 5 === 0;

        if (!description || featured) {
            return `
                <figure class="collection-story-frame${featured ? " is-featured" : ""}">
                    ${this.image(photo, index, "100vw")}
                    ${description
                        ? `<figcaption>${this.escape(description)}</figcaption>`
                        : ""}
                </figure>
            `;
        }

        return `
            <article class="collection-story-spread ${side}">
                <figure>
                    ${this.image(
                        photo,
                        index,
                        "(max-width: 840px) 100vw, 62vw"
                    )}
                </figure>
                <div class="collection-story-copy">
                    <small>История кадра</small>
                    <p>${this.escape(description)}</p>
                </div>
            </article>
        `;
    }

    static async render() {
        if (document.body.dataset.journalPage !== "collection") {
            return;
        }

        const collectionId = String(
            new URLSearchParams(window.location.search).get("id") || ""
        );
        const root = document.getElementById("issueGalleryRoot");

        if (!collectionId || !root) {
            return;
        }

        const collections = GalleryService.getCollections().length
            ? GalleryService.getCollections()
            : await GalleryService.loadCollections();
        const collection = collections.find(item =>
            String(item.id) === collectionId
        );

        if (!collection) {
            return;
        }

        let photos = GalleryService.getPhotos(collectionId);
        if (!photos.length) {
            photos = await GalleryService.loadPhotos(collectionId);
        }

        const settingsResponse = await PublicApi
            .getEditorialSettings()
            .catch(() => ({ settings: {} }));
        const metadata = settingsResponse?.settings
            ?.collectionMetadata?.[collectionId] || {};
        const mode = this.normalizeMode(metadata.displayMode);

        document.body.dataset.collectionMode = mode;
        root.classList.remove(
            "collection-mode-gallery",
            "collection-mode-story",
            "collection-mode-mixed"
        );
        root.classList.add(`collection-mode-${mode}`);

        if (!photos.length || mode === "mixed") {
            return;
        }

        const nextStory = root.querySelector(".next-story");
        const content = mode === "gallery"
            ? `<div class="collection-gallery-layout">
                ${photos.map((photo, index) =>
                    this.galleryPhoto(photo, index)
                ).join("")}
            </div>`
            : `<div class="collection-story-layout">
                ${photos.map((photo, index) =>
                    this.storyPhoto(photo, index)
                ).join("")}
            </div>`;

        root.innerHTML = content;
        if (nextStory) {
            root.appendChild(nextStory);
        }
    }

    static install() {
        const original = JournalPages.initCollection.bind(JournalPages);

        JournalPages.initCollection = async function () {
            await original();
            await CollectionModes.render();
        };
    }
}

CollectionModes.install();