class CollectionView {

    static currentId = null;

    static open(id) {

        this.currentId = id;

        const collection = CollectionService
            .getAll()
            .find(item => item.id === id);

        if (!collection) {

            document.getElementById("content").innerHTML = `

                <div class="dashboard fade">

                    <h1>Коллекция не найдена</h1>

                </div>

            `;

            return;

        }

        document.getElementById("content").innerHTML = `

            <div class="collection-view fade">

                <div class="page-header">

                    <div>

                        <h1>${collection.name}</h1>

                        <p id="collectionPhotoCount">
                            0 фотографий
                        </p>

                    </div>

                    <div class="collection-view-actions">


                        <button
                            id="backCollections"
                            class="secondaryButton">

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

    <div class="dropzone-icon">📷</div>

    <h2>Добавить фотографии</h2>

    <p>
        Перетащите изображения сюда
        или нажмите для выбора
    </p>

    <span>
        JPG, PNG и WebP
    </span>

</div>

<div
    id="photoGallery"
    class="photo-gallery">
</div>

            </div>

        `;

        document
            .getElementById("backCollections")
            .addEventListener(
                "click",
                () => Collections.render()
            );

const photoInput =
    document.getElementById("photoInput");

const dropzone =
    document.getElementById("photoDropzone");

dropzone.addEventListener("click", () => {

    photoInput.click();

});

dropzone.addEventListener("keydown", event => {

    if (
        event.key === "Enter" ||
        event.key === " "
    ) {

        event.preventDefault();

        photoInput.click();

    }

});

photoInput.addEventListener("change", event => {

    CollectionView.addPhotos(
        event.target.files
    );

    event.target.value = "";

});

CollectionView.bindDropzoneEvents();

        document
            .getElementById("photoInput")
            .addEventListener(
                "change",
                event => {

                    CollectionView.addPhotos(
                        event.target.files
                    );

                    event.target.value = "";

                }
            );

        this.renderPhotos();

    }
static bindDropzoneEvents() {

    const dropzone =
        document.getElementById("photoDropzone");

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

                dropzone.classList.add(
                    "drag-active"
                );

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

    dropzone.addEventListener("drop", event => {

        CollectionView.addPhotos(
            event.dataTransfer.files
        );

    });

}
static addPhotos(files) {

    if (!files || files.length === 0) {
        return;
    }

    const imageFiles = Array.from(files)
        .filter(file =>
            file.type.startsWith("image/")
        );

    if (imageFiles.length === 0) {

        alert(
            "Выберите изображения в формате JPG, PNG или WebP."
        );

        return;

    }

    PhotoService.addFiles(
        this.currentId,
        imageFiles
    );

    this.renderPhotos();

}

    static renderPhotos() {

        const gallery =
            document.getElementById("photoGallery");

        const count =
            document.getElementById("collectionPhotoCount");

        if (!gallery || !count) {
            return;
        }

        const photos =
            PhotoService.getByCollection(
                this.currentId
            );

        count.textContent =
            `${photos.length} ${this.getPhotoWord(photos.length)}`;

        if (photos.length === 0) {

            gallery.innerHTML = `

                <div class="glass empty-state">

                    <h2>Пока фотографий нет</h2>

                    <p>
                        Нажмите «Добавить фотографии»,
                        чтобы выбрать изображения.
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
                            src="${photo.previewUrl}"
                            alt="${photo.name}">

                    </div>

                    <div class="photo-info">

                        <span
                            class="photo-name"
                            title="${photo.name}">

                            ${photo.name}

                        </span>

                        <button
                            class="deletePhotoButton"
                            data-photo-id="${photo.id}"
                            title="Удалить фотографию">

                            🗑️

                        </button>

                    </div>

                </article>

            `)
            .join("");

        this.bindPhotoEvents();

    }

    static bindPhotoEvents() {

        const gallery =
            document.getElementById("photoGallery");

        if (!gallery) {
            return;
        }

        gallery.onclick = event => {

            const deleteButton =
                event.target.closest(
                    ".deletePhotoButton"
                );

            if (!deleteButton) {
                return;
            }

            const photoId =
                deleteButton.dataset.photoId;

            PhotoService.remove(
                this.currentId,
                photoId
            );

            this.renderPhotos();

        };

    }

    static getPhotoWord(count) {

        const lastTwoDigits = count % 100;
        const lastDigit = count % 10;

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

}
