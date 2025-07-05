document.addEventListener('DOMContentLoaded', function() {

    // --- SCRIPT INITIALIZATION FOR HEADER ---
    const initializeHeaderScripts = () => {
        const hamburger = document.querySelector('.hamburger-menu');
        const navMenu = document.querySelector('.navbar-menu');
        const overlay = document.querySelector('.mobile-menu-overlay'); // Select the new overlay

        if (hamburger && navMenu && overlay) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
                overlay.classList.toggle('active'); // Toggle the overlay's active class
            });
        }

        // Active nav link highlighting
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
    
    // --- SCRIPT INITIALIZATION FOR FOOTER ---
    const initializeFooterScripts = () => {
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => handleFormSubmit(e, 'http://localhost:3000/api/subscribe'));
        }
    };

    // --- DYNAMIC COMPONENT LOADING ---
    const loadComponent = (selector, url, callback) => {
        const element = document.querySelector(selector);
        if (element) {
            fetch(url)
                .then(response => {
                    if (!response.ok) throw new Error(`Component not found: ${url}`);
                    return response.text();
                })
                .then(data => {
                    element.innerHTML = data;
                    if (callback) {
                        callback();
                    }
                })
                .catch(error => console.error(`Error loading component ${url}:`, error));
        }
    };

    // Load header and footer and initialize their specific scripts
    loadComponent('header.main-header', 'header.html', initializeHeaderScripts);
    loadComponent('footer.main-footer', 'footer.html', initializeFooterScripts);


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

    // --- ANIMATED NUMBER COUNTERS ---
    const statsSection = document.querySelector('.impact-stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries, observer) => {
            if (entries[0].isIntersecting) {
                const counters = entries[0].target.querySelectorAll('.impact-number');
                counters.forEach(counter => {
                    const target = +counter.getAttribute('data-target');
                    let current = 0;
                    const increment = () => {
                        const step = target / 100; // Control animation speed
                        if (current < target) {
                            current += step;
                            counter.innerText = Math.ceil(current).toLocaleString();
                            requestAnimationFrame(increment);
                        } else {
                            counter.innerText = target.toLocaleString();
                        }
                    };
                    increment();
                });
                observer.unobserve(statsSection);
            }
        }, { threshold: 0.8 });
        statsObserver.observe(statsSection);
    }
    
    // --- ASYNCHRONOUS FORM SUBMISSION HANDLER ---
    const handleFormSubmit = async (event, endpoint) => {
        event.preventDefault();
        const form = event.target;
        // More robustly find the status element using a data attribute or specific ID
        const statusElement = document.querySelector(`[data-form-status-for="${form.id}"]`);

        if (!statusElement) {
            console.error('Form status element not found for form:', form.id);
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
            if (!response.ok) throw new Error(result.message || 'An unexpected error occurred.');

            statusElement.className = 'success';
            statusElement.textContent = result.message;
            form.reset();

        } catch (error) {
            statusElement.className = 'error';
            statusElement.textContent = error.message || 'Unable to connect to the server.';
        } finally {
            setTimeout(() => {
                if (statusElement) statusElement.style.display = 'none';
            }, 6000);
        }
    };
    
    // Set up contact form listener immediately (as it's not in a loaded component)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => handleFormSubmit(e, 'http://localhost:3000/api/contact'));
    }
});