// Project filtering and sorting functionality
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sort-select');
    const projectsGrid = document.querySelector('.projects-grid');
    const projects = [...document.querySelectorAll('.project-card')];

    // Initialize state
    let currentFilter = 'all';
    let currentSort = 'newest';

    // Filter projects
    function filterProjects() {
        projects.forEach(project => {
            const tags = project.dataset.tags?.split(',') || [];
            const shouldShow = currentFilter === 'all' || tags.includes(currentFilter);
            project.style.display = shouldShow ? 'block' : 'none';
            
            // Add/remove fade class for animation
            if (shouldShow) {
                project.classList.add('fade-in');
                setTimeout(() => project.classList.remove('fade-in'), 500);
            }
        });
    }

    // Sort projects
    function sortProjects() {
        const sortedProjects = [...projects].sort((a, b) => {
            switch (currentSort) {
                case 'newest':
                    return new Date(b.dataset.date) - new Date(a.dataset.date);
                case 'oldest':
                    return new Date(a.dataset.date) - new Date(b.dataset.date);
                case 'name':
                    return a.dataset.name.localeCompare(b.dataset.name);
                default:
                    return 0;
            }
        });

        // Reorder DOM elements
        sortedProjects.forEach(project => {
            projectsGrid.appendChild(project);
        });
    }

    // Apply both filter and sort
    function updateProjects() {
        sortProjects();
        filterProjects();
    }

    // Filter button click handlers
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update filter and refresh
            currentFilter = button.dataset.filter;
            updateProjects();
        });
    });

    // Sort select change handler
    sortSelect.addEventListener('change', () => {
        currentSort = sortSelect.value;
        updateProjects();
    });

    // Initialize with default settings
    updateProjects();
});
