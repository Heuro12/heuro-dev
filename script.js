const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
}

const navLinkItems = document.querySelectorAll('.nav-link');
navLinkItems.forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 968) {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        if (href !== '#' && href !== '') {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

const revealTargets = document.querySelectorAll(`
    .expertise-card,
    .project-card,
    .skill-category,
    .service-card,
    .devops-card,
    .backend-project,
    .showcase-card,
    .stack-category
`);

revealTargets.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    revealObserver.observe(el);
});

const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
        navbar.style.boxShadow = '0 4px 20px rgba(34, 31, 28, 0.08)';
    } else {
        navbar.style.boxShadow = 'none';
    }
});

function animateCounter(element, target, duration = 1500) {
    const suffix = element.textContent.includes('%') ? '%' : '+';
    const start = performance.now();

    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const current = Math.floor(progress * target);
        element.textContent = current + suffix;
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target.querySelector('.stat-number');
            const certValue = entry.target.querySelector('.cert-value');

            if (statNumber) {
                const number = parseInt(statNumber.textContent);
                if (!isNaN(number)) {
                    animateCounter(statNumber, number);
                }
            }

            if (certValue && !certValue.classList.contains('cert-approved')) {
                const number = parseInt(certValue.textContent);
                if (!isNaN(number)) {
                    animateCounter(certValue, number);
                }
            }

            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.hero-stats, .cert-stats').forEach(el => {
    statsObserver.observe(el);
});

const heroImage = document.querySelector('.hero-image');
if (heroImage && window.innerWidth > 968) {
    window.addEventListener('scroll', () => {
        heroImage.style.transform = `translateY(${window.pageYOffset * 0.15}px)`;
    });
}

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('*').forEach(el => {
        el.style.animation = 'none';
        el.style.transition = 'none';
    });
}

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}
