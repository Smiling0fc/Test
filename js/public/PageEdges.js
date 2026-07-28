class PageEdges {
    static dynamicEdges = {
        left: [],
        right: []
    };

    static initialized = false;

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
        dynamic = false
    }) {
        const edge = document.createElement("aside");

        edge.className = [
            "page-edge",
            `page-edge-${side}`,
            tone === "light"
                ? "page-edge-light"
                : "page-edge-dark"
        ].join(" ");

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
        dynamic = false
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
                dynamic
            });
        }

        if (right) {
            this.createEdge({
                target,
                side: "right",
                label: right,
                tone,
                dynamic
            });
        }
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

        if (page === "collection") {
            return [
                {
                    selector: "#issueGallery",
                    left:
                        body.dataset.edgeLeft ||
                        "Фотографическая история",
                    right:
                        body.dataset.edgeRight ||
                        "ViJoy’s Journal",
                    tone: "dark",
                    mode: "full",
                    dynamic: true
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
    }
}

document.addEventListener("DOMContentLoaded", () => {
    PageEdges.init();
});
