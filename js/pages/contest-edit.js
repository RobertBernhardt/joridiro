/**
 * Contest edit page for the Joridiro application
 */
import * as api from '../api.js';
import { store } from '../store.js';
import { showNotification } from '../components/notification.js';
import { formatCurrency } from '../utils/formatters.js';
import { getPrizeForSize, getDurationForSize } from '../utils/contest-helpers.js';

// Contest editing state
let contestEditState = null;

// Form validation state
let formErrors = {
  PRIZE: {},
  SCORE: {},
  RULES: {},
  REQUIREMENTS: {},
  ABOUT_CONTEST: {},
  ABOUT_COMPANY: {}
};

/**
 * Renders the contest edit page
 * @param {string} contestId - ID of the contest to edit
 */
export async function renderContestEditPage(contestId) {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;
  
  const user = store.getState().user;
  if (!user) {
    // Redirect to home if not logged in
    window.router.navigate('/');
    return;
  }
  
  // Show loading state
  appContainer.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner">
        <svg class="spinner" viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
        </svg>
        <span>Loading contest data...</span>
      </div>
    </div>
  `;
  
  try {
    // Fetch contest details
    const contestData = await api.getContestDetails(contestId);
    
    if (!contestData || !contestData.contest) {
      throw new Error('Contest not found');
    }
    
    const contest = contestData.contest;
    
    // Check if user is the organizer
    if (contest.organizer !== user._id) {
      throw new Error('Unauthorized');
    }
    
    // Initialize edit state with contest data
    initializeEditState(contest);
    
    // Render the edit page
    renderEditPage(appContainer);
    
    // Set up event handlers
    setupEventHandlers();
  } catch (error) {
    console.error('Failed to load contest details:', error);
    
    // Show error message
    appContainer.innerHTML = `
      <div class="error-container">
        <h2>Could Not Load Contest</h2>
        <p>${error.message === 'Unauthorized' ? 
          'You do not have permission to edit this contest.' : 
          'The contest could not be loaded. It may have been removed or is unavailable.'}
        </p>
        <a href="/contests" class="btn btn-primary">Back to Contests</a>
      </div>
    `;
  }
}

/**
 * Initializes the edit state with contest data
 * @param {Object} contest - Contest data
 */
function initializeEditState(contest) {
  // Deep clone the contest object to avoid modifying the original
  contestEditState = JSON.parse(JSON.stringify(contest));
  
  // Ensure dates are properly formatted
  contestEditState.startDate = new Date(contest.startDate);
  contestEditState.endDate = new Date(contest.endDate);
  
  // Convert milestones dates to Date objects
  if (contestEditState.milestones) {
    contestEditState.milestones.forEach(milestone => {
      if (milestone.date) {
        milestone.date = new Date(milestone.date);
      }
    });
  }
  
  // Reset form errors
  formErrors = {
    PRIZE: {},
    SCORE: {},
    RULES: {},
    REQUIREMENTS: {},
    ABOUT_CONTEST: {},
    ABOUT_COMPANY: {}
  };
}

/**
 * Renders the contest edit page
 * @param {HTMLElement} container - Container element
 */
function renderEditPage(container) {
  container.innerHTML = `
    <div class="edit-contest-container">
      <div class="pageheader">EDIT YOUR CONTEST</div>
      
      <form id="edit-contest-form" class="edit-form">
        ${renderPrizeSection()}
        ${renderScoringSection()}
        ${renderRulesSection()}
        ${renderRequirementsSection()}
        ${renderAboutContestSection()}
        ${renderAboutCompanySection()}
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Save Changes</button>
          <a href="/contests/${contestEditState._id}" class="btn btn-text">Cancel</a>
        </div>
      </form>
    </div>
  `;
}

/**
 * Renders the prize section
 * @returns {string} Prize section HTML
 */
function renderPrizeSection() {
  return `
    <div class="edit-form-section" id="contest-prize-section">
      <h2 class="section-title">Contest Prize</h2>
      
      <div class="form-group">
        <label for="contest-title">Contest Title</label>
        <input 
          type="text" 
          id="contest-title" 
          name="title" 
          value="${contestEditState.title}" 
          placeholder="Enter a title for your contest"
          required
        >
        <div class="error-message" id="title-error">${formErrors.PRIZE.title || ''}</div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Contest Type</label>
          <div class="toggle-buttons disabled">
            <button 
              type="button" 
              class="toggle-button ${contestEditState.type === 'DEADLINE' ? 'active' : ''}" 
              disabled
            >
              Deadline-based
            </button>
            <button 
              type="button" 
              class="toggle-button ${contestEditState.type === 'SCORE' ? 'active' : ''}" 
              disabled
            >
              Score-based
            </button>
          </div>
          <p class="form-help-text">
            Contest type cannot be changed after creation.
          </p>
        </div>
        
        <div class="form-group">
          <label>Contest Size</label>
          <div class="toggle-buttons disabled">
            <button 
              type="button" 
              class="toggle-button ${contestEditState.size === 'SMALL' ? 'active' : ''}" 
              disabled
            >
              Small
            </button>
            <button 
              type="button" 
              class="toggle-button ${contestEditState.size === 'MEDIUM' ? 'active' : ''}" 
              disabled
            >
              Medium
            </button>
            <button 
              type="button" 
              class="toggle-button ${contestEditState.size === 'LARGE' ? 'active' : ''}" 
              disabled
            >
              Large
            </button>
          </div>
          <p class="form-help-text">
            Contest size cannot be changed after creation.
          </p>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="start-date">Start Date</label>
          <input 
            type="date" 
            id="start-date" 
            name="startDate" 
            value="${formatDateForInput(contestEditState.startDate)}"
            min="${formatDateForInput(new Date())}"
            ${new Date() > contestEditState.startDate ? 'disabled' : ''}
          >
          <div class="error-message" id="startDate-error">${formErrors.PRIZE.startDate || ''}</div>
          ${new Date() > contestEditState.startDate ? 
            '<p class="form-help-text">Contest has already started and start date cannot be changed.</p>' : 
            ''}
        </div>
        
        <div class="form-group">
          <label for="end-date">End Date</label>
          <input 
            type="date" 
            id="end-date" 
            name="endDate" 
            value="${formatDateForInput(contestEditState.endDate)}"
            min="${formatDateForInput(new Date(new Date().setDate(new Date().getDate() + 1)))}"
            ${new Date() > contestEditState.endDate ? 'disabled' : ''}
          >
          <div class="error-message" id="endDate-error">${formErrors.PRIZE.endDate || ''}</div>
          ${new Date() > contestEditState.endDate ? 
            '<p class="form-help-text">Contest has already ended and end date cannot be changed.</p>' : 
            ''}
        </div>
      </div>
      
      <div class="prize-summary">
        <div class="prize-card">
          <h3>Grand Prize</h3>
          <div class="prize-amount">${formatCurrency(contestEditState.grandPrize.amount)}</div>
        </div>
        
        ${contestEditState.lotteryPrize && contestEditState.lotteryPrize.amount > 0 ? `
          <div class="prize-card">
            <h3>Lottery Prize</h3>
            <div class="prize-amount">${formatCurrency(contestEditState.lotteryPrize.amount)}</div>
          </div>
        ` : ''}
        
        ${contestEditState.milestones && contestEditState.milestones.length > 0 ? `
          <div class="prize-card">
            <h3>Milestone Prizes</h3>
            <ul class="milestone-list">
              ${contestEditState.milestones.map((milestone, index) => `
                <li>
                  ${formatCurrency(milestone.prize)} at 
                  ${contestEditState.type === 'DEADLINE' ? 
                    `${formatDateForInput(milestone.date)}` : 
                    `${milestone.points} points`}
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Renders the scoring section
 * @returns {string} Scoring section HTML
 */
function renderScoringSection() {
  return `
    <div class="edit-form-section" id="scoring-section">
      <h2 class="section-title">How to Score</h2>
      <p class="section-description">
        Define how participants will earn points in your contest. You can add multiple scoring categories.
      </p>
      
      <div class="scoring-categories">
        ${contestEditState.score && contestEditState.score.length > 0 ? 
          contestEditState.score.map((category, index) => `
            <div class="scoring-category" data-index="${index}">
              <div class="category-header">
                <h3>Scoring Category #${index + 1}</h3>
                <button type="button" class="btn btn-icon remove-category-btn" data-index="${index}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="points-${index}">Points</label>
                  <input 
                    type="number" 
                    id="points-${index}" 
                    name="points-${index}" 
                    value="${category.points}" 
                    min="1"
                    data-index="${index}"
                    data-field="points"
                  >
                  <div class="error-message" id="points-${index}-error">${formErrors.SCORE[`points-${index}`] || ''}</div>
                </div>
                
                <div class="form-group">
                  <label for="number-${index}">For Every</label>
                  <input 
                    type="number" 
                    id="number-${index}" 
                    name="number-${index}" 
                    value="${category.number}" 
                    min="1" 
                    data-index="${index}"
                    data-field="number"
                  >
                  <div class="error-message" id="number-${index}-error">${formErrors.SCORE[`number-${index}`] || ''}</div>
                </div>
                
                <div class="form-group">
                  <label for="unit-${index}">Unit</label>
                  <input 
                    type="text" 
                    id="unit-${index}" 
                    name="unit-${index}" 
                    value="${category.measuring_unit}" 
                    placeholder="e.g., actions, purchases, shares"
                    data-index="${index}"
                    data-field="measuring_unit"
                  >
                  <div class="error-message" id="unit-${index}-error">${formErrors.SCORE[`unit-${index}`] || ''}</div>
                </div>
              </div>
              
              <div class="form-group">
                <label for="description-${index}">Description</label>
                <textarea 
                  id="description-${index}" 
                  name="description-${index}" 
                  placeholder="Describe how participants earn these points..."
                  rows="2"
                  data-index="${index}"
                  data-field="description"
                >${category.description}</textarea>
                <div class="error-message" id="description-${index}-error">${formErrors.SCORE[`description-${index}`] || ''}</div>
              </div>
            </div>
          `).join('') : 
          `<div class="no-categories">
            <p>No scoring categories added yet. Add your first category below.</p>
          </div>`
        }
      </div>
      
      <button type="button" class="btn btn-outline btn-block add-category-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add Scoring Category
      </button>
    </div>
  `;
}

/**
 * Renders the rules section
 * @returns {string} Rules section HTML
 */
function renderRulesSection() {
  return `
    <div class="edit-form-section" id="rules-section">
      <h2 class="section-title">Contest Rules</h2>
      <p class="section-description">
        Define the rules that participants must follow in your contest.
      </p>
      
      <div class="rules-list">
        ${contestEditState.rules && contestEditState.rules.length > 0 ? 
          contestEditState.rules.map((rule, index) => `
            <div class="rule-item" data-index="${index}">
              <div class="form-group">
                <div class="rule-input-group">
                  <input 
                    type="text" 
                    id="rule-${index}" 
                    name="rule-${index}" 
                    value="${rule}" 
                    placeholder="Enter rule"
                    data-index="${index}"
                  >
                  <button type="button" class="btn btn-icon remove-rule-btn" data-index="${index}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
                <div class="error-message" id="rule-${index}-error">${formErrors.RULES[`rule-${index}`] || ''}</div>
              </div>
            </div>
          `).join('') : 
          `<div class="no-rules">
            <p>No rules added yet. Add your first rule below.</p>
          </div>`
        }
      </div>
      
      <button type="button" class="btn btn-outline btn-block add-rule-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add Rule
      </button>
    </div>
  `;
}

/**
 * Renders the requirements section
 * @returns {string} Requirements section HTML
 */
function renderRequirementsSection() {
  // Ensure requirements object exists
  const requirements = contestEditState.requirements || {
    organizer_platform: '',
    countries: [],
    roles: [],
    additional: []
  };
  
  return `
    <div class="edit-form-section" id="requirements-section">
      <h2 class="section-title">Contest Requirements</h2>
      <p class="section-description">
        Define any specific requirements for participants to join your contest.
      </p>
      
      <div class="form-group">
        <label for="platform-url">Platform URL</label>
        <input 
          type="url" 
          id="platform-url" 
          name="platform-url" 
          value="${requirements.organizer_platform || ''}" 
          placeholder="Enter the URL of your platform or website (optional)"
        >
        <p class="form-help-text">If your contest requires participants to use a specific platform or website, enter its URL here.</p>
        <div class="error-message" id="platform-url-error">${formErrors.REQUIREMENTS['platform-url'] || ''}</div>
      </div>
      
      <div class="form-group">
        <label>Location Requirements</label>
        <div class="tags-input-container">
          <div class="tags-list">
            ${(requirements.countries || []).map((country, index) => `
              <div class="tag" data-index="${index}">
                <span>${country}</span>
                <button type="button" class="remove-tag-btn" data-type="countries" data-index="${index}">×</button>
              </div>
            `).join('')}
          </div>
          <input 
            type="text" 
            id="countries-input" 
            placeholder="Add location requirement and press Enter"
            class="tags-input"
            data-type="countries"
          >
        </div>
        <p class="form-help-text">Specify locations where participants must be based (e.g., Germany, Berlin, Europe). Leave empty for no location restriction.</p>
        <div class="error-message" id="countries-error">${formErrors.REQUIREMENTS.countries || ''}</div>
      </div>
      
      <div class="form-group">
        <label>Role Requirements</label>
        <div class="tags-input-container">
          <div class="tags-list">
            ${(requirements.roles || []).map((role, index) => `
              <div class="tag" data-index="${index}">
                <span>${role}</span>
                <button type="button" class="remove-tag-btn" data-type="roles" data-index="${index}">×</button>
              </div>
            `).join('')}
          </div>
          <input 
            type="text" 
            id="roles-input" 
            placeholder="Add role requirement and press Enter"
            class="tags-input"
            data-type="roles"
          >
        </div>
        <p class="form-help-text">Specify roles participants must have (e.g., Business Owner, Developer, Marketing Professional). Leave empty for no role restriction.</p>
        <div class="error-message" id="roles-error">${formErrors.REQUIREMENTS.roles || ''}</div>
      </div>
      
      <div class="form-group">
        <label>Additional Requirements</label>
        <div class="additional-requirements">
          ${(requirements.additional || []).length > 0 ? 
            requirements.additional.map((req, index) => `
              <div class="additional-requirement" data-index="${index}">
                <div class="form-row">
                  <div class="form-group">
                    <label for="req-name-${index}">Requirement</label>
                    <input 
                      type="text" 
                      id="req-name-${index}" 
                      name="req-name-${index}" 
                      value="${req.name}" 
                      placeholder="Enter requirement name"
                      data-index="${index}"
                      data-field="name"
                    >
                    <div class="error-message" id="req-name-${index}-error">${formErrors.REQUIREMENTS[`req-name-${index}`] || ''}</div>
                  </div>
                  
                  <div class="form-group flex-grow">
                    <label for="req-desc-${index}">Description</label>
                    <input 
                      type="text" 
                      id="req-desc-${index}" 
                      name="req-desc-${index}" 
                      value="${req.description}" 
                      placeholder="Enter requirement description"
                      data-index="${index}"
                      data-field="description"
                    >
                    <div class="error-message" id="req-desc-${index}-error">${formErrors.REQUIREMENTS[`req-desc-${index}`] || ''}</div>
                  </div>
                  
                  <div class="form-group">
                    <label>&nbsp;</label>
                    <button type="button" class="btn btn-icon remove-requirement-btn" data-index="${index}">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            `).join('') : 
            `<div class="no-requirements">
              <p>No additional requirements added yet. Add your first requirement below.</p>
            </div>`
          }
        </div>
        
        <button type="button" class="btn btn-outline btn-block add-requirement-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Requirement
        </button>
      </div>
    </div>
  `;
}

/**
 * Renders the about contest section
 * @returns {string} About contest section HTML
 */
function renderAboutContestSection() {
  // Ensure about_contest object exists
  const aboutContest = contestEditState.about_contest || {
    short_description: '',
    target_audience: '',
    purpose: '',
    how_to_win: '',
    boost: '',
    tags: []
  };
  
  return `
    <div class="edit-form-section" id="about-contest-section">
      <h2 class="section-title">About Your Contest</h2>
      <p class="section-description">
        Provide details about your contest to help participants understand its purpose and goals.
      </p>
      
      <div class="form-group">
        <label for="contest-description">Contest Description</label>
        <textarea 
          id="contest-description" 
          name="short_description" 
          rows="4" 
          placeholder="Provide a brief description of your contest"
          required
        >${aboutContest.short_description || ''}</textarea>
        <div class="error-message" id="short_description-error">${formErrors.ABOUT_CONTEST.short_description || ''}</div>
      </div>
      
      <div class="form-group">
        <label for="target-audience">Target Audience</label>
        <textarea 
          id="target-audience" 
          name="target_audience" 
          rows="3" 
          placeholder="Describe who should participate in your contest"
        >${aboutContest.target_audience || ''}</textarea>
        <div class="error-message" id="target_audience-error">${formErrors.ABOUT_CONTEST.target_audience || ''}</div>
      </div>
      
      <div class="form-group">
        <label for="contest-purpose">Contest Purpose</label>
        <textarea 
          id="contest-purpose" 
          name="purpose" 
          rows="3" 
          placeholder="Explain the purpose and goals of your contest"
        >${aboutContest.purpose || ''}</textarea>
        <div class="error-message" id="purpose-error">${formErrors.ABOUT_CONTEST.purpose || ''}</div>
      </div>
      
      <div class="form-group">
        <label for="how-to-win">How to Win</label>
        <textarea 
          id="how-to-win" 
          name="how_to_win" 
          rows="3" 
          placeholder="Explain how participants can win your contest"
        >${aboutContest.how_to_win || ''}</textarea>
        <div class="error-message" id="how_to_win-error">${formErrors.ABOUT_CONTEST.how_to_win || ''}</div>
      </div>
      
      <div class="form-group">
        <label for="boost">What You Bring to the Table</label>
        <textarea 
          id="boost" 
          name="boost" 
          rows="3" 
          placeholder="Describe what you offer to participants (e.g., support, resources)"
        >${aboutContest.boost || ''}</textarea>
        <div class="error-message" id="boost-error">${formErrors.ABOUT_CONTEST.boost || ''}</div>
      </div>
      
      <div class="form-group">
        <label>Contest Tags</label>
        <div class="tags-input-container">
          <div class="tags-list">
            ${(aboutContest.tags || []).map((tag, index) => `
              <div class="tag" data-index="${index}">
                <span>${tag}</span>
                <button type="button" class="remove-tag-btn" data-type="tags" data-index="${index}">×</button>
              </div>
            `).join('')}
          </div>
          <input 
            type="text" 
            id="tags-input" 
            placeholder="Add tag and press Enter"
            class="tags-input"
            data-type="tags"
          >
        </div>
        <p class="form-help-text">Add tags to help participants find your contest.</p>
        <div class="error-message" id="tags-error">${formErrors.ABOUT_CONTEST.tags || ''}</div>
      </div>
    </div>
  `;
}

/**
 * Renders the about company section
 * @returns {string} About company section HTML
 */
function renderAboutCompanySection() {
  // Ensure about_company object exists
  const aboutCompany = contestEditState.about_company || {
    name: '',
    link: '',
    logo: null,
    description: ''
  };
  
  return `
    <div class="edit-form-section" id="about-company-section">
      <h2 class="section-title">About Your Company</h2>
      <p class="section-description">
        Provide information about your company or organization.
      </p>
      
      <div class="form-group">
        <label for="company-name">Company Name</label>
        <input 
          type="text" 
          id="company-name" 
          name="company_name" 
          value="${aboutCompany.name || ''}" 
          placeholder="Enter your company name"
          required
        >
        <div class="error-message" id="company_name-error">${formErrors.ABOUT_COMPANY.company_name || ''}</div>
      </div>
      
      <div class="form-group">
        <label for="company-link">Company Website</label>
        <input 
          type="url" 
          id="company-link" 
          name="company_link" 
          value="${aboutCompany.link || ''}" 
          placeholder="Enter your company website"
        >
        <div class="error-message" id="company_link-error">${formErrors.ABOUT_COMPANY.company_link || ''}</div>
      </div>
      
      <div class="form-group">
        <label for="company-description">Company Description</label>
        <textarea 
          id="company-description" 
          name="company_description" 
          rows="4" 
          placeholder="Provide a brief description of your company"
        >${aboutCompany.description || ''}</textarea>
        <div class="error-message" id="company_description-error">${formErrors.ABOUT_COMPANY.company_description || ''}</div>
      </div>
      
      <div class="form-group">
        <label>Company Logo</label>
        <div class="logo-upload">
          <div class="logo-preview">
            ${aboutCompany.logo ? 
              `<img src="${aboutCompany.logo}" alt="Company Logo">` : 
              `<div class="no-logo">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>`
            }
          </div>
          <div class="upload-controls">
            <input type="file" id="logo-upload" accept="image/*" hidden>
            <button type="button" id="upload-logo-btn" class="btn btn-outline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Upload Logo
            </button>
            ${aboutCompany.logo ? 
              `<button type="button" id="remove-logo-btn" class="btn btn-text">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Remove
              </button>` : 
              ''
            }
          </div>
        </div>
        <p class="form-help-text">Upload your company logo. Recommended size: 300x300px.</p>
        <div class="error-message" id="company_logo-error">${formErrors.ABOUT_COMPANY.company_logo || ''}</div>
      </div>
      
      <div class="form-group">
        <label>Contest Banner</label>
        <div class="banner-upload">
          <div class="banner-preview">
            ${contestEditState.banner ? 
              `<img src="${contestEditState.banner}" alt="Contest Banner">` : 
              `<div class="no-banner">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>`
            }
          </div>
          <div class="upload-controls">
            <input type="file" id="banner-upload" accept="image/*" hidden>
            <button type="button" id="upload-banner-btn" class="btn btn-outline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Upload Banner
            </button>
            ${contestEditState.banner ? 
              `<button type="button" id="remove-banner-btn" class="btn btn-text">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Remove
              </button>` : 
              ''
            }
          </div>
        </div>
        <p class="form-help-text">Upload a banner for your contest. Recommended size: 1200x400px.</p>
        <div class="error-message" id="contest_banner-error">${formErrors.ABOUT_COMPANY.contest_banner || ''}</div>
      </div>
    </div>
  `;
}

/**
 * Sets up event handlers for the form
 */
function setupEventHandlers() {
  // Form submission
  const form = document.getElementById('edit-contest-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
  
  // Date inputs
  setupDateInputHandlers();
  
  // Title input
  const titleInput = document.getElementById('contest-title');
  if (titleInput) {
    titleInput.addEventListener('input', () => {
      contestEditState.title = titleInput.value.trim();
    });
  }
  
  // Scoring section handlers
  setupScoringHandlers();
  
  // Rules section handlers
  setupRulesHandlers();
  
  // Requirements section handlers
  setupRequirementsHandlers();
  
  // About contest section handlers
  setupAboutContestHandlers();
  
  // About company section handlers
  setupAboutCompanyHandlers();
}

/**
 * Sets up date input handlers
 */
function setupDateInputHandlers() {
  // Start date input
  const startDateInput = document.getElementById('start-date');
  if (startDateInput && !startDateInput.disabled) {
    startDateInput.addEventListener('change', () => {
      const startDate = new Date(startDateInput.value);
      if (!isNaN(startDate.getTime())) {
        contestEditState.startDate = startDate;
        
        // Update end date input min value
        const endDateInput = document.getElementById('end-date');
        if (endDateInput) {
          const minEndDate = new Date(startDate);
          minEndDate.setDate(minEndDate.getDate() + 1);
          endDateInput.min = formatDateForInput(minEndDate);
        }
      }
    });
  }
  
  // End date input
  const endDateInput = document.getElementById('end-date');
  if (endDateInput && !endDateInput.disabled) {
    endDateInput.addEventListener('change', () => {
      const endDate = new Date(endDateInput.value);
      if (!isNaN(endDate.getTime())) {
        contestEditState.endDate = endDate;
      }
    });
  }
}

/**
 * Sets up scoring section handlers
 */
function setupScoringHandlers() {
  // Add category button
  const addCategoryBtn = document.querySelector('.add-category-btn');
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', () => {
      // Add new category
      if (!contestEditState.score) {
        contestEditState.score = [];
      }
      
      contestEditState.score.push({
        name: '1',
        number: 1,
        points: 1,
        measuring_unit: '',
        description: ''
      });
      
      // Re-render the scoring section
      document.getElementById('scoring-section').outerHTML = renderScoringSection();
      setupScoringHandlers();
    });
  }
  
  // Remove category buttons
  const removeCategoryBtns = document.querySelectorAll('.remove-category-btn');
  removeCategoryBtns.forEach(button => {
    button.addEventListener('click', () => {
      const index = parseInt(button.dataset.index);
      if (!isNaN(index) && index >= 0 && index < contestEditState.score.length) {
        // Remove category
        contestEditState.score.splice(index, 1);
        
        // Re-render the scoring section
        document.getElementById('scoring-section').outerHTML = renderScoringSection();
        setupScoringHandlers();
      }
    });
  });
  
  // Category field inputs
  const categoryInputs = document.querySelectorAll('.scoring-category input, .scoring-category textarea');
  categoryInputs.forEach(input => {
    input.addEventListener('input', () => {
      const index = parseInt(input.dataset.index);
      const field = input.dataset.field;
      
      if (!isNaN(index) && index >= 0 && index < contestEditState.score.length && field) {
        let value = input.value;
        
        // Convert to number for numeric fields
        if (field === 'points' || field === 'number') {
          value = parseInt(value) || 1;
        }
        
        // Update the field
        contestEditState.score[index][field] = value;
      }
    });
  });
}

