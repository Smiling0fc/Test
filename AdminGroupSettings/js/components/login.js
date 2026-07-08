class Login {

    static render() {

        const app = document.getElementById("app");

        app.innerHTML = `

        <div class="login-screen">

            <div class="login-card glass fade">

                <img src="images/logo.png"
                     class="login-logo"
                     alt="Logo">

                <h1>Photographer CMS</h1>

                <p>

                    Управление сайтом фотографа

                </p>

                <button
                    id="googleLogin"
                    class="google-button">

                    Войти через Google

                </button>

                <span class="version">

                    Version 0.3.0

                </span>

            </div>

        </div>

        `;

        document
            .getElementById("googleLogin")
            .addEventListener(
                "click",
                Auth.login
            );

    }

}
