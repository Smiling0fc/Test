(() => {
    class HomepageAbout {
        static settings = null;
        static photoLibrary = [];

        static escape(value) {
            return String(value || "")
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll('"', "&quot;")
                .replaceAll("'", "&#039;");
        }

        static imageUrl(fileId, width = 1100) {
            const id = String(fileId || "").trim();

            return id
                ? `https://lh3.googleusercontent.com/d/${encodeURIComponent(id)}=w${width}`
                : "";
        }

        static async mount() {
            const stage = document.querySelector(".homepage-stage");
            const collectionsPreview = document.getElementById(
                "homepageCollectionsPreview"
            );

            if (!stage) {
                return;
            }

            let preview = document.getElementById(
                "homepageAboutPreview"
            );

            if (!preview) {
                preview = document.createElement("button");
                preview.id = "homepageAboutPreview";
                preview.className = "homepage-about-preview";
                preview.type = "button";
                preview.setAttribute(
                    "aria-label",
                    "Редактировать блок О фотографе"
                );

                preview.addEventListener(
                    "click",
                    () => Inspector.openAbout()
                );
            }

            if (collectionsPreview) {
                stage.insertBefore(preview, collectionsPreview);
            } else {
                stage.appendChild(preview);
            }

            try {
                this.settings = await AppearanceService.load();
                this.renderPreview(this.settings);
            } catch (error) {
                console.warn(
                    "Не удалось загрузить блок О фотографе:",
                    error
                );
                this.settings = AppearanceService.normalize({});
                this.renderPreview(this.settings);
            }

            this.updateToolbar();
            this.updateHint();
        }

        static renderPreview(settings = {}) {
            const preview = document.getElementById(
                "homepageAboutPreview"
            );

            if (!preview) {
                return;
            }

            const data = AppearanceService.normalize(settings);
            const primaryUrl = this.imageUrl(
                data.aboutPrimaryImageId
            );
            const secondaryUrl = this.imageUrl(
                data.aboutSecondaryImageId
            );

            preview.innerHTML = `
                <span class="homepage-about-copy">
                    <small>О ФОТОГРАФЕ</small>
                    <strong>${this.escape(data.aboutTitle)}</strong>
                    <span>${this.escape(data.aboutText)}</span>
                </span>

                <span class="homepage-about-images">
                    <span class="homepage-about-image is-primary">
                        ${primaryUrl
                            ? `<img src="${primaryUrl}" alt="Основная фотография блока" loading="lazy">`
                            : `<i>Автоматический кадр</i>`}
                    </span>
                    <span class="homepage-about-image is-secondary">
                        ${secondaryUrl
                            ? `<img src="${secondaryUrl}" alt="Вторая фотография блока" loading="lazy">`
                            : `<i>Автоматический кадр</i>`}
                    </span>
                </span>

                <span class="homepage-preview-object-label">
                    ABOUT
                </span>
            `;
        }

        static updateToolbar() {
            const label = document.querySelector(
                ".homepage-stage-toolbar > span:last-child"
            );
            const count = CollectionService
                .getAll()
                .filter(collection => collection.published === true)
                .length;

            if (label) {
                label.textContent = count
                    ? `Hero + About + ${count} коллекций`
                    : "Hero + About";
            }
        }

        static updateHint() {
            const hint = document.querySelector(
                ".homepage-editor-hint"
            );

            if (hint) {
                hint.innerHTML = `
                    <span>◇</span>
                    Нажмите на Hero, блок «О фотографе» или карточку коллекции,
                    чтобы открыть настройки в Inspector.
                `;
            }
        }

        static async loadPhotoLibrary() {
            const collections = CollectionService.getAll();
            const groups = await Promise.all(
                collections.map(async collection => {
                    let photos = PhotoService.getByCollection(
                        collection.id
                    );

                    if (!photos.length) {
                        try {
                            photos = await PhotoService.load(
                                collection.id
                            );
                        } catch (error) {
                            console.warn(
                                `Не удалось загрузить медиатеку ${collection.name}:`,
                                error
                            );
                            photos = [];
                        }
                    }

                    return photos.map(photo => ({
                        collectionId: String(collection.id),
                        collectionName: String(collection.name || "Коллекция"),
                        photoId: String(photo.id || ""),
                        name: String(photo.name || "Фотография"),
                        fileId: String(
                            photo.galleryFileId ||
                            photo.previewFileId ||
                            photo.fileId ||
                            ""
                        )
                    })).filter(item => item.fileId);
                })
            );

            this.photoLibrary = groups.flat();
            return this.photoLibrary;
        }

        static buildPhotoOptions() {
            const groups = new Map();

            this.photoLibrary.forEach(photo => {
                if (!groups.has(photo.collectionName)) {
                    groups.set(photo.collectionName, []);
                }
                groups.get(photo.collectionName).push(photo);
            });

            return `
                <option value="">Автоматически из последних историй</option>
                ${Array.from(groups.entries()).map(([name, photos]) => `
                    <optgroup label="${this.escape(name)}">
                        ${photos.map(photo => `
                            <option value="${this.escape(photo.fileId)}">
                                ${this.escape(photo.name)}
                            </option>
                        `).join("")}
                    </optgroup>
                `).join("")}
            `;
        }

        static photoName(fileId) {
            return this.photoLibrary.find(photo =>
                photo.fileId === String(fileId || "")
            )?.name || "Автоматический кадр";
        }

        static renderInspectorImage(root, fileId, position) {
            if (!root) {
                return;
            }

            const url = this.imageUrl(fileId, 700);

            root.innerHTML = url
                ? `
                    <img src="${url}" alt="${this.escape(position)}">
                    <span>${this.escape(this.photoName(fileId))}</span>
                `
                : `
                    <div class="homepage-about-picker-empty">◇</div>
                    <span>Автоматический кадр</span>
                `;
        }
    }

    window.HomepageAbout = HomepageAbout;

    const previousHomepageRender = Homepage.render.bind(Homepage);

    Homepage.render = async function () {
        await previousHomepageRender();
        await HomepageAbout.mount();
    };

    if (typeof Homepage.renderCollectionsPreview === "function") {
        const previousCollectionsPreview =
            Homepage.renderCollectionsPreview.bind(Homepage);

        Homepage.renderCollectionsPreview = async function () {
            const result = await previousCollectionsPreview();
            HomepageAbout.updateToolbar();
            return result;
        };
    }

    const previousClearSelection =
        Inspector.clearSelection.bind(Inspector);

    Inspector.clearSelection = function () {
        previousClearSelection();
        document
            .getElementById("homepageAboutPreview")
            ?.classList.remove("is-selected");
    };

    Inspector.openAbout = async function () {
        const panel = this.ensurePanel();

        if (!panel) {
            return;
        }

        this.clearSelection();
        this.selectedType = "about";
        this.selectedId = "about";

        document
            .getElementById("homepageAboutPreview")
            ?.classList.add("is-selected");

        panel.classList.add("is-open");
        panel.innerHTML = `
            <div class="inspector-header">
                <div>
                    <span class="inspector-kicker">HOMEPAGE</span>
                    <h2>О фотографе</h2>
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
                <p>Загружаем медиатеку</p>
                <span>Собираем фотографии из коллекций.</span>
            </div>
        `;

        panel
            .querySelector(".inspector-close")
            .addEventListener("click", () => this.close());

        const [settings] = await Promise.all([
            AppearanceService.load(),
            HomepageAbout.loadPhotoLibrary()
        ]);

        if (!panel.classList.contains("is-open")) {
            return;
        }

        HomepageAbout.settings = settings;

        panel.innerHTML = `
            <div class="inspector-header">
                <div>
                    <span class="inspector-kicker">HOMEPAGE</span>
                    <h2>О фотографе</h2>
                </div>
                <button
                    class="inspector-close"
                    type="button"
                    aria-label="Закрыть">
                    ×
                </button>
            </div>

            <form id="aboutInspectorForm" class="inspector-form">
                <section class="inspector-section">
                    <span class="inspector-section-title">Текст</span>

                    <label class="inspector-field">
                        <span>Заголовок</span>
                        <input
                            id="aboutTitleInput"
                            type="text"
                            maxlength="140"
                            autocomplete="off">
                    </label>

                    <label class="inspector-field">
                        <span>Описание</span>
                        <textarea
                            id="aboutTextInput"
                            rows="7"
                            maxlength="700"></textarea>
                    </label>
                </section>

                <section class="inspector-section">
                    <span class="inspector-section-title">Фотографии</span>

                    <label class="inspector-field">
                        <span>Основная фотография</span>
                        <select id="aboutPrimaryImageSelect">
                            ${HomepageAbout.buildPhotoOptions()}
                        </select>
                    </label>
                    <div
                        id="aboutPrimaryImagePreview"
                        class="homepage-about-picker-preview">
                    </div>

                    <label class="inspector-field">
                        <span>Вторая фотография</span>
                        <select id="aboutSecondaryImageSelect">
                            ${HomepageAbout.buildPhotoOptions()}
                        </select>
                    </label>
                    <div
                        id="aboutSecondaryImagePreview"
                        class="homepage-about-picker-preview">
                    </div>

                    <div class="inspector-note">
                        Пункт «Автоматически» сохраняет нынешнее поведение:
                        сайт возьмёт кадры из последних опубликованных историй.
                    </div>
                </section>

                <button class="inspector-save" type="submit">
                    Сохранить блок
                </button>
            </form>
        `;

        const form = panel.querySelector("#aboutInspectorForm");
        const titleInput = panel.querySelector("#aboutTitleInput");
        const textInput = panel.querySelector("#aboutTextInput");
        const primarySelect = panel.querySelector(
            "#aboutPrimaryImageSelect"
        );
        const secondarySelect = panel.querySelector(
            "#aboutSecondaryImageSelect"
        );
        const primaryPreview = panel.querySelector(
            "#aboutPrimaryImagePreview"
        );
        const secondaryPreview = panel.querySelector(
            "#aboutSecondaryImagePreview"
        );
        const saveButton = panel.querySelector(".inspector-save");

        titleInput.value = settings.aboutTitle;
        textInput.value = settings.aboutText;
        primarySelect.value = settings.aboutPrimaryImageId;
        secondarySelect.value = settings.aboutSecondaryImageId;

        const updateDraft = () => {
            const draft = {
                ...settings,
                aboutTitle: titleInput.value.trim(),
                aboutText: textInput.value.trim(),
                aboutPrimaryImageId: primarySelect.value,
                aboutSecondaryImageId: secondarySelect.value
            };

            HomepageAbout.renderPreview(draft);
            document
                .getElementById("homepageAboutPreview")
                ?.classList.add("is-selected");

            HomepageAbout.renderInspectorImage(
                primaryPreview,
                primarySelect.value,
                "Основная фотография"
            );
            HomepageAbout.renderInspectorImage(
                secondaryPreview,
                secondarySelect.value,
                "Вторая фотография"
            );
        };

        [
            titleInput,
            textInput,
            primarySelect,
            secondarySelect
        ].forEach(field => {
            field.addEventListener("input", updateDraft);
            field.addEventListener("change", updateDraft);
        });

        updateDraft();

        panel
            .querySelector(".inspector-close")
            .addEventListener("click", () => this.close());

        form.addEventListener("submit", async event => {
            event.preventDefault();

            const aboutTitle = titleInput.value.trim();
            const aboutText = textInput.value.trim();

            if (!aboutTitle || !aboutText) {
                alert("Заполните заголовок и описание блока.");
                return;
            }

            saveButton.disabled = true;
            saveButton.textContent = "Сохраняем…";

            try {
                const saved = await AppearanceService.saveAll({
                    aboutTitle,
                    aboutText,
                    aboutPrimaryImageId: primarySelect.value,
                    aboutSecondaryImageId: secondarySelect.value
                });

                HomepageAbout.settings = saved;
                HomepageAbout.renderPreview(saved);
                saveButton.textContent = "Сохранено";

                setTimeout(() => {
                    if (saveButton.isConnected) {
                        saveButton.textContent = "Сохранить блок";
                    }
                }, 1800);
            } catch (error) {
                console.error(error);
                saveButton.textContent = "Сохранить блок";
                alert(
                    error.message ||
                    "Не удалось сохранить блок О фотографе."
                );
            } finally {
                saveButton.disabled = false;
            }
        });
    };
})();
