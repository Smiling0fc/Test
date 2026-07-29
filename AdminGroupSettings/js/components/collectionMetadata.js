class CollectionMetadata {
    static async mount(collectionId) {
        const collection = CollectionService.getById(collectionId);
        const view = document.querySelector(".collection-view");
        const dropzone = document.getElementById("photoDropzone");

        if (!collection || !view || !dropzone) {
            return;
        }

        document.getElementById("collectionMetadataPanel")?.remove();

        let metadata = {
            category: "",
            shootDate: "",
            location: "",
            displayMode: "mixed"
        };

        try {
            if (!SiteSettingsService.loaded) {
                await SiteSettingsService.load();
            }
            metadata = SiteSettingsService.getCollectionMetadata(collection.id);
        } catch (error) {
            console.warn("Не удалось загрузить данные коллекции:", error.message);
        }

        const panel = document.createElement("section");
        panel.id = "collectionMetadataPanel";
        panel.className = "collection-metadata-panel glass";
        panel.innerHTML = `
            <div class="collection-metadata-heading">
                <div>
                    <span class="editor-kicker">Журнальный выпуск</span>
                    <h2>Формат истории</h2>
                </div>
                <p>Выберите ритм просмотра и заполните данные обложки.</p>
            </div>

            <form id="collectionMetadataForm" class="collection-metadata-form">
                <fieldset class="collection-mode-fieldset">
                    <legend>Режим коллекции</legend>
                    <div class="collection-mode-options">
                        ${this.modeOption(
                            "gallery",
                            "Галерея",
                            "Чистая фотосетка без текстовых разворотов."
                        )}
                        ${this.modeOption(
                            "story",
                            "Фоторассказ",
                            "Последовательные кадры и журнальные текстовые паузы."
                        )}
                        ${this.modeOption(
                            "mixed",
                            "Смешанный",
                            "Masonry-сетка с отдельными историями ключевых кадров."
                        )}
                    </div>
                </fieldset>

                <div class="collection-metadata-fields">
                    <label class="editor-field">
                        <span>Категория съёмки</span>
                        <input id="collectionCategoryInput" type="text"
                            maxlength="80" autocomplete="off"
                            placeholder="Свадьба, портрет, мероприятие">
                    </label>

                    <label class="editor-field">
                        <span>Дата съёмки</span>
                        <input id="collectionShootDateInput" type="date">
                    </label>

                    <label class="editor-field">
                        <span>Место</span>
                        <input id="collectionLocationInput" type="text"
                            maxlength="120" autocomplete="off"
                            placeholder="Нижний Новгород">
                    </label>
                </div>

                <div class="collection-metadata-preview" aria-live="polite">
                    <small>Предпросмотр выпуска</small>
                    <p id="collectionMetadataPreview"></p>
                </div>

                <div class="collection-metadata-actions">
                    <span id="collectionMetadataStatus" role="status"></span>
                    <button class="primaryButton" type="submit">
                        Сохранить настройки
                    </button>
                </div>
            </form>
        `;

        view.insertBefore(panel, dropzone);

        const form = panel.querySelector("#collectionMetadataForm");
        const categoryInput = panel.querySelector("#collectionCategoryInput");
        const dateInput = panel.querySelector("#collectionShootDateInput");
        const locationInput = panel.querySelector("#collectionLocationInput");
        const preview = panel.querySelector("#collectionMetadataPreview");
        const status = panel.querySelector("#collectionMetadataStatus");
        const saveButton = form.querySelector("button[type='submit']");
        const modeInputs = Array.from(
            panel.querySelectorAll('input[name="collectionDisplayMode"]')
        );

        categoryInput.value = String(metadata.category || "");
        dateInput.value = this.normalizeDateInput(metadata.shootDate);
        locationInput.value = String(metadata.location || "");
        const selectedMode = SiteSettingsService.normalizeDisplayMode(
            metadata.displayMode
        );
        const selectedInput = modeInputs.find(input => input.value === selectedMode);
        if (selectedInput) {
            selectedInput.checked = true;
        }

        const updatePreview = () => {
            const modeLabel = modeInputs.find(input => input.checked)
                ?.closest("label")
                ?.querySelector("strong")
                ?.textContent || "Смешанный";
            const parts = [
                modeLabel,
                categoryInput.value.trim() || "Фотографическая история",
                this.formatDate(dateInput.value),
                locationInput.value.trim(),
                `Выпуск ${String(Number(collection.order || 1)).padStart(2, "0")}`
            ].filter(Boolean);
            preview.textContent = parts.join(" · ");
        };

        [categoryInput, dateInput, locationInput, ...modeInputs].forEach(input => {
            input.addEventListener("input", updatePreview);
            input.addEventListener("change", updatePreview);
        });
        updatePreview();

        form.addEventListener("submit", async event => {
            event.preventDefault();
            saveButton.disabled = true;
            status.textContent = "Сохраняем…";

            try {
                const savedMetadata = await SiteSettingsService
                    .setCollectionMetadata(collection.id, {
                        category: categoryInput.value.trim(),
                        shootDate: dateInput.value,
                        location: locationInput.value.trim(),
                        displayMode: modeInputs.find(input => input.checked)?.value
                            || "mixed"
                    });

                Object.assign(collection, savedMetadata);
                status.textContent = "Сохранено";
                setTimeout(() => {
                    if (status.isConnected) {
                        status.textContent = "";
                    }
                }, 2200);
            } catch (error) {
                console.error(error);
                status.textContent = "Не удалось сохранить";
                alert(error.message || "Не удалось сохранить настройки коллекции.");
            } finally {
                saveButton.disabled = false;
            }
        });
    }

    static modeOption(value, title, description) {
        return `
            <label class="collection-mode-option">
                <input type="radio" name="collectionDisplayMode" value="${value}">
                <span class="collection-mode-card">
                    <strong>${title}</strong>
                    <small>${description}</small>
                </span>
            </label>
        `;
    }

    static normalizeDateInput(value) {
        const text = String(value || "").trim();
        return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
    }

    static formatDate(value) {
        if (!value) {
            return "";
        }
        const date = new Date(`${value}T12:00:00`);
        return Number.isNaN(date.getTime())
            ? ""
            : new Intl.DateTimeFormat("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric"
            }).format(date);
    }
}

if (typeof CollectionView !== "undefined") {
    const openCollectionView = CollectionView.open.bind(CollectionView);
    CollectionView.open = async function openWithMetadata(id) {
        await openCollectionView(id);
        await CollectionMetadata.mount(String(id));
    };
}