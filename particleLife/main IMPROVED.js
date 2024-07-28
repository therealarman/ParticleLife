const particleCanvas = document.getElementById("particleCanvas");
const particleCtx = particleCanvas.getContext("2d");

class ParticleInfo {
    constructor(famIdx, x, y, vx, vy) {
        this.famIdx = famIdx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
    }
}

let rMax, sizeX, sizeY, dt, particleVisSize, n, m;
let particles = [];
let forceMatrix = [];

let matrixShape = 3;

let Mx, My;

const friction = 0.2;
const maxDistance = 1;
const minDistance = 0.3;

function initializeVariables() {
    
    sizeX = particleCanvas.width;
    sizeY = particleCanvas.height;

    dt = 0.03;
    particleVisSize = 3;
    n = 1000;
    m = 10;
    rMax = 0.3;
}

function initializeForceMatrix(assignRand, setVal = 0) {
    forceMatrix = Array.from({ length: m }, () => Array(m).fill(0));

    if (assignRand) {
        forceMatrix = forceMatrix.map(row => row.map(() => Math.floor(Math.random() * 21 - 10) / 10));
    } else {
        forceMatrix.forEach(row => row.fill(setVal));
    }
}

function rule() {
    for (let i = 0; i < n; i++) {
        let fx = 0;
        let fy = 0;
        let a = particles[i];

        ratio = particleCanvas.height / particleCanvas.width;

        for (let j = 0; j < n; j++) {
            let b = particles[j];

            if (b !== a) {
                let dx = b.x - a.x;
                let dy = b.y - a.y;

                if (Math.abs(dx) > 0.5) {
                    dx -= Math.sign(dx);
                }
                if (Math.abs(dy) > 0.5 * ratio) {
                    dy -= Math.sign(dy) * ratio;
                }

                let attraction = -forceMatrix[a.famIdx][b.famIdx];
                let d = Math.sqrt(dx ** 2 + dy ** 2);
                let currentForce = 0;

                if(d > 0 && d < rMax){
                    currentForce = force(d/rMax, attraction);
                }

                fx += dx / d * currentForce;
                fy += dy / d * currentForce;
            }
        }

        fx *= rMax;
        fy *= rMax;

        a.vx *= friction;
        a.vy *= friction;

        a.vx += fx * dt;
        a.vy += fy * dt;

        a.x = (a.x + a.vx * dt + 1) % 1;
        // a.y = (a.y + a.vy * dt + 1) % 1;
        a.y = (a.y + a.vy * dt + ratio) % ratio;
    }

    for (let i = 0; i < n; i++) {
        let a = particles[i];

        a.x += a.vx * dt;
        a.y += a.vy * dt;
    }
}

function force(d, a){
    if (d < maxDistance && d > minDistance) {
        return a * (1 - Math.abs(2 * d - 1 - minDistance) / (1 - minDistance));
    } else if (d < minDistance) {
        return d / minDistance - 1;
    } else {
        return 0;
    }
}

function generateParticles(amount, listToAdd) {
    let particleList = [];

    if(listToAdd != null){
        particleList = listToAdd;
    }

    for (let i = 0; i < amount; i++) {
        let xPos = Math.random();
        let yPos = Math.random();
        let idx = Math.floor(Math.random() * m);

        let particle = new ParticleInfo(idx, xPos, yPos, 0, 0);
        particleList.push(particle);
    }

    return particleList;
}

function scatterPosition() {
    initializeVariables();
    for (let i = 0; i < particles.length; i++) {
        let particle = particles[i]
        particle.x = Math.random();
        particle.y = Math.random();
    }
}

function scatterClass() {
    initializeVariables();
    for (let i = 0; i < particles.length; i++) {
        let particle = particles[i]
        particle.famIdx = Math.floor(Math.random() * m);
    }
}

function setForceMatrixPreset(matrixToAdd){

    for (let i = 0; i < particles.length; i++) {
        let particle = particles[i]
        particle.famIdx = clampVal(particle.famIdx, 0, m-1);
    }

    forceMatrix = Array.from({ length: m }, () => Array(m).fill(0));

    if(matrixShape == 1) { // Random
        forceMatrix = forceMatrix.map(row => row.map(() => Math.floor(Math.random() * 21 - 10) / 10));
    } else if(matrixShape == 2) { // Zero
        forceMatrix.forEach(row => row.fill(0));
    } else if(matrixShape == 3) { // Snake
        forceMatrix.forEach(row => row.fill(0));
        for (let i = 0; i < m; i++) {
            forceMatrix[i][i] = -1;
            const nextIndex = (i - 1) % m;
            forceMatrix[i][nextIndex] = -0.4;
        }
    } else if(matrixShape == 4){ // Lines
        forceMatrix.forEach(row => row.fill(0));
        for (let i = 0; i < m; i++) {
            forceMatrix[i][i] = -1;
            forceMatrix[i][i - 1] = -1;
            forceMatrix[i][i + 1] = -1;
        }

        forceMatrix[0][m-1] = -1;
        forceMatrix[m-1][0] = -1;
    } else if(matrixShape == 5){ // Symmetry
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < m; j++) {
                thisRand = Math.floor(Math.random() * 21 - 10) / 10;
                if (i > j) {
                    forceMatrix[i][j] = thisRand;
                    forceMatrix[j][i] = thisRand;
                } else if (i === j) {
                    forceMatrix[i][j] = thisRand;
                }
            }
        }
    }
    
    if(matrixToAdd != null){
        N = matrixToAdd.length;
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                forceMatrix[i][j] = matrixToAdd[i][j];
            }
          }
    }
}

function clampVal(val, min, max){
    let clamped = Math.min(Math.max(val, min), max);
    return clamped;
}

function inverseLerp(a, b, x) {

    x = Math.max(Math.min(x, Math.max(a, b)), Math.min(a, b));
  
    return (x - a) / (b - a);
}

document.addEventListener("DOMContentLoaded", function () {
    initializeVariables();
    initializeForceMatrix(false);
    setForceMatrixPreset(matrixShape);
    particles = generateParticles(n);
    

    function updateVisualization() {

        particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

        particleCanvas.width  = window.innerWidth
        particleCanvas.height  = window.innerHeight

        sizeX = particleCanvas.width;
        sizeY = particleCanvas.height;

        rule();

        for (let i = 0; i < particles.length; i++) {
            let particle = particles[i];
            particleCtx.beginPath();
            const screenX = particle.x * sizeX;
            const screenY = particle.y * sizeX;
            particleCtx.arc(screenX, screenY, particleVisSize, 0, 2 * Math.PI);
            particleCtx.fillStyle = `hsl(${(particle.famIdx / m) * 360}, 100%, 50%)`;
            particleCtx.fill();
        }

        requestAnimationFrame(updateVisualization);
    }

    updateVisualization();
});