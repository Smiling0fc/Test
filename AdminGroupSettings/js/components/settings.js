class Settings {

    static storageKey = "vijoy_site_background_theme";

    static themes = [
        {
            id: "pearl",
            name: "Жемчужный",
            note: "Нейтральный светлый фон",
            color: "#f2f2ef",
            texture: "pearl"
        },
        {
            id: "ivory",
            name: "Слоновая кость",
            note: "Тёплый молочный оттенок",
            color: "#f5f1e8",
            texture: "ivory"
        },
        {
            id: "linen",
            name: "Лён",
            note: "Мягкий песочный подтон",
            color: "#eee9df",
            texture: "linen"
        },
        {
            id: "blush",
            name: "Пудровый",
            note: "Едва заметный розовый тон",
            color: "#f3ecea",
            texture: "blush"
        },
        {
            id: "mist",
            name: "Утренний туман",
            note: "Прохладный серо-голубой",
            color: "#edf0ef",
            texture: "mist"
        },
        {
            id: "sage",
            name: "Светлый шалфей",
            note: "Спокойный зелёный подтон",
            color: "#edf0e8",
            texture: "sage"
        }
    ];

    static render() {
        const content = document.getElementById("content");
        const activeTheme = this.getActiveTheme();

        content.innerHTML = `
            <div class="settings-studio fade">
                <div class="settings-heading">
                    <div>
                        <span class="settings-kicker">SITE PREFERENCES</span>
                        <h1>Настройки сайта</h1>
                        <p>
                            Общий характер публичной галереи, фон,
                            обработка изображений и публикация.
                        </p>
                    </div>
                </div>

                <section class="settings-panel">
                    <div class="settings-panel-heading">
                        <div>
                            <span>Оформление</span>
                            <h2>Фон публичного сайта</h2>
                            <p>
                                Светлая палитра ViJoy’s с почти незаметной
                                текстурой. Выбранный образец показывается
                                в крупном предпросмотре.
                            </p>
                        </div>

                        <div class="settings-selection-meta">
                            <small>Выбранный фон</small>
                            <strong id="settingsThemeName">${activeTheme.name}</strong>
                            <code id="settingsThemeHex">${activeTheme.color}</code>
                        </div>
                    </div>

                    <div class="settings-background-layout">
                        <div
                            id="settingsBackgroundPreview"
                            class="settings-background-preview theme-${activeTheme.texture}">
                            <div class="settings-preview-window">
                                <div class="settings-preview-header">
                                    <span>ViJoy’s</span>
                                    <div></div>
                                </div>

                                <div class="settings-preview-copy">
                                    <small>SELECTED STORIES</small>
                                    <strong>Истории в фотографиях</strong>
                                    <span>
                                        Светлый фон остаётся тихим и помогает
                                        изображению говорить первым.
                                    </span>
                                </div>

                                <div class="settings-preview-cards">
                                    <i></i><i></i><i></i>
                                </div>
                            </div>
                        </div>

                        <div class="settings-palette" role="radiogroup" aria-label="Палитра фона">
                            ${this.themes.map(theme => this.renderTheme(theme, activeTheme.id)).join("")}
                        </div>
                    </div>

                    <div class="settings-save-note">
                        <span class="settings-save-dot"></span>
                        <div>
                            <strong>Предпросмотр Studio</strong>
                            <small>
                                Сейчас выбор сохраняется локально. После
                                утверждения палитры подключим его к GAS и
                                публичному сайту.
                            </small>
                        </div>
                    </div>
                </section>

                <section class="settings-panel settings-panel-muted">
                    <div class="settings-panel-heading compact">
                        <div>
                            <span>Изображения</span>
                            <h2>Водяной знак</h2>
                            <p>
                                Следующий блок настроек: загрузка логотипа,
                                позиция, прозрачность и области показа.
                            </p>
                        </div>

                        <span class="settings-coming-soon">Следующий этап</span>
                    </div>
                </section>
            </div>
        `;

        this.bindThemeEvents();
    }

    static renderTheme(theme, activeId) {
        const selected = theme.id === activeId;

        return `
            <button
                class="settings-theme-card${selected ? " is-selected" : ""}"
                type="button"
                role="radio"
                aria-checked="${selected}"
                data-theme-id="${theme.id}">
                <span class="settings-theme-swatch theme-${theme.texture}"></span>
                <span class="settings-theme-copy">
                    <strong>${theme.name}</strong>
                    <small>${theme.note}</small>
                    <code>${theme.color}</code>
                </span>
                <span class="settings-theme-check">✓</span>
            </button>
        `;
    }

    static bindThemeEvents() {
        document
            .querySelectorAll(".settings-theme-card")
            .forEach(button => {
                button.addEventListener("click", () => {
                    const theme = this.themes.find(
                        item => item.id === button.dataset.themeId
                    );

                    if (!theme) {
                        return;
                    }

                    localStorage.setItem(this.storageKey, theme.id);
                    this.applyTheme(theme);
                });
            });
    }

    static applyTheme(theme) {
        document
            .querySelectorAll(".settings-theme-card")
            .forEach(button => {
                const selected = button.dataset.themeId === theme.id;
                button.classList.toggle("is-selected", selected);
                button.setAttribute("aria-checked", String(selected));
            });

        const preview = document.getElementById("settingsBackgroundPreview");
        if (preview) {
            preview.className = `settings-background-preview theme-${theme.texture}`;
        }

        const name = document.getElementById("settingsThemeName");
        const hex = document.getElementById("settingsThemeHex");

        if (name) {
            name.textContent = theme.name;
        }

        if (hex) {
            hex.textContent = theme.color;
        }
    }

    static getActiveTheme() {
        let storedId = "pearl";

        try {
            storedId = localStorage.getItem(this.storageKey) || "pearl";
        } catch {
            storedId = "pearl";
        }

        return this.themes.find(theme => theme.id === storedId)
            || this.themes[0];
    }
}
