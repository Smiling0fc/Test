(() => {

    let draggedCard = null;
    let sourceOrder = [];
    let saving = false;
    let statusTimer = null;

    const getContainer = () =>
        document.getElementById(
            "collectionsContainer"
        );

    const getOrder = () => {
        const container = getContainer();

        if (!container) {
            return [];
        }

        return [
            ...container.querySelectorAll(
                ".collection-card[data-id]"
            )
        ].map(card =>
            String(card.dataset.id || "")
        ).filter(Boolean);
    };

    const sameOrder = (first, second) =>
        first.length === second.length &&
        first.every((id, index) =>
            id === second[index]
        );

    const setStatus = (
        message,
        state = ""
    ) => {
        const status = document.getElementById(
            "collectionOrderStatus"
        );

        if (!status) {
            return;
        }

        status.textContent = message;
        status.dataset.state = state;

        window.clearTimeout(statusTimer);

        if (state === "success") {
            statusTimer = window.setTimeout(
                () => {
                    status.textContent = "";
                    status.dataset.state = "";
                },
                2200
            );
        }
    };

    const setSaving = active => {
        saving = active;

        const container = getContainer();
        container?.classList.toggle(
            "is-saving-order",
            active
        );

        container
            ?.querySelectorAll(
                ".collection-drag-handle"
            )
            .forEach(handle => {
                handle.disabled = active;
            });
    };

    const saveOrder = async ids => {
        if (saving || ids.length < 2) {
            return;
        }

        setSaving(true);
        setStatus(
            "Сохраняем порядок...",
            "saving"
        );

        try {
            await CollectionService.reorder(ids);

            Collections.renderList(
                CollectionService.getAll()
            );

            setStatus(
                "Порядок сохранён",
                "success"
            );

        } catch (error) {
            console.error(error);

            Collections.renderList(
                CollectionService.getAll()
            );

            setStatus(
                "Не удалось сохранить",
                "error"
            );

            alert(
                error.message ||
                "Не удалось сохранить порядок коллекций."
            );

        } finally {
            setSaving(false);
        }
    };

    const cleanupDrag = () => {
        const container = getContainer();

        draggedCard?.classList.remove(
            "is-dragging"
        );

        draggedCard
            ?.querySelector(
                ".collection-drag-handle"
            )
            ?.setAttribute(
                "aria-grabbed",
                "false"
            );

        container?.classList.remove(
            "is-reordering"
        );

        draggedCard = null;
    };

    const moveByKeyboard = async (
        card,
        direction
    ) => {
        if (saving) {
            return;
        }

        const sibling = direction < 0
            ? card.previousElementSibling
            : card.nextElementSibling;

        if (
            !sibling ||
            !sibling.classList.contains(
                "collection-card"
            )
        ) {
            return;
        }

        const container = getContainer();

        if (direction < 0) {
            container.insertBefore(
                card,
                sibling
            );
        } else {
            container.insertBefore(
                sibling,
                card
            );
        }

        card.classList.add(
            "collection-order-pulse"
        );

        window.setTimeout(
            () => card.classList.remove(
                "collection-order-pulse"
            ),
            300
        );

        await saveOrder(getOrder());
    };

    const addToolbar = container => {
        document
            .querySelector(
                ".collection-order-toolbar"
            )
            ?.remove();

        const cardCount = container.querySelectorAll(
            ".collection-card"
        ).length;

        if (cardCount < 2) {
            return;
        }

        const toolbar = document.createElement(
            "div"
        );

        toolbar.className =
            "collection-order-toolbar";

        toolbar.innerHTML = `
            <div class="collection-order-copy">
                <span class="collection-order-icon">⠿</span>
                <span>
                    Перетаскивайте карточки за ручку,
                    чтобы собрать порядок на сайте.
                </span>
            </div>

            <span
                id="collectionOrderStatus"
                class="collection-order-status"
                aria-live="polite">
            </span>
        `;

        container.insertAdjacentElement(
            "beforebegin",
            toolbar
        );
    };

    const addHandles = container => {
        container
            .querySelectorAll(
                ".collection-card[data-id]"
            )
            .forEach((card, index) => {
                const actions = card.querySelector(
                    ".collection-actions"
                );

                if (!actions) {
                    return;
                }

                card.dataset.orderIndex = String(
                    index + 1
                );

                const handle = document.createElement(
                    "button"
                );

                handle.className =
                    "collection-drag-handle";
                handle.type = "button";
                handle.draggable = true;
                handle.title =
                    "Перетащить коллекцию";
                handle.setAttribute(
                    "aria-label",
                    `Изменить позицию коллекции ${index + 1}`
                );
                handle.setAttribute(
                    "aria-grabbed",
                    "false"
                );
                handle.innerHTML = `
                    <span aria-hidden="true">⠿</span>
                `;

                handle.addEventListener(
                    "click",
                    event => {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                );

                handle.addEventListener(
                    "pointerdown",
                    event => {
                        event.stopPropagation();
                    }
                );

                handle.addEventListener(
                    "keydown",
                    event => {
                        if (
                            event.key === "ArrowUp" ||
                            event.key === "ArrowLeft"
                        ) {
                            event.preventDefault();
                            event.stopPropagation();
                            moveByKeyboard(card, -1);
                        }

                        if (
                            event.key === "ArrowDown" ||
                            event.key === "ArrowRight"
                        ) {
                            event.preventDefault();
                            event.stopPropagation();
                            moveByKeyboard(card, 1);
                        }
                    }
                );

                handle.addEventListener(
                    "dragstart",
                    event => {
                        if (saving) {
                            event.preventDefault();
                            return;
                        }

                        draggedCard = card;
                        sourceOrder = getOrder();

                        event.dataTransfer.effectAllowed =
                            "move";
                        event.dataTransfer.setData(
                            "text/plain",
                            String(card.dataset.id)
                        );

                        handle.setAttribute(
                            "aria-grabbed",
                            "true"
                        );

                        container.classList.add(
                            "is-reordering"
                        );

                        window.requestAnimationFrame(
                            () => card.classList.add(
                                "is-dragging"
                            )
                        );
                    }
                );

                handle.addEventListener(
                    "dragend",
                    async () => {
                        const currentOrder = getOrder();
                        cleanupDrag();

                        if (
                            !sameOrder(
                                sourceOrder,
                                currentOrder
                            )
                        ) {
                            await saveOrder(
                                currentOrder
                            );
                        }
                    }
                );

                actions.prepend(handle);
            });
    };

    const bindContainer = container => {
        container.addEventListener(
            "dragover",
            event => {
                if (!draggedCard || saving) {
                    return;
                }

                event.preventDefault();
                event.dataTransfer.dropEffect =
                    "move";

                const target = event.target.closest(
                    ".collection-card"
                );

                if (!target) {
                    container.appendChild(
                        draggedCard
                    );
                    return;
                }

                if (target === draggedCard) {
                    return;
                }

                const rect =
                    target.getBoundingClientRect();

                const centerY =
                    rect.top + rect.height / 2;
                const centerX =
                    rect.left + rect.width / 2;

                const sameVisualRow =
                    event.clientY >= rect.top &&
                    event.clientY <= rect.bottom;

                const insertBefore = sameVisualRow
                    ? event.clientX < centerX
                    : event.clientY < centerY;

                container.insertBefore(
                    draggedCard,
                    insertBefore
                        ? target
                        : target.nextElementSibling
                );
            }
        );

        container.addEventListener(
            "drop",
            event => {
                if (!draggedCard) {
                    return;
                }

                event.preventDefault();
            }
        );
    };

    const mount = () => {
        const container = getContainer();

        if (!container) {
            return;
        }

        addToolbar(container);
        addHandles(container);
        bindContainer(container);
    };

    const originalRenderList =
        Collections.renderList.bind(Collections);

    Collections.renderList = function (collections) {
        originalRenderList(collections);
        mount();
    };

})();
