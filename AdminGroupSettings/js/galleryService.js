class GalleryService {

    static collections = [];

    static photos = new Map();

    static async loadCollections() {

        const response =
            await SiteApi.getCollections();

        this.collections =
            Array.isArray(
                response.collections
            )
                ? response.collections
                    .filter(
                        collection =>
                            collection.published
                    )
                : [];

        return this.collections;

    }

    static async loadPhotos(
        collectionId
    ) {

        const id =
            String(collectionId);

        const response =
            await SiteApi.getPhotos(id);

        const photos =
            Array.isArray(response.photos)
                ? response.photos
                : [];

        this.photos.set(
            id,
            photos
        );

        return photos;

    }

    static getCollections() {

        return this.collections;

    }

    static getPhotos(collectionId) {

        return this.photos.get(
            String(collectionId)
        ) || [];

    }

}
