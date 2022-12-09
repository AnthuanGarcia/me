import { World } from './js/components/world.js';
import { ReplaceBody } from './js/utils/replace.js';

const canvas = document.getElementById("webgl");
const items = document.getElementById("items");
const world = new World(canvas, items);

/*gsap.ticker.add(() => world.render());

gsap.ticker.fps(50);*/

barba.init({
    views: [{
        namespace: 'about',
        beforeLeave(data) {
            world.closePlane();
            world.expandPlanes();
        },
        beforeEnter(data) {
            world.setScroll();
            window.scroll(0, 0);
        },
    },
    {
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
    ReplaceBody(data)
});

world.render();