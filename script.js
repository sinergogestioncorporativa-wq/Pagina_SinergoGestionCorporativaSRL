// Elementos del DOM
const menuToggle = document.getElementById("menuToggle");
const closeSidebar = document.getElementById("closeSidebar");
const sidebar = document.getElementById("mobileSidebar");
const overlay = document.getElementById("sidebarOverlay");
const sidebarLinks = document.querySelectorAll(".sidebar-nav a");
const contactBtn = document.getElementById("contactBtn");
const desktopNavLinks = document.querySelectorAll(".desktop-nav a");
const faqAccordion = document.getElementById("faqAccordion");
const casosTrack = document.getElementById("casosTrack");
const casosPrev = document.querySelector(".casos-prev");
const casosNext = document.querySelector(".casos-next");
const contactForm = document.getElementById("contactForm");

const casosCarouselState = {
    originalCount: 0,
    cloneCount: 0,
    step: 0,
    index: 0,
    isMoving: false,
    resizeTimer: null,
};

// Funciones de menú móvil
function openSidebar() {
    sidebar.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
    menuToggle.setAttribute("aria-expanded", "true");
    sidebar.setAttribute("aria-hidden", "false");
}

function closeSidebarMenu() {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "auto";
    menuToggle.setAttribute("aria-expanded", "false");
    sidebar.setAttribute("aria-hidden", "true");
}

// Event Listeners - Menú
menuToggle.addEventListener("click", openSidebar);
closeSidebar.addEventListener("click", closeSidebarMenu);
overlay.addEventListener("click", closeSidebarMenu);

sidebarLinks.forEach((link) => {
    link.addEventListener("click", closeSidebarMenu);
});

// Cerrar menú con Escape
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeSidebarMenu();
    }
});

