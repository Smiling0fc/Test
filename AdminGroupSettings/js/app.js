class App {

    static async start() {

        if (!Auth.isLogged()) {

            Login.render();

            return;

        }

        Layout.render();
        Sidebar.render();
        Header.render("Dashboard");

        document
            .getElementById("content")
            .innerHTML = `

                <div class="dashboard fade">

                    <h1>Загрузка...</h1>

                    <p>
                        Получаем данные с сервера.
                    </p>

                </div>

            `;

        try {

            await CollectionService.load();

            Dashboard.render();

            Navigation.init();

        } catch (error) {

            console.error(error);

            document
                .getElementById("content")
                .innerHTML = `

                    <div class="dashboard fade">

                        <h1>
                            Не удалось загрузить CMS
                        </h1>

                        <p>
                            ${error.message}
                        </p>

                    </div>

                `;

        }

    }

}

window.addEventListener(
    "DOMContentLoaded",
    () => {

        App.start();

    }
);
