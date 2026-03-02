
(function() {
    'use strict';

    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info,
        debug: console.debug,
        clear: console.clear
    };

    const consoleProtection = () => {

        const protectedMethods = ['log', 'warn', 'error', 'info', 'debug'];

        protectedMethods.forEach(method => {
            const original = console[method];
            console[method] = function(...args) {

                const safeArgs = args.map(arg => {
                    if (typeof arg === 'string') {
                        return sanitizeString(arg);
                    }
                    return arg;
                });
                original.apply(console, safeArgs);
            };
        });

        let clearCount = 0;
        const originalClear = console.clear;
        console.clear = function() {
            clearCount++;
            if (clearCount > 10) {
                originalConsole.warn('Excessive console.clear detected - possible attack attempt');
                return;
            }
            originalClear.apply(console);
        };
    };

    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe/gi,
        /<object/gi,
        /<embed/gi,
        /eval\s*\(/gi,
        /expression\s*\(/gi,
        /vbscript:/gi,
        /data:text\/html/gi,
        /<svg.*onload/gi,
        /<img.*onerror/gi,
        /document\.cookie/gi,
        /document\.write/gi,
        /window\.location/gi,
        /\.innerHTML/gi
    ];

    function sanitizeString(str) {
        if (typeof str !== 'string') return str;

        for (let pattern of xssPatterns) {
            if (pattern.test(str)) {
                originalConsole.error(' XSS ATTACK DETECTED AND BLOCKED!');
                originalConsole.error('Attempted payload:', str.substring(0, 100) + '...');
                return '[BLOCKED - XSS DETECTED]';
            }
        }

        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\
    }

    const protectDOM = () => {

        const originalSetInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set;
        Object.defineProperty(Element.prototype, 'innerHTML', {
            set: function(value) {
                if (typeof value === 'string') {

                    for (let pattern of xssPatterns) {
                        if (pattern.test(value)) {
                            originalConsole.error(' XSS ATTACK BLOCKED via innerHTML!');
                            originalConsole.error('Target element:', this.tagName);
                            return;
                        }
                    }
                }
                originalSetInnerHTML.call(this, value);
            },
            get: Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').get
        });

        const originalInsertAdjacentHTML = Element.prototype.insertAdjacentHTML;
        Element.prototype.insertAdjacentHTML = function(position, text) {
            if (typeof text === 'string') {
                for (let pattern of xssPatterns) {
                    if (pattern.test(text)) {
                        originalConsole.error(' XSS ATTACK BLOCKED via insertAdjacentHTML!');
                        return;
                    }
                }
            }
            return originalInsertAdjacentHTML.call(this, position, text);
        };

        const originalWrite = document.write;
        document.write = function(content) {
            originalConsole.warn('️ document.write() call detected - potentially dangerous');
            if (typeof content === 'string') {
                for (let pattern of xssPatterns) {
                    if (pattern.test(content)) {
                        originalConsole.error(' XSS ATTACK BLOCKED via document.write!');
                        return;
                    }
                }
            }
            return originalWrite.call(this, content);
        };
    };

    const protectEval = () => {

        const originalEval = window.eval;
        window.eval = function(code) {
            originalConsole.error(' eval() execution blocked - security policy');
            originalConsole.error('Attempted code:', String(code).substring(0, 100));
            throw new Error('eval() is disabled for security reasons');
        };

        const OriginalFunction = Function;
        window.Function = function(...args) {
            originalConsole.error(' Function constructor blocked - security policy');
            throw new Error('Function constructor is disabled for security reasons');
        };
    };

    const protectCookies = () => {
        const originalCookie = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');

        Object.defineProperty(document, 'cookie', {
            get: function() {

                return originalCookie.get.call(document);
            },
            set: function(value) {

                if (typeof value === 'string') {

                    if (/<script|javascript:|onerror=/i.test(value)) {
                        originalConsole.error(' Suspicious cookie value blocked!');
                        return;
                    }

                    if (!value.includes('HttpOnly')) {
                        originalConsole.warn(' Cookie should use HttpOnly flag for security');
                    }
                    if (!value.includes('Secure') && window.location.protocol === 'https:') {
                        originalConsole.warn(' Cookie should use Secure flag on HTTPS');
                    }
                }
                originalCookie.set.call(document, value);
            }
        });
    };

    const protectURLs = () => {

        let lastLocation = window.location.href;

        const locationHandler = {
            get: function(target, prop) {
                return target[prop];
            },
            set: function(target, prop, value) {
                if (prop === 'href') {

                    if (typeof value === 'string' && /^javascript:/i.test(value)) {
                        originalConsole.error(' javascript: protocol blocked in URL!');
                        return false;
                    }

                    if (typeof value === 'string' && /^data:text\/html/i.test(value)) {
                        originalConsole.error(' data:text/html URL blocked!');
                        return false;
                    }
                }
                target[prop] = value;
                return true;
            }
        };
    };

    const protectEventHandlers = () => {
        const eventMethods = ['addEventListener', 'removeEventListener'];

        eventMethods.forEach(method => {
            const original = EventTarget.prototype[method];
            EventTarget.prototype[method] = function(type, listener, options) {

                if (typeof listener === 'string') {
                    originalConsole.error(' String event handlers blocked - use function instead');
                    return;
                }

                const wrappedListener = function(event) {
                    try {
                        return listener.call(this, event);
                    } catch (error) {
                        originalConsole.error('Event handler error:', error);
                    }
                };

                return original.call(this, type, wrappedListener, options);
            };
        });
    };

    const protectForms = () => {
        document.addEventListener('submit', function(e) {
            const form = e.target;
            if (form.tagName === 'FORM') {

                const inputs = form.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                    const value = input.value;

                    for (let pattern of xssPatterns) {
                        if (pattern.test(value)) {
                            e.preventDefault();
                            originalConsole.error(' XSS detected in form input!');
                            originalConsole.error('Field:', input.name || input.id);
                            alert('Security Error: Invalid input detected. Please remove special characters.');
                            return;
                        }
                    }

                    input.value = sanitizeString(value);
                });
            }
        }, true);
    };

    const protectClickjacking = () => {

        if (window.top !== window.self) {
            originalConsole.error(' Clickjacking attempt detected!');

            try {
                window.top.location = window.self.location;
            } catch (e) {

                document.body.innerHTML = '<h1 style="color: red;">Security Error: This page cannot be displayed in a frame.</h1>';
            }
        }
    };

    const enforceCSP = () => {

        let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');

        if (!cspMeta) {
            cspMeta = document.createElement('meta');
            cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
            cspMeta.setAttribute('content',
                "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline' https:
                "style-src 'self' 'unsafe-inline' https:
                "font-src 'self' https:
                "img-src 'self' data: https:; " +
                "connect-src 'self'; " +
                "frame-ancestors 'none'; " +
                "base-uri 'self'; " +
                "form-action 'self';"
            );
            document.head.insertBefore(cspMeta, document.head.firstChild);
        }
    };

    const checkResourceIntegrity = () => {

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.tagName === 'SCRIPT') {
                        const src = node.getAttribute('src');

                        if (src && !src.startsWith(window.location.origin)) {
                            if (!node.hasAttribute('integrity')) {
                                originalConsole.warn(' External script loaded without integrity check:', src);
                            }
                        }

                        if (!src && node.textContent) {
                            for (let pattern of xssPatterns) {
                                if (pattern.test(node.textContent)) {
                                    originalConsole.error(' Suspicious inline script blocked!');
                                    node.remove();
                                    return;
                                }
                            }
                        }
                    }
                });
            });
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    };

    const protectStorage = () => {

        const originalSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function(key, value) {

            const safeKey = sanitizeString(String(key));
            const safeValue = sanitizeString(String(value));

            for (let pattern of xssPatterns) {
                if (pattern.test(value)) {
                    originalConsole.error(' XSS attempt blocked in localStorage!');
                    return;
                }
            }

            return originalSetItem.call(this, safeKey, safeValue);
        };
    };

    const protectPostMessage = () => {
        window.addEventListener('message', function(event) {

            const trustedOrigins = [window.location.origin];

            if (!trustedOrigins.includes(event.origin)) {
                originalConsole.error(' Untrusted postMessage blocked from:', event.origin);
                return;
            }

            if (typeof event.data === 'string') {
                for (let pattern of xssPatterns) {
                    if (pattern.test(event.data)) {
                        originalConsole.error(' XSS detected in postMessage!');
                        return;
                    }
                }
            }
        }, false);
    };

    const initSecurity = () => {
        try {
            consoleProtection();
            protectDOM();
            protectEval();
            protectCookies();
            protectURLs();
            protectEventHandlers();
            protectForms();
            protectClickjacking();
            enforceCSP();
            checkResourceIntegrity();
            protectStorage();
            protectPostMessage();

            originalConsole.log('%c SECURITY LAYER ACTIVE', 'color: #00ff9d; font-size: 16px; font-weight: bold; background: #0a0e1a; padding: 10px; border: 2px solid #00ff9d;');
            originalConsole.log('%c[] XSS Protection: Active', 'color: #00ff9d;');
            originalConsole.log('%c[] Injection Protection: Active', 'color: #00ff9d;');
            originalConsole.log('%c[] Console Protection: Active', 'color: #00ff9d;');
            originalConsole.log('%c[] DOM Protection: Active', 'color: #00ff9d;');
            originalConsole.log('%c[] Cookie Protection: Active', 'color: #00ff9d;');
            originalConsole.log('%c[] Clickjacking Protection: Active', 'color: #00ff9d;');
            originalConsole.log('%c[] CSP Enforcement: Active', 'color: #00ff9d;');
            originalConsole.log('%c[!] Unauthorized access attempts will be logged and blocked', 'color: #ff006e; font-weight: bold;');

        } catch (error) {
            originalConsole.error('Security initialization error:', error);
        }
    };

    setInterval(() => {

        if (typeof console.log.toString().includes('native') === false) {
            originalConsole.warn(' Console tampering detected!');
        }

        const suspiciousGlobals = ['__proto__', 'constructor', 'prototype'];
        suspiciousGlobals.forEach(prop => {
            if (window[prop] && typeof window[prop] === 'function') {
                originalConsole.warn(' Suspicious global property:', prop);
            }
        });
    }, 5000);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSecurity);
    } else {
        initSecurity();
    }

})();

window.sanitizeInput = function(input) {
    if (typeof input !== 'string') return input;

    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\
};