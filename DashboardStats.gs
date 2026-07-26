function getDashboardStats() {

    const collectionsSheet = getSheet(
        CONFIG.collectionsSheet
    );
    const photosSheet = getSheet(
        CONFIG.photosSheet
    );

    const collectionRows = collectionsSheet
        .getDataRange()
        .getValues()
        .slice(1)
        .filter(row => row[0]);

    const photoRows = photosSheet
        .getDataRange()
        .getValues()
        .slice(1)
        .filter(row => row[0]);

    const photoCountByCollection = new Map();

    photoRows.forEach(row => {
        const collectionId = String(row[1] || "");

        if (!collectionId) {
            return;
        }

        photoCountByCollection.set(
            collectionId,
            (photoCountByCollection.get(collectionId) || 0) + 1
        );
    });

    const publishedRows = collectionRows.filter(
        row => normalizeBoolean(row[5])
    );

    const withoutCover = collectionRows.filter(
        row => !String(row[6] || "").trim()
    ).length;

    const withoutDescription = collectionRows.filter(
        row => !String(row[7] || "").trim()
    ).length;

    const emptyPublished = publishedRows.filter(row => {
        const collectionId = String(row[0] || "");

        return !photoCountByCollection.get(collectionId);
    }).length;

    let driveOk = false;

    try {
        const rootFolder = DriveApp.getFolderById(
            CONFIG.rootFolderId
        );
        rootFolder.getName();
        driveOk = true;
    } catch (error) {
        driveOk = false;
    }

    return {
        collections: collectionRows.length,
        published: publishedRows.length,
        hidden:
            collectionRows.length - publishedRows.length,
        photos: photoRows.length,
        withoutCover,
        withoutDescription,
        emptyPublished,
        sheetsOk: true,
        driveOk
    };
}
