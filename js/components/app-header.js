class AppHeader extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._theme = this.getAttribute('theme') || 'light';
    }
  
    static get observedAttributes() {
      return ['theme'];
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'theme' && oldValue !== newValue) {
        this._theme = newValue;
        this.render();
      }
    }
  
    connectedCallback() {
      this.render();
    }
  
    render() {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            width: 100%;
          }
          
          header {
            background: linear-gradient(245.59deg, #92b884 0%, #618758 28.53%, #1f5449 75.52%);
            color: white;
            padding: 1.5rem;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          }
          
          .app-title {
            margin: 0;
            font-size: 2.2rem;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          
          .app-subtitle {
            font-size: 1rem;
            margin-top: 0.5rem;
            font-weight: 400;
            opacity: 0.9;
          }
          
          @media (max-width: 600px) {
            header {
              padding: 1rem;
            }
            
            .app-title {
              font-size: 1.8rem;
            }
            
            .app-subtitle {
              font-size: 0.9rem;
            }
          }
        </style>
        
        <header>
          <h1 class="app-title">Aditya's NotesApp</h1>
          <div class="app-subtitle">Store ur best idea here!</div>
        </header>
      `;
    }
  }
  
  customElements.define('app-header', AppHeader);