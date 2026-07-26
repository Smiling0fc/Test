class Homepage {

    static currentPreviewCollectionId = "";

    static async render() {

        const content = document.getElementById("content");

        content.innerHTML = `
            <div class="homepage-editor fade">
                <div class="page-header homepage-page-header">
                    <div>
                        <span class="homepage-kicker">SITE EDITOR</span>
                        <h1>Главная страница</h1>
                        <p>
                            Выберите элемент в предпросмотре,
                            чтобы открыть его свойства справа.
                        </p>
                    </div>

                    <button
                        id="openPublicSite"
                        class="secondaryButton"
                        type="button">
                        Открыть сайт ↗
                    </button>
                </div>

                <section class="homepage-stage">
                    <div class="homepage-stage-toolbar">
                        <span>Предпросмотр · Desktop</span>
                        <span>Hero</span>
                    </div>

                    <button
                        id="homepageHeroPreview"
                        class="homepage-hero-preview"
                        type="button"
                        aria-label="Редактировать Hero">
                        <div class="homepage-preview-loading">
                            Загружаем Hero...
                        </div>
                    </button>
                </section>

                <div class="homepage-editor-hint">
                    <span>◇</span>
                    Нажмите на Hero, чтобы открыть настройки в Inspector.
                </div>
            </div>
        `;

        document
            .getElementById("openPublicSite")
            .addEventListener(
                "click",
                () => window.open(
                    "../",
                    "_blank",
                    "noopener"
                )
            );

        document
            .getElementById("homepageHeroPreview")
            .addEventListener(
                "click",
                () => Inspector.openHero()
            );

        try {
            const settings =
                await SiteSettingsService.load();

            const collection =
                this.getCollection(
                    settings.heroCollectionId
                );

            await this.renderPreview(
                collection?.id || ""
            );

        } catch (error) {
            console.error(error);
            this.renderPreviewError(
                error.message ||
                "Не удалось загрузить настройки Hero."
            );
        }

    }

    static getCollection(collectionId) {

        const collections =
            CollectionService.getAll();

        return collections.find(collection =>
            String(collection.id) ===
            String(collectionId || "")
        ) || collections.find(collection =>
            collection.published !== false
        ) || collections[0] || null;

    }

    static async renderPreview(collectionId) {

        const preview = document.getElementById(
            "homepageHeroPreview"
        );

        if (!preview) {
            return;
        }

        const collection =
            this.getCollection(collectionId);

        if (!collection) {
            this.currentPreviewCollectionId = "";
            preview.classList.remove("has-image");
            preview.style.removeProperty(
                "--homepage-hero-image"
            );
            preview.innerHTML = `
                <div class="homepage-preview-empty">
                    <span>◇</span>
                    <strong>Коллекций пока нет</strong>
                    <small>
                        Создайте коллекцию, чтобы собрать Hero.
                    </small>
                </div>
            `;
            return;
        }

        this.currentPreviewCollectionId =
            String(collection.id);

        preview.innerHTML = `
            <div class="homepage-preview-loading">
                Загружаем обложку...
            </div>
        `;

        let photos = PhotoService.getByCollection(
            collection.id
        );

        if (!photos.length) {
            photos = await PhotoService.load(
                collection.id
            );
        }

        const cover = photos.find(photo =>
            String(photo.id) ===
            String(collection.coverPhotoId || "")
        ) || photos[0] || null;

        if (cover?.fileId) {
            preview.classList.add("has-image");
            preview.style.setProperty(
                "--homepage-hero-image",
                `url("https://lh3.googleusercontent.com/d/${cover.fileId}=w1800")`
            );
        } else {
            preview.classList.remove("has-image");
            preview.style.removeProperty(
                "--homepage-hero-image"
            );
        }

        const description = String(
            collection.description || ""
        ).trim();

        preview.innerHTML = `
            <div class="homepage-hero-shade"></div>

            <div class="homepage-hero-brand">
                ViJoy's
                <span>Photo Gallery</span>
            </div>

            <div class="homepage-hero-content">
                <span class="homepage-hero-label">
                    SELECTED STORY
                </span>

                <h2>
                    ${this.escapeHtml(
                        collection.name
                    )}
                </h2>

                <p>
                    ${this.escapeHtml(
                        description ||
                        "Описание коллекции появится здесь."
                    )}
                </p>

                <span class="homepage-hero-count">
                    ${photos.length}
                    ${this.getPhotoWord(
                        photos.length
                    )}
                </span>
            </div>

            <div class="homepage-object-label">
                HERO
            </div>
        `;

    }

    static renderPreviewError(message) {

        const preview = document.getElementById(
            "homepageHeroPreview"
        );

        if (!preview) {
            return;
        }

        preview.classList.remove("has-image");
        preview.innerHTML = `
            <div class="homepage-preview-empty">
                <span>!</span>
                <strong>Не удалось загрузить Hero</strong>
                <small>${this.escapeHtml(message)}</small>
            </div>
        `;

    }

    static getPhotoWord(count) {

        const value = Math.abs(Number(count)) % 100;
        const last = value % 10;

        if (value > 10 && value < 20) {
            return "фотографий";
        }

        if (last === 1) {
            return "фотография";
        }

        if (last >= 2 && last <= 4) {
            return "фотографии";
        }

        return "фотографий";

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

const inspectorClearSelection =
    Inspector.clearSelection.bind(Inspector);

Inspector.clearSelection = function () {

    inspectorClearSelection();

    document
        .querySelectorAll(
            ".homepage-hero-preview.is-selected"
        )
        .forEach(element =>
            element.classList.remove("is-selected")
        );

};

Inspector.openHero = async function () {

    const panel = this.ensurePanel();
    const collections = CollectionService.getAll();

    if (!panel) {
        return;
    }

    this.clearSelection();
    this.selectedType = "hero";

    document
        .getElementById("homepageHeroPreview")
        ?.classList.add("is-selected");

    panel.classList.add("is-open");

    if (!collections.length) {
        panel.innerHTML = `
            <div class="inspector-header">
                <div>
                    <span class="inspector-kicker">HOMEPAGE</span>
                    <h2>Hero</h2>
                </div>

                <button
                    class="inspector-close"
                    type="button"
                    aria-label="Закрыть">
                    ×
                </button>
            </div>

            <div class="inspector-empty">
                <div class="inspector-empty-icon">◇</div>
                <p>Сначала создайте коллекцию.</p>
                <span>
                    После этого её можно будет выбрать для Hero.
                </span>
            </div>
        `;

        panel
            .querySelector(".inspector-close")
            .addEventListener(
                "click",
                () => this.close()
            );

        return;
    }

    let settings = SiteSettingsService.get();

    try {
        settings = await SiteSettingsService.load();
    } catch (error) {
        console.warn(
            "Не удалось обновить настройки Hero:",
            error
        );
    }

    const selectedCollection =
        Homepage.getCollection(
            settings.heroCollectionId
        );

    const selectedId = String(
        selectedCollection?.id ||
        collections[0].id
    );

    this.selectedId = selectedId;

    panel.innerHTML = `
        <div class="inspector-header">
            <div>
                <span class="inspector-kicker">HOMEPAGE</span>
                <h2>Hero</h2>
            </div>

            <button
                class="inspector-close"
                type="button"
                aria-label="Закрыть">
                ×
            </button>
        </div>

        <form
            id="heroInspectorForm"
            class="inspector-form">

            <section class="inspector-section">
                <span class="inspector-section-title">
                    Источник
                </span>

                <label class="inspector-field">
                    <span>Коллекция</span>
                    <select id="inspectorHeroCollection">
                        ${collections.map(collection => `
                            <option value="${Homepage.escapeHtml(
                                collection.id
                            )}">
                                ${Homepage.escapeHtml(
                                    collection.name
                                )}
                            </option>
                        `).join("")}
                    </select>
                </label>

                <div
                    id="inspectorHeroSummary"
                    class="inspector-hero-summary">
                </div>
            </section>

            <section class="inspector-section">
                <span class="inspector-section-title">
                    Содержимое
                </span>

                <div class="inspector-note">
                    Заголовок и описание Hero берутся из выбранной
                    коллекции. Это сохраняет главную страницу и
                    карточку истории синхронными.
                </div>

                <button
                    id="editHeroCollection"
                    class="inspector-link-button"
                    type="button">
                    Редактировать коллекцию →
                </button>
            </section>

            <button
                class="inspector-save"
                type="submit">
                Сохранить Hero
            </button>
        </form>
    `;

    const form = panel.querySelector(
        "#heroInspectorForm"
    );

    const select = panel.querySelector(
        "#inspectorHeroCollection"
    );

    const summary = panel.querySelector(
        "#inspectorHeroSummary"
    );

    const saveButton = panel.querySelector(
        ".inspector-save"
    );

    select.value = selectedId;

    const updateSummary = collectionId => {

        const collection = Homepage.getCollection(
            collectionId
        );

        if (!collection) {
            summary.innerHTML = "";
            return;
        }

        summary.innerHTML = `
            <strong>${Homepage.escapeHtml(
                collection.name
            )}</strong>
            <p>
                ${Homepage.escapeHtml(
                    collection.description ||
                    "Описание коллекции пока не добавлено."
                )}
            </p>
            <span>
                ${collection.published !== false
                    ? "Опубликована"
                    : "Скрыта на сайте"
                }
            </span>
        `;

    };

    updateSummary(select.value);

    select.addEventListener(
        "change",
        async () => {
            this.selectedId = select.value;
            updateSummary(select.value);
            await Homepage.renderPreview(
                select.value
            );
            document
                .getElementById("homepageHeroPreview")
                ?.classList.add("is-selected");
        }
    );

    panel
        .querySelector(".inspector-close")
        .addEventListener(
            "click",
            async () => {
                this.close();
                const saved = SiteSettingsService.get();
                await Homepage.renderPreview(
                    saved.heroCollectionId
                );
            }
        );

    panel
        .querySelector("#editHeroCollection")
        .addEventListener(
            "click",
            () => this.openCollection(
                select.value
            )
        );

    form.addEventListener(
        "submit",
        async event => {
            event.preventDefault();

            saveButton.disabled = true;
            saveButton.textContent = "Сохраняем...";

            try {
                await SiteSettingsService
                    .setHeroCollection(
                        select.value
                    );

                await Homepage.renderPreview(
                    select.value
                );

                document
                    .getElementById(
                        "homepageHeroPreview"
                    )
                    ?.classList.add("is-selected");

                saveButton.textContent = "Сохранено";

                setTimeout(
                    () => {
                        saveButton.disabled = false;
                        saveButton.textContent =
                            "Сохранить Hero";
                    },
                    900
                );

            } catch (error) {
                console.error(error);
                alert(
                    error.message ||
                    "Не удалось сохранить Hero."
                );
                saveButton.disabled = false;
                saveButton.textContent =
                    "Сохранить Hero";
            }
        }
    );

};
