class HeroSettings {

    static initialized = false;

    static init() {

        if (this.initialized) {
            return;
        }

        this.initialized = true;

        const originalRender =
            Collections.render.bind(Collections);

        Collections.render = () => {
            originalRender();
            HeroSettings.renderPanel();
        };

        Collections.create =
            HeroSettings.createCollection;

    }

    static async renderPanel() {

        const page =
            document.querySelector(".collections");

        if (!page) {
            return;
        }

        const oldPanel =
            page.querySelector(".hero-settings-panel");

        if (oldPanel) {
            oldPanel.remove();
        }

        const collections =
            CollectionService.getAll();

        const panel =
            document.createElement("section");

        panel.className =
            "hero-settings-panel glass";

        panel.innerHTML = `
            <div class="hero-settings-copy">
                <span class="hero-settings-kicker">
                    Главная страница
                </span>

                <h2>Коллекция для Hero</h2>

                <p>
                    Выберите коллекцию, чья обложка будет
                    использоваться на первом экране сайта.
                </p>
            </div>

            <div class="hero-settings-control">
                <select
                    id="heroCollectionSelect"
                    aria-label="Коллекция для Hero"
                    ${collections.length ? "" : "disabled"}>

                    ${collections.length
                        ? collections
                            .map(collection => `
                                <option value="${collection.id}">
                                    ${HeroSettings.escapeHtml(
                                        collection.name
                                    )}
                                </option>
                            `)
                            .join("")
                        : `
                            <option value="">
                                Сначала создайте коллекцию
                            </option>
                        `
                    }
                </select>

                <button
                    id="saveHeroCollection"
                    class="primaryButton"
                    type="button"
                    ${collections.length ? "" : "disabled"}>
                    Сохранить
                </button>

                <span
                    id="heroSettingsStatus"
                    class="hero-settings-status"
                    aria-live="polite">
                </span>
            </div>
        `;

        const pageHeader =
            page.querySelector(".page-header");

        pageHeader.insertAdjacentElement(
            "afterend",
            panel
        );

        if (!collections.length) {
            return;
        }

        const select =
            panel.querySelector(
                "#heroCollectionSelect"
            );

        const button =
            panel.querySelector(
                "#saveHeroCollection"
            );

        const status =
            panel.querySelector(
                "#heroSettingsStatus"
            );

        try {

            const settings =
                await SiteSettingsService.load();

            const selectedExists =
                collections.some(collection =>
                    String(collection.id) ===
                    String(settings.heroCollectionId)
                );

            if (selectedExists) {
                select.value =
                    settings.heroCollectionId;
            }

        } catch (error) {

            console.error(error);
            status.textContent =
                "Настройки пока недоступны.";

        }

        button.addEventListener(
            "click",
            async () => {

                button.disabled = true;
                status.textContent =
                    "Сохраняем...";

                try {

                    await SiteSettingsService
                        .setHeroCollection(
                            select.value
                        );

                    status.textContent =
                        "Hero обновлён.";

                } catch (error) {

                    console.error(error);
                    status.textContent =
                        error.message ||
                        "Не удалось сохранить.";

                } finally {

                    button.disabled = false;

                }

            }
        );

    }

    static async createCollection() {

        const name =
            prompt("Введите название коллекции");

        if (name === null) {
            return;
        }

        const trimmed = name.trim();

        if (!trimmed) {
            return;
        }

        const useAsHero = confirm(
            "Хотите ли Вы использовать новую коллекцию как обложку сайта?"
        );

        try {

            const collection =
                await CollectionService.create(
                    trimmed
                );

            if (useAsHero) {
                await SiteSettingsService
                    .setHeroCollection(
                        collection.id
                    );
            }

            Collections.render();

        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Не удалось создать коллекцию."
            );

        }

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

HeroSettings.init();
