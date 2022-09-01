import * as THREE from 'three';

export default class LinkPoint extends THREE.Points {
  constructor(index, g) {
    const baPositions = new THREE.BufferAttribute(new Float32Array(3), 3);
    const baRadians = new THREE.BufferAttribute(new Float32Array(), 1);
    const baRadiuses = new THREE.BufferAttribute(new Float32Array(), 1);
    const baDelays = new THREE.BufferAttribute(new Float32Array(), 1);
  
    baPositions.setXYZ(0, g.getAttribute("position").getX(index), g.getAttribute("position").getY(index), g.getAttribute("position").getZ(index))
    baRadians.setX(0, g.getAttribute("radian").getX(index))
    baRadiuses.setY(0, g.getAttribute("radius").getX(index) )
    baDelays.setY(0, g.getAttribute("delay").getX(index))

    // Define Geometry
    const geometry = new THREE.BufferGeometry();
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
        uColor: {value: new THREE.Color('red')},
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

        varying vec3 vColor;

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
          float pointSize = 1400.0 / distanceFromCamera * 1.6;


          vColor = vec3(0.8 - delay * 0.1, 0.6, 0.6);

          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = pointSize;
        }
      `,
      fragmentShader: `
        precision highp float;

        uniform vec3 uColor;

        void main() {
          // Convert PointCoord to the other vec2 has a range from -1.0 to 1.0.
          vec2 p = gl_PointCoord * 2.0 - 1.0;

          // Draw circle
          float radius = length(p);
          float opacity1 = (1.0 - smoothstep(0.1, 0.7, radius));
          float opacity2 = smoothstep(0.1, 1.0, radius) * (1.0 - smoothstep(0.1, 1.2, radius));

          gl_FragColor = vec4(uColor, (opacity1 + opacity2) * 0.9);
        } 
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // Create Object3D
    super(geometry, material);
    this.name = 'PointLink' + index;
  }

  render(time) {
    this.material.uniforms.time.value += time * 0.0;
  }
}
