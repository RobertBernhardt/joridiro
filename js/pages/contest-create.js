/**
 * Contest creation page for the Joridiro application
 */
import * as api from '../api.js';
import { store } from '../store.js';
import { showNotification } from '../components/notification.js';
import { formatCurrency } from '../utils/formatters.js';
import { getPrizeForSize, getDurationForSize } from '../utils/contest-helpers.js';

// Contest creation state
let contestCreationState = {
  step: 0,
  type: 'DEADLINE',
  size: 'MEDIUM',
  title: '',
  startDate: new Date(),
  endDate: null,
  grandPrize: {
    amount: 0
  },
  lotteryPrize: {
    amount: 0
  },
  milestones: [],
  score: [],
  rules: [],
  requirements: {
    categories: [],
    countries: [],
    roles: [],
    additional: [],
    organizer_platform: ''
  },
  about_contest: {
    short_description: '',
    target_audience: '',
    purpose: '',
    how_to_win: '',
    boost: '',
    tags: []
  },
  about_company: {
    name: '',
    link: '',
    logo: null,
    description: ''
  }
};

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
 * Renders the contest creation page
 */
export async function renderContestCreatePage() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;
  
  const user = store.getState().user;
  if (!user) {
    // Redirect to home if not logged in
    window.router.navigate('/');
    return;
  }
  
  // Reset contest creation state
  resetContestCreationState();
  
  // Render the initial page
  renderContestCreationPage(appContainer);
  
  // Set up event handlers
  setupEventHandlers();
}

/**
 * Resets the contest creation state
 */
function resetContestCreationState() {
  // Reset step
  contestCreationState.step = 0;
  
  // Set default type and size
  contestCreationState.type = 'DEADLINE';
  contestCreationState.size = 'MEDIUM';
  
  // Set default dates
  contestCreationState.startDate = new Date();
  
  // Calculate end date based on size
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + getDurationForSize(contestCreationState.size));
  contestCreationState.endDate = endDate;
  
  // Set default prizes based on size
  const prizes = getPrizeForSize(contestCreationState.size);
  contestCreationState.grandPrize.amount = prizes.grandPrize;
  contestCreationState.lotteryPrize.amount = prizes.lotteryPrize;
  
  // Set default milestones
  contestCreationState.milestones = prizes.milestones ? prizes.milestones.map(m => ({
    points: m.points,
    prize: m.prize,
    date: new Date(contestCreationState.startDate.getTime() + (contestCreationState.type === 'DEADLINE' ? m.points : 7) * 24 * 60 * 60 * 1000)
  })) : [];
  
  // Reset other properties
  contestCreationState.score = [];
  contestCreationState.rules = [];
  contestCreationState.requirements = {
    categories: [],
    countries: [],
    roles: [],
    additional: [],
    organizer_platform: ''
  };
  contestCreationState.about_contest = {
    short_description: '',
    target_audience: '',
    purpose: '',
    how_to_win: '',
    boost: '',
    tags: []
  };
  contestCreationState.about_company = {
    name: '',
    link: '',
    logo: null,
    description: ''
  };
  
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
 * Renders the contest creation page
 * @param {HTMLElement} container - Container element
 */
