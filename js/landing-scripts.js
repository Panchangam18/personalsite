// Existing Logo Interaction Code
const logo = document.getElementById('logo');
const logoContainer = document.querySelector('.logo-container');
const circle = document.getElementById('circle');
const vectorContent = logo.querySelector('.vector-content');
const brackets = logo.querySelectorAll('.bracket');
const navigation = document.getElementById('navigation');
const vectorBars = document.querySelector('.vector-bars');
const fullNameTop = 'ADHAVAN';
const fullNameBottom = 'ANCHANGAM';
let isExpanded = false;
let typingInterval;

function updateCircleSize(scaleFactor = 1) {
    const baseSize = 500;
    const newSize = baseSize * scaleFactor;
    circle.style.width = `${newSize}px`;
    circle.style.height = `${newSize}px`;

    const navScale = 0.95 * scaleFactor;
    navigation.style.transform = `translate(-50%, -50%) scale(${navScale})`;

    const texts = navigation.querySelectorAll('text');
    texts.forEach((text) => {
        const baseFontSize = 18;
        const newFontSize = baseFontSize / navScale;
        text.setAttribute('font-size', newFontSize);
    });
}

function typeText(textTop, textBottom, indexTop = 0, indexBottom = 0) {
    if (indexTop < textTop.length || indexBottom < textBottom.length) {
        if (indexTop < textTop.length) {
            vectorContent.children[0].textContent = 'M' + textTop.slice(0, indexTop + 1);
            indexTop++;
        }
        if (indexBottom < textBottom.length) {
            vectorContent.children[1].textContent = 'P' + textBottom.slice(0, indexBottom + 1);
            indexBottom++;
        }
        const scaleFactor = 1 + (indexTop + indexBottom) / (textTop.length + textBottom.length);
        updateCircleSize(scaleFactor);
        typingInterval = setTimeout(() => typeText(textTop, textBottom, indexTop, indexBottom), 100);
    } else {
        fadeBrackets();
    }
}

function fadeBrackets() {
    brackets.forEach(bracket => {
        bracket.style.opacity = '0';
    });
}

function resetText() {
    clearTimeout(typingInterval);
    vectorContent.children[0].textContent = 'M';
    vectorContent.children[1].textContent = 'P';
    brackets.forEach(bracket => {
        bracket.style.opacity = '1';
    });
    vectorBars.style.opacity = '1';
    updateCircleSize(1);
}

logoContainer.addEventListener('mouseenter', () => {
    if (!isExpanded) {
        isExpanded = true;
        vectorBars.style.opacity = '0';
        typeText(fullNameTop, fullNameBottom);
    }
});

logoContainer.addEventListener('mouseleave', () => {
    isExpanded = false;
    resetText();
});

updateCircleSize(1);

// Arrow JS Effect Integration
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const arrows = [];
const circleElement = document.getElementById('circle');

let circleX, circleY, circleRadius;

function updateCircleParameters() {
    const rect = circleElement.getBoundingClientRect();
    circleX = rect.left + rect.width / 2;
    circleY = rect.top + rect.height / 2;
    circleRadius = rect.width / 2;
}

class Arrow {
    constructor(x, y, vx, vy) {
        this.positions = [];
        this.maxLength = Math.floor(Math.random() * (300 - 50 + 1)) + 50;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.width = 5;
        this.color = 'black';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.positions.push({ x: this.x, y: this.y });
        if (this.positions.length > this.maxLength) {
            this.positions.shift();
        }
        this.checkCollisionWithCircle();
    }

    checkCollisionWithCircle() {
        const dx = this.x - circleX;
        const dy = this.y - circleY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < circleRadius) {
            const nx = dx / distance;
            const ny = dy / distance;
            const dot = this.vx * nx + this.vy * ny;

            if (dot > 0) {
                this.remove = true;
            } else {
                this.vx -= 2 * dot * nx;
                this.vy -= 2 * dot * ny;
                const overlap = circleRadius - distance;
                this.x += nx * overlap;
                this.y += ny * overlap;
            }
        }
    }

    draw() {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';
        ctx.miterLimit = 10;

        if (this.positions.length > 1) {
            ctx.beginPath();
            const tailStart = this.positions[0];
            ctx.moveTo(tailStart.x, tailStart.y);
            for (let i = 1; i < this.positions.length; i++) {
                const pos = this.positions[i];
                ctx.lineTo(pos.x, pos.y);
            }
            ctx.stroke();
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        const angle = Math.atan2(this.vy, this.vx);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-this.width * 2, -this.width);
        ctx.lineTo(-this.width * 2, this.width);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.restore();
    }
}

function generateRandomArrow() {
    const side = Math.floor(Math.random() * 4);
    let x, y, vx, vy;

    switch (side) {
        case 0:
            x = Math.random() * canvas.width;
            y = -20;
            break;
        case 1:
            x = canvas.width + 20;
            y = Math.random() * canvas.height;
            break;
        case 2:
            x = Math.random() * canvas.width;
            y = canvas.height + 20;
            break;
        case 3:
            x = -20;
            y = Math.random() * canvas.height;
            break;
    }

    const angleToCircle = Math.atan2(circleY - y, circleX - x);
    const speed = 2 + Math.random() * 2;
    const angleOffset = (Math.random() - 0.5) * (Math.PI / 8);
    const angle = angleToCircle + angleOffset;

    vx = speed * Math.cos(angle);
    vy = speed * Math.sin(angle);

    const arrow = new Arrow(x, y, vx, vy);
    arrows.push(arrow);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateCircleParameters();

    for (let i = arrows.length - 1; i >= 0; i--) {
        const arrow = arrows[i];
        arrow.update();

        const tailEnd = arrow.positions[0];
        const offScreen =
            tailEnd.x < -50 || tailEnd.x > canvas.width + 50 ||
            tailEnd.y < -50 || tailEnd.y > canvas.height + 50;

        if (arrow.remove || offScreen) {
            arrows.splice(i, 1);
        } else {
            arrow.draw();
        }
    }

    requestAnimationFrame(animate);
}

setInterval(generateRandomArrow, 6000);
animate();

function handleNavigation(event) {
    const link = event.target.closest('a');
    if (link) {
        event.preventDefault();
        const href = link.getAttribute('href');
        
        // Check if it's an external link (doesn't start with #)
        if (!href.startsWith('#')) {
            // For external links, navigate to the new page
            window.location.href = href;
        } else {
            // For internal links (if any), you can add smooth scrolling here
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
}

function setupNavigationHover() {
    const svgContainer = document.querySelector('.svg-container');
    const navLinks = svgContainer.querySelectorAll('a');

    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            svgContainer.style.animationPlayState = 'paused';
        });

        link.addEventListener('mouseleave', () => {
            svgContainer.style.animationPlayState = 'running';
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const svg = document.querySelector('svg');
    if (svg) {
        svg.addEventListener('click', handleNavigation);
    }
    setupNavigationHover();
});