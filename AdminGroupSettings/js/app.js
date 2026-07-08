class App {

    static start() {

        if (!Auth.isLogged()) {

            Login.render();

            return;

        }

        Layout.render();

        Sidebar.render();

        Header.render("Dashboard");

        Dashboard.render();

        Navigation.init();

    }

}

window.addEventListener("DOMContentLoaded", () => {

    App.start();

});
