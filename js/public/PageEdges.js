class PageEdges {
    static elements = {
        left: null,
        right: null
    };

    static cleanLabel(value, fallback) {
        const label = String(value || fallback || "").trim();

        if (label.length <= 34) {
            return label;
        }

        return `${label.slice(0, 31).trim()}…`;
    }

    static createEdge(side, label) {
        const edge = document.createElement("aside");
        edge.className = `page-edge page-edge-${side}`;
        edge.setAttribute("aria-hidden", "true");
        edge.innerHTML = `
            <span class="page-edge-line"></span>
            <i class="page-edge-dot"></i>
            <small class="page-edge-label"></small>
            <span class="page-edge-line"></span>
        `;

        edge.querySelector(".page-edge-label").textContent = label;
        document.body.appendChild(edge);

        return edge;
    }

    static setLabels({ left, right } = {}) {
        const leftLabel = this.cleanLabel(
            left,
            document.body.dataset.edgeLeft || "Портфолио"
        );

        const rightLabel = this.cleanLabel(
            right,
            document.body.dataset.edgeRight || "ViJoy’s Journal"
        );

        if (this.elements.left) {
            this.elements.left
                .querySelector(".page-edge-label")
                .textContent = leftLabel;
        }

        if (this.elements.right) {
            this.elements.right
                .querySelector(".page-edge-label")
                .textContent = rightLabel;
        }
    }

    static watchHero() {
        const hero = document.querySelector(
            ".home-hero, .collection-issue-hero"
        );

        if (!hero) {
            document.body.classList.remove("page-edges-on-hero");
            return;
        }

        const updateTheme = () => {
            const bounds = hero.getBoundingClientRect();
            const probe = Math.min(window.innerHeight * .45, 360);
            const onHero = bounds.top < probe && bounds.bottom > probe;

            document.body.classList.toggle(
                "page-edges-on-hero",
                onHero
            );
        };

        updateTheme();
        window.addEventListener("scroll", updateTheme, { passive: true });
        window.addEventListener("resize", updateTheme);
    }

    static init() {
        if (document.querySelector(".page-edge")) {
            return;
        }

        const left = this.cleanLabel(
            document.body.dataset.edgeLeft,
            "Портфолио"
        );

        const right = this.cleanLabel(
            document.body.dataset.edgeRight,
            "ViJoy’s Journal"
        );

        this.elements.left = this.createEdge("left", left);
        this.elements.right = this.createEdge("right", right);
        this.watchHero();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    PageEdges.init();
});
