function createLight() {

    const light = new THREE.DirectionalLight();
    const ambLight = new THREE.AmbientLight(0xDDDDDD);

    return {light, ambLight};

}

export { createLight };