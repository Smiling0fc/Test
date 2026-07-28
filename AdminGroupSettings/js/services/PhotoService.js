class PhotoService {

    static photos = new Map();

    static variants = [
        {
            key: "preview800",
            width: 800,
            quality: 0.78
        },
        {
            key: "gallery1600",
            width: 1600,
            quality: 0.84
        }
    ];

    static getByCollection(collectionId) {
        return this.photos.get(
            String(collectionId)
        ) || [];
    }

    static async load(collectionId) {
        const id = String(collectionId);
        const response = await ApiService.getPhotos(id);
        const photos = Array.isArray(response.photos)
            ? response.photos
            : [];

        this.photos.set(id, photos);
        return photos;
    }

    static async upload(collectionId, file) {
        const id = String(collectionId);

        if (!(file instanceof File)) {
            throw new Error(
                "Файл фотографии не выбран."
            );
        }

        if (!file.type.startsWith("image/")) {
            throw new Error(
                "Можно загружать только изображения."
            );
        }

        const [originalBase64, optimized] =
            await Promise.all([
                this.fileToBase64(file),
                this.createOptimizedVariants(file)
            ]);

        const preview = optimized.preview800 || {};
        const gallery = optimized.gallery1600 || {};

        const response = await ApiService.uploadPhoto({
            collectionId: id,
            name: file.name,
            mimeType: file.type || "image/jpeg",
            base64: originalBase64,
            previewBase64: preview.base64 || "",
            galleryBase64: gallery.base64 || ""
        });

        const current = this.getByCollection(id);
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
        const imageFiles = Array.from(files || [])
            .filter(file =>
                file.type.startsWith("image/")
            );

        const uploaded = [];

        for (
            let index = 0;
            index < imageFiles.length;
            index++
        ) {
            if (typeof onProgress === "function") {
                onProgress({
                    completed: index,
                    total: imageFiles.length,
                    file: imageFiles[index],
                    stage: "preparing",
                    photo: null
                });
            }

            const photo = await this.upload(
                collectionId,
                imageFiles[index]
            );

            uploaded.push(photo);

            if (typeof onProgress === "function") {
                onProgress({
                    completed: index + 1,
                    total: imageFiles.length,
                    file: imageFiles[index],
                    stage: "uploaded",
                    photo
                });
            }
        }

        return uploaded;
    }

    static async createOptimizedVariants(file) {
        const source = await this.loadImageSource(file);

        try {
            const variants = {};

            for (const definition of this.variants) {
                const blob = await this.resizeToWebp(
                    source,
                    definition.width,
                    definition.quality
                );

                variants[definition.key] = {
                    name: this.buildVariantName(
                        file.name,
                        definition.width
                    ),
                    mimeType: "image/webp",
                    width: definition.width,
                    base64: await this.blobToBase64(blob)
                };
            }

            return variants;
        } finally {
            if (
                typeof ImageBitmap !== "undefined" &&
                source instanceof ImageBitmap
            ) {
                source.close();
            }
        }
    }

    static async loadImageSource(file) {
        if (typeof createImageBitmap === "function") {
            return createImageBitmap(file, {
                imageOrientation: "from-image"
            });
        }

        return new Promise((resolve, reject) => {
            const image = new Image();
            const url = URL.createObjectURL(file);

            image.onload = () => {
                URL.revokeObjectURL(url);
                resolve(image);
            };

            image.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error(
                    `Не удалось подготовить ${file.name}.`
                ));
            };

            image.src = url;
        });
    }

    static resizeToWebp(source, maxWidth, quality) {
        const sourceWidth = Number(
            source.width || source.naturalWidth || 0
        );
        const sourceHeight = Number(
            source.height || source.naturalHeight || 0
        );

        if (!sourceWidth || !sourceHeight) {
            throw new Error(
                "Не удалось определить размер фотографии."
            );
        }

        const scale = Math.min(
            1,
            maxWidth / sourceWidth
        );
        const width = Math.max(
            1,
            Math.round(sourceWidth * scale)
        );
        const height = Math.max(
            1,
            Math.round(sourceHeight * scale)
        );

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d", {
            alpha: false
        });

        if (!context) {
            throw new Error(
                "Браузер не поддерживает обработку фотографий."
            );
        }

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(
            source,
            0,
            0,
            width,
            height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob(
                blob => {
                    if (blob) {
                        resolve(blob);
                        return;
                    }

                    reject(new Error(
                        "Не удалось создать WebP-превью."
                    ));
                },
                "image/webp",
                quality
            );
        });
    }

    static buildVariantName(fileName, width) {
        const base = String(fileName || "photo")
            .replace(/\.[^.]+$/, "")
            .replace(/[^a-zа-яё0-9_-]+/gi, "-")
            .replace(/^-+|-+$/g, "") || "photo";

        return `${base}-${width}.webp`;
    }

    static getById(collectionId, photoId) {
        return this
            .getByCollection(collectionId)
            .find(photo =>
                String(photo.id) ===
                String(photoId)
            ) || null;
    }

    static async update(
        collectionId,
        photoId,
        data
    ) {
        const collectionKey = String(collectionId);
        const id = String(photoId);
        const response = await ApiService.updatePhoto(
            id,
            data
        );
        const updatedPhoto = response.photo;
        const photos = this.getByCollection(
            collectionKey
        );
        const index = photos.findIndex(photo =>
            String(photo.id) === id
        );

        if (index !== -1) {
            photos[index] = {
                ...photos[index],
                ...updatedPhoto
            };
            this.photos.set(
                collectionKey,
                photos
            );
        }

        return updatedPhoto;
    }

    static async remove(collectionId, photoId) {
        const id = String(collectionId);

        await ApiService.deletePhoto(
            String(photoId)
        );

        const updated = this.getByCollection(id)
            .filter(photo =>
                photo.id !== String(photoId)
            );

        this.photos.set(id, updated);
    }

    static fileToBase64(file) {
        return this.blobToBase64(file);
    }

    static blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                const result = String(
                    reader.result || ""
                );
                const commaIndex = result.indexOf(",");

                if (commaIndex === -1) {
                    reject(new Error(
                        "Не удалось прочитать фотографию."
                    ));
                    return;
                }

                resolve(
                    result.slice(commaIndex + 1)
                );
            };

            reader.onerror = () => {
                reject(new Error(
                    "Не удалось прочитать файл."
                ));
            };

            reader.readAsDataURL(blob);
        });
    }
}