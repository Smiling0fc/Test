class Sidebar {

    static render() {

        const sidebar = document.getElementById("sidebar");

        sidebar.innerHTML = `

            <div class="sidebar-logo">

                <img
                    src="images/logo.png"
                    alt="ViJoy Studio"
                    class="sidebar-logo-image">

                <h2>ViJoy Studio</h2>

            </div>

            <nav class="sidebar-menu">

                <button class="menu-item active"
                        data-page="dashboard">

                    <span class="icon">🏠</span>

                    <span>Studio Home</span>

                </button>

                <button class="menu-item"
                        data-page="collections">

                    <span class="icon">📷</span>

                    <span>Collections</span>

                </button>

                <button class="menu-item"
                        data-page="pages">

                    <span class="icon">📝</span>

                    <span>Страницы</span>

                </button>

                <button class="menu-item"
                        data-page="blog">

                    <span class="icon">📰</span>

                    <span>Блог</span>

                </button>

                <button class="menu-item"
                        data-page="settings">

                    <span class="icon">⚙️</span>

                    <span>Preferences</span>

                </button>

            </nav>

            <div class="sidebar-footer">

                <span>
                    ViJoy Studio
                </span>

                <small class="studio-tagline">
                    Craft beautiful photographic stories.
                </small>

                <small>
                    v${CMS_CONFIG.version} • ${CMS_CONFIG.codename}
                </small>

            </div>

        `;

    }

}