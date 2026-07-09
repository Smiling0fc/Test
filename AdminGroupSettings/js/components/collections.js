class Collections {

    static render() {

        const content = document.getElementById("content");

        const collections = CollectionService.getAll();

        content.innerHTML = `

            <div class="collections fade">

                <div class="page-header">

                    <h1>Коллекции</h1>

                    <button
                        id="createCollection"
                        class="primaryButton">

                        + Создать коллекцию

                    </button>

                </div>

                <div
                    id="collectionsContainer"
                    class="collections-container">

                </div>

            </div>

        `;

        document
            .getElementById("createCollection")
            .addEventListener(
                "click",
                Collections.create
            );

        Collections.renderList(collections);

    }

    static renderList(collections){

        const container = document.getElementById("collectionsContainer");

        if(collections.length===0){

            container.innerHTML=`

                <div class="empty-state glass">

                    <h2>Коллекций пока нет</h2>

                    <p>

                        Нажмите "Создать коллекцию",
                        чтобы добавить первую.

                    </p>

                </div>

            `;

            return;

        }

        container.innerHTML = collections.map(collection=>`

            <div class="collection-card glass">

                <div>

                    <h2>${collection.name}</h2>

                    <p>

                        ${collection.photos.length}
                        фотографий

                    </p>

                </div>

                <div class="collection-actions">

                    <button
                        class="iconButton">

                        ✏️

                    </button>

                    <button
                        class="iconButton">

                        🗑️

                    </button>

                </div>

            </div>

        `).join("");

    }

    static create(){

        const name = prompt("Название коллекции");

        if(!name) return;

        CollectionService.create(name);

        Collections.render();

    }

}
