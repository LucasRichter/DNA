import * as THREE from 'three';
import removeGhosting from 'remove-drag-ghosting';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { debounce } from '../utils';
import DnaHelix from './DnaHelix';
import particlesJSON from '../particles.json';

const DEFAULT_DELTA_ROTATION = 0.25;
const DEFAULT_MAX_DELTA_ROTATION = 2;

let root;
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
    root.rotation.x += time * deltaRotation * (rotateToUp ? 1 : -1);

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
  camera.position.set(20, -75, -25);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  const linksElement = document.querySelectorAll('li');
  const size = new THREE.Vector3();
  const boundingBox = new THREE.Box3();
  boundingBox.setFromObject(dnaHelix);
  boundingBox.getSize(size);
  root.layers.enableAll();

  const colors = [0x00a0d5, 0x00a0d5, 0x00a0d5, 0x00a0d5, 0x00a0d5, 0x00a0d5, 0x00a0d5, 0x00a0d5];

  dnaHelix.linkPoints.forEach((val, index) => {
    const { geometry } = dnaHelix;
    const positionAttribute = geometry.getAttribute('position');

    const radianAttribute = geometry.getAttribute('radian');
    const radian = radianAttribute.getX(val);

    const radiusAttribute = geometry.getAttribute('radius');
    const radius = radiusAttribute.getX(val);

    const delayAttribute = geometry.getAttribute('delay');
    const delay = delayAttribute.getX(val);

    const vertex = new THREE.Vector3();
    vertex.fromBufferAttribute(positionAttribute, val);

    const link = linksElement[index];
    link.addEventListener('mouseenter', () => {
      deltaRotation = 0;
      dnaHelix.changeHelixColors(new THREE.Color(colors[index]), +link.attributes.key.value);
    });

    link.addEventListener('mouseleave', () => {
      deltaRotation = DEFAULT_DELTA_ROTATION;
      dnaHelix.changeHelixColors(new THREE.Color('black'), +link.attributes.key.value);
    });

    const linkLabel = new CSS2DObject(link);
    linkLabel.layers.set(1);

    const sphereG = new THREE.SphereGeometry(1, 32, 16);
    const material = new THREE.MeshBasicMaterial({
      color: colors[index],
    });
    const sphere = new THREE.Mesh(sphereG, material);

    sphere.layers.enableAll();
    root.add(sphere);

    const updatePosition = vertex.add(
      new THREE.Vector3(
        Math.sin(delay),
        Math.sin(radian) * (radius + Math.sin(delay)),
        Math.cos(radian) * (radius + Math.sin(delay)),
      ),
    );
    const mvPosition = new THREE.Vector4(updatePosition.x, updatePosition.y, updatePosition.z, 1);
    sphere.position.copy(mvPosition);
    linkLabel.position.copy(sphere.position);
    root.add(linkLabel);
  });

  on();
  resizeWindow();
  renderLoop();
}

window.onload = init;

// eslint-disable-next-line no-undef
particlesJS('particles-js', particlesJSON);
