const particleCanvas = document.getElementById("particleCanvas");
const particleCtx = particleCanvas.getContext("2d");

const forceMatrixCanvas = document.getElementById("forceMatrixCanvas");
const forceMatrixCtx = forceMatrixCanvas.getContext("2d");


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

const friction = 0.2;
const maxDistance = 1;
const minDistance = 0.3;

function initializeVariables() {
    
    particleCanvas.width  = Math.min(window.innerWidth, innerHeight);;
    particleCanvas.height  = Math.min(window.innerWidth, innerHeight);;
    
    sizeX = particleCanvas.width;
    sizeY = particleCanvas.height;

    dt = parseFloat(document.getElementById("dt").value);
    particleVisSize = parseFloat(document.getElementById("particleVisSize").value);
    n = parseInt(document.getElementById("n").value);
    m = parseInt(document.getElementById("m").value);
    rMax = parseFloat(document.getElementById("rMax").value);
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

        for (let j = 0; j < n; j++) {
            let b = particles[j];

            if (b !== a) {
                let dx = b.x - a.x;
                let dy = b.y - a.y;

                if (Math.abs(dx) > 0.5) {
                    dx -= Math.sign(dx);
                }
                if (Math.abs(dy) > 0.5) {
                    dy -= Math.sign(dy);
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
        a.y = (a.y + a.vy * dt + 1) % 1;
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

function generateParticles(amount) {
    let particleList = [];

    for (let i = 0; i < amount; i++) {
        let xPos = Math.random();
        let yPos = Math.random();
        let idx = Math.floor(Math.random() * m);

        let particle = new ParticleInfo(idx, xPos, yPos, 0, 0);
        particleList.push(particle);
    }

    return particleList;
}

function particleReset() {
    initializeVariables();
    particles = generateParticles(n);
}

function snake() {
    initializeVariables();
    initializeForceMatrix(false);

    for (let i = 0; i < m; i++) {
        forceMatrix[i][i] = -1;
        const nextIndex = (i - 1) % m;
        forceMatrix[i][nextIndex] = -0.4;
    }
}

function drawForceMatrix() {
    forceMatrixCtx.clearRect(0, 0, forceMatrixCanvas.width, forceMatrixCanvas.height);

    // let topBar = document.getElementById("forceMatrixTopBar");
    // let tbCtx = topBar.getContext("2d");

    // let sideBar = document.getElementById("forceMatrixSideBar");
    // let sideCtx = sideBar.getContext("2d");

    // for (let i = 0; i < m; i++) {
    //     tbCtx.fillStyle = `hsl(${(i / m) * 360}, 100%, 50%)`;
    //     tbCtx.fillRect(i * (forceMatrixCanvas.width / m), 0, forceMatrixCanvas.width / m, 20);
    // }

    // for (let j = 0; j < m; j++) {
    //     sideCtx.fillStyle = `hsl(${(j / m) * 360}, 100%, 50%)`;
    //     sideCtx.fillRect(0, j * (forceMatrixCanvas.height / m), 20, forceMatrixCanvas.height / m);
    // }

for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
        let value = forceMatrix[i][j];

        let redToBlack = `hsl(360, 100%, ${Math.abs(value) * 50}%)`;
        let blackToGreen = `hsl(115, 100%, ${Math.abs(value) * 50}%)`;
        
        let color = value < 0 ? redToBlack : blackToGreen;

        forceMatrixCtx.fillStyle = color;
        let x = i * (forceMatrixCanvas.width / m);
        let y = j * (forceMatrixCanvas.height / m);
        let width = forceMatrixCanvas.width / m;
        let height = forceMatrixCanvas.height / m;

        forceMatrixCtx.fillRect(x, y, width, height);
    }
}

}

document.addEventListener("DOMContentLoaded", function () {
    initializeVariables();
    snake();
    particles = generateParticles(n);

    function updateVisualization() {
        particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

        particleCanvas.width  = Math.min(window.innerWidth, innerHeight);
        particleCanvas.height  = Math.min(window.innerWidth, innerHeight);
        sizeX = particleCanvas.width;
        sizeY = particleCanvas.height;

        rule();

        for (let i = 0; i < particles.length; i++) {
            let particle = particles[i];
            particleCtx.beginPath();
            const screenX = particle.x * sizeX;
            const screenY = particle.y * sizeY;
            particleCtx.arc(screenX, screenY, particleVisSize, 0, 2 * Math.PI);
            particleCtx.fillStyle = `hsl(${(particle.famIdx / m) * 360}, 100%, 50%)`;
            particleCtx.fill();
        }
        drawForceMatrix();

        requestAnimationFrame(updateVisualization);
    }

    updateVisualization();

    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', function () {

            let prevN = n;
            let prevM = m;

            initializeVariables();

            if (prevN !== n || prevM !== m) {
                initializeForceMatrix(true);
                particles = generateParticles(n);
            }
        });
    });

    forceMatrixCanvas.addEventListener('mousedown', function (event) {
        if (event.button === 1) {
            let mouseX = event.clientX - forceMatrixCanvas.getBoundingClientRect().left;
            let mouseY = event.clientY - forceMatrixCanvas.getBoundingClientRect().top;

            let i = Math.floor((mouseX / forceMatrixCanvas.width) * m);
            let j = Math.floor((mouseY / forceMatrixCanvas.height) * m);

            if (i >= 0 && i < m && j >= 0 && j < m) {
                forceMatrix[i][j] = 0;
                drawForceMatrix();
            }
        }
    });

    forceMatrixCanvas.addEventListener('wheel', function (event) {
        let mouseX = event.clientX - forceMatrixCanvas.getBoundingClientRect().left;
        let mouseY = event.clientY - forceMatrixCanvas.getBoundingClientRect().top;

        let i = Math.floor((mouseX / forceMatrixCanvas.width) * m);
        let j = Math.floor((mouseY / forceMatrixCanvas.height) * m);

        if (i >= 0 && i < m && j >= 0 && j < m) {
            let matrixUpdate = event.deltaY * -0.001;

            forceMatrix[i][j] = Math.min(Math.max(forceMatrix[i][j] += matrixUpdate, -1), 1);
            drawForceMatrix();
        }

        event.preventDefault();
    });
});
