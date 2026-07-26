class Dashboard {

    static async render() {

        const content = document.getElementById("content");

        content.innerHTML = `
            <div class="studio-dashboard fade">
                <div class="dashboard-heading">
                    <div>
                        <span class="dashboard-kicker">STUDIO OVERVIEW</span>
                        <h1>Studio Home</h1>
                        <p>
                            Сводка по содержимому сайта и состоянию
                            подключённых сервисов.
                        </p>
                    </div>

                    <button
                        id="dashboardRefresh"
                        class="secondaryButton dashboard-refresh"
                        type="button">
                        Обновить данные
                    </button>
                </div>

                <section class="dashboard-summary-grid">
                    ${this.renderMetric("Коллекции", "…", "Всего в проекте", "collections")}
                    ${this.renderMetric("Опубликовано", "…", "Видно на публичном сайте", "published")}
                    ${this.renderMetric("Фотографии", "…", "Во всех коллекциях", "photos")}
                    ${this.renderMetric("Скрыто", "…", "Черновики и закрытые истории", "hidden")}
                </section>

                <section class="dashboard-main-grid">
                    <div class="dashboard-panel">
                        <div class="dashboard-panel-header">
                            <div>
                                <h2>Работоспособность</h2>
                                <p>
                                    Быстрая проверка сайта, API,
                                    Google Sheets и Drive.
                                </p>
                            </div>

                            <span
                                id="dashboardUpdated"
                                class="dashboard-updated">
                                Проверяем…
                            </span>
                        </div>

                        <div
                            id="dashboardStatusList"
                            class="dashboard-status-list">
                            ${this.renderStatus("Публичный сайт", "Проверяем…", "pending", "GitHub Pages")}
                            ${this.renderStatus("Google Apps Script", "Проверяем…", "pending", "CMS API")}
                            ${this.renderStatus("Google Sheets", "Проверяем…", "pending", "Данные сайта")}
                            ${this.renderStatus("Google Drive", "Проверяем…", "pending", "Хранилище фотографий")}
                        </div>
                    </div>

                    <div class="dashboard-panel">
                        <div class="dashboard-panel-header">
                            <div>
                                <h2>Требует внимания</h2>
                                <p>
                                    Места, которые стоит проверить
                                    перед публикацией.
                                </p>
                            </div>
                        </div>

                        <div
                            id="dashboardAttentionList"
                            class="dashboard-attention-list">
                            <div class="dashboard-attention-row">
                                <div class="dashboard-attention-content">
                                    <span class="dashboard-attention-icon">◇</span>
                                    <div class="dashboard-attention-copy">
                                        <strong>Собираем проверку…</strong>
                                        <small>Несколько секунд</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="dashboard-panel dashboard-analytics-placeholder">
                    <div class="dashboard-analytics-copy">
                        <span>Подключение позже</span>
                        <h2>Статистика посещений GA4</h2>
                        <p>
                            Здесь появятся посетители, просмотры,
                            популярные коллекции и источники переходов.
                            Место уже зарезервировано в структуре Dashboard.
                        </p>
                    </div>
                </section>
            </div>
        `;

        document
            .getElementById("dashboardRefresh")
            .addEventListener(
                "click",
                () => this.load()
            );

        await this.load();

    }

    static renderMetric(label, value, note, key) {
        return `
            <article class="dashboard-metric">
                <span class="dashboard-metric-label">
                    ${this.escapeHtml(label)}
                </span>
                <strong
                    id="dashboardMetric-${key}"
                    class="dashboard-metric-value">
                    ${this.escapeHtml(value)}
                </strong>
                <small class="dashboard-metric-note">
                    ${this.escapeHtml(note)}
                </small>
            </article>
        `;
    }

    static renderStatus(name, text, state, note) {
        return `
            <div class="dashboard-status-row">
                <div class="dashboard-status-copy">
                    <strong>${this.escapeHtml(name)}</strong>
                    <small>${this.escapeHtml(note)}</small>
                </div>
                <span class="dashboard-status-badge ${state}">
                    ${this.escapeHtml(text)}
                </span>
            </div>
        `;
    }

    static async load() {
        const button = document.getElementById(
            "dashboardRefresh"
        );

        if (button) {
            button.disabled = true;
            button.textContent = "Обновляем…";
        }

        const collections = CollectionService.getAll();
        const fallbackStats = this.getFallbackStats(
            collections
        );

        this.applyStats(fallbackStats);

        const [siteResult, apiResult, statsResult] =
            await Promise.allSettled([
                this.checkPublicSite(),
                ApiService.health(),
                ApiService.getDashboardStats()
            ]);

        let stats = fallbackStats;

        if (statsResult.status === "fulfilled") {
            stats = {
                ...fallbackStats,
                ...statsResult.value.stats
            };
            this.applyStats(stats);
        }

        this.renderStatuses({
            siteResult,
            apiResult,
            statsResult,
            stats
        });
        this.renderAttention(stats, collections);

        const updated = document.getElementById(
            "dashboardUpdated"
        );

        if (updated) {
            updated.textContent =
                `Обновлено ${new Date().toLocaleTimeString(
                    "ru-RU",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )}`;
        }

        if (button) {
            button.disabled = false;
            button.textContent = "Обновить данные";
        }
    }

    static getFallbackStats(collections) {
        const published = collections.filter(
            collection => collection.published === true
        ).length;

        return {
            collections: collections.length,
            published,
            hidden: collections.length - published,
            photos: null,
            withoutCover: collections.filter(
                collection => !collection.coverPhotoId
            ).length,
            withoutDescription: collections.filter(
                collection => !String(
                    collection.description || ""
                ).trim()
            ).length,
            sheetsOk: null,
            driveOk: null
        };
    }

    static applyStats(stats) {
        const values = {
            collections: stats.collections ?? 0,
            published: stats.published ?? 0,
            photos: stats.photos ?? "—",
            hidden: stats.hidden ?? 0
        };

        Object.entries(values).forEach(([key, value]) => {
            const element = document.getElementById(
                `dashboardMetric-${key}`
            );

            if (element) {
                element.textContent = String(value);
            }
        });
    }

    static renderStatuses({
        siteResult,
        apiResult,
        statsResult,
        stats
    }) {
        const list = document.getElementById(
            "dashboardStatusList"
        );

        if (!list) {
            return;
        }

        const publicOk =
            siteResult.status === "fulfilled";
        const apiOk =
            apiResult.status === "fulfilled";
        const detailedStatsAvailable =
            statsResult.status === "fulfilled";

        const sheetsState = detailedStatsAvailable
            ? Boolean(stats.sheetsOk)
            : null;
        const driveState = detailedStatsAvailable
            ? Boolean(stats.driveOk)
            : null;

        list.innerHTML = [
            this.renderStatus(
                "Публичный сайт",
                publicOk ? "Работает" : "Недоступен",
                publicOk ? "ok" : "error",
                "GitHub Pages"
            ),
            this.renderStatus(
                "Google Apps Script",
                apiOk ? "Работает" : "Ошибка",
                apiOk ? "ok" : "error",
                apiOk
                    ? `CMS API ${apiResult.value.version || ""}`.trim()
                    : "CMS API"
            ),
            this.renderStatus(
                "Google Sheets",
                sheetsState === null
                    ? "Нужен маршрут"
                    : sheetsState
                        ? "Подключена"
                        : "Ошибка",
                sheetsState === null
                    ? "warn"
                    : sheetsState
                        ? "ok"
                        : "error",
                "Данные сайта"
            ),
            this.renderStatus(
                "Google Drive",
                driveState === null
                    ? "Нужен маршрут"
                    : driveState
                        ? "Подключён"
                        : "Ошибка",
                driveState === null
                    ? "warn"
                    : driveState
                        ? "ok"
                        : "error",
                "Хранилище фотографий"
            )
        ].join("");
    }

    static renderAttention(stats, collections) {
        const list = document.getElementById(
            "dashboardAttentionList"
        );

        if (!list) {
            return;
        }

        const issues = [];

        if (Number(stats.withoutCover || 0) > 0) {
            issues.push({
                title: `${stats.withoutCover} без обложки`,
                note: "Карточки будут показаны без изображения"
            });
        }

        if (Number(stats.withoutDescription || 0) > 0) {
            issues.push({
                title: `${stats.withoutDescription} без описания`,
                note: "Добавьте короткий текст для коллекций"
            });
        }

        const hidden = Number(stats.hidden || 0);
        if (hidden > 0) {
            issues.push({
                title: `${hidden} скрыто`,
                note: "Эти коллекции не видны посетителям"
            });
        }

        const publishedWithoutPhotos = collections.filter(
            collection =>
                collection.published === true &&
                Array.isArray(collection.photos) &&
                collection.photos.length === 0 &&
                stats.photos !== null
        ).length;

        if (publishedWithoutPhotos > 0) {
            issues.push({
                title: `${publishedWithoutPhotos} опубликовано без фото`,
                note: "Проверьте пустые коллекции"
            });
        }

        if (!issues.length) {
            list.innerHTML = `
                <div
                    class="dashboard-attention-row"
                    data-level="ok">
                    <div class="dashboard-attention-content">
                        <span class="dashboard-attention-icon">✓</span>
                        <div class="dashboard-attention-copy">
                            <strong>Всё выглядит аккуратно</strong>
                            <small>Критичных замечаний не найдено</small>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        list.innerHTML = issues.map(issue => `
            <div class="dashboard-attention-row">
                <div class="dashboard-attention-content">
                    <span class="dashboard-attention-icon">!</span>
                    <div class="dashboard-attention-copy">
                        <strong>${this.escapeHtml(issue.title)}</strong>
                        <small>${this.escapeHtml(issue.note)}</small>
                    </div>
                </div>
            </div>
        `).join("");
    }

    static async checkPublicSite() {
        const response = await fetch(
            "../",
            {
                method: "GET",
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        return true;
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