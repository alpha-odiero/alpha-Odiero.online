document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.querySelector('.skills-carousel-wrapper');
    if (!wrapper) return;

    const skillData = [
        {
            category: 'Frontend',
            skills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'HTML5', 'CSS3', 'Responsive Design', 'UI/UX Implementation']
        },
        {
            category: 'Backend',
            skills: ['Node.js', 'Express.js', 'Python', 'FastAPI', 'REST API Development', 'API Architecture']
        },
        {
            category: 'Databases',
            skills: ['PostgreSQL', 'MySQL', 'SQLite3', 'MongoDB', 'Prisma', 'SQLAlchemy', 'Database Design & ERD']
        },
        {
            category: 'DevOps & Cloud',
            skills: ['Git & GitHub', 'Linux & CLI', 'Vercel', 'Netlify', 'Render', 'AWS', 'CI/CD']
        },
        {
            category: 'Cybersecurity',
            skills: ['Authentication & Authorization', 'Data Encryption', 'Secure Coding Practices', 'Network Security Basics']
        },
        {
            category: 'Software Architecture',
            skills: ['Full-Stack Architecture', 'RESTful Architecture', 'Database Architecture', 'Scalable Application Design', 'Third-Party API Integration', 'Cloud-based Architecture']
        },
        {
            category: 'AI & Automation',
            skills: ['OpenAI API', 'LangChain', 'Python Automation', 'Workflow Automation', 'Web Scraping']
        }
    ];

    const track = wrapper.querySelector('.skills-carousel-track');
    const viewport = wrapper.querySelector('.skills-carousel-viewport');
    const panelTitle = wrapper.querySelector('.skills-panel-title');
    const panelGrid = wrapper.querySelector('.skills-panel-grid');
    const prevBtn = wrapper.querySelector('.skills-prev');
    const nextBtn = wrapper.querySelector('.skills-next');
    const dotsContainer = wrapper.querySelector('.skills-dots');

    let currentIndex = 0;
    let isAnimating = false;
    let touchStartX = 0;
    let touchDeltaX = 0;
    let isDragging = false;

    function buildSlides() {
        track.innerHTML = '';
        skillData.forEach((cat, i) => {
            const slide = document.createElement('div');
            slide.className = 'skills-slide';
            slide.setAttribute('role', 'tab');
            slide.setAttribute('aria-label', cat.category);
            slide.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
            slide.setAttribute('tabindex', '0');
            slide.textContent = cat.category;
            slide.addEventListener('click', () => goTo(i));
            slide.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(i); }
            });
            track.appendChild(slide);
        });
    }

    function buildDots() {
        dotsContainer.innerHTML = '';
        skillData.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'skills-dot' + (i === currentIndex ? ' active' : '');
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', 'Go to ' + skillData[i].category);
            dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
            dot.addEventListener('click', () => goTo(i));
            dotsContainer.appendChild(dot);
        });
    }

    function renderSkills() {
        const cat = skillData[currentIndex];
        panelTitle.textContent = cat.category;

        // Animate out existing cards
        const existingCards = panelGrid.querySelectorAll('.skill-card');
        if (existingCards.length > 0) {
            existingCards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(8px) scale(0.97)';
            });
            setTimeout(() => {
                insertSkills(cat);
            }, 150);
        } else {
            insertSkills(cat);
        }
    }

    function insertSkills(cat) {
        panelGrid.innerHTML = '';
        cat.skills.forEach(skill => {
            const card = document.createElement('div');
            card.className = 'skill-card';
            card.innerHTML = '<span class="skill-card-dot"></span><span class="skill-card-name">' + skill + '</span>';
            panelGrid.appendChild(card);
        });

        requestAnimationFrame(() => {
            panelGrid.querySelectorAll('.skill-card').forEach((card, i) => {
                card.style.animationDelay = (i * 0.05) + 's';
                card.classList.add('skill-card-enter');
            });
        });
    }

    function render() {
        const slides = track.querySelectorAll('.skills-slide');
        const total = slides.length;
        if (total === 0) return;

        const slideEl = slides[0];
        const slideWidth = slideEl.offsetWidth;
        const style = getComputedStyle(track);
        const gap = parseFloat(style.gap) || 16;
        const itemWidth = slideWidth + gap;
        const viewportWidth = viewport.offsetWidth;
        const centerOffset = (viewportWidth / 2) - (slideWidth / 2);
        const tx = centerOffset - (currentIndex * itemWidth);

        track.style.transform = 'translateX(' + tx + 'px)';

        slides.forEach((slide, i) => {
            slide.classList.remove('is-active', 'is-near', 'is-far');
            slide.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
            const distance = Math.abs(i - currentIndex);
            if (distance === 0) {
                slide.classList.add('is-active');
            } else if (distance === 1) {
                slide.classList.add('is-near');
            } else {
                slide.classList.add('is-far');
            }
        });

        renderSkills();
        updateDots();
    }

    function updateDots() {
        const dots = dotsContainer.querySelectorAll('.skills-dot');
        dots.forEach((d, i) => {
            d.classList.toggle('active', i === currentIndex);
            d.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
        });
    }

    function goTo(index) {
        if (isAnimating) return;
        const total = skillData.length;
        if (index < 0) index = total - 1;
        if (index >= total) index = 0;
        currentIndex = index;
        isAnimating = true;
        render();
        setTimeout(() => { isAnimating = false; }, 480);
    }

    function goNext() { goTo(currentIndex + 1); }
    function goPrev() { goTo(currentIndex - 1); }

    if (prevBtn) prevBtn.addEventListener('click', goPrev);
    if (nextBtn) nextBtn.addEventListener('click', goNext);

    wrapper.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
        if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
        if (e.key === 'Home') { e.preventDefault(); goTo(0); }
        if (e.key === 'End') { e.preventDefault(); goTo(skillData.length - 1); }
    });

    let wheelAccum = 0;
    let wheelTimer = null;

    wrapper.addEventListener('wheel', (e) => {
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (Math.abs(delta) < 15) return;
        e.preventDefault();

        wheelAccum += delta;
        clearTimeout(wheelTimer);
        wheelTimer = setTimeout(() => { wheelAccum = 0; }, 200);

        if (Math.abs(wheelAccum) > 40) {
            if (wheelAccum > 0) goNext(); else goPrev();
            wheelAccum = 0;
        }
    }, { passive: false });

    wrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchDeltaX = 0;
        isDragging = true;
    }, { passive: true });

    wrapper.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        touchDeltaX = e.touches[0].clientX - touchStartX;
    }, { passive: true });

    wrapper.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        if (Math.abs(touchDeltaX) > 50) {
            if (touchDeltaX > 0) goPrev(); else goNext();
        }
        touchDeltaX = 0;
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => render(), 120);
    });

    buildSlides();
    buildDots();
    render();
});
