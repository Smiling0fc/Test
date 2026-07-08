
class Dashboard {

    static render() {

        const content = document.getElementById("content");

        content.innerHTML = `

            <div class="dashboard fade">

                <h1>Добро пожаловать 👋</h1>

                <p>
                    Это панель управления сайтом фотографа.
                </p>

                <div class="cards">

                    <div class="card glass">

                        <h3>Коллекций</h3>

                        <span>0</span>

                    </div>

                    <div class="card glass">

                        <h3>Фотографий</h3>

                        <span>0</span>

                    </div>

                    <div class="card glass">

                        <h3>Просмотров</h3>

                        <span>—</span>

                    </div>

                    <div class="card glass">

                        <h3>Статус</h3>

                        <span>🟢</span>

                    </div>

                </div>

                <div class="welcome glass">

                    <h2>Начало работы</h2>

                    <p>

                        Добро пожаловать в систему управления сайтом.

                        <br><br>

                        Для начала создайте первую коллекцию фотографий,
                        затем загрузите изображения и опубликуйте их
                        на главной странице.

                    </p>

                </div>

            </div>

        `;

    }

}
