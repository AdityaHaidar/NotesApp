import { notesData } from '../data/notes-data.js';
import './note-item.js';

class NoteCollection extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._filter = this.getAttribute('filter') || 'all';
  }

  static get observedAttributes() {
    return ['filter'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'filter' && oldValue !== newValue) {
      this._filter = newValue;
      this.render();
    }
  }

  connectedCallback() {
    this.render();
    this.attachFilterListeners();
    
    window.addEventListener('note-created', () => this.render());
    this.addEventListener('toggle-archive', this.handleToggleArchive.bind(this));
    this.addEventListener('delete-note', this.handleDeleteNote.bind(this));
  }

  disconnectedCallback() {
    window.removeEventListener('note-created', () => this.render());
    this.removeEventListener('toggle-archive', this.handleToggleArchive.bind(this));
    this.removeEventListener('delete-note', this.handleDeleteNote.bind(this));
  }

  handleToggleArchive(event) {
    const { id } = event.detail;
    const noteIndex = notesData.findIndex(note => note.id === id);
    
    if (noteIndex !== -1) {
      notesData[noteIndex].archived = !notesData[noteIndex].archived;
      this.render();
    }
  }

  handleDeleteNote(event) {
    const { id } = event.detail;
    const noteIndex = notesData.findIndex(note => note.id === id);
    
    if (noteIndex !== -1) {
      notesData.splice(noteIndex, 1);
      this.render();
    }
  }

  setFilter(filterValue) {
    if (this._filter !== filterValue) {
      this._filter = filterValue;
      this.setAttribute('filter', filterValue);
      this.render();
    }
  }

  attachFilterListeners() {
    setTimeout(() => {
      const hostElement = this.getRootNode().host;
      if (hostElement) {
        const allFilterBtn = hostElement.querySelector('#all-filter');
        const activeFilterBtn = hostElement.querySelector('#active-filter');
        const archivedFilterBtn = hostElement.querySelector('#archived-filter');
        
        if (allFilterBtn) {
          allFilterBtn.addEventListener('click', () => {
            console.log('Filter semua diklik, mengubah filter ke: all');
            this.setFilter('all');
          });
        }
        
        if (activeFilterBtn) {
          activeFilterBtn.addEventListener('click', () => {
            console.log('Filter aktif diklik, mengubah filter ke: active');
            this.setFilter('active');
          });
        }
        
        if (archivedFilterBtn) {
          archivedFilterBtn.addEventListener('click', () => {
            console.log('Filter arsip diklik, mengubah filter ke: archived');
            this.setFilter('archived');
          });
        }
      }
    }, 0);
  }

  render() {
    console.log('Rendering dengan filter:', this._filter);
    let filteredNotes = [...notesData];
    
    if (this._filter === 'active') {
      filteredNotes = filteredNotes.filter(note => !note.archived);
    } else if (this._filter === 'archived') {
      filteredNotes = filteredNotes.filter(note => note.archived);
    }
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        
        .notes-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          width: 100%;
        }
        
        .empty-message {
          text-align: center;
          padding: 2rem;
          font-style: italic;
          color: #78909c;
          grid-column: 1 / -1;
        }
        
        .search-container {
          margin-bottom: 1.5rem;
        }
        
        .search-input {
          width: 100%;
          padding: 0.8rem;
          border: 1px solid #cfd8dc;
          border-radius: 6px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #618758;
          box-shadow: 0 0 0 2px rgba(97, 135, 88, 0.2);
        }
        
        .filter-info {
          margin-bottom: 1rem;
          font-size: 0.9rem;
          color: #546e7a;
        }
        
        .highlight {
          font-weight: 600;
          color: #1f5449;
        }
        
        @media (max-width: 600px) {
          .notes-container {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      </style>
      
      <div>
        <div class="search-container">
          <input 
            type="text" 
            class="search-input" 
            placeholder="Cari catatan..." 
            id="search-notes"
          />
        </div>
        
        <div class="filter-info">
          Menampilkan 
          <span class="highlight">
            ${this.getFilterText()}
          </span> 
          (${filteredNotes.length} catatan)
        </div>
        
        <div class="notes-container">
          ${filteredNotes.length === 0 
            ? `<div class="empty-message">
                 Tidak ada catatan ${this._filter === 'active' ? 'aktif' : 
                   this._filter === 'archived' ? 'terarsip' : ''} yang ditemukan.
               </div>` 
            : ''}
        </div>
      </div>
    `;
    
    const notesContainer = this.shadowRoot.querySelector('.notes-container');
    const searchInput = this.shadowRoot.querySelector('#search-notes');
    
    if (filteredNotes.length > 0) {
      filteredNotes.forEach(note => {
        const noteItem = document.createElement('note-item');
        noteItem.setAttribute('id', note.id);
        noteItem.setAttribute('title', note.title);
        noteItem.setAttribute('body', note.body);
        noteItem.setAttribute('created-at', note.createdAt);
        
        if (note.archived) {
          noteItem.setAttribute('archived', 'true');
        }
        
        notesContainer.appendChild(noteItem);
      });
    }
    
    if (searchInput) {
      searchInput.addEventListener('input', this.handleSearch.bind(this));
    }
    
    this.attachFilterListeners();
  }
  
  getFilterText() {
    switch(this._filter) {
      case 'all':
        return 'semua catatan';
      case 'active':
        return 'catatan aktif';
      case 'archived':
        return 'catatan terarsip';
      default:
        return 'semua catatan';
    }
  }
  
  handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const noteItems = this.shadowRoot.querySelectorAll('note-item');
    
    noteItems.forEach(noteItem => {
      const title = noteItem.getAttribute('title').toLowerCase();
      const body = noteItem.getAttribute('body').toLowerCase();
      
      if (title.includes(searchTerm) || body.includes(searchTerm)) {
        noteItem.style.display = '';
      } else {
        noteItem.style.display = 'none';
      }
    });
  }
}

customElements.define('note-collection', NoteCollection);