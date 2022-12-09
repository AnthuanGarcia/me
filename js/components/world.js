import { createScene } from './scene.js';
import { createCamera } from './camera.js';
import { createRenderer } from './renderer.js';
import { Plane } from './cube.js';
import { Resizer } from './resizer.js';
import { FrustrumSize } from '../utils/constants.js';

class World {

    constructor(wrapper, items) {

        this._renderer = createRenderer(wrapper);
        this._camera = createCamera();
        this._scene = createScene();
        this._planes = [];

        this.isFullScreen = false;
        this.isAnimating = false;
        this.items = items;

        this.valScroll = 0.0;
        
        this.canvasWidth = this._renderer.domElement.clientWidth;
        this.canvasHeight = this._renderer.domElement.clientHeight;
        //loop = new Loop(camera, scene, renderer, uniforms);
        //container.append(renderer.domElement);
        
        Array.from(this.items.children)
        .forEach((e, i) => {

            const plane = new Plane(this, e, i);

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

        window.addEventListener("scroll", (e) => {

            
            /*this._planes.forEach((p) => {

                if (!this.isAnimating) {

                    //p.rectHtml = this.items.children[i];
                    //p.setMeshFromScreen();

                }
            });*/

            this.setItems();

        });

        window.addEventListener('resize', () => {
            
            this.setSize();

        });
    
        //this._resizer = new Resizer(this._camera, this._renderer, this._planes);

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

        this._renderer.setAnimationLoop(() => {


            this._renderer.render(this._scene, this._camera);
        });


    }
    
    start() {
        
    }
    
    stop() {
        
    }

    shrinkPlanes() {

        this._planes.forEach(p => {

            if (!p.isFullScreen) 
                p.shrinkHeight();

        });

    }

    expandPlanes() {

        this._planes.forEach(p => {

            if (p.isShrinked) 
                p.expandHeight();
                
        });

    }

    closePlane() {

        this._planes.forEach((plane) => {

            if (this.isFullScreen && plane.isFullScreen) {

                plane.exitFullScreen();

            }

        })

        this.isFullScreen = false;

    }

    reloadIndex() {

        this.items = document.getElementById("items");

    }

    setItems() {

        if (this.items) {

            this._planes.forEach((p, i) => {

                p.rect = this.items.children[i];
                p.setMeshFromScreen();

            });

        }

    }

    setScroll() {

        this.valScroll = window.scrollY;

    }

    setSize() {

        //const canvas = renderer.domElement;

        const aspect = window.innerWidth / window.innerHeight;

        this._camera.right = FrustrumSize * aspect / 2;
        this._camera.left = FrustrumSize * aspect / -2;
        //camera.top = FrustrumSize * aspect / 2;
        //camera.bottom = FrustrumSize * aspect / -2;

        /*planes.forEach(plane => {

            plane.setMeshFromScreen();
            
        });*/

        this.setItems();

        // update the size of the renderer AND the canvas
        this._renderer.setSize(window.innerWidth, window.innerHeight);

        this.canvasWidth = this._renderer.domElement.clientWidth;
        this.canvasHeight = this._renderer.domElement.clientHeight;

        // Set the camera's aspect ratio
        //camera.aspect = window.innerWidth / window.innerHeight;
    
        // update the camera's frustum
        this._camera.updateProjectionMatrix();
        
        // set the pixel ratio (for mobile devices)
        this._renderer.setPixelRatio(window.devicePixelRatio);
    
    }
    
}

export { World };