class PageChrome {
    static header = null;
    static hero = null;
    static button = null;
    static ticking = false;
    static iconObserver = null;

    static init() {
        this.header = document.querySelector("header");
        this.hero = document.querySelector(
            "#homeHero, #collectionIssueHero, .archive-hero"
        );

        this.installIconStyles();
        this.createBackToTop();
        this.enhanceActionIcons();
        this.observeActionIcons();
        this.bind();
        this.update();
    }

    static installIconStyles() {
        if (document.querySelector('link[data-action-icons="true"]')) {
            return;
        }

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "css/action-icons.css";
        link.dataset.actionIcons = "true";
        document.head.appendChild(link);
    }

    static createBackToTop() {
        this.button = document.createElement("button");
        this.button.className = "page-back-to-top";
        this.button.type = "button";
        this.button.setAttribute("aria-label", "Наверх");
        this.button.setAttribute("title", "Наверх");
        document.body.appendChild(this.button);
    }

    static iconMarkup(direction) {
        return `<span class="action-icon action-icon-${direction}" aria-hidden="true"></span>`;
    }

    static replaceSymbolElement(element, direction) {
        if (!element || element.dataset.svgIcon === "true") {
            return;
        }

        element.textContent = "";
        element.classList.add(
            "action-icon",
            `action-icon-${direction}`
        );
        element.dataset.svgIcon = "true";
    }

    static replaceTrailingSymbol(element, symbol, direction) {
        if (!element || element.dataset.svgIcon === "true") {
            return;
        }

        const text = String(element.textContent || "").trim();

        if (!text.includes(symbol)) {
            return;
        }

        element.textContent = text.replace(symbol, "").trim();
        element.insertAdjacentHTML(
            "beforeend",
            this.iconMarkup(direction)
        );
        element.classList.add("action-with-icon");
        element.dataset.svgIcon = "true";
    }

    static enhanceActionIcons(root = document) {
        root.querySelectorAll(
            ".hero-button span, .contact-link span, .collection-arrow, " +
            ".next-story-open b, .next-story-archive-link > span"
        ).forEach(element =>
            this.replaceSymbolElement(element, "right")
        );

        root.querySelectorAll(
            ".collection-issue-scroll, .latest-stories-head a"
        ).forEach(element =>
            this.replaceTrailingSymbol(element, "↓", "down") ||
            this.replaceTrailingSymbol(element, "→", "right")
        );

        root.querySelectorAll(".next-story-footer a").forEach(element =>
            this.replaceTrailingSymbol(element, "←", "left")
        );
    }

    static observeActionIcons() {
        if (this.iconObserver || !document.body) {
            return;
        }

        this.iconObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== Node.ELEMENT_NODE) {
                        return;
                    }

                    this.enhanceActionIcons(node);
                });
            });
        });

        this.iconObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    static requestUpdate() {
        if (this.ticking) {
            return;
        }

        this.ticking = true;

        requestAnimationFrame(() => {
            this.update();
            this.ticking = false;
        });
    }

    static bind() {
        window.addEventListener(
            "scroll",
            () => this.requestUpdate(),
            { passive: true }
        );

        window.addEventListener(
            "resize",
            () => this.requestUpdate(),
            { passive: true }
        );

        this.button?.addEventListener("click", () => {
            const reducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

            window.scrollTo({
                top: 0,
                behavior: reducedMotion ? "auto" : "smooth"
            });
        });
    }

    static isBelowHero(scrollTop) {
        if (!this.hero) {
            return scrollTop > 42;
        }

        const headerHeight = this.header?.offsetHeight || 0;
        return this.hero.getBoundingClientRect().bottom <= headerHeight;
    }

    static update() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const headerScrolled = this.isBelowHero(scrollTop);
        const buttonVisible = scrollTop > Math.max(460, window.innerHeight * .62);

        this.header?.classList.toggle(
            "header-scrolled",
            headerScrolled
        );

        this.button?.classList.toggle(
            "is-visible",
            buttonVisible
        );
    }
}

document.addEventListener("DOMContentLoaded", () => {
    PageChrome.init();
});