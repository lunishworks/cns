let authServiceUrl;

async function checkAuthStatus() {
    if (!authServiceUrl) {
        console.error('Auth service URL is not set. Cannot check status.');
        return;
    }
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        
        const loginBtn = document.getElementById('login-btn');
        
        if (data.authenticated) {
            loginBtn.textContent = data.username.toUpperCase();
            
            loginBtn.onclick = () => {
                if (confirm('LOGOUT?')) {
                    const redirectUri = encodeURIComponent(window.location.origin);
                    window.location.href = `${authServiceUrl}/logout?redirect_uri=${redirectUri}`;
                }
            };
        } else {
            loginBtn.textContent = 'LOGIN';
            loginBtn.onclick = () => {
                const redirectUri = encodeURIComponent(window.location.origin);
                window.location.href = `${authServiceUrl}/login?redirect_uri=${redirectUri}`;
            };
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        // Fallback for login button if the API fails
        const loginBtn = document.getElementById('login-btn');
        loginBtn.textContent = 'LOGIN';
        loginBtn.onclick = () => {
            const redirectUri = encodeURIComponent(window.location.origin);
            window.location.href = `${authServiceUrl}/login?redirect_uri=${redirectUri}`;
        };
    }
}

async function initializeApp() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        authServiceUrl = config.authServiceUrl;
        await checkAuthStatus();
    } catch (error) {
        console.error('Failed to initialize application configuration:', error);
    }
}

initializeApp();

// --- Draggable Card Logic (refined for link-wrapped cards) ---
(function() {
    'use strict';
    
    const cardLinks = document.querySelectorAll('.card-link');
    const DRAG_THRESHOLD = 5; // Pixels before considering it a drag
    
    cardLinks.forEach(cardLink => {
        let hasMoved = false;
        let isMouseDown = false;
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let initialMouseX = 0;
        let initialMouseY = 0;
        
        let onMouseMove = null;
        let onMouseUp = null;
        
        function handleMouseDown(e) {
            // Only handle primary mouse button
            if (e.button !== 0) return;
            
            // Prevent multiple simultaneous drags
            if (isMouseDown) return;
            
            isMouseDown = true;
            hasMoved = false;
            startX = e.clientX;
            startY = e.clientY;
            initialMouseX = e.clientX;
            initialMouseY = e.clientY;
            
            // Get current position from transform to prevent jump on drag start
            try {
                const transform = window.getComputedStyle(cardLink).transform;
                if (transform && transform !== 'none') {
                    const matrix = new DOMMatrix(transform);
                    currentX = matrix.m41 || 0;
                    currentY = matrix.m42 || 0;
                } else {
                    currentX = 0;
                    currentY = 0;
                }
            } catch (err) {
                currentX = 0;
                currentY = 0;
            }
            
            const cardElement = cardLink.querySelector('.card, .small-card');
            if (cardElement) {
                cardElement.classList.add('dragging');
            }
            
            onMouseMove = function(e) {
                e.preventDefault(); // Prevent text selection
                
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                const totalDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                // Only start dragging after threshold is exceeded
                if (totalDistance > DRAG_THRESHOLD) {
                    hasMoved = true;
                    
                    const newX = currentX + (e.clientX - initialMouseX);
                    const newY = currentY + (e.clientY - initialMouseY);
                    
                    // Use GPU acceleration for smoother dragging
                    cardLink.style.willChange = 'transform';
                    cardLink.style.transform = `translate(${newX}px, ${newY}px)`;
                }
            };
            
            onMouseUp = function(e) {
                cleanup();
            };
            
            // Attach to document so drag works even if mouse leaves the card
            document.addEventListener('mousemove', onMouseMove, { passive: false });
            document.addEventListener('mouseup', onMouseUp);
            
            // Stop drag if user switches windows
            window.addEventListener('blur', onMouseUp, { once: true });
        }
        
        function cleanup() {
            // Remove event listeners
            if (onMouseMove) {
                document.removeEventListener('mousemove', onMouseMove);
            }
            if (onMouseUp) {
                document.removeEventListener('mouseup', onMouseUp);
                window.removeEventListener('blur', onMouseUp);
            }
            
            isMouseDown = false;
            const cardElement = cardLink.querySelector('.card, .small-card');
            if (cardElement) {
                cardElement.classList.remove('dragging');
            }
            
            // Reset willChange to save resources
            cardLink.style.willChange = 'auto';
            
            onMouseMove = null;
            onMouseUp = null;
        }
        
        function handleClick(e) {
            // Prevent link navigation if user was dragging
            if (hasMoved) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }
        
        function handleDragStart(e) {
            // Disable native browser drag and drop
            e.preventDefault();
        }
        
        function handleDoubleClick(e) {
            e.preventDefault();
            
            // Animate card back to original position
            cardLink.style.transition = 'transform 0.3s ease';
            cardLink.style.transform = 'translate(0px, 0px)';
            
            setTimeout(() => {
                cardLink.style.transition = '';
            }, 300);
            
            currentX = 0;
            currentY = 0;
            hasMoved = false;
        }
        
        // Attach event listeners
        cardLink.addEventListener('mousedown', handleMouseDown);
        cardLink.addEventListener('click', handleClick, true); // Use capture phase
        cardLink.addEventListener('dragstart', handleDragStart);
        cardLink.addEventListener('dblclick', handleDoubleClick);
    });
})();

// --- Button Hover Effect ---
document.querySelectorAll('button, a').forEach(element => {
    element.addEventListener('mouseenter', () => {
        element.style.filter = 'brightness(1.2)';
        setTimeout(() => {
            element.style.filter = '';
        }, 100);
    });
});
