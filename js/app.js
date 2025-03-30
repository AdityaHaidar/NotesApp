document.addEventListener('DOMContentLoaded', () => {
    initFilterButtons();
    
    import('./components/app-header.js');
    import('./components/app-footer.js');
    import('./components/note-creator.js');
    import('./components/note-collection.js');
    import('./components/note-item.js');
  });
  
  function initFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const noteCollection = document.querySelector('note-collection');
    
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const filterValue = button.getAttribute('data-filter');
 
        if (filterValue === 'all') {
          noteCollection.removeAttribute('filter');
        } else {
          noteCollection.setAttribute('filter', filterValue);
        }

        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
      });
    });
  }