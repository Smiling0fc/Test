class HomeStoriesLayout {
    static root = null;
    static observer = null;

    static createEditorialCopy(link) {
        const description = String(
            link.querySelector(".collection-description")?.textContent || ""
        ).trim();

        const collectionName = String(
            link.querySelector(".collection-title")?.textContent || "Коллекция"
        ).trim();

        const panel = document.createElement("aside");
        panel.className = "home-story-editorial-copy";

        const kicker = document.createElement("small");
        kicker.textContent = "О коллекции";

        const title = document.createElement("h3");
        title.textContent = collectionName;

        const text = document.createElement("p");
        text.textContent = description ||
            "Откройте эту историю, чтобы увидеть всю серию фотографий.";

        const open = document.createElement("a");
        open.href = link.getAttribute("href") || "collections.html";
        open.textContent = "Открыть историю →";

        panel.append(kicker, title, text, open);

        return panel;
    }

    static apply() {
        if (!this.root) {
            return;
        }

        if (this.root.dataset.homeStoriesReady === "true") {
            return;
        }

        const links = Array.from(
            this.root.querySelectorAll(":scope > .journal-collection-link")
        ).slice(0, 3);

        if (!links.length) {
            return;
        }

        const fragment = document.createDocumentFragment();

        links.forEach((link, index) => {
            const row = document.createElement("div");
            const isThird = index === 2;

            row.className = isThird
                ? "home-story-row home-story-row-with-copy"
                : "home-story-row home-story-row-full";

            link.classList.add("home-story-card-link");

            if (isThird) {
                link.classList.add("home-story-card-external-copy");
            }

            row.appendChild(link);

            if (isThird) {
                row.appendChild(this.createEditorialCopy(link));
            }

            fragment.appendChild(row);
        });

        this.root.replaceChildren(fragment);
        this.root.classList.add("home-stories-stack");
        this.root.dataset.homeStoriesReady = "true";
    }

    static init() {
        this.root = document.getElementById("latestStoriesGrid");

        if (!this.root) {
            return;
        }

        this.apply();

        this.observer = new MutationObserver(() => {
            this.apply();
        });

        this.observer.observe(this.root, {
            childList: true
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    HomeStoriesLayout.init();
});
