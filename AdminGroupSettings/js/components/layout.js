class Layout {

    static render(){

        const app = document.getElementById("app");

        app.innerHTML = `

            <div class="admin-layout">

                <aside id="sidebar" class="sidebar glass"></aside>

                <header id="header" class="header glass"></header>

                <main id="content" class="content glass"></main>

            </div>

        `;

    }

}
