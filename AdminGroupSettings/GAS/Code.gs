/* ==================================================
   Photographer CMS API
   Version: 0.3.2
================================================== */

const CONFIG = {
    collectionsSheet: "Collections",
    photosSheet: "Photos",

    // Вставь ID папки Photographer CMS на Google Drive.
    rootFolderId: "1R_-PsIEbj9Ua-_mCIHv8-SJjEC0M8c2w",

    collectionsFolderName: "collections"
};


/* ==================================================
   HTTP
================================================== */

function doGet(e) {

    try {

        const action = String(
            e?.parameter?.action || ""
        ).trim();

        switch (action) {

            case "getCollections":
                return jsonResponse({
                    success: true,
                    collections: getCollections()
                });

            case "getPhotos":
                return jsonResponse({
                    success: true,
                    photos: getPhotos(
                        String(e.parameter.collectionId || "")
                    )
                });

            case "health":
                return jsonResponse({
                    success: true,
                    service: "Photographer CMS API",
                    version: "0.3.2",
                    timestamp: new Date().toISOString()
                });

            case "getSiteSettings":
                return jsonResponse({
                    success: true,
                    settings: getSiteSettings()
                });

            case "getDashboardStats":
                return jsonResponse({
                    success: true,
                    stats: getDashboardStats()
                });
  
            case "getActivity":
                return jsonResponse({
                    success: true,
                    activities: getActivity(e.parameter.limit)
                });

            case "getSiteAppearance":
                return jsonResponse({
                    success: true,
                    appearance: getSiteAppearance()
                });

            default:
                return jsonResponse({
                    success: false,
                    error: "Unknown GET action"
                });
        }

    } catch (error) {

        return errorResponse(error);

    }

}


function doPost(e) {

    try {

        const body = parseRequestBody(e);
        const action = String(
            body.action || ""
        ).trim();

        switch (action) {

            case "createCollection":
                return jsonResponse({
                    success: true,
                    collection:
                        createCollection(body)
                });

            case "updateCollection":
                return jsonResponse({
                    success: true,
                    collection:
                        updateCollection(body)
                });

            case "deleteCollection":
                deleteCollection(
                    String(
                        body.collectionId || ""
                    )
                );

                return jsonResponse({
                    success: true
                });

            case "uploadPhoto":
                return jsonResponse({
                    success: true,
                    photo:
                        uploadPhoto(body)
                });

            case "deletePhoto":
                deletePhoto(
                    String(
                        body.photoId || ""
                    )
                );

                return jsonResponse({
                    success: true
                });

            case "setCollectionCover":
                return jsonResponse(
                    setCollectionCover(body)
                );
                case "updatePhoto":
          
                return jsonResponse({
                    success: true,
                    photo: updatePhoto(body)
                });

            case "updateSiteSettings":
                return jsonResponse(
                    updateSiteSettings(body)
                );

                case "reorderCollections":
                return jsonResponse({
                    success: true,
                    collections:
                    reorderCollections(body)
                });

            case "logActivity":
               return jsonResponse({
                    success: true,
                    activity: logActivity(body)
                });

            case "updateSiteAppearance":
                return jsonResponse({
                    success: true,
                    appearance: updateSiteAppearance(body)
                });

            default:
                return jsonResponse({
                    success: false,
                    error:
                   `Unknown POST action: "${action}"`
                });

            }

    } catch (error) {

        return errorResponse(error);

    }

}


/* ==================================================
   Collections
================================================== */

function getCollections() {

    const sheet = getSheet(
        CONFIG.collectionsSheet
    );

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
        return [];
    }

    const values = sheet
        .getDataRange()
        .getValues()
        .slice(1);

    return values
        .filter(row => row[0])
        .map(row => ({

            id: String(row[0]),

            name: String(row[1]),

            createdAt:
                normalizeDate(row[2]),

            order:
                Number(row[3]) || 0,

            size:
                String(row[4] || "medium"),

            published:
                normalizeBoolean(row[5]),

            coverPhotoId:
                String(row[6] || ""),

            description:
                String(row[7] || "")

        }))
        .sort((a, b) => a.order - b.order);

}


