// Clock functionality for footer
setInterval(() => {
    const clockEl = document.getElementById('clock');
    if(clockEl) {
        clockEl.innerText = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
}, 1000);

document.addEventListener("DOMContentLoaded", () => {
    // GSAP & Plugins
    gsap.registerPlugin(ScrollTrigger);

    // i18n Multi-Language Logic
    let currentLang = localStorage.getItem('dks_lang') || 'en';
    
    function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('dks_lang', lang);
        
        // Update active state on buttons
        document.querySelectorAll('.lang-toggle').forEach(btn => {
            if(btn.getAttribute('data-lang') === lang) {
                btn.classList.add('text-dks-black');
                btn.classList.remove('text-dks-gray');
            } else {
                btn.classList.add('text-dks-gray');
                btn.classList.remove('text-dks-black');
            }
        });

        // Translate text
        const dict = translations[lang];
        if(!dict) return;
        
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if(dict[key]) {
                el.innerHTML = dict[key];
            }
        });
        
        // Re-initialize SplitType for scrub text
        if (typeof initScrubText === 'function') {
            // Need a slight timeout to ensure DOM update is rendered before SplitType calculates sizes
            setTimeout(initScrubText, 10);
        }
    }

    // Init language
    if(typeof translations !== 'undefined') {
        setLanguage(currentLang);
    }
    
    // Bind click events
    document.querySelectorAll('.lang-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.target.getAttribute('data-lang');
            setLanguage(lang);
        });
    });

    // Init Icons
    lucide.createIcons();
    
    // Lenis Smooth Scroll Setup
    const lenis = new Lenis({
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
    });
    lenis.on('scroll', ScrollTrigger.update);
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Anchor Link Smooth Scroll Interception for Lenis
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            if(target !== '#') {
                lenis.scrollTo(target, {
                    offset: -80, // slightly offset for the sticky nav
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });

    // Mobile Menu Logic
    const burgerBtn = document.getElementById('burger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    let isMenuOpen = false;

    if (burgerBtn && mobileMenu) {
        burgerBtn.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            if(isMenuOpen) {
                mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
                burgerBtn.innerHTML = '<i data-lucide="x" class="w-6 h-6"></i>';
                lenis.stop();
            } else {
                mobileMenu.classList.add('opacity-0', 'pointer-events-none');
                burgerBtn.innerHTML = '<i data-lucide="menu" class="w-6 h-6"></i>';
                lenis.start();
            }
            lucide.createIcons();
        });

        document.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                isMenuOpen = false;
                mobileMenu.classList.add('opacity-0', 'pointer-events-none');
                burgerBtn.innerHTML = '<i data-lucide="menu" class="w-6 h-6"></i>';
                lucide.createIcons();
                lenis.start();
            });
        });
    }

    // 1. Elegant Preloader Sequence
    const tlLoader = gsap.timeline({
        onComplete: () => {
            const preloader = document.getElementById('preloader');
            if(preloader) preloader.style.display = 'none';
            initHeroAnimations();
        }
    });

    // Progress bar simulation
    let percObj = { val: 0 };
    tlLoader.to('#preloader-text', { y: 0, opacity: 1, duration: 1, ease: 'power4.out' })
            .to(percObj, {
                val: 100, duration: 1.5, ease: 'power2.inOut',
                onUpdate: () => {
                    const percEl = document.getElementById('preloader-perc');
                    const barEl = document.getElementById('preloader-bar');
                    if(percEl) percEl.innerText = Math.floor(percObj.val) + '%';
                    if(barEl) barEl.style.width = Math.floor(percObj.val) + '%';
                }
            }, "-=0.5")
            .to('#preloader', { yPercent: -100, duration: 1.2, ease: 'power4.inOut', delay: 0.2 });

    // 2. Hero Animations
    function initHeroAnimations() {
        // Split title lines
        gsap.to('.hero-title-line', {
            y: 0,
            duration: 1.2,
            stagger: 0.1,
            ease: 'power4.out',
            delay: 0.1
        });
        gsap.to('.hero-reveal', {
            y: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.2,
            ease: 'power3.out',
            delay: 0.4
        });
    }

    // 3. Scroll Progress Indicator
    gsap.to('#scroll-progress', {
        width: '100%',
        ease: 'none',
        scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.1
        }
    });

    // 4. Scrub Text Reveal (About Section)
    let scrubSplitText = null;
    let scrubScrollTrigger = null;

    window.initScrubText = function() {
        const scrubTextEl = document.querySelector('#scrub-text');
        if (scrubTextEl) {
            // Kill existing trigger if exists
            if (scrubScrollTrigger) scrubScrollTrigger.kill();
            if (scrubSplitText) scrubSplitText.revert();
            
            scrubSplitText = new SplitType('#scrub-text', { types: 'words' });
            
            const anim = gsap.fromTo(scrubSplitText.words, 
                { opacity: 0.1 },
                {
                    opacity: 1,
                    stagger: 0.05,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '#about',
                        start: 'top 60%',
                        end: 'center 40%',
                        scrub: true
                    }
                }
            );
            scrubScrollTrigger = anim.scrollTrigger;
        }
    };
    
    // Initial call will be handled by setLanguage on load, or we can just call it here:
    if(typeof translations === 'undefined') {
        initScrubText();
    }

    // 5. Portfolio Parallax & Reveal
    gsap.utils.toArray('.project-wrap').forEach(project => {
        const img = project.querySelector('.parallax-img');
        
        // Image mask reveal
        gsap.fromTo(project.querySelector('.overflow-hidden'), 
            { clipPath: 'inset(20% 10% 20% 10% round 24px)' },
            { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.5, ease: 'power3.out',
              scrollTrigger: {
                  trigger: project,
                  start: 'top 85%',
              }
            }
        );

        // Internal parallax
        if (img) {
            gsap.to(img, {
                yPercent: -20,
                ease: 'none',
                scrollTrigger: {
                    trigger: project,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        }
    });

    // View More Projects Toggle Logic
    const viewMoreBtn = document.getElementById('view-more-btn');
    if (viewMoreBtn) {
        let isExpanded = false;
        const hiddenProjects = document.querySelectorAll('.hidden-project');
        const viewMoreIcon = document.getElementById('view-more-icon');
        const viewMoreText = viewMoreBtn.querySelector('span');

        viewMoreBtn.addEventListener('click', () => {
            isExpanded = !isExpanded;
            
            hiddenProjects.forEach(project => {
                if (isExpanded) {
                    project.classList.remove('hidden');
                    // Force a layout repaint before starting transition
                    project.offsetHeight;
                    project.classList.remove('opacity-0', 'translate-y-10');
                } else {
                    project.classList.add('opacity-0', 'translate-y-10');
                    setTimeout(() => {
                        if (!isExpanded) project.classList.add('hidden');
                    }, 700);
                }
            });

            // Update button UI & translation attributes
            if (isExpanded) {
                viewMoreText.setAttribute('data-i18n', 'works_view_less');
                if (viewMoreIcon) viewMoreIcon.style.transform = 'rotate(180deg)';
            } else {
                viewMoreText.setAttribute('data-i18n', 'works_view_more');
                if (viewMoreIcon) viewMoreIcon.style.transform = 'rotate(0deg)';
                // Scroll back to works section using Lenis smooth scroll
                const worksSection = document.getElementById('works');
                if (worksSection && typeof lenis !== 'undefined') {
                    lenis.scrollTo(worksSection, { offset: -80, duration: 1.5 });
                }
            }

            // Immediately set the inner HTML using standard currentLang dictionary
            if (typeof translations !== 'undefined' && translations[currentLang]) {
                const key = viewMoreText.getAttribute('data-i18n');
                viewMoreText.innerHTML = translations[currentLang][key] || key;
            }

            // Refresh ScrollTrigger to adjust trigger heights
            setTimeout(() => { ScrollTrigger.refresh(); }, 100);
            setTimeout(() => { ScrollTrigger.refresh(); }, 750);
        });
    }

    // 6. Services Interactive Hover Map
    const serviceRows = document.querySelectorAll('.service-row');
    const hoverImgWrap = document.querySelector('.service-img-wrap');
    const hoverImg = document.getElementById('hover-img');

    if(window.innerWidth > 768 && document.getElementById('service-list')) {
        document.getElementById('service-list').addEventListener('mousemove', (e) => {
            gsap.to(hoverImgWrap, {
                x: e.clientX - 150,
                y: e.clientY - document.getElementById('service-list').getBoundingClientRect().top - 100,
                duration: 0.4,
                ease: 'power3.out'
            });
        });

        serviceRows.forEach(row => {
            row.addEventListener('mouseenter', (e) => {
                const imgUrl = row.getAttribute('data-img');
                if(hoverImg) hoverImg.src = imgUrl;
                gsap.to(hoverImgWrap, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.5)' });
            });
            row.addEventListener('mouseleave', () => {
                gsap.to(hoverImgWrap, { opacity: 0, scale: 0.8, duration: 0.3, ease: 'power2.in' });
            });
        });
    }

    // 7. Counter Animations
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        let target = parseInt(counter.getAttribute('data-target'));
        let obj = { val: 0 };
        ScrollTrigger.create({
            trigger: '#metrics',
            start: 'top 70%',
            onEnter: () => {
                gsap.to(obj, {
                    val: target,
                    duration: 2.5,
                    ease: 'power3.out',
                    onUpdate: () => { counter.innerText = Math.floor(obj.val); }
                });
            },
            once: true
        });
    });

    // 8. Process Cards Stagger Reveal
    gsap.to('.process-card', {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '#process',
            start: 'top 60%'
        }
    });

    // 9. Magnetic Button Micro-Interaction
    const magneticWraps = document.querySelectorAll('.magnetic-wrap');
    magneticWraps.forEach(wrap => {
        const content = wrap.querySelector('.magnetic-content');
        if(!content) return;
        
        wrap.addEventListener('mousemove', (e) => {
            const rect = wrap.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const distanceX = e.clientX - centerX;
            const distanceY = e.clientY - centerY;
            
            gsap.to(content, {
                x: distanceX * 0.3,
                y: distanceY * 0.3,
                duration: 0.4,
                ease: 'power3.out'
            });
        });

        wrap.addEventListener('mouseleave', () => {
            gsap.to(content, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
        });
    });

    // Pricing Toggle Logic
    const toggleBtns = document.querySelectorAll('.pricing-toggle-btn');
    const pricingSlider = document.getElementById('pricing-slider');
    const priceVals = document.querySelectorAll('.price-val');
    const titleVals = document.querySelectorAll('.title-val');

    function updateSlider() {
        const activeBtn = document.querySelector('.pricing-toggle-btn.text-dks-white');
        if(activeBtn && pricingSlider) {
            pricingSlider.style.width = activeBtn.offsetWidth + 'px';
            const parentRect = activeBtn.parentElement.getBoundingClientRect();
            const btnRect = activeBtn.getBoundingClientRect();
            pricingSlider.style.transform = `translateX(${btnRect.left - parentRect.left - 6}px)`;
        }
    }
    
    // Init slider
    if(pricingSlider && toggleBtns.length > 0) {
        pricingSlider.style.transition = 'none';
        updateSlider();
        setTimeout(() => pricingSlider.style.transition = 'all 0.5s cubic-bezier(0.86, 0, 0.07, 1)', 50);
        window.addEventListener('resize', updateSlider);
    }

    toggleBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            // Update text colors
            toggleBtns.forEach(b => {
                b.classList.remove('text-dks-white');
                b.classList.add('text-dks-gray', 'hover:text-dks-black');
            });
            btn.classList.add('text-dks-white');
            btn.classList.remove('text-dks-gray', 'hover:text-dks-black');

            updateSlider();

            const type = btn.getAttribute('data-type');
            const allLists = document.querySelectorAll('.benefit-list');
            const descVals = document.querySelectorAll('.desc-val');

            // Animate values, lists, and descriptions
            gsap.to([...priceVals, ...titleVals, ...allLists, ...descVals], {
                opacity: 0,
                y: -10,
                duration: 0.2,
                onComplete: () => {
                    priceVals.forEach(p => {
                        const val = p.getAttribute('data-' + type);
                        if(val) p.innerText = val;
                    });
                    titleVals.forEach(t => {
                        const val = t.getAttribute('data-' + type);
                        if(val) t.innerText = val;
                    });
                    
                    // Dynamic description update based on language and type
                    descVals.forEach(d => {
                        const tier = d.getAttribute('data-tier');
                        const key = `price_tier_${tier}_desc_${type}`;
                        if (typeof translations !== 'undefined' && translations[currentLang] && translations[currentLang][key]) {
                            d.innerHTML = translations[currentLang][key];
                            d.setAttribute('data-i18n', key);
                        }
                    });
                    
                    allLists.forEach(list => list.classList.add('hidden'));
                    const activeLists = document.querySelectorAll(`.benefit-list[data-for="${type}"]`);
                    activeLists.forEach(list => list.classList.remove('hidden'));

                    gsap.fromTo([...priceVals, ...titleVals, ...activeLists, ...descVals], 
                        { opacity: 0, y: 10 },
                        { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.5)' }
                    );
                }
            });
        });
    });

    // FAQ Accordion
    document.querySelectorAll('.faq-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const content = btn.nextElementSibling;
            const icon = btn.querySelector('.faq-icon');
            const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';

            // Close all
            document.querySelectorAll('.faq-content').forEach(c => c.style.maxHeight = '0px');
            document.querySelectorAll('.faq-icon').forEach(i => i.style.transform = 'rotate(0deg)');

            if (!isOpen) {
                content.style.maxHeight = content.scrollHeight + 'px';
                if(icon) icon.style.transform = 'rotate(45deg)';
            }
        });
    });

    // 10. Navbar Transparency on Scroll
    ScrollTrigger.create({
        start: 'top -50px',
        onEnter: () => {
            gsap.to('#navbar', { backgroundColor: 'rgba(255,255,255,0.9)', duration: 0.3 });
        },
        onLeaveBack: () => {
            gsap.to('#navbar', { backgroundColor: 'rgba(255,255,255,0)', duration: 0.3 });
        }
    });
    
    // 11. Subtle Soft Parallax for background abstract elements
    gsap.utils.toArray('.hero-parallax').forEach(shape => {
        const speed = parseFloat(shape.dataset.speed);
        gsap.to(shape, {
            y: (i, el) => (1 - speed) * ScrollTrigger.maxScroll(window) * speed,
            ease: "none",
            scrollTrigger: {
                trigger: "#hero",
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });
    });

});