// Actualizar enlace activo en navegación
function updateActiveNav() {
    const sections = document.querySelectorAll("main section");
    const navLinks = [...desktopNavLinks, ...document.querySelectorAll(".sidebar-nav a")];
    
    let current = "";
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 100) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${current}`) {
            link.classList.add("active");
        }
    });
}

window.addEventListener("scroll", updateActiveNav);

// Animación de entrada para títulos, imágenes y tarjetas
function animateOnScroll() {
    const revealSelectors = [
        ".hero-title",
        ".hero-tagline",
        ".hero-copy",
        ".hero-image",
        ".section-header .eyebrow",
        ".section-header h2",
        ".section-subtitle",
        ".nosotros-visual img",
        ".faq-media",
        ".testimonial-card",
        ".contact-panel",
        ".highlight-card",
        ".team-card"
    ];

    const elements = [...new Set(revealSelectors.flatMap((selector) => Array.from(document.querySelectorAll(selector))))];

    if (!elements.length) {
        return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
        elements.forEach((element) => {
            element.classList.add("reveal", "is-visible");
        });
        return;
    }

    const observerOptions = {
        threshold: 0.14,
        rootMargin: "0px 0px -6% 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    elements.forEach((element, index) => {
        element.classList.add("reveal");

        if (element.matches(".hero-image, .nosotros-visual img, .faq-media")) {
            element.classList.add("reveal-image");
        }

        element.style.transitionDelay = `${Math.min(index * 50, 360)}ms`;
        observer.observe(element);
    });
}

animateOnScroll();

// Botones de contacto
contactBtn.addEventListener("click", () => {
    document.getElementById("contacto").scrollIntoView({ behavior: "smooth" });
});

// Botones en el hero
const heroBtns = document.querySelectorAll(".hero-actions .btn");
heroBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        if (btn.classList.contains("btn-outline")) {
            document.getElementById("servicios").scrollIntoView({ behavior: "smooth" });
        } else {
            document.getElementById("contacto").scrollIntoView({ behavior: "smooth" });
        }
    });
});

// Botón CTA
const ctaBtn = document.querySelector(".cta .btn");
if (ctaBtn) {
    ctaBtn.addEventListener("click", () => {
        document.getElementById("contacto").scrollIntoView({ behavior: "smooth" });
    });
}

// Efecto de scroll suave en enlaces internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// FAQ tipo acordeón: solo una respuesta abierta a la vez
if (faqAccordion) {
    const faqItems = [...faqAccordion.querySelectorAll('.faq-item')];

    const closeItem = (item) => {
        const button = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        item.classList.remove('is-open');
        button.setAttribute('aria-expanded', 'false');
        answer.hidden = true;
    };

    const openItem = (item) => {
        const button = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        item.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
    };

    faqItems.forEach((item) => {
        const button = item.querySelector('.faq-question');

        button.addEventListener('click', () => {
            const isOpen = item.classList.contains('is-open');

            faqItems.forEach(closeItem);

            if (!isOpen) {
                openItem(item);
            }
        });
    });
}

if (casosTrack && casosPrev && casosNext) {
    const getVisibleCardsCount = () => (window.matchMedia("(max-width: 768px)").matches ? 1 : 3);

    const getOriginalCards = () => Array.from(casosTrack.querySelectorAll(".caso-card")).filter((card) => card.dataset.caseClone !== "true");

    const measureStep = () => {
        const firstCard = casosTrack.querySelector(".caso-card");
        if (!firstCard) {
            return 0;
        }

        const cardWidth = firstCard.getBoundingClientRect().width;
        const trackStyles = window.getComputedStyle(casosTrack);
        const gap = parseFloat(trackStyles.gap || "0") || 0;

        return cardWidth + gap;
    };

    const applyTransform = (animate = true) => {
        casosTrack.style.transition = animate ? "transform 0.28s ease" : "none";
        casosTrack.style.transform = `translate3d(${-casosCarouselState.index * casosCarouselState.step}px, 0, 0)`;
    };

    const refreshCasesNav = () => {
        casosPrev.disabled = false;
        casosNext.disabled = false;
    };

    const rebuildCasesCarousel = () => {
        const originals = getOriginalCards();

        casosTrack.querySelectorAll('[data-case-clone="true"]').forEach((card) => card.remove());

        if (!originals.length) {
            return;
        }

        casosCarouselState.originalCount = originals.length;
        casosCarouselState.cloneCount = Math.min(getVisibleCardsCount(), originals.length);

        const firstOriginal = originals[0];
        const prependClones = originals.slice(-casosCarouselState.cloneCount).map((card) => {
            const clone = card.cloneNode(true);
            clone.dataset.caseClone = "true";
            clone.setAttribute("aria-hidden", "true");
            clone.style.opacity = "1";
            clone.style.transform = "none";
            clone.style.transition = "opacity 0.6s ease, transform 0.6s ease";
            return clone;
        });

        const appendClones = originals.slice(0, casosCarouselState.cloneCount).map((card) => {
            const clone = card.cloneNode(true);
            clone.dataset.caseClone = "true";
            clone.setAttribute("aria-hidden", "true");
            clone.style.opacity = "1";
            clone.style.transform = "none";
            clone.style.transition = "opacity 0.6s ease, transform 0.6s ease";
            return clone;
        });

        prependClones.reverse().forEach((clone) => {
            casosTrack.insertBefore(clone, firstOriginal);
        });

        appendClones.forEach((clone) => {
            casosTrack.appendChild(clone);
        });

        casosCarouselState.step = measureStep();
        casosCarouselState.index = casosCarouselState.cloneCount;
        applyTransform(false);
        refreshCasesNav();
    };

    const normalizeCasesCarousel = () => {
        const minIndex = casosCarouselState.cloneCount;
        const maxIndex = casosCarouselState.cloneCount + casosCarouselState.originalCount - 1;

        if (casosCarouselState.index > maxIndex) {
            casosCarouselState.index = minIndex;
            applyTransform(false);
        } else if (casosCarouselState.index < minIndex) {
            casosCarouselState.index = maxIndex;
            applyTransform(false);
        }

        casosCarouselState.isMoving = false;
    };

    const moveCasesCarousel = (direction) => {
        if (casosCarouselState.isMoving || !casosCarouselState.step) {
            return;
        }

        casosCarouselState.isMoving = true;
        casosCarouselState.index += direction;
        applyTransform(true);

        window.setTimeout(normalizeCasesCarousel, 300);
    };

    window.scrollCases = (direction) => {
        moveCasesCarousel(direction);
    };

    casosPrev.addEventListener("click", () => {
        moveCasesCarousel(-1);
    });

    casosNext.addEventListener("click", () => {
        moveCasesCarousel(1);
    });

    rebuildCasesCarousel();

    window.addEventListener("resize", () => {
        window.clearTimeout(casosCarouselState.resizeTimer);
        casosCarouselState.resizeTimer = window.setTimeout(() => {
            rebuildCasesCarousel();
        }, 120);
    });
}

// Carrusel para 'Nuestros Servicios' (misma lógica que 'casos')
const serviciosTrack = document.getElementById("serviciosTrack");
const serviciosPrev = document.querySelector(".servicios-prev");
const serviciosNext = document.querySelector(".servicios-next");

const serviciosCarouselState = {
    originalCount: 0,
    cloneCount: 0,
    step: 0,
    index: 0,
    isMoving: false,
    resizeTimer: null,
    autoplayInterval: 5000,
    autoplayTimer: null,
};

if (serviciosTrack && serviciosPrev && serviciosNext) {
    const getVisibleCardsCountS = () => (window.matchMedia("(max-width: 768px)").matches ? 1 : 3);

    const getOriginalCardsS = () => Array.from(serviciosTrack.querySelectorAll(".service-card")).filter((card) => card.dataset.serviceClone !== "true");

    const measureStepS = () => {
        const firstCard = serviciosTrack.querySelector(".service-card");
        if (!firstCard) return 0;
        const cardWidth = firstCard.getBoundingClientRect().width;
        const trackStyles = window.getComputedStyle(serviciosTrack);
        const gap = parseFloat(trackStyles.gap || "0") || 0;
        return cardWidth + gap;
    };

    const applyTransformS = (animate = true) => {
        serviciosTrack.style.transition = animate ? "transform 0.28s ease" : "none";
        serviciosTrack.style.transform = `translate3d(${-serviciosCarouselState.index * serviciosCarouselState.step}px, 0, 0)`;
    };

    const refreshServiciosNav = () => {
        serviciosPrev.disabled = false;
        serviciosNext.disabled = false;
    };

    const rebuildServiciosCarousel = () => {
        const originals = getOriginalCardsS();

        serviciosTrack.querySelectorAll('[data-service-clone="true"]').forEach((card) => card.remove());

        if (!originals.length) return;

        serviciosCarouselState.originalCount = originals.length;
        serviciosCarouselState.cloneCount = Math.min(getVisibleCardsCountS(), originals.length);

        const firstOriginal = originals[0];
        const prependClones = originals.slice(-serviciosCarouselState.cloneCount).map((card) => {
            const clone = card.cloneNode(true);
            clone.dataset.serviceClone = "true";
            clone.setAttribute("aria-hidden", "true");
            clone.style.opacity = "1";
            clone.style.transform = "none";
            clone.style.transition = "opacity 0.6s ease, transform 0.6s ease";
            return clone;
        });

        const appendClones = originals.slice(0, serviciosCarouselState.cloneCount).map((card) => {
            const clone = card.cloneNode(true);
            clone.dataset.serviceClone = "true";
            clone.setAttribute("aria-hidden", "true");
            clone.style.opacity = "1";
            clone.style.transform = "none";
            clone.style.transition = "opacity 0.6s ease, transform 0.6s ease";
            return clone;
        });

        prependClones.reverse().forEach((clone) => {
            serviciosTrack.insertBefore(clone, firstOriginal);
        });

        appendClones.forEach((clone) => {
            serviciosTrack.appendChild(clone);
        });

        serviciosCarouselState.step = measureStepS();
        serviciosCarouselState.index = serviciosCarouselState.cloneCount;
        applyTransformS(false);
        refreshServiciosNav();
    };

    const normalizeServiciosCarousel = () => {
        const minIndex = serviciosCarouselState.cloneCount;
        const maxIndex = serviciosCarouselState.cloneCount + serviciosCarouselState.originalCount - 1;

        if (serviciosCarouselState.index > maxIndex) {
            serviciosCarouselState.index = minIndex;
            applyTransformS(false);
        } else if (serviciosCarouselState.index < minIndex) {
            serviciosCarouselState.index = maxIndex;
            applyTransformS(false);
        }

        serviciosCarouselState.isMoving = false;
    };

    const moveServiciosCarousel = (direction) => {
        if (serviciosCarouselState.isMoving || !serviciosCarouselState.step) return;
        serviciosCarouselState.isMoving = true;
        serviciosCarouselState.index += direction;
        applyTransformS(true);
        window.setTimeout(normalizeServiciosCarousel, 300);
    };

    window.scrollServicios = (direction) => {
        moveServiciosCarousel(direction);
    };

    serviciosPrev.addEventListener("click", () => moveServiciosCarousel(-1));
    serviciosNext.addEventListener("click", () => moveServiciosCarousel(1));

    rebuildServiciosCarousel();

    // Autoplay: avanza cada 5 segundos. Pausa en hover/visibilidad.
    const startServiciosAutoplay = () => {
        stopServiciosAutoplay();
        serviciosCarouselState.autoplayTimer = setInterval(() => {
            if (!document.hidden) moveServiciosCarousel(1);
        }, serviciosCarouselState.autoplayInterval);
    };

    const stopServiciosAutoplay = () => {
        if (serviciosCarouselState.autoplayTimer) {
            clearInterval(serviciosCarouselState.autoplayTimer);
            serviciosCarouselState.autoplayTimer = null;
        }
    };

    const serviciosContainer = document.querySelector('.servicios-carousel');
    if (serviciosContainer) {
        serviciosContainer.addEventListener('mouseenter', stopServiciosAutoplay);
        serviciosContainer.addEventListener('mouseleave', startServiciosAutoplay);
        // on touch interactions stop briefly
        serviciosContainer.addEventListener('touchstart', stopServiciosAutoplay, {passive: true});
        serviciosContainer.addEventListener('touchend', () => setTimeout(startServiciosAutoplay, 1200));
    }

    // Reiniciar autoplay tras interacción manual
    serviciosPrev.addEventListener('click', () => { stopServiciosAutoplay(); setTimeout(startServiciosAutoplay, serviciosCarouselState.autoplayInterval); });
    serviciosNext.addEventListener('click', () => { stopServiciosAutoplay(); setTimeout(startServiciosAutoplay, serviciosCarouselState.autoplayInterval); });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopServiciosAutoplay(); else startServiciosAutoplay();
    });

    // Iniciar autoplay
    startServiciosAutoplay();

    window.addEventListener("resize", () => {
        window.clearTimeout(serviciosCarouselState.resizeTimer);
        serviciosCarouselState.resizeTimer = window.setTimeout(() => {
            rebuildServiciosCarousel();
        }, 120);
    });
}

if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const empresa = document.getElementById("empresa").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const servicio = document.getElementById("servicio").value.trim();
        const mensaje = document.getElementById("mensaje").value.trim();

        const texto = [
            "Hola, quiero solicitar una asesoría con SINERGO.",
            `Nombre: ${nombre}`,
            `Empresa: ${empresa}`,
            `WhatsApp: ${telefono}`,
            `Servicio de interés: ${servicio}`,
            `Necesidad: ${mensaje}`,
        ].join("\n");

        const whatsappUrl = `https://wa.me/59168440201?text=${encodeURIComponent(texto)}`;
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    });
}

// Inicialización
console.log("Consultora Empresarial - Sitio Web Cargado");

// Navbar sticky: compactar al hacer scroll, mantener siempre visible (fijo)
(function () {
    const header = document.querySelector('.header');
    if (!header) return;

    const onScrollSimple = () => {
        const sc = window.scrollY || document.documentElement.scrollTop;
        if (sc > 60) header.classList.add('is-stuck'); else header.classList.remove('is-stuck');
        // asegurar visible
        header.classList.remove('is-hidden');
    };

    window.addEventListener('scroll', onScrollSimple, { passive: true });
    document.addEventListener('DOMContentLoaded', onScrollSimple);
    onScrollSimple();
})();
