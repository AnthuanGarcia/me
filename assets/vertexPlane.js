export const vertexPlane = `
uniform float u_time;
uniform vec2 u_viewSize;
uniform float u_progress;
uniform vec2 u_meshScale;
uniform vec2 u_resolution;
uniform vec2 u_meshPosition;

void main() {

    vec3 newPos = position;

    vec2 scaleView = u_viewSize / u_meshScale - 1.0;
    vec2 scale = vec2(1.0 + scaleView * u_progress);

    newPos.xy *= scale;

    newPos.y += -u_meshPosition.y * u_progress;
	newPos.x += -u_meshPosition.x * u_progress;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);

}`;