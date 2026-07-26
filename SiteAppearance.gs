function getSiteAppearance() {
    const sheet = getSiteAppearanceSheet_();
    const lastRow = sheet.getLastRow();
    const values = lastRow >= 2
        ? sheet.getRange(2, 1, lastRow - 1, 2).getValues()
        : [];

    const settings = {};

    values.forEach(row => {
        const key = String(row[0] || "").trim();

        if (key) {
            settings[key] = String(row[1] || "").trim();
        }
    });

    return {
        backgroundTheme: normalizeAppearanceTheme_(
            settings.backgroundTheme
        )
    };
}

function updateSiteAppearance(data) {
    const sheet = getSiteAppearanceSheet_();
    const theme = normalizeAppearanceTheme_(
        data.backgroundTheme
    );

    setAppearanceValue_(
        sheet,
        "backgroundTheme",
        theme
    );

    return {
        backgroundTheme: theme
    };
}

function getSiteAppearanceSheet_() {
    const referenceSheet = getSheet(
        CONFIG.collectionsSheet
    );
    const spreadsheet = referenceSheet.getParent();
    const sheetName =
        CONFIG.appearanceSheet ||
        "SiteAppearance";

    let sheet = spreadsheet.getSheetByName(
        sheetName
    );

    if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
        sheet.getRange(1, 1, 1, 2).setValues([[
            "key",
            "value"
        ]]);
        sheet.setFrozenRows(1);
        sheet.appendRow([
            "backgroundTheme",
            "pearl"
        ]);
    }

    return sheet;
}

function setAppearanceValue_(sheet, key, value) {
    const lastRow = sheet.getLastRow();

    if (lastRow >= 2) {
        const keys = sheet
            .getRange(2, 1, lastRow - 1, 1)
            .getValues()
            .flat()
            .map(item => String(item || "").trim());

        const index = keys.indexOf(key);

        if (index !== -1) {
            sheet.getRange(index + 2, 2).setValue(value);
            return;
        }
    }

    sheet.appendRow([key, value]);
}

function normalizeAppearanceTheme_(value) {
    const allowed = [
        "pearl",
        "ivory",
        "linen",
        "blush",
        "mist",
        "sage"
    ];

    const theme = String(value || "pearl").trim();

    return allowed.indexOf(theme) !== -1
        ? theme
        : "pearl";
}
