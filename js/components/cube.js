//import { RawShaderMaterial, ShaderMaterial } from 'three';
import { vertexPlane } from '../../assets/vertexPlane.js';
import { FragmentShaders, GlobalUniforms } from '../../assets/fragmentShader.js';
import { D2R, FrustrumSize } from '../utils/constants.js';

class Plane {

    constructor(world, rectHtml, i, percentage = 0.5, width = 1, height = 1) {

        //this.canvasWidth = world._renderer.domElement.clientWidth;
        //this.canvasHeight = world._renderer.domElement.clientHeight;

        this.scene = world._scene;
        this.camera = world._camera;

        this.width = width;
        this.height = height;

        this.world = world;
        this.isFullScreen = false;

        this.rect = rectHtml;
        this.percentage = percentage;

        this.lastHeight = 0.0;
        this.isShrinked = false;

        this.idx = i;

        this.uniforms = {
            //u_time: { value: 0 },
            u_perScreen: { value: percentage },
            u_viewSize: { value: new THREE.Vector2(1, 1) },
            u_progress: { value: 0 },
            u_meshScale: { value: new THREE.Vector2(1, 1) },
            //u_resolution: { value: new THREE.Vector2(0, 0) },
            u_meshPosition: { value: new THREE.Vector2(0, 0) },
        };

    }

    UpdateViewSize() {

        const viewSize = this.getViewSize();

        this.uniforms.u_viewSize.value.x = viewSize.width;
        this.uniforms.u_viewSize.value.y = viewSize.height;

    }

    setMesh() {

        const geom = new THREE.PlaneGeometry(this.width, this.height);
        const mate = new THREE.ShaderMaterial({
            vertexShader: vertexPlane,
            fragmentShader: FragmentShaders[this.idx],
            uniforms: this.uniforms
        });

        mate.uniforms.u_time = GlobalUniforms.u_time;
        mate.uniforms.u_resolution = GlobalUniforms.u_resolution;
        mate.uniforms.u_mouse = GlobalUniforms.u_mouse;
    
        this.mesh = new THREE.Mesh(geom, mate);
        this.setMeshFromScreen();

    }

    setMeshFromScreen() {

        if (this.world.isFullScreen) return;

        this.UpdateViewSize();

        const rect = this.rect.getBoundingClientRect();
        const viewSize = this.getViewSize();

        const widthViewUnit = (rect.width * viewSize.width) / window.innerWidth;
        const heightViewUnit = (rect.height * viewSize.height) / window.innerHeight;

        const xViewUnit =
        (rect.left * viewSize.width) / window.innerWidth - viewSize.width / 2;

        const yViewUnit =
        (rect.top * viewSize.height) / window.innerHeight - viewSize.height / 2;

        this.mesh.scale.x = widthViewUnit;
        this.mesh.scale.y = heightViewUnit;

        let x = xViewUnit + widthViewUnit / 2;
        let y = -yViewUnit - heightViewUnit / 2;

        // geometry.translate(x, y, 0);
        this.mesh.position.x = x;
        this.mesh.position.y = y;

        this.uniforms.u_meshPosition.value.x = x / widthViewUnit;
        this.uniforms.u_meshPosition.value.y = y / heightViewUnit;

        this.uniforms.u_meshScale.value.x = widthViewUnit;
        this.uniforms.u_meshScale.value.y = heightViewUnit;
    }

    setInteraction() {

        const rayCaster = new THREE.Raycaster();

        document.addEventListener("click", (e) => {

            const mouse = new THREE.Vector2(
                ( e.clientX  / this.world.canvasWidth ) * 2 - 1,
                -( e.clientY / this.world.canvasHeight ) * 2 + 1
            );
    
            rayCaster.setFromCamera(mouse, this.camera);
    
            const intersects = rayCaster.intersectObject(this.mesh);

            if (intersects.length > 0 && !this.world.isFullScreen) {

                /*const pixWidth = new THREE.Vector3(
                    this.mesh.position.x - 1 * 0.5,
                    this.mesh.position.y - 1 * 0.5,
                    this.mesh.position.z
                );

                pixWidth.project(this.camera);

                const planePixWidth = new THREE.Vector2(
                    (1 + pixWidth.x) * 0.5 * this.canvasWidth,
                    (1 - pixWidth.y) * 0.5 * this.canvasHeight
                );
                
                const viewSize = this.getViewSize();

                const widhtPlane = (planePixWidth.x * viewSize.width) / this.canvasWidth;
                const heightPlane = (planePixWidth.y * viewSize.height) / this.canvasHeight;*/

                /*const viewSize = this.getViewSize();

                console.log(viewSize);

                const xUnit = this.mesh.position.x - viewSize.width * 0.5;
                const yUnit = this.mesh.position.y - viewSize.height * 0.5;

                const x = xUnit + this.width * 0.5;
                const y = -yUnit - this.height * 0.5;

                this.mesh.position.x = x;
                this.mesh.position.y = y;*/

                /*this.uniforms.u_meshPosition.value.x = this.mesh.position.x;
                this.uniforms.u_meshPosition.value.y = this.mesh.position.y;

                this.uniforms.u_meshScale.value.x = this.width;
                this.uniforms.u_meshScale.value.y = this.height;*/

                //this.setMeshFromScreen();
                
                //this.world.isFullScreen = true;
                this.isFullScreen = true;
                
                this.fullScreen();
                
            }

        }, false);
    
    }

    setPosition(vector) {

        this.mesh.position.set(vector);

    }

    shrinkHeight() {

        this.lastHeight = this.mesh.scale.y;
        this.isShrinked = true;

        gsap
        .timeline({ defaults: { duration: 0.8, ease: "expo.inOut" } })
        .to(this.mesh.scale, {
            y: 0
        })

    }

    expandHeight() {

        this.isShrinked = false;

        gsap
        .timeline({ defaults: { duration: 0.8, ease: "expo.inOut", delay: 0.3 } })
        .to(this.mesh.scale, {
            y: this.lastHeight
        })

    }

    exitFullScreen() {

        gsap
        .timeline({ defaults: { duration: 1.2, ease: "expo.inOut" } })
        .to(this.uniforms.u_progress, {
            value: 0,
            //onComplete: () => this.setMeshFromScreen(),
            onStart: () => this.world.isAnimating = true,
            onComplete: () => {
                this.world.isAnimating = false;
                this.mesh.position.z = 0;
            },

        });

        this.isFullScreen = false;

    }

    fullScreen() {

        gsap
        .timeline({ defaults: { duration: 1.2, ease: "expo.inOut" } })
        .to(this.uniforms.u_progress, {
            value: 1,
            //onComplete: () => this.setMeshFromScreen()
            onStart: () => {
                this.world.isAnimating = true;
                this.mesh.position.z = 2;
            },
            onComplete: () => this.world.isAnimating = false,
        });

    }

    getViewSize() {

        //const fov = this.camera.fov * D2R;
        //const height = Math.abs(this.camera.position.z * Math.tan(fov * 0.5) * 2);

        return { 
            width: this.camera.right * 2,
            height: this.camera.top * 2
        };
    }

}

export { Plane } 