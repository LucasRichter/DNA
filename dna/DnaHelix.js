import * as THREE from 'three';
import MathEx from '../utils/MathEx';

export default class DnaHelix extends THREE.Points {
  constructor(numLinks) {
    // Define Geometry
    const geometry = new THREE.BufferGeometry();

    // Define attributes of the instancing geometry
    const numHelix = 6000;
    const numLineSpace = 50;
    const numLine = 200;
    const numAmount = numHelix + numLineSpace * numLine;
    const baPositions = new THREE.BufferAttribute(new Float32Array(numAmount * 3), 3);
    const baColors = new THREE.BufferAttribute(new Float32Array(numAmount * 3), 3);
    const baRadians = new THREE.BufferAttribute(new Float32Array(numAmount), 1);
    const baRadiuses = new THREE.BufferAttribute(new Float32Array(numAmount), 1);
    const baDelays = new THREE.BufferAttribute(new Float32Array(numAmount), 1);
    const currentColor = new THREE.Color('black');

    const linkPositions = [];

    for (var i = 0; i < numHelix; i++) {
      const random = Math.random();
      const diff = {
        x: (Math.random() * 2 - 1) * random * 8,
        y: (Math.random() * 2 - 1) * random * 8,
        z: (Math.random() * 2 - 1) * random * 8,
      };
      baPositions.setXYZ(
        i,
        ((i / numHelix) * 2 - 1) * 150 + diff.x,
        diff.y,
        diff.z,
      );
      baRadians.setX(i, MathEx.radians(i / numHelix * 900 + i % 2 * 190));
      baRadiuses.setX(i, 20);
      baDelays.setX(i, MathEx.radians(Math.random() * 360));
      baColors.setXYZ(i, currentColor.r, currentColor.g, currentColor.b);
    }

    for (let j = 0; j < numLineSpace; j++) {
      const radians = MathEx.radians(j / numLineSpace * 900);
      for (let k = 0; k < numLine; k++) {
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
          diff.z,
        );
        baRadians.setX(index, radians);
        baRadiuses.setX(index, (k / numLine * 2 - 1) * 25);
        baDelays.setX(index, MathEx.radians(Math.random() * 380));
        baColors.setXYZ(i, currentColor.r, currentColor.g, currentColor.b);
      }
    }

    geometry.setAttribute('position', baPositions);
    geometry.setAttribute('radian', baRadians);
    geometry.setAttribute('radius', baRadiuses);
    geometry.setAttribute('delay', baDelays);
    geometry.setAttribute('color', baColors);

    // Define Material
    const material = new THREE.RawShaderMaterial({
      vertexShader: `
        attribute vec3 position;
attribute float radian;
attribute float radius;
attribute float delay;
attribute vec3 color;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform float time;

varying vec3 vColor;

void main() {
  vColor = color;
  // coordinate transformation
  vec3 updatePosition = position
    + vec3(
      sin(time * 4.0 + delay),
      sin(radian + time * 0.5) * (radius + sin(time * 5.0 + delay)),
      cos(radian + time * 0.5) * (radius + sin(time * 5.0 + delay))
      );
  vec4 mvPosition = viewMatrix * modelMatrix * vec4(updatePosition, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  float distanceFromCamera = length(mvPosition.xyz);
  float pointSize = 600.0 / distanceFromCamera * 1.6;
  gl_PointSize = pointSize;
}

      `,
      fragmentShader: `
        precision highp float;
varying vec3 vColor;

        void main() {
          // Convert PointCoord to the other vec2 has a range from -1.0 to 1.0.
          vec2 p = gl_PointCoord * 2.0 - 1.0;

          // Draw circle
          float radius = length(p);
          float opacity1 = (1.0 - smoothstep(0.1, 0.7, radius));
          float opacity2 = smoothstep(0.1, 1.0, radius) * (1.0 - smoothstep(0.1, 1.2, radius));

          gl_FragColor = vec4(vColor, (opacity1 + opacity2) * 1.0);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    for (let i = 0; i < numLinks; i++) {
      const index = 2000 + (i * 200);
      const positionAttribute = geometry.getAttribute('position');
      const radianAttribute = geometry.getAttribute('radian');
      const radiusAttribute = geometry.getAttribute('radius');
      const delayAttribute = geometry.getAttribute('delay');

      const radian = radianAttribute.getX(index);
      const radius = radiusAttribute.getX(index);
      const delay = delayAttribute.getX(index);
      const vertex = new THREE.Vector3();
      vertex.fromBufferAttribute(positionAttribute, index);

      const updatePosition = vertex.add(
        new THREE.Vector3(
          Math.sin(delay),
          Math.sin(radian) * (radius + Math.sin(delay)),
          Math.cos(radian) * (radius + Math.sin(delay)),
        ),
      );
      const mvPosition = new THREE.Vector4(updatePosition.x, updatePosition.y, updatePosition.z, 1);
      linkPositions.push(mvPosition);
    }

    // Create Object3D
    super(geometry, material);
    this.name = 'DNA Herix';
    this.linkPositions = linkPositions;
    this.numLinks = numLinks;
    this.numHelix = numHelix;
  }

  changeHelixColors(color) {
    const attr = this.geometry.getAttribute('color');
    for (let i = 0; i < this.numHelix; i += 2) {
      attr.setXYZ(i, color.r, color.g, color.b);
    }

    this.geometry.attributes.color.needsUpdate = true;
  }

  changeHelixColor(color, index) {
    const attr = this.geometry.getAttribute('color');
    attr.setXYZ(index, color.r, color.g, color.b);
    this.geometry.attributes.color.needsUpdate = true;
  }
}
