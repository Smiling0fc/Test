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

    return normalizeSiteAppearance_(settings);
}

function updateSiteAppearance(data) {
    const sheet = getSiteAppearanceSheet_();
    const current = getSiteAppearance();
    const next = normalizeSiteAppearance_(
        Object.assign({}, current, data || {})
    );

    Object.keys(next).forEach(key => {
        setAppearanceValue_(sheet, key, next[key]);
    });

    return next;
}

function normalizeSiteAppearance_(data) {
    return {
        backgroundTheme: normalizeAppearanceTheme_(
            data.backgroundTheme
        ),
        watermarkEnabled: normalizeBoolean_(
            data.watermarkEnabled,
            false
        ),
        watermarkPosition: normalizeWatermarkPosition_(
            data.watermarkPosition
        ),
        watermarkSize: normalizeNumber_(
            data.watermarkSize,
            8,
            30,
            14
        ),
        watermarkOpacity: normalizeNumber_(
            data.watermarkOpacity,
            15,
            90,
            45
        ),
        watermarkOnCovers: normalizeBoolean_(
            data.watermarkOnCovers,
            true
        ),
        watermarkOnPhotos: normalizeBoolean_(
            data.watermarkOnPhotos,
            true
        )
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

function normalizeWatermarkPosition_(value) {
    const allowed = [
        "top-left",
        "top-right",
        "center",
        "bottom-left",
        "bottom-right"
    ];
    const position = String(
        value || "bottom-right"
    ).trim();

    return allowed.indexOf(position) !== -1
        ? position
        : "bottom-right";
}

function normalizeBoolean_(value, fallback) {
    if (value === true || String(value) === "true") {
        return true;
    }

    if (value === false || String(value) === "false") {
        return false;
    }

    return fallback;
}

function normalizeNumber_(value, min, max, fallback) {
    const number = Number(value);

    if (!isFinite(number)) {
        return fallback;
    }

    return Math.min(max, Math.max(min, number));
}
