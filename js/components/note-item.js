class NoteItem extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.isDialogOpen = false;
    }
  
    static get observedAttributes() {
      return ['id', 'title', 'body', 'created-at', 'archived'];
    }
  
    get id() {
      return this.getAttribute('id');
    }
  
    get title() {
      return this.getAttribute('title') || 'Untitled Note';
    }
  
    get body() {
      return this.getAttribute('body') || 'No content';
    }
  
    get createdAt() {
      return this.getAttribute('created-at') || new Date().toISOString();
    }
  
    get isArchived() {
      return this.hasAttribute('archived') && this.getAttribute('archived') === 'true';
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue) {
        this.render();
      }
    }
  
    connectedCallback() {
      this.render();
      this.attachEventListeners();
    }
  
    render() {
      const formattedDate = this.formatDate(this.createdAt);
      const Body = this.body;
      
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
          }
          
          .note-card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            transition: all 0.3s ease;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
          }
          
          .note-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          }
          
          .note-header {
            padding: 1rem;
            background-color: ${this.isArchived ? '#f5f5f5' : '#e3f4d6'};
            border-bottom: 1px solid ${this.isArchived ? '#e0e0e0' : '#92b884'};
          }
          
          .note-title {
            font-size: 1.2rem;
            font-weight: 600;
            margin: 0;
            color: #37474f;
            word-break: break-word;
          }
          
          .note-body {
            padding: 1rem;
            flex-grow: 1;
            color: #546e7a;
            line-height: 1.5;
            white-space: pre-line;
            word-break: break-word;
          }
          
          .note-footer {
            padding: 0.8rem 1rem;
            background-color: ${this.isArchived ? '#f5f5f5' : '#e3f4d6'};
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.8rem;
            color: #78909c;
            border-top: 1px solid ${this.isArchived ? '#e0e0e0' : '#92b884'};
          }
          
          .note-date {
            display: flex;
            align-items: center;
          }
          
          .note-status {
            background-color: ${this.isArchived ? '#9e9e9e' : '#618758'};
            color: white;
            padding: 0.3rem 0.6rem;
            border-radius: 50px;
            font-size: 0.75rem;
            font-weight: 500;
          }
          
          .actions {
            display: flex;
            gap: 0.5rem;
            padding: 0.8rem 1rem;
            background-color: ${this.isArchived ? '#f5f5f5' : '#e3f4d6'};
            border-top: 1px solid ${this.isArchived ? '#e0e0e0' : '#92b884'};
          }
          
          .action-btn {
            flex: 1;
            padding: 0.5rem;
            border: none;
            border-radius: 4px;
            font-size: 0.85rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .archive-btn {
            background-color: ${this.isArchived ? '#618758' : '#9e9e9e'};
            color: white;
          }
          
          .archive-btn:hover {
            background-color: ${this.isArchived ? '#1f5449' : '#616161'};
          }
          
          .delete-btn {
            background-color: #B14A3C;
            color: white;
          }
          
          .delete-btn:hover {
            background-color: #800020;
          }
  
          /* Styles for custom modal dialog */
          .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            justify-content: center;
            align-items: center;
          }
  
          .modal-overlay.open {
            display: flex;
          }
  
          .modal-dialog {
            background-color: white;
            border-radius: 8px;
            padding: 0;
            width: 100%;
            max-width: 320px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            animation: modalFadeIn 0.3s ease;
          }
  
          .modal-header {
            background-color: #B14A3C;
            color: white;
            padding: 1rem;
            border-radius: 8px 8px 0 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
  
          .modal-header h3 {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 500;
          }
  
          .modal-body {
            padding: 1.5rem;
            color: #546e7a;
            text-align: center;
          }
  
          .modal-footer {
            display: flex;
            border-top: 1px solid #eeeeee;
          }
  
          .modal-btn {
            flex: 1;
            padding: 1rem;
            border: none;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s ease;
          }
  
          .modal-cancel {
            background-color: #f5f5f5;
            color: #546e7a;
            border-radius: 0 0 0 8px;
          }
  
          .modal-cancel:hover {
            background-color: #e0e0e0;
          }
  
          .modal-confirm {
            background-color: #B14A3C;
            color: white;
            border-radius: 0 0 8px 0;
          }
  
          .modal-confirm:hover {
            background-color: #800020;
          }
  
          .warning-icon {
            width: 24px;
            height: 24px;
            fill: white;
          }
  
          @keyframes modalFadeIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        </style>
        
        <article class="note-card">
          <div class="note-header">
            <h3 class="note-title">${this.title}</h3>
          </div>
          
          <div class="note-body">
            ${Body}
          </div>
          
          <div class="note-footer">
            <div class="note-date">${formattedDate}</div>
            <div class="note-status">${this.isArchived ? 'Diarsipkan' : 'Aktif'}</div>
          </div>
          
          <div class="actions">
            <button class="action-btn archive-btn" id="toggle-archive">
              ${this.isArchived ? 'Kembalikan' : 'Arsipkan'}
            </button>
            <button class="action-btn delete-btn" id="delete-note">
              Hapus
            </button>
          </div>
        </article>
  
        <!-- Custom Modal Dialog -->
        <div class="modal-overlay" id="delete-dialog">
          <div class="modal-dialog">
            <div class="modal-header">
              <svg class="warning-icon" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
              </svg>
              <h3>Konfirmasi Penghapusan</h3>
            </div>
            <div class="modal-body">
              <p>Apakah Anda yakin ingin menghapus catatan ini?</p>
              <p><strong>${this.title}</strong></p>
            </div>
            <div class="modal-footer">
              <button class="modal-btn modal-cancel" id="cancel-delete">Batal</button>
              <button class="modal-btn modal-confirm" id="confirm-delete">Hapus</button>
            </div>
          </div>
        </div>
      `;
    }
  
    attachEventListeners() {
      const archiveBtn = this.shadowRoot.querySelector('#toggle-archive');
      const deleteBtn = this.shadowRoot.querySelector('#delete-note');
      const cancelBtn = this.shadowRoot.querySelector('#cancel-delete');
      const confirmBtn = this.shadowRoot.querySelector('#confirm-delete');
      const deleteDialog = this.shadowRoot.querySelector('#delete-dialog');
      
      archiveBtn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('toggle-archive', {
          bubbles: true,
          composed: true,
          detail: { id: this.id }
        }));
      });
      
      deleteBtn.addEventListener('click', () => {
        this.openDeleteDialog();
      });
  
      cancelBtn.addEventListener('click', () => {
        this.closeDeleteDialog();
      });
  
      confirmBtn.addEventListener('click', () => {
        this.closeDeleteDialog();
        this.dispatchEvent(new CustomEvent('delete-note', {
          bubbles: true,
          composed: true,
          detail: { id: this.id }
        }));
      });
  
      deleteDialog.addEventListener('click', (e) => {
        if (e.target === deleteDialog) {
          this.closeDeleteDialog();
        }
      });
  
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isDialogOpen) {
          this.closeDeleteDialog();
        }
      });
    }
  
    openDeleteDialog() {
      const dialog = this.shadowRoot.querySelector('#delete-dialog');
      dialog.classList.add('open');
      this.isDialogOpen = true;
    }
  
    closeDeleteDialog() {
      const dialog = this.shadowRoot.querySelector('#delete-dialog');
      dialog.classList.remove('open');
      this.isDialogOpen = false;
    }
  
    formatDate(dateString) {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      
      return new Date(dateString).toLocaleDateString('id-ID', options);
    }
  }
  
  customElements.define('note-item', NoteItem);