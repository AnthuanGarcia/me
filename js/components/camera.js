import { FrustrumSize } from '../utils/constants.js';

function createCamera() {
  
    const aspect = window.innerWidth / window.innerHeight;

    const camera = new THREE.OrthographicCamera(
      FrustrumSize * aspect / - 2,
      FrustrumSize * aspect / 2,
      FrustrumSize / 2,
      FrustrumSize / - 2, 1, 100
    );
  
    camera.position.set(0, 0, 3);
  
    return camera;

}

export { createCamera };
  