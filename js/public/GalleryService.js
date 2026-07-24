class GalleryService {

    static collections = [];

    static photos = new Map();

    static async loadCollections() {

        const response =
            await PublicApi.getCollections();

        const collections =
            Array.isArray(
                response.collections
            )
                ? response.collections
                : [];

        this.collections =
            collections
                .filter(collection =>
                    collection.published === true
                )
                .sort(
                    (a, b) =>
                        Number(a.order || 0) -
                        Number(b.order || 0)
                );

        return this.collections;

    }

    static async loadPhotos(
        collectionId
    ) {

        const id =
            String(collectionId);

        const response =
            await PublicApi.getPhotos(id);

        const photos =
            Array.isArray(response.photos)
                ? response.photos
                : [];

        photos.sort(
            (a, b) =>
                Number(a.order || 0) -
                Number(b.order || 0)
        );

        this.photos.set(
            id,
            photos
        );

        return photos;

    }

    static getCollections() {

        return this.collections;

    }

    static getCollectionById(id) {

        return this.collections.find(
            collection =>
                collection.id === String(id)
        ) || null;

    }

    static getPhotos(collectionId) {

        return this.photos.get(
            String(collectionId)
        ) || [];

    }

    static getThumbnailUrl(
        fileId,
        width = PUBLIC_CONFIG.imageSizes.card
    ) {

        return (
            "https://lh3.googleusercontent.com/d/" +
            encodeURIComponent(fileId) +
            `=w${width}`
        );

    }

}
