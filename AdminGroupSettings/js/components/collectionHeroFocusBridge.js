(() => {
    const ensureHeroFocusButton = () => {
        if (
            typeof CollectionHeroFocus === "undefined" ||
            typeof CollectionView === "undefined"
        ) {
            return;
        }

        const view = document.querySelector(".collection-view");
        const actions = view?.querySelector(".collection-view-actions");
        const collectionId = String(
            CollectionView.currentId || ""
        ).trim();

        if (!view || !actions || !collectionId) {
            return;
        }

        CollectionHeroFocus.mount(collectionId);
    };

    const observer = new MutationObserver(() => {
        ensureHeroFocusButton();
    });

    const start = () => {
        const content = document.getElementById("content");

        if (!content) {
            return;
        }

        observer.observe(content, {
            childList: true,
            subtree: true
        });

        ensureHeroFocusButton();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, {
            once: true
        });
    } else {
        start();
    }
})();