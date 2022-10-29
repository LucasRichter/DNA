import * as THREE from 'three';

export default class YearSphere extends THREE.Mesh {
  constructor(positions, onFinish) {
    const sphereG = new THREE.SphereGeometry(1, 32, 16);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x00a0d5),
    });

    super(sphereG, material);
    this.defaultColor = new THREE.Color(0x00a0d5);
    this.name = 'YearSphere';

    const times = [0, 1, 2, 3, 4, 5, 6, 7];
    const positionKF = new THREE.VectorKeyframeTrack('.position', times, positions, THREE.InterpolateLinear);
    const opacityKF = new THREE.NumberKeyframeTrack('.material.opacity', [0, 1, 2], [1, 1, 1]);
    const clip = new THREE.AnimationClip('move', -1, [
      positionKF,
      opacityKF,
    ]);

    this.mixer = new THREE.AnimationMixer(this);
    this.mixer.addEventListener('finished', () => {
      onFinish(this);
    });

    this.material.opacity = 0;
    this.action = this.mixer.clipAction(clip);
    this.action.setLoop(THREE.LoopOnce);
    this.action.clampWhenFinished = true;
  }

  play(time) {
    this.mixer.update(time);
  }
}
