class CollectionMasonry {
    static root = null;
    static observer = null;
    static scheduled = false;

    static createGroup() {
        const group = document.createElement("div");
        group.className = "photo-masonry";
        group.setAttribute("role", "list");
        return group;
    }

    static finishGroup(group, fragment) {
        if (!group || !group.children.length) {
            return null;
        }

        const count = group.children.length;

        group.dataset.count = String(count);
        group.classList.add(
            count === 1
                ? "photo-masonry-single"
                : count === 2
                    ? "photo-masonry-pair"
                    : "photo-masonry-multiple"
        );

        Array.from(group.children).forEach(photo => {
            photo.setAttribute("role", "listitem");
        });

        fragment.appendChild(group);
        return null;
    }

    static arrange(grid) {
        const directPhotos = Array.from(grid.children)
            .filter(item => item.matches(".public-photo"));

        if (!directPhotos.length) {
            return;
        }

        const fragment = document.createDocumentFragment();
        let group = null;

        Array.from(grid.children).forEach(item => {
            if (item.matches(".photo-story")) {
                group = this.finishGroup(group, fragment);
                fragment.appendChild(item);
                return;
            }

            if (item.matches(".public-photo")) {
                if (!group) {
                    group = this.createGroup();
                }

                group.appendChild(item);
                return;
            }

            group = this.finishGroup(group, fragment);
            fragment.appendChild(item);
        });

        this.finishGroup(group, fragment);
        grid.replaceChildren(fragment);
        grid.classList.add("public-photo-grid-masonry");
        grid.dataset.masonryReady = "true";
    }

    static apply() {
        const grid = this.root?.querySelector(
            ":scope > .public-photo-grid"
        );

        if (!grid) {
            return;
        }

        this.arrange(grid);
    }

    static schedule() {
        if (this.scheduled) {
            return;
        }

        this.scheduled = true;

        requestAnimationFrame(() => {
            this.scheduled = false;
            this.apply();
        });
    }

    static init() {
        this.root = document.getElementById("issueGalleryRoot");

        if (!this.root) {
            return;
        }

        this.schedule();

        this.observer = new MutationObserver(() => {
            this.schedule();
        });

        this.observer.observe(this.root, {
            childList: true,
            subtree: true
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    CollectionMasonry.init();
});
