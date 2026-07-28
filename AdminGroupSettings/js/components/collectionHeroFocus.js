(() => {

    class CollectionHeroFocus {

        static escape(value) {
            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        static clamp(value, fallback) {
            const number = Number(value);

            if (!Number.isFinite(number)) {
                return fallback;
            }

            return Math.max(
                0,
                Math.min(100, Math.round(number))
            );
        }

        static coverFor(collectionId) {
            const collection =
                CollectionService.getById(collectionId);

            const photos =
                PhotoService.getByCollection(collectionId);

            if (!collection || !photos.length) {
                return null;
            }

            return photos.find(photo =>
                String(photo.id) ===
                String(collection.coverPhotoId || "")
            ) || photos[0] || null;
        }

        static fileId(photo) {
            return String(
                photo?.galleryFileId ||
                photo?.previewFileId ||
                photo?.fileId ||
                ""
            );
        }

        static mount(collectionId) {
            const actions = document.querySelector(
                ".collection-view-actions"
            );

            if (
                !actions ||
                actions.querySelector(
                    ".collection-focus-button"
                )
            ) {
                return;
            }

            const button = document.createElement(
                "button"
            );

            button.className =
                "secondaryButton collection-focus-button";
            button.type = "button";
            button.textContent = "Фокус Hero";
            button.title =
                "Настроить положение обложки на сайте";

            button.addEventListener(
                "click",
                () => this.open(collectionId, button)
            );

            actions.prepend(button);
        }

        static async open(collectionId, trigger) {
            const id = String(collectionId || "");
            const collection =
                CollectionService.getById(id);
            const cover = this.coverFor(id);
            const fileId = this.fileId(cover);

            if (!collection || !fileId) {
                alert(
                    "Сначала выберите обложку коллекции."
                );
                return;
            }

            trigger.disabled = true;
            const oldText = trigger.textContent;
            trigger.textContent = "Загрузка...";

            try {
                await SiteSettingsService.load();
            } catch (error) {
                console.error(error);
                alert(
                    error.message ||
                    "Не удалось загрузить настройки Hero."
                );
                trigger.disabled = false;
                trigger.textContent = oldText;
                return;
            }

            trigger.disabled = false;
            trigger.textContent = oldText;

            const saved =
                SiteSettingsService
                    .getCollectionHeroFocus(id) || {
                        x: 50,
                        y: 0
                    };

            let point = {
                x: this.clamp(saved.x, 50),
                y: this.clamp(saved.y, 0)
            };

            document
                .querySelector(
                    ".collection-focus-overlay"
                )
                ?.remove();

            const overlay = document.createElement(
                "div"
            );

            overlay.className =
                "collection-focus-overlay";

            overlay.innerHTML = `
                <div
                    class="collection-focus-dialog glass"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="collectionFocusTitle">

                    <div class="collection-focus-header">
                        <div>
                            <span class="editor-kicker">
                                Обложка коллекции
                            </span>
                            <h2 id="collectionFocusTitle">
                                Фокус Hero
                            </h2>
                            <p>
                                ${this.escape(collection.name)}
                            </p>
                        </div>

                        <button
                            class="collection-focus-close"
                            type="button"
                            aria-label="Закрыть">
                            ×
                        </button>
                    </div>

                    <form id="collectionFocusForm">
                        <div
                            class="collection-focus-preview"
                            tabindex="0"
                            aria-label="Нажмите на важную область фотографии">
                            <img
                                src="https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}=w1400"
                                alt="${this.escape(collection.name)}">
                            <span
                                class="collection-focus-marker"
                                aria-hidden="true">
                            </span>
                            <span class="collection-focus-hint">
                                Нажмите на главный объект кадра
                            </span>
                        </div>

                        <div class="collection-focus-controls">
                            <label class="collection-focus-control">
                                <span>
                                    По горизонтали
                                    <output id="collectionFocusXValue"></output>
                                </span>
                                <input
                                    id="collectionFocusX"
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="1">
                            </label>

                            <label class="collection-focus-control">
                                <span>
                                    По вертикали
                                    <output id="collectionFocusYValue"></output>
                                </span>
                                <input
                                    id="collectionFocusY"
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="1">
                            </label>
                        </div>

                        <p class="collection-focus-note">
                            Настройка используется на главной странице и в Hero открытой коллекции.
                        </p>

                        <div class="collection-focus-actions">
                            <button
                                class="secondaryButton collection-focus-reset"
                                type="button">
                                Сбросить
                            </button>

                            <div>
                                <button
                                    class="secondaryButton collection-focus-cancel"
                                    type="button">
                                    Отмена
                                </button>

                                <button
                                    class="primaryButton collection-focus-save"
                                    type="submit">
                                    Сохранить
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(overlay);
            document.body.classList.add("editor-open");

            const form = overlay.querySelector(
                "#collectionFocusForm"
            );
            const preview = overlay.querySelector(
                ".collection-focus-preview"
            );
            const image = preview.querySelector("img");
            const marker = preview.querySelector(
                ".collection-focus-marker"
            );
            const xInput = overlay.querySelector(
                "#collectionFocusX"
            );
            const yInput = overlay.querySelector(
                "#collectionFocusY"
            );
            const xValue = overlay.querySelector(
                "#collectionFocusXValue"
            );
            const yValue = overlay.querySelector(
                "#collectionFocusYValue"
            );
            const saveButton = overlay.querySelector(
                ".collection-focus-save"
            );

            const renderPoint = () => {
                xInput.value = String(point.x);
                yInput.value = String(point.y);
                xValue.value = `${point.x}%`;
                yValue.value = `${point.y}%`;
                image.style.objectPosition =
                    `${point.x}% ${point.y}%`;
                marker.style.left = `${point.x}%`;
                marker.style.top = `${point.y}%`;
            };

            const close = () => {
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
                    close();
                }
            };

            const setFromPointer = event => {
                const bounds =
                    preview.getBoundingClientRect();

                if (!bounds.width || !bounds.height) {
                    return;
                }

                point = {
                    x: this.clamp(
                        ((event.clientX - bounds.left) /
                            bounds.width) * 100,
                        point.x
                    ),
                    y: this.clamp(
                        ((event.clientY - bounds.top) /
                            bounds.height) * 100,
                        point.y
                    )
                };

                renderPoint();
            };

            xInput.addEventListener("input", () => {
                point.x = this.clamp(
                    xInput.value,
                    point.x
                );
                renderPoint();
            });

            yInput.addEventListener("input", () => {
                point.y = this.clamp(
                    yInput.value,
                    point.y
                );
                renderPoint();
            });

            preview.addEventListener(
                "pointerdown",
                setFromPointer
            );

            overlay
                .querySelector(
                    ".collection-focus-reset"
                )
                .addEventListener("click", () => {
                    point = { x: 50, y: 0 };
                    renderPoint();
                });

            overlay
                .querySelector(
                    ".collection-focus-close"
                )
                .addEventListener("click", close);

            overlay
                .querySelector(
                    ".collection-focus-cancel"
                )
                .addEventListener("click", close);

            overlay.addEventListener("click", event => {
                if (event.target === overlay) {
                    close();
                }
            });

            form.addEventListener(
                "submit",
                async event => {
                    event.preventDefault();
                    saveButton.disabled = true;
                    saveButton.textContent =
                        "Сохраняем...";

                    try {
                        await SiteSettingsService
                            .setCollectionHeroFocus(
                                id,
                                point
                            );

                        close();
                    } catch (error) {
                        console.error(error);
                        saveButton.disabled = false;
                        saveButton.textContent =
                            "Сохранить";
                        alert(
                            error.message ||
                            "Не удалось сохранить фокус Hero."
                        );
                    }
                }
            );

            document.addEventListener(
                "keydown",
                handleKeyboard
            );

            renderPoint();
            requestAnimationFrame(() => preview.focus());
        }

        static install() {
            const originalOpen =
                CollectionView.open.bind(CollectionView);

            CollectionView.open = async function (id) {
                await originalOpen(id);
                CollectionHeroFocus.mount(
                    String(id || "")
                );
            };
        }

    }

    CollectionHeroFocus.install();
    window.CollectionHeroFocus = CollectionHeroFocus;

})();