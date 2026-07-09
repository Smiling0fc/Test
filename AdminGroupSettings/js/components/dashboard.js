
class Dashboard {

    static render(){

        const content = document.getElementById("content");

        content.innerHTML = `

            <div class="dashboard fade">

                <h1>Добро пожаловать</h1>

                <p>
                    Вы успешно вошли в систему управления сайтом.
                </p>

                <div class="cards">

                    <div class="card glass">
                        <h3>Коллекции</h3>
                        <span id="collectionsCount">0</span>
                    </div>

                    <div class="card glass">
                        <h3>Фотографии</h3>
                        <span id="photosCount">0</span>
                    </div>

                    <div class="card glass">
                        <h3>Статус сайта</h3>
                        <span>🟢 Online</span>
                    </div>

                    <div class="card glass">
                        <h3>Версия</h3>
                        <span>0.3.0</span>
                    </div>

                </div>

                <div class="welcome glass">

                    <h2>Что дальше?</h2>

                    <p>

                        Следующим этапом будет создание раздела
                        <b>«Коллекции»</b>.

                        <br><br>

                        Именно через него будут создаваться новые
                        альбомы, загружаться фотографии и
                        публиковаться на сайте.

                    </p>

                </div>

            </div>

        `;

    }

}
