class PhotoOrderService {
    static async save(collectionId, photoIds) {
        const id = String(collectionId || "").trim();
        const ids = Array.from(photoIds || [])
            .map(value => String(value || "").trim())
            .filter(Boolean);

        if (!id || !ids.length) {
            throw new Error("Не удалось определить порядок фотографий.");
        }

        const response = await ApiService.post("reorderPhotos", {
            collectionId: id,
            photoIds: ids
        });

        const photos = Array.isArray(response.photos)
            ? response.photos
            : [];

        PhotoService.photos.set(id, photos);
        return photos;
    }
}
