class CollectionIssueMeta {
    static async init() {
        if (document.body.dataset.journalPage !== "collection") {
            return;
        }

        const collectionId = new URLSearchParams(
            window.location.search
        ).get("id");

        if (!collectionId) {
            return;
        }

        try {
            const collections = await GalleryService.loadCollections();
            const collection = collections.find(item =>
                String(item.id) === String(collectionId)
            );

            if (!collection) {
                return;
            }

            const [photos, settingsResponse] = await Promise.all([
                GalleryService.loadPhotos(collectionId),
                PublicApi.getEditorialSettings().catch(error => {
                    console.warn(
                        "Настройки выпуска недоступны:",
                        error.message
                    );

                    return { settings: {} };
                })
            ]);

            const metadata =
                settingsResponse?.settings
                    ?.collectionMetadata
                    ?.[String(collectionId)] || {};

            this.apply(
                collection,
                metadata,
                photos.length
            );
        } catch (error) {
            console.warn(
                "Метаданные выпуска недоступны:",
                error.message
            );
        }
    }

    static apply(collection, metadata, photoCount) {
        const hero = document.getElementById("collectionIssueHero");

        if (!hero) {
            return;
        }

        const attempt = () => {
            const copy = hero.querySelector(".collection-issue-copy");
            const meta = hero.querySelector(".collection-issue-meta");
            const kicker = copy?.querySelector(":scope > small");

            if (!copy || !meta) {
                return false;
            }

            const category = String(
                metadata.category ||
                "Фотографическая история"
            ).trim();

            const location = String(
                metadata.location || ""
            ).trim();

            const date = this.formatDate(
                metadata.shootDate
            );

            const issue = String(
                Math.max(1, Number(collection.order || 1))
            ).padStart(2, "0");

            if (kicker) {
                kicker.textContent = category;
            }

            const items = [
                date,
                location,
                `Выпуск ${issue}`,
                `${photoCount} ${this.photoWord(photoCount)}`
            ].filter(Boolean);

            meta.classList.add("collection-issue-meta-journal");
            meta.innerHTML = items.map((item, index) => `
                <span class="collection-issue-meta-item">
                    ${this.escape(item)}
                </span>
                ${index < items.length - 1
                    ? '<i aria-hidden="true"></i>'
                    : ''}
            `).join("");

            return true;
        };

        if (attempt()) {
            return;
        }

        const observer = new MutationObserver(() => {
            if (attempt()) {
                observer.disconnect();
            }
        });

        observer.observe(hero, {
            childList: true,
            subtree: true
        });

        setTimeout(() => observer.disconnect(), 10000);
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

    static escape(value) {
        return String(value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    CollectionIssueMeta.init();
});
