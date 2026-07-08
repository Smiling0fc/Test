class Navigation {

    static init() {

        const buttons = document.querySelectorAll(".sidebar button");

        buttons.forEach(button => {

            button.addEventListener("click", () => {

                buttons.forEach(item =>
                    item.classList.remove("active")
                );

                button.classList.add("active");

                const page = button.dataset.page;

                Header.render(button.textContent.trim());

                switch(page){

                    case "dashboard":
                        Dashboard.render();
                        break;

                    default:

                        document.getElementById("content").innerHTML = `

                            <div class="dashboard fade">

                                <h1>${button.textContent}</h1>

                                <p>

                                    Раздел находится в разработке.

                                </p>

                            </div>

                        `;

                }

            });

        });

    }

}