/**
 * Sets up rules section handlers
 */
function setupRulesHandlers() {
  // Add rule button
  const addRuleBtn = document.querySelector('.add-rule-btn');
  if (addRuleBtn) {
    addRuleBtn.addEventListener('click', () => {
      // Add new rule
      if (!contestEditState.rules) {
        contestEditState.rules = [];
      }
      
      contestEditState.rules.push('');
      
      // Re-render the rules section
      document.getElementById('rules-section').outerHTML = renderRulesSection();
      setupRulesHandlers();
      
      // Focus the new rule input
      const newRuleIndex = contestEditState.rules.length - 1;
      const newRuleInput = document.getElementById(`rule-${newRuleIndex}`);
      if (newRuleInput) {
        newRuleInput.focus();
      }
    });
  }
  
  // Remove rule buttons
  const removeRuleBtns = document.querySelectorAll('.remove-rule-btn');
  removeRuleBtns.forEach(button => {
    button.addEventListener('click', () => {
      const index = parseInt(button.dataset.index);
      if (!isNaN(index) && index >= 0 && index < contestEditState.rules.length) {
        // Remove rule
        contestEditState.rules.splice(index, 1);
        
        // Re-render the rules section
        document.getElementById('rules-section').outerHTML = renderRulesSection();
        setupRulesHandlers();
      }
    });
  });
  
  // Rule inputs
  const ruleInputs = document.querySelectorAll('.rule-item input');
  ruleInputs.forEach(input => {
    input.addEventListener('input', () => {
      const index = parseInt(input.dataset.index);
      if (!isNaN(index) && index >= 0 && index < contestEditState.rules.length) {
        // Update rule
        contestEditState.rules[index] = input.value;
      }
    });
  });
}

