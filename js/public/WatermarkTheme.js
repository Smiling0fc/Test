class WatermarkTheme {

    static async init() {
        try {
            const response = await PublicApi.getSiteSettings();
            this.apply(response.appearance || {});
        } catch (error) {
            console.warn(
                "Настройки водяного знака недоступны:",
                error.message
            );
        }
    }

    static apply(data = {}) {
        const root = document.documentElement;
        const body = document.body;
        const enabled = data.watermarkEnabled === true ||
            data.watermarkEnabled === "true";
        const position = String(
            data.watermarkPosition || "bottom-right"
        );
        const size = Number(data.watermarkSize || 14);
        const opacity = Number(data.watermarkOpacity || 45) / 100;
        const onCovers = data.watermarkOnCovers !== false &&
            data.watermarkOnCovers !== "false";
        const onPhotos = data.watermarkOnPhotos !== false &&
            data.watermarkOnPhotos !== "false";

        root.style.setProperty("--watermark-size", `${size}%`);
        root.style.setProperty("--watermark-opacity", opacity);
        body.dataset.watermarkEnabled = String(enabled);
        body.dataset.watermarkPosition = position;
        body.dataset.watermarkCovers = String(onCovers);
        body.dataset.watermarkPhotos = String(onPhotos);
    }
}

window.addEventListener(
    "DOMContentLoaded",
    () => WatermarkTheme.init()
);
