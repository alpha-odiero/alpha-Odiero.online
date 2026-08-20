document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.querySelector('.showcase-carousel-wrapper');
    if (!wrapper) return;

    const track = wrapper.querySelector('.showcase-carousel-track');
    const slides = Array.from(track.querySelectorAll('.showcase-slide'));
    const prevBtn = wrapper.querySelector('.showcase-prev');
    const nextBtn = wrapper.querySelector('.showcase-next');
    const dotsContainer = document.querySelector('.showcase-dots');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let currentIndex = 0;
    let filteredSlides = [...slides];
    let isAnimating = false;
    let touchStartX = 0;
    let touchDeltaX = 0;
    let isDragging = false;

    function getSlideWidth() {
        const first = track.querySelector('.showcase-slide');
        if (!first) return 340;
        return first.offsetWidth;
    }

    function getGap() {
        const style = getComputedStyle(track);
        return parseFloat(style.gap) || 24;
    }

    function render() {
        const total = filteredSlides.length;
        if (total === 0) return;

        const slideWidth = getSlideWidth();
        const gap = getGap();
        const itemWidth = slideWidth + gap;
        const viewportEl = wrapper.querySelector('.showcase-carousel-viewport');
        const viewportWidth = viewportEl.offsetWidth;
        const centerOffset = (viewportWidth / 2) - (slideWidth / 2);

        const tx = centerOffset - (currentIndex * itemWidth);

        track.style.transform = `translateX(${tx}px)`;

        filteredSlides.forEach((slide, i) => {
            slide.classList.remove('is-active', 'is-secondary');

            const distance = Math.abs(i - currentIndex);

            if (distance === 0) {
                slide.classList.add('is-active');
            } else if (distance <= 1) {
                slide.classList.add('is-secondary');
            }
        });

        updateDots();
    }

    function buildDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        filteredSlides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'showcase-dot' + (i === currentIndex ? ' active' : '');
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', 'Go to project ' + (i + 1));
            dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
            dot.addEventListener('click', () => goTo(i));
            dotsContainer.appendChild(dot);
        });
    }

    function updateDots() {
        if (!dotsContainer) return;
        const dots = dotsContainer.querySelectorAll('.showcase-dot');
        dots.forEach((d, i) => {
            d.classList.toggle('active', i === currentIndex);
            d.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
        });
    }

    function goTo(index) {
        if (isAnimating) return;
        const total = filteredSlides.length;
        if (total === 0) return;
        if (index < 0) index = total - 1;
        if (index >= total) index = 0;
        currentIndex = index;
        isAnimating = true;
        render();
        setTimeout(() => { isAnimating = false; }, 450);
    }

    function goNext() { goTo(currentIndex + 1); }
    function goPrev() { goTo(currentIndex - 1); }

    if (prevBtn) prevBtn.addEventListener('click', goPrev);
    if (nextBtn) nextBtn.addEventListener('click', goNext);

    // Keyboard navigation
    wrapper.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
        if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
    });

    // Mouse wheel — horizontal and vertical
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

    // Touch / swipe
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

    // Click side cards to navigate
    wrapper.addEventListener('click', (e) => {
        const slide = e.target.closest('.showcase-slide');
        if (!slide || slide.classList.contains('is-active')) return;
        const idx = filteredSlides.indexOf(slide);
        if (idx !== -1) goTo(idx);
    });

    // Filter
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');

            filteredSlides = slides.filter(s => {
                return filter === 'all' || s.getAttribute('data-category') === filter;
            });

            currentIndex = 0;
            buildDots();
            render();
        });
    });

    // Resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => render(), 120);
    });

    // Init
    buildDots();
    render();
});
