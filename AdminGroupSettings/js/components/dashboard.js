class Dashboard {

    static render() {

        const content = document.getElementById("content");

        content.innerHTML = `

            <div class="dashboard fade">

                <h1>Studio Home</h1>

                <p>
                    Добро пожаловать в ViJoy Studio.
                </p>

                <div class="cards">

                    <div class="card glass">
                        <h3>Collections</h3>
                        <span id="collectionsCount">0</span>
                    </div>

                    <div class="card glass">
                        <h3>Фотографии</h3>
                        <span id="photosCount">0</span>
                    </div>

                    <div class="card glass">
                        <h3>ViJoy's Photo Gallery</h3>
                        <span>🟢 Online</span>
                    </div>

                    <div class="card glass">
                        <h3>Версия</h3>
                        <span>v${CMS_CONFIG.version}</span>
                    </div>

                </div>

                <div class="welcome glass">

                    <h2>Craft beautiful photographic stories.</h2>

                    <p>
                        Управляйте коллекциями, импортируйте фотографии,
                        выбирайте обложки и собирайте истории для
                        ViJoy's Photo Gallery.
                    </p>

                </div>

            </div>

        `;

    }

}