/**
 * Error page for the Joridiro application
 */

/**
 * Renders the error page
 * @param {Object} [params] - Parameters with error details
 */
export function renderErrorPage(params = {}) {
    const appContainer = document.getElementById('app');
    if (!appContainer) return;
    
    const statusCode = params.status || 404;
    
    let title = 'Page Not Found';
    let message = "We couldn't find the page you're looking for.";
    
    // Customize based on status code
    if (statusCode === 403) {
      title = 'Access Denied';
      message = "You don't have permission to access this page.";
    } else if (statusCode === 500) {
      title = 'Server Error';
      message = "We're experiencing some technical difficulties. Please try again later.";
    } else if (statusCode === 401) {
      title = 'Authentication Required';
      message = "You need to be logged in to access this page.";
    }
    
    appContainer.innerHTML = `
      <div class="error-container">
        <div class="error-content">
          <div class="error-image">
            <img src="/images/404.png" alt="Error ${statusCode}">
          </div>
          
          <h1>${statusCode} - ${title}</h1>
          <p>${message}</p>
          
          <div class="error-actions">
            <a href="/" class="btn btn-primary">Go to Homepage</a>
            <button id="go-back-btn" class="btn btn-outline">Go Back</button>
          </div>
        </div>
      </div>
    `;
    
    // Set up go back button
    const goBackBtn = document.getElementById('go-back-btn');
    if (goBackBtn) {
      goBackBtn.addEventListener('click', () => {
        window.history.back();
      });
    }
  }