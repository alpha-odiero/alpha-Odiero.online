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

    document.querySelectorAll('.reveal, .skill-card, .service-card, .project-card').forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });

    // Typing Animation
    const typingElement = document.querySelector('.typing-text');
    if (typingElement) {
        const words = ['Full-Stack Websites', 'UI/UX Designs', ' With Modern Frameworks', 'Secure& scalable softwares'];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeSpeed = 100;

        function type() {
            const currentWord = words[wordIndex];
            if (isDeleting) {
                typingElement.innerText = currentWord.substring(0, charIndex - 1);
                charIndex--;
                typeSpeed = 50;
            } else {
                typingElement.innerText = currentWord.substring(0, charIndex + 1);
                charIndex++;
                typeSpeed = 100;
            }

            if (!isDeleting && charIndex === currentWord.length) {
                isDeleting = true;
                typeSpeed = 2000; // Pause at end
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 500;
            }

            setTimeout(type, typeSpeed);
        }

        type();
    }
});
