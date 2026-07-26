class HeaderTheme {

    static header = null;
    static hero = null;
    static ticking = false;

    static init() {

        this.header = document.querySelector("header");
        this.hero = document.getElementById("homeHero");

        if (!this.header) {
            return;
        }

        this.update();

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
    }

    static requestUpdate() {

        if (this.ticking) {
            return;
        }

        this.ticking = true;

        window.requestAnimationFrame(() => {
            this.update();
            this.ticking = false;
        });
    }

    static update() {

        if (!this.header) {
            return;
        }

        const heroIsAvailable =
            this.hero &&
            !this.hero.hidden &&
            this.hero.getClientRects().length > 0;

        const headerHeight =
            this.header.getBoundingClientRect().height;

        const heroBottom = heroIsAvailable
            ? this.hero.getBoundingClientRect().bottom
            : 0;

        const isOnHero =
            heroIsAvailable &&
            heroBottom > headerHeight + 24;

        this.header.classList.toggle(
            "header-on-hero",
            isOnHero
        );

        this.header.classList.toggle(
            "header-scrolled",
            !isOnHero
        );
    }
}

window.addEventListener(
    "DOMContentLoaded",
    () => HeaderTheme.init()
);
