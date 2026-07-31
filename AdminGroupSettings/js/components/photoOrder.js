class PhotoOrder {
    static gallery = null;
    static dragged = null;
    static saving = false;
    static observer = null;

    static mount() {
        const gallery = document.getElementById("photoGallery");

        if (!gallery || gallery === this.gallery) {
            if (gallery) {
                this.decorate();
            }
            return;
        }

        this.gallery = gallery;
        this.decorate();
        this.bind();

        this.observer?.disconnect();
        this.observer = new MutationObserver(() => this.decorate());
        this.observer.observe(gallery, {
            childList: true,
            subtree: false
        });
    }

    static decorate() {
        if (!this.gallery) {
            return;
        }

        const cards = this.cards();
        this.gallery.classList.toggle(
            "photo-order-enabled",
            cards.length > 1
        );

        cards.forEach((card, index) => {
            card.draggable = !this.saving;
            card.dataset.orderIndex = String(index);

            let handle = card.querySelector(".photo-order-handle");

            if (!handle) {
                handle = document.createElement("div");
                handle.className = "photo-order-handle";
                handle.innerHTML = `
                    <span class="photo-order-grip" aria-hidden="true">⋮⋮</span>
                    <span class="photo-order-number"></span>
                    <span class="photo-order-label">Перетащить</span>
                    <div class="photo-order-buttons">
                        <button type="button" class="photo-order-up" title="Переместить выше" aria-label="Переместить фотографию выше">↑</button>
                        <button type="button" class="photo-order-down" title="Переместить ниже" aria-label="Переместить фотографию ниже">↓</button>
                    </div>
                `;
                card.prepend(handle);
            }

            handle.querySelector(".photo-order-number").textContent =
                String(index + 1).padStart(2, "0");

            const up = handle.querySelector(".photo-order-up");
            const down = handle.querySelector(".photo-order-down");

            up.disabled = this.saving || index === 0;
            down.disabled = this.saving || index === cards.length - 1;
        });

        this.ensureStatus();
    }

    static bind() {
        this.gallery.addEventListener("dragstart", event => {
            const card = event.target.closest(".photo-card[data-photo-id]");

            if (!card || this.saving) {
                event.preventDefault();
                return;
            }

            this.dragged = card;
            card.classList.add("is-dragging");
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", card.dataset.photoId || "");
        });

        this.gallery.addEventListener("dragover", event => {
            if (!this.dragged || this.saving) {
                return;
            }

            event.preventDefault();
            event.dataTransfer.dropEffect = "move";

            const target = event.target.closest(".photo-card[data-photo-id]");

            if (!target || target === this.dragged) {
                return;
            }

            const bounds = target.getBoundingClientRect();
            const before = event.clientY < bounds.top + bounds.height / 2;

            this.gallery.insertBefore(
                this.dragged,
                before ? target : target.nextSibling
            );

            this.decorate();
        });

        this.gallery.addEventListener("drop", async event => {
            if (!this.dragged || this.saving) {
                return;
            }

            event.preventDefault();
            await this.finishDrag();
        });

        this.gallery.addEventListener("dragend", async () => {
            if (this.dragged && !this.saving) {
                await this.finishDrag();
            }
        });

        this.gallery.addEventListener("click", async event => {
            const up = event.target.closest(".photo-order-up");
            const down = event.target.closest(".photo-order-down");

            if ((!up && !down) || this.saving) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const card = event.target.closest(".photo-card[data-photo-id]");
            const cards = this.cards();
            const index = cards.indexOf(card);

            if (up && index > 0) {
                this.gallery.insertBefore(card, cards[index - 1]);
            }

            if (down && index < cards.length - 1) {
                this.gallery.insertBefore(cards[index + 1], card);
            }

            this.decorate();
            await this.save();
        });
    }

    static async finishDrag() {
        this.dragged?.classList.remove("is-dragging");
        this.dragged = null;
        this.decorate();
        await this.save();
    }

    static cards() {
        return this.gallery
            ? Array.from(
                this.gallery.querySelectorAll(":scope > .photo-card[data-photo-id]")
            )
            : [];
    }

    static ids() {
        return this.cards().map(card => String(card.dataset.photoId || ""));
    }

    static ensureStatus() {
        const view = document.querySelector(".collection-view");

        if (!view || document.getElementById("photoOrderStatus")) {
            return;
        }

        const status = document.createElement("div");
        status.id = "photoOrderStatus";
        status.className = "photo-order-status";
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");
        view.appendChild(status);
    }

    static setStatus(text, state = "") {
        const status = document.getElementById("photoOrderStatus");

        if (!status) {
            return;
        }

        status.textContent = text;
        status.dataset.state = state;
        status.classList.toggle("is-visible", Boolean(text));
    }

    static async save() {
        const collectionId = String(CollectionView.currentId || "");
        const photoIds = this.ids();

        if (!collectionId || photoIds.length < 2) {
            return;
        }

        const previous = PhotoService
            .getByCollection(collectionId)
            .map(photo => String(photo.id));

        this.saving = true;
        this.decorate();
        this.setStatus("Сохраняем порядок…", "saving");

        try {
            await PhotoOrderService.save(collectionId, photoIds);
            this.setStatus("Порядок сохранён", "saved");

            window.setTimeout(() => {
                if (!this.saving) {
                    this.setStatus("");
                }
            }, 1800);
        } catch (error) {
            console.error(error);
            this.restore(previous);
            this.setStatus("Не удалось сохранить порядок", "error");
            alert(
                error.message ||
                "Не удалось сохранить порядок фотографий."
            );
        } finally {
            this.saving = false;
            this.decorate();
        }
    }

    static restore(photoIds) {
        const byId = new Map(
            this.cards().map(card => [String(card.dataset.photoId), card])
        );

        photoIds.forEach(id => {
            const card = byId.get(String(id));
            if (card) {
                this.gallery.appendChild(card);
            }
        });

        this.decorate();
    }

    static install() {
        const original = CollectionView.renderPhotos.bind(CollectionView);

        CollectionView.renderPhotos = function renderPhotosWithOrder() {
            original();
            requestAnimationFrame(() => PhotoOrder.mount());
        };
    }
}

PhotoOrder.install();
