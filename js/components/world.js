import { createScene } from './scene.js';
import { createCamera } from './camera.js';
import { createRenderer } from './renderer.js';
import { Plane } from './cube.js';
import { Resizer } from './resizer.js';

class World {

    constructor(wrapper, items) {

        this._renderer = createRenderer(wrapper);
        this._camera = createCamera();
        this._scene = createScene();
        this._planes = [];

        this.isFullScreen = false;
    
        //loop = new Loop(camera, scene, renderer, uniforms);
        //container.append(renderer.domElement);
        
        Array.from(items.children)
        .forEach((e) => {

            const plane = new Plane(this, 1, 1, e);

            plane.setMesh();
            plane.setInteraction();
            
            this._planes.push(plane);
            this._scene.add(plane.mesh);

        })

        //const {light, ambLight} = createLight();
        //const plane = new Plane(this, 1, 1, items.children[0]);
        //const plane2 = new Plane(this, 5, 3, items.children[0]);
        //const plane3 = new Plane(this, 2, 2, items.children[0]);

        //plane.setMesh();
        //plane.setInteraction();

        //plane2.setMesh();
        //plane2.setInteraction();

        //plane3.setMesh();
        //plane3.setInteraction();

        /*plane.mesh.position.set(
            plane.mesh.position.x + 5,
            0,
            0
        );

        plane2.mesh.position.set(
            plane.mesh.position.x - 5,
            0,
            0
        );

        plane3.mesh.position.set(
            plane.mesh.position.x - 15,
            3,
            0
        );*/

        //this._planes.push(plane /*plane2, plane3*/);
    
        //this._scene.add(plane.mesh /*plane2.mesh, plane3.mesh*/);
    
        this._resizer = new Resizer(this._camera, this._renderer);

        console.log("World is runnig");
    
    }


    render() {
        // draw a single frame
        //renderer.render(this._scene, this._camera);

        /*const canvas = this._renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;

        if (needResize) {

            this._resizer.setSize(this._camera, this._renderer);

        }*/

        this._renderer.render(this._scene, this._camera);

    }
    
    start() {
        
    }
    
    stop() {
        
    }

    closePlane() {

        this._planes.forEach((plane) => {

            if (this.isFullScreen && plane.isFullScreen)
                plane.exitFullScreen();

        })

        this.isFullScreen = false;

    }
    
}

export { World };