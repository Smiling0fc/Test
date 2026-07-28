(() => {
    const imageUrl = (fileId, width) =>
        GalleryService.getThumbnailUrl(fileId, width);

    const previewId = photo => String(
        photo.previewFileId || photo.fileId || ""
    );

    const galleryId = photo => String(
        photo.galleryFileId || photo.previewFileId || photo.fileId || ""
    );

    Gallery.renderRegularPhoto = function (photo) {
        const smallId = previewId(photo);
        const largeId = galleryId(photo);

        return `
            <figure
                class="public-photo"
                data-photo-id="${photo.id}"
                data-file-id="${photo.fileId}"
                data-photo-name="${this.escapeHtml(photo.name)}"
                tabindex="0"
                role="button">
                <img
                    src="${imageUrl(smallId, 800)}"
                    srcset="
                        ${imageUrl(smallId, 800)} 800w,
                        ${imageUrl(largeId, 1600)} 1600w
                    "
                    sizes="
                        (max-width: 700px) 100vw,
                        (max-width: 1200px) 50vw,
                        33vw
                    "
                    alt="${this.escapeHtml(photo.name)}"
                    loading="lazy"
                    decoding="async">
            </figure>
        `;
    };

    Gallery.renderStoryPhoto = function (photo) {
        const layout = photo.layout === "story-right"
            ? "story-right"
            : "story-left";
        const largeId = galleryId(photo);

        return `
            <article class="photo-story ${layout}">
                <figure
                    class="public-photo photo-story-image"
                    data-photo-id="${photo.id}"
                    data-file-id="${photo.fileId}"
                    data-photo-name="${this.escapeHtml(photo.name)}"
                    tabindex="0"
                    role="button">
                    <img
                        src="${imageUrl(largeId, 1600)}"
                        alt="${this.escapeHtml(photo.name)}"
                        loading="lazy"
                        decoding="async">
                </figure>
                <div class="photo-story-text">
                    <span class="photo-story-label">История кадра</span>
                    <p>${this.escapeHtml(photo.description)}</p>
                </div>
            </article>
        `;
    };

    const originalUpdateCollectionCard =
        Gallery.updateCollectionCard.bind(Gallery);

    Gallery.updateCollectionCard = function (collectionId) {
        originalUpdateCollectionCard(collectionId);

        const collection = GalleryService.getCollectionById(collectionId);
        const photos = GalleryService.getPhotos(collectionId);
        const card = this.container?.querySelector(
            `.collection-card[data-collection-id="${CSS.escape(String(collectionId))}"]`
        );

        if (!collection || !card) {
            return;
        }

        const cover = photos.find(photo =>
            String(photo.id) === String(collection.coverPhotoId || "")
        ) || photos[0] || null;

        if (!cover) {
            return;
        }

        const image = card.querySelector(".collection-cover img");
        const smallId = previewId(cover);
        const largeId = galleryId(cover);

        if (image) {
            image.src = imageUrl(smallId, 800);
            image.srcset = [
                `${imageUrl(smallId, 800)} 800w`,
                `${imageUrl(largeId, 1600)} 1600w`
            ].join(", ");
        }
    };
})();
