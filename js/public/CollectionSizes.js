(() => {

    const originalRenderCollections =
        Gallery.renderCollections.bind(Gallery);

    Gallery.renderCollections = function () {

        originalRenderCollections();

        if (
            !this.container ||
            !this.container.classList.contains("collections")
        ) {
            return;
        }

        const collections =
            GalleryService.getCollections();

        const collectionMap = new Map(
            collections.map(collection => [
                String(collection.id),
                collection
            ])
        );

        this.container
            .querySelectorAll(".collection-card")
            .forEach(card => {

                const collection = collectionMap.get(
                    String(card.dataset.collectionId || "")
                );

                if (!collection) {
                    return;
                }

                const size = Gallery.normalizeSize(
                    String(collection.size || "medium")
                );

                card.classList.remove(
                    "small",
                    "medium",
                    "large"
                );

                card.classList.add(size);
                card.dataset.size = size;

            });

    };

})();
