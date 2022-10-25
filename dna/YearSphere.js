import * as THREE from 'three';

export default class YearSphere extends THREE.Mesh {
  constructor(color, delay, radian, radius) {
    const sphereG = new THREE.SphereGeometry(1, 32, 16);
    const material = new THREE.MeshBasicMaterial({
      color,
    });

    super(sphereG, material);

    this.delay = delay;
    this.radian = radian;
    this.radius = radius;
  }

  render(time) {
    this.position.add(
      new THREE.Vector3(
        Math.sin(time * 4.0 + this.delay),
        Math.sin(this.radian + time * 0.5) * (this.radius + Math.sin(time * 5.0 + this.delay)),
        Math.cos(this.radian + time * 0.5) * (this.radius + Math.sin(time * 5.0 + this.delay)),
      ),
    );
  }
}
