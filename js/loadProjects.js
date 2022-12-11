
const Projects = () => {

    fetch("../assets/projects.json")
    .then(r => r.json())
    .then(r => {

        const cont = document.getElementsByClassName("swiper")[0];

        r.forEach(p => {

            const title = document.createElement("p");
            title.classList.add("title");

            const innerTitle = document.createElement("span");
            innerTitle.classList.add("head-projs");
            innerTitle.innerText = p.title;

            title.appendChild(innerTitle);
            cont.appendChild(title);

        });

    });

}

export { Projects };