class PhotoService {

    static photos = new Map();

    static getByCollection(collectionId) {

        return this.photos.get(collectionId) || [];

    }

    static addFiles(collectionId, files) {

        const collectionPhotos =
            this.getByCollection(collectionId);

        const newPhotos = Array.from(files)
            .filter(file => file.type.startsWith("image/"))
            .map(file => ({

                id:
                    `${Date.now()}-${crypto.randomUUID()}`,

                name: file.name,

                type: file.type,

                size: file.size,

                file,

                previewUrl: URL.createObjectURL(file),

                createdAt: new Date().toISOString()

            }));

        this.photos.set(

            collectionId,

            [
                ...collectionPhotos,
                ...newPhotos
            ]

        );

        return newPhotos;

    }

    static remove(collectionId, photoId) {

        const collectionPhotos =
            this.getByCollection(collectionId);

        const photo = collectionPhotos.find(
            item => item.id === photoId
        );

        if (photo?.previewUrl) {

            URL.revokeObjectURL(photo.previewUrl);

        }

        const updatedPhotos =
            collectionPhotos.filter(
                item => item.id !== photoId
            );

        this.photos.set(
            collectionId,
            updatedPhotos
        );

    }

    static clearCollection(collectionId) {

        const collectionPhotos =
            this.getByCollection(collectionId);

        collectionPhotos.forEach(photo => {

            if (photo.previewUrl) {

                URL.revokeObjectURL(
                    photo.previewUrl
                );

            }

        });

        this.photos.delete(collectionId);

    }

}