/**
 * Sets up requirements section handlers
 */
function setupRequirementsHandlers() {
  // Ensure requirements object exists
  if (!contestEditState.requirements) {
    contestEditState.requirements = {
      organizer_platform: '',
      countries: [],
      roles: [],
      additional: []
    };
  }
  
  // Platform URL input
  const platformUrlInput = document.getElementById('platform-url');
  if (platformUrlInput) {
    platformUrlInput.addEventListener('input', () => {
      contestEditState.requirements.organizer_platform = platformUrlInput.value.trim();
    });
  }
  
  // Tags inputs (countries, roles)
  setupTagsInput('countries', contestEditState.requirements.countries || []);
  setupTagsInput('roles', contestEditState.requirements.roles || []);
  
  // Add requirement button
  const addRequirementBtn = document.querySelector('.add-requirement-btn');
  if (addRequirementBtn) {
    addRequirementBtn.addEventListener('click', () => {
      // Add new requirement
      if (!contestEditState.requirements.additional) {
        contestEditState.requirements.additional = [];
      }
      
      contestEditState.requirements.additional.push({
        name: '',
        description: ''
      });
      
      // Re-render the requirements section
      document.getElementById('requirements-section').outerHTML = renderRequirementsSection();
      setupRequirementsHandlers();
    });
  }
  
  // Remove requirement buttons
  const removeRequirementBtns = document.querySelectorAll('.remove-requirement-btn');
  removeRequirementBtns.forEach(button => {
    button.addEventListener('click', () => {
      const index = parseInt(button.dataset.index);
      if (!isNaN(index) && 
          index >= 0 && 
          contestEditState.requirements.additional &&
          index < contestEditState.requirements.additional.length) {
        // Remove requirement
        contestEditState.requirements.additional.splice(index, 1);
        
        // Re-render the requirements section
        document.getElementById('requirements-section').outerHTML = renderRequirementsSection();
        setupRequirementsHandlers();
      }
    });
  });
  
  // Requirement inputs
  const requirementInputs = document.querySelectorAll('.additional-requirement input');
  requirementInputs.forEach(input => {
    input.addEventListener('input', () => {
      const index = parseInt(input.dataset.index);
      const field = input.dataset.field;
      
      if (!isNaN(index) && 
          index >= 0 && 
          contestEditState.requirements.additional &&
          index < contestEditState.requirements.additional.length && 
          field) {
        // Update requirement field
        contestEditState.requirements.additional[index][field] = input.value;
      }
    });
  });
}

/**
 * Sets up about contest section handlers
 */
function setupAboutContestHandlers() {
  // Ensure about_contest object exists
  if (!contestEditState.about_contest) {
    contestEditState.about_contest = {
      short_description: '',
      target_audience: '',
      purpose: '',
      how_to_win: '',
      boost: '',
      tags: []
    };
  }
  
  // Description textarea
  const descriptionTextarea = document.getElementById('contest-description');
  if (descriptionTextarea) {
    descriptionTextarea.addEventListener('input', () => {
      contestEditState.about_contest.short_description = descriptionTextarea.value;
    });
  }
  
  // Target audience textarea
  const targetAudienceTextarea = document.getElementById('target-audience');
  if (targetAudienceTextarea) {
    targetAudienceTextarea.addEventListener('input', () => {
      contestEditState.about_contest.target_audience = targetAudienceTextarea.value;
    });
  }
  
  // Purpose textarea
  const purposeTextarea = document.getElementById('contest-purpose');
  if (purposeTextarea) {
    purposeTextarea.addEventListener('input', () => {
      contestEditState.about_contest.purpose = purposeTextarea.value;
    });
  }
  
  // How to win textarea
  const howToWinTextarea = document.getElementById('how-to-win');
  if (howToWinTextarea) {
    howToWinTextarea.addEventListener('input', () => {
      contestEditState.about_contest.how_to_win = howToWinTextarea.value;
    });
  }
  
  // Boost textarea
  const boostTextarea = document.getElementById('boost');
  if (boostTextarea) {
    boostTextarea.addEventListener('input', () => {
      contestEditState.about_contest.boost = boostTextarea.value;
    });
  }
  
  // Tags input
  if (!contestEditState.about_contest.tags) {
    contestEditState.about_contest.tags = [];
  }
  setupTagsInput('tags', contestEditState.about_contest.tags);
}

