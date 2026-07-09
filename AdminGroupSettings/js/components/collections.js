class Collections {

    static render() {

        const content = document.getElementById("content");

        content.innerHTML = `

        <div class="collections fade">

            <div class="page-header">

                <h1>Коллекции</h1>

                <button id="createCollection" class="primaryButton">

                    + Создать коллекцию

                </button>

            </div>

            <div id="collectionsList" class="collections-list">

            </div>

        </div>

        `;

        Collections.renderEmpty();

    }

    static renderEmpty(){

        document.getElementById("collectionsList").innerHTML = `

            <div class="empty-state glass">

                <h2>Коллекций пока нет</h2>

                <p>

                    Создайте первую коллекцию фотографий.

                </p>

            </div>

        `;

    }

}
