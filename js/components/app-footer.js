class AppFooter extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  
    connectedCallback() {
      this.render();
    }
  
    render() {
      const currentYear = new Date().getFullYear();
      
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            width: 100%;
          }
          
          footer {
            background: linear-gradient(245.59deg, #92b884 0%, #618758 28.53%, #1f5449 75.52%);
            color: white;
            text-align: center;
            padding: 1.2rem;
            margin-top: 3rem;
            font-size: 0.9rem;
          }
          
          .footer-content {
            max-width: 600px;
            margin: 0 auto;
          }
          
          .footer-links {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-top: 0.5rem;
          }
          
          .footer-link {
            color: white;
            text-decoration: none;
            transition: opacity 0.3s;
          }
          
          .footer-link:hover {
            opacity: 0.8;
            text-decoration: underline;
          }
          
          .heart-icon {
            color: #ff5252;
            display: inline-block;
            margin: 0 3px;
            animation: heartbeat 1.5s infinite;
          }
          
          @keyframes heartbeat {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
          
          @media (max-width: 600px) {
            footer {
              padding: 1rem;
              font-size: 0.8rem;
            }
            
            .footer-links {
              flex-direction: column;
              gap: 0.5rem;
            }
          }
        </style>
        
        <footer>
          <div class="footer-content">
            <p>© ${currentYear} Aditya's NotesApp | Dibuat dengan <span class="heart-icon">❤</span> untuk Dicoding</p>
          </div>
        </footer>
      `;
    }
  }
  
  customElements.define('app-footer', AppFooter);