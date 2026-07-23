class PhotoService {

    static photos = new Map();

    static getByCollection(collectionId) {

        return this.photos.get(
            String(collectionId)
        ) || [];

    }

    static async load(collectionId) {

        const id =
            String(collectionId);

        const response =
            await ApiService.getPhotos(id);

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

    static async upload(
        collectionId,
        file
    ) {

        const id =
            String(collectionId);

        if (!(file instanceof File)) {
            throw new Error(
                "Файл фотографии не выбран."
            );
        }

        if (
            !file.type.startsWith("image/")
        ) {
            throw new Error(
                "Можно загружать только изображения."
            );
        }

        const base64 =
            await this.fileToBase64(file);

        const response =
            await ApiService.uploadPhoto({

                collectionId: id,

                name: file.name,

                mimeType:
                    file.type ||
                    "image/jpeg",

                base64

            });

        const current =
            this.getByCollection(id);

        this.photos.set(
            id,
            [
                ...current,
                response.photo
            ]
        );

        return response.photo;

    }

    static async uploadMany(
        collectionId,
        files,
        onProgress = null
    ) {

        const imageFiles =
            Array.from(files || [])
                .filter(file =>
                    file.type.startsWith(
                        "image/"
                    )
                );

        const uploaded = [];

        for (
            let index = 0;
            index < imageFiles.length;
            index++
        ) {

            const photo =
                await this.upload(
                    collectionId,
                    imageFiles[index]
                );

            uploaded.push(photo);

            if (
                typeof onProgress ===
                "function"
            ) {

                onProgress({

                    completed:
                        index + 1,

                    total:
                        imageFiles.length,

                    file:
                        imageFiles[index],

                    photo

                });

            }

        }

        return uploaded;

    }

    static async remove(
        collectionId,
        photoId
    ) {

        const id =
            String(collectionId);

        await ApiService.deletePhoto(
            String(photoId)
        );

        const updated =
            this.getByCollection(id)
                .filter(photo =>
                    photo.id !==
                    String(photoId)
                );

        this.photos.set(
            id,
            updated
        );

    }

    static fileToBase64(file) {

        return new Promise(
            (resolve, reject) => {

                const reader =
                    new FileReader();

                reader.onload = () => {

                    const result =
                        String(
                            reader.result || ""
                        );

                    const commaIndex =
                        result.indexOf(",");

                    if (commaIndex === -1) {

                        reject(
                            new Error(
                                "Не удалось прочитать фотографию."
                            )
                        );

                        return;

                    }

                    resolve(
                        result.slice(
                            commaIndex + 1
                        )
                    );

                };

                reader.onerror = () => {

                    reject(
                        new Error(
                            `Не удалось прочитать файл ${file.name}.`
                        )
                    );

                };

                reader.readAsDataURL(file);

            }
        );

    }

}
