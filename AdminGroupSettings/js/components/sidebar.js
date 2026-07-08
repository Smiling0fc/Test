
class Sidebar {

    static render() {

        const sidebar = document.getElementById("sidebar");

        sidebar.innerHTML = `

            <div class="sidebar-logo">

                <img src="images/logo.png" alt="Logo">

                <h2>Photographer CMS</h2>

            </div>

            <nav>

                <button class="active" data-page="dashboard">
                    🏠 Dashboard
                </button>

                <button data-page="home">
                    🖼 Главная
                </button>

                <button data-page="collections">
                    📷 Коллекции
                </button>

                <button data-page="pages">
                    📝 Страницы
                </button>

                <button data-page="settings">
                    ⚙ Настройки
                </button>

            </nav>

        `;

    }

}
