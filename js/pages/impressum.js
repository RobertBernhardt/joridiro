/**
 * Impressum page for the Joridiro application
 */

/**
 * Renders the impressum page
 */
export function renderImpressumPage() {
    const appContainer = document.getElementById('app');
    if (!appContainer) return;
    
    appContainer.innerHTML = `
      <div class="impressum-container">
        <div class="impressum-content">
          <h1>Impressum</h1>
          
          <div class="impressum-details">
            <p>Joridiro is a project of:</p>
            
            <div class="company-details">
              <p>
                Querkauf UG (limited liability)<br>
                District Court Ulm · HRB 741050<br>
                Ellerbachweg<br>
                40 89079 Ulm<br>
                Germany
              </p>
              
              <p>
                <strong>CEO:</strong> Robert Bernhardt<br>
                <strong>Contact:</strong> info@joridiro.com
              </p>
            </div>
          </div>
          
          <div class="legal-section">
            <h2>Legal Disclaimer</h2>
            <p>
              The contents of these pages were prepared with utmost care. Nonetheless, we cannot assume liability for the timeless accuracy and completeness of the information.
            </p>
            <p>
              Our website contains links to external websites. As the contents of these third-party websites are beyond our control, we cannot accept liability for them. Responsibility for the contents of the linked pages is always held by the provider or operator of the pages.
            </p>
          </div>
          
          <div class="legal-section">
            <h2>Data Protection</h2>
            <p>
              In general, when visiting our website, no personal data are saved. However, these data can be given on a voluntary basis. No data will be passed on to third parties without your consent. We point out that in regard to unsecured data transmission in the internet (e.g. via email), security cannot be guaranteed. Such data could possibly be accessed by third parties.
            </p>
          </div>
          
          <div class="legal-section">
            <h2>Copyright</h2>
            <p>
              The copyright and all other rights to content, images, photos or other files on the website belong exclusively to Querkauf UG or the specifically named rights holders. For the reproduction of any elements, the written consent of the copyright holders must be obtained in advance.
            </p>
          </div>
        </div>
      </div>
    `;
  }