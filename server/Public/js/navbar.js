document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navbarRight = document.querySelector('.navbar-right');
    const dropdowns = document.querySelectorAll('.dropdown');
    
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburger.classList.toggle('active');
        navbarRight.classList.toggle('active');
        document.body.style.overflow = navbarRight.classList.contains('active') ? 'hidden' : '';
    });

    // Handle dropdowns in mobile view
    dropdowns.forEach(dropdown => {
        const dropbtn = dropdown.querySelector('.dropbtn');
        const dropdownContent = dropdown.querySelector('.dropdown-content');
        
        dropbtn.addEventListener('click', (e) => {
            // Only handle click differently on mobile
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();
                dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navbarRight.contains(e.target)) {
            hamburger.classList.remove('active');
            navbarRight.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Close menu when clicking on a link (except dropdown buttons)
    const navLinks = document.querySelectorAll('.navbar-right a:not(.dropbtn)');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navbarRight.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            hamburger.classList.remove('active');
            navbarRight.classList.remove('active');
            document.body.style.overflow = '';
            // Reset any mobile-specific dropdown states
            document.querySelectorAll('.dropdown-content').forEach(content => {
                content.style.display = '';
            });
        }
    });
});