async function buildMenu(){

    const response = await fetch("config/menu.json");

    const data = await response.json();

    const nav = document.querySelector("nav ul");

    nav.innerHTML = "";

    data.menu.forEach(item=>{

        const li=document.createElement("li");

        if(item.children){

            li.classList.add("dropdown");

            li.innerHTML=`<a href="#">${item.title}</a>`;

            const ul=document.createElement("ul");

            ul.className="dropdown-menu";

            item.children.forEach(child=>{

                ul.innerHTML+=`
                <li>
                    <a href="${child.link}">
                        ${child.title}
                    </a>
                </li>`;

            });

            li.appendChild(ul);

        }

        else{

            li.innerHTML=`
            <a href="${item.link}">
                ${item.title}
            </a>`;

        }

        nav.appendChild(li);

    });

}