function createCollection(data) {

    const name = String(data.name || "").trim();

    if (!name) {
        throw new Error(
            "Название коллекции обязательно."
        );
    }

    const existingCollections =
        getCollections();

    const duplicate =
        existingCollections.some(
            collection =>
                collection.name
                    .toLowerCase() ===
                name.toLowerCase()
        );

    if (duplicate) {
        throw new Error(
            "Коллекция с таким названием уже существует."
        );
    }

    const id = Utilities.getUuid();
    const createdAt = new Date();

    const maxOrder =
        existingCollections.reduce(
            (maximum, collection) =>
                Math.max(
                    maximum,
                    collection.order
                ),
            0
        );

    const collection = {

        id,

        name,

        createdAt:
            createdAt.toISOString(),

        order:
            maxOrder + 1,

        size:
            normalizeCardSize(data.size),

        published:
            data.published !== false,
        description:
            String(
                data.description || ""
        ).trim()    

    };

    const sheet = getSheet(
        CONFIG.collectionsSheet
    );

    sheet.appendRow([

        collection.id,
        collection.name,
        createdAt,
        collection.order,
        collection.size,
        collection.published,
        "",
        collection.description
    ]);

    const collectionsFolder =
        getCollectionsRootFolder();

    collectionsFolder.createFolder(id);

    return collection;

}
function updateCollection(data) {

    const collectionId =
        String(
            data.collectionId || ""
        ).trim();

    if (!collectionId) {
        throw new Error(
            "Не указан ID коллекции."
        );
    }

    const sheet = getSheet(
        CONFIG.collectionsSheet
    );

    const lastRow =
        sheet.getLastRow();

    if (lastRow < 2) {
        throw new Error(
            "Коллекция не найдена."
        );
    }

    const values =
        sheet
            .getDataRange()
            .getValues()
            .slice(1);

    const index =
        values.findIndex(
            row =>
                String(row[0]) ===
                collectionId
        );

    if (index === -1) {
        throw new Error(
            "Коллекция не найдена."
        );
    }

    const currentRow =
        values[index];

    const hasName =
        Object.prototype
            .hasOwnProperty
            .call(data, "name");

    const hasDescription =
        Object.prototype
            .hasOwnProperty
            .call(data, "description");

    const hasSize =
        Object.prototype
            .hasOwnProperty
            .call(data, "size");

    const hasPublished =
        Object.prototype
            .hasOwnProperty
            .call(data, "published");

    const name =
        hasName
            ? String(
                data.name || ""
            ).trim()
            : String(
                currentRow[1] || ""
            ).trim();

    const description =
        hasDescription
            ? String(
                data.description || ""
            ).trim()
            : String(
                currentRow[7] || ""
            ).trim();

    const size =
        hasSize
            ? normalizeCardSize(
                data.size
            )
            : String(
                currentRow[4] ||
                "medium"
            );

    const published =
        hasPublished
            ? normalizeBoolean(
                data.published
            )
            : normalizeBoolean(
                currentRow[5]
            );

    if (!name) {
        throw new Error(
            "Название коллекции обязательно."
        );
    }

    const collections =
        getCollections();

    const duplicate =
        collections.some(
            collection =>
                collection.id !==
                    collectionId &&
                collection.name
                    .toLowerCase() ===
                name.toLowerCase()
        );

    if (duplicate) {
        throw new Error(
            "Коллекция с таким названием уже существует."
        );
    }

    const updatedCollection = {

        id:
            collectionId,

        name,

        createdAt:
            normalizeDate(
                currentRow[2]
            ),

        order:
            Number(
                currentRow[3]
            ) || 0,

        size,

        published,

        coverPhotoId:
            String(
                currentRow[6] || ""
            ),

        description

    };

    const rowNumber =
        index + 2;

    sheet
        .getRange(
            rowNumber,
            2,
            1,
            7
        )
        .setValues([[
            updatedCollection.name,
            currentRow[2],
            updatedCollection.order,
            updatedCollection.size,
            updatedCollection.published,
            updatedCollection.coverPhotoId,
            updatedCollection.description
        ]]);

    return updatedCollection;

}

function deleteCollection(collectionId) {

    if (!collectionId) {
        throw new Error(
            "Не указан ID коллекции."
        );
    }

    const sheet = getSheet(
        CONFIG.collectionsSheet
    );

    const lastRow = sheet.getLastRow();

    if (lastRow >= 2) {

        const ids = sheet
            .getRange(
                2,
                1,
                lastRow - 1,
                1
            )
            .getValues();

        for (
            let index = ids.length - 1;
            index >= 0;
            index--
        ) {

            if (
                String(ids[index][0]) ===
                collectionId
            ) {

                sheet.deleteRow(index + 2);

            }

        }

    }

    deleteCollectionPhotosFromSheet(
        collectionId
    );

    trashCollectionFolder(
        collectionId
    );

}
function setCollectionCover(data) {

    const collectionId = String(
        data.collectionId || ""
    ).trim();

    const photoId = String(
        data.photoId || ""
    ).trim();

    if (!collectionId) {
        throw new Error(
            "Не указан ID коллекции."
        );
    }

    if (!photoId) {
        throw new Error(
            "Не указан ID фотографии."
        );
    }

    const collectionsSheet =
        getSheet(
            CONFIG.collectionsSheet
        );

    const photosSheet =
        getSheet(
            CONFIG.photosSheet
        );

    const collectionsData =
        collectionsSheet
            .getDataRange()
            .getValues();

    const collectionHeaders =
        collectionsData[0];

    const collectionIdColumn =
        collectionHeaders.indexOf("id");

    const coverPhotoIdColumn =
        collectionHeaders.indexOf(
            "coverPhotoId"
        );

    if (
        collectionIdColumn === -1 ||
        coverPhotoIdColumn === -1
    ) {
        throw new Error(
            "На листе Collections отсутствуют столбцы id или coverPhotoId."
        );
    }

    const photosData =
        photosSheet
            .getDataRange()
            .getValues();

    const photoHeaders =
        photosData[0];

    const photoIdColumn =
        photoHeaders.indexOf("id");

    const photoCollectionColumn =
        photoHeaders.indexOf(
            "collectionId"
        );

    if (
        photoIdColumn === -1 ||
        photoCollectionColumn === -1
    ) {
        throw new Error(
            "На листе Photos отсутствуют столбцы id или collectionId."
        );
    }

    const photoBelongsToCollection =
        photosData
            .slice(1)
            .some(row => {

                return (
                    String(
                        row[photoIdColumn]
                    ) === photoId &&
                    String(
                        row[photoCollectionColumn]
                    ) === collectionId
                );

            });

    if (!photoBelongsToCollection) {
        throw new Error(
            "Фотография не найдена в этой коллекции."
        );
    }

    const collectionIndex =
        collectionsData
            .slice(1)
            .findIndex(row => {

                return String(
                    row[collectionIdColumn]
                ) === collectionId;

            });

    if (collectionIndex === -1) {
        throw new Error(
            "Коллекция не найдена."
        );
    }

    collectionsSheet
        .getRange(
            collectionIndex + 2,
            coverPhotoIdColumn + 1
        )
        .setValue(photoId);

    return {
        success: true,
        collectionId,
        coverPhotoId: photoId
    };

}
/* ==================================================
   Photos
================================================== */

