class CollectionEditorialHero {
    static escape(value) {
        return String(value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    static formatDate(value) {
        const text = String(value || "").trim();

        if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
            return "";
        }

        const date = new Date(`${text}T12:00:00`);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return new Intl.DateTimeFormat("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(date);
    }

    static focusFor(settings, collectionId) {
        const point = settings?.collectionHeroFocus?.[
            String(collectionId)
        ];

        const clamp = (value, fallback) => {
            const number = Number(value);
            return Number.isFinite(number)
                ? Math.max(0, Math.min(100, Math.round(number)))
                : fallback;
        };

        return {
            x: clamp(point?.x, 50),
            y: clamp(point?.y, 0)
        };
    }

    static async render() {
        if (document.body.dataset.journalPage !== "collection") {
            return;
        }

        const collectionId = String(
            new URLSearchParams(window.location.search).get("id") || ""
        );
        const hero = document.getElementById("collectionIssueHero");

        if (!collectionId || !hero) {
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
        const settings = settingsResponse?.settings || {};
        const metadata = settings.collectionMetadata?.[collectionId] || {};
        const cover = JournalPages.coverFor(collection, photos);
        const coverId = JournalPages.galleryId(cover);
        const focus = this.focusFor(settings, collectionId);
        const issue = String(
            Math.max(1, Number(collection.order || 1))
        ).padStart(2, "0");
        const category = String(
            metadata.category || "Фотографическая история"
        ).trim();
        const date = this.formatDate(metadata.shootDate);
        const location = String(metadata.location || "").trim();
        const description = String(
            collection.description ||
            "История, собранная из света, движения и живых мгновений."
        ).trim();

        hero.classList.add("collection-editorial-hero");
        hero.innerHTML = `
            <div class="collection-issue-media">
                ${coverId
                    ? `<img
                        src="${GalleryService.getThumbnailUrl(coverId, 1600)}"
                        alt="${this.escape(collection.name)}"
                        fetchpriority="high"
                        style="object-position:${focus.x}% ${focus.y}%">`
                    : ""}
            </div>

            <div class="collection-issue-copy">
                <div class="collection-editorial-kicker">
                    ${this.escape(category)}
                </div>

                <div class="collection-editorial-issue">
                    Выпуск ${issue}
                </div>

                <h1>${this.escape(collection.name)}</h1>
                <p>${this.escape(description)}</p>

                <div class="collection-editorial-meta">
                    ${date ? `<span>${this.escape(date)}</span>` : ""}
                    ${location ? `<span>${this.escape(location)}</span>` : ""}
                </div>

                <a class="collection-issue-scroll" href="#issueGallery">
                    Читать историю
                    <span class="action-icon action-icon-down" aria-hidden="true"></span>
                </a>
            </div>
        `;

        const image = hero.querySelector(".collection-issue-media img");
        if (!image) {
            return;
        }

        const reveal = () => hero.classList.add("is-cover-loaded");
        image.addEventListener("load", reveal, { once: true });

        if (image.complete && image.naturalWidth > 0) {
            requestAnimationFrame(reveal);
        }
    }

    static install() {
        const original = JournalPages.initCollection.bind(JournalPages);

        JournalPages.initCollection = async function () {
            await original();
            await CollectionEditorialHero.render();
        };
    }
}

CollectionEditorialHero.install();
