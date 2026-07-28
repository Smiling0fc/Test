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
                published: true,
                category: "",
                shootDate: "",
                location: ""
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

        return this.updateDetails(
            id,
            {
                name: trimmed,
                description:
                    this.getById(id)?.description || ""
            }
        );
    }

    static async updateDetails(id, data) {
        const collectionId = String(id);
        const current = this.getById(collectionId);

        const name = String(
            data.name ?? current?.name ?? ""
        ).trim();

        const description = String(
            data.description ??
            current?.description ??
            ""
        ).trim();

        const category = String(
            data.category ??
            current?.category ??
            ""
        ).trim();

        const shootDate = String(
            data.shootDate ??
            current?.shootDate ??
            ""
        ).trim();

        const location = String(
            data.location ??
            current?.location ??
            ""
        ).trim();

        if (!name) {
            throw new Error(
                "Введите название коллекции."
            );
        }

        const payload = {
            name,
            description,
            category,
            shootDate,
            location
        };

        if (
            Object.prototype.hasOwnProperty.call(
                data,
                "size"
            )
        ) {
            payload.size = [
                "small",
                "medium",
                "large"
            ].includes(String(data.size))
                ? String(data.size)
                : "medium";
        }

        if (
            Object.prototype.hasOwnProperty.call(
                data,
                "published"
            )
        ) {
            payload.published =
                Boolean(data.published);
        }

        const response =
            await ApiService.updateCollection(
                collectionId,
                payload
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
                ...payload,
                ...updatedCollection
            };
        }

        return this.collections[index] || updatedCollection;
    }

    static async reorder(collectionIds) {

        const ids = Array.isArray(collectionIds)
            ? collectionIds
                .map(id => String(id || "").trim())
                .filter(Boolean)
            : [];

        const currentIds = this.collections.map(
            collection => String(collection.id)
        );

        const uniqueIds = [
            ...new Set(ids)
        ];

        const validOrder =
            uniqueIds.length === currentIds.length &&
            uniqueIds.every(id =>
                currentIds.includes(id)
            );

        if (!validOrder) {
            throw new Error(
                "Порядок коллекций устарел. Обновите Studio и повторите попытку."
            );
        }

        const photosById = new Map(
            this.collections.map(collection => [
                String(collection.id),
                Array.isArray(collection.photos)
                    ? collection.photos
                    : []
            ])
        );

        const response =
            await ApiService.reorderCollections(ids);

        if (Array.isArray(response.collections)) {
            this.collections = response.collections.map(
                collection => ({
                    ...collection,
                    photos:
                        photosById.get(
                            String(collection.id)
                        ) || []
                })
            );
        } else {
            const orderById = new Map(
                ids.map((id, index) => [
                    id,
                    index + 1
                ])
            );

            this.collections.forEach(collection => {
                collection.order = orderById.get(
                    String(collection.id)
                );
            });

            this.sort();
        }

        return this.collections;
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
        const id = String(collectionId);
        const coverPhotoId = String(photoId);

        const response =
            await ApiService.setCollectionCover(
                id,
                coverPhotoId
            );

        const collection = this.getById(id);

        if (collection) {
            collection.coverPhotoId = String(
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
