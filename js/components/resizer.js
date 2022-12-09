import { FrustrumSize } from '../utils/constants.js';

class Resizer {

    constructor(camera, renderer, planes) {

        this.setSize(camera, renderer, planes);

        window.addEventListener('resize', () => {
            
            this.setSize(camera, renderer, planes);
            this.onResize();

        });

    }

    onResize() {

    }

    setSize(camera, renderer, planes) {

        //const canvas = renderer.domElement;

        const aspect = window.innerWidth / window.innerHeight;

        camera.right = FrustrumSize * aspect / 2;
        camera.left = FrustrumSize * aspect / -2;
        //camera.top = FrustrumSize * aspect / 2;
        //camera.bottom = FrustrumSize * aspect / -2;

        /*planes.forEach(plane => {

            plane.setMeshFromScreen();
            
        });*/

        

        // update the size of the renderer AND the canvas
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Set the camera's aspect ratio
        //camera.aspect = window.innerWidth / window.innerHeight;
    
        // update the camera's frustum
        camera.updateProjectionMatrix();
        
        // set the pixel ratio (for mobile devices)
        renderer.setPixelRatio(window.devicePixelRatio);
    
    }

}
  
export { Resizer };
  