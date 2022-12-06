import { FrustrumSize } from '../utils/constants.js';

function createCamera() {

    //const camera = new THREE.PerspectiveCamera(
    //  45, // fov = Field Of View
    //  1, // aspect ratio (dummy value)
    //  0.1, // near clipping plane
    //  60, // far clipping plane
    //);
  
    const aspect = window.innerWidth / window.innerHeight;

    const camera = new THREE.OrthographicCamera(
      FrustrumSize * aspect / - 2,
      FrustrumSize * aspect / 2,
      FrustrumSize / 2,
      FrustrumSize / - 2, 1, 100
    );
  
    camera.position.set(0, 0, 2);
  
    return camera;

}

export { createCamera };
  