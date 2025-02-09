// Blog-specific functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize parallax for blog header
    const blogHeader = document.querySelector('.blog-header');
    let ticking = false;
    
    function updateHeaderParallax() {
        const scrolled = window.pageYOffset;
        if (scrolled <= window.innerHeight) {
            const translateY = scrolled * 0.5;
            blogHeader.style.transform = `translate3d(0, ${translateY}px, 0)`;
        }
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateHeaderParallax();
            });
            ticking = true;
        }
    });
    
    // Blog post hover effect
    const blogPosts = document.querySelectorAll('.blog-post');
    blogPosts.forEach(post => {
        post.addEventListener('mouseenter', () => {
            post.style.transform = 'translateY(-5px)';
            post.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
        });
        
        post.addEventListener('mouseleave', () => {
            post.style.transform = 'translateY(0)';
            post.style.boxShadow = 'var(--card-shadow)';
        });
    });
    
    // Read More button effect
    const readMoreLinks = document.querySelectorAll('.read-more');
    readMoreLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const post = link.closest('.blog-post');
            
            // Add click ripple effect
            const ripple = document.createElement('div');
            ripple.classList.add('ripple');
            link.appendChild(ripple);
            
            const rect = link.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
            
            // Animate post on click
            post.style.transform = 'scale(0.98)';
            setTimeout(() => {
                post.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
    // Category tag hover effect
    const categories = document.querySelectorAll('.category');
    categories.forEach(category => {
        category.addEventListener('mouseenter', () => {
            category.style.transform = 'scale(1.1)';
        });
        
        category.addEventListener('mouseleave', () => {
            category.style.transform = 'scale(1)';
        });
    });
});
