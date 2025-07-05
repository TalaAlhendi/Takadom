document.addEventListener('DOMContentLoaded', function() {

    // --- DYNAMIC COMPONENT LOADING (Header & Footer) ---
    const loadComponent = (selector, url, callback) => {
        const element = document.querySelector(selector);
        if (element) {
            fetch(url)
                .then(response => response.ok ? response.text() : Promise.reject('Component not found.'))
                .then(data => {
                    element.innerHTML = data;
                    // Run any callback function after the component is loaded
                    if (callback) {
                        callback();
                    }
                })
                .catch(error => console.error(`Error loading component ${url}:`, error));
        }
    };
    
    // --- SETUP MOBILE MENU ---
    const setupMobileMenu = () => {
        const hamburger = document.querySelector('.hamburger-menu');
        const navMenu = document.querySelector('.navbar-menu');
        const overlay = document.querySelector('.mobile-menu-overlay');
        const body = document.body;

        if (hamburger && navMenu && overlay) {
            const openMenu = () => {
                hamburger.classList.add('active');
                navMenu.classList.add('active');
                overlay.classList.add('active');
                body.classList.add('mobile-menu-open');
            };
            
            const closeMenu = () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                overlay.classList.remove('active');
                body.classList.remove('mobile-menu-open');
            };

            hamburger.addEventListener('click', () => {
                const isOpen = hamburger.classList.contains('active');
                if (isOpen) {
                    closeMenu();
                } else {
                    openMenu();
                }
            });

            overlay.addEventListener('click', closeMenu);
        }
    };
    
    // --- ACTIVE NAV LINK HIGHLIGHTING ---
    const setActiveNavLink = () => {
        const navLinks = document.querySelectorAll('.nav-link'); 
        const currentLocation = window.location.pathname.split("/").pop() || 'index.html';
        
        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href').split("/").pop();
            if (linkPath === currentLocation) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    // Load header, and ONLY AFTER it's loaded, setup the menu and active links
    loadComponent('header.main-header', 'header.html', () => {
        setupMobileMenu();
        setActiveNavLink();
    });

    // Load footer
    loadComponent('footer.main-footer', 'footer.html');


    // --- SCROLL-TRIGGERED FADE-IN ANIMATIONS ---
    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.scroll-animate').forEach(el => {
        scrollObserver.observe(el);
    });

    // --- START: ANIMATED NUMBER COUNTERS WITH PROGRESS CIRCLE ---
    const statsSection = document.querySelector('.impact-stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries, observer) => {
            if (entries[0].isIntersecting) {
                const counters = entries[0].target.querySelectorAll('.impact-card');

                counters.forEach(card => {
                    const numberEl = card.querySelector('.impact-number');
                    const progressCircle = card.querySelector('.progress-ring__circle');
                    const radius = progressCircle.r.baseVal.value;
                    const circumference = 2 * Math.PI * radius;
                    const target = +numberEl.getAttribute('data-target');
                    
                    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
                    progressCircle.style.strokeDashoffset = circumference;

                    let startTime = null;
                    const animationDuration = 2500;

                    function animate(currentTime) {
                        if (startTime === null) startTime = currentTime;
                        const elapsedTime = currentTime - startTime;
                        const progress = Math.min(elapsedTime / animationDuration, 1);
                        
                        const currentNumber = Math.floor(progress * target);
                        numberEl.innerText = currentNumber.toLocaleString();
                        
                        const offset = circumference - progress * circumference;
                        progressCircle.style.strokeDashoffset = offset;

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            numberEl.innerText = target.toLocaleString();
                            progressCircle.style.strokeDashoffset = 0;
                        }
                    }
                    requestAnimationFrame(animate);
                });
                observer.unobserve(statsSection);
            }
        }, { threshold: 0.6 });
        statsObserver.observe(statsSection);
    }
    // --- END: ANIMATED NUMBER COUNTERS WITH PROGRESS CIRCLE ---

    // --- ASYNCHRONOUS FORM SUBMISSION ---
    setTimeout(() => {
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => handleFormSubmit(e, 'http://localhost:3000/api/subscribe'));
        }
    }, 500);

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => handleFormSubmit(e, 'http://localhost:3000/api/contact'));
    }

    const handleFormSubmit = async (event, endpoint) => {
        event.preventDefault();
        const form = event.target;
        const statusElement = form.nextElementSibling;

        if (!statusElement || !(statusElement.id.includes('form-status'))) {
            console.error('Form status element not found immediately after the form.');
            return;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        statusElement.className = 'info';
        statusElement.textContent = 'Please wait...';
        statusElement.style.display = 'block';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'An unexpected error occurred.');
            }

            statusElement.className = 'success';
            statusElement.textContent = result.message;
            form.reset();

        } catch (error) {
            statusElement.className = 'error';
            statusElement.textContent = error.message || 'Unable to connect to the server. Please try again.';
        } finally {
            setTimeout(() => {
                if (statusElement) {
                    statusElement.style.display = 'none';
                }
            }, 6000);
        }
    };
});