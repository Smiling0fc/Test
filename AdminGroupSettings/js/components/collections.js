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
Collections.bindEvents();
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
            renderList()
            return;

        }
        
        container.innerHTML = collections.map(collection=>`

            <div
                class="collection-card glass"
                data-id="${collection.id}">

                <div>

                    <h2>${collection.name}</h2>

                    <p>

                        ${collection.photos.length}
                        фотографий

                    </p>

                </div>

          <div class="collection-actions">

               <button
                     class="iconButton renameButton"
                     data-id="${collection.id}">

                     ✏️

                     </button>

               <button
                     class="iconButton deleteButton"
                     data-id="${collection.id}">

                     🗑️

               </button>

          </div>

            </div>

        `).join("");

        Collections.bindEvents();

    }

    static create() {

        const name = prompt("Введите название коллекции");

        if (name === null) return;

        const trimmed = name.trim();

        if (trimmed === "") return;

        if (CollectionService.create(trimmed)) {

            Collections.render();

      }

}

static bindEvents(){

    const container =
        document.getElementById("collectionsContainer");

    if(!container) return;

    container.onclick = event => {

        const renameButton =
            event.target.closest(".renameButton");

        if(renameButton){

            Collections.rename(

                Number(renameButton.dataset.id)

            );

            return;

        }

        const deleteButton =
            event.target.closest(".deleteButton");

        if(deleteButton){

            Collections.remove(

                Number(deleteButton.dataset.id)

            );

            return;

        }

        const card =
            event.target.closest(".collection-card");

        if(card){

            CollectionView.open(

                Number(card.dataset.id)

            );

        }

    };

}
    document
        .querySelectorAll(".renameButton")
        .forEach(button=>{

            button.onclick=()=>{

                Collections.rename(
                    Number(button.dataset.id)
                );

            };

        });

    document
        .querySelectorAll(".deleteButton")
        .forEach(button=>{

            button.onclick=()=>{

                Collections.remove(
                    Number(button.dataset.id)
                );

            };

        });

}
   static rename(id){

    const name = prompt("Новое название");

    if(name===null) return;

    const trimmed=name.trim();

    if(trimmed==="") return;

    CollectionService.rename(id, trimmed);

    Collections.render();

}
    static remove(id){

    if(!confirm("Удалить коллекцию?"))
        return;

    CollectionService.remove(id);

    Collections.render();

}
    
}
