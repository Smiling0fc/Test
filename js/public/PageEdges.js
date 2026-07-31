class PageEdges {
    static dynamicEdges = {
        left: [],
        right: []
    };

    static initialized = false;
    static collectionObserver = null;

    static cleanLabel(value, fallback) {
        const label = String(value || fallback || "").trim();

        if (label.length <= 34) {
            return label;
        }

        return `${label.slice(0, 31).trim()}…`;
    }

    static createEdge({
        target,
        side,
        label,
        tone = "dark",
        dynamic = false,
        compact = false
    }) {
        const edge = document.createElement("aside");

        edge.className = [
            "page-edge",
            `page-edge-${side}`,
            tone === "light"
                ? "page-edge-light"
                : "page-edge-dark",
            compact ? "page-edge-compact" : ""
        ].filter(Boolean).join(" ");

        edge.setAttribute("aria-hidden", "true");
        edge.innerHTML = `
            <span class="page-edge-line"></span>
            <i class="page-edge-dot"></i>
            <small class="page-edge-label"></small>
            <span class="page-edge-line"></span>
        `;

        edge.querySelector(".page-edge-label").textContent =
            this.cleanLabel(label, "ViJoy’s Journal");

        target.appendChild(edge);

        if (dynamic) {
            this.dynamicEdges[side].push(edge);
        }

        return edge;
    }

    static mountSection({
        selector,
        left,
        right,
        tone = "dark",
        mode = "full",
        dynamic = false,
        compact = false
    }) {
        const target = document.querySelector(selector);

        if (!target) {
            return;
        }

        target.classList.add(
            "page-edge-host",
            mode === "shell"
                ? "page-edge-host-shell"
                : "page-edge-host-full"
        );

        if (left) {
            this.createEdge({
                target,
                side: "left",
                label: left,
                tone,
                dynamic,
                compact
            });
        }

        if (right) {
            this.createEdge({
                target,
                side: "right",
                label: right,
                tone,
                dynamic,
                compact
            });
        }
    }

    static mountCollectionStoryEdges() {
        const gallery = document.getElementById("issueGalleryRoot");

        if (!gallery) {
            return false;
        }

        const stories = Array.from(
            gallery.querySelectorAll(".photo-story")
        );

        if (!stories.length) {
            return false;
        }

        gallery
            .querySelectorAll(".photo-story > .page-edge")
            .forEach(edge => edge.remove());

        stories.forEach(story => {
            story.classList.remove(
                "page-edge-host",
                "page-edge-host-full",
                "page-edge-host-shell"
            );
        });

        const firstStory = stories[0];
        const lastStory = stories[stories.length - 1];

        firstStory.classList.add(
            "page-edge-host",
            "page-edge-host-shell"
        );

        this.createEdge({
            target: firstStory,
            side: "left",
            label: "История кадра",
            tone: "dark",
            compact: true
        });

        if (lastStory !== firstStory) {
            lastStory.classList.add(
                "page-edge-host",
                "page-edge-host-shell"
            );

            this.createEdge({
                target: lastStory,
                side: "right",
                label: "Последний акцент",
                tone: "dark",
                compact: true
            });
        }

        return true;
    }

    static watchCollectionStories() {
        const root = document.getElementById("issueGalleryRoot");

        if (!root) {
            return;
        }

        if (this.mountCollectionStoryEdges()) {
            return;
        }

        this.collectionObserver?.disconnect();
        this.collectionObserver = new MutationObserver(() => {
            if (this.mountCollectionStoryEdges()) {
                this.collectionObserver.disconnect();
                this.collectionObserver = null;
            }
        });

        this.collectionObserver.observe(root, {
            childList: true,
            subtree: true
        });
    }

    static definitions(page) {
        const body = document.body;

        if (page === "home") {
            return [
                {
                    selector: "#about",
                    left: "О фотографе",
                    right: "Портфолио",
                    tone: "dark",
                    mode: "shell"
                },
                {
                    selector: "#latestStories",
                    left: "Последние истории",
                    right: "Коллекции",
                    tone: "dark",
                    mode: "shell"
                }
            ];
        }

        if (page === "archive") {
            return [
                {
                    selector: "#archiveGrid",
                    left: body.dataset.edgeLeft || "Коллекции",
                    right: body.dataset.edgeRight || "Портфолио",
                    tone: "dark",
                    mode: "full"
                }
            ];
        }

        return [];
    }

    static setLabels({ left, right } = {}) {
        const values = {
            left: this.cleanLabel(
                left,
                document.body.dataset.edgeLeft || "Портфолио"
            ),
            right: this.cleanLabel(
                right,
                document.body.dataset.edgeRight || "ViJoy’s Journal"
            )
        };

        ["left", "right"].forEach(side => {
            if (!values[side]) {
                return;
            }

            this.dynamicEdges[side].forEach(edge => {
                const label = edge.querySelector(
                    ".page-edge-label"
                );

                if (label) {
                    label.textContent = values[side];
                }
            });
        });
    }

    static init() {
        if (this.initialized) {
            return;
        }

        this.initialized = true;
        this.dynamicEdges = {
            left: [],
            right: []
        };

        document.body.classList.add("section-page-edges");

        document
            .querySelectorAll(".page-edge")
            .forEach(edge => edge.remove());

        const page = document.body.dataset.journalPage;

        this.definitions(page).forEach(definition => {
            this.mountSection(definition);
        });

        if (page === "collection") {
            this.watchCollectionStories();
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    PageEdges.init();
});
