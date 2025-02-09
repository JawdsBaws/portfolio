// Cursor elements
let cursorDot, cursorOutline;
const cursorTrails = [];
const maxTrails = 5;

// Initialize cursor elements
function initCursor() {
    // Create cursor elements
    cursorDot = document.createElement('div');
    cursorOutline = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    cursorOutline.className = 'cursor-outline';
    
    // Add to DOM
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorOutline);

    // Set initial position off screen
    cursorDot.style.opacity = '0';
    cursorOutline.style.opacity = '0';

    // Add event listeners
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseenter', () => {
        cursorDot.style.opacity = '1';
        cursorOutline.style.opacity = '1';
    });
    document.addEventListener('mouseleave', () => {
        cursorDot.style.opacity = '0';
        cursorOutline.style.opacity = '0';
    });

    // Add hover listeners to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, [data-magnetic]');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        
        // Add magnetic effect if specified
        if (el.hasAttribute('data-magnetic')) {
            el.addEventListener('mousemove', handleMagneticMove);
            el.addEventListener('mouseleave', handleMagneticLeave);
        }
    });
}

// Handle cursor movement
function onMouseMove(e) {
    const { clientX, clientY } = e;
    
    // Move main cursor elements
    requestAnimationFrame(() => {
        cursorDot.style.transform = `translate(${clientX}px, ${clientY}px)`;
        cursorOutline.style.transform = `translate(${clientX}px, ${clientY}px)`;
    });

    // Create trail effect
    createTrail(clientX, clientY);
}

// Handle mouse click
function onMouseDown() {
    document.body.classList.add('cursor-click');
}

function onMouseUp() {
    document.body.classList.remove('cursor-click');
}

// Create trail effect
function createTrail(x, y) {
    if (cursorTrails.length >= maxTrails) {
        const oldTrail = cursorTrails.shift();
        oldTrail.remove();
    }

    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.left = x + 'px';
    trail.style.top = y + 'px';
    document.body.appendChild(trail);
    cursorTrails.push(trail);

    // Fade out and remove trail
    setTimeout(() => {
        trail.style.opacity = '0';
        setTimeout(() => trail.remove(), 500);
    }, 50);
}

// Handle magnetic effect
function handleMagneticMove(e) {
    const bound = this.getBoundingClientRect();
    const mouseX = e.clientX - bound.left;
    const mouseY = e.clientY - bound.top;
    const centerX = bound.width / 2;
    const centerY = bound.height / 2;
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    const magneticPull = 0.4; // Adjust this value to change the magnetic strength

    if (distance < bound.width) {
        const moveX = (deltaX / distance) * bound.width * magneticPull;
        const moveY = (deltaY / distance) * bound.height * magneticPull;
        this.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }
}

function handleMagneticLeave() {
    this.style.transform = 'translate(0, 0)';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initCursor);
