class Header {

    static currentPage = "dashboard";
    static postWrapped = false;
    static statusTimer = null;

    static pages = {
        dashboard: {
            title: "Studio Home",
            section: "Overview",
            action: "Обновить",
            icon: "↻"
        },
        homepage: {
            title: "Главная страница",
            section: "Overview",
            action: "Открыть сайт",
            icon: "↗"
        },
        collections: {
            title: "Коллекции",
            section: "Content",
            action: "Новая коллекция",
            icon: "+"
        },
        pages: {
            title: "Страницы",
            section: "Site",
            action: "Открыть сайт",
            icon: "↗"
        },
        blog: {
            title: "Блог",
            section: "Content",
            action: "Новая запись",
            icon: "+"
        },
        settings: {
            title: "Настройки",
            section: "Site",
            action: "Открыть сайт",
            icon: "↗"
        }
    };

    static render(title = "Studio Home", page = "dashboard") {
        const header = document.getElementById("header");

        if (!header) {
            return;
        }

        this.currentPage = page;

        const config = this.pages[page] || {
            title,
            section: "Studio",
            action: "Открыть сайт",
            icon: "↗"
        };

        header.innerHTML = `
            <div class="studio-header-context">
                <div class="studio-breadcrumbs" aria-label="Положение в Studio">
                    <span>ViJoy Studio</span>
                    <span class="studio-breadcrumb-separator">/</span>
                    <span>${this.escapeHtml(config.section)}</span>
                </div>

                <div class="studio-header-title-row">
                    <h1>${this.escapeHtml(config.title || title)}</h1>
                    <span class="studio-header-version">v${this.escapeHtml(CMS_CONFIG.version)}</span>
                </div>
            </div>

            <div class="studio-header-tools">
                <div
                    id="studioSaveStatus"
                    class="studio-save-status is-saved"
                    role="status"
                    aria-live="polite">
                    <span class="studio-save-dot"></span>
                    <span class="studio-save-text">Все изменения сохранены</span>
                </div>

                <button
                    id="studioOpenSite"
                    class="studio-header-icon-button"
                    type="button"
                    title="Открыть публичный сайт"
                    aria-label="Открыть публичный сайт">
                    ↗
                </button>

                <button
                    id="studioHeaderAction"
                    class="studio-header-action"
                    type="button">
                    <span class="studio-header-action-icon">${this.escapeHtml(config.icon)}</span>
                    <span>${this.escapeHtml(config.action)}</span>
                </button>
            </div>
        `;

        document
            .getElementById("studioOpenSite")
            ?.addEventListener("click", () => {
                window.open("../", "_blank", "noopener");
            });

        document
            .getElementById("studioHeaderAction")
            ?.addEventListener("click", () => {
                this.runAction(page);
            });

        this.wrapPostRequests();
    }

    static runAction(page) {
        if (page === "dashboard") {
            const refresh = document.getElementById(
                "dashboardRefresh"
            );

            if (refresh) {
                refresh.click();
            } else {
                Dashboard.render();
            }

            return;
        }

        if (page === "collections") {
            const createButton = document.getElementById(
                "createCollection"
            );

            if (createButton) {
                createButton.click();
            } else {
                Collections.render();
                window.setTimeout(
                    () => document
                        .getElementById("createCollection")
                        ?.click(),
                    0
                );
            }

            return;
        }

        if (page === "blog") {
            this.setStatus(
                "Раздел блога ещё собирается",
                "idle"
            );
            return;
        }

        window.open("../", "_blank", "noopener");
    }

    static wrapPostRequests() {
        if (this.postWrapped || !ApiService?.post) {
            return;
        }

        this.postWrapped = true;

        const originalPost = ApiService.post.bind(ApiService);

        ApiService.post = async (...args) => {
            this.setStatus("Сохраняем…", "saving");

            try {
                const result = await originalPost(...args);
                this.setStatus("Все изменения сохранены", "saved");
                return result;
            } catch (error) {
                this.setStatus("Ошибка сохранения", "error");
                throw error;
            }
        };
    }

    static setStatus(message, state = "saved") {
        const status = document.getElementById(
            "studioSaveStatus"
        );

        if (!status) {
            return;
        }

        const text = status.querySelector(
            ".studio-save-text"
        );

        status.className =
            `studio-save-status is-${state}`;

        if (text) {
            text.textContent = message;
        }

        window.clearTimeout(this.statusTimer);

        if (state === "saved" || state === "idle") {
            this.statusTimer = window.setTimeout(
                () => {
                    const current = document.getElementById(
                        "studioSaveStatus"
                    );

                    if (!current) {
                        return;
                    }

                    current.className =
                        "studio-save-status is-saved";

                    const currentText = current.querySelector(
                        ".studio-save-text"
                    );

                    if (currentText) {
                        currentText.textContent =
                            "Все изменения сохранены";
                    }
                },
                state === "idle" ? 2600 : 1800
            );
        }
    }

    static escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
}
