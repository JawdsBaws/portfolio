// Project filtering and sorting functionality
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sort-select');
    const searchInput = document.getElementById('search-input');
    const projectsGrid = document.querySelector('.projects-grid');
    const projects = [...document.querySelectorAll('.project-card')];

    // Initialize state
    let currentFilter = 'all';
    let currentSort = 'newest';
    let currentSearch = '';

    // Filter and search projects
    function filterProjects() {
        projects.forEach(project => {
            const tags = project.dataset.tags?.split(',') || [];
            const matchesFilter = currentFilter === 'all' || tags.includes(currentFilter);
            
            // Search in title, description, and tags
            const title = project.querySelector('h3').textContent.toLowerCase();
            const description = project.querySelector('.project-back p').textContent.toLowerCase();
            const tagElements = project.querySelectorAll('.project-tags span');
            const tagTexts = Array.from(tagElements).map(tag => tag.textContent.toLowerCase());
            const searchTerm = currentSearch.toLowerCase();
            
            const matchesSearch = searchTerm === '' || 
                title.includes(searchTerm) || 
                description.includes(searchTerm) || 
                tagTexts.some(tag => tag.includes(searchTerm)) ||
                tags.some(tag => tag.includes(searchTerm));

            const shouldShow = matchesFilter && matchesSearch;
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

    // Apply filter, sort, and search
    function updateProjects() {
        sortProjects();
        filterProjects();
    }

    // Search input handler with debounce
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearch = e.target.value;
            updateProjects();
        }, 300); // Debounce for 300ms
    });

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
