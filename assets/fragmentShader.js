export let GlobalUniforms = {
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2() },
    u_mouse: { value: new THREE.Vector2() }
}

export const FragmentShaders = [
`
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define ASPECT u_resolution.x / u_resolution.y

#define SIZE 0.175
#define RADIUS 0.05

#define D2R 0.01745329

mat2 rot2D(float angle) {

	float s = sin(angle), c = cos(angle);
	return mat2(c, -s, s, c);

}

float noise(vec2 p) {
    return fract(sin(p.x * 10.0 + p.y * 1234.5) * 5647.0);
}

float smoothNoise(vec2 n) {

    const vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n);
    vec2 f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(noise(b), noise(b + d.yx), f.x), mix(noise(b + d.xy), noise(b + d.yy), f.x), f.y);

}

float roundedboxIntersect( in vec3 ro, in vec3 rd, in vec3 size, in float rad )
{
    // bounding box
    vec3 m = 1.0/rd;
    vec3 n = m*ro;
    vec3 k = abs(m)*(size+rad);
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;
    float tN = max( max( t1.x, t1.y ), t1.z );
    float tF = min( min( t2.x, t2.y ), t2.z );
    if( tN>tF || tF<0.0) return -1.0;
    float t = tN;

    // convert to first octant
    vec3 pos = ro+t*rd;
    vec3 s = sign(pos);
    ro  *= s;
    rd  *= s;
    pos *= s;
        
    // faces
    pos -= size;
    pos = max( pos.xyz, pos.yzx );
    if( min(min(pos.x,pos.y),pos.z) < 0.0 ) return t;

    // some precomputation
    vec3 oc = ro - size;
    vec3 dd = rd*rd;
    vec3 oo = oc*oc;
    vec3 od = oc*rd;
    float ra2 = rad*rad;

    t = 1e20;        

    // corner
    {
    float b = od.x + od.y + od.z;
    float c = oo.x + oo.y + oo.z - ra2;
    float h = b*b - c;
    if( h>0.0 ) t = -b-sqrt(h);
    }
    // edge X
    {
    float a = dd.y + dd.z;
    float b = od.y + od.z;
    float c = oo.y + oo.z - ra2;
    float h = b*b - a*c;
    if( h>0.0 )
    {
        h = (-b-sqrt(h))/a;
        if( h>0.0 && h<t && abs(ro.x+rd.x*h)<size.x ) t = h;
    }
    }
    // edge Y
    {
    float a = dd.z + dd.x;
    float b = od.z + od.x;
    float c = oo.z + oo.x - ra2;
    float h = b*b - a*c;
    if( h>0.0 )
    {
        h = (-b-sqrt(h))/a;
        if( h>0.0 && h<t && abs(ro.y+rd.y*h)<size.y ) t = h;
    }
    }
    // edge Z
    {
    float a = dd.x + dd.y;
    float b = od.x + od.y;
    float c = oo.x + oo.y - ra2;
    float h = b*b - a*c;
    if( h>0.0 )
    {
        h = (-b-sqrt(h))/a;
        if( h>0.0 && h<t && abs(ro.z+rd.z*h)<size.z ) t = h;
    }
    }

    if( t>1e19 ) t=-1.0;
    
    return t;
}

vec3 roundedboxNormal( in vec3 pos, in vec3 siz, in float rad )
{
    return sign(pos)*normalize(max(abs(pos)-siz,0.0));
}

vec3 sun = vec3(50, 100, -50);

vec3 hsv2rgb(vec3 c) {

    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);

}

vec3 shade(vec3 p, vec3 ro) {

	vec3 n = roundedboxNormal(p, vec3(SIZE), RADIUS);

	vec3 lightDir = normalize(sun - p);
	vec3 viewDir  = normalize(ro - p);
	vec3 reflLight = normalize(reflect(-lightDir, n));

	float diff = max(dot(n, lightDir), 0.0);
	float spec = pow(max(dot(reflLight, viewDir), 0.0), 64.0);
	float rim  = 1.0 - dot(viewDir, n);

	//vec3 ambient = vec3(0.5, 0.0, 0.25);
	//vec3 diffuse = vec3(1.0, 0.0, 0.5);

	//vec3 ambient = hsv2rgb(
	//	vec3(0.975)
	//);

	vec3 cc = hsv2rgb(vec3(0.45));
	vec3 cv = hsv2rgb(vec3(0.975));
	float kw = (dot(n, lightDir) + 1.0) * 0.5; 

	vec3 ambient = mix(cc, cv, kw);

	vec3 diffuse = vec3(0.75);
	vec3 rimLight = vec3(0.8);

	return clamp(
		ambient +
		diff * diffuse +
		(1.0 - diff) * rim  * rimLight +
		spec,
		0.0, 1.0
	);
}

#define SPEED u_time * 0.25

vec2 brickTile(vec2 _st, float _zoom) {

    _st *= _zoom;

    vec2 even = mod(_st, 2.0);
    vec2 move = sign(even - 1.0) * SPEED;

    _st.y += move.x * step(1.0,   mod(SPEED, 2.0));
    _st.x += move.y * step(-1.0, -mod(SPEED, 2.0));

    return fract(_st) - 0.5;

}

void main() {

	vec2 uv = gl_FragCoord.xy / u_resolution;
	uv.x *= ASPECT;

	vec3 col = vec3(0.9725, 0.8784, 0.9451);

	float noi = smoothNoise(uv*8.0 + u_time*0.25) * 0.1;

	uv *= rot2D(-10.0 * D2R);
	uv = brickTile(uv, 2.5);

	//uv.y += u_time*0.05*sign(mod(floor(uv.x), 2.0) - 0.5);

	//float sy = sign(mod(floor(uv.y), 2.0) - 0.5);
	float sy = sign(floor(uv.x) - 0.5);

	//uv = fract(uv) - 0.5;

	vec3 ro = vec3(uv, -2.0);
	vec3 rd = vec3(0, 0, 1);

	mat2 rTime = rot2D(u_time * sy * 0.5);
	mat2 r30   = rot2D(30.0 * D2R);

	ro.yz *= r30;
	rd.yz *= r30;

	ro.xz  *= rTime;
	rd.xz  *= rTime;
	sun.xz *= rTime;

	float t = roundedboxIntersect(ro, rd, vec3(SIZE), RADIUS + noi);

	if (t > 0.0) {

		vec3 p = ro + rd*t;
		col = shade(p, ro);

	}

	gl_FragColor = vec4(col, 1);

}`,
`
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float noise(vec2 p) {
    return fract(sin(p.x * 10.0 + p.y * 1234.5) * 5647.0);
}

float smoothNoise(vec2 n) {

    const vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n);
    vec2 f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(noise(b), noise(b + d.yx), f.x), mix(noise(b + d.xy), noise(b + d.yy), f.x), f.y);

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

float noise(vec2 p) {
    return fract(sin(p.x * 10.0 + p.y * 1234.5) * 5647.0);
}

float smoothNoise(vec2 n) {

    const vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n);
    vec2 f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(noise(b), noise(b + d.yx), f.x), mix(noise(b + d.xy), noise(b + d.yy), f.x), f.y);

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

float noise(vec2 p) {
    return fract(sin(p.x * 10.0 + p.y * 1234.5) * 5647.0);
}

float smoothNoise(vec2 n) {

    const vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n);
    vec2 f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(noise(b), noise(b + d.yx), f.x), mix(noise(b + d.xy), noise(b + d.yy), f.x), f.y);

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