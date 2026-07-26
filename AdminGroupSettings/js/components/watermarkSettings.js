class WatermarkSettings {

    static settings = {
        ...AppearanceService.defaults
    };

    static async render() {
        const section = document.querySelector(
            ".settings-panel-muted"
        );

        if (!section) {
            return;
        }

        try {
            this.settings = await AppearanceService.load();
        } catch (error) {
            console.warn(
                "Настройки водяного знака пока недоступны:",
                error.message
            );
        }

        section.classList.remove("settings-panel-muted");
        section.innerHTML = `
            <div class="settings-panel-heading">
                <div>
                    <span>Изображения</span>
                    <h2>Водяной знак</h2>
                    <p>
                        Фирменный логотип накладывается поверх фотографий
                        на публичном сайте. Оригиналы в Drive не изменяются.
                    </p>
                </div>

                <label class="watermark-master-switch">
                    <input
                        id="watermarkEnabled"
                        type="checkbox"
                        ${this.settings.watermarkEnabled ? "checked" : ""}>
                    <span></span>
                    <strong>Включён</strong>
                </label>
            </div>

            <div class="watermark-layout">
                <div class="watermark-preview-shell">
                    <div
                        id="watermarkPreview"
                        class="watermark-preview position-${this.settings.watermarkPosition}"
                        style="--watermark-size:${this.settings.watermarkSize}%; --watermark-opacity:${this.settings.watermarkOpacity / 100};">
                        <div class="watermark-preview-photo"></div>
                        <img
                            class="watermark-preview-logo"
                            src="../images/brand/vijoys-logo.svg"
                            alt="Предпросмотр водяного знака">
                    </div>
                    <small>
                        Предпросмотр показывает относительный размер и позицию.
                    </small>
                </div>

                <div class="watermark-controls">
                    <div class="watermark-control-group">
                        <label>Позиция</label>
                        <div class="watermark-position-grid">
                            ${this.renderPosition("top-left", "↖")}
                            ${this.renderPosition("top-right", "↗")}
                            ${this.renderPosition("center", "●")}
                            ${this.renderPosition("bottom-left", "↙")}
                            ${this.renderPosition("bottom-right", "↘")}
                        </div>
                    </div>

                    <div class="watermark-control-group">
                        <label for="watermarkSize">
                            Размер
                            <output id="watermarkSizeValue">${this.settings.watermarkSize}%</output>
                        </label>
                        <input
                            id="watermarkSize"
                            type="range"
                            min="8"
                            max="30"
                            step="1"
                            value="${this.settings.watermarkSize}">
                    </div>

                    <div class="watermark-control-group">
                        <label for="watermarkOpacity">
                            Прозрачность
                            <output id="watermarkOpacityValue">${this.settings.watermarkOpacity}%</output>
                        </label>
                        <input
                            id="watermarkOpacity"
                            type="range"
                            min="15"
                            max="90"
                            step="5"
                            value="${this.settings.watermarkOpacity}">
                    </div>

                    <div class="watermark-scope">
                        <label>
                            <input
                                id="watermarkOnCovers"
                                type="checkbox"
                                ${this.settings.watermarkOnCovers ? "checked" : ""}>
                            <span>Показывать на обложках</span>
                        </label>

                        <label>
                            <input
                                id="watermarkOnPhotos"
                                type="checkbox"
                                ${this.settings.watermarkOnPhotos ? "checked" : ""}>
                            <span>Показывать внутри коллекций</span>
                        </label>
                    </div>

                    <div id="watermarkStatus" class="watermark-status">
                        Настройки загружены из GAS.
                    </div>
                </div>
            </div>
        `;

        this.bind();
        this.applyPreview();
    }

    static renderPosition(id, icon) {
        const selected = this.settings.watermarkPosition === id;

        return `
            <button
                class="watermark-position${selected ? " is-selected" : ""}"
                type="button"
                data-position="${id}"
                aria-pressed="${selected}">
                ${icon}
            </button>
        `;
    }

    static bind() {
        document
            .querySelectorAll(".watermark-position")
            .forEach(button => {
                button.addEventListener("click", () => {
                    this.settings.watermarkPosition =
                        button.dataset.position;
                    this.syncPositionButtons();
                    this.applyPreview();
                    this.save();
                });
            });

        [
            "watermarkEnabled",
            "watermarkOnCovers",
            "watermarkOnPhotos"
        ].forEach(id => {
            document.getElementById(id)?.addEventListener(
                "change",
                event => {
                    this.settings[id] = event.target.checked;
                    this.applyPreview();
                    this.save();
                }
            );
        });

        [
            ["watermarkSize", "watermarkSizeValue", "%"],
            ["watermarkOpacity", "watermarkOpacityValue", "%"]
        ].forEach(([id, outputId, suffix]) => {
            const input = document.getElementById(id);
            input?.addEventListener("input", event => {
                this.settings[id] = Number(event.target.value);
                document.getElementById(outputId).textContent =
                    `${event.target.value}${suffix}`;
                this.applyPreview();
            });
            input?.addEventListener("change", () => this.save());
        });
    }

    static syncPositionButtons() {
        document
            .querySelectorAll(".watermark-position")
            .forEach(button => {
                const selected =
                    button.dataset.position ===
                    this.settings.watermarkPosition;
                button.classList.toggle("is-selected", selected);
                button.setAttribute("aria-pressed", String(selected));
            });
    }

    static applyPreview() {
        const preview = document.getElementById("watermarkPreview");

        if (!preview) {
            return;
        }

        preview.className =
            `watermark-preview position-${this.settings.watermarkPosition}`;
        preview.style.setProperty(
            "--watermark-size",
            `${this.settings.watermarkSize}%`
        );
        preview.style.setProperty(
            "--watermark-opacity",
            this.settings.watermarkEnabled
                ? this.settings.watermarkOpacity / 100
                : 0
        );
    }

    static async save() {
        const status = document.getElementById("watermarkStatus");

        if (status) {
            status.textContent = "Сохраняем настройки…";
            status.dataset.state = "saving";
        }

        try {
            this.settings = await AppearanceService.saveAll(
                this.settings
            );

            this.applyPreview();

            if (status) {
                status.textContent = "Водяной знак обновлён на сайте.";
                status.dataset.state = "saved";
            }
        } catch (error) {
            console.error("Watermark save error:", error);

            if (status) {
                status.textContent =
                    `Не удалось сохранить: ${error.message}`;
                status.dataset.state = "error";
            }
        }
    }
}
