(() => {

    const typeMeta = {
        "collection-create": ["＋", "Создание"],
        "collection-update": ["✎", "Коллекция"],
        "collection-delete": ["×", "Удаление"],
        "collection-order": ["⠿", "Порядок"],
        "cover-update": ["▣", "Обложка"],
        "photo-upload": ["↑", "Фотография"],
        "photo-delete": ["−", "Фотография"],
        "hero-update": ["◇", "Homepage"]
    };

    const formatDate = value => {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Недавно";
        }

        const now = new Date();
        const sameDay =
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate();

        return new Intl.DateTimeFormat(
            "ru-RU",
            sameDay
                ? {
                    hour: "2-digit",
                    minute: "2-digit"
                }
                : {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit"
                }
        ).format(date);
    };

    const renderRow = activity => {
        const meta = typeMeta[activity.type] || ["·", "Studio"];

        return `
            <article class="dashboard-activity-row">
                <span class="dashboard-activity-icon">
                    ${Dashboard.escapeHtml(meta[0])}
                </span>

                <div class="dashboard-activity-copy">
                    <div class="dashboard-activity-title-row">
                        <strong>${Dashboard.escapeHtml(
                            activity.title || "Действие в Studio"
                        )}</strong>
                        <time>${Dashboard.escapeHtml(
                            formatDate(activity.createdAt)
                        )}</time>
                    </div>

                    <div class="dashboard-activity-meta">
                        <span>${Dashboard.escapeHtml(meta[1])}</span>
                        ${activity.details
                            ? `<small>${Dashboard.escapeHtml(activity.details)}</small>`
                            : ""
                        }
                    </div>
                </div>
            </article>
        `;
    };

    const mountPanel = () => {
        const analytics = document.querySelector(
            ".dashboard-analytics-placeholder"
        );

        if (!analytics || document.getElementById("dashboardActivityList")) {
            return;
        }

        analytics.insertAdjacentHTML(
            "beforebegin",
            `
                <section class="dashboard-panel dashboard-activity-panel">
                    <div class="dashboard-panel-header">
                        <div>
                            <h2>Последние действия</h2>
                            <p>
                                Изменения коллекций, фотографий и главной страницы.
                            </p>
                        </div>

                        <span class="dashboard-activity-limit">
                            Последние 8
                        </span>
                    </div>

                    <div
                        id="dashboardActivityList"
                        class="dashboard-activity-list">
                        <div class="dashboard-activity-loading">
                            Загружаем журнал…
                        </div>
                    </div>
                </section>
            `
        );
    };

    const loadActivity = async () => {
        const list = document.getElementById(
            "dashboardActivityList"
        );

        if (!list) {
            return;
        }

        list.innerHTML = `
            <div class="dashboard-activity-loading">
                Загружаем журнал…
            </div>
        `;

        try {
            const activities = await ActivityService.load(8);

            if (!activities.length) {
                list.innerHTML = `
                    <div class="dashboard-activity-empty">
                        <span>◇</span>
                        <strong>Журнал пока пуст</strong>
                        <small>
                            Следующее изменение в Studio появится здесь.
                        </small>
                    </div>
                `;
                return;
            }

            list.innerHTML = activities
                .map(renderRow)
                .join("");

        } catch (error) {
            console.warn("Журнал действий недоступен:", error);

            list.innerHTML = `
                <div class="dashboard-activity-empty is-warning">
                    <span>!</span>
                    <strong>Журнал ещё не подключён</strong>
                    <small>
                        Добавьте ActivityLog.gs и опубликуйте новую версию GAS.
                    </small>
                </div>
            `;
        }
    };

    const originalRender = Dashboard.render.bind(Dashboard);

    Dashboard.render = async function () {
        await originalRender();
        mountPanel();
        await loadActivity();
    };

    const originalLoad = Dashboard.load.bind(Dashboard);

    Dashboard.load = async function () {
        await Promise.all([
            originalLoad(),
            loadActivity()
        ]);
    };

})();
