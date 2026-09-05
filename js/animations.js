document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal Animation
    const observerOptions = {
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal, .service-card, .project-card').forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });

    // About stats count-up animation
    const statNumbers = document.querySelectorAll('.about-stat-number[data-count]');
    if (statNumbers.length) {
        const countObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting || entry.target.dataset.counted === 'true') return;

                const number = entry.target;
                const target = Number(number.dataset.count);
                const suffix = number.dataset.suffix || '';
                const duration = 1200;
                const startTime = performance.now();

                number.dataset.counted = 'true';

                function updateCount(currentTime) {
                    const progress = Math.min((currentTime - startTime) / duration, 1);
                    const easedProgress = 1 - Math.pow(1 - progress, 3);
                    const currentValue = Math.round(target * easedProgress);

                    number.textContent = `${currentValue}${suffix}`;

                    if (progress < 1) {
                        requestAnimationFrame(updateCount);
                    }
                }

                requestAnimationFrame(updateCount);
                observer.unobserve(number);
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(number => countObserver.observe(number));
    }
});
