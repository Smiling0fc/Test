class Inspector {

    static panel = null;
    static selectedType = "";
    static selectedId = "";
    static eventsBound = false;

    static init() {
        this.panel = document.getElementById(
            "inspector"
        );

        this.bindGlobalEvents();
        this.showEmpty();
    }

    static ensurePanel() {
        if (
            !this.panel ||
            !document.body.contains(this.panel)
        ) {
            this.panel = document.getElementById(
                "inspector"
            );
        }

        return this.panel;
    }

    static bindGlobalEvents() {
        if (this.eventsBound) {
            return;
        }

        this.eventsBound = true;

        document.addEventListener(
            "click",
            event => {
                const menuItem =
                    event.target.closest(
                        ".menu-item"
                    );

                if (menuItem) {
                    setTimeout(
                        () => this.showEmpty(),
                        0
                    );
                    return;
                }

                if (
                    event.target.closest(
                        "#inspector"
                    ) ||
                    event.target.closest(
                        "button"
                    )
                ) {
                    return;
                }

                const photoCard =
                    event.target.closest(
                        ".photo-card"
                    );

                if (photoCard?.dataset.photoId) {
                    this.openPhoto(
                        photoCard.dataset.photoId
                    );
                    return;
                }

                const collectionCard =
                    event.target.closest(
                        ".collection-card"
                    );

                if (collectionCard?.dataset.id) {
                    this.openCollection(
                        collectionCard.dataset.id
                    );
                }
            }
        );

        document.addEventListener(
            "keydown",
            event => {
                if (
                    event.key === "Escape" &&
                    this.ensurePanel()
                        ?.classList
                        .contains("is-open")
                ) {
                    this.close();
                }
            }
        );
    }

    static clearSelection() {
        document
            .querySelectorAll(
                ".collection-card.is-selected, .photo-card.is-selected"
            )
            .forEach(element =>
                element.classList.remove(
                    "is-selected"
                )
            );
    }

    static markSelected(type, id) {
        this.clearSelection();

        this.selectedType = String(type || "");
        this.selectedId = String(id || "");

        if (!this.selectedId) {
            return;
        }

        const selector =
            type === "photo"
                ? ".photo-card"
                : ".collection-card";

        document
            .querySelectorAll(selector)
            .forEach(element => {
                const elementId =
                    type === "photo"
                        ? element.dataset.photoId
                        : element.dataset.id;

                if (
                    String(elementId) ===
                    this.selectedId
                ) {
                    element.classList.add(
                        "is-selected"
                    );
                }
            });
    }

    static showEmpty() {
        const panel = this.ensurePanel();

        if (!panel) {
            return;
        }

        this.selectedType = "";
        this.selectedId = "";
        this.clearSelection();

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

    static async openCollection(id) {
        const collection =
            CollectionService.getById(id);

        const panel = this.ensurePanel();

        if (!collection || !panel) {
            return;
        }

        this.markSelected(
            "collection",
            collection.id
        );

        let heroCollectionId = String(
            SiteSettingsService.get()
                ?.heroCollectionId || ""
        );

        if (!heroCollectionId) {
            try {
                const settings =
                    await SiteSettingsService.load();

                heroCollectionId = String(
                    settings.heroCollectionId || ""
                );
            } catch (error) {
                console.warn(
                    "Не удалось загрузить настройки Hero:",
                    error
                );
            }
        }

        const isHero =
            heroCollectionId ===
            String(collection.id);

        const currentSize = [
            "small",
            "medium",
            "large"
        ].includes(String(collection.size))
            ? String(collection.size)
            : "medium";

        panel.classList.add("is-open");
        panel.innerHTML = `
            <div class="inspector-header">
                <div>
                    <span class="inspector-kicker">COLLECTION</span>
                    <h2>Свойства коллекции</h2>
                </div>

                <button
                    class="inspector-close"
                    type="button"
                    aria-label="Закрыть">
                    ×
                </button>
            </div>

            <form
                id="collectionInspectorForm"
                class="inspector-form">

                <section class="inspector-section">
                    <span class="inspector-section-title">
                        Основное
                    </span>

                    <label class="inspector-field">
                        <span>Название</span>
                        <input
                            id="inspectorCollectionName"
                            maxlength="120"
                            required>
                    </label>

                    <label class="inspector-field">
                        <span>Описание</span>
                        <textarea
                            id="inspectorCollectionDescription"
                            maxlength="300"
                            rows="6"
                            placeholder="Кратко расскажите об этой истории"></textarea>
                        <small>До 300 символов</small>
                    </label>
                </section>

                <section class="inspector-section">
                    <span class="inspector-section-title">
                        Отображение
                    </span>

                    <label class="inspector-field">
                        <span>Размер карточки</span>
                        <select id="inspectorCollectionSize">
                            <option value="small">Компактная</option>
                            <option value="medium">Средняя</option>
                            <option value="large">Крупная</option>
                        </select>
                    </label>

                    <label class="inspector-switch">
                        <input
                            id="inspectorCollectionPublished"
                            type="checkbox"
                            ${collection.published !== false
                                ? "checked"
                                : ""
                            }>
                        <span class="inspector-switch-track"></span>
                        <span class="inspector-switch-copy">
                            <strong>Опубликована</strong>
                            <small>Показывать коллекцию на сайте</small>
                        </span>
                    </label>

                    <label class="inspector-switch ${isHero
                        ? "is-locked"
                        : ""
                    }">
                        <input
                            id="inspectorCollectionHero"
                            type="checkbox"
                            ${isHero ? "checked disabled" : ""}>
                        <span class="inspector-switch-track"></span>
                        <span class="inspector-switch-copy">
                            <strong>${isHero
                                ? "Используется в Hero"
                                : "Использовать в Hero"
                            }</strong>
                            <small>${isHero
                                ? "Чтобы сменить Hero, выберите другую коллекцию"
                                : "Сделать коллекцию обложкой главной страницы"
                            }</small>
                        </span>
                    </label>
                </section>

                <div class="inspector-meta">
                    <span>ID</span>
                    <code>${this.escapeHtml(
                        collection.id
                    )}</code>
                </div>

                <button
                    class="inspector-save"
                    type="submit">
                    Сохранить изменения
                </button>
            </form>
        `;

        const form = panel.querySelector(
            "#collectionInspectorForm"
        );

        const nameInput = panel.querySelector(
            "#inspectorCollectionName"
        );

        const descriptionInput = panel.querySelector(
            "#inspectorCollectionDescription"
        );

        const sizeInput = panel.querySelector(
            "#inspectorCollectionSize"
        );

        const publishedInput = panel.querySelector(
            "#inspectorCollectionPublished"
        );

        const heroInput = panel.querySelector(
            "#inspectorCollectionHero"
        );

        const saveButton = panel.querySelector(
            ".inspector-save"
        );

        nameInput.value = collection.name || "";
        descriptionInput.value =
            collection.description || "";
        sizeInput.value = currentSize;

        panel
            .querySelector(".inspector-close")
            .addEventListener(
                "click",
                () => this.close()
            );

        form.addEventListener(
            "submit",
            async event => {
                event.preventDefault();

                const name = nameInput.value.trim();
                const description =
                    descriptionInput.value.trim();

                if (!name) {
                    nameInput.focus();
                    return;
                }

                saveButton.disabled = true;
                saveButton.textContent =
                    "Сохраняем...";

                try {
                    await CollectionService.updateDetails(
                        collection.id,
                        {
                            name,
                            description,
                            size: sizeInput.value,
                            published:
                                publishedInput.checked
                        }
                    );

                    if (
                        !isHero &&
                        heroInput.checked
                    ) {
                        await SiteSettingsService
                            .setHeroCollection(
                                collection.id
                            );
                    }

                    const title = document.querySelector(
                        ".collection-view .page-header h1"
                    );

                    if (
                        title &&
                        CollectionView.currentId ===
                        String(collection.id)
                    ) {
                        title.textContent = name;
                    }

                    if (
                        document.getElementById(
                            "collectionsContainer"
                        )
                    ) {
                        Collections.render();
                    }

                    this.markSelected(
                        "collection",
                        collection.id
                    );

                    saveButton.textContent = "Сохранено";

                    setTimeout(
                        () => {
                            saveButton.disabled = false;
                            saveButton.textContent =
                                "Сохранить изменения";
                        },
                        900
                    );
                } catch (error) {
                    console.error(error);
                    alert(
                        error.message ||
                        "Не удалось сохранить коллекцию."
                    );
                    saveButton.disabled = false;
                    saveButton.textContent =
                        "Сохранить изменения";
                }
            }
        );
    }

    static openPhoto(photoId) {
        const collectionId =
            CollectionView.currentId;

        const photo = PhotoService.getById(
            collectionId,
            photoId
        );

        const panel = this.ensurePanel();

        if (!photo || !panel) {
            return;
        }

        this.markSelected("photo", photo.id);

        const currentLayout = [
            "default",
            "story-left",
            "story-right"
        ].includes(photo.layout)
            ? photo.layout
            : "default";

        panel.classList.add("is-open");
        panel.innerHTML = `
            <div class="inspector-header">
                <div>
                    <span class="inspector-kicker">PHOTO</span>
                    <h2>Свойства кадра</h2>
                </div>

                <button
                    class="inspector-close"
                    type="button"
                    aria-label="Закрыть">
                    ×
                </button>
            </div>

            <div class="inspector-preview">
                <img
                    src="https://lh3.googleusercontent.com/d/${photo.fileId}=w700"
                    alt="${this.escapeHtml(
                        photo.name ||
                        "Фотография"
                    )}">
            </div>

            <form
                id="photoInspectorForm"
                class="inspector-form">

                <section class="inspector-section">
                    <span class="inspector-section-title">
                        История кадра
                    </span>

                    <label class="inspector-field">
                        <span>Описание</span>
                        <textarea
                            id="inspectorPhotoDescription"
                            maxlength="1200"
                            rows="6"
                            placeholder="Расскажите историю этого кадра"></textarea>
                        <small>До 1200 символов</small>
                    </label>
                </section>

                <section class="inspector-section">
                    <span class="inspector-section-title">
                        Расположение
                    </span>

                    <fieldset class="inspector-options">
                        ${this.layoutOption(
                            "default",
                            "Обычная сетка",
                            currentLayout
                        )}
                        ${this.layoutOption(
                            "story-left",
                            "Фото слева, текст справа",
                            currentLayout
                        )}
                        ${this.layoutOption(
                            "story-right",
                            "Текст слева, фото справа",
                            currentLayout
                        )}
                    </fieldset>
                </section>

                <div class="inspector-meta">
                    <span>${this.escapeHtml(
                        photo.name ||
                        "Фотография"
                    )}</span>
                    <code>${this.escapeHtml(
                        photo.id
                    )}</code>
                </div>

                <button
                    class="inspector-save"
                    type="submit">
                    Сохранить изменения
                </button>
            </form>
        `;

        const form = panel.querySelector(
            "#photoInspectorForm"
        );

        const descriptionInput = panel.querySelector(
            "#inspectorPhotoDescription"
        );

        const saveButton = panel.querySelector(
            ".inspector-save"
        );

        descriptionInput.value =
            photo.description || "";

        panel
            .querySelector(".inspector-close")
            .addEventListener(
                "click",
                () => this.close()
            );

        form.addEventListener(
            "submit",
            async event => {
                event.preventDefault();

                const description =
                    descriptionInput.value.trim();

                const selectedLayout =
                    form.querySelector(
                        'input[name="inspectorPhotoLayout"]:checked'
                    )?.value || "default";

                const layout = description
                    ? selectedLayout
                    : "default";

                saveButton.disabled = true;
                saveButton.textContent =
                    "Сохраняем...";

                try {
                    await PhotoService.update(
                        collectionId,
                        photo.id,
                        {
                            description,
                            layout
                        }
                    );

                    CollectionView.renderPhotos();
                    this.markSelected(
                        "photo",
                        photo.id
                    );

                    saveButton.textContent = "Сохранено";

                    setTimeout(
                        () => {
                            saveButton.disabled = false;
                            saveButton.textContent =
                                "Сохранить изменения";
                        },
                        900
                    );
                } catch (error) {
                    console.error(error);
                    alert(
                        error.message ||
                        "Не удалось сохранить фотографию."
                    );
                    saveButton.disabled = false;
                    saveButton.textContent =
                        "Сохранить изменения";
                }
            }
        );
    }

    static layoutOption(value, label, current) {
        return `
            <label class="inspector-radio">
                <input
                    type="radio"
                    name="inspectorPhotoLayout"
                    value="${value}"
                    ${value === current
                        ? "checked"
                        : ""
                    }>
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

window.addEventListener(
    "DOMContentLoaded",
    () => {
        const bindInspector = () => {
            if (
                !document.getElementById(
                    "inspector"
                )
            ) {
                return;
            }

            Inspector.init();

            Collections.openEditor = id =>
                Inspector.openCollection(id);

            CollectionView.openPhotoEditor = id =>
                Inspector.openPhoto(id);
        };

        setTimeout(bindInspector, 0);
    }
);
