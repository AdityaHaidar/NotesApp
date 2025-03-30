import { notesData } from '../data/notes-data.js';

class NoteCreator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.maxTitleLength = parseInt(this.getAttribute('max-title-length')) || 50;
    this.maxBodyLength = parseInt(this.getAttribute('max-body-length')) || 1000;
    this.notificationTimeout = null;
  }

  static get observedAttributes() {
    return ['max-title-length', 'max-body-length'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'max-title-length') {
      this.maxTitleLength = parseInt(newValue) || 50;
    } else if (name === 'max-body-length') {
      this.maxBodyLength = parseInt(newValue) || 1000;
    }
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        
        .creator-container {
          width: 100%;
          position: relative;
        }
        
        .form-title {
          color: #618758;
          margin-bottom: 1.2rem;
          font-size: 1.3rem;
          font-weight: 600;
          text-align: center;
        }
        
        form {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
        }
        
        label {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #37474f;
        }
        
        input, textarea {
          border: 1px solid #cfd8dc;
          border-radius: 6px;
          padding: 0.8rem;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        
        input:focus, textarea:focus {
          outline: none;
          border-color: #618758;
          box-shadow: 0 0 0 2px rgba(97, 135, 88, 0.2);
        }
        
        textarea {
          min-height: 120px;
          resize: vertical;
        }
        
        .char-counter {
          font-size: 0.8rem;
          color: #78909c;
          margin-top: 0.3rem;
          text-align: right;
        }
        
        .error-text {
          color: #e53935;
          font-size: 0.85rem;
          margin-top: 0.3rem;
          display: none;
        }
        
        .show-error {
          display: block;
        }
        
        .invalid {
          border-color: #e53935;
          box-shadow: 0 0 0 1px #e53935;
        }
        
        .submit-btn {
          background-color: #1f5449;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 0.8rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 0.5rem;
        }
        
        .submit-btn:hover {
          background-color:rgb(46, 125, 109);
          transform: translateY(-2px);
        }
        
        .submit-btn:disabled {
          background-color: #92b884;
          cursor: not-allowed;
          transform: none;
        }
        
        /* Styles for notification popup */
        .notification-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.3);
          z-index: 1000;
          display: flex;
          justify-content: center;
          align-items: center;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        
        .notification-overlay.show {
          opacity: 1;
          visibility: visible;
        }
        
        .notification-popup {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          width: 90%;
          max-width: 320px;
          overflow: hidden;
          animation: popupFadeIn 0.4s ease;
        }
        
        .notification-header {
          background-color: #4CAF50;
          color: white;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .notification-title {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 500;
        }
        
        .notification-body {
          padding: 1.5rem;
          text-align: center;
          color: #546e7a;
        }
        
        .notification-footer {
          padding: 1rem;
          display: flex;
          justify-content: center;
          border-top: 1px solid #eeeeee;
        }
        
        .notification-btn {
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.6rem 1.2rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .notification-btn:hover {
          background-color: #388E3C;
        }
        
        .success-icon {
          width: 24px;
          height: 24px;
          fill: white;
        }
        
        @keyframes popupFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @media (max-width: 600px) {
          .form-title {
            font-size: 1.2rem;
          }
          
          input, textarea, .submit-btn {
            padding: 0.6rem;
            font-size: 0.9rem;
          }
        }
      </style>
      
      <div class="creator-container">
        <h2 class="form-title">Buat Catatan Baru</h2>
        
        <form id="note-form">
          <div class="form-group">
            <label for="note-title">Judul</label>
            <input 
              type="text" 
              id="note-title" 
              placeholder="Judul catatan..." 
              maxlength="${this.maxTitleLength}" 
              required
            />
            <div class="char-counter">
              <span id="title-length">0</span>/${this.maxTitleLength}
            </div>
            <div id="title-error" class="error-text">
              Judul wajib diisi (minimal 3 karakter)
            </div>
          </div>
          
          <div class="form-group">
            <label for="note-body">Isi Catatan</label>
            <textarea 
              id="note-body" 
              placeholder="Tulis catatan di sini..." 
              maxlength="${this.maxBodyLength}" 
              required
            ></textarea>
            <div class="char-counter">
              <span id="body-length">0</span>/${this.maxBodyLength}
            </div>
            <div id="body-error" class="error-text">
              Isi catatan wajib diisi (minimal 5 karakter)
            </div>
          </div>
          
          <button type="submit" class="submit-btn" id="submit-note">
            Simpan Catatan
          </button>
        </form>
        
        <!-- Notification Popup -->
        <div class="notification-overlay" id="notification-overlay">
          <div class="notification-popup">
            <div class="notification-header">
              <svg class="success-icon" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
              </svg>
              <h3 class="notification-title">Sukses</h3>
            </div>
            <div class="notification-body">
              <p id="notification-message">Catatan berhasil disimpan!</p>
            </div>
            <div class="notification-footer">
              <button class="notification-btn" id="notification-btn">OK</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const form = this.shadowRoot.querySelector('#note-form');
    const titleInput = this.shadowRoot.querySelector('#note-title');
    const bodyInput = this.shadowRoot.querySelector('#note-body');
    const titleCounter = this.shadowRoot.querySelector('#title-length');
    const bodyCounter = this.shadowRoot.querySelector('#body-length');
    const titleError = this.shadowRoot.querySelector('#title-error');
    const bodyError = this.shadowRoot.querySelector('#body-error');
    const submitButton = this.shadowRoot.querySelector('#submit-note');
    const notificationOverlay = this.shadowRoot.querySelector('#notification-overlay');
    const notificationMessage = this.shadowRoot.querySelector('#notification-message');
    const notificationBtn = this.shadowRoot.querySelector('#notification-btn');

    const updateTitleCounter = () => {
      const length = titleInput.value.length;
      titleCounter.textContent = length;
    };

    const updateBodyCounter = () => {
      const length = bodyInput.value.length;
      bodyCounter.textContent = length;
    };

    const validateTitle = () => {
      const value = titleInput.value.trim();
      
      if (value.length < 3) {
        titleInput.classList.add('invalid');
        titleError.classList.add('show-error');
        return false;
      } else {
        titleInput.classList.remove('invalid');
        titleError.classList.remove('show-error');
        return true;
      }
    };

    const validateBody = () => {
      const value = bodyInput.value.trim();
      
      if (value.length < 5) {
        bodyInput.classList.add('invalid');
        bodyError.classList.add('show-error');
        return false;
      } else {
        bodyInput.classList.remove('invalid');
        bodyError.classList.remove('show-error');
        return true;
      }
    };

    const checkFormValidity = () => {
      const isTitleValid = titleInput.value.trim().length >= 3;
      const isBodyValid = bodyInput.value.trim().length >= 5;
      
      submitButton.disabled = !(isTitleValid && isBodyValid);
    };

    titleInput.addEventListener('input', () => {
      updateTitleCounter();
      validateTitle();
      checkFormValidity();
    });

    bodyInput.addEventListener('input', () => {
      updateBodyCounter();
      validateBody();
      checkFormValidity();
    });
    
    notificationBtn.addEventListener('click', () => {
      this.hideNotification();
    });
    
    notificationOverlay.addEventListener('click', (e) => {
      if (e.target === notificationOverlay) {
        this.hideNotification();
      }
    });
    
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && notificationOverlay.classList.contains('show')) {
        this.hideNotification();
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const isTitleValid = validateTitle();
      const isBodyValid = validateBody();
      
      if (isTitleValid && isBodyValid) {
        const newNote = {
          id: `note-${Date.now()}`,
          title: titleInput.value.trim(),
          body: bodyInput.value.trim(),
          createdAt: new Date().toISOString(),
          archived: false
        };
        
        notesData.unshift(newNote);
        
        window.dispatchEvent(new CustomEvent('note-created', {
          detail: { note: newNote }
        }));
        
        form.reset();
        titleCounter.textContent = '0';
        bodyCounter.textContent = '0';
        submitButton.disabled = true;
        
        this.showNotification(`Catatan "${newNote.title}" berhasil disimpan!`);
      }
    });
    
    updateTitleCounter();
    updateBodyCounter();
    checkFormValidity();
  }
  
  showNotification(message) {
    const notificationOverlay = this.shadowRoot.querySelector('#notification-overlay');
    const notificationMessage = this.shadowRoot.querySelector('#notification-message');
    
    notificationMessage.textContent = message;
    
    notificationOverlay.classList.add('show');
    
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    
    this.notificationTimeout = setTimeout(() => {
      this.hideNotification();
    }, 5000); 
  }
  
  hideNotification() {
    const notificationOverlay = this.shadowRoot.querySelector('#notification-overlay');
    notificationOverlay.classList.remove('show');
    
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
      this.notificationTimeout = null;
    }
  }
}

customElements.define('note-creator', NoteCreator);