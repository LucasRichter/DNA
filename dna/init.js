import { debounce, sleep } from '../utils/index.js';
import * as THREE from 'three';
import DnaHelix from './DnaHelix.js';
import PostEffect from './PostEffect.js';
import LinkPoint from './LinkPoint.js';

const pointer = {}
const mouse = {}

function init() {
  // ==========
  // Define common variables
  //
  const resolution = new THREE.Vector2();
  const canvas = document.getElementById('canvas-webgl');
  const renderer = new THREE.WebGL1Renderer({
    alpha: true,
    antialias: true,
    canvas: canvas,
  });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  
  const clock = new THREE.Clock({
    autoStart: false
  });

  // For the post effect.
  const renderTarget = new THREE.WebGLRenderTarget();
  const scenePE = new THREE.Scene();
  const cameraPE = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 2);

  // ==========
  // Define unique variables
  //
  const dnaHelix = new DnaHelix(8);

  // For the post effect.
  const postEffect = new PostEffect(renderTarget.texture);

  postEffect.createObj();
  scenePE.add(postEffect.obj);

  function onPointerMove( event ) {
      pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }

  window.addEventListener( 'pointermove', onPointerMove, false );
  
  function onMouseMove( event ) {
    mouse.x = event.clientX
    mouse.y = event.clientY
  }

  window.addEventListener( 'mousemove', onMouseMove, false );
  // ==========
  // Define functions
  //
  const render = () => {
    const time = clock.getDelta();

    dnaHelix.render(time);  

    // Render the main scene to frame buffer.
    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, camera);

    // Render the post effect.
    postEffect.render(time);
    renderer.setRenderTarget(null);
    renderer.render(scenePE, cameraPE);
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
      resolution.y
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
    postEffect.resize(resolution.x, resolution.y);
  };

  const on = () => {
    window.addEventListener('wheel', e => {
      dnaHelix.render(clock.getDelta() * 50);
    });

    window.addEventListener('blur', () => {
      // this window is inactive.
      clock.stop();
    });
    window.addEventListener('focus', () => {
      // this window is inactive.
      clock.start();
    });

    window.addEventListener("drag", (event) => {
      dnaHelix.render(clock.getDelta() * 100);
    });


    window.addEventListener('resize', debounce(resizeWindow, 1000));
  };

  renderer.setClearColor(0x0fff, 1.0);

  // ==========
  // Initialize
  //
  
  camera.aspect = 3 / 2;
  camera.far = 1000;
  camera.position.set(-130, 75, 45);
  camera.lookAt(dnaHelix);

  scene.add(dnaHelix);

  for (const index of dnaHelix.linkPoints) {
    const newLinkPoint = new LinkPoint(index, dnaHelix.geometry)
    scene.add(newLinkPoint);
  }

  on();
  resizeWindow();

  clock.start();
  renderLoop();
}

window.onload = init;