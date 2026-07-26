class ActivityService {

    static async load(limit = 8) {
        const response = await ApiService.getActivity(limit);

        return Array.isArray(response.activities)
            ? response.activities
            : [];
    }

    static async record(type, title, details = "") {
        try {
            await ApiService.logActivity({
                type: String(type || "update"),
                title: String(title || "Действие в Studio"),
                details: String(details || "")
            });
        } catch (error) {
            console.warn(
                "Не удалось записать действие в журнал:",
                error
            );
        }
    }

    static install() {
        this.wrapCollectionCreate();
        this.wrapCollectionUpdate();
        this.wrapCollectionRemove();
        this.wrapCollectionReorder();
        this.wrapCoverChange();
        this.wrapPhotoUpload();
        this.wrapPhotoRemove();
        this.wrapHeroChange();
    }

    static wrapCollectionCreate() {
        const original = CollectionService.create.bind(
            CollectionService
        );

        CollectionService.create = async function (name) {
            const collection = await original(name);

            ActivityService.record(
                "collection-create",
                `Создана коллекция «${collection.name || name}»`
            );

            return collection;
        };
    }

    static wrapCollectionUpdate() {
        const original = CollectionService.updateDetails.bind(
            CollectionService
        );

        CollectionService.updateDetails = async function (id, data) {
            const before = CollectionService.getById(id);
            const result = await original(id, data);
            const changes = [];

            if (
                Object.prototype.hasOwnProperty.call(data, "published") &&
                Boolean(data.published) !== Boolean(before?.published)
            ) {
                changes.push(
                    data.published ? "опубликована" : "скрыта"
                );
            }

            if (
                Object.prototype.hasOwnProperty.call(data, "size") &&
                String(data.size) !== String(before?.size || "medium")
            ) {
                changes.push(`размер: ${data.size}`);
            }

            const title = result?.name || data.name || before?.name || "Коллекция";

            ActivityService.record(
                "collection-update",
                `Изменена коллекция «${title}»`,
                changes.join(" · ")
            );

            return result;
        };
    }

    static wrapCollectionRemove() {
        const original = CollectionService.remove.bind(
            CollectionService
        );

        CollectionService.remove = async function (id) {
            const collection = CollectionService.getById(id);
            const result = await original(id);

            ActivityService.record(
                "collection-delete",
                `Удалена коллекция «${collection?.name || id}»`
            );

            return result;
        };
    }

    static wrapCollectionReorder() {
        const original = CollectionService.reorder.bind(
            CollectionService
        );

        CollectionService.reorder = async function (ids) {
            const result = await original(ids);

            ActivityService.record(
                "collection-order",
                "Изменён порядок коллекций",
                `${Array.isArray(ids) ? ids.length : 0} позиций`
            );

            return result;
        };
    }

    static wrapCoverChange() {
        const original = CollectionService.setCover.bind(
            CollectionService
        );

        CollectionService.setCover = async function (
            collectionId,
            photoId
        ) {
            const result = await original(
                collectionId,
                photoId
            );

            ActivityService.record(
                "cover-update",
                `Обновлена обложка «${result?.name || collectionId}»`
            );

            return result;
        };
    }

    static wrapPhotoUpload() {
        const original = PhotoService.upload.bind(PhotoService);

        PhotoService.upload = async function (collectionId, file) {
            const photo = await original(collectionId, file);
            const collection = CollectionService.getById(collectionId);

            ActivityService.record(
                "photo-upload",
                `Добавлена фотография в «${collection?.name || collectionId}»`,
                file?.name || ""
            );

            return photo;
        };
    }

    static wrapPhotoRemove() {
        const original = PhotoService.remove.bind(PhotoService);

        PhotoService.remove = async function (collectionId, photoId) {
            const collection = CollectionService.getById(collectionId);
            const result = await original(collectionId, photoId);

            ActivityService.record(
                "photo-delete",
                `Удалена фотография из «${collection?.name || collectionId}»`
            );

            return result;
        };
    }

    static wrapHeroChange() {
        const original = SiteSettingsService.setHeroCollection.bind(
            SiteSettingsService
        );

        SiteSettingsService.setHeroCollection = async function (
            collectionId
        ) {
            const result = await original(collectionId);
            const collection = CollectionService.getById(collectionId);

            ActivityService.record(
                "hero-update",
                `Hero переключён на «${collection?.name || collectionId}»`
            );

            return result;
        };
    }

}

ActivityService.install();
