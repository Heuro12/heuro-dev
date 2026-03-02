const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?/~`';
const chars = matrixChars.split('');

const fontSize = 14;
const columns = canvas.width / fontSize;

const drops = [];
for (let i = 0; i < columns; i++) {
    drops[i] = Math.random() * -100;
}

function drawMatrix() {

    ctx.fillStyle = 'rgba(10, 14, 26, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ff9d';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {

        const text = chars[Math.floor(Math.random() * chars.length)];

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }

        drops[i]++;
    }
}

setInterval(drawMatrix, 50);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const newColumns = canvas.width / fontSize;
    drops.length = 0;
    for (let i = 0; i < newColumns; i++) {
        drops[i] = Math.random() * -100;
    }
});

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

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

const animatedElements = document.querySelectorAll(`
    .expertise-card,
    .project-card,
    .skill-category,
    .method-card,
    .arsenal-card,
    .area-card,
    .platform-card,
    .service-card,
    .devops-card,
    .backend-project,
    .showcase-card,
    .stack-category
`);

animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

const heroSubtitle = document.querySelector('.hero-subtitle');
if (heroSubtitle && window.innerWidth > 968) {
    const originalText = heroSubtitle.textContent;
    setTimeout(() => {
        typeWriter(heroSubtitle, originalText, 30);
    }, 500);
}

function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + (element.textContent.includes('%') ? '%' : '+');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + (element.textContent.includes('%') ? '%' : '+');
        }
    }, 16);
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target.querySelector('.stat-number');
            const certValue = entry.target.querySelector('.cert-value');

            if (statNumber) {
                const text = statNumber.textContent;
                const number = parseInt(text);
                if (!isNaN(number)) {
                    statNumber.textContent = '0' + (text.includes('%') ? '%' : text.includes('+') ? '+' : '');
                    setTimeout(() => {
                        animateCounter(statNumber, number);
                    }, 200);
                }
            }

            if (certValue && !certValue.classList.contains('cert-approved')) {
                const text = certValue.textContent;
                const number = parseInt(text);
                if (!isNaN(number)) {
                    certValue.textContent = '0' + (text.includes('%') ? '%' : '');
                    setTimeout(() => {
                        animateCounter(certValue, number);
                    }, 200);
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
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.3;
        heroImage.style.transform = `translateY(${parallax}px)`;
    });
}

const cursor = document.createElement('div');
cursor.classList.add('custom-cursor');
document.body.appendChild(cursor);

const cursorGlow = document.createElement('div');
cursorGlow.classList.add('cursor-glow');
document.body.appendChild(cursorGlow);

const style = document.createElement('style');
style.innerHTML = `
    .custom-cursor {
        width: 10px;
        height: 10px;
        background: var(--primary);
        border-radius: 50%;
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: difference;
        transition: transform 0.15s ease;
    }

    .cursor-glow {
        width: 40px;
        height: 40px;
        border: 2px solid var(--primary);
        border-radius: 50%;
        position: fixed;
        pointer-events: none;
        z-index: 9998;
        opacity: 0.3;
        transition: transform 0.3s ease;
    }

    .custom-cursor.active {
        transform: scale(1.5);
    }

    .cursor-glow.active {
        transform: scale(0.7);
    }
`;
document.head.appendChild(style);

if (window.innerWidth > 968) {
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 5 + 'px';
        cursor.style.top = e.clientY - 5 + 'px';

        cursorGlow.style.left = e.clientX - 20 + 'px';
        cursorGlow.style.top = e.clientY - 20 + 'px';
    });

    document.addEventListener('mousedown', () => {
        cursor.classList.add('active');
        cursorGlow.classList.add('active');
    });

    document.addEventListener('mouseup', () => {
        cursor.classList.remove('active');
        cursorGlow.classList.remove('active');
    });

    const interactiveElements = document.querySelectorAll('a, button, .btn, .nav-link, .project-link');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.5)';
            cursorGlow.style.transform = 'scale(1.5)';
        });

        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursorGlow.style.transform = 'scale(1)';
        });
    });
} else {
    cursor.style.display = 'none';
    cursorGlow.style.display = 'none';
}

const mobileMenuStyle = document.createElement('style');
mobileMenuStyle.innerHTML = `
    @media (max-width: 968px) {
        .nav-links {
            position: fixed;
            top: 70px;
            left: -100%;
            width: 100%;
            height: calc(100vh - 70px);
            background: rgba(10, 14, 26, 0.98);
            backdrop-filter: blur(20px);
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 2rem;
            transition: left 0.3s ease;
            z-index: 999;
        }

        .nav-links.active {
            left: 0;
        }

        .nav-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }

        .nav-toggle.active span:nth-child(2) {
            opacity: 0;
        }

        .nav-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }

        .nav-link {
            font-size: 1.5rem;
        }
    }
`;
document.head.appendChild(mobileMenuStyle);

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

console.log('%c🔥 HEURO PORTFOLIO LOADED 🔥', 'color: #00ff9d; font-size: 20px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,255,157,0.3);');
console.log('%c[+] Matrix Effect: Active', 'color: #00ff9d;');
console.log('%c[+] Animations: Initialized', 'color: #00ff9d;');
console.log('%c[+] Navigation: Ready', 'color: #00ff9d;');
console.log('%c[!] Contact: https://github.com/heuro12', 'color: #00d4ff; font-weight: bold;');
console.log('%c[!] Email: heurofk@gmail.com', 'color: #00d4ff; font-weight: bold;');