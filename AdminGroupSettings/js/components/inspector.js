class Inspector {

    static panel = null;

    static init() {
        this.panel = document.getElementById("inspector");
        this.showEmpty();
    }

    static ensurePanel() {
        if (!this.panel || !document.body.contains(this.panel)) {
            this.panel = document.getElementById("inspector");
        }
        return this.panel;
    }

    static showEmpty() {
        const panel = this.ensurePanel();
        if (!panel) return;

        panel.innerHTML = `
            <div class="inspector-header">
                <div>
                    <span class="inspector-kicker">VIJOY STUDIO</span>
                    <h2>Inspector</h2>
                </div>
            </div>
            <div class="inspector-empty">
                <div class="inspector-empty-icon">◇</div>
                <p>Выберите коллекцию, фотографию или элемент страницы.</p>
                <span>Здесь появятся доступные настройки.</span>
            </div>
        `;
        panel.classList.remove("is-open");
    }

    static close() {
        this.showEmpty();
    }

    static openCollection(id) {
        const collection = CollectionService.getById(id);
        const panel = this.ensurePanel();

        if (!collection || !panel) return;

        panel.classList.add("is-open");
        panel.innerHTML = `
            <div class="inspector-header">
                <div>
                    <span class="inspector-kicker">COLLECTION</span>
                    <h2>Свойства коллекции</h2>
                </div>
                <button class="inspector-close" type="button" aria-label="Закрыть">×</button>
            </div>

            <form id="collectionInspectorForm" class="inspector-form">
                <label class="inspector-field">
                    <span>Название</span>
                    <input id="inspectorCollectionName" maxlength="120" required>
                </label>

                <label class="inspector-field">
                    <span>Описание</span>
                    <textarea id="inspectorCollectionDescription" maxlength="300" rows="7" placeholder="Кратко расскажите об этой истории"></textarea>
                    <small>До 300 символов</small>
                </label>

                <div class="inspector-meta">
                    <span>ID</span>
                    <code>${this.escapeHtml(collection.id)}</code>
                </div>

                <button class="inspector-save" type="submit">Сохранить изменения</button>
            </form>
        `;

        const form = panel.querySelector("#collectionInspectorForm");
        const nameInput = panel.querySelector("#inspectorCollectionName");
        const descriptionInput = panel.querySelector("#inspectorCollectionDescription");
        const saveButton = panel.querySelector(".inspector-save");

        nameInput.value = collection.name || "";
        descriptionInput.value = collection.description || "";

        panel.querySelector(".inspector-close").addEventListener("click", () => this.close());

        form.addEventListener("submit", async event => {
            event.preventDefault();

            const name = nameInput.value.trim();
            const description = descriptionInput.value.trim();
            if (!name) return nameInput.focus();

            saveButton.disabled = true;
            saveButton.textContent = "Сохраняем...";

            try {
                await CollectionService.updateDetails(collection.id, { name, description });
                saveButton.textContent = "Сохранено";
                if (document.getElementById("collectionsContainer")) {
                    Collections.render();
                    this.openCollection(collection.id);
                }
            } catch (error) {
                console.error(error);
                alert(error.message || "Не удалось сохранить коллекцию.");
                saveButton.disabled = false;
                saveButton.textContent = "Сохранить изменения";
            }
        });
    }

    static openPhoto(photoId) {
        const collectionId = CollectionView.currentId;
        const photo = PhotoService.getById(collectionId, photoId);
        const panel = this.ensurePanel();

        if (!photo || !panel) return;

        const currentLayout = ["default", "story-left", "story-right"].includes(photo.layout)
            ? photo.layout
            : "default";

        panel.classList.add("is-open");
        panel.innerHTML = `
            <div class="inspector-header">
                <div>
                    <span class="inspector-kicker">PHOTO</span>
                    <h2>Свойства кадра</h2>
                </div>
                <button class="inspector-close" type="button" aria-label="Закрыть">×</button>
            </div>

            <div class="inspector-preview">
                <img src="https://lh3.googleusercontent.com/d/${photo.fileId}=w700" alt="${this.escapeHtml(photo.name || "Фотография")}">
            </div>

            <form id="photoInspectorForm" class="inspector-form">
                <label class="inspector-field">
                    <span>Описание</span>
                    <textarea id="inspectorPhotoDescription" maxlength="1200" rows="7" placeholder="Расскажите историю этого кадра"></textarea>
                    <small>До 1200 символов</small>
                </label>

                <fieldset class="inspector-options">
                    <legend>Расположение</legend>
                    ${this.layoutOption("default", "Обычная сетка", currentLayout)}
                    ${this.layoutOption("story-left", "Фото слева, текст справа", currentLayout)}
                    ${this.layoutOption("story-right", "Текст слева, фото справа", currentLayout)}
                </fieldset>

                <button class="inspector-save" type="submit">Сохранить изменения</button>
            </form>
        `;

        const form = panel.querySelector("#photoInspectorForm");
        const descriptionInput = panel.querySelector("#inspectorPhotoDescription");
        const saveButton = panel.querySelector(".inspector-save");
        descriptionInput.value = photo.description || "";

        panel.querySelector(".inspector-close").addEventListener("click", () => this.close());

        form.addEventListener("submit", async event => {
            event.preventDefault();

            const description = descriptionInput.value.trim();
            const selectedLayout = form.querySelector('input[name="inspectorPhotoLayout"]:checked')?.value || "default";
            const layout = description ? selectedLayout : "default";

            saveButton.disabled = true;
            saveButton.textContent = "Сохраняем...";

            try {
                await PhotoService.update(collectionId, photo.id, { description, layout });
                CollectionView.renderPhotos();
                saveButton.textContent = "Сохранено";
                setTimeout(() => {
                    saveButton.disabled = false;
                    saveButton.textContent = "Сохранить изменения";
                }, 900);
            } catch (error) {
                console.error(error);
                alert(error.message || "Не удалось сохранить фотографию.");
                saveButton.disabled = false;
                saveButton.textContent = "Сохранить изменения";
            }
        });
    }

    static layoutOption(value, label, current) {
        return `
            <label class="inspector-radio">
                <input type="radio" name="inspectorPhotoLayout" value="${value}" ${value === current ? "checked" : ""}>
                <span>${label}</span>
            </label>
        `;
    }

    static escapeHtml(value) {
        return String(value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const bindInspector = () => {
        if (!document.getElementById("inspector")) return;
        Inspector.init();
        Collections.openEditor = id => Inspector.openCollection(id);
        CollectionView.openPhotoEditor = id => Inspector.openPhoto(id);
    };

    setTimeout(bindInspector, 0);
});
