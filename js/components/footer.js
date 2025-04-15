/**
 * Footer component for the Joridiro application
 */

export function renderFooter() {
    // Skip rendering on messages page
    if (window.location.pathname.startsWith('/messages')) {
      return;
    }
    
    // Create footer if it doesn't exist
    let footer = document.querySelector('footer');
    if (!footer) {
      footer = document.createElement('footer');
      document.body.appendChild(footer);
    }
    
    footer.innerHTML = `
      <div class="footer-container">
        <div class="footer-logo">
          <img src="./images/logo.svg" alt="Joridiro">
        </div>
        
        <div class="footer-links">
          <div class="footer-column">
            <h4>Company</h4>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/impressum">Impressum</a></li>
            </ul>
          </div>
          
          <div class="footer-column">
            <h4>Platform</h4>
            <ul>
              <li><a href="/contests">Contests</a></li>
              <li><a href="/demo?data=QUARTERMEAL_LARGE_DEADLINE">Demo Contest</a></li>
            </ul>
          </div>
          
          <div class="footer-column">
            <h4>Connect</h4>
            <ul>
              <li><a href="#" id="contact-us-btn">Contact Us</a></li>
              <li><a href="https://twitter.com/joridiro" target="_blank">Twitter</a></li>
            </ul>
          </div>
        </div>
        
        <div class="footer-legal">
          <p>&copy; ${new Date().getFullYear()} Joridiro. All rights reserved.</p>
          <div class="footer-legal-links">
            <a href="/terms">Terms of Service</a>
            <a href="/privacy">Privacy Policy</a>
          </div>
        </div>
      </div>
    `;
    
    // Add event listener for contact us button
    const contactUsBtn = footer.querySelector('#contact-us-btn');
    if (contactUsBtn) {
      contactUsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Import contact form dynamically
        import('./contact-form.js').then(module => {
          module.showContactForm();
        });
      });
    }
  }
  
  /**
   * Updates the footer visibility based on the current route
   */
  export function updateFooterVisibility() {
    const footer = document.querySelector('footer');
    if (!footer) return;
    
    // Hide footer on messages page
    if (window.location.pathname.startsWith('/messages')) {
      footer.style.display = 'none';
    } else {
      footer.style.display = 'block';
    }
  }