class Navigation {

    static init() {

        const buttons = document.querySelectorAll(
            ".menu-item[data-page]"
        );

        buttons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    buttons.forEach(item =>
                        item.classList.remove("active")
                    );

                    button.classList.add("active");
                    button.setAttribute("aria-current", "page");

                    buttons.forEach(item => {
                        if (item !== button) {
                            item.removeAttribute("aria-current");
                        }
                    });

                    const page = button.dataset.page;
                    const label = button
                        .querySelector(".menu-label")
                        ?.textContent
                        ?.trim() || button.textContent.trim();

                    Header.render(label);

                    const routes = {
                        dashboard: Dashboard,
                        homepage: Homepage,
                        collections: Collections
                    };

                    if (routes[page]) {
                        routes[page].render();
                        return;
                    }

                    document
                        .getElementById("content")
                        .innerHTML = `
                            <div class="dashboard fade">
                                <h1>${label}</h1>
                                <p>
                                    Раздел находится в разработке.
                                </p>
                            </div>
                        `;

                }
            );
        });

    }
}
