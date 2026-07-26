(() => {
    const originalRender = Settings.render.bind(Settings);
    const originalApplyTheme = Settings.applyTheme.bind(Settings);

    Settings.render = async function () {
        try {
            const appearance = await AppearanceService.load();
            localStorage.setItem(
                this.storageKey,
                appearance.backgroundTheme
            );
        } catch (error) {
            console.warn(
                "Настройки оформления пока недоступны:",
                error.message
            );
        }

        originalRender();
        this.updateConnectionNote("connected");
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

                    try {
                        const appearance = await AppearanceService.save(
                            theme.id
                        );

                        localStorage.setItem(
                            this.storageKey,
                            appearance.backgroundTheme
                        );

                        const savedTheme = this.themes.find(
                            item => item.id === appearance.backgroundTheme
                        ) || theme;

                        originalApplyTheme(savedTheme);
                        this.updateConnectionNote("saved");

                        ActivityService.log({
                            type: "settings",
                            title: "Изменён фон сайта",
                            details: savedTheme.name
                        });
                    } catch (error) {
                        console.error(error);
                        this.updateConnectionNote("error");
                    }
                });
            });
    };

    Settings.updateConnectionNote = function (state) {
        const note = document.querySelector(".settings-save-note");
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
                "Проверьте маршруты SiteAppearance в GAS."
            ]
        };

        const message = messages[state] || messages.connected;
        title.textContent = message[0];
        copy.textContent = message[1];
    };
})();
