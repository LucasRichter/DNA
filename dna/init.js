import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { debounce } from '../utils';
import DnaHelix from './DnaHelix';

let root;
let deltaRotation = 5;

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
    root.rotation.x += time * 0.3;

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  };

  const renderLoop = () => {
    render();
    requestAnimationFrame(renderLoop);
  };

  const resizeCamera = () => {
    camera.setFocalLength(50);
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
      const time = clock.getDelta() * deltaRotation;
      root.rotation.x += time;
    });

    document.addEventListener('drag', () => {
      const time = clock.getDelta() * 0.7;
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
  camera.far = 500;
  camera.position.set(0, -75, 45);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  const linksElement = document.querySelectorAll('li');
  dnaHelix.initLinkPoints(linksElement);
  root.layers.enableAll();

  dnaHelix.linkPoints.forEach((val, index) => {
    const { geometry } = dnaHelix;
    const positionAttribute = geometry.getAttribute('position');
    const vertex = new THREE.Vector3();
    vertex.fromBufferAttribute(positionAttribute, val);

    const link = linksElement[index];

    link.addEventListener('mouseenter', () => {
      deltaRotation = 1;
      dnaHelix.changeHelixColors(new THREE.Color('purple'), +link.attributes.key.value);
    });

    link.addEventListener('mouseleave', () => {
      dnaHelix.changeHelixColors(new THREE.Color('black'), +link.attributes.key.value);
    });

    const linkLabel = new CSS2DObject(link);
    linkLabel.layers.set(1);

    const sphereG = new THREE.SphereGeometry(1, 32, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0x000 });
    const sphere = new THREE.Mesh(sphereG, material);

    sphere.position.set(index + -10, index % 2 === 0 ? 5 : -5, 10);
    sphere.layers.enableAll();

    linkLabel.position.copy(sphere.position);
    dnaHelix.add(sphere);
    root.add(linkLabel);
  });

  on();
  resizeWindow();
  renderLoop();
}
window.onload = init;
