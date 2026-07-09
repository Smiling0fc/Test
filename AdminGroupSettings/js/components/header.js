class Header {

    static render(title = "Dashboard"){

        const header = document.getElementById("header");

        header.innerHTML = `

            <div class="header-title">

                ${title}

            </div>

            <div class="header-user">

                <span>Администратор</span>

                <div class="avatar">
                    A
                </div>

                <button
                    id="logoutButton"
                    class="logoutButton">

                    Выйти

                </button>

            </div>

        `;

        document
            .getElementById("logoutButton")
            .onclick = Auth.logout;

    }

}
