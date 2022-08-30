import * as THREE from 'three';

export default class PostEffect {
  constructor(texture) {
    this.uniforms = {
      time: {
        type: 'f',
        value: 0,
      },
      texture: {
        type: 't',
        value: texture,
      },
      resolution: {
        type: 'v2',
        value: new THREE.Vector2(),
      },
    };
    this.obj;
  }
  createObj() {
    // Define Geometry
    const geometry = new THREE.PlaneGeometry(2, 2);

    // Define Material
    const material = new THREE.RawShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
      attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;

void main() {
  vUv = uv;

  gl_Position = vec4(position, 1.0);
}`,
      fragmentShader: `
        precision highp float;

uniform float time;
uniform sampler2D texture;
uniform vec2 resolution;

varying vec2 vUv;

float random2(vec2 c){
  return fract(sin(dot(c.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
float randomNoise(vec2 p) {
  return (random2(p - vec2(sin(time))) * 2.0 - 1.0) * 0.04;
}

void main() {
  // Convert uv to the other vec2 has a range from -1.0 to 1.0.
  vec2 p = vUv * 2.0 - 1.0;
  vec2 ratio = 1.0 / resolution;

  // Random Noise
  float rNoise = randomNoise(vUv);

  // RGB Shift
  float texColorR = texture2D(texture, vUv - vec2((2.0 * abs(p.x) + 1.0) * ratio.x, 0.0)).r;
  float texColorG = texture2D(texture, vUv + vec2((2.0 * abs(p.x) + 1.0) * ratio.x, 0.0)).g;
  float texColorB = texture2D(texture, vUv).b;

  // Sum total of colors.
  vec3 color = vec3(texColorR, texColorG, texColorB) + rNoise;

  gl_FragColor = vec4(vec3(texColorR, texColorG, texColorB) + rNoise, 1.0);
}
      `,
    });

    // Create Object3D
    this.obj = new THREE.Mesh(geometry, material);
    this.obj.name = 'PostEffect';
  }
  resize(x, y) {
    this.uniforms.resolution.value.set(x, y);
  }
  render(time) {
    this.uniforms.time.value += time;
  }
}