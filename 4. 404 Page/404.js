document.addEventListener('DOMContentLoaded', function() {
    // Add mouse move effect for desktop
    if (window.matchMedia("(hover: hover)").matches) {
        document.addEventListener('mousemove', function(e) {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            // Move background circles slightly
            const circles = document.querySelectorAll('.circle');
            circles.forEach((circle, index) => {
                const speed = 0.3 + (index * 0.1);
                const moveX = (x - 0.5) * 20 * speed;
                const moveY = (y - 0.5) * 20 * speed;
                
                circle.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
            
            // Move the dot in decoration
            const dot = document.querySelector('.dot');
            const moveX = (x - 0.5) * 10;
            dot.style.transform = `translateX(${moveX}px)`;
        });
    }
    
    // Click effect on the zero
    const zero = document.querySelector('.zero');
    zero.addEventListener('click', function() {
        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            border: 2px solid rgba(59, 130, 246, 0.5);
            border-radius: 50%;
            top: 0;
            left: 0;
            animation: rippleEffect 1s ease-out;
            pointer-events: none;
        `;
        
        // Add ripple animation CSS
        if (!document.getElementById('ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.textContent = `
                @keyframes rippleEffect {
                    0% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1.3);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        this.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 1000);
    });
    
    // Handle orientation changes
    let lastOrientation = window.orientation;
    window.addEventListener('orientationchange', function() {
        // Debounce orientation changes
        setTimeout(() => {
            if (window.orientation !== lastOrientation) {
                lastOrientation = window.orientation;
                // Trigger resize to update responsive styles
                window.dispatchEvent(new Event('resize'));
            }
        }, 100);
    });
    
    // Handle viewport height on mobile browsers
    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    
    // Simple console message
    console.log('404 - Page Not Found');
    console.log('This page is responsive and works on all devices!');
});

