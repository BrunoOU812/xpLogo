import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
// const textureLoader = new THREE.TextureLoader();
// instantiate a loader
const loader = new SVGLoader();
const ambientLight = new THREE.AmbientLight({ color: 0xffffff });
// ambientLight.position.set(1, 1, 1);
scene.add(ambientLight);
// const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.2);
// hemisphereLight.position.set(1, 1, 1);
// scene.add(hemisphereLight);
const spotLight = new THREE.SpotLight({ color: 0xffffff });
spotLight.position.set(1, 1, 1);
scene.add(spotLight);

loader.load("/textures/SVG/xp2-01.svg", (data) => {
  const paths = data.paths;

  const material = new THREE.MeshStandardMaterial({
    color: 0xaa99ff,
    side: THREE.FrontSide,
    // depthWrite: false,
  });

  const shapes = [];

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];

    const shapesArray = path.toShapes(true);

    shapesArray.forEach(function (shape) {
      //   shape.curves.forEach((curve) => curve.reverse());
      shapes.push(shape);
    });
  }

  //   const geometry = new THREE.ShapeBufferGeometry(shapes);
  const extrudeSettings = {
    depth: 20,
    bevelEnabled: false,
    // bevelThickness: 20,
    // bevelSize: 20,
    // bevelOffset: -5,
    // bevelSegments: 1,
  };
  const extrude = new THREE.ExtrudeBufferGeometry(shapes, extrudeSettings);
  const mesh = new THREE.Mesh(extrude, material);

  scene.add(mesh);
  mesh.scale.set(0.005, 0.005, 0.005);
  const bbox = new THREE.Box3().setFromObject(mesh);
  const width = -bbox.getSize().x / 2;
  const height = bbox.getSize().y / 2;
  mesh.rotation.x = Math.PI;
  mesh.position.x = width;
  mesh.position.y = height;
});

/**
 * Test cube
 */
// const cube = new THREE.Mesh(
//   new THREE.BoxBufferGeometry(1, 1, 1),
//   new THREE.MeshNormalMaterial()
// );
// scene.add(cube);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  // Model Rotation
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
