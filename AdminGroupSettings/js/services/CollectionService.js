class CollectionService {

    static collections = [];

    static getAll() {

        return this.collections;

    }

    static getById(id) {

        return this.collections.find(
            collection =>
                collection.id === String(id)
        ) || null;

    }

    static async load() {

        const response =
            await ApiService.getCollections();

        this.collections =
            Array.isArray(response.collections)
                ? response.collections.map(
                    collection => ({
                        ...collection,
                        photos: []
                    })
                )
                : [];

        return this.collections;

    }

    static async create(name) {

        const trimmed =
            String(name || "").trim();

        if (!trimmed) {
            throw new Error(
                "Введите название коллекции."
            );
        }

        const response =
            await ApiService.createCollection({
                name: trimmed,
                size: "medium",
                published: true
            });

        const collection = {
            ...response.collection,
            photos: []
        };

        this.collections.push(collection);

        this.sort();

        return collection;

    }

    static async rename(id, newName) {

        const trimmed =
            String(newName || "").trim();

        if (!trimmed) {
            throw new Error(
                "Введите новое название."
            );
        }

        const response =
            await ApiService.updateCollection(
                String(id),
                {
                    name: trimmed
                }
            );

        const index =
            this.collections.findIndex(
                collection =>
                    collection.id === String(id)
            );

        if (index !== -1) {

            this.collections[index] = {
                ...this.collections[index],
                ...response.collection
            };

        }

        return response.collection;

    }
static async updateDetails(
    id,
    data
) {

    const collectionId =
        String(id);

    const name =
        String(
            data.name || ""
        ).trim();

    const description =
        String(
            data.description || ""
        ).trim();

    if (!name) {
        throw new Error(
            "Введите название коллекции."
        );
    }

    const response =
        await ApiService.updateCollection(
            collectionId,
            {
                name,
                description
            }
        );

    const updatedCollection =
        response.collection;

    const index =
        this.collections.findIndex(
            collection =>
                collection.id ===
                collectionId
        );

    if (index !== -1) {

        this.collections[index] = {
            ...this.collections[index],
            ...updatedCollection
        };

    }

    return updatedCollection;

}
    static async remove(id) {

        const collectionId = String(id);

        await ApiService.deleteCollection(
            collectionId
        );

        this.collections =
            this.collections.filter(
                collection =>
                    collection.id !== collectionId
            );

    }
static async setCover(
    collectionId,
    photoId
) {

    const id =
        String(collectionId);

    const coverPhotoId =
        String(photoId);

    const response =
        await ApiService
            .setCollectionCover(
                id,
                coverPhotoId
            );

    const collection =
        this.getById(id);

    if (collection) {

        collection.coverPhotoId =
            String(
                response.coverPhotoId ||
                coverPhotoId
            );

    }

    return collection;

}
    static sort() {

        this.collections.sort(
            (a, b) =>
                Number(a.order || 0) -
                Number(b.order || 0)
        );

    }

}
