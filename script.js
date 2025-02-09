// Typing effect for hero text
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Animate skill bars
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach(bar => {
        const progress = bar.getAttribute('data-progress');
        bar.style.width = `${progress}%`;
    });
}

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.2
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains('skill-card')) {
                entry.target.style.animation = 'slideUp 0.5s ease forwards';
            }
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Form validation
function validateForm(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.querySelector('#name');
    const email = form.querySelector('#email');
    const message = form.querySelector('#message');
    
    let isValid = true;
    
    if (!name.value.trim()) {
        isValid = false;
        showError(name, 'Name is required');
    }
    
    if (!email.value.trim()) {
        isValid = false;
        showError(email, 'Email is required');
    } else if (!isValidEmail(email.value)) {
        isValid = false;
        showError(email, 'Please enter a valid email');
    }
    
    if (!message.value.trim()) {
        isValid = false;
        showError(message, 'Message is required');
    }
    
    if (isValid) {
        // In a real application, you would handle form submission here
        alert('Message sent successfully!');
        form.reset();
    }
}

function showError(input, message) {
    const formGroup = input.parentElement;
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    
    // Remove existing error message if any
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    formGroup.appendChild(error);
    
    // Remove error message when user starts typing
    input.addEventListener('input', () => {
        error.remove();
    }, { once: true });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Theme handling
function initializeTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Load saved theme or use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.dataset.theme = savedTheme;
        updateThemeIcon(savedTheme === 'dark');
    } else if (prefersDarkScheme.matches) {
        document.documentElement.dataset.theme = 'dark';
        updateThemeIcon(true);
    }
    
    // Theme toggle click handler
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.dataset.theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.dataset.theme = newTheme;
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme === 'dark');
    });
    
    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.dataset.theme = newTheme;
            updateThemeIcon(e.matches);
        }
    });
}

function updateThemeIcon(isDark) {
    const themeToggle = document.querySelector('.theme-toggle');
    if (isDark) {
        themeToggle.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
        `;
    } else {
        themeToggle.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
        `;
    }
}

// Loading and Page Transition
function handlePageLoad() {
    const loading = document.querySelector('.loading');
    const content = document.querySelector('.content');
    
    // Hide loading spinner after all content is loaded
    window.addEventListener('load', () => {
        // Ensure minimum loading time of 500ms for visual effect
        setTimeout(() => {
            loading.classList.add('hidden');
            content.classList.add('visible');
        }, 500);
    });
    
    // If content loads too quickly, still show loading animation
    setTimeout(() => {
        if (!loading.classList.contains('hidden')) {
            loading.classList.add('hidden');
            content.classList.add('visible');
        }
    }, 2000);
}

// Parallax scrolling effect
function initParallax() {
    const parallaxSections = document.querySelectorAll('.parallax');
    let ticking = false;
    
    function updateParallax() {
        parallaxSections.forEach(section => {
            const distance = window.pageYOffset - section.offsetTop;
            const speed = section.dataset.speed || 0.5;
            
            if (window.pageYOffset + window.innerHeight > section.offsetTop &&
                window.pageYOffset < section.offsetTop + section.offsetHeight) {
                const yPos = distance * speed;
                section.style.transform = `translate3d(0, ${yPos}px, 0)`;
            }
        });
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateParallax();
            });
            ticking = true;
        }
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize loading handler
    handlePageLoad();
    
    // Initialize theme
    initializeTheme();
    
    // Initialize parallax
    initParallax();
    
    // Start typing animation
    const typingText = document.querySelector('.typing-text');
    typeWriter(typingText, 'Frontend Developer');
    
    // Observe skill cards for animation
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach(card => observer.observe(card));
    
    // Animate skill bars when skills section is in view
    const skillsSection = document.querySelector('.skills');
    const skillsObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            animateSkillBars();
            skillsObserver.unobserve(skillsSection);
        }
    });
    skillsObserver.observe(skillsSection);
    
    // Set up form validation
    const contactForm = document.querySelector('#contact-form');
    contactForm.addEventListener('submit', validateForm);
});