/**
 * Sets up about company section handlers
 */
function setupAboutCompanyHandlers() {
  // Ensure about_company object exists
  if (!contestEditState.about_company) {
    contestEditState.about_company = {
      name: '',
      link: '',
      logo: null,
      description: ''
    };
  }
  
  // Company name input
  const companyNameInput = document.getElementById('company-name');
  if (companyNameInput) {
    companyNameInput.addEventListener('input', () => {
      contestEditState.about_company.name = companyNameInput.value.trim();
    });
  }
  
  // Company link input
  const companyLinkInput = document.getElementById('company-link');
  if (companyLinkInput) {
    companyLinkInput.addEventListener('input', () => {
      contestEditState.about_company.link = companyLinkInput.value.trim();
    });
  }
  
  // Company description textarea
  const companyDescriptionTextarea = document.getElementById('company-description');
  if (companyDescriptionTextarea) {
    companyDescriptionTextarea.addEventListener('input', () => {
      contestEditState.about_company.description = companyDescriptionTextarea.value;
    });
  }
  
  // Logo upload button
  const uploadLogoBtn = document.getElementById('upload-logo-btn');
  const logoFileInput = document.getElementById('logo-upload');
  if (uploadLogoBtn && logoFileInput) {
    uploadLogoBtn.addEventListener('click', () => {
      logoFileInput.click();
    });
    
    logoFileInput.addEventListener('change', handleLogoUpload);
  }
  
  // Logo remove button
  const removeLogoBtn = document.getElementById('remove-logo-btn');
  if (removeLogoBtn) {
    removeLogoBtn.addEventListener('click', () => {
      contestEditState.about_company.logo = null;
      
      // Re-render the about company section
      document.getElementById('about-company-section').outerHTML = renderAboutCompanySection();
      setupAboutCompanyHandlers();
    });
  }
  
  // Banner upload button
  const uploadBannerBtn = document.getElementById('upload-banner-btn');
  const bannerFileInput = document.getElementById('banner-upload');
  if (uploadBannerBtn && bannerFileInput) {
    uploadBannerBtn.addEventListener('click', () => {
      bannerFileInput.click();
    });
    
    bannerFileInput.addEventListener('change', handleBannerUpload);
  }
  
  // Banner remove button
  const removeBannerBtn = document.getElementById('remove-banner-btn');
  if (removeBannerBtn) {
    removeBannerBtn.addEventListener('click', () => {
      contestEditState.banner = null;
      
      // Re-render the about company section
      document.getElementById('about-company-section').outerHTML = renderAboutCompanySection();
      setupAboutCompanyHandlers();
    });
  }
}

/**
 * Sets up a tags input field
 * @param {string} type - Type of tags (countries, roles, tags)
 * @param {Array} tagsArray - Array to store tags
 */
function setupTagsInput(type, tagsArray) {
  // Ensure array exists
  if (!tagsArray) {
    tagsArray = [];
  }
  
  const tagsInput = document.getElementById(`${type}-input`);
  if (!tagsInput) return;
  
  // Add tag on Enter
  tagsInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const value = tagsInput.value.trim();
      if (value && !tagsArray.includes(value)) {
        // Add tag
        tagsArray.push(value);
        
        // Clear input
        tagsInput.value = '';
        
        // Re-render tags list
        const tagsList = tagsInput.closest('.tags-input-container').querySelector('.tags-list');
        tagsList.innerHTML = tagsArray.map((tag, index) => `
          <div class="tag" data-index="${index}">
            <span>${tag}</span>
            <button type="button" class="remove-tag-btn" data-type="${type}" data-index="${index}">×</button>
          </div>
        `).join('');
        
        // Setup remove tag buttons
        setupRemoveTagButtons(type, tagsArray);
      }
    }
  });
  
  // Setup initial remove tag buttons
  setupRemoveTagButtons(type, tagsArray);
}

/**
 * Sets up remove tag buttons
 * @param {string} type - Type of tags (countries, roles, tags)
 * @param {Array} tagsArray - Array to store tags
 */
