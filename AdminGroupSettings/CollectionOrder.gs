/* ==================================================
   Collection order
================================================== */

function reorderCollections(data) {

    const collectionIds = Array.isArray(
        data.collectionIds
    )
        ? data.collectionIds
            .map(id => String(id || "").trim())
            .filter(Boolean)
        : [];

    if (!collectionIds.length) {
        throw new Error(
            "Не передан порядок коллекций."
        );
    }

    const uniqueIds = [
        ...new Set(collectionIds)
    ];

    if (
        uniqueIds.length !==
        collectionIds.length
    ) {
        throw new Error(
            "В порядке коллекций обнаружены дубликаты."
        );
    }

    const sheet = getSheet(
        CONFIG.collectionsSheet
    );

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
        throw new Error(
            "Коллекции не найдены."
        );
    }

    const rowCount = lastRow - 1;
    const values = sheet
        .getRange(
            2,
            1,
            rowCount,
            4
        )
        .getValues();

    const existingIds = values
        .map(row => String(row[0] || ""))
        .filter(Boolean);

    const sameLength =
        existingIds.length === uniqueIds.length;

    const containsEveryCollection =
        sameLength &&
        existingIds.every(id =>
            uniqueIds.includes(id)
        );

    if (!containsEveryCollection) {
        throw new Error(
            "Список коллекций изменился. Обновите Studio и повторите попытку."
        );
    }

    const orderById = new Map(
        uniqueIds.map((id, index) => [
            id,
            index + 1
        ])
    );

    const orderValues = values.map(row => [
        orderById.get(
            String(row[0] || "")
        )
    ]);

    sheet
        .getRange(
            2,
            4,
            rowCount,
            1
        )
        .setValues(orderValues);

    return getCollections();

}
