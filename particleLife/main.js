class ParticleInfo {
    constructor(famIdx, x, y, vx, vy) {
        this.famIdx = famIdx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
    }
}

let sizeX, sizeY, dt, friction, particleVisSize, n, m, maxDistance, minDistance, universalRepulsiveForce;
let particles = [];
let forceMatrix = [];
let particleCanvas, particleCtx, forceMatrixCanvas, forceMatrixCtx;

function initializeVariables() {
    var particleCanvas = document.getElementById("particleCanvas");
    
    particleCanvas.width  = Math.min(window.innerWidth, innerHeight);;
    particleCanvas.height  = Math.min(window.innerWidth, innerHeight);;
    
    sizeX = particleCanvas.width;
    sizeY = particleCanvas.height;

    document.getElementById("sizeX").value = sizeX
    document.getElementById("sizeY").value = sizeY

    dt = parseFloat(document.getElementById("dt").value);
    friction = parseFloat(document.getElementById("friction").value);
    particleVisSize = parseFloat(document.getElementById("particleVisSize").value);
    n = parseInt(document.getElementById("n").value);
    m = parseInt(document.getElementById("m").value);
    maxDistance = parseFloat(document.getElementById("maxDistance").value);
    minDistance = parseFloat(document.getElementById("minDistance").value);
    universalRepulsiveForce = parseFloat(document.getElementById("universalRepulsiveForce").value);
    maxVelocity = parseFloat(document.getElementById("maxVelocity").value);
}

function initializeForceMatrix(assignRand, setVal = 0) {
    forceMatrix = Array.from({ length: m }, () => Array(m).fill(0));

    if (assignRand) {
        forceMatrix = forceMatrix.map(row => row.map(() => Math.floor(Math.random() * 21 - 10) / 10));
    } else {
        forceMatrix.forEach(row => row.fill(setVal));
    }
}

function updateParticles() {
    for (let i = 0; i < particles.length; i++) {
        let a = particles[i];

        a.x = (a.x + a.vx * dt + sizeX) % sizeX;
        a.y = (a.y + a.vy * dt + sizeY) % sizeY;

        a.vx *= friction;
        a.vy *= friction;
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
                let dx = a.x - b.x;
                let dy = a.y - b.y;

                if (Math.abs(dx) > sizeX / 2) {
                    dx -= Math.sign(dx) * sizeX;
                }
                if (Math.abs(dy) > sizeY / 2) {
                    dy -= Math.sign(dy) * sizeY;
                }

                let attraction = forceMatrix[a.famIdx][b.famIdx] * 100;
                let d = Math.sqrt(dx ** 2 + dy ** 2);

                let currentForce = 0;

                if (d <= maxDistance && d >= minDistance) {
                    let t = (d - minDistance) / (maxDistance - minDistance);
                    currentForce = (1 - Math.abs(t - 0.5) * 2) * attraction;
                } else if (d > maxDistance) {
                    currentForce = 0;
                } else if (d < minDistance) {
                    let t = minDistance / d;
                    currentForce = t * universalRepulsiveForce;
                }

                if (d === 0) {
                    console.error("Distance is equal to Zero!");
                }

                fx += dx / d * currentForce;
                fy += dy / d * currentForce;
            }
        }

        fx *= maxDistance;
        fy *= maxDistance;

        a.vx += fx * dt;
        a.vy += fy * dt;

        if (maxVelocity > 0) {
            a.vx = Math.min(Math.max(a.vx, -maxVelocity), maxVelocity);
            a.vy = Math.min(Math.max(a.vy, -maxVelocity), maxVelocity);
        }
    }
}

function generateParticles(amount) {
    let particleList = [];

    for (let i = 0; i < amount; i++) {
        let xPos = Math.random() * sizeX;
        let yPos = Math.random() * sizeY;
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

function matrixRandom() {
    initializeVariables();
    initializeForceMatrix(true);
}

function matrixZero() {
    initializeVariables();
    initializeForceMatrix(false);
}

function snakeMode() {
    initializeVariables();
    initializeForceMatrix(false);

    for (let i = 0; i < m; i++) {
        forceMatrix[i][i] = -1;
        const nextIndex = (i - 1) % m;
        forceMatrix[i][nextIndex] = -0.4;
    }

    drawForceMatrix();
}

function drawForceMatrix() {
    forceMatrixCtx.clearRect(0, 0, forceMatrixCanvas.width, forceMatrixCanvas.height);

    for (let i = 0; i < m; i++) {
        forceMatrixCtx.fillStyle = `hsl(${(i / m) * 360}, 100%, 50%)`;
        forceMatrixCtx.fillRect(i * (forceMatrixCanvas.width / m), 0, forceMatrixCanvas.width / m, 20);
    }

    for (let j = 0; j < m; j++) {
        forceMatrixCtx.fillStyle = `hsl(${(j / m) * 360}, 100%, 50%)`;
        forceMatrixCtx.fillRect(0, j * (forceMatrixCanvas.height / m), 20, forceMatrixCanvas.height / m);
    }

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < m; j++) {
            forceMatrixCtx.fillStyle = 'black';
            let text = forceMatrix[i][j].toFixed(2);
            let x = i * (forceMatrixCanvas.width / m) + 5 + (forceMatrixCanvas.width / m - 30) / 2;
            let y = j * (forceMatrixCanvas.height / m) + 15 + (forceMatrixCanvas.height / m - 20) / 2;
            forceMatrixCtx.fillText(text, x, y);
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    initializeVariables();
    // initializeForceMatrix(true);
    matrixZero();
    particles = generateParticles(n);

    particleCanvas = document.getElementById("particleCanvas");
    //particleCanvas.width = sizeX;
    //particleCanvas.height = sizeY;
    particleCtx = particleCanvas.getContext("2d");

    forceMatrixCanvas = document.getElementById("forceMatrixCanvas");
    forceMatrixCtx = forceMatrixCanvas.getContext("2d");

    function updateVisualization() {
        particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

        particleCanvas.width  = Math.min(window.innerWidth, innerHeight);
        particleCanvas.height  = Math.min(window.innerWidth, innerHeight);
        sizeX = particleCanvas.width;
        sizeY = particleCanvas.height;

        updateParticles();
        rule();

        for (let i = 0; i < particles.length; i++) {
            let particle = particles[i];
            particleCtx.beginPath();
            particleCtx.arc(particle.x, particle.y, (particleVisSize/1000)*sizeX, 0, 2 * Math.PI);
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

            // particleCanvas.width = sizeX;
            // particleCanvas.height = sizeY;
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