function setupRemoveTagButtons(type, tagsArray) {
  if (!tagsArray) return;
  
  const removeTagBtns = document.querySelectorAll(`.remove-tag-btn[data-type="${type}"]`);
  removeTagBtns.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      const index = parseInt(button.dataset.index);
      if (!isNaN(index) && index >= 0 && index < tagsArray.length) {
        // Remove tag
        tagsArray.splice(index, 1);
        
        // Re-render tags list
        const tagsList = button.closest('.tags-list');
        tagsList.innerHTML = tagsArray.map((tag, i) => `
          <div class="tag" data-index="${i}">
            <span>${tag}</span>
            <button type="button" class="remove-tag-btn" data-type="${type}" data-index="${i}">×</button>
          </div>
        `).join('');
        
        // Setup remove tag buttons again
        setupRemoveTagButtons(type, tagsArray);
      }
    });
  });
}

/**
 * Handles logo file upload
 * @param {Event} e - Change event
 */
function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    showNotification('Please select a valid image file (JPEG, PNG, GIF, WebP)', 'error');
    return;
  }
  
  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    showNotification('Logo file is too large. Maximum size is 2MB', 'error');
    return;
  }
  
  // Read file as data URL
  const reader = new FileReader();
  reader.onload = function(event) {
    contestEditState.about_company.logo = event.target.result;
    
    // Re-render the logo preview
    const logoPreview = document.querySelector('.logo-preview');
    if (logoPreview) {
      logoPreview.innerHTML = `<img src="${event.target.result}" alt="Company Logo">`;
    }
    
    // Add remove button if it doesn't exist
    if (!document.getElementById('remove-logo-btn')) {
      const uploadControls = document.querySelector('.logo-upload .upload-controls');
      if (uploadControls) {
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.id = 'remove-logo-btn';
        removeButton.className = 'btn btn-text';
        removeButton.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          Remove
        `;
        
        removeButton.addEventListener('click', () => {
          contestEditState.about_company.logo = null;
          
          // Re-render the about company section
          document.getElementById('about-company-section').outerHTML = renderAboutCompanySection();
          setupAboutCompanyHandlers();
        });
        
        uploadControls.appendChild(removeButton);
      }
    }
  };
  
  reader.readAsDataURL(file);
}

/**
 * Handles banner file upload
 * @param {Event} e - Change event
 */
function handleBannerUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    showNotification('Please select a valid image file (JPEG, PNG, GIF, WebP)', 'error');
    return;
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showNotification('Banner file is too large. Maximum size is 5MB', 'error');
    return;
  }
  
  // Read file as data URL
  const reader = new FileReader();
  reader.onload = function(event) {
    contestEditState.banner = event.target.result;
    
    // Re-render the banner preview
    const bannerPreview = document.querySelector('.banner-preview');
    if (bannerPreview) {
      bannerPreview.innerHTML = `<img src="${event.target.result}" alt="Contest Banner">`;
    }
    
    // Add remove button if it doesn't exist
    if (!document.getElementById('remove-banner-btn')) {
      const uploadControls = document.querySelector('.banner-upload .upload-controls');
      if (uploadControls) {
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.id = 'remove-banner-btn';
        removeButton.className = 'btn btn-text';
        removeButton.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          Remove
        `;
        
        removeButton.addEventListener('click', () => {
          contestEditState.banner = null;
          
          // Re-render the about company section
          document.getElementById('about-company-section').outerHTML = renderAboutCompanySection();
          setupAboutCompanyHandlers();
        });
        
        uploadControls.appendChild(removeButton);
      }
    }
  };
  
  reader.readAsDataURL(file);
}

/**
 * Handles form submission
 * @param {Event} e - Submit event
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  
  // Reset form errors
  formErrors = {
    PRIZE: {},
    SCORE: {},
    RULES: {},
    REQUIREMENTS: {},
    ABOUT_CONTEST: {},
    ABOUT_COMPANY: {}
  };
  
  // Validate form
  if (!validateForm()) {
    return;
  }
  
  // Disable submit button
  const submitButton = e.target.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.innerHTML = `
    <svg class="spinner small" viewBox="0 0 50 50">
      <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
    </svg>
    <span>Saving...</span>
  `;
  
  try {
    // Convert dates to ISO strings for API
    const contestData = {
      ...contestEditState,
      startDate: contestEditState.startDate.toISOString(),
      endDate: contestEditState.endDate.toISOString()
    };
    
    // Convert milestone dates to ISO strings
    if (contestData.milestones) {
      contestData.milestones = contestData.milestones.map(milestone => ({
        ...milestone,
        date: milestone.date instanceof Date ? milestone.date.toISOString() : milestone.date
      }));
    }
    
    // Submit updates
    await api.updateContest(contestEditState._id, contestData);
    
    showNotification('Contest updated successfully', 'success');
    
    // Redirect to contest page
    window.router.navigate(`/contests/${contestEditState._id}`);
  } catch (error) {
    console.error('Failed to update contest:', error);
    
    showNotification('Failed to update contest. Please try again.', 'error');
    
    // Re-enable submit button
    submitButton.disabled = false;
    submitButton.textContent = 'Save Changes';
  }
}

/**
 * Validates the form before submission
 * @returns {boolean} Whether the form is valid
 */
