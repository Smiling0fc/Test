class HomePage {

    static render(collections) {

        const hero =
            document.getElementById("homeHero");

        const featured =
            document.getElementById(
                "featuredCollection"
            );

        if (!hero || !featured) {
            return;
        }

        const collection =
            collections[0] || null;

        if (!collection) {
            hero.hidden = true;
            featured.hidden = true;
            return;
        }

        const photos =
            GalleryService.getPhotos(
                collection.id
            );

        const cover =
            photos.find(photo =>
                String(photo.id) ===
                String(
                    collection.coverPhotoId || ""
                )
            ) || photos[0] || null;

        if (!cover) {
            hero.hidden = true;
            featured.hidden = true;
            return;
        }

        const imageUrl =
            GalleryService.getThumbnailUrl(
                cover.fileId,
                2200
            );

        hero.hidden = false;
        hero.style.setProperty(
            "--hero-image",
            `url("${imageUrl}")`
        );

        featured.hidden = false;
        featured.innerHTML = `
            <div class="featured-copy">
                <span class="featured-kicker">
                    Последняя коллекция
                </span>

                <h2>
                    ${Gallery.escapeHtml(
                        collection.name
                    )}
                </h2>

                <p>
                    ${photos.length}
                    ${Gallery.getPhotoWord(
                        photos.length
                    )}
                </p>

                <button
                    class="featured-open"
                    type="button"
                    data-collection-id="${collection.id}">
                    Открыть историю
                    <span aria-hidden="true">→</span>
                </button>
            </div>

            <button
                class="featured-image"
                type="button"
                data-collection-id="${collection.id}"
                aria-label="Открыть коллекцию ${Gallery.escapeHtml(
                    collection.name
                )}">

                <img
                    src="${imageUrl}"
                    alt="${Gallery.escapeHtml(
                        collection.name
                    )}">
            </button>
        `;

        document
            .querySelectorAll(
                "[data-collection-id]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => Gallery.openCollection(
                        button.dataset.collectionId
                    )
                );

            });
    }
}
