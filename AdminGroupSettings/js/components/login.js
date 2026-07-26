class Login {

    static render() {

        const app = document.getElementById("app");

        app.innerHTML = `

        <div class="login-screen">

            <div class="login-card glass fade">

                <img src="images/logo.png"
                     class="login-logo"
                     alt="ViJoy Studio">

                <h1>ViJoy Studio</h1>

                <p>

                    Craft beautiful photographic stories.

                </p>

                <button
                    id="googleLogin"
                    class="google-button">

                    Войти через Google

                </button>

                <span class="version">
                    v${CMS_CONFIG.version} • ${CMS_CONFIG.codename}
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