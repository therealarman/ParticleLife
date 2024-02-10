import * as THREE from 'three';

// Create a scene
const scene = new THREE.Scene();

// Create a sphere
const geometry = new THREE.SphereGeometry(3, 64, 64);
const material = new THREE.MeshStandardMaterial({
    color: "#00ff83"
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Create a point light
const light = new THREE.PointLight(0xffffff, 10, 100);
light.position.set(0, 10, 10); // Adjust the light position
scene.add(light);

// Create a perspective camera
const camera = new THREE.PerspectiveCamera(45, 800 / 600);
camera.position.z = 20;
scene.add(camera);

// Create a WebGLRenderer
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(800, 600);
renderer.render(scene, camera);