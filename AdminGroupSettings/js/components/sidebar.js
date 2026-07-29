class Sidebar {

    static storageKey = "vijoy_sidebar_collapsed";

    static render() {

        const sidebar = document.getElementById("sidebar");
        const collapsed = this.isCollapsed();

        sidebar.innerHTML = `
            <div class="studio-sidebar-shell">
                <div class="studio-project">
                    <div class="studio-project-mark">
                        <img
                            src="images/logo.png"
                            alt=""
                            class="studio-project-logo">
                    </div>

                    <div class="studio-project-copy sidebar-expandable">
                        <strong>ViJoy Studio</strong>
                        <span>Photo Gallery</span>
                    </div>

                    <span
                        class="studio-project-status sidebar-expandable"
                        title="Studio подключена">
                    </span>
                </div>

                <button
                    id="sidebarCreate"
                    class="sidebar-create sidebar-expandable"
                    type="button">
                    <span aria-hidden="true">＋</span>
                    <span>Создать коллекцию</span>
                </button>

                <nav class="sidebar-menu" aria-label="Навигация Studio">
                    ${this.renderGroup("Overview", [
                        ["dashboard", "⌂", "Studio Home"],
                        ["homepage", "▣", "Главная страница"]
                    ])}

                    ${this.renderGroup("Content", [
                        ["collections", "▦", "Коллекции"],
                        ["pages", "◫", "Страницы"],
                        ["blog", "✎", "Блог"]
                    ])}

                    ${this.renderGroup("Site", [
                        ["settings", "⚙", "Настройки"]
                    ])}
                </nav>

                <div class="studio-sidebar-bottom">
                    <button
                        class="sidebar-utility menu-item"
                        data-page="faq"
                        type="button"
                        title="Руководство и FAQ">
                        <span class="sidebar-utility-icon">?</span>
                        <span class="menu-label sidebar-expandable">FAQ</span>
                    </button>

                    <a
                        class="sidebar-utility"
                        href="../"
                        target="_blank"
                        rel="noopener"
                        title="Открыть публичный сайт">
                        <span class="sidebar-utility-icon">↗</span>
                        <span class="sidebar-expandable">Открыть сайт</span>
                    </a>

                    <button
                        id="sidebarLogout"
                        class="sidebar-utility"
                        type="button"
                        title="Выйти из Studio">
                        <span class="sidebar-utility-icon">⇥</span>
                        <span class="sidebar-expandable">Выйти</span>
                    </button>

                    <div class="sidebar-version sidebar-expandable">
                        <span>v${CMS_CONFIG.version}</span>
                        <small>${CMS_CONFIG.codename}</small>
                    </div>

                    <button
                        id="sidebarCollapse"
                        class="sidebar-collapse"
                        type="button"
                        aria-label="${collapsed ? "Развернуть меню" : "Свернуть меню"}"
                        title="${collapsed ? "Развернуть меню" : "Свернуть меню"}">
                        <span aria-hidden="true">${collapsed ? "›" : "‹"}</span>
                        <span class="sidebar-expandable">Свернуть</span>
                    </button>
                </div>
            </div>
        `;

        this.applyCollapsed(collapsed);
        this.bindActions();
    }

    static renderGroup(label, items) {
        return `
            <section class="sidebar-group">
                <span class="sidebar-group-label sidebar-expandable">
                    ${label}
                </span>

                <div class="sidebar-group-items">
                    ${items.map(([page, icon, text]) => `
                        <button
                            class="menu-item${page === "dashboard" ? " active" : ""}"
                            data-page="${page}"
                            type="button"
                            title="${text}">
                            <span class="icon" aria-hidden="true">${icon}</span>
                            <span class="menu-label sidebar-expandable">${text}</span>
                        </button>
                    `).join("")}
                </div>
            </section>
        `;
    }

    static bindActions() {
        document
            .getElementById("sidebarCollapse")
            ?.addEventListener("click", () => {
                const sidebar = document.getElementById("sidebar");
                const next = !sidebar.classList.contains("is-collapsed");

                localStorage.setItem(
                    this.storageKey,
                    next ? "true" : "false"
                );

                this.applyCollapsed(next);
            });

        document
            .getElementById("sidebarLogout")
            ?.addEventListener("click", () => Auth.logout());

        document
            .getElementById("sidebarCreate")
            ?.addEventListener("click", () => {
                const collectionsButton = document.querySelector(
                    '.menu-item[data-page="collections"]'
                );

                collectionsButton?.click();

                window.setTimeout(() => {
                    document
                        .querySelector(".primaryButton")
                        ?.click();
                }, 80);
            });
    }

    static isCollapsed() {
        try {
            return localStorage.getItem(
                this.storageKey
            ) === "true";
        } catch {
            return false;
        }
    }

    static applyCollapsed(collapsed) {
        const sidebar = document.getElementById("sidebar");
        const layout = document.querySelector(".admin-layout");
        const button = document.getElementById("sidebarCollapse");

        sidebar?.classList.toggle("is-collapsed", collapsed);
        layout?.classList.toggle("sidebar-is-collapsed", collapsed);

        if (button) {
            button.setAttribute(
                "aria-label",
                collapsed ? "Развернуть меню" : "Свернуть меню"
            );
            button.title = collapsed
                ? "Развернуть меню"
                : "Свернуть меню";

            const icon = button.querySelector("span:first-child");
            if (icon) {
                icon.textContent = collapsed ? "›" : "‹";
            }
        }
    }
}