function uploadPhoto(data) {

    const collectionId =
        String(data.collectionId || "").trim();

    const name =
        String(data.name || "photo.jpg").trim();

    const mimeType =
        String(data.mimeType || "image/jpeg").trim();

    const base64 =
        String(data.base64 || "").trim();

    const previewBase64 =
        String(data.previewBase64 || "").trim();

    const galleryBase64 =
        String(data.galleryBase64 || "").trim();

    if (!collectionId) {
        throw new Error(
            "Не указан ID коллекции."
        );
    }

    if (!base64) {
        throw new Error(
            "Файл фотографии отсутствует."
        );
    }

    const collection = getCollections()
        .find(item =>
            item.id === collectionId
        );

    if (!collection) {
        throw new Error(
            "Коллекция не найдена."
        );
    }

    const folder =
        getCollectionFolder(collectionId);

    let originalFile = null;
    let previewFile = null;
    let galleryFile = null;

    try {

        originalFile = createPhotoFile_(
            folder,
            base64,
            mimeType,
            name
        );

        const baseName =
            getPhotoBaseName_(name);

        if (previewBase64) {
            previewFile = createPhotoFile_(
                folder,
                previewBase64,
                "image/webp",
                `${baseName}-800.webp`
            );
        }

        if (galleryBase64) {
            galleryFile = createPhotoFile_(
                folder,
                galleryBase64,
                "image/webp",
                `${baseName}-1600.webp`
            );
        }

    } catch (error) {

        safelyTrashFile_(originalFile);
        safelyTrashFile_(previewFile);
        safelyTrashFile_(galleryFile);

        throw error;
    }

    const existingPhotos =
        getPhotos(collectionId);

    const maxOrder =
        existingPhotos.reduce(
            (maximum, photo) =>
                Math.max(
                    maximum,
                    Number(photo.order || 0)
                ),
            0
        );

    const photo = {

        id: Utilities.getUuid(),

        collectionId,

        fileId: originalFile.getId(),

        previewFileId:
            previewFile
                ? previewFile.getId()
                : "",

        galleryFileId:
            galleryFile
                ? galleryFile.getId()
                : "",

        name,

        url:
            `https://drive.google.com/uc?export=view&id=${originalFile.getId()}`,

        createdAt:
            new Date().toISOString(),

        order:
            maxOrder + 1,

        description: "",

        layout: "default"

    };

    const sheet = getSheet(
        CONFIG.photosSheet
    );

    ensurePhotoOptimizationColumns_(sheet);

    sheet.appendRow([

        photo.id,
        photo.collectionId,
        photo.fileId,
        photo.name,
        photo.url,
        new Date(photo.createdAt),
        photo.order,
        photo.description,
        photo.layout,
        photo.previewFileId,
        photo.galleryFileId

    ]);

    return photo;
}
function createPhotoFile_(
    folder,
    base64,
    mimeType,
    name
) {

    const bytes =
        Utilities.base64Decode(base64);

    const blob =
        Utilities.newBlob(
            bytes,
            mimeType,
            name
        );

    const file =
        folder.createFile(blob);

    try {

        file.setSharing(
            DriveApp.Access.ANYONE_WITH_LINK,
            DriveApp.Permission.VIEW
        );

    } catch (error) {

        console.warn(
            `Не удалось открыть доступ к ${name}:`,
            error.message
        );
    }

    return file;
}

function getPhotoBaseName_(name) {

    const cleaned =
        String(name || "photo")
            .trim()
            .replace(/\.[^.]+$/, "");

    return cleaned || "photo";
}

function ensurePhotoOptimizationColumns_(sheet) {

    const headers = [
        "id",
        "collectionId",
        "fileId",
        "name",
        "url",
        "createdAt",
        "order",
        "description",
        "layout",
        "previewFileId",
        "galleryFileId"
    ];

    const currentHeaders =
        sheet
            .getRange(
                1,
                1,
                1,
                headers.length
            )
            .getValues()[0];

    headers.forEach((header, index) => {

        if (!currentHeaders[index]) {
            sheet
                .getRange(1, index + 1)
                .setValue(header);
        }

    });
}

