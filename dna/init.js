import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { debounce } from '../utils';
import DnaHelix from './DnaHelix';

let root;
let deltaRotation = 0.6;

function init() {
  // ==========
  // Define common variables
  //
  const resolution = new THREE.Vector2();
  const canvas = document.getElementById('canvas-webgl');
  const renderer = new THREE.WebGL1Renderer({
    alpha: true,
    antialias: true,
    canvas,
  });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  const clock = new THREE.Clock({
    autoStart: false,
  });

  root = new THREE.Group();
  scene.add(root);

  // For the post effect.
  const renderTarget = new THREE.WebGLRenderTarget();

  // ==========
  // Define unique variables
  //
  const dnaHelix = new DnaHelix(8);
  root.add(dnaHelix);

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  document.body.appendChild(labelRenderer.domElement);

  // ==========
  // Define functions
  //
  const render = () => {
    const time = clock.getDelta();
    root.rotation.x += time * deltaRotation;

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  };

  const renderLoop = () => {
    render();
    requestAnimationFrame(renderLoop);
  };

  const resizeCamera = () => {
    camera.setFocalLength(20);
    camera.setViewOffset(
      1200,
      800,
      (resolution.x - 1200) / -2,
      (resolution.y - 800) / -2,
      resolution.x,
      resolution.y,
    );
    camera.updateProjectionMatrix();
  };

  const resizeWindow = () => {
    resolution.set(document.body.clientWidth, window.innerHeight);
    canvas.width = resolution.x;
    canvas.height = resolution.y;
    resizeCamera();
    renderer.setSize(resolution.x, resolution.y);
    renderTarget.setSize(resolution.x, resolution.y);
  };

  const on = () => {
    window.addEventListener('wheel', () => {
      const time = clock.getDelta() * deltaRotation * 20;
      root.rotation.x += time;
    });

    window.addEventListener('drag', () => {
      const time = clock.getDelta() * deltaRotation * 20;
      root.rotation.x += time;
    });

    window.addEventListener('blur', () => {
      // this window is inactive.
      clock.stop();
    });
    window.addEventListener('focus', () => {
      // this window is inactive.
      clock.start();
    });
    window.addEventListener('resize', debounce(resizeWindow, 1000));
  };

  // ==========
  // Initialize
  //
  renderer.setClearColor(0x000000, 0); // the default

  camera.aspect = 3 / 2;
  camera.far = 300;
  camera.position.set(0, -75, 0);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  const linksElement = document.querySelectorAll('li');
  const size = new THREE.Vector3();
  const boundingBox = new THREE.Box3();
  boundingBox.setFromObject(dnaHelix);
  boundingBox.getSize(size);
  root.layers.enableAll();

  dnaHelix.linkPoints.forEach((val, index) => {
    const { geometry } = dnaHelix;
    const positionAttribute = geometry.getAttribute('position');
    const vertex = new THREE.Vector3();
    vertex.fromBufferAttribute(positionAttribute, val);
    const link = linksElement[index];

    link.addEventListener('mouseenter', () => {
      deltaRotation = 0.4;
      dnaHelix.changeHelixColors(new THREE.Color('purple'), +link.attributes.key.value);
    });

    link.addEventListener('mouseleave', () => {
      deltaRotation = 0.6;
      dnaHelix.changeHelixColors(new THREE.Color('black'), +link.attributes.key.value);
    });

    const linkLabel = new CSS2DObject(link);
    linkLabel.layers.set(1);

    const sphereG = new THREE.SphereGeometry(1.5, 32, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0x494949,
    });
    const sphere = new THREE.Mesh(sphereG, material);

    sphere.layers.enableAll();
    dnaHelix.add(sphere);
    sphere.position.set(
      -45 + (index * 15),
      size.y * (index % 2 === 0 ? -1 : 1),
      size.z * (index % 2 === 0 ? -1 : 1),
    );
    linkLabel.position.copy(sphere.position);
    root.add(linkLabel);
  });

  on();
  resizeWindow();
  renderLoop();
}
window.onload = init;
