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

        const heroImageUrl =
            GalleryService.getThumbnailUrl(
                cover.fileId,
                2200
            );

        const featuredImageUrl =
            GalleryService.getThumbnailUrl(
                cover.fileId,
                1000
            );

        const description =
            String(
                collection.description || ""
            ).trim();

        hero.hidden = false;
        hero.style.setProperty(
            "--hero-image",
            `url("${heroImageUrl}")`
        );

        featured.hidden = false;
        featured.innerHTML = `
            <div class="featured-marker" aria-hidden="true">
                <span></span>
                <i></i>
                <small>LATEST STORY</small>
            </div>

            <div class="featured-copy">
                <span class="featured-kicker">
                    Последняя коллекция
                </span>

                <h2>
                    ${Gallery.escapeHtml(
                        collection.name
                    )}
                </h2>

                ${description
                    ? `
                        <p class="featured-description">
                            ${Gallery.escapeHtml(
                                description
                            )}
                        </p>
                    `
                    : `
                        <p class="featured-description">
                            Новая история в кадрах, настроении
                            и деталях момента.
                        </p>
                    `
                }

                <span class="featured-count">
                    ${photos.length}
                    ${Gallery.getPhotoWord(
                        photos.length
                    )}
                </span>

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
                    src="${featuredImageUrl}"
                    alt="${Gallery.escapeHtml(
                        collection.name
                    )}"
                    loading="lazy"
                    decoding="async">
            </button>
        `;

        featured
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