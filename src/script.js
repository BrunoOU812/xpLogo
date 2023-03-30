import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
// import { SubdivisionModifier } from "three/examples/js/modifiers/SubdivisionModifier.js";
// import { SubdivisionModifier } from "three-subdivision-modifier";

import GIF from "gif.js";

/**
 * Base
 */
const cubeTextureLoader = new THREE.CubeTextureLoader();
const environmentMapTexture = cubeTextureLoader.load([
  "textures/environmentMaps/0/px.jpg",
  "textures/environmentMaps/0/nx.jpg",
  "textures/environmentMaps/0/py.jpg",
  "textures/environmentMaps/0/ny.jpg",
  "textures/environmentMaps/0/pz.jpg",
  "textures/environmentMaps/0/nz.jpg",
]);
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
const model = {
  speed: 0,
  scale: 0.05,
  color: "#aa99ff",
  break: 0,
};
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
let group;
let mesh;
let geometry;
let morphTargets;
let vertexesPosition;
const material = new THREE.MeshStandardMaterial({
  color: model.color,
  side: THREE.FrontSide,
  envMap: environmentMapTexture,
  // depthWrite: false,
});
material.metalness = 0.2;
material.roughness = 0.2;
// const modifier = new THREE.SubdivisionModifier(2);
loader.load("/textures/SVG/xp2-01.svg", (data) => {
  const paths = data.paths;

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
  geometry = extrude.attributes.position;

  vertexesPosition = extrude.attributes.position.clone();
  console.log(vertexesPosition);

  // const smoothedGeometry = modifier.modify(extrude);
  mesh = new THREE.Mesh(extrude, material);
  group = new THREE.Group();
  group.add(mesh);
  scene.add(group);
  mesh.scale.set(model.scale, model.scale, model.scale);
  const bbox = new THREE.Box3().setFromObject(mesh);
  const width = -bbox.getSize().x / 2;
  const height = bbox.getSize().y / 2;
  mesh.rotation.x = Math.PI;
  mesh.position.x = width;
  mesh.position.y = height;
});

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
gui.add(material, "metalness").min(0).max(1).step(0.0001);
gui.add(material, "roughness").min(0).max(1).step(0.0001);
gui.add(material, "aoMapIntensity").min(0).max(3).step(0.01);
gui.add(model, "speed").min(-10).max(10).step(0.01);
gui.add(model, "scale").min(0.05).max(0.14).step(0.001);
gui
  .add(model, "break")
  .min(0)
  .max(100)
  .step(1)
  .onFinishChange(() => (geometry.needsUpdate = true));
gui.addColor(model, "color").onChange(() => {
  material.color.set(model.color);
});
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

// En el bucle de renderizado
// const elapsedTime = clock.getElapsedTime();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  // Model Rotation
  if (group) {
    group.rotation.y = elapsedTime * model.speed;
    group.scale.set(model.scale, model.scale, model.scale);
    // group.children[0].material.color = model.color;
    for (let i = 0; i < vertexesPosition.count; i++) {
      geometry.setXYZ(
        i,
        vertexesPosition.getX(i) + Math.random() * model.break - 0.1,
        vertexesPosition.getY(i) + Math.random() * model.break - 0.1,
        vertexesPosition.getZ(i) + Math.random() * model.break - 0.1
      );
    }
  }
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
