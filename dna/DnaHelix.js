import * as THREE from 'three';
import MathEx from '../utils/MathEx.js';

export default class DnaHelix extends THREE.Points {
  constructor(numLinks) {
    // Define Geometry
    const geometry = new THREE.BufferGeometry();

    // Define attributes of the instancing geometry
    const numHelix = 6000;
    const numLineSpace = 50;
    const numLine = 80;
    const numAmount = numHelix + numLineSpace * numLine;
    const baPositions = new THREE.BufferAttribute(new Float32Array(numAmount * 3), 3);
    const baRadians = new THREE.BufferAttribute(new Float32Array(numAmount), 1);
    const baRadiuses = new THREE.BufferAttribute(new Float32Array(numAmount), 1);
    const baDelays = new THREE.BufferAttribute(new Float32Array(numAmount), 1);

    const linkPoints = []

    for (var i = 0; i < numHelix; i++) {
      const random = Math.random();
      const diff = {
        x: (Math.random() * 2 - 1) * random * 6,
        y: (Math.random() * 2 - 1) * random * 6,
        z: (Math.random() * 2 - 1) * random * 6,
      };
      baPositions.setXYZ(
        i,
        ((i / numHelix) * 2 - 1) * 150 + diff.x,
        diff.y,
        diff.z
      );
      baRadians.setX(i, MathEx.radians(i / numHelix * 900 + i % 2 * 180));
      baRadiuses.setX(i, 18);
      baDelays.setX(i, MathEx.radians(Math.random() * 360));
    }
    const positionToAdd = numHelix / numLinks;

    for (var i = 0; i < numLinks; i++) {
      const index = i * positionToAdd;
      linkPoints.push(index);
    }

    for (var j = 0; j < numLineSpace; j++) {
      const radians = MathEx.radians(j / numLineSpace * 900);
      for (var k = 0; k < numLine; k++) {
        const index = j * numLine + k + numHelix;
        const random = Math.random();
        const diff = {
          x: (Math.random() * 2 - 1) * random * 1,
          y: (Math.random() * 2 - 1) * random * 1,
          z: (Math.random() * 2 - 1) * random * 1,
        };
        baPositions.setXYZ(
          index,
          ((j / numLineSpace) * 2 - 1) * 150 + diff.x,
          diff.y,
          diff.z
        );
        baRadians.setX(index, radians);
        baRadiuses.setX(index, (k / numLine * 2 - 1) * 18);
        baDelays.setX(index, MathEx.radians(Math.random() * 360));
      }
    }
    geometry.setAttribute('position', baPositions);
    geometry.setAttribute('radian', baRadians);
    geometry.setAttribute('radius', baRadiuses);
    geometry.setAttribute('delay', baDelays);

    // Define Material
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        time: {
          type: 'f',
          value: 0
        },
        uColor: {value: new THREE.Color('#808080')},
      },
      vertexShader: `
        attribute vec3 position;
        attribute float radian;
        attribute float radius;
        attribute float delay;

        uniform mat4 projectionMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 modelMatrix;
        uniform float time;

        varying   vec2 pointPos;
        varying vec3 vColor;
       uniform   vec2 uResolution; // = (window-width, window-height)

        void main() {
          // coordinate transformation
          vec3 updatePosition = position
            + vec3(
              sin(time * 4.0 + delay),
              sin(radian + time * 0.4) * (radius + sin(time * 4.0 + delay)),
              cos(radian + time * 0.4) * (radius + sin(time * 4.0 + delay))
              );
          vec4 mvPosition = viewMatrix * modelMatrix * vec4(updatePosition, 1.0);
          float distanceFromCamera = length(mvPosition.xyz);
          float pointSize = 5.0;
          gl_Position  = projectionMatrix * viewMatrix * mvPosition;
          gl_PointSize = 5.0;

          vec2 ndcPos = gl_Position.xy / gl_Position.w;
          pointPos    = uResolution * (ndcPos*0.5 + 0.5);
      }
      `,
      fragmentShader: `
      precision highp float;

varying vec3 vColor;
uniform vec3 uColor;

void main() {
  // Convert PointCoord to the other vec2 has a range from -1.0 to 1.0.
  vec2 p = gl_PointCoord * 2.0 - 1.0;

  // Draw circle
  float radius = length(p);
  float opacity1 = (1.0 - smoothstep(0.5, 0.7, radius));
  float opacity2 = smoothstep(0.8, 1.0, radius) * (1.0 - smoothstep(1.0, 1.2, radius));


  gl_FragColor = vec4(uColor, 1.0);
  
}

      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // Create Object3D
    super(geometry, material);
    this.name = 'DNA Herix';
    this.linkPoints = linkPoints;
    this.numLinks = numLinks;
  }

  render(time) {
    this.material.uniforms.time.value += time * 0.2;
  }
}