function safelyTrashFile_(file) {

    if (!file) {
        return;
    }

    try {
        file.setTrashed(true);
    } catch (error) {
        console.warn(
            "Не удалось удалить незавершённый файл:",
            error.message
        );
    }
}
function updatePhoto(data) {

    const photoId = String(
        data.photoId || ""
    ).trim();

    if (!photoId) {
        throw new Error(
            "Не указан ID фотографии."
        );
    }

    const sheet = getSheet(
        CONFIG.photosSheet
    );

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
        throw new Error(
            "Фотография не найдена."
        );
    }

    // H и I используются для описания
    // и расположения фотографии.
    if (!sheet.getRange(1, 8).getValue()) {
        sheet.getRange(1, 8)
            .setValue("description");
    }

    if (!sheet.getRange(1, 9).getValue()) {
        sheet.getRange(1, 9)
            .setValue("layout");
    }

    const values = sheet
        .getRange(
            2,
            1,
            lastRow - 1,
            11
        )
        .getValues();

    const index = values.findIndex(
        row =>
            String(row[0]) === photoId
    );

    if (index === -1) {
        throw new Error(
            "Фотография не найдена."
        );
    }

    const currentRow = values[index];

    const description = String(
        data.description ?? currentRow[7] ?? ""
    ).trim();

    const requestedLayout = String(
        data.layout ?? currentRow[8] ?? "default"
    ).trim();

    const allowedLayouts = [
        "default",
        "story-left",
        "story-right"
    ];

    const layout =
        description &&
        allowedLayouts.includes(requestedLayout)
            ? requestedLayout
            : "default";

    const rowNumber = index + 2;

    sheet
        .getRange(
            rowNumber,
            8,
            1,
            2
        )
        .setValues([[
            description,
            layout
        ]]);

    return {
        id: String(currentRow[0]),
        collectionId: String(currentRow[1]),
        fileId: String(currentRow[2]),
        name: String(currentRow[3]),
        url: String(currentRow[4]),
        createdAt:
            normalizeDate(currentRow[5]),
        order:
            Number(currentRow[6]) || 0,
        description,
        layout,
        previewFileId:
            String(currentRow[9] || ""),

        galleryFileId:
            String(currentRow[10] || ""),
        };

}
function deletePhoto(photoId) {

    if (!photoId) {
        throw new Error(
            "Не указан ID фотографии."
        );
    }

    const sheet = getSheet(
        CONFIG.photosSheet
    );

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
        throw new Error(
            "Фотография не найдена."
        );
    }

    const values = sheet
        .getRange(
            2,
            1,
            lastRow - 1,
            7
        )
        .getValues();

    const index = values.findIndex(
        row =>
            String(row[0]) === photoId
    );

    if (index === -1) {
        throw new Error(
            "Фотография не найдена."
        );
    }

    const fileId =
        String(values[index][2] || "");

    if (fileId) {

        try {

            DriveApp
                .getFileById(fileId)
                .setTrashed(true);

        } catch (error) {

            console.warn(
                "Файл Drive не найден:",
                fileId
            );

        }

    }

    sheet.deleteRow(index + 2);

}
function getPhotos(collectionId) {

    if (!collectionId) {
        return [];
    }

    const sheet = getSheet(
        CONFIG.photosSheet
    );

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
        return [];
    }

    return sheet
        .getRange(
            2,
            1,
            lastRow - 1,
            11
        )
        .getValues()
        .filter(
            row =>
                String(row[1]) ===
                collectionId
        )
        .map(row => ({

            id: String(row[0]),

            collectionId:
                String(row[1]),

            fileId:
                String(row[2]),

            name:
                String(row[3]),

            url:
                String(row[4]),

            createdAt:
                normalizeDate(row[5]),

            order:
                Number(row[6]) || 0,

            description:
                String(row[7] || ""),

           layout:
           [
            "default",
            "story-left",
            "story-right"
           ].includes(String(row[8]))
              ? String(row[8])
              : "default",
              
            previewFileId:
                String(row[9] || ""),

            galleryFileId:
                String(row[10] || "")
            }))
        .sort((a, b) => a.order - b.order);

}


