// This file contains fixed carousel functionality for creator dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Enhanced Event Carousel
    initCarousel();
    
    function initCarousel() {
        let currentIndex = 0;
        const items = document.querySelectorAll('.carousel-item');
        const container = document.querySelector('.carousel-container');
        const prevBtn = document.querySelector('.carousel-control.prev');
        const nextBtn = document.querySelector('.carousel-control.next');
        
        // Skip if carousel elements don't exist
        if (!container || items.length === 0) return;
        
        function moveCarousel(direction) {
            const itemCount = items.length;
            
            if (itemCount <= 1) return;
            
            // Update index with bounds checking
            currentIndex = (currentIndex + direction + itemCount) % itemCount;
            
            // Apply transform to move the carousel
            container.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            // Update visibility for better accessibility
            items.forEach((item, index) => {
                if (index === currentIndex) {
                    item.setAttribute('aria-hidden', 'false');
                    item.style.opacity = '1'; // Make current item fully visible
                } else {
                    item.setAttribute('aria-hidden', 'true');
                    item.style.opacity = '0.5'; // Dim other items
                }
            });
            
            // Update button states (optional)
            updateButtonStates();
        }
        
        function updateButtonStates() {
            // Enable/disable buttons based on position (optional)
            if (items.length <= 1) {
                if (prevBtn) prevBtn.style.display = 'none';
                if (nextBtn) nextBtn.style.display = 'none';
                return;
            } else {
                if (prevBtn) prevBtn.style.display = '';
                if (nextBtn) nextBtn.style.display = '';
            }
        }
        
        // Set up carousel controls
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => moveCarousel(-1));
            nextBtn.addEventListener('click', () => moveCarousel(1));
        }
        
        // Initialize carousel state
        if (items.length > 0) {
            items[0].setAttribute('aria-hidden', 'false');
            items[0].style.opacity = '1';
            for (let i = 1; i < items.length; i++) {
                items[i].setAttribute('aria-hidden', 'true');
                items[i].style.opacity = '0.5';
            }
        }
        
        // Update button states on initialization
        updateButtonStates();
        
        // Optional: Auto-rotation
        // Uncomment to enable carousel auto-rotation
        /*
        let carouselInterval;
        
        function startAutoRotation() {
            carouselInterval = setInterval(() => {
                moveCarousel(1); // Move forward
            }, 5000); // Change slide every 5 seconds
        }
        
        function stopAutoRotation() {
            clearInterval(carouselInterval);
        }
        
        // Start auto-rotation
        startAutoRotation();
        
        // Pause on hover
        container.addEventListener('mouseenter', stopAutoRotation);
        container.addEventListener('mouseleave', startAutoRotation);
        */
    }
});
