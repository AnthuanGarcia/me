import { World } from './js/components/world.js';
import { ReplaceBody } from './js/utils/replace.js';

const canvas = document.getElementById("webgl");
const items = document.getElementById("items");
const world = new World(canvas, items);

gsap.ticker.add(() => {
    world.render();
});

gsap.ticker.fps(50);

barba.init({
    views: [{
        namespace: 'about',
        beforeLeave(data) {
            world.closePlane();
        }
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