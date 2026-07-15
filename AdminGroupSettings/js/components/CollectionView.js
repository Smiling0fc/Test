class CollectionView {

    static currentId = null;

      static open(id) {

    alert("Коллекция открылась!");

       this.currentId = id;

        const collection = CollectionService
           .getAll()
           .find(item => item.id === id);

        if (!collection) {

            document.getElementById("content").innerHTML = `

                <div class="dashboard fade">

                    <h1>Коллекция не найдена</h1>

                </div>

            `;

            return;

        }

        document.getElementById("content").innerHTML = `

            <div class="collection-view fade">

                <div class="page-header">

                    <div>

                        <h1>${collection.name}</h1>

                        <p>

                            ${collection.photos.length}
                            фотографий

                        </p>

                    </div>

                    <button
                        id="backCollections"
                        class="primaryButton">

                        ← Назад

                    </button>

                </div>

                <div class="glass empty-state">

                    <h2>

                        Пока фотографий нет

                    </h2>

                    <p>

                        Скоро здесь появится загрузка
                        фотографий.

                    </p>

                </div>

            </div>

        `;

        document
            .getElementById("backCollections")
            .addEventListener(
                "click",
                Collections.render
            );

    }

}
