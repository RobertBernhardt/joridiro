/**
 * Contests page for the Joridiro application
 */
import * as api from '../api.js';
import { showNotification } from '../components/notification.js';
import { createContestCard } from '../components/contest-card.js';
import { debounce } from '../utils/helpers.js';

// Number of contests to load per page
const CONTESTS_PER_PAGE = 9;

// Current page and search state
let currentPage = 1;
let searchQuery = '';
let isSearching = false;
let isLoading = false;
let hasMoreContests = true;

/**
 * Renders the contests page
 */
export async function renderContestsPage() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;
  
  // Reset pagination state
  currentPage = 1;
  searchQuery = '';
  isSearching = false;
  isLoading = false;
  hasMoreContests = true;
  
  // Set initial content
  appContainer.innerHTML = `
    <div class="contests-header">
      <div class="header-content">
        <h1>Joridiro Contests</h1>
        <div class="search-container">
          <input type="text" id="search-contests" placeholder="Search for contests">
          <span class="search-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <div id="search-results" class="search-results"></div>
        </div>
      </div>
      
      <div class="box1">
        <svg width="572" height="579" viewBox="0 0 572 579" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path opacity="0.1" d="M556.377 391.3C570.726 383.016 575.642 364.668 567.358 350.319L374.327 15.9803C366.043 1.63154 347.695 -3.2847 333.347 4.99957L15.9806 188.231C1.63183 196.515 -3.28441 214.863 4.99986 229.212L198.03 563.55C206.315 577.899 224.662 582.815 239.011 574.531L556.377 391.3Z" fill="url(#paint0_linear_1358_53753)"/>
          <defs>
            <linearGradient id="paint0_linear_1358_53753" x1="285.787" y1="-9.69909" x2="285.787" y2="475.559" gradientUnits="userSpaceOnUse">
              <stop stop-color="white"/>
              <stop offset="1" stop-color="white" stop-opacity="0"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      <div class="box2">
        <svg width="456" height="231" viewBox="0 0 456 231" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path opacity="0.1" d="M450.977 38.2341C459.261 52.5829 454.345 70.9306 439.996 79.2148L185.268 226.282C170.92 234.566 152.572 229.65 144.288 215.301L5.00009 -25.9517C-3.28418 -40.3005 1.63209 -58.6482 15.9809 -66.9324L270.709 -214C285.058 -222.284 303.405 -217.368 311.69 -203.019L450.977 38.2341Z" fill="url(#paint0_linear_1358_53752)"/>
          <defs>
            <linearGradient id="paint0_linear_1358_53752" x1="108.845" y1="211.883" x2="301.471" y2="-121.757" gradientUnits="userSpaceOnUse">
              <stop stop-color="white"/>
              <stop offset="1" stop-color="white" stop-opacity="0"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
    
    <div class="contests-container">
      <div id="contests-grid" class="contests-grid">
        <div class="loading-spinner">
          <svg class="spinner" viewBox="0 0 50 50">
            <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
          </svg>
          <span>Loading contests...</span>
        </div>
      </div>
      
      <div id="load-more-container" class="load-more-container">
        <button id="load-more-btn" class="btn btn-outline">Load More Contests</button>
      </div>
    </div>
  `;
  
  // Load initial contests
  loadContests();
  
  // Set up search functionality
  const searchInput = document.getElementById('search-contests');
  if (searchInput) {
    // Debounce search to prevent too many requests
    searchInput.addEventListener('input', debounce(function() {
      searchQuery = this.value.trim();
      handleSearch();
    }, 300));
    
    // Handle enter key in search
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchQuery = this.value.trim();
        handleSearch();
      }
    });
  }
  
  // Set up load more button
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      if (!isLoading && hasMoreContests) {
        currentPage++;
        loadContests();
      }
    });
  }
}

/**
 * Loads contests data from the API
 */
async function loadContests() {
  const contestsGrid = document.getElementById('contests-grid');
  const loadMoreContainer = document.getElementById('load-more-container');
  
  if (!contestsGrid || isLoading) return;
  
  isLoading = true;
  
  // Show loading spinner if this is the first page
  if (currentPage === 1) {
    contestsGrid.innerHTML = `
      <div class="loading-spinner">
        <svg class="spinner" viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
        </svg>
        <span>Loading contests...</span>
      </div>
    `;
  } else {
    // Add loading indicator to load more button
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.disabled = true;
      loadMoreBtn.innerHTML = `
        <svg class="spinner small" viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
        </svg>
        <span>Loading...</span>
      `;
    }
  }
  
  try {
    // Fetch contests from API
    const contests = await api.getContests(currentPage, CONTESTS_PER_PAGE);
    
    // Clear loading spinner on first page
    if (currentPage === 1) {
      contestsGrid.innerHTML = '';
    }
    
    // Check if there are more contests to load
    hasMoreContests = contests.length === CONTESTS_PER_PAGE;
    
    if (contests.length === 0 && currentPage === 1) {
      // No contests found
      contestsGrid.innerHTML = `
        <div class="no-contests">
          <p>No contests available at the moment. Check back soon!</p>
        </div>
      `;
      
      // Hide load more button
      if (loadMoreContainer) {
        loadMoreContainer.style.display = 'none';
      }
    } else {
      // Render contests
      contests.forEach(contest => {
        const card = createContestCard(contest, true);
        contestsGrid.appendChild(card);
      });
      
      // Update load more button
      if (loadMoreContainer) {
        loadMoreContainer.style.display = hasMoreContests ? 'flex' : 'none';
        
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
          loadMoreBtn.disabled = false;
          loadMoreBtn.textContent = 'Load More Contests';
        }
      }
    }
  } catch (error) {
    console.error('Failed to load contests:', error);
    
    if (currentPage === 1) {
      // Show error message
      contestsGrid.innerHTML = `
        <div class="error-message">
          <p>Failed to load contests. Please try again later.</p>
          <button id="retry-load-contests" class="btn btn-primary">Retry</button>
        </div>
      `;
      
      // Add retry handler
      const retryButton = document.getElementById('retry-load-contests');
      if (retryButton) {
        retryButton.addEventListener('click', () => loadContests());
      }
      
      // Hide load more button
      if (loadMoreContainer) {
        loadMoreContainer.style.display = 'none';
      }
    } else {
      // Just show a notification for errors on subsequent pages
      showNotification('Failed to load more contests. Please try again.', 'error');
      
      // Reset load more button
      const loadMoreBtn = document.getElementById('load-more-btn');
      if (loadMoreBtn) {
        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = 'Load More Contests';
      }
    }
  } finally {
    isLoading = false;
  }
}

/**
 * Handles contest search
 */
async function handleSearch() {
  const searchResults = document.getElementById('search-results');
  
  if (!searchResults) return;
  
  // Clear previous results
  searchResults.innerHTML = '';
  
  // Hide results if search query is empty
  if (!searchQuery) {
    searchResults.style.display = 'none';
    
    // If we were previously searching, reload the normal contests view
    if (isSearching) {
      isSearching = false;
      currentPage = 1;
      loadContests();
    }
    return;
  }
  
  // Show loading indicator
  searchResults.innerHTML = `
    <div class="search-loading">
      <svg class="spinner small" viewBox="0 0 50 50">
        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
      </svg>
      <span>Searching...</span>
    </div>
  `;
  searchResults.style.display = 'block';
  
  try {
    // Search contests
    const results = await api.searchContests(searchQuery);
    
    // Update display
    if (results.length === 0) {
      searchResults.innerHTML = `
        <div class="search-no-results">
          <p>No results found for "${searchQuery}"</p>
        </div>
      `;
    } else {
      searchResults.innerHTML = '';
      
      // Display up to 5 results in dropdown
      results.slice(0, 5).forEach(contest => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.innerHTML = `
          <div class="result-image">
            <img src="${contest.banner || './images/default-contest-banner.png'}" alt="${contest.title}">
          </div>
          <div class="result-content">
            <h4>${contest.title}</h4>
            <p>${contest.about_company?.name || 'Company'}</p>
          </div>
        `;
        
        // Add click handler to navigate to contest
        item.addEventListener('click', () => {
          window.router.navigate(`/contests/${contest._id}`);
        });
        
        searchResults.appendChild(item);
      });
      
      // If there are more results, add a "View all" link
      if (results.length > 5) {
        const viewAll = document.createElement('div');
        viewAll.className = 'search-view-all';
        viewAll.textContent = `View all ${results.length} results`;
        
        viewAll.addEventListener('click', () => {
          // Update the contests grid with all search results
          const contestsGrid = document.getElementById('contests-grid');
          const loadMoreContainer = document.getElementById('load-more-container');
          
          if (contestsGrid) {
            isSearching = true;
            contestsGrid.innerHTML = '';
            
            results.forEach(contest => {
              const card = createContestCard(contest, true);
              contestsGrid.appendChild(card);
            });
            
            // Hide load more button during search
            if (loadMoreContainer) {
              loadMoreContainer.style.display = 'none';
            }
            
            // Close search dropdown
            searchResults.style.display = 'none';
          }
        });
        
        searchResults.appendChild(viewAll);
      }
    }
  } catch (error) {
    console.error('Search failed:', error);
    
    searchResults.innerHTML = `
      <div class="search-error">
        <p>Search failed. Please try again.</p>
      </div>
    `;
  }
  
  // Hide search results when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-container') && searchResults) {
      searchResults.style.display = 'none';
    }
  });
}