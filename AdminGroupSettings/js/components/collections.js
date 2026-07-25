class Collections {

    static render() {

        const content =
            document.getElementById("content");

        const collections =
            CollectionService.getAll();

        content.innerHTML = `

            <div class="collections fade">

                <div class="page-header">

                    <h1>Коллекции</h1>

                    <button
                        id="createCollection"
                        class="primaryButton"
                        type="button">

                        + Создать коллекцию

                    </button>

                </div>

                <div
                    id="collectionsContainer"
                    class="collections-container">

                </div>

            </div>

        `;

        document
            .getElementById("createCollection")
            .addEventListener(
                "click",
                () => Collections.create()
            );

        Collections.renderList(collections);
        Collections.bindEvents();

    }

    static renderList(collections) {

        const container =
            document.getElementById(
                "collectionsContainer"
            );

        if (!container) {
            return;
        }

        if (collections.length === 0) {

            container.innerHTML = `

                <div class="empty-state glass">

                    <h2>Коллекций пока нет</h2>

                    <p>
                        Нажмите «Создать коллекцию»,
                        чтобы добавить первую.
                    </p>

                </div>

            `;

            return;

        }

        container.innerHTML = collections
            .map(collection => {

                const photoCount =
                    Array.isArray(collection.photos)
                        ? collection.photos.length
                        : 0;

                return `

                    <div
                        class="collection-card glass"
                        data-id="${collection.id}">

                        <div>

                            <h2>${collection.name}</h2>

                            <p>
                                ${photoCount} фотографий
                            </p>

                        </div>

                        <div class="collection-actions">

<button
    class="iconButton editButton"
    data-id="${collection.id}"
    type="button"
    title="Редактировать коллекцию">

    ✏️

</button>

                            <button
                                class="iconButton deleteButton"
                                data-id="${collection.id}"
                                type="button"
                                title="Удалить">

                                🗑️

                            </button>

                        </div>

                    </div>

                `;

            })
            .join("");

    }

    static bindEvents() {

        const container =
            document.getElementById(
                "collectionsContainer"
            );

        if (!container) {
            return;
        }

        container.onclick = event => {

const editButton =
    event.target.closest(
        ".editButton"
    );

if (editButton) {

    Collections.openEditor(
        editButton.dataset.id
    );

    return;

}

            const deleteButton =
                event.target.closest(
                    ".deleteButton"
                );

            if (deleteButton) {

                Collections.remove(
                    deleteButton.dataset.id
                );

                return;

            }

            const card =
                event.target.closest(
                    ".collection-card"
                );

            if (card) {

                CollectionView.open(
                    card.dataset.id
                );

            }

        };

    }

    static async create() {

        const name =
            prompt("Введите название коллекции");

        if (name === null) {
            return;
        }

        const trimmed = name.trim();

        if (!trimmed) {
            return;
        }

        try {

            await CollectionService.create(
                trimmed
            );

            Collections.render();

        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Не удалось создать коллекцию."
            );

        }

    }

static openEditor(id) {

    const collection =
        CollectionService.getById(id);

    if (!collection) {
        return;
    }

    const existingModal =
        document.querySelector(
            ".collection-editor-overlay"
        );

    if (existingModal) {
        existingModal.remove();
    }

    const overlay =
        document.createElement("div");

    overlay.className =
        "collection-editor-overlay";

    overlay.innerHTML = `

        <div
            class="collection-editor glass"
            role="dialog"
            aria-modal="true"
            aria-labelledby="collectionEditorTitle">

            <div class="collection-editor-header">

                <div>

                    <span class="editor-kicker">
                        Коллекция
                    </span>

                    <h2 id="collectionEditorTitle">
                        Редактирование
                    </h2>

                </div>

                <button
                    class="collection-editor-close"
                    type="button"
                    aria-label="Закрыть">

                    ×

                </button>

            </div>

            <form id="collectionEditorForm">

                <label class="editor-field">

                    <span>
                        Название
                    </span>

                    <input
                        id="collectionNameInput"
                        type="text"
                        maxlength="120"
                        autocomplete="off"
                        required>

                </label>

                <label class="editor-field">

                    <span>
                        Краткое описание
                    </span>

                    <textarea
                        id="collectionDescriptionInput"
                        maxlength="300"
                        rows="5"
                        placeholder="Например: Истории любви, важные моменты и тёплые эмоции"></textarea>

                    <small>
                        До 300 символов
                    </small>

                </label>

                <div class="collection-editor-actions">

                    <button
                        class="secondaryButton editor-cancel"
                        type="button">

                        Отмена

                    </button>

                    <button
                        class="primaryButton editor-save"
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
            "#collectionEditorForm"
        );

    const nameInput =
        overlay.querySelector(
            "#collectionNameInput"
        );

    const descriptionInput =
        overlay.querySelector(
            "#collectionDescriptionInput"
        );

    const saveButton =
        overlay.querySelector(
            ".editor-save"
        );

    nameInput.value =
        collection.name || "";

    descriptionInput.value =
        collection.description || "";

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
            ".collection-editor-close"
        )
        .addEventListener(
            "click",
            closeEditor
        );

    overlay
        .querySelector(
            ".editor-cancel"
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

            const name =
                nameInput.value.trim();

            const description =
                descriptionInput
                    .value
                    .trim();

            if (!name) {

                nameInput.focus();

                return;

            }

            saveButton.disabled = true;
            saveButton.textContent =
                "Сохраняем...";

            try {

                await CollectionService
                    .updateDetails(
                        collection.id,
                        {
                            name,
                            description
                        }
                    );

                closeEditor();

                Collections.render();

            } catch (error) {

                console.error(error);

                saveButton.disabled = false;
                saveButton.textContent =
                    "Сохранить";

                alert(
                    error.message ||
                    "Не удалось сохранить коллекцию."
                );

            }

        }
    );

    document.addEventListener(
        "keydown",
        handleKeyboard
    );

    requestAnimationFrame(
        () => nameInput.focus()
    );

}

    static async remove(id) {

        const confirmed = confirm(
            "Удалить коллекцию и все её фотографии?"
        );

        if (!confirmed) {
            return;
        }

        try {

            await CollectionService.remove(id);

            Collections.render();

        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Не удалось удалить коллекцию."
            );

        }

    }

}