/* ==================================================
   Drive
================================================== */
function authorizeDrive() {

    const root = getRootFolder();

    Logger.log(root.getName());

}
function getRootFolder() {

    if (
        !CONFIG.rootFolderId ||
        CONFIG.rootFolderId ===
            "ВСТАВЬ_ID_ПАПКИ"
    ) {

        throw new Error(
            "Не указан rootFolderId."
        );

    }

    return DriveApp.getFolderById(
        CONFIG.rootFolderId
    );

}


function getCollectionsRootFolder() {

    const root = getRootFolder();

    const folders =
        root.getFoldersByName(
            CONFIG.collectionsFolderName
        );

    if (folders.hasNext()) {
        return folders.next();
    }

    return root.createFolder(
        CONFIG.collectionsFolderName
    );

}


function trashCollectionFolder(
    collectionId
) {

    const root =
        getCollectionsRootFolder();

    const folders =
        root.getFoldersByName(
            collectionId
        );

    while (folders.hasNext()) {

        folders
            .next()
            .setTrashed(true);

    }

}
function getCollectionFolder(
    collectionId
) {

    const collectionsRoot =
        getCollectionsRootFolder();

    const folders =
        collectionsRoot.getFoldersByName(
            collectionId
        );

    if (folders.hasNext()) {
        return folders.next();
    }

    return collectionsRoot.createFolder(
        collectionId
    );

}

/* ==================================================
   Sheets
================================================== */

function getSheet(sheetName) {

    const spreadsheet =
        SpreadsheetApp
            .getActiveSpreadsheet();

    const sheet =
        spreadsheet.getSheetByName(
            sheetName
        );

    if (!sheet) {

        throw new Error(
            `Лист "${sheetName}" не найден.`
        );

    }

    return sheet;

}


function deleteCollectionPhotosFromSheet(
    collectionId
) {

    const sheet = getSheet(
        CONFIG.photosSheet
    );

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
        return;
    }

    const collectionIds = sheet
        .getRange(
            2,
            2,
            lastRow - 1,
            1
        )
        .getValues();

    for (
        let index =
            collectionIds.length - 1;

        index >= 0;

        index--
    ) {

        if (
            String(
                collectionIds[index][0]
            ) === collectionId
        ) {

            sheet.deleteRow(index + 2);

        }

    }

}


/* ==================================================
   Helpers
================================================== */

function parseRequestBody(e) {

    if (
        !e ||
        !e.postData ||
        !e.postData.contents
    ) {

        return {};

    }

    try {

        return JSON.parse(
            e.postData.contents
        );

    } catch (error) {

        throw new Error(
            "Тело запроса не является корректным JSON."
        );

    }

}


function jsonResponse(data) {

    return ContentService
        .createTextOutput(
            JSON.stringify(data)
        )
        .setMimeType(
            ContentService.MimeType.JSON
        );

}


function errorResponse(error) {

    console.error(error);

    return jsonResponse({

        success: false,

        error:
            error?.message ||
            String(error)

    });

}


function normalizeDate(value) {

    if (!value) {
        return "";
    }

    const date =
        value instanceof Date
            ? value
            : new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }

    return date.toISOString();

}


function normalizeBoolean(value) {

    return (
        value === true ||
        String(value)
            .toLowerCase() === "true"
    );

}


function normalizeCardSize(value) {

    const size =
        String(value || "medium")
            .toLowerCase();

    return [
        "small",
        "medium",
        "large"
    ].includes(size)
        ? size
        : "medium";

}
