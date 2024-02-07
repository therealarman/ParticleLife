// Import Three.js library
import * as THREE from 'https://threejs.org/build/three.module.js';

class ParticleInfo {
    constructor(famIdx, x, y, vx, vy) {
        this.famIdx = famIdx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
    }
}

// Declare variables
let sizeX, sizeY, dt, friction, particleVisSize, n, m, maxDistance, minDistance, universalRepulsiveForce, maxVelocity;
let particles, scene, camera, renderer;

// Function to initialize variables
function initializeVariables() {
    // Set initial values for simulation parameters
    sizeX = window.innerWidth;
    sizeY = window.innerHeight;
    dt = 0.006;
    friction = 0.01;
    particleVisSize = 3;
    n = 1000;
    m = 6;
    maxDistance = 100;
    minDistance = 15;
    universalRepulsiveForce = 100;
    maxVelocity = 100;
}

// Function to initialize particle system
function initializeParticles() {
    // Create Three.js Points object with generated geometry and material
    particles = new THREE.Points(generateGeometry(), generateMaterial());
    // Add the particles to the scene
    scene.add(particles);
}

// Function to generate particle geometry
function generateGeometry() {
    // Create a Three.js BufferGeometry
    const geometry = new THREE.BufferGeometry();
    const positions = [];

    // Generate random particle positions
    for (let i = 0; i < n; i++) {
        positions.push(Math.random() * sizeX - sizeX / 2, Math.random() * sizeY - sizeY / 2, 0);
    }

    // Set the 'position' attribute of the geometry
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    return geometry;
}

// Function to generate particle material
function generateMaterial() {
    // Create a Three.js PointsMaterial with specified size and color
    return new THREE.PointsMaterial({ size: particleVisSize, color: 0xffffff });
}

// Function to initialize Three.js scene
function initializeScene() {
    // Create a new Three.js Scene
    scene = new THREE.Scene();
}

// Function to initialize Three.js camera
function initializeCamera() {
    // Create a new Three.js PerspectiveCamera
    camera = new THREE.PerspectiveCamera(75, sizeX / sizeY, 0.1, 1000);
    // Set initial camera position
    camera.position.z = 5;
}

// Function to initialize Three.js renderer
function initializeRenderer() {
    // Create a new Three.js WebGLRenderer
    renderer = new THREE.WebGLRenderer();
    // Set renderer size to match window size
    renderer.setSize(sizeX, sizeY);
    // Append the renderer's DOM element to the container
    document.getElementById('threeCanvas').appendChild(renderer.domElement);
}

// Function to handle window resize
function handleResize() {
    // Update sizeX and sizeY to match the resized window
    sizeX = window.innerWidth;
    sizeY = window.innerHeight;

    // Update camera aspect ratio and projection matrix
    camera.aspect = sizeX / sizeY;
    camera.updateProjectionMatrix();

    // Update renderer size
    renderer.setSize(sizeX, sizeY);
}

// Function to animate the scene
function animate() {
    // Request the next animation frame
    requestAnimationFrame(animate);

    // Update and render the scene
    updateParticles();
    rule();
    renderer.render(scene, camera);
}

// Function to update particle positions
function updateParticles() {
    // Implement logic to update particle positions based on simulation rules
}

// Function to implement simulation rule
function rule() {
    // Implement your simulation rule logic here
}

// Event listener for when the DOM content is loaded
document.addEventListener("DOMContentLoaded", function () {
    // Initialize variables, scene, camera, and renderer
    initializeVariables();
    initializeScene();
    initializeCamera();
    initializeRenderer();
    // Initialize and add particle system to the scene
    initializeParticles();

    // Add window resize event listener
    window.addEventListener('resize', handleResize, false);

    // Start the animation loop
    animate();
});
