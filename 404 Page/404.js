// Minimal JavaScript for the 404 page
document.addEventListener('DOMContentLoaded', function() {
    // Set current year
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Create interactive mouse effect
    const container = document.querySelector('.container');
    
    // Add mouse move effect for background shapes
    document.addEventListener('mousemove', function(e) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        // Move shapes slightly with mouse
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach((shape, index) => {
            const speed = 0.5 + (index * 0.1);
            const moveX = (x - 0.5) * 40 * speed;
            const moveY = (y - 0.5) * 40 * speed;
            
            shape.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
        
        // Add subtle parallax to stars
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            const speed = 0.2 + (index * 0.05);
            const moveX = (x - 0.5) * 10 * speed;
            const moveY = (y - 0.5) * 10 * speed;
            
            star.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });
    
    // Add click effect on the planet
    const planet = document.querySelector('.planet');
    planet.addEventListener('click', function() {
        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            width: 100px;
            height: 100px;
            border: 2px solid rgba(79, 109, 245, 0.5);
            border-radius: 50%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            animation: ripple-animation 1s ease-out;
            z-index: 3;
        `;
        
        // Add CSS for ripple animation if not already present
        if (!document.getElementById('ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.textContent = `
                @keyframes ripple-animation {
                    0% {
                        transform: translate(-50%, -50%) scale(0);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        this.parentElement.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 1000);
    });
    
    // Console easter egg
    console.log('%c🚀 404 - Lost in Space', 'color: #6c5ce7; font-size: 18px; font-weight: bold;');
    console.log('%c"You have reached the edge of the digital universe."', 'color: #a29bfe; font-size: 14px;');
    
    // Add subtle background color shift animation
    let hue = 220;
    function shiftBackground() {
        hue = (hue + 0.1) % 360;
        document.body.style.background = `hsl(${hue}, 40%, 8%)`;
        requestAnimationFrame(shiftBackground);
    }
    
    // Start the subtle color shift (uncomment to enable)
    // shiftBackground();
    
    // Make the dots follow mouse when near
    const dots = document.querySelectorAll('.dot');
    document.addEventListener('mousemove', function(e) {
        dots.forEach(dot => {
            const rect = dot.getBoundingClientRect();
            const dotCenterX = rect.left + rect.width / 2;
            const dotCenterY = rect.top + rect.height / 2;
            const distance = Math.sqrt(
                Math.pow(e.clientX - dotCenterX, 2) + 
                Math.pow(e.clientY - dotCenterY, 2)
            );
            
            if (distance < 100) {
                const moveX = (e.clientX - dotCenterX) * 0.1;
                const moveY = (e.clientY - dotCenterY) * 0.1;
                dot.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px)) scale(1.5)`;
                dot.style.backgroundColor = '#fd79a8';
            } else {
                dot.style.transform = `translateY(-50%) scale(1)`;
                dot.style.backgroundColor = '#4f6df5';
            }
        });
    });
});