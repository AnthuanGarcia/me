import { World } from './js/components/world.js';
import { ReplaceBody } from './js/utils/replace.js';
import { LoadProjects } from './js/loadProjects.js';

const canvas = document.getElementById("webgl");
const items = document.getElementById("items");
const world = new World(canvas, items);

barba.init({
    views: [
    {
        namespace: 'projects-page',
        beforeEnter(data) {

            LoadProjects();

        }
    }
    ,{
        namespace: 'index',
        afterEnter(data) {

            window.scroll(0, world.valScroll);

        },
        beforeLeave(data) {

            Array.from(
                document.getElementById("items").children
            ).forEach(
                d => d.classList.add("noclicks")
            );
            
            world.isFullScreen = true;
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

    if (data.current.namespace !== 'index')
        window.scroll(0, 0);
    else
        world.setScroll();

    ReplaceBody(data);

});

barba.hooks.beforeLeave((data) => {

    if (data.current.namespace === 'index') return;

    world.closePlane();
    world.expandPlanes();

});

world.render();