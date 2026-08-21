document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('skillsGrid');
    if (!grid) return;

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

    skillData.forEach((cat, i) => {
        const card = document.createElement('article');
        card.className = 'skill-category-card reveal';
        card.setAttribute('role', 'listitem');

        const number = document.createElement('span');
        number.className = 'skill-category-number';
        number.textContent = String(i + 1).padStart(2, '0');

        const title = document.createElement('h3');
        title.className = 'skill-category-title';
        title.textContent = cat.category;

        const list = document.createElement('ul');
        list.className = 'skill-category-list';
        cat.skills.forEach(skill => {
            const li = document.createElement('li');
            li.textContent = skill;
            list.appendChild(li);
        });

        card.appendChild(number);
        card.appendChild(title);
        card.appendChild(list);
        grid.appendChild(card);
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        });
    }, { threshold: 0.1 });

    grid.querySelectorAll('.skill-category-card').forEach((card, i) => {
        card.style.transitionDelay = ((i % 3) * 0.1) + 's';
        card.addEventListener('transitionend', () => {
            card.style.transitionDelay = '';
        }, { once: true });
        revealObserver.observe(card);
    });
});
