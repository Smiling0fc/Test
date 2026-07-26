(() => {

    const labels = {
        small: "Компактная",
        medium: "Средняя",
        large: "Крупная"
    };

    const normalizeSize = value => {
        const size = String(value || "medium");

        return [
            "small",
            "medium",
            "large"
        ].includes(size)
            ? size
            : "medium";
    };

    const originalRenderList =
        Collections.renderList.bind(Collections);

    Collections.renderList = function (collections) {

        originalRenderList(collections);

        const container = document.getElementById(
            "collectionsContainer"
        );

        if (!container) {
            return;
        }

        const collectionMap = new Map(
            collections.map(collection => [
                String(collection.id),
                collection
            ])
        );

        container
            .querySelectorAll(".collection-card")
            .forEach(card => {

                const collection = collectionMap.get(
                    String(card.dataset.id || "")
                );

                if (!collection) {
                    return;
                }

                const size = normalizeSize(
                    collection.size
                );

                card.classList.remove(
                    "size-small",
                    "size-medium",
                    "size-large"
                );

                card.classList.add(
                    `size-${size}`
                );

                const copy = card.firstElementChild;

                if (!copy) {
                    return;
                }

                copy
                    .querySelector(
                        ".collection-card-meta"
                    )
                    ?.remove();

                const meta = document.createElement(
                    "div"
                );

                meta.className =
                    "collection-card-meta";

                meta.innerHTML = `
                    <span class="collection-size-badge">
                        ${labels[size]}
                    </span>

                    ${collection.published === false
                        ? `
                            <span class="collection-draft-badge">
                                Скрыта
                            </span>
                        `
                        : ""
                    }
                `;

                copy.appendChild(meta);

            });

    };

})();
