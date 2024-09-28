// Existing Logo Interaction Code
const logo = document.getElementById('logo');
const logoContainer = document.querySelector('.logo-container');
const vectorContent = logo.querySelector('.vector-content');
const brackets = logo.querySelectorAll('.bracket');
const navigation = document.getElementById('navigation');
const vectorBars = document.querySelector('.vector-bars');
const fullNameTop = 'ADHAVAN';
const fullNameBottom = 'ANCHANGAM';
let isExpanded = false;
let typingInterval;

function updateCircleSize(scaleFactor = 1) {
    const baseSize = 500; // Base size of the circle
    const newSize = baseSize * scaleFactor;
    const circle = document.getElementById('circle');
    if (circle) {
        circle.style.width = `${newSize}px`;
        circle.style.height = `${newSize}px`;
    }

    // Update navigation scale
    const navScale = 0.95 * scaleFactor; // Adjusted scale factor for navigation
    navigation.style.transform = `translate(-50%, -50%) scale(${navScale})`;

    // Adjust font size inversely to the scaling factor
    const texts = navigation.querySelectorAll('text');
    texts.forEach((text) => {
        const baseFontSize = 18; // Original font size
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
    vectorBars.style.opacity = '1'; // Reset magnitude bars visibility
    updateCircleSize(1);
}

logoContainer.addEventListener('mouseenter', () => {
    if (!isExpanded) {
        isExpanded = true;
        vectorBars.style.opacity = '0'; // Fade out magnitude bars immediately
        typeText(fullNameTop, fullNameBottom);
    }
});

logoContainer.addEventListener('mouseleave', () => {
    isExpanded = false;
    resetText();
});

// Initial circle size
updateCircleSize(1);

// Arrow JS Effect Integration
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    console.log(`Canvas resized to: ${canvas.width}x${canvas.height}`);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Define arrow properties
const arrows = [];

// Arrow Class
class Arrow {
    constructor(x, y, vy, length, width) {
        this.x = x; // Current x position
        this.y = y; // Current y position
        this.vy = vy; // Vertical speed (pixels per frame)
        this.length = length; // Length of the arrow tail
        this.width = width; // Width of the arrowhead
        this.color = 'black'; // Arrow color
        this.isOffScreen = false; // Flag to remove arrow when off-screen
    }

    update() {
        this.y += this.vy;
        if (this.y - this.length > canvas.height) {
            this.isOffScreen = true;
        }
    }

    draw() {
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        // Draw the arrow tail pointing downwards
        ctx.beginPath();
        ctx.moveTo(this.x, this.y); // Starting point (head)
        ctx.lineTo(this.x, this.y + this.length); // Tail end
        ctx.stroke();

        // Draw the arrowhead pointing downwards
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.length); // Point at tail end
        ctx.lineTo(this.x - this.width, this.y + this.length - this.width); // Left corner
        ctx.lineTo(this.x + this.width, this.y + this.length - this.width); // Right corner
        ctx.closePath();
        ctx.fill();
    }
}

// Function to generate a new arrow at a random x position at the top
function generateArrow() {
    const side = Math.random() < 0.5 ? 'left' : 'right'; // Randomly choose side
    let x;

    if (side === 'left') {
        x = Math.random() * 100; // 0 to 100px from left
    } else {
        x = canvas.width - 100 + Math.random() * 100; // (canvas.width - 100) to canvas.width from right
    }
    const y = -250; // Start from y = -50 to y = 0
    const vy = 1 + Math.random() * 2; // Varying speeds between 1 and 3 pixels per frame
    const length = 100 + Math.random() * 200; // Tail length between 20 and 40
    const width = 5; // Arrowhead width between 5 and 8
    const arrow = new Arrow(x, y, vy, length, width);
    arrows.push(arrow);
    console.log(`Generated Arrow at x: ${x.toFixed(2)}, y: ${y.toFixed(2)}, vy: ${vy.toFixed(2)}, length: ${length.toFixed(2)}, width: ${width.toFixed(2)}`);
}

// Animation Loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw each arrow
    for (let i = arrows.length - 1; i >= 0; i--) {
        const arrow = arrows[i];
        arrow.update();
        arrow.draw();

        // Remove arrows that are off-screen
        if (arrow.isOffScreen) {
            arrows.splice(i, 1);
            console.log('Arrow removed:', arrow);
        }
    }

    requestAnimationFrame(animate);
}

// Generate arrows at regular intervals (e.g., every 1000ms)
setInterval(generateArrow, 2500);

// Start the animation
animate();