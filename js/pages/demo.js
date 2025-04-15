/**
 * Demo contest page for the Joridiro application
 */
import * as api from '../api.js';
import { showNotification } from '../components/notification.js';
import { getQueryParam } from '../utils/helpers.js';
import { renderContestDetailPage } from './contest-detail.js';

// Demo contest types
const DEMO_TYPES = {
  QUARTERMEAL_LARGE_DEADLINE: 'quartermeal_large_deadline',
  QUARTERMEAL_MEDIUM_DEADLINE: 'quartermeal_medium_deadline',
  QUARTERMEAL_SMALL_DEADLINE: 'quartermeal_small_deadline',
  QUARTERMEAL_LARGE_SCORE: 'quartermeal_large_score',
  QUARTERMEAL_MEDIUM_SCORE: 'quartermeal_medium_score',
  QUARTERMEAL_SMALL_SCORE: 'quartermeal_small_score'
};

/**
 * Renders the demo page with a demo contest
 */
export async function renderDemoPage() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;
  
  // Set initial loading state
  appContainer.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner">
        <svg class="spinner" viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
        </svg>
        <span>Loading demo contest...</span>
      </div>
    </div>
  `;
  
  try {
    // Get demo type from query params
    const demoType = getQueryParam('data') || 'QUARTERMEAL_LARGE_DEADLINE';
    
    // Fetch demo contest data
    const contestData = await fetchDemoContest(demoType);
    
    if (!contestData) {
      throw new Error('Failed to load demo contest');
    }
    
    // Render contest detail page with demo data
    renderContestDetailPage('demo');
    
    // Add demo banner
    addDemoBanner();
  } catch (error) {
    console.error('Failed to load demo contest:', error);
    
    // Show error message
    appContainer.innerHTML = `
      <div class="error-container">
        <h2>Demo Contest Not Available</h2>
        <p>We couldn't load the demo contest at this time. Please try again later.</p>
        <a href="/" class="btn btn-primary">Back to Home</a>
      </div>
    `;
  }
}

/**
 * Fetches demo contest data
 * @param {string} demoType - Type of demo contest
 * @returns {Object} Demo contest data
 */
async function fetchDemoContest(demoType) {
  // Usually this would be an API call, but for demo purposes
  // we're simulating with a mock contest
  
  // Convert demo type to lowercase for matching
  const type = demoType.toUpperCase();
  
  // Return basic contest data structure
  // This is a simplified version; in a real implementation,
  // you'd have complete contest data matching your API schema
  return {
    _id: 'demo-contest',
    title: 'Demo Contest',
    type: type.includes('SCORE') ? 'SCORE' : 'DEADLINE',
    size: type.includes('SMALL') ? 'SMALL' : (type.includes('MEDIUM') ? 'MEDIUM' : 'LARGE'),
    open: true,
    startDate: new Date().toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
    // ... other contest data would be added here
  };
}

/**
 * Adds a demo banner to the page
 */
function addDemoBanner() {
  // Create demo banner
  const banner = document.createElement('div');
  banner.className = 'demo-banner';
  banner.innerHTML = `
    <div class="demo-banner-content">
      <div class="demo-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      </div>
      <div class="demo-message">
        <p>This is a demo contest. Features are limited in demo mode.</p>
      </div>
      <div class="demo-actions">
        <button id="close-demo-banner" class="demo-close">×</button>
      </div>
    </div>
  `;
  
  // Add banner to document
  document.body.appendChild(banner);
  
  // Add close button handler
  const closeButton = document.getElementById('close-demo-banner');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      banner.classList.add('demo-banner-hidden');
      setTimeout(() => {
        banner.remove();
      }, 300);
    });
  }
  
  // Auto-hide banner after 10 seconds
  setTimeout(() => {
    if (document.body.contains(banner)) {
      banner.classList.add('demo-banner-hidden');
      setTimeout(() => {
        if (document.body.contains(banner)) {
          banner.remove();
        }
      }, 300);
    }
  }, 10000);
}