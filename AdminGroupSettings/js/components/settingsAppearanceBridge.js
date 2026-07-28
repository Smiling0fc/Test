(() => {
    const originalRender = Settings.render.bind(Settings);
    const originalApplyTheme = Settings.applyTheme.bind(Settings);

    Settings.render = async function () {
        let connected = false;

        try {
            const appearance = await AppearanceService.load();

            localStorage.setItem(
                this.storageKey,
                appearance.backgroundTheme
            );

            connected = true;
        } catch (error) {
            console.warn(
                "Настройки оформления пока недоступны:",
                error.message
            );
        }

        originalRender();
        this.updateConnectionNote(
            connected ? "connected" : "offline"
        );

        await SiteIdentitySettings.render();
        await MaintenanceSettings.render();
    };

    Settings.bindThemeEvents = function () {
        document
            .querySelectorAll(".settings-theme-card")
            .forEach(button => {
                button.addEventListener("click", async () => {
                    const theme = this.themes.find(
                        item => item.id === button.dataset.themeId
                    );

                    if (!theme) {
                        return;
                    }

                    originalApplyTheme(theme);
                    this.updateConnectionNote("saving");

                    let appearance;

                    try {
                        appearance = await AppearanceService.save(
                            theme.id
                        );
                    } catch (error) {
                        console.error(
                            "Не удалось сохранить оформление сайта:",
                            error
                        );
                        this.updateConnectionNote(
                            "error",
                            error.message
                        );
                        return;
                    }

                    const savedTheme = this.themes.find(
                        item => item.id === appearance.backgroundTheme
                    ) || theme;

                    try {
                        localStorage.setItem(
                            this.storageKey,
                            savedTheme.id
                        );
                    } catch (error) {
                        console.warn(
                            "Не удалось обновить локальный кэш темы:",
                            error.message
                        );
                    }

                    originalApplyTheme(savedTheme);
                    this.updateConnectionNote("saved");
                    ActivityService.record(
                        "settings",
                        "Изменён фон сайта",
                        savedTheme.name
                    );
                });
            });
    };

    Settings.updateConnectionNote = function (
        state,
        details = ""
    ) {
        const note = document.querySelector(
            ".settings-save-note"
        );
        const title = note?.querySelector("strong");
        const copy = note?.querySelector("small");

        if (!note || !title || !copy) {
            return;
        }

        note.dataset.state = state;

        const messages = {
            connected: [
                "Подключено к публичному сайту",
                "Выбранный образец загружается из GAS."
            ],
            offline: [
                "Предпросмотр Studio",
                "Не удалось загрузить настройку из GAS."
            ],
            saving: [
                "Сохраняем оформление…",
                "Новый фон отправляется на публичный сайт."
            ],
            saved: [
                "Фон сайта обновлён",
                "Изменение уже доступно посетителям."
            ],
            error: [
                "Не удалось сохранить фон",
                details || "Проверьте подключение к GAS."
            ]
        };

        const message = messages[state] || messages.connected;
        title.textContent = message[0];
        copy.textContent = message[1];
    };
})();