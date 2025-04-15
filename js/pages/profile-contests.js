/**
 * Profile contests page for the Joridiro application
 */
import * as api from '../api.js';
import { store } from '../store.js';
import { showNotification } from '../components/notification.js';
import { renderProfileSidebar } from './profile.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { calculateContestProgress } from '../utils/contest-helpers.js';

/**
 * Renders the user's contests page
 */
export async function renderProfileContestsPage() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;
  
  const user = store.getState().user;
  if (!user) {
    // Redirect to home if not logged in
    window.router.navigate('/');
    return;
  }
  
  // Set initial loading state
  appContainer.innerHTML = `
    <div class="profile-container">
      ${renderProfileSidebar(user, 'contests')}
      
      <div class="profile-content">
        <header class="profile-header">
          <h1>My Contests</h1>
        </header>
        
        <div class="profile-contests">
          <div class="loading-spinner">
            <svg class="spinner" viewBox="0 0 50 50">
              <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
            </svg>
            <span>Loading your contests...</span>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Load user's contests
  loadUserContests();
}

/**
 * Loads and displays the user's contests
 */
async function loadUserContests() {
  const contestsContainer = document.querySelector('.profile-contests');
  if (!contestsContainer) return;
  
  try {
    // Fetch user's contests
    const contests = await api.getUserContests();
    
    if (!contests || contests.length === 0) {
      // Show empty state
      contestsContainer.innerHTML = `
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"></path>
            <path d="M9.09 9C9.09 9 9.85 7.41 12 7.41C14.15 7.41 15.01 9.09 15.01 9.09C15.01 9.09 15.63 10.85 14.57 11.91C13.51 12.97 12.47 13.44 12 13.92C11.56 14.37 11.27 15 11.27 15"></path>
            <path d="M12 18.01L12.01 18"></path>
          </svg>
          <h3>No Contests Yet</h3>
          <p>You haven't participated in any contests yet.</p>
          <a href="/contests" class="btn btn-primary">Explore Contests</a>
        </div>
      `;
      return;
    }
    
    // Render contests table
    contestsContainer.innerHTML = `
      <div class="contests-participated">
        <p class="section-subtitle">Contests in which you have participated</p>
        
        <div class="contests-table">
          <div class="table-header">
            <div class="table-cell contest-name">Contest Name</div>
            <div class="table-cell deadline-target">Deadline/Target</div>
            <div class="table-cell my-points">My Points</div>
            <div class="table-cell ranking">Ranking</div>
            <div class="table-cell status">Status</div>
            <div class="table-cell prize-pool">Prize Pool</div>
            <div class="table-cell actions">Actions</div>
          </div>
          
          <div class="table-body">
            ${contests.map(contest => {
              const progress = calculateContestProgress(contest);
              
              return `
                <div class="table-row">
                  <div class="table-cell contest-name">
                    <a href="/contests/${contest._id}" class="contest-link">
                      ${contest.title}
                    </a>
                  </div>
                  
                  <div class="table-cell deadline-target">
                    <div class="progress-bar-container">
                      <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress.progressPercentage}%; background-color: ${contest.type === 'SCORE' ? 'var(--purple1)' : 'var(--green1)'}"></div>
                      </div>
                      <div class="progress-text">
                        ${contest.type === 'SCORE' 
                          ? `${progress.currentScore}/${progress.targetScore} points` 
                          : `${progress.daysRemaining} days remaining`}
                      </div>
                    </div>
                  </div>
                  
                  <div class="table-cell my-points">${contest.score || 0}</div>
                  
                  <div class="table-cell ranking">${contest.rank || '-'}</div>
                  
                  <div class="table-cell status">
                    <span class="status-badge ${contest.open ? 'status-open' : 'status-closed'}">
                      ${contest.open ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  
                  <div class="table-cell prize-pool">${formatCurrency(contest.grandPrize?.amount || 0)}</div>
                  
                  <div class="table-cell actions">
                    <a href="/contests/${contest._id}" class="btn btn-small btn-outline">View</a>
                    ${contest.open ? `
                      <button class="btn btn-small btn-primary update-score-btn" data-contest-id="${contest._id}">
                        Update Score
                      </button>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
      
      <div class="organized-contests">
        <h2>Contests You Organized</h2>
        <a href="/contests/create" class="btn btn-primary create-contest-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create New Contest
        </a>
        
        ${renderOrganizedContests(contests)}
      </div>
    `;
    
    // Set up update score buttons
    setupUpdateScoreButtons();
  } catch (error) {
    console.error('Failed to load user contests:', error);
    
    // Show error state
    contestsContainer.innerHTML = `
      <div class="error-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h3>Error Loading Contests</h3>
        <p>We couldn't load your contests at this time. Please try again later.</p>
        <button class="btn btn-primary retry-btn">Retry</button>
      </div>
    `;
    
    // Add retry button handler
    const retryButton = contestsContainer.querySelector('.retry-btn');
    if (retryButton) {
      retryButton.addEventListener('click', loadUserContests);
    }
  }
}

/**
 * Renders the contests organized by the user
 * @param {Array} contests - All user contests
 * @returns {string} HTML for organized contests
 */
function renderOrganizedContests(contests) {
  const user = store.getState().user;
  if (!user) return '';
  
  // Filter contests organized by the user
  const organizedContests = contests.filter(contest => contest.organizer === user._id);
  
  if (organizedContests.length === 0) {
    return `
      <div class="empty-organized">
        <p>You haven't organized any contests yet.</p>
      </div>
    `;
  }
  
  return `
    <div class="organized-table">
      <div class="table-header">
        <div class="table-cell contest-name">Contest Name</div>
        <div class="table-cell created-date">Created Date</div>
        <div class="table-cell participants">Participants</div>
        <div class="table-cell status">Status</div>
        <div class="table-cell actions">Actions</div>
      </div>
      
      <div class="table-body">
        ${organizedContests.map(contest => `
          <div class="table-row">
            <div class="table-cell contest-name">
              <a href="/contests/${contest._id}" class="contest-link">
                ${contest.title}
              </a>
            </div>
            
            <div class="table-cell created-date">
              ${formatDate(contest.startDate)}
            </div>
            
            <div class="table-cell participants">
              ${contest.participants?.length || 0}
            </div>
            
            <div class="table-cell status">
              <span class="status-badge ${contest.open ? 'status-open' : 'status-closed'}">
                ${contest.open ? 'Open' : 'Closed'}
              </span>
            </div>
            
            <div class="table-cell actions">
              <a href="/contests/${contest._id}" class="btn btn-small btn-outline">View</a>
              <a href="/contests/${contest._id}/edit" class="btn btn-small btn-primary">Edit</a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Sets up event handlers for update score buttons
 */
function setupUpdateScoreButtons() {
  const updateButtons = document.querySelectorAll('.update-score-btn');
  
  updateButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const contestId = button.dataset.contestId;
      if (!contestId) return;
      
      try {
        // Fetch contest details to get scoring categories
        const contestData = await api.getContestDetails(contestId);
        
        if (!contestData || !contestData.contest) {
          showNotification('Failed to load contest details', 'error');
          return;
        }
        
        // Show update score modal
        showUpdateScoreModal(contestData.contest, contestData.score);
      } catch (error) {
        console.error('Failed to load contest details:', error);
        showNotification('Failed to load contest details', 'error');
      }
    });
  });
}

/**
 * Shows the update score modal for a contest
 * @param {Object} contest - Contest data
 * @param {Object} userScore - User's current score data
 */
function showUpdateScoreModal(contest, userScore) {
  // Import dynamically to avoid circular dependencies
  import('../components/modal.js').then(({ createModal }) => {
    const scoreCategories = contest.score || [];
    
    if (scoreCategories.length === 0) {
      showNotification('No scoring categories found for this contest', 'error');
      return;
    }
    
    const content = document.createElement('div');
    content.innerHTML = `
      <form id="update-score-form" class="modal-form" data-contest-id="${contest._id}">
        <p class="form-description">
          Update your progress for "${contest.title}" by entering your current values below.
        </p>
        
        ${scoreCategories.map(category => {
          const currentValue = userScore?.score?.find(s => s.category === category._id)?.value || 0;
          
          return `
            <div class="form-group">
              <label for="score-${category._id}">${category.description || `${category.measuring_unit}`}</label>
              <div class="score-input-group">
                <input 
                  type="number" 
                  id="score-${category._id}" 
                  name="score-${category._id}" 
                  value="${currentValue}" 
                  min="0" 
                  step="1"
                  data-category="${category._id}"
                  data-points="${category.points}"
                  data-number="${category.number}"
                >
                <span class="input-suffix">${category.measuring_unit}</span>
              </div>
              <div class="score-calculation">
                <span class="points-label">Points: </span>
                <span class="points-value" id="points-${category._id}">
                  ${Math.floor((currentValue / category.number) * category.points)}
                </span>
              </div>
            </div>
          `;
        }).join('')}
        
        <div class="total-score">
          <span>Total Score: </span>
          <span id="total-score">0</span>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Update Score</button>
          <button type="button" class="btn btn-text" id="cancel-update">Cancel</button>
        </div>
      </form>
    `;
    
    const modal = createModal({
      title: 'Update Your Score',
      content,
      className: 'update-score-modal'
    });
    
    // Set up score calculation
    const form = content.querySelector('#update-score-form');
    const totalScoreDisplay = form.querySelector('#total-score');
    const scoreInputs = form.querySelectorAll('input[type="number"]');
    
    function updateTotalScore() {
      let totalScore = 0;
      
      scoreInputs.forEach(input => {
        const value = parseFloat(input.value) || 0;
        const points = parseFloat(input.dataset.points) || 0;
        const number = parseFloat(input.dataset.number) || 1;
        
        const categoryPoints = Math.floor((value / number) * points);
        form.querySelector(`#points-${input.dataset.category}`).textContent = categoryPoints;
        
        totalScore += categoryPoints;
      });
      
      totalScoreDisplay.textContent = totalScore;
    }
    
    // Update initial total score
    updateTotalScore();
    
    // Add change listeners to inputs
    scoreInputs.forEach(input => {
      input.addEventListener('input', updateTotalScore);
    });
    
    // Handle form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const contestId = form.dataset.contestId;
      
      const scoreData = Array.from(scoreInputs).map(input => ({
        category: input.dataset.category,
        value: parseFloat(input.value) || 0
      }));
      
      // Disable form and show loading state
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.innerHTML = `
        <svg class="spinner small" viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
        </svg>
        <span>Updating...</span>
      `;
      
      try {
        await api.updateScore(contestId, { score: scoreData });
        
        showNotification('Your score has been updated', 'success');
        
        // Close modal and reload page
        if (modal.querySelector('.modal-close')) {
          modal.querySelector('.modal-close').click();
        }
        
        // Reload contests data
        loadUserContests();
      } catch (error) {
        console.error('Failed to update score:', error);
        showNotification('Failed to update score', 'error');
        
        // Re-enable form
        submitButton.disabled = false;
        submitButton.textContent = 'Update Score';
      }
    });
    
    // Handle cancel button
    const cancelBtn = form.querySelector('#cancel-update');
    cancelBtn.addEventListener('click', () => {
      if (modal.querySelector('.modal-close')) {
        modal.querySelector('.modal-close').click();
      }
    });
  });
}