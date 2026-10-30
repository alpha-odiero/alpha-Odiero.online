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
    let autoScrollTimer = null;
    let userInteracted = false;
    let isAutoScrolling = false;

    function getSlideWidth() {
        const first = track.querySelector('.showcase-slide');
        if (!first) return 340;
        return first.offsetWidth;
    }

    function getGap() {
        const style = getComputedStyle(track);
        return parseFloat(style.gap) || 24;
    }

    // Continuous smooth infinite scroll
    function initInfiniteScroll() {
        if (filteredSlides.length <= 1) return;
        track.style.transition = 'none';
        const firstClone = filteredSlides[0].cloneNode(true);
        const lastClone = filteredSlides[filteredSlides.length - 1].cloneNode(true);
        firstClone.classList.add('is-clone');
        lastClone.classList.add('is-clone');
        track.appendChild(firstClone);
        track.insertBefore(lastClone, filteredSlides[0]);
        filteredSlides = Array.from(track.querySelectorAll('.showcase-slide'));
        currentIndex = 1;
        render(true);
    }

    function render(skipTransition) {
        const total = filteredSlides.length;
        if (total === 0) return;

        const slideWidth = getSlideWidth();
        const gap = getGap();
        const itemWidth = slideWidth + gap;
        const viewportEl = wrapper.querySelector('.showcase-carousel-viewport');
        const viewportWidth = viewportEl.offsetWidth;
        const centerOffset = (viewportWidth / 2) - (slideWidth / 2);

        if (skipTransition) {
            track.style.transition = 'none';
        } else {
            track.style.transition = 'transform 1.2s linear';
        }

        const tx = centerOffset - (currentIndex * itemWidth);

        track.style.transform = `translateX(${tx}px)`;

        filteredSlides.forEach((slide, i) => {
            slide.classList.remove('is-active', 'is-secondary');

            const distance = Math.abs(i - currentIndex);

            if (distance === 0) {
                slide.classList.add('is-active');
            } else if (distance === 1) {
                slide.classList.add('is-secondary');
            }
        });

        updateDots();
    }

    function goTo(index) {
        const total = filteredSlides.length;
        if (total === 0) return;
        currentIndex = ((index % total) + total) % total;
        track.style.transition = 'transform 1s cubic-bezier(0.25, 0.1, 0.25, 1)';
        render();
        handleInfiniteLoop();
    }

    function goNext() { goTo(currentIndex + 1); }
    function goPrev() { goTo(currentIndex - 1); }

    function handleInfiniteLoop() {
        const total = filteredSlides.length;
        if (total <= 2) return;
        setTimeout(() => {
            track.style.transition = 'none';
            if (currentIndex === total - 1) {
                currentIndex = 1;
                render(true);
            } else if (currentIndex === 0) {
                currentIndex = total - 2;
                render(true);
            }
        }, 1000);
    }

    function startAutoScroll() {
        stopAutoScroll();
        if (filteredSlides.length <= 2) return;
        isAutoScrolling = true;
        autoScrollTimer = setInterval(() => {
            if (userInteracted) {
                stopAutoScroll();
                return;
            }
            currentIndex++;
            track.style.transition = 'transform 1.2s linear';
            render();
            handleInfiniteLoop();
        }, 2000);
    }

    function stopAutoScroll() {
        if (autoScrollTimer) {
            clearInterval(autoScrollTimer);
            autoScrollTimer = null;
        }
        isAutoScrolling = false;
    }

    function markInteracted() {
        if (!userInteracted) {
            userInteracted = true;
            stopAutoScroll();
        }
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { markInteracted(); goPrev(); startAutoScroll(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { markInteracted(); goNext(); startAutoScroll(); });

    // Keyboard navigation
    wrapper.addEventListener('keydown', (e) => {
        markInteracted();
        if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); startAutoScroll(); }
        if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); startAutoScroll(); }
    });

    // Mouse wheel — horizontal and vertical
    let wheelAccum = 0;
    let wheelTimer = null;

    wrapper.addEventListener('wheel', (e) => {
        markInteracted();
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
        markInteracted();
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

    wrapper.addEventListener('click', (e) => {
        markInteracted();
        const slide = e.target.closest('.showcase-slide');
        if (!slide || slide.classList.contains('is-active')) return;
        const slidesArray = Array.from(track.querySelectorAll('.showcase-slide'));
        const idx = slidesArray.indexOf(slide);
        if (idx !== -1) { goTo(idx); startAutoScroll(); }
    });

    // Filter
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            markInteracted();
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');

            filteredSlides = slides.filter(s => {
                return filter === 'all' || s.getAttribute('data-category') === filter;
            });

            currentIndex = 0;
            buildDots();
            render();
            startAutoScroll();
        });
    });

    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => render(), 120);
    });

    // Init
    initInfiniteScroll();
    buildDots();
    render(true);
    startAutoScroll();
});
