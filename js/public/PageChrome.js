class PageChrome {
    static header = null;
    static button = null;
    static ticking = false;

    static init() {
        this.header = document.querySelector("header");
        this.createBackToTop();
        this.bind();
        this.update();
    }

    static createBackToTop() {
        this.button = document.createElement("button");
        this.button.className = "page-back-to-top";
        this.button.type = "button";
        this.button.setAttribute("aria-label", "Наверх");
        this.button.setAttribute("title", "Наверх");
        document.body.appendChild(this.button);
    }

    static bind() {
        window.addEventListener("scroll", () => {
            if (this.ticking) {
                return;
            }

            this.ticking = true;

            requestAnimationFrame(() => {
                this.update();
                this.ticking = false;
            });
        }, { passive: true });

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

    static update() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const headerScrolled = scrollTop > 42;
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
