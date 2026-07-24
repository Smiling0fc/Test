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

            const deleteButton =
                event.target.closest(
                    ".deletePhotoButton"
                );

            if (!deleteButton) {
                return;
            }

            const photoId =
                deleteButton.dataset.photoId;

            await this.removePhoto(
                photoId,
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
            .map(photo => `

                <article
                    class="photo-card glass"
                    data-photo-id="${photo.id}">

                    <div class="photo-preview">

                        <img
                            src="https://lh3.googleusercontent.com/d/${photo.fileId}=w1600"
                            alt="${this.escapeHtml(
                                photo.name
                            )}"
                            loading="lazy">

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

                        <button
                            class="deletePhotoButton"
                            data-photo-id="${photo.id}"
                            type="button"
                            title="Удалить фотографию">

                            🗑️

                        </button>

                    </div>

                </article>

            `)
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
