async function buildCollections() {

    const response = await fetch("config/collections.json");

    const data = await response.json();

    const container = document.getElementById("collections");

    container.innerHTML = "";

    data.collections
        .sort((a, b) => a.order - b.order)
        .forEach(collection => {

            const card = document.createElement("div");

            card.className = `collection-card ${collection.size}`;

            card.innerHTML = `
                <div class="collection-glass">

                    <img src="${collection.image}" alt="${collection.title}">

                </div>

                <h2 class="collection-title">

                    ${collection.title}

                </h2>
            `;

            container.appendChild(card);

        });

}
