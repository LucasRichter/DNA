import * as THREE from 'three';
import removeGhosting from 'remove-drag-ghosting';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { debounce } from '../utils';
import DnaHelix from './DnaHelix';
import particlesJSON from '../particles.json';
import YearSphere from './YearSphere';

const DEFAULT_DELTA_ROTATION = 0.25;
const DEFAULT_MAX_DELTA_ROTATION = 2;

const root = new THREE.Group();
let deltaRotation = 0.4;
let mouseDown = false;
let rotateToUp = false;

function createWheelStopListener(element, callback, timeout) {
  let handle = null;
  const onScroll = function () {
    if (handle) {
      clearTimeout(handle);
    }
    handle = setTimeout(callback, timeout || 200); // default 200 ms
  };
  element.addEventListener('wheel', onScroll);
  return function () {
    element.removeEventListener('wheel', onScroll);
  };
}

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
  const spheres = [];
  // ==========
  // Define functions
  //

  const render = () => {
    const time = clock.getDelta();
    root.rotation.x += time * deltaRotation * (rotateToUp ? 1 : -1);
    root.children.filter((v) => v.name === 'YearSphere').forEach((s) => s.play(time));

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
    window.addEventListener('wheel', (evt) => {
      rotateToUp = evt.deltaY >= 0;
      deltaRotation = DEFAULT_MAX_DELTA_ROTATION;
    });

    createWheelStopListener(window, () => {
      deltaRotation = DEFAULT_DELTA_ROTATION;
    });

    window.addEventListener('mousedown', (evt) => {
      evt.preventDefault();
      removeGhosting(evt);
      mouseDown = true;
      canvas.style.cursor = 'grab';
    }, false);

    window.addEventListener('mousemove', (evt) => {
      if (!mouseDown) { return; } // is the button pressed?
      evt.preventDefault();
      removeGhosting(evt);
      deltaRotation = DEFAULT_MAX_DELTA_ROTATION;
      rotateToUp = evt.clientY - window.innerHeight / 2 <= 0;
    }, false);

    window.addEventListener('mouseup', (evt) => {
      evt.preventDefault();
      mouseDown = false;
      deltaRotation = DEFAULT_DELTA_ROTATION;
    }, false);

    window.addEventListener('resize', debounce(resizeWindow, 1000));
  };

  // ==========
  // Initialize
  //
  renderer.setClearColor(0x000000, 0); // the default

  camera.aspect = 3 / 2;
  camera.far = 300;
  camera.position.set(20, -75, -25);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  const linksElement = document.querySelectorAll('li');
  const size = new THREE.Vector3();
  const boundingBox = new THREE.Box3();

  boundingBox.setFromObject(dnaHelix);
  boundingBox.getSize(size);
  root.layers.enableAll();

  const parsedPosition = [];
  dnaHelix.linkPositions.forEach((v) => {
    parsedPosition.push(v.x);
    parsedPosition.push(v.y);
    parsedPosition.push(v.z);
  });

  linksElement.forEach((el, i) => {
    // Add tasks to do
    const sphere = new YearSphere(parsedPosition, (e) => {
      clock.stop();
      el.classList.remove('opacity-0', 'pointer-events-none');
      dnaHelix.changeHelixColors(e.defaultColor);
    });

    el.addEventListener('mouseleave', () => {
      if (sphere.action.isRunning()) return;
      clock.start();
      el.classList.add('opacity-0', 'pointer-events-none');
      sphere.action.reset();
      dnaHelix.changeHelixColors(new THREE.Color('black'));
    });

    const linkLabel = new CSS2DObject(el);
    linkLabel.layers.set(0);

    sphere.add(linkLabel);
    root.add(sphere);

    spheres.push(sphere);

    sphere.action.startAt(i);
    sphere.action.play();
  });

  on();
  resizeWindow();
  renderLoop();
}

window.onload = init;

// eslint-disable-next-line no-undef
particlesJS('particles-js', particlesJSON);
