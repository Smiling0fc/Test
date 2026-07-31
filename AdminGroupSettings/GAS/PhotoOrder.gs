/* ==================================================
   Photo Order
   Add this file to the same Google Apps Script project
================================================== */

function reorderPhotos(data) {
    const collectionId = String(
        data?.collectionId || ""
    ).trim();

    const photoIds = Array.isArray(data?.photoIds)
        ? data.photoIds
            .map(value => String(value || "").trim())
            .filter(Boolean)
        : [];

    if (!collectionId) {
        throw new Error("Не указан ID коллекции.");
    }

    if (!photoIds.length) {
        throw new Error("Не передан порядок фотографий.");
    }

    if (new Set(photoIds).size !== photoIds.length) {
        throw new Error("В порядке фотографий найдены дубликаты.");
    }

    const sheet = getSheet(CONFIG.photosSheet);
    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
        throw new Error("В коллекции нет фотографий.");
    }

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const headers = values[0];
    const idColumn = headers.indexOf("id");
    const collectionColumn = headers.indexOf("collectionId");
    const orderColumn = headers.indexOf("order");

    if (
        idColumn === -1 ||
        collectionColumn === -1 ||
        orderColumn === -1
    ) {
        throw new Error(
            "На листе Photos отсутствуют столбцы id, collectionId или order."
        );
    }

    const rows = values.slice(1);
    const collectionRows = rows
        .map((row, index) => ({
            row,
            sheetRow: index + 2,
            id: String(row[idColumn] || ""),
            collectionId: String(row[collectionColumn] || "")
        }))
        .filter(item => item.collectionId === collectionId);

    const actualIds = collectionRows.map(item => item.id);

    if (
        actualIds.length !== photoIds.length ||
        actualIds.some(id => !photoIds.includes(id))
    ) {
        throw new Error(
            "Состав коллекции изменился. Обновите страницу и повторите сортировку."
        );
    }

    const orderById = new Map(
        photoIds.map((id, index) => [id, index + 1])
    );

    collectionRows.forEach(item => {
        sheet
            .getRange(item.sheetRow, orderColumn + 1)
            .setValue(orderById.get(item.id));
    });

    SpreadsheetApp.flush();

    return getPhotos(collectionId);
}
