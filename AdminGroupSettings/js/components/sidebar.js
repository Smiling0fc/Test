
class Sidebar {

    static render() {

        const sidebar = document.getElementById("sidebar");

        sidebar.innerHTML = `

            <div class="sidebar-logo">

                <img
                    src="images/logo.png"
                    alt="Logo"
                    class="sidebar-logo-image">

                <h2>Photographer CMS</h2>

            </div>

            <nav class="sidebar-menu">

                <button class="menu-item active"
                        data-page="dashboard">

                    <span class="icon">🏠</span>

                    <span>Dashboard</span>

                </button>

                <button class="menu-item"
                        data-page="collections">

                    <span class="icon">📷</span>

                    <span>Коллекции</span>

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

                    <span>Настройки</span>

                </button>

            </nav>

            <div class="sidebar-footer">

                <span>

                    Photographer CMS

                </span>

                <small>

                    Version 0.3.0

                </small>

            </div>

        `;

    }

}
