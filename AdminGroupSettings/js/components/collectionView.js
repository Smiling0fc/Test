class CollectionView {

    static currentId = null;
    static isUploading = false;

    static async open(id) {

        this.currentId = String(id);

        const collection =
            CollectionService.getById(
                this.currentId
            );

        if (!collection) {

            document
                .getElementById("content")
                .innerHTML = `

                    <div class="dashboard fade">

                        <h1>
                            Коллекция не найдена
                        </h1>

                        <button
                            id="backCollections"
                            class="secondaryButton"
                            type="button">

                            ← К коллекциям

                        </button>

                    </div>

                `;

            document
                .getElementById(
                    "backCollections"
                )
                .addEventListener(
                    "click",
                    () => Collections.render()
                );

            return;

        }

        document
            .getElementById("content")
            .innerHTML = `

                <div class="collection-view fade">

                    <div class="page-header">

                        <div>

                            <h1>
                                ${collection.name}
                            </h1>

                            <p id="collectionPhotoCount">
                                Загрузка данных...
                            </p>

                        </div>

                        <div
                            class="collection-view-actions">

                            <button
                                id="backCollections"
                                class="secondaryButton"
                                type="button">

                                ← Назад

                            </button>

                        </div>

                    </div>

                    <input
                        id="photoInput"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        hidden>

                    <div
                        id="photoDropzone"
                        class="photo-dropzone glass"
                        role="button"
                        tabindex="0">

                        <div class="dropzone-icon">
                            📷
                        </div>

                        <h2>
                            Добавить фотографии
                        </h2>

                        <p>
                            Перетащите изображения сюда
                            или нажмите для выбора
                        </p>

                        <span>
                            JPG, PNG и WebP
                        </span>

                    </div>

                    <div
                        id="uploadStatus"
                        class="upload-status glass"
                        hidden>

                        <div class="upload-status-header">

                            <span id="uploadStatusText">
                                Подготовка...
                            </span>

                            <span id="uploadStatusCounter">
                                0 / 0
                            </span>

                        </div>

                        <div class="upload-progress">

                            <div
                                id="uploadProgressBar"
                                class="upload-progress-bar">
                            </div>

                        </div>

                        <p
                            id="uploadCurrentFile"
                            class="upload-current-file">
                        </p>

                    </div>

                    <div
                        id="photoGallery"
                        class="photo-gallery">

                        <div class="glass empty-state">

                            <h2>
                                Загружаем фотографии
                            </h2>

                            <p>
                                Получаем данные из Google Drive.
                            </p>

                        </div>

                    </div>

                </div>

            `;

        this.bindPageEvents();

        try {

            await PhotoService.load(
                this.currentId
            );

            this.renderPhotos();

        } catch (error) {

            console.error(error);

            this.renderLoadError(
                error.message
            );

        }

    }

    static bindPageEvents() {

        const backButton =
            document.getElementById(
                "backCollections"
            );

        const photoInput =
            document.getElementById(
                "photoInput"
            );

        const dropzone =
            document.getElementById(
                "photoDropzone"
            );

        backButton.addEventListener(
            "click",
            () => Collections.render()
        );

        dropzone.addEventListener(
            "click",
            () => {

                if (!this.isUploading) {
                    photoInput.click();
                }

            }
        );

        dropzone.addEventListener(
            "keydown",
            event => {

                if (
                    event.key !== "Enter" &&
                    event.key !== " "
                ) {
                    return;
                }

                event.preventDefault();

                if (!this.isUploading) {
                    photoInput.click();
                }

            }
        );

        photoInput.addEventListener(
            "change",
            async event => {

                await this.addPhotos(
                    event.target.files
                );

                event.target.value = "";

            }
        );

        this.bindDropzoneEvents();
        this.bindGalleryEvents();

    }

    static bindDropzoneEvents() {

        const dropzone =
            document.getElementById(
                "photoDropzone"
            );

        if (!dropzone) {
            return;
        }

        const preventDefaults = event => {

            event.preventDefault();
            event.stopPropagation();

        };

        [
            "dragenter",
            "dragover",
            "dragleave",
            "drop"
        ].forEach(eventName => {

            dropzone.addEventListener(
                eventName,
                preventDefaults
            );

        });

        [
            "dragenter",
            "dragover"
        ].forEach(eventName => {

            dropzone.addEventListener(
                eventName,
                () => {

                    if (!this.isUploading) {

                        dropzone.classList.add(
                            "drag-active"
                        );

                    }

                }
            );

        });

        [
            "dragleave",
            "drop"
        ].forEach(eventName => {

            dropzone.addEventListener(
                eventName,
                () => {

                    dropzone.classList.remove(
                        "drag-active"
                    );

                }
            );

        });

        dropzone.addEventListener(
            "drop",
            async event => {

                if (this.isUploading) {
                    return;
                }

                await this.addPhotos(
                    event.dataTransfer.files
                );

            }
        );

    }
static bindGalleryEvents() {

    const gallery =
        document.getElementById(
            "photoGallery"
        );

    if (!gallery) {
        return;
    }

    gallery.onclick = async event => {

        const coverButton =
            event.target.closest(
                ".setCoverButton"
            );

        if (coverButton) {

            await this.setCoverPhoto(
                coverButton.dataset.photoId,
                coverButton
            );

            return;

        }
const editButton =
    event.target.closest(
        ".editPhotoButton"
    );

if (editButton) {

    this.openPhotoEditor(
        editButton.dataset.photoId
    );

    return;

}
        const deleteButton =
            event.target.closest(
                ".deletePhotoButton"
            );

        if (!deleteButton) {
            return;
        }

        await this.removePhoto(
            deleteButton.dataset.photoId,
            deleteButton
        );

    };

}

    static async addPhotos(files) {

        if (
            this.isUploading ||
            !files ||
            files.length === 0
        ) {
            return;
        }

        const imageFiles =
            Array.from(files)
                .filter(file =>
                    [
                        "image/jpeg",
                        "image/png",
                        "image/webp"
                    ].includes(file.type)
                );

        if (imageFiles.length === 0) {

            alert(
                "Выберите фотографии в формате JPG, PNG или WebP."
            );

            return;

        }

        this.isUploading = true;
        this.setUploadInterface(true);

        try {

            await PhotoService.uploadMany(

                this.currentId,

                imageFiles,

                progress => {

                    this.updateUploadProgress(
                        progress.completed,
                        progress.total,
                        progress.file.name
                    );

                    this.renderPhotos();

                }

            );

            this.updateUploadProgress(
                imageFiles.length,
                imageFiles.length,
                "Загрузка завершена"
            );

            this.renderPhotos();

        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Не удалось загрузить фотографию."
            );

        } finally {

            this.isUploading = false;

            setTimeout(
                () => {

                    this.setUploadInterface(
                        false
                    );

                },
                1000
            );

        }

    }
static async setCoverPhoto(
    photoId,
    button
) {

    if (!photoId || button.disabled) {
        return;
    }

    button.disabled = true;

    const oldText =
        button.textContent;

    button.textContent = "…";

    try {

        await CollectionService.setCover(
            this.currentId,
            photoId
        );

        this.renderPhotos();

    } catch (error) {

        console.error(error);

        button.disabled = false;
        button.textContent = oldText;

        alert(
            error.message ||
            "Не удалось изменить обложку."
        );

    }

}
    static openPhotoEditor(photoId) {

    const photo =
        PhotoService.getById(
            this.currentId,
            photoId
        );

    if (!photo) {
        return;
    }

    const oldOverlay =
        document.querySelector(
            ".photo-editor-overlay"
        );

    if (oldOverlay) {
        oldOverlay.remove();
    }

    const overlay =
        document.createElement("div");

    overlay.className =
        "photo-editor-overlay";

    overlay.innerHTML = `

        <div
            class="photo-editor glass"
            role="dialog"
            aria-modal="true"
            aria-labelledby="photoEditorTitle">

            <div class="photo-editor-header">

                <div>

                    <span class="editor-kicker">
                        Фотография
                    </span>

                    <h2 id="photoEditorTitle">
                        Редактирование
                    </h2>

                </div>

                <button
                    class="photo-editor-close"
                    type="button"
                    aria-label="Закрыть">

                    ×

                </button>

            </div>

            <div class="photo-editor-preview">

                <img
                    src="https://lh3.googleusercontent.com/d/${photo.fileId}=w900"
                    alt="${this.escapeHtml(
                        photo.name
                    )}">

            </div>

            <form id="photoEditorForm">

                <label class="editor-field">

                    <span>
                        Описание
                    </span>

                    <textarea
                        id="photoDescriptionInput"
                        maxlength="1200"
                        rows="6"
                        placeholder="Расскажите историю этого кадра"></textarea>

                    <small>
                        До 1200 символов
                    </small>

                </label>

                <fieldset class="photo-layout-options">

                    <legend>
                        Расположение
                    </legend>

                    <label>

                        <input
                            type="radio"
                            name="photoLayout"
                            value="default">

                        <span>
                            Обычная фотография
                        </span>

                    </label>

                    <label>

                        <input
                            type="radio"
                            name="photoLayout"
                            value="story-left">

                        <span>
                            Фото слева, текст справа
                        </span>

                    </label>

                    <label>

                        <input
                            type="radio"
                            name="photoLayout"
                            value="story-right">

                        <span>
                            Текст слева, фото справа
                        </span>

                    </label>

                </fieldset>

                <div class="photo-editor-note">

                    При пустом описании фотография
                    автоматически вернётся в обычную сетку.

                </div>

                <div class="photo-editor-actions">

                    <button
                        class="secondaryButton photo-editor-cancel"
                        type="button">

                        Отмена

                    </button>

                    <button
                        class="primaryButton photo-editor-save"
                        type="submit">

                        Сохранить

                    </button>

                </div>

            </form>

        </div>

    `;

    document.body.appendChild(
        overlay
    );

    document.body.classList.add(
        "editor-open"
    );

    const form =
        overlay.querySelector(
            "#photoEditorForm"
        );

    const descriptionInput =
        overlay.querySelector(
            "#photoDescriptionInput"
        );

    const saveButton =
        overlay.querySelector(
            ".photo-editor-save"
        );

    descriptionInput.value =
        photo.description || "";

    const currentLayout =
        [
            "default",
            "story-left",
            "story-right"
        ].includes(photo.layout)
            ? photo.layout
            : "default";

    const checkedInput =
        overlay.querySelector(
            `input[name="photoLayout"][value="${currentLayout}"]`
        );

    if (checkedInput) {
        checkedInput.checked = true;
    }

    const closeEditor = () => {

        document.removeEventListener(
            "keydown",
            handleKeyboard
        );

        document.body.classList.remove(
            "editor-open"
        );

        overlay.remove();

    };

    const handleKeyboard = event => {

        if (event.key === "Escape") {
            closeEditor();
        }

    };

    overlay
        .querySelector(
            ".photo-editor-close"
        )
        .addEventListener(
            "click",
            closeEditor
        );

    overlay
        .querySelector(
            ".photo-editor-cancel"
        )
        .addEventListener(
            "click",
            closeEditor
        );

    overlay.addEventListener(
        "click",
        event => {

            if (event.target === overlay) {
                closeEditor();
            }

        }
    );

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const description =
                descriptionInput
                    .value
                    .trim();

            const layoutInput =
                form.querySelector(
                    'input[name="photoLayout"]:checked'
                );

            const layout =
                description
                    ? String(
                        layoutInput?.value ||
                        "default"
                    )
                    : "default";

            saveButton.disabled = true;
            saveButton.textContent =
                "Сохраняем...";

            try {

                await PhotoService.update(
                    this.currentId,
                    photo.id,
                    {
                        description,
                        layout
                    }
                );

                closeEditor();

                this.renderPhotos();

            } catch (error) {

                console.error(error);

                saveButton.disabled = false;
                saveButton.textContent =
                    "Сохранить";

                alert(
                    error.message ||
                    "Не удалось сохранить фотографию."
                );

            }

        }
    );

    document.addEventListener(
        "keydown",
        handleKeyboard
    );

    requestAnimationFrame(
        () => descriptionInput.focus()
    );

}

static getPhotoLayoutLabel(layout) {

    const labels = {

        "default":
            "Обычная сетка",

        "story-left":
            "Фото слева",

        "story-right":
            "Фото справа"

    };

    return labels[layout] ||
        labels.default;

}
    static async removePhoto(
        photoId,
        button
    ) {

        const confirmed = confirm(
            "Удалить эту фотографию?"
        );

        if (!confirmed) {
            return;
        }

        button.disabled = true;
        button.textContent = "…";

        try {

            await PhotoService.remove(
                this.currentId,
                photoId
            );

            this.renderPhotos();

        } catch (error) {

            console.error(error);

            button.disabled = false;
            button.textContent = "🗑️";

            alert(
                error.message ||
                "Не удалось удалить фотографию."
            );

        }

    }

    static renderPhotos() {

        const gallery =
            document.getElementById(
                "photoGallery"
            );

        const countElement =
            document.getElementById(
                "collectionPhotoCount"
            );

        if (!gallery || !countElement) {
            return;
        }

        const photos =
            PhotoService.getByCollection(
                this.currentId
            );
        const collection =
    CollectionService.getById(
        this.currentId
    );

const coverPhotoId =
    String(
        collection?.coverPhotoId || ""
    );

        countElement.textContent =
            `${photos.length} ${this.getPhotoWord(
                photos.length
            )}`;

        if (photos.length === 0) {

            gallery.innerHTML = `

                <div class="glass empty-state">

                    <h2>
                        Пока фотографий нет
                    </h2>

                    <p>
                        Добавьте изображения через
                        область загрузки выше.
                    </p>

                </div>

            `;

            return;

        }

gallery.innerHTML = photos
    .map(photo => {

        const isCover =
            String(photo.id) ===
            coverPhotoId;

        return `

            <article
                class="photo-card glass ${isCover
                    ? "is-cover"
                    : ""
                }"
                data-photo-id="${photo.id}">

                <div class="photo-preview">

                    <img
                        src="https://lh3.googleusercontent.com/d/${photo.fileId}=w600"
                        srcset="
                            https://lh3.googleusercontent.com/d/${photo.fileId}=w400 400w,
                            https://lh3.googleusercontent.com/d/${photo.fileId}=w600 600w,
                            https://lh3.googleusercontent.com/d/${photo.fileId}=w900 900w
                        "
                        sizes="
                            (max-width: 700px) 100vw,
                            (max-width: 1200px) 50vw,
                            300px
                        "
                        alt="${this.escapeHtml(
                            photo.name
                        )}"
                        loading="lazy"
                        decoding="async">

                    ${isCover
                        ? `
                            <span class="cover-badge">
                                Обложка
                            </span>
                        `
                        : ""
                    }

                </div>

                <div class="photo-info">

                    <span
                        class="photo-name"
                        title="${this.escapeHtml(
                            photo.name
                        )}">

                        ${this.escapeHtml(
                            photo.name
                        )}

                    </span>
${photo.description
    ? `
        <p class="photo-description-preview">

            ${this.escapeHtml(
                photo.description
            )}

        </p>

        <span class="photo-layout-badge">

            ${this.getPhotoLayoutLabel(
                photo.layout
            )}

        </span>
    `
    : `
        <p class="photo-description-empty">
            Описание не добавлено
        </p>
    `
}
                    <div class="photo-actions">

                        <button
                            class="setCoverButton ${isCover
                                ? "is-active"
                                : ""
                            }"
                            data-photo-id="${photo.id}"
                            type="button"
                            aria-pressed="${isCover}"
                            title="${isCover
                                ? "Текущая обложка"
                                : "Сделать обложкой"
                            }"
                            ${isCover
                                ? "disabled"
                                : ""
                            }>

                            ${isCover ? "★" : "☆"}

                        </button>
<button
    class="editPhotoButton"
    data-photo-id="${photo.id}"
    type="button"
    title="Редактировать фотографию">

    ✏️

</button>
                        <button
                            class="deletePhotoButton"
                            data-photo-id="${photo.id}"
                            type="button"
                            title="Удалить фотографию">

                            🗑️

                        </button>

                    </div>

                </div>

            </article>

        `;

    })
    .join("");

    }

    static renderLoadError(message) {

        const gallery =
            document.getElementById(
                "photoGallery"
            );

        const countElement =
            document.getElementById(
                "collectionPhotoCount"
            );

        if (countElement) {
            countElement.textContent =
                "Ошибка загрузки";
        }

        if (!gallery) {
            return;
        }

        gallery.innerHTML = `

            <div class="glass empty-state">

                <h2>
                    Не удалось загрузить фотографии
                </h2>

                <p>
                    ${this.escapeHtml(
                        message ||
                        "Неизвестная ошибка"
                    )}
                </p>

                <button
                    id="retryPhotosButton"
                    class="primaryButton"
                    type="button">

                    Повторить

                </button>

            </div>

        `;

        document
            .getElementById(
                "retryPhotosButton"
            )
            .addEventListener(
                "click",
                async () => {

                    await this.open(
                        this.currentId
                    );

                }
            );

    }

    static setUploadInterface(active) {

        const status =
            document.getElementById(
                "uploadStatus"
            );

        const dropzone =
            document.getElementById(
                "photoDropzone"
            );

        if (!status || !dropzone) {
            return;
        }

        status.hidden = !active;

        dropzone.classList.toggle(
            "upload-disabled",
            active
        );

        dropzone.setAttribute(
            "aria-disabled",
            String(active)
        );

        if (!active) {

            const progressBar =
                document.getElementById(
                    "uploadProgressBar"
                );

            if (progressBar) {
                progressBar.style.width = "0%";
            }

        }

    }

    static updateUploadProgress(
        completed,
        total,
        fileName
    ) {

        const text =
            document.getElementById(
                "uploadStatusText"
            );

        const counter =
            document.getElementById(
                "uploadStatusCounter"
            );

        const progressBar =
            document.getElementById(
                "uploadProgressBar"
            );

        const currentFile =
            document.getElementById(
                "uploadCurrentFile"
            );

        const percentage =
            total > 0
                ? Math.round(
                    completed / total * 100
                )
                : 0;

        text.textContent =
            completed === total
                ? "Готово"
                : "Загрузка фотографий";

        counter.textContent =
            `${completed} / ${total}`;

        progressBar.style.width =
            `${percentage}%`;

        currentFile.textContent =
            fileName || "";

    }

    static getPhotoWord(count) {

        const lastTwoDigits =
            count % 100;

        const lastDigit =
            count % 10;

        if (
            lastTwoDigits >= 11 &&
            lastTwoDigits <= 14
        ) {
            return "фотографий";
        }

        if (lastDigit === 1) {
            return "фотография";
        }

        if (
            lastDigit >= 2 &&
            lastDigit <= 4
        ) {
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