function renderContestCreationPage(container) {
  container.innerHTML = `
    <div class="create-contest-container">
      <div class="pageheader">CREATE NEW CONTEST</div>
      
      <div class="wrapper">
        <div class="progresswrapper">
          <div class="progress-bar">
            <div class="progress-steps">
              <div class="progress-step ${contestCreationState.step >= 0 ? 'active' : ''}" data-step="0">
                <div class="step-number">1</div>
                <div class="step-label">Contest Prize</div>
              </div>
              <div class="progress-step ${contestCreationState.step >= 1 ? 'active' : ''}" data-step="1">
                <div class="step-number">2</div>
                <div class="step-label">How to Score</div>
              </div>
              <div class="progress-step ${contestCreationState.step >= 2 ? 'active' : ''}" data-step="2">
                <div class="step-number">3</div>
                <div class="step-label">Rules</div>
              </div>
              <div class="progress-step ${contestCreationState.step >= 3 ? 'active' : ''}" data-step="3">
                <div class="step-number">4</div>
                <div class="step-label">Requirements</div>
              </div>
              <div class="progress-step ${contestCreationState.step >= 4 ? 'active' : ''}" data-step="4">
                <div class="step-number">5</div>
                <div class="step-label">About Contest</div>
              </div>
              <div class="progress-step ${contestCreationState.step >= 5 ? 'active' : ''}" data-step="5">
                <div class="step-number">6</div>
                <div class="step-label">About Company</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-container">
          ${renderCurrentStep()}
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders the current step in the contest creation process
 * @returns {string} HTML for the current step
 */
function renderCurrentStep() {
  switch (contestCreationState.step) {
    case 0:
      return renderContestPrizeStep();
    case 1:
      return renderHowToScoreStep();
    case 2:
      return renderRulesStep();
    case 3:
      return renderRequirementsStep();
    case 4:
      return renderAboutContestStep();
    case 5:
      return renderAboutCompanyStep();
    default:
      return renderContestPrizeStep();
  }
}

/**
 * Renders the contest prize step
 * @returns {string} HTML for the prize step
 */
function renderContestPrizeStep() {
  const prizes = getPrizeForSize(contestCreationState.size);
  
  return `
    <div class="create-form-section" id="contest-prize-section">
      <h2 class="section-title">Contest Prize</h2>
      
      <div class="form-group">
        <label for="contest-title">Contest Title</label>
        <input 
          type="text" 
          id="contest-title" 
          name="title" 
          value="${contestCreationState.title}" 
          placeholder="Enter a title for your contest"
          required
        >
        <div class="error-message" id="title-error">${formErrors.PRIZE.title || ''}</div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Contest Type</label>
          <div class="toggle-buttons">
            <button 
              type="button" 
              class="toggle-button ${contestCreationState.type === 'DEADLINE' ? 'active' : ''}" 
              data-type="DEADLINE"
            >
              Deadline-based
            </button>
            <button 
              type="button" 
              class="toggle-button ${contestCreationState.type === 'SCORE' ? 'active' : ''}" 
              data-type="SCORE"
            >
              Score-based
            </button>
          </div>
          <p class="form-help-text">
            ${contestCreationState.type === 'DEADLINE' ? 
              'Deadline-based contests run for a fixed period. The participant with the highest score at the end wins.' :
              'Score-based contests end when a participant reaches the target score. The first to reach the target wins.'}
          </p>
        </div>
        
        <div class="form-group">
          <label>Contest Size</label>
          <div class="toggle-buttons">
            <button 
              type="button" 
              class="toggle-button ${contestCreationState.size === 'SMALL' ? 'active' : ''}" 
              data-size="SMALL"
            >
              Small
            </button>
            <button 
              type="button" 
              class="toggle-button ${contestCreationState.size === 'MEDIUM' ? 'active' : ''}" 
              data-size="MEDIUM"
            >
              Medium
            </button>
            <button 
              type="button" 
              class="toggle-button ${contestCreationState.size === 'LARGE' ? 'active' : ''}" 
              data-size="LARGE"
            >
              Large
            </button>
          </div>
          <p class="form-help-text">
            ${contestCreationState.size === 'SMALL' ? 
              'Small: €250 prize pool, 7 days duration, no milestone prizes.' :
              contestCreationState.size === 'MEDIUM' ? 
              'Medium: €1,500 prize pool, 25 days duration, 1 milestone prize.' :
              'Large: €5,000 prize pool, 45 days duration, 3 milestone prizes.'}
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
            value="${formatDateForInput(contestCreationState.startDate)}"
            min="${formatDateForInput(new Date())}"
          >
          <div class="error-message" id="startDate-error">${formErrors.PRIZE.startDate || ''}</div>
        </div>
        
        <div class="form-group">
          <label for="end-date">End Date</label>
          <input 
            type="date" 
            id="end-date" 
            name="endDate" 
            value="${formatDateForInput(contestCreationState.endDate)}"
            min="${formatDateForInput(new Date(new Date().setDate(new Date().getDate() + 1)))}"
          >
          <div class="error-message" id="endDate-error">${formErrors.PRIZE.endDate || ''}</div>
        </div>
      </div>
      
      <div class="prize-summary">
        <div class="prize-card">
          <h3>Grand Prize</h3>
          <div class="prize-amount">${formatCurrency(prizes.grandPrize)}</div>
        </div>
        
        ${prizes.lotteryPrize > 0 ? `
          <div class="prize-card">
            <h3>Lottery Prize</h3>
            <div class="prize-amount">${formatCurrency(prizes.lotteryPrize)}</div>
          </div>
        ` : ''}
        
        ${prizes.milestones && prizes.milestones.length > 0 ? `
          <div class="prize-card">
            <h3>Milestone Prizes</h3>
            <ul class="milestone-list">
              ${prizes.milestones.map((milestone, index) => `
                <li>
                  ${formatCurrency(milestone.prize)} at 
                  ${contestCreationState.type === 'DEADLINE' ? 
                    `day ${milestone.days || 7}` : 
                    `${milestone.points} points`}
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
        
        <div class="prize-card">
          <h3>Platform Fee</h3>
          <div class="prize-amount">${formatCurrency(prizes.platformFee)}</div>
        </div>
        
        <div class="prize-card total-prize">
          <h3>Total Cost</h3>
          <div class="prize-amount">
            ${formatCurrency(prizes.grandPrize + prizes.lotteryPrize + 
              (prizes.milestones ? prizes.milestones.reduce((total, m) => total + m.prize, 0) : 0) + 
              prizes.platformFee)}
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn btn-primary next-step-btn">Next: How to Score</button>
      </div>
    </div>
  `;
}

/**
 * Renders the how to score step
 * @returns {string} HTML for the scoring step
 */
function renderHowToScoreStep() {
  return `
    <div class="create-form-section" id="how-to-score-section">
      <h2 class="section-title">How to Score</h2>
      <p class="section-description">
        Define how participants will earn points in your contest. You can add multiple scoring categories.
      </p>
      
      <div class="scoring-categories">
        ${contestCreationState.score.length > 0 ? 
          contestCreationState.score.map((category, index) => `
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
      
      <div class="form-actions">
        <button type="button" class="btn btn-text prev-step-btn">Back</button>
        <button type="button" class="btn btn-primary next-step-btn">Next: Rules</button>
      </div>
    </div>
  `;
}

/**
 * Renders the rules step
 * @returns {string} HTML for the rules step
 */
function renderRulesStep() {
  return `
    <div class="create-form-section" id="rules-section">
      <h2 class="section-title">Contest Rules</h2>
      <p class="section-description">
        Define the rules that participants must follow in your contest.
      </p>
      
      <div class="rules-list">
        ${contestCreationState.rules.length > 0 ? 
          contestCreationState.rules.map((rule, index) => `
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
      
      <div class="form-actions">
        <button type="button" class="btn btn-text prev-step-btn">Back</button>
        <button type="button" class="btn btn-primary next-step-btn">Next: Requirements</button>
      </div>
    </div>
  `;
}

/**
 * Renders the requirements step
 * @returns {string} HTML for the requirements step
 */
function renderRequirementsStep() {
  return `
    <div class="create-form-section" id="requirements-section">
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
          value="${contestCreationState.requirements.organizer_platform}" 
          placeholder="Enter the URL of your platform or website (optional)"
        >
        <p class="form-help-text">If your contest requires participants to use a specific platform or website, enter its URL here.</p>
        <div class="error-message" id="platform-url-error">${formErrors.REQUIREMENTS['platform-url'] || ''}</div>
      </div>
      
      <div class="form-group">
        <label>Location Requirements</label>
        <div class="tags-input-container">
          <div class="tags-list">
            ${contestCreationState.requirements.countries.map((country, index) => `
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
            ${contestCreationState.requirements.roles.map((role, index) => `
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
          ${contestCreationState.requirements.additional.length > 0 ? 
            contestCreationState.requirements.additional.map((req, index) => `
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
      
      <div class="form-actions">
        <button type="button" class="btn btn-text prev-step-btn">Back</button>
        <button type="button" class="btn btn-primary next-step-btn">Next: About Contest</button>
      </div>
    </div>
  `;
}

/**
 * Renders the about contest step
 * @returns {string} HTML for the about contest step
 */
function renderAboutContestStep() {
  return `
    <div class="create-form-section" id="about-contest-section">
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
        >${contestCreationState.about_contest.short_description}</textarea>
        <div class="error-message" id="short_description-error">${formErrors.ABOUT_CONTEST.short_description || ''}</div>
      </div>
      
      <div class="form-group">
        <label for="target-audience">Target Audience</label>
        <textarea 
          id="target-audience" 
          name="target_audience" 
          rows="3" 
          placeholder="Describe who should participate in your contest"
        >${contestCreationState.about_contest.target_audience}</textarea>
        <div class="error-message" id="target_audience-error">${formErrors.ABOUT_CONTEST.target_audience || ''}</div>
      </div>
      
      <div class="form-group">
        <label for="contest-purpose">Contest Purpose</label>
        <textarea 
          id="contest-purpose" 
          name="purpose" 
          rows="3" 
          placeholder="Explain the purpose and goals of your contest"
        >${contestCreationState.about_contest.purpose}</textarea>
        <div class="error-message" id="purpose-error">${formErrors.ABOUT_CONTEST.purpose || ''}</div>
      </div>
      
      <div class="form-group">
        <label for="how-to-win">How to Win</label>
        <textarea 
          id="how-to-win" 
          name="how_to_win" 
          rows="3" 
          placeholder="Explain how participants can win your contest"
        >${contestCreationState.about_contest.how_to_win}</textarea>
        <div class="error-message" id="how_to_win-error">${formErrors.ABOUT_CONTEST.how_to_win || ''}</div>
      </div>
      
      <div class="form-group">
        <label for="boost">What You Bring to the Table</label>
        <textarea 
          id="boost" 
          name="boost" 
          rows="3" 
          placeholder="Describe what you offer to participants (e.g., support, resources)"
        >${contestCreationState.about_contest.boost}</textarea>
        <div class="error-message" id="boost-error">${formErrors.ABOUT_CONTEST.boost || ''}</div>
      </div>
      
      <div class="form-group">
        <label>Contest Tags</label>
        <div class="tags-input-container">
          <div class="tags-list">
            ${contestCreationState.about_contest.tags.map((tag, index) => `
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
      
      <div class="form-actions">
        <button type="button" class="btn btn-text prev-step-btn">Back</button>
        <button type="button" class="btn btn-primary next-step-btn">Next: About Company</button>
      </div>
    </div>
  `;
}

/**
 * Renders the about company step
 * @returns {string} HTML for the about company step
 */
function renderAboutCompanyStep() {
  return `
    <div class="create-form-section" id="about-company-section">
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
          value="${contestCreationState.about_company.name}" 
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
          value="${contestCreationState.about_company.link}" 
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
        >${contestCreationState.about_company.description}</textarea>
        <div class="error-message" id="company_description-error">${formErrors.ABOUT_COMPANY.company_description || ''}</div>
      </div>
      
      <div class="form-group">
        <label>Company Logo</label>
        <div class="logo-upload">
          <div class="logo-preview">
            ${contestCreationState.about_company.logo ? 
              `<img src="${contestCreationState.about_company.logo}" alt="Company Logo">` : 
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
            ${contestCreationState.about_company.logo ? 
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
            ${contestCreationState.banner ? 
              `<img src="${contestCreationState.banner}" alt="Contest Banner">` : 
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
            ${contestCreationState.banner ? 
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
      
      <div class="form-actions">
        <button type="button" class="btn btn-text prev-step-btn">Back</button>
        <button type="button" class="btn btn-primary submit-contest-btn">Submit Contest</button>
      </div>
    </div>
  `;
}

/**
 * Sets up event handlers for the current step
 */
function setupEventHandlers() {
  // Navigation buttons
  setupNavigationHandlers();
  
  // Step-specific handlers
  switch (contestCreationState.step) {
    case 0:
      setupPrizeStepHandlers();
      break;
    case 1:
      setupScoringStepHandlers();
      break;
    case 2:
      setupRulesStepHandlers();
      break;
    case 3:
      setupRequirementsStepHandlers();
      break;
    case 4:
      setupAboutContestStepHandlers();
      break;
    case 5:
      setupAboutCompanyStepHandlers();
      break;
  }
}

/**
 * Sets up navigation button handlers
 */
function setupNavigationHandlers() {
  // Previous step buttons
  const prevButtons = document.querySelectorAll('.prev-step-btn');
  prevButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (contestCreationState.step > 0) {
        contestCreationState.step--;
        renderContestCreationPage(document.getElementById('app'));
        setupEventHandlers();
      }
    });
  });
  
  // Next step buttons
  const nextButtons = document.querySelectorAll('.next-step-btn');
  nextButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (validateCurrentStep()) {
        contestCreationState.step++;
        renderContestCreationPage(document.getElementById('app'));
        setupEventHandlers();
      }
    });
  });
  
  // Submit contest button
  const submitButton = document.querySelector('.submit-contest-btn');
  if (submitButton) {
    submitButton.addEventListener('click', handleContestSubmit);
  }
  
  // Progress step indicators
  const progressSteps = document.querySelectorAll('.progress-step');
  progressSteps.forEach(step => {
    step.addEventListener('click', () => {
      const targetStep = parseInt(step.dataset.step);
      
      // Only allow going to steps that have already been visited or the next step
      if (targetStep <= contestCreationState.step) {
        contestCreationState.step = targetStep;
        renderContestCreationPage(document.getElementById('app'));
        setupEventHandlers();
      }
    });
  });
}

/**
 * Sets up handlers for the prize step
 */
function setupPrizeStepHandlers() {
  // Contest type toggle
  const typeButtons = document.querySelectorAll('.toggle-button[data-type]');
  typeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const type = button.dataset.type;
      if (type !== contestCreationState.type) {
        contestCreationState.type = type;
        
        // Adjust milestones based on type
        updateMilestones();
        
        // Re-render the step
        document.getElementById('contest-prize-section').outerHTML = renderContestPrizeStep();
        setupPrizeStepHandlers();
      }
    });
  });
  
  // Contest size toggle
  const sizeButtons = document.querySelectorAll('.toggle-button[data-size]');
  sizeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const size = button.dataset.size;
      if (size !== contestCreationState.size) {
        contestCreationState.size = size;
        
        // Adjust prizes, end date, and milestones based on size
        updatePrizesAndDates();
        
        // Re-render the step
        document.getElementById('contest-prize-section').outerHTML = renderContestPrizeStep();
        setupPrizeStepHandlers();
      }
    });
  });
  
  // Date inputs
  const startDateInput = document.getElementById('start-date');
  if (startDateInput) {
    startDateInput.addEventListener('change', () => {
      const startDate = new Date(startDateInput.value);
      if (!isNaN(startDate.getTime())) {
        contestCreationState.startDate = startDate;
        
        // Adjust end date and milestones
        updateEndDateAndMilestones();
        
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
  
  const endDateInput = document.getElementById('end-date');
  if (endDateInput) {
    endDateInput.addEventListener('change', () => {
      const endDate = new Date(endDateInput.value);
      if (!isNaN(endDate.getTime())) {
        contestCreationState.endDate = endDate;
      }
    });
  }
  
  // Title input
  const titleInput = document.getElementById('contest-title');
  if (titleInput) {
    titleInput.addEventListener('input', () => {
      contestCreationState.title = titleInput.value.trim();
    });
  }
}

/**
 * Updates prizes, end date, and milestones based on selected size
 */
function updatePrizesAndDates() {
  const prizes = getPrizeForSize(contestCreationState.size);
  
  // Update prize amounts
  contestCreationState.grandPrize.amount = prizes.grandPrize;
  contestCreationState.lotteryPrize.amount = prizes.lotteryPrize;
  
  // Update end date
  const endDate = new Date(contestCreationState.startDate);
  endDate.setDate(endDate.getDate() + getDurationForSize(contestCreationState.size));
  contestCreationState.endDate = endDate;
  
  // Update milestones
  updateMilestones();
}

/**
 * Updates end date and milestones when start date changes
 */
function updateEndDateAndMilestones() {
  // Update end date
  const endDate = new Date(contestCreationState.startDate);
  endDate.setDate(endDate.getDate() + getDurationForSize(contestCreationState.size));
  contestCreationState.endDate = endDate;
  
  // Update milestones
  updateMilestones();
}

/**
 * Updates milestones based on contest type, size, and dates
 */
function updateMilestones() {
  const prizes = getPrizeForSize(contestCreationState.size);
  
  if (!prizes.milestones || prizes.milestones.length === 0) {
    contestCreationState.milestones = [];
    return;
  }
  
  if (contestCreationState.type === 'DEADLINE') {
    // For deadline-based contests, milestones are based on days from start
    contestCreationState.milestones = prizes.milestones.map(milestone => {
      const date = new Date(contestCreationState.startDate);
      date.setDate(date.getDate() + (milestone.days || 7));
      
      return {
        date: date.toISOString(),
        prize: milestone.prize
      };
    });
  } else {
    // For score-based contests, milestones are based on points
    contestCreationState.milestones = prizes.milestones.map(milestone => ({
      points: milestone.points,
      prize: milestone.prize
    }));
  }
}

/**
 * Sets up handlers for the scoring step
 */
function setupScoringStepHandlers() {
  // Add category button
  const addCategoryBtn = document.querySelector('.add-category-btn');
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', () => {
      // Add new category
      contestCreationState.score.push({
        name: '1',
        number: 1,
        points: 1,
        measuring_unit: '',
        description: ''
      });
      
      // Re-render the step
      document.getElementById('how-to-score-section').outerHTML = renderHowToScoreStep();
      setupScoringStepHandlers();
    });
  }
  
  // Remove category buttons
  const removeCategoryBtns = document.querySelectorAll('.remove-category-btn');
  removeCategoryBtns.forEach(button => {
    button.addEventListener('click', () => {
      const index = parseInt(button.dataset.index);
      if (!isNaN(index) && index >= 0 && index < contestCreationState.score.length) {
        // Remove category
        contestCreationState.score.splice(index, 1);
        
        // Re-render the step
        document.getElementById('how-to-score-section').outerHTML = renderHowToScoreStep();
        setupScoringStepHandlers();
      }
    });
  });
  
  // Category field inputs
  const categoryInputs = document.querySelectorAll('.scoring-category input, .scoring-category textarea');
  categoryInputs.forEach(input => {
    input.addEventListener('input', () => {
      const index = parseInt(input.dataset.index);
      const field = input.dataset.field;
      
      if (!isNaN(index) && index >= 0 && index < contestCreationState.score.length && field) {
        let value = input.value;
        
        // Convert to number for numeric fields
        if (field === 'points' || field === 'number') {
          value = parseInt(value) || 1;
        }
        
        // Update the field
        contestCreationState.score[index][field] = value;
      }
    });
  });
}

/**
 * Sets up handlers for the rules step
 */
function setupRulesStepHandlers() {
  // Add rule button
  const addRuleBtn = document.querySelector('.add-rule-btn');
  if (addRuleBtn) {
    addRuleBtn.addEventListener('click', () => {
      // Add new rule
      contestCreationState.rules.push('');
      
      // Re-render the step
      document.getElementById('rules-section').outerHTML = renderRulesStep();
      setupRulesStepHandlers();
      
      // Focus the new rule input
      const newRuleIndex = contestCreationState.rules.length - 1;
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
      if (!isNaN(index) && index >= 0 && index < contestCreationState.rules.length) {
        // Remove rule
        contestCreationState.rules.splice(index, 1);
        
        // Re-render the step
        document.getElementById('rules-section').outerHTML = renderRulesStep();
        setupRulesStepHandlers();
      }
    });
  });
  
  // Rule inputs
  const ruleInputs = document.querySelectorAll('.rule-item input');
  ruleInputs.forEach(input => {
    input.addEventListener('input', () => {
      const index = parseInt(input.dataset.index);
      if (!isNaN(index) && index >= 0 && index < contestCreationState.rules.length) {
        // Update rule
        contestCreationState.rules[index] = input.value;
      }
    });
  });
}

/**
 * Sets up handlers for the requirements step
 */
function setupRequirementsStepHandlers() {
  // Platform URL input
  const platformUrlInput = document.getElementById('platform-url');
  if (platformUrlInput) {
    platformUrlInput.addEventListener('input', () => {
      contestCreationState.requirements.organizer_platform = platformUrlInput.value.trim();
    });
  }
  
  // Tags inputs (countries, roles)
  setupTagsInput('countries', contestCreationState.requirements.countries);
  setupTagsInput('roles', contestCreationState.requirements.roles);
  
  // Add requirement button
  const addRequirementBtn = document.querySelector('.add-requirement-btn');
  if (addRequirementBtn) {
    addRequirementBtn.addEventListener('click', () => {
      // Add new requirement
      contestCreationState.requirements.additional.push({
        name: '',
        description: ''
      });
      
      // Re-render the step
      document.getElementById('requirements-section').outerHTML = renderRequirementsStep();
      setupRequirementsStepHandlers();
    });
  }
  
  // Remove requirement buttons
  const removeRequirementBtns = document.querySelectorAll('.remove-requirement-btn');
  removeRequirementBtns.forEach(button => {
    button.addEventListener('click', () => {
      const index = parseInt(button.dataset.index);
      if (!isNaN(index) && index >= 0 && index < contestCreationState.requirements.additional.length) {
        // Remove requirement
        contestCreationState.requirements.additional.splice(index, 1);
        
        // Re-render the step
        document.getElementById('requirements-section').outerHTML = renderRequirementsStep();
        setupRequirementsStepHandlers();
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
          index < contestCreationState.requirements.additional.length && 
          field) {
        // Update requirement field
        contestCreationState.requirements.additional[index][field] = input.value;
      }
    });
  });
}

/**
 * Sets up handlers for the about contest step
 */
function setupAboutContestStepHandlers() {
  // Description textarea
  const descriptionTextarea = document.getElementById('contest-description');
  if (descriptionTextarea) {
    descriptionTextarea.addEventListener('input', () => {
      contestCreationState.about_contest.short_description = descriptionTextarea.value;
    });
  }
  
  // Target audience textarea
  const targetAudienceTextarea = document.getElementById('target-audience');
  if (targetAudienceTextarea) {
    targetAudienceTextarea.addEventListener('input', () => {
      contestCreationState.about_contest.target_audience = targetAudienceTextarea.value;
    });
  }
  
  // Purpose textarea
  const purposeTextarea = document.getElementById('contest-purpose');
  if (purposeTextarea) {
    purposeTextarea.addEventListener('input', () => {
      contestCreationState.about_contest.purpose = purposeTextarea.value;
    });
  }
  
  // How to win textarea
  const howToWinTextarea = document.getElementById('how-to-win');
  if (howToWinTextarea) {
    howToWinTextarea.addEventListener('input', () => {
      contestCreationState.about_contest.how_to_win = howToWinTextarea.value;
    });
  }
  
  // Boost textarea
  const boostTextarea = document.getElementById('boost');
  if (boostTextarea) {
    boostTextarea.addEventListener('input', () => {
      contestCreationState.about_contest.boost = boostTextarea.value;
    });
  }
  
  // Tags input
  setupTagsInput('tags', contestCreationState.about_contest.tags);
}

/**
 * Sets up handlers for the about company step
 */
function setupAboutCompanyStepHandlers() {
  // Company name input
  const companyNameInput = document.getElementById('company-name');
  if (companyNameInput) {
    companyNameInput.addEventListener('input', () => {
      contestCreationState.about_company.name = companyNameInput.value.trim();
    });
  }
  
  // Company link input
  const companyLinkInput = document.getElementById('company-link');
  if (companyLinkInput) {
    companyLinkInput.addEventListener('input', () => {
      contestCreationState.about_company.link = companyLinkInput.value.trim();
    });
  }
  
  // Company description textarea
  const companyDescriptionTextarea = document.getElementById('company-description');
  if (companyDescriptionTextarea) {
    companyDescriptionTextarea.addEventListener('input', () => {
      contestCreationState.about_company.description = companyDescriptionTextarea.value;
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
      contestCreationState.about_company.logo = null;
      
      // Re-render the step
      document.getElementById('about-company-section').outerHTML = renderAboutCompanyStep();
      setupAboutCompanyStepHandlers();
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
      contestCreationState.banner = null;
      
      // Re-render the step
      document.getElementById('about-company-section').outerHTML = renderAboutCompanyStep();
      setupAboutCompanyStepHandlers();
    });
  }
}

/**
 * Sets up a tags input field
 * @param {string} type - Type of tags (countries, roles, tags)
 * @param {Array} tagsArray - Array to store tags
 */
function setupTagsInput(type, tagsArray) {
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
    contestCreationState.about_company.logo = event.target.result;
    
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
          contestCreationState.about_company.logo = null;
          
          // Re-render the step
          document.getElementById('about-company-section').outerHTML = renderAboutCompanyStep();
          setupAboutCompanyStepHandlers();
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
    contestCreationState.banner = event.target.result;
    
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
          contestCreationState.banner = null;
          
          // Re-render the step
          document.getElementById('about-company-section').outerHTML = renderAboutCompanyStep();
          setupAboutCompanyStepHandlers();
        });
        
        uploadControls.appendChild(removeButton);
      }
    }
  };
  
  reader.readAsDataURL(file);
}

/**
 * Validates the current step
 * @returns {boolean} Whether the step is valid
 */
function validateCurrentStep() {
  // Reset errors for current step
  switch (contestCreationState.step) {
    case 0:
      formErrors.PRIZE = {};
      break;
    case 1:
      formErrors.SCORE = {};
      break;
    case 2:
      formErrors.RULES = {};
      break;
    case 3:
      formErrors.REQUIREMENTS = {};
      break;
    case 4:
      formErrors.ABOUT_CONTEST = {};
      break;
    case 5:
      formErrors.ABOUT_COMPANY = {};
      break;
  }
  
  // Validate based on current step
  let isValid = true;
  
  switch (contestCreationState.step) {
    case 0:
      // Validate contest title
      if (!contestCreationState.title.trim()) {
        formErrors.PRIZE.title = 'Contest title is required';
        showFieldError('title-error', formErrors.PRIZE.title);
        isValid = false;
      }
      
      // Validate dates
      if (!contestCreationState.startDate) {
        formErrors.PRIZE.startDate = 'Start date is required';
        showFieldError('startDate-error', formErrors.PRIZE.startDate);
        isValid = false;
      }
      
      if (!contestCreationState.endDate) {
        formErrors.PRIZE.endDate = 'End date is required';
        showFieldError('endDate-error', formErrors.PRIZE.endDate);
        isValid = false;
      }
      
      if (contestCreationState.startDate && contestCreationState.endDate && 
          contestCreationState.startDate >= contestCreationState.endDate) {
        formErrors.PRIZE.endDate = 'End date must be after start date';
        showFieldError('endDate-error', formErrors.PRIZE.endDate);
        isValid = false;
      }
      break;
      
    case 1:
      // Validate scoring categories
      if (contestCreationState.score.length === 0) {
        showNotification('Please add at least one scoring category', 'error');
        isValid = false;
      } else {
        // Validate each category
        contestCreationState.score.forEach((category, index) => {
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
          
          if (!category.measuring_unit.trim()) {
            formErrors.SCORE[`unit-${index}`] = 'Unit is required';
            showFieldError(`unit-${index}-error`, formErrors.SCORE[`unit-${index}`]);
            isValid = false;
          }
        });
      }
      break;
      
    case 2:
      // Rules are optional, but if added, they should not be empty
      contestCreationState.rules.forEach((rule, index) => {
        if (!rule.trim()) {
          formErrors.RULES[`rule-${index}`] = 'Rule cannot be empty';
          showFieldError(`rule-${index}-error`, formErrors.RULES[`rule-${index}`]);
          isValid = false;
        }
      });
      break;
      
    case 3:
      // Requirements are optional, but if added, they should be valid
      
      // Validate platform URL if provided
      const platformUrl = contestCreationState.requirements.organizer_platform;
      if (platformUrl && !isValidUrl(platformUrl)) {
        formErrors.REQUIREMENTS['platform-url'] = 'Please enter a valid URL';
        showFieldError('platform-url-error', formErrors.REQUIREMENTS['platform-url']);
        isValid = false;
      }
      
      // Validate additional requirements
      contestCreationState.requirements.additional.forEach((req, index) => {
        if (!req.name.trim()) {
          formErrors.REQUIREMENTS[`req-name-${index}`] = 'Requirement name is required';
          showFieldError(`req-name-${index}-error`, formErrors.REQUIREMENTS[`req-name-${index}`]);
          isValid = false;
        }
        
        if (!req.description.trim()) {
          formErrors.REQUIREMENTS[`req-desc-${index}`] = 'Description is required';
          showFieldError(`req-desc-${index}-error`, formErrors.REQUIREMENTS[`req-desc-${index}`]);
          isValid = false;
        }
      });
      break;
      
    case 4:
      // Validate contest description
      if (!contestCreationState.about_contest.short_description.trim()) {
        formErrors.ABOUT_CONTEST.short_description = 'Contest description is required';
        showFieldError('short_description-error', formErrors.ABOUT_CONTEST.short_description);
        isValid = false;
      }
      break;
      
    case 5:
      // Validate company name
      if (!contestCreationState.about_company.name.trim()) {
        formErrors.ABOUT_COMPANY.company_name = 'Company name is required';
        showFieldError('company_name-error', formErrors.ABOUT_COMPANY.company_name);
        isValid = false;
      }
      
      // Validate company link if provided
      const companyLink = contestCreationState.about_company.link;
      if (companyLink && !isValidUrl(companyLink)) {
        formErrors.ABOUT_COMPANY.company_link = 'Please enter a valid URL';
        showFieldError('company_link-error', formErrors.ABOUT_COMPANY.company_link);
        isValid = false;
      }
      break;
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
    
    // Scroll to error
    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
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
 * Handles contest submission
 */
async function handleContestSubmit() {
  // Validate final step
  if (!validateCurrentStep()) {
    return;
  }
  
  // Prepare contest data
  const contestData = {
    title: contestCreationState.title,
    type: contestCreationState.type,
    size: contestCreationState.size,
    startDate: contestCreationState.startDate.toISOString(),
    endDate: contestCreationState.endDate.toISOString(),
    grandPrize: contestCreationState.grandPrize,
    lotteryPrize: contestCreationState.lotteryPrize,
    milestones: contestCreationState.milestones,
    score: contestCreationState.score,
    rules: contestCreationState.rules,
    requirements: contestCreationState.requirements,
    about_contest: contestCreationState.about_contest,
    about_company: contestCreationState.about_company,
    banner: contestCreationState.banner
  };
  
  // Disable submit button
  const submitButton = document.querySelector('.submit-contest-btn');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = `
      <svg class="spinner small" viewBox="0 0 50 50">
        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
      </svg>
      <span>Submitting...</span>
    `;
  }
  
  try {
    // Submit contest
    const result = await api.createContest(contestData);
    
    showNotification('Contest created successfully!', 'success');
    
    // Redirect to contest page
    window.router.navigate(`/contests/${result._id}`);
  } catch (error) {
    console.error('Failed to create contest:', error);
    
    // Show error notification
    showNotification('Failed to create contest. Please try again.', 'error');
    
    // Re-enable submit button
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Submit Contest';
    }
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