function getActivity(limit) {
    const sheet = getActivitySheet_();
    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
        return [];
    }

    const safeLimit = Math.max(
        1,
        Math.min(Number(limit) || 8, 50)
    );

    const rowCount = Math.min(
        safeLimit,
        lastRow - 1
    );

    return sheet
        .getRange(
            lastRow - rowCount + 1,
            1,
            rowCount,
            5
        )
        .getValues()
        .reverse()
        .map(row => ({
            id: String(row[0] || ""),
            createdAt:
                row[1] instanceof Date
                    ? row[1].toISOString()
                    : String(row[1] || ""),
            type: String(row[2] || "update"),
            title: String(row[3] || "Действие в Studio"),
            details: String(row[4] || "")
        }));
}

function logActivity(data) {
    const sheet = getActivitySheet_();
    const title = String(data.title || "").trim();

    if (!title) {
        throw new Error(
            "Не передано название действия."
        );
    }

    const activity = {
        id: Utilities.getUuid(),
        createdAt: new Date(),
        type: String(data.type || "update").trim(),
        title: title,
        details: String(data.details || "").trim()
    };

    sheet.appendRow([
        activity.id,
        activity.createdAt,
        activity.type,
        activity.title,
        activity.details
    ]);

    return {
        id: activity.id,
        createdAt: activity.createdAt.toISOString(),
        type: activity.type,
        title: activity.title,
        details: activity.details
    };
}

function getActivitySheet_() {
    const referenceSheet = getSheet(
        CONFIG.collectionsSheet
    );

    const spreadsheet = referenceSheet.getParent();

    const sheetName =
        CONFIG.activitySheet ||
        "ActivityLog";

    let sheet = spreadsheet.getSheetByName(
        sheetName
    );

    if (!sheet) {
        sheet = spreadsheet.insertSheet(
            sheetName
        );

        sheet.getRange(1, 1, 1, 5).setValues([[
            "id",
            "createdAt",
            "type",
            "title",
            "details"
        ]]);

        sheet.setFrozenRows(1);
    }

    return sheet;
}
