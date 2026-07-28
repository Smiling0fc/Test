class EditorialLoadingMotion {
    static mutationObserver = null;
    static revealObserver = null;
    static initialized = false;

    static imageShellSelector = [
        ".collection-cover",
        ".about-editorial-visual figure",
        ".public-photo",
        ".collection-issue-media"
    ].join(", ");

    static revealSelector = [
        ".about-editorial-copy",
        ".about-editorial-visual figure",
        ".latest-stories-head",
        ".home-story-row",
        ".home-story-editorial-copy",
        ".archive-hero",
        ".archive-grid > .journal-collection-link",
        ".public-photo-grid > .photo-story",
        ".public-photo-grid > .public-photo",
        ".editorial-footer-main",
        ".editorial-footer-links",
        ".editorial-footer-bottom"
    ].join(", ");

    static homeSkeleton() {
        return `
            <div class="loading-home-stack" aria-hidden="true">
                ${[0, 1, 2].map(() => `
                    <div class="loading-skeleton loading-home-story">
                        <div class="loading-home-story-copy">
                            <span class="loading-skeleton-bar"></span>
                            <span class="loading-skeleton-bar"></span>
                            <span class="loading-skeleton-bar"></span>
                            <span class="loading-skeleton-bar"></span>
                        </div>
                        <div class="loading-skeleton-media"></div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    static archiveSkeleton() {
        return [0, 1, 2, 3].map(() => `
            <div
                class="loading-skeleton loading-archive-card"
                aria-hidden="true">
            </div>
        `).join("");
    }

    static gallerySkeleton() {
        return `
            <div class="loading-gallery-stack" aria-hidden="true">
                <div class="loading-skeleton loading-gallery-photo"></div>
                <div class="loading-skeleton loading-gallery-photo"></div>
                <div class="loading-skeleton loading-gallery-photo"></div>
            </div>
        `;
    }

    static aboutSkeleton() {
        return `
            <div class="loading-about-visual" aria-hidden="true">
                <div class="loading-skeleton-media"></div>
                <div class="loading-skeleton-media"></div>
            </div>
        `;
    }

    static markLoadingRoot(root) {
        if (!root) {
            return;
        }

        root.classList.add("has-loading-reserve");
        root.setAttribute("aria-busy", "true");
    }

    static prepareInitialSkeletons() {
        const page = document.body.dataset.journalPage;

        if (
            typeof EditorialFooter !== "undefined" &&
            !EditorialFooter.hydrated
        ) {
            EditorialFooter.renderSkeleton();
        }

        if (page === "home") {
            const latest = document.getElementById("latestStoriesGrid");
            const about = document.getElementById("aboutVisual");

            if (latest) {
                this.markLoadingRoot(latest);
                latest.innerHTML = this.homeSkeleton();
            }

            if (about) {
                about.innerHTML = this.aboutSkeleton();
            }
        }

        if (page === "archive") {
            const archive = document.getElementById("archiveGrid");

            if (archive) {
                this.markLoadingRoot(archive);
                archive.innerHTML = this.archiveSkeleton();
            }
        }

        if (page === "collection") {
            const gallery = document.getElementById("issueGalleryRoot");

            if (gallery) {
                this.markLoadingRoot(gallery);
                gallery.innerHTML = this.gallerySkeleton();
            }
        }
    }

    static releaseResolvedSkeletons() {
        const roots = [
            {
                element: document.getElementById("latestStoriesGrid"),
                selector: ".loading-home-stack"
            },
            {
                element: document.getElementById("archiveGrid"),
                selector: ".loading-archive-card"
            },
            {
                element: document.getElementById("issueGalleryRoot"),
                selector: ".loading-gallery-stack"
            }
        ];

        roots.forEach(({ element, selector }) => {
            if (!element?.classList.contains("has-loading-reserve")) {
                return;
            }

            if (element.querySelector(selector)) {
                return;
            }

            element.classList.remove("has-loading-reserve");
            element.setAttribute("aria-busy", "false");
        });
    }

    static imageShellFor(image) {
        return image.closest(this.imageShellSelector);
    }

    static markImageState(shell, state) {
        shell.classList.remove(
            "is-image-loaded",
            "is-image-error"
        );
        shell.classList.add(state);
    }

    static bindImage(image) {
        if (!(image instanceof HTMLImageElement)) {
            return;
        }

        if (image.dataset.editorialLoadingBound === "true") {
            return;
        }

        const shell = this.imageShellFor(image);

        if (!shell) {
            return;
        }

        image.dataset.editorialLoadingBound = "true";
        shell.classList.add("image-loading-shell");

        const loaded = () => {
            this.markImageState(shell, "is-image-loaded");
        };

        const failed = () => {
            this.markImageState(shell, "is-image-error");
        };

        image.addEventListener("load", loaded, { once: true });
        image.addEventListener("error", failed, { once: true });

        if (image.complete) {
            requestAnimationFrame(() => {
                if (image.naturalWidth > 0) {
                    loaded();
                } else {
                    failed();
                }
            });
        }
    }

    static bindImages(root) {
        if (root instanceof HTMLImageElement) {
            this.bindImage(root);
        }

        if (!(root instanceof Element) && root !== document) {
            return;
        }

        root.querySelectorAll?.("img").forEach(image => {
            this.bindImage(image);
        });
    }

    static reveal(element, index = 0) {
        if (!(element instanceof Element)) {
            return;
        }

        if (element.dataset.editorialRevealBound === "true") {
            return;
        }

        element.dataset.editorialRevealBound = "true";
        element.classList.add("editorial-reveal");
        element.style.setProperty(
            "--editorial-reveal-delay",
            `${Math.min(index % 6, 5) * 65}ms`
        );

        if (!this.revealObserver) {
            element.classList.add("is-revealed");
            return;
        }

        this.revealObserver.observe(element);
    }

    static bindReveals(root) {
        const elements = [];

        if (root instanceof Element && root.matches(this.revealSelector)) {
            elements.push(root);
        }

        if ((root instanceof Element) || root === document) {
            root.querySelectorAll?.(this.revealSelector)
                .forEach(element => elements.push(element));
        }

        elements.forEach((element, index) => {
            this.reveal(element, index);
        });
    }

    static scan(root) {
        this.bindImages(root);
        this.bindReveals(root);
    }

    static watchMutations() {
        this.mutationObserver = new MutationObserver(records => {
            records.forEach(record => {
                record.addedNodes.forEach(node => {
                    if (node instanceof Element) {
                        this.scan(node);
                    }
                });
            });

            requestAnimationFrame(() => {
                this.releaseResolvedSkeletons();
            });
        });

        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    static initRevealObserver() {
        if (
            window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
            !("IntersectionObserver" in window)
        ) {
            this.revealObserver = null;
            return;
        }

        this.revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-revealed");
                this.revealObserver.unobserve(entry.target);
            });
        }, {
            rootMargin: "0px 0px -8% 0px",
            threshold: .08
        });
    }

    static init() {
        if (this.initialized) {
            return;
        }

        this.initialized = true;
        this.prepareInitialSkeletons();
        this.initRevealObserver();
        this.scan(document);
        this.watchMutations();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    EditorialLoadingMotion.init();
});
