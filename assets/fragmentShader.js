export let GlobalUniforms = {
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2() },
    u_mouse: { value: new THREE.Vector2() }
}

export const fragmentShader = `
void main() {
    gl_FragColor = vec4(1, 0, 1, 1);
}`;

export const FragmentShaders = [
`
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

#define _H 0.5

mat2 rot2D(float angle) {

    float c = cos(angle);
    float s = sin(angle);

    return mat2(
        c, -s,
        s, c
    );

}

vec3 rotate(vec3 p, vec3 a) {

	p.yz *= rot2D(a.x);
	p.xz *= rot2D(-a.y);
	p.xy *= rot2D(a.z);

	return p;

}

vec2 boxIntersection( in vec3 ro, in vec3 rd, vec3 boxSize, out vec3 outNormal ) {
    vec3 m = 1.0/rd; // can precompute if traversing a set of aligned boxes
    vec3 n = m*ro;   // can precompute if traversing a set of aligned boxes
    vec3 k = abs(m)*boxSize;
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;
    float tN = max( max( t1.x, t1.y ), t1.z );
    float tF = min( min( t2.x, t2.y ), t2.z );
    if( tN>tF || tF<0.0) return vec2(-1.0); // no intersection
    outNormal = (tN>0.0) ? step(vec3(tN),t1) : // ro ouside the box
                           step(t2,vec3(tF));  // ro inside the box
    outNormal *= -sign(rd);
    return vec2( tN, tF );
}

float noise(vec2 st) {

    return fract(sin( dot( st.xy, vec2(12.9898,78.233) ) ) * 43758.5453123);

}

float smoothNoise(vec2 st) {

    vec2 ipos = floor(st);
    vec2 fpos = fract(st);

    fpos = fpos*fpos * (3.0 - 2.0 * fpos);

    float bl = noise(ipos);
    float br = noise(ipos + vec2(1, 0));
    float b  = mix(bl, br, fpos.x);
    
    float tl = noise(ipos + vec2(0, 1));
    float tr = noise(ipos + vec2(1));
    float t  = mix(tl, tr, fpos.x);

    return mix(b, t, fpos.y);

}

void main() {

	vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
	uv.x *= u_resolution.x / u_resolution.y;

	vec2 mou = 2.0*(u_mouse / u_resolution) - 1.0;
	mou.x *= u_resolution.x / u_resolution.y * -1.0;

	vec3 col = mix(
		vec3(0.9373, 0.7765, 0.9843),
		vec3(0.9765, 0.7686, 0.8784),
		uv.y * 0.5 + 0.5
	);

	uv *=  3.0;
	mou *= 3.0;

	vec2 fuv = fract(uv) - 0.5;
	vec2 iuv = floor(uv) - 0.5;
	vec2 imo = floor(-mou) - 0.5;

	vec3 ro = vec3(0, 0, -1.5);
	vec3 rd = normalize(vec3(fuv, 1.0));

	if (iuv == imo) {

		ro = rotate(ro, vec3(sin(3.0*u_time)));
		rd = rotate(rd, vec3(sin(3.0*u_time)));

	}

	float r = 0.2 + 0.1*smoothNoise(uv*4.0 + vec2(u_time));

	vec3 n;
	vec2 box = boxIntersection(ro, rd, vec3(r), n);

	if (box.x > 0.0) {

		vec3 sun = vec3(50.0, 100, -50.0);
		vec3 pos = ro + rd*box.x;

		vec3 lightDir = normalize(sun - pos);

		float diff = max( dot(lightDir, n), 0.0 );

			//rim = pow(rim, 1.5);

		vec3 col1 = vec3(0.0, 0.0, 0.0),
		col2 = vec3(0.9529, 0.7412, 0.3216),
		col3 = vec3(0.9608, 0.5059, 0.8549);

		float dir = (1.0 + diff) * 0.5;

        vec3 colBase = mix(
            mix(col1, col2, dir/_H),
            mix(col2, col3, (dir - _H)/(1.0 - _H)),
            step(_H, dir)
        );

		vec3 finalCol = clamp(
			colBase,
			0.0, 1.0
		);

		col = finalCol;

	}

	gl_FragColor = vec4(col * sqrt(col), 1);

}`,
`
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float noise(vec2 st) {

    return fract(sin( dot( st.xy, vec2(12.9898,78.233) ) ) * 43758.5453123);

}

float smoothNoise(vec2 st) {

    vec2 ipos = floor(st);
    vec2 fpos = fract(st);

    fpos = fpos*fpos * (3.0 - 2.0 * fpos);

    float bl = noise(ipos);
    float br = noise(ipos + vec2(1, 0));
    float b  = mix(bl, br, fpos.x);
    
    float tl = noise(ipos + vec2(0, 1));
    float tr = noise(ipos + vec2(1));
    float t  = mix(tl, tr, fpos.x);

    return mix(b, t, fpos.y);

}

vec2 cylIntersect( in vec3 ro, in vec3 rd, in vec3 cb, in vec3 ca, float cr ) {

    vec3  oc = ro - cb;
    float card = dot(ca,rd);
    float caoc = dot(ca,oc);
    float a = 1.0 - card*card;
    float b = dot( oc, rd) - caoc*card;
    float c = dot( oc, oc) - caoc*caoc - cr*cr;
    float h = b*b - a*c;
    if( h<0.0 ) return vec2(-1.0); //no intersection
    h = sqrt(h);

    return vec2(-b-h,-b+h)/a;

}

vec3 shade(vec3 ro, vec3 rd, vec3 n, float d) {

	vec3 sun = vec3(0.0, 100.0, 0.0);
	vec3 pos = ro + rd*d;

	vec3 lightDir = normalize(sun - pos);
	vec3 viewDir = normalize(ro - pos);
	vec3 reflLight = reflect(-lightDir, n);

	float N = dot(lightDir, n);
	float diff = max( N, 0.0 );
	float spec = pow( max(dot(reflLight, viewDir), 0.0), 128.0 );
	float rim  = 1.0 - dot(viewDir, n);

	float diffInv = max( dot(-lightDir, n) ,0.0);
	//rim = pow(rim, 1.0);

	//vec3 ambient = vec3(0.702, 0.4667, 0.0902);
	vec3 ambient = mix(
		vec3(0.9843, 0.4, 0.0118),
		vec3(0.5843, 0.5569, 0.0039),
		N * 0.5 + 0.5
	);

	rim *= diffInv;

	vec3 rimLight = vec3(0.6196, 0.4863, 0.0)*rim;

	vec3 finalCol = clamp(
		ambient +
		vec3(0.6627, 0.4118, 0.2353) * diff +
		spec +
		rimLight ,
		0.0, 1.0
	);

	return finalCol;

}

void main() {

	vec2 uv = gl_FragCoord.xy / u_resolution - 0.5;
	//uv.x -= 1.0;
	uv.x *= u_resolution.x / u_resolution.y;

	//vec3 col = mix(
	//	vec3(0.7137, 0.9765, 0.6196),
	//	vec3(0.9725, 0.6275, 0.3804),
	//	-uv.y * 0.5 + 0.5
	//);

    vec3 col = vec3(0.9569, 0.7961, 0.4784);

    uv.y += 0.1;

	vec3 ro = vec3(0, 0, -3);
	vec3 rd = normalize(vec3(uv, 1.0));

	float noi = smoothNoise(uv*7.0 + 0.25*u_time);
	float r = 0.25 + 2.0*noi;

	vec2 cyl = cylIntersect(ro, rd, vec3(0), vec3(1, 0, 0), r);

	if (cyl.x > 0.0) {

		//vec3 posC = ro + rd*cyl.x;
		//vec3 posS = ro + rd*sph.x;

		vec3 pos = ro + rd*cyl.x;

		vec3 n = normalize(vec3(0, pos.yz));

		//vec3 n = min(nC, -nS);
		col = shade(ro, rd, n, cyl.x);
		//col = vec3(1, 0, 0);

	}

	gl_FragColor = vec4(col * sqrt(col), 1);

}`,
`
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

varying vec2 vUv;
varying vec2 v_sizePlane;

vec2 boxIntersection( in vec3 ro, in vec3 rd, vec3 boxSize, out vec3 outNormal ) {
    vec3 m = 1.0/rd; // can precompute if traversing a set of aligned boxes
    vec3 n = m*ro;   // can precompute if traversing a set of aligned boxes
    vec3 k = abs(m)*boxSize;
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;
    float tN = max( max( t1.x, t1.y ), t1.z );
    float tF = min( min( t2.x, t2.y ), t2.z );
    if( tN>tF || tF<0.0) return vec2(-1.0); // no intersection
    outNormal = (tN>0.0) ? step(vec3(tN),t1) : // ro ouside the box
                           step(t2,vec3(tF));  // ro inside the box
    outNormal *= -sign(rd);
    return vec2( tN, tF );
}

float noise(vec2 st) {

    return fract(sin( dot( st.xy, vec2(12.9898,78.233) ) ) * 43758.5453123);

}

float smoothNoise(vec2 st) {

    vec2 ipos = floor(st);
    vec2 fpos = fract(st);

    fpos = fpos*fpos * (3.0 - 2.0 * fpos);

    float bl = noise(ipos);
    float br = noise(ipos + vec2(1, 0));
    float b  = mix(bl, br, fpos.x);
    
    float tl = noise(ipos + vec2(0, 1));
    float tr = noise(ipos + vec2(1));
    float t  = mix(tl, tr, fpos.x);

    return mix(b, t, fpos.y);

}

vec2 sphIntersect( in vec3 ro, in vec3 rd, in vec3 ce, float ra )
{
    vec3 oc = ro - ce;
    float b = dot( oc, rd );
    float c = dot( oc, oc ) - ra*ra;
    float h = b*b - c;
    if( h<0.0 ) return vec2(-1.0); // no intersection
    h = sqrt( h );
    return vec2( -b-h, -b+h );
}

vec3 shade(vec3 ro, vec3 rd, vec3 n, float d) {

	vec3 sun = vec3(-50.0, 200, -50.0);
	vec3 pos = ro + rd*d;

	vec3 lightDir = normalize(sun - pos);
	vec3 viewDir = normalize(ro - pos);
	vec3 reflLight = reflect(-lightDir, n);

	float diff = max( dot(lightDir, n), 0.0 );
	float spec = pow( max(dot(reflLight, viewDir), 0.0), 64.0 );
	float rim  = 1.0 - dot(viewDir, n);

	//rim = pow(rim, 1.5);

	vec3 ambient = vec3(0.1451, 0.5569, 0.1255);
	vec3 rimLight = vec3(0.9529, 0.4667, 0.8)*rim;

	vec3 finalCol = clamp(
		ambient +
		vec3(0.6, 0.3686, 0.0) * diff +
		spec +
		rimLight,
		0.0, 1.0
	);

	return finalCol;

}

void main() {

	vec2 uv = gl_FragCoord.xy / u_resolution;
	//uv.x -= 1.0;
	uv.x *= u_resolution.x / u_resolution.y;

    //vec2 uv = vUv;
    //uv.x *= v_sizePlane.x / v_sizePlane.y;

	vec2 mou = u_mouse / u_resolution;
	mou.x *= u_resolution.x / u_resolution.y;

	vec3 col = mix(
		vec3(0.9294, 0.9843, 0.7765),
		vec3(0.8784, 0.9765, 0.7686),
		uv.y * 0.5 + 0.5
	);

	uv.x += 0.5 + u_time * 0.05;

	vec2 fpos = fract(uv) - 0.5;

	vec3 ro = vec3(fpos, -2.0);
	vec3 rd = vec3(0, 0, 1);

	float r = 0.2 + 0.1*smoothNoise(uv + vec2(u_time));

	vec2 sph = sphIntersect(ro, rd, vec3(0.0), r);

	if (sph.x > 0.0) {

		vec3 n = normalize(ro + rd * sph.x);
		col = shade(ro, rd, n, sph.x);

	}

	gl_FragColor = vec4(col * sqrt(col), 1);

}`,
`
//varying vec2 vUv;
//varying vec2 v_sizePlane;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec2 sphIntersect( in vec3 ro, in vec3 rd, in vec3 ce, float ra )
{
    vec3 oc = ro - ce;
    float b = dot( oc, rd );
    float c = dot( oc, oc ) - ra*ra;
    float h = b*b - c;
    if( h<0.0 ) return vec2(-1.0); // no intersection
    h = sqrt( h );
    return vec2( -b-h, -b+h );
}

float noise(vec2 st) {

    return fract(sin( dot( st.xy, vec2(12.9898,78.233) ) ) * 43758.5453123);

}

float smoothNoise(vec2 st) {

    vec2 ipos = floor(st);
    vec2 fpos = fract(st);

    fpos = fpos*fpos * (3.0 - 2.0 * fpos);

    float bl = noise(ipos);
    float br = noise(ipos + vec2(1, 0));
    float b  = mix(bl, br, fpos.x);
    
    float tl = noise(ipos + vec2(0, 1));
    float tr = noise(ipos + vec2(1));
    float t  = mix(tl, tr, fpos.x);

    return mix(b, t, fpos.y);

}

void main() {

	vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
    //vec2 uv = vUv;

    uv.x *= u_resolution.x / u_resolution.y;

    vec2 mou = 2.0*(u_mouse / u_resolution) - 1.0;
	mou.x *= u_resolution.x / u_resolution.y * -1.0;

	//vec3 col = vec3(1);

    vec3 col = mix(
		vec3(0.902, 0.7961, 0.9725),
		vec3(0.8667, 0.8627, 0.9647),
		uv.y * 0.5 + 0.5
	);

	uv *= 2.0;
	vec2 fuv = fract(uv + mou) - 0.5;

	vec3 ro = vec3(0, 0, -2);
	vec3 rd = normalize(vec3(fuv, 1.0));

	float r = 0.25 + 0.5*smoothNoise(uv*4.0 + vec2(u_time));

	vec2 sph = sphIntersect(ro, rd, vec3(0), r);

	if (sph.x > 0.0) {

		vec3 sun = vec3(50.0, 100, -50.0);
		vec3 pos = ro + rd*sph.x;

		vec3 n = normalize(pos);

		vec3 lightDir = normalize(sun - pos);
		vec3 viewDir = normalize(ro - pos);
		vec3 reflLight = reflect(-lightDir, n);

		float diff = max( dot(lightDir, n), 0.0 );
		float spec = pow( max(dot(reflLight, viewDir), 0.0), 64.0 );
		float rim  = 1.0 - dot(viewDir, n);

			//rim = pow(rim, 1.5);

		vec3 ambient = vec3(0.5569, 0.1255, 0.4118);
		vec3 rimLight = vec3(0.5)*rim;

		vec3 finalCol = clamp(
			ambient +
			vec3(0.0, 0.5, 1.0) * diff +
			spec +
			rimLight,
			0.0, 1.0
		);

		col = finalCol;

	}

	gl_FragColor = vec4(col, 1);

}`];