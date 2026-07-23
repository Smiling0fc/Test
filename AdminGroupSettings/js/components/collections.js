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
                                class="iconButton renameButton"
                                data-id="${collection.id}"
                                type="button"
                                title="Переименовать">

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

            const renameButton =
                event.target.closest(
                    ".renameButton"
                );

            if (renameButton) {

                Collections.rename(
                    renameButton.dataset.id
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

    static async rename(id) {

        const name =
            prompt("Новое название");

        if (name === null) {
            return;
        }

        const trimmed = name.trim();

        if (!trimmed) {
            return;
        }

        try {

            await CollectionService.rename(
                id,
                trimmed
            );

            Collections.render();

        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Не удалось переименовать коллекцию."
            );

        }

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