function validateForm() {
  let isValid = true;
  
  // Validate title
  if (!contestEditState.title.trim()) {
    formErrors.PRIZE.title = 'Contest title is required';
    showFieldError('title-error', formErrors.PRIZE.title);
    isValid = false;
  }
  
  // Validate dates
  if (!contestEditState.startDate) {
    formErrors.PRIZE.startDate = 'Start date is required';
    showFieldError('startDate-error', formErrors.PRIZE.startDate);
    isValid = false;
  }
  
  if (!contestEditState.endDate) {
    formErrors.PRIZE.endDate = 'End date is required';
    showFieldError('endDate-error', formErrors.PRIZE.endDate);
    isValid = false;
  }
  
  if (contestEditState.startDate && contestEditState.endDate && 
      contestEditState.startDate >= contestEditState.endDate) {
    formErrors.PRIZE.endDate = 'End date must be after start date';
    showFieldError('endDate-error', formErrors.PRIZE.endDate);
    isValid = false;
  }
  
  // Validate scoring categories
  if (!contestEditState.score || contestEditState.score.length === 0) {
    showNotification('Please add at least one scoring category', 'error');
    isValid = false;
  } else {
    // Validate each category
    contestEditState.score.forEach((category, index) => {
      if (!category.points || category.points < 1) {
        formErrors.SCORE[`points-${index}`] = 'Points must be at least 1';
        showFieldError(`points-${index}-error`, formErrors.SCORE[`points-${index}`]);
        isValid = false;
      }
      
      if (!category.number || category.number < 1) {
        formErrors.SCORE[`number-${index}`] = 'Number must be at least 1';
        showFieldError(`number-${index}-error`, formErrors.SCORE[`number-${index}`]);
        isValid = false;
      }
      
      if (!category.measuring_unit || !category.measuring_unit.trim()) {
        formErrors.SCORE[`unit-${index}`] = 'Unit is required';
        showFieldError(`unit-${index}-error`, formErrors.SCORE[`unit-${index}`]);
        isValid = false;
      }
    });
  }
  
  // Validate rules (if any)
  if (contestEditState.rules && contestEditState.rules.length > 0) {
    contestEditState.rules.forEach((rule, index) => {
      if (!rule || !rule.trim()) {
        formErrors.RULES[`rule-${index}`] = 'Rule cannot be empty';
        showFieldError(`rule-${index}-error`, formErrors.RULES[`rule-${index}`]);
        isValid = false;
      }
    });
  }
  
  // Validate requirements
  if (contestEditState.requirements) {
    // Validate platform URL if provided
    const platformUrl = contestEditState.requirements.organizer_platform;
    if (platformUrl && !isValidUrl(platformUrl)) {
      formErrors.REQUIREMENTS['platform-url'] = 'Please enter a valid URL';
      showFieldError('platform-url-error', formErrors.REQUIREMENTS['platform-url']);
      isValid = false;
    }
    
    // Validate additional requirements (if any)
    if (contestEditState.requirements.additional && contestEditState.requirements.additional.length > 0) {
      contestEditState.requirements.additional.forEach((req, index) => {
        if (!req.name || !req.name.trim()) {
          formErrors.REQUIREMENTS[`req-name-${index}`] = 'Requirement name is required';
          showFieldError(`req-name-${index}-error`, formErrors.REQUIREMENTS[`req-name-${index}`]);
          isValid = false;
        }
        
        if (!req.description || !req.description.trim()) {
          formErrors.REQUIREMENTS[`req-desc-${index}`] = 'Description is required';
          showFieldError(`req-desc-${index}-error`, formErrors.REQUIREMENTS[`req-desc-${index}`]);
          isValid = false;
        }
      });
    }
  }
  
  // Validate about contest
  if (!contestEditState.about_contest || !contestEditState.about_contest.short_description || 
      !contestEditState.about_contest.short_description.trim()) {
    formErrors.ABOUT_CONTEST.short_description = 'Contest description is required';
    showFieldError('short_description-error', formErrors.ABOUT_CONTEST.short_description);
    isValid = false;
  }
  
  // Validate about company
  if (!contestEditState.about_company || !contestEditState.about_company.name || 
      !contestEditState.about_company.name.trim()) {
    formErrors.ABOUT_COMPANY.company_name = 'Company name is required';
    showFieldError('company_name-error', formErrors.ABOUT_COMPANY.company_name);
    isValid = false;
  }
  
  // Validate company link if provided
  if (contestEditState.about_company && contestEditState.about_company.link && 
      !isValidUrl(contestEditState.about_company.link)) {
    formErrors.ABOUT_COMPANY.company_link = 'Please enter a valid URL';
    showFieldError('company_link-error', formErrors.ABOUT_COMPANY.company_link);
    isValid = false;
  }
  
  return isValid;
}

/**
 * Shows a field error message
 * @param {string} errorId - Error element ID
 * @param {string} message - Error message
 */
function showFieldError(errorId, message) {
  const errorElement = document.getElementById(errorId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Scroll to error if it's not in view
    if (!isElementInViewport(errorElement)) {
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

/**
 * Checks if an element is in the viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} Whether the element is in the viewport
 */
function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Checks if a string is a valid URL
 * @param {string} url - URL to validate
 * @returns {boolean} Whether the URL is valid
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Formats a date for input fields
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
function formatDateForInput(date) {
  if (!date) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}