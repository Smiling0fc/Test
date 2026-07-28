class AboutSection {
    static data = {};
    static observer = null;
    static frame = null;

    static init() {
        if (document.body.dataset.journalPage !== "home") {
            return;
        }

        this.observeVisual();

        document.addEventListener(
            "site-identity:ready",
            event => this.apply(event.detail || {})
        );

        if (
            typeof SiteIdentity !== "undefined" &&
            SiteIdentity.loaded
        ) {
            this.apply(SiteIdentity.data || {});
        }
    }

    static apply(data = {}) {
        this.data = { ...data };
        this.scheduleSync();
    }

    static observeVisual() {
        const root = document.getElementById("aboutVisual");

        if (!root || this.observer) {
            return;
        }

        this.observer = new MutationObserver(() => {
            this.scheduleSync();
        });

        this.observer.observe(root, {
            childList: true,
            subtree: true
        });

        this.scheduleSync();
    }

    static scheduleSync() {
        if (this.frame !== null) {
            return;
        }

        this.frame = requestAnimationFrame(() => {
            this.frame = null;
            this.syncImages();
        });
    }

    static syncImages() {
        const root = document.getElementById("aboutVisual");

        if (!root || root.querySelector(".loading-about-visual")) {
            return;
        }

        const imageIds = [
            String(this.data.aboutPrimaryImageId || "").trim(),
            String(this.data.aboutSecondaryImageId || "").trim()
        ];

        if (!imageIds.some(Boolean)) {
            return;
        }

        const figures = Array.from(
            root.querySelectorAll(":scope > figure")
        );

        while (figures.length < 2) {
            const figure = document.createElement("figure");
            root.appendChild(figure);
            figures.push(figure);
        }

        imageIds.forEach((fileId, index) => {
            if (!fileId) {
                return;
            }

            const figure = figures[index];
            let image = figure.querySelector("img");

            if (!image) {
                image = document.createElement("img");
                figure.replaceChildren(image);
            }

            if (image.dataset.aboutImageId === fileId) {
                return;
            }

            image.dataset.aboutImageId = fileId;
            image.src = GalleryService.getThumbnailUrl(
                fileId,
                1600
            );
            image.alt = index === 0
                ? "Портрет фотографа"
                : "Авторская фотография";
            image.loading = "lazy";
            image.decoding = "async";
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    AboutSection.init();
});
