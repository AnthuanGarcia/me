function createRenderer(wrapper) {

    const renderer = new THREE.WebGLRenderer({alpha: true});

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    wrapper.appendChild(renderer.domElement);

    return renderer;
}
  
export { createRenderer };