import { World } from './js/components/world.js';
import { ReplaceBody } from './js/utils/replace.js';
import { Projects } from './assets/projects.js';

const canvas = document.getElementById("webgl");
const items = document.getElementById("items");
const world = new World(canvas, items);

/*gsap.ticker.add(() => world.render());

gsap.ticker.fps(50);*/

barba.init({
    views: [{
        namespace: 'about',
        /*beforeLeave(data) {
            //world.closePlane();
            //world.expandPlanes();
        },
        beforeEnter(data) {
            //world.setScroll();
            //window.scroll(0, 0);
        },*/
    },
    {
        namespace: 'projects',
        beforeEnter(data) {

            /*const cont = document.getElementsByClassName("principal")[0];

            Projects.forEach(p => {
    
                const title = document.createElement("p");
                title.classList.add("title");
    
                const innerTitle = document.createElement("span");
                innerTitle.classList.add("head-projs");
                innerTitle.innerText = p.title;
    
                title.appendChild(innerTitle);
                cont.appendChild(title);
    
            });*/

        }
    }
    ,{
        namespace: 'index',
        afterEnter(data) {
            window.scroll(0, world.valScroll);
            world.reloadIndex();
        },
        beforeLeave(data) {

            Array.from(
                document.getElementById("items").children
            ).forEach(
                d => d.classList.add("noclicks")
            );
            
            world.shrinkPlanes();

        },
    }],
    transitions: [{
        name: 'fade',

        leave(data) {
            return gsap.to(data.current.container, {
                opacity: 0
            });
        },

        enter(data) {
            return gsap.from(data.next.container, {
                opacity: 0
            });
        }
    }]
});

barba.hooks.beforeEnter((data) => {

    world.setScroll();
    window.scroll(0, 0);

    ReplaceBody(data);

});

barba.hooks.beforeLeave((data) => {

    if (data.current.namespace === 'index') return;

    world.closePlane();
    world.expandPlanes();

});

world.render();