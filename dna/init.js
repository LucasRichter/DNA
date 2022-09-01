import * as THREE from 'three';
import { debounce } from '../utils';

import DnaHelix from './DnaHelix';
import LinkPoint from './LinkPoint';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

let root;

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

  root = new THREE.Group();
  scene.add( root );

  // For the post effect.
  const renderTarget = new THREE.WebGLRenderTarget();

  // ==========
  // Define unique variables
  //
  const dnaHelix = new DnaHelix(8);

  const links = [];

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize( window.innerWidth, window.innerHeight );
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  document.body.appendChild( labelRenderer.domElement );
  
  // ==========
  // Define functions
  //
  const render = () => {
    const time = clock.getDelta();
  
    const elapsed = clock.getElapsedTime();
    links.map(link => link.render(time));
    root.rotation.x += time * 0.3
    dnaHelix.render(0);

    renderer.render(scene, camera);


    labelRenderer.render(scene, camera)
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
  };

  const on = () => {
    window.addEventListener('wheel', () => {
      const time = clock.getDelta() * 2
      root.rotation.x += time
    });

    document.addEventListener('drag', () => {
      const time = clock.getDelta() * 0.7;
      root.rotation.x += time
    })

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
  renderer.setClearColor( 0x000000, 0 ); // the default

  camera.aspect = 3 / 2;
  camera.far = 500;
  camera.position.set(-110, -75, 45);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  const linksElement = document.querySelectorAll('li');
  dnaHelix.initLinkPoints(linksElement)
  let indexOfLinks = 0;
  root.layers.enableAll();
  for (const index of dnaHelix.linkPoints) {
    const newLinkPoint = new LinkPoint(index, dnaHelix.geometry)
    newLinkPoint.layers.enableAll();
    links.push(newLinkPoint);

    const link = linksElement[indexOfLinks];

    link.addEventListener('mouseenter', () => {
      dnaHelix.changeHelixColors(new THREE.Color('purple'), +link.attributes.key.value)
    })

    link.addEventListener('mouseleave', () => {
      dnaHelix.changeHelixColors(new THREE.Color('black'), +link.attributes.key.value)
    })

    const linkLabel = new CSS2DObject( link );
    linkLabel.layers.set( 1 );
    
    const geometry = new THREE.SphereGeometry( 1, 32, 16 );
    const material = new THREE.MeshBasicMaterial( { color: 0x000 } );
    const sphere = new THREE.Mesh( geometry, material );
    sphere.position.set( newLinkPoint.geometry.attributes.position.array[0], newLinkPoint.geometry.attributes.position.array[1], newLinkPoint.geometry.attributes.position.array[2] );
    sphere.layers.enableAll()
    linkLabel.position.copy( sphere.position )
    root.add( sphere );
    root.add( linkLabel )
    indexOfLinks += 1;
  }

  root.add(dnaHelix);
  
  on();
  resizeWindow();
  renderLoop();
}
window.onload = init; 