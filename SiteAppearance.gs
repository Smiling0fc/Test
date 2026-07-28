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
    const appearance = normalizeSiteAppearance_({
        ...current,
        ...data
    });

    Object.keys(appearance).forEach(key => {
        setAppearanceValue_(
            sheet,
            key,
            appearance[key]
        );
    });

    return appearance;
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

function normalizeSiteAppearance_(data) {
    return {
        backgroundTheme: normalizeAppearanceTheme_(
            data.backgroundTheme
        ),
        siteName: normalizeAppearanceText_(
            data.siteName,
            "ViJoy’s Photo Gallery",
            100
        ),
        siteDescription: normalizeAppearanceText_(
            data.siteDescription,
            "Истории, которые хочется сохранить.",
            220
        ),
        location: normalizeAppearanceText_(
            data.location,
            "",
            100
        ),
        contactButtonText: normalizeAppearanceText_(
            data.contactButtonText,
            "Связаться",
            40
        ),
        phone: normalizeAppearanceText_(data.phone, "", 60),
        email: normalizeAppearanceText_(data.email, "", 120),
        telegramUrl: normalizeAppearanceUrl_(data.telegramUrl),
        vkUrl: normalizeAppearanceUrl_(data.vkUrl),
        instagramUrl: normalizeAppearanceUrl_(data.instagramUrl),
        footerYear: normalizeAppearanceYear_(data.footerYear),
        maintenanceEnabled: normalizeAppearanceBoolean_(
            data.maintenanceEnabled
        ),
        maintenanceTitle: normalizeAppearanceText_(
            data.maintenanceTitle,
            "Сайт скоро вернётся",
            100
        ),
        maintenanceMessage: normalizeAppearanceText_(
            data.maintenanceMessage,
            "Мы обновляем галерею и готовим новые истории. Загляните немного позже.",
            300
        ),
        maintenanceButtonText: normalizeAppearanceText_(
            data.maintenanceButtonText,
            "Обновить страницу",
            40
        )
    };
}

function normalizeAppearanceText_(value, fallback, maxLength) {
    const text = String(value || "").trim();
    const result = text || fallback || "";
    return result.slice(0, maxLength);
}

function normalizeAppearanceUrl_(value) {
    const url = String(value || "").trim();

    if (!url) {
        return "";
    }

    return /^https:\/\//i.test(url)
        ? url.slice(0, 300)
        : "";
}

function normalizeAppearanceBoolean_(value) {
    return value === true || String(value).toLowerCase() === "true";
}

function normalizeAppearanceYear_(value) {
    const year = Number(value);
    const currentYear = new Date().getFullYear();

    return year >= 2020 && year <= currentYear + 2
        ? String(year)
        : String(currentYear);
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