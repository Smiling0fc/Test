class CollectionMetadata {
    static mount(collectionId) {
        const collection = CollectionService.getById(collectionId);
        const view = document.querySelector(".collection-view");
        const dropzone = document.getElementById("photoDropzone");

        if (!collection || !view || !dropzone) {
            return;
        }

        document.getElementById("collectionMetadataPanel")?.remove();

        const panel = document.createElement("section");
        panel.id = "collectionMetadataPanel";
        panel.className = "collection-metadata-panel glass";
        panel.innerHTML = `
            <div class="collection-metadata-heading">
                <div>
                    <span class="editor-kicker">Журнальный выпуск</span>
                    <h2>Данные для Hero</h2>
                </div>
                <p>
                    Номер выпуска и количество кадров рассчитываются автоматически.
                </p>
            </div>

            <form id="collectionMetadataForm" class="collection-metadata-form">
                <label class="editor-field">
                    <span>Категория съёмки</span>
                    <input
                        id="collectionCategoryInput"
                        type="text"
                        maxlength="80"
                        autocomplete="off"
                        placeholder="Свадьба, портрет, мероприятие">
                </label>

                <label class="editor-field">
                    <span>Дата съёмки</span>
                    <input
                        id="collectionShootDateInput"
                        type="date">
                </label>

                <label class="editor-field">
                    <span>Место</span>
                    <input
                        id="collectionLocationInput"
                        type="text"
                        maxlength="120"
                        autocomplete="off"
                        placeholder="Нижний Новгород">
                </label>

                <div class="collection-metadata-preview" aria-live="polite">
                    <small>Предпросмотр строки</small>
                    <p id="collectionMetadataPreview"></p>
                </div>

                <div class="collection-metadata-actions">
                    <span id="collectionMetadataStatus" role="status"></span>
                    <button class="primaryButton" type="submit">
                        Сохранить данные Hero
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

        categoryInput.value = String(collection.category || "");
        dateInput.value = this.normalizeDateInput(collection.shootDate);
        locationInput.value = String(collection.location || "");

        const updatePreview = () => {
            const parts = [
                categoryInput.value.trim() || "Фотографическая история",
                this.formatDate(dateInput.value),
                locationInput.value.trim(),
                `Выпуск ${String(Number(collection.order || 1)).padStart(2, "0")}`
            ].filter(Boolean);

            preview.textContent = parts.join(" · ");
        };

        [categoryInput, dateInput, locationInput].forEach(input => {
            input.addEventListener("input", updatePreview);
        });

        updatePreview();

        form.addEventListener("submit", async event => {
            event.preventDefault();
            saveButton.disabled = true;
            status.textContent = "Сохраняем…";

            try {
                await CollectionService.updateDetails(collection.id, {
                    name: collection.name,
                    description: collection.description || "",
                    category: categoryInput.value.trim(),
                    shootDate: dateInput.value,
                    location: locationInput.value.trim()
                });

                status.textContent = "Сохранено";

                setTimeout(() => {
                    if (status) {
                        status.textContent = "";
                    }
                }, 2200);
            } catch (error) {
                console.error(error);
                status.textContent = "Не удалось сохранить";
                alert(error.message || "Не удалось сохранить данные Hero.");
            } finally {
                saveButton.disabled = false;
            }
        });
    }

    static normalizeDateInput(value) {
        const text = String(value || "").trim();

        if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
            return text;
        }

        return "";
    }

    static formatDate(value) {
        if (!value) {
            return "";
        }

        const date = new Date(`${value}T12:00:00`);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return new Intl.DateTimeFormat("ru-RU", {
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
        CollectionMetadata.mount(String(id));
    };
}
