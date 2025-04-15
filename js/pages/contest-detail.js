/**
 * Contest detail page for the Joridiro application
 */
import * as api from '../api.js';
import { store } from '../store.js';
import { showNotification } from '../components/notification.js';
import { createModal } from '../components/modal.js';
import { formatCurrency, formatDate, truncateText } from '../utils/formatters.js';

/**
 * Renders the contest detail page
 * @param {string} contestId - The ID of the contest to display
 */
export async function renderContestDetailPage(contestId) {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;
  
  // Set initial loading state
  appContainer.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner">
        <svg class="spinner" viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
        </svg>
        <span>Loading contest details...</span>
      </div>
    </div>
  `;
  
  try {
    // Fetch contest data
    const data = await api.getContestDetails(contestId);
    
    if (!data || !data.contest) {
      throw new Error('Contest not found');
    }
    
    const contest = data.contest;
    const score = data.score || null;
    const rank = data.rank || null;
    
    // Update store with current contest data
    store.setState({
      currentContest: {
        ...contest,
        score,
        rank
      }
    });
    
    // Render contest page
    renderContent(appContainer, contest, score, rank);
    
    // Set up event listeners after content is rendered
    setupEventListeners(contest);
    
    // Handle hash navigation (for sidebar links)
    if (window.location.hash) {
      setTimeout(() => {
        const element = document.querySelector(window.location.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  } catch (error) {
    console.error('Failed to load contest details:', error);
    
    // Show error message
    appContainer.innerHTML = `
      <div class="error-container">
        <h2>Contest Not Found</h2>
        <p>The contest you're looking for doesn't exist or may have been removed.</p>
        <a href="/contests" class="btn btn-primary">Back to Contests</a>
      </div>
    `;
  }
}

/**
 * Renders the contest page content
 * @param {HTMLElement} container - The container element
 * @param {Object} contest - The contest data
 * @param {Object} score - The user's score data
 * @param {number} rank - The user's rank
 */
function renderContent(container, contest, score, rank) {
  const currentUser = store.getState().user;
  const isOrganizer = currentUser && currentUser._id === contest.organizer;
  
  container.innerHTML = `
    <section class="contest-detail">
      <div class="contest-banner">
        <img src="${contest.banner || '../icons/default_banner.svg'}" alt="${contest.title}">
      </div>
      
      <div class="contest-detail-container">
        <div class="contest-detail-content">
          <!-- Contest Header -->
          <div class="contest-header">
            <div class="contest-company">
              <img src="${contest.about_company?.logo || '../images/default-company-logo.png'}" alt="${contest.about_company?.name || ''}">
              <div class="contest-title-wrapper">
                <h1 class="contest-title">${contest.title}</h1>
                <div class="company-name">
                  <span>${contest.about_company?.name || ''}</span>
                  ${contest.about_company?.link ? `
                    <a href="${contest.about_company.link}" target="_blank" rel="noopener noreferrer" class="company-link">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                  ` : ''}
                </div>
              </div>
            </div>
            
            <!-- Admin Actions if user is organizer -->
            ${isOrganizer ? `
              <div class="contest-admin-actions">
                <a href="/contests/${contest._id}/edit" class="btn btn-outline">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit Contest
                </a>
                <button id="admin-menu-toggle" class="btn btn-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="12" cy="5" r="1"></circle>
                    <circle cx="12" cy="19" r="1"></circle>
                  </svg>
                </button>
                <div id="admin-menu" class="admin-dropdown-menu">
                  <button id="add-announcement-btn" class="dropdown-item">
                    Add Announcement
                  </button>
                  <button id="add-faq-btn" class="dropdown-item">
                    Add FAQ
                  </button>
                  <button id="export-participants-btn" class="dropdown-item">
                    Export Participants
                  </button>
                </div>
              </div>
            ` : ''}
          </div>
          
          <!-- Contest Tags -->
          ${contest.about_contest?.tags?.length > 0 ? `
            <div class="contest-tags">
              ${contest.about_contest.tags.map(tag => `
                <span class="contest-tag">${tag}</span>
              `).join('')}
            </div>
          ` : ''}
          
          <!-- Company Description -->
          ${contest.about_company?.description ? `
            <div class="company-description">
              <p>${contest.about_company.description}</p>
            </div>
          ` : ''}
          
          <!-- Mobile Timeline & Actions -->
          <div class="contest-timeline-mobile">
            <div class="timeline-wrapper">
              ${renderTimeline(contest)}
            </div>
            
            ${isOrganizer ? `
              <div class="admin-properties">
                <h3>Admin Properties</h3>
                <div class="admin-property">
                  <span>Status:</span>
                  <span class="property-value">${contest.open ? 'Open' : 'Closed'}</span>
                </div>
                <div class="admin-property">
                  <span>Visibility:</span>
                  <span class="property-value">Public</span>
                </div>
              </div>
            ` : ''}
            
            <div class="contest-actions-mobile">
              ${renderContestActions(contest, currentUser, score)}
            </div>
          </div>
          
          <!-- Contest Stats -->
          <div class="contest-stats">
            <div class="stats-card">
              <div class="stats-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="8" r="7"></circle>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                </svg>
              </div>
              <div class="stats-content">
                <h3>${formatCurrency(contest.grandPrize?.amount || 0)}</h3>
                <p>Grand Prize</p>
              </div>
            </div>
            
            <div class="stats-card">
              <div class="stats-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div class="stats-content">
                <h3>${contest.participants?.length || 0}</h3>
                <p>Participants</p>
              </div>
            </div>
            
            <div class="stats-card">
              <div class="stats-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <div class="stats-content">
                <h3>${contest.size === 'SMALL' ? 'Small' : (contest.size === 'MEDIUM' ? 'Medium' : 'Large')}</h3>
                <p>Contest Size</p>
              </div>
            </div>
            
            <div class="stats-card">
              <div class="stats-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <div class="stats-content">
                <h3>${contest.type === 'DEADLINE' ? 'Deadline' : 'Score'}</h3>
                <p>Contest Type</p>
              </div>
            </div>
          </div>
          
          <!-- Contest Prizes -->
          <div id="prizes" class="contest-section">
            <h2 class="section-title">Prize Details</h2>
            
            <div class="prize-details">
              <div class="grand-prize">
                <h3>Grand Prize</h3>
                <div class="prize-amount">${formatCurrency(contest.grandPrize?.amount || 0)}</div>
                ${contest.grandPrize?.winner ? `
                  <div class="prize-winner">
                    <span>Winner: </span>
                    <div class="winner-info">
                      ${contest.grandPrize.winner.pfp ? `
                        <img src="${contest.grandPrize.winner.pfp}" alt="${contest.grandPrize.winner.fullName}">
                      ` : `
                        <div class="winner-initials">${getInitials(contest.grandPrize.winner.fullName)}</div>
                      `}
                      <span>${contest.grandPrize.winner.fullName}</span>
                    </div>
                  </div>
                ` : ''}
              </div>
              
              ${contest.milestones?.length > 0 ? `
                <div class="milestones">
                  <h3>Milestone Prizes</h3>
                  <ul class="milestone-list">
                    ${contest.milestones.map((milestone, index) => `
                      <li class="milestone-item">
                        <div class="milestone-info">
                          <div class="milestone-prize">${formatCurrency(milestone.prize)}</div>
                          <div class="milestone-target">
                            ${contest.type === 'DEADLINE' ? 
                              `Deadline: ${formatDate(milestone.date)}` : 
                              `Target: ${milestone.points} points`}
                          </div>
                        </div>
                        ${milestone.winner ? `
                          <div class="milestone-winner">
                            <span>Winner: </span>
                            <div class="winner-info">
                              ${milestone.winner.pfp ? `
                                <img src="${milestone.winner.pfp}" alt="${milestone.winner.fullName}">
                              ` : `
                                <div class="winner-initials">${getInitials(milestone.winner.fullName)}</div>
                              `}
                              <span>${milestone.winner.fullName}</span>
                            </div>
                          </div>
                        ` : ''}
                      </li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}
              
              ${contest.lotteryPrize?.amount > 0 ? `
                <div class="lottery-prize">
                  <h3>Lottery Prize</h3>
                  <div class="prize-amount">${formatCurrency(contest.lotteryPrize.amount)}</div>
                  <p class="lottery-info">Every participant gets lottery tickets based on their activity and score.</p>
                  ${contest.lotteryPrize?.winner ? `
                    <div class="prize-winner">
                      <span>Winner: </span>
                      <div class="winner-info">
                        ${contest.lotteryPrize.winner.pfp ? `
                          <img src="${contest.lotteryPrize.winner.pfp}" alt="${contest.lotteryPrize.winner.fullName}">
                        ` : `
                          <div class="winner-initials">${getInitials(contest.lotteryPrize.winner.fullName)}</div>
                        `}
                        <span>${contest.lotteryPrize.winner.fullName}</span>
                      </div>
                    </div>
                  ` : ''}
                </div>
              ` : ''}
            </div>
            
            <div class="contest-dates">
              <div class="date-item">
                <span>Start Date:</span>
                <strong>${formatDate(contest.startDate, { includeTime: true })}</strong>
              </div>
              <div class="date-item">
                <span>End Date:</span>
                <strong>${formatDate(contest.endDate, { includeTime: true })}</strong>
              </div>
            </div>
          </div>
          
          <!-- Contest About -->
          <div id="about" class="contest-section">
            <h2 class="section-title">About this Contest</h2>
            
            <div class="about-contest">
              ${contest.about_contest?.short_description ? `
                <div class="about-item">
                  <h3>Description</h3>
                  <p>${contest.about_contest.short_description}</p>
                </div>
              ` : ''}
              
              ${contest.about_contest?.target_audience ? `
                <div class="about-item">
                  <h3>Target Audience</h3>
                  <p>${contest.about_contest.target_audience}</p>
                </div>
              ` : ''}
              
              ${contest.about_contest?.purpose ? `
                <div class="about-item">
                  <h3>Purpose</h3>
                  <p>${contest.about_contest.purpose}</p>
                </div>
              ` : ''}
              
              ${contest.about_contest?.how_to_win ? `
                <div class="about-item">
                  <h3>How to Win</h3>
                  <p>${contest.about_contest.how_to_win}</p>
                </div>
              ` : ''}
              
              ${contest.about_contest?.boost ? `
                <div class="about-item">
                  <h3>What We Bring to the Table</h3>
                  <p>${contest.about_contest.boost}</p>
                </div>
              ` : ''}
            </div>
          </div>
          
          <!-- How to Score -->
          <div id="scoring" class="contest-section">
            <h2 class="section-title">How to Score</h2>
            
            <div class="scoring-system">
              ${contest.score?.length > 0 ? `
                <div class="scoring-table">
                  <div class="scoring-header">
                    <div class="scoring-cell">Action</div>
                    <div class="scoring-cell">Points</div>
                    ${score ? `<div class="scoring-cell">Your Value</div>` : ''}
                    ${score ? `<div class="scoring-cell">Your Points</div>` : ''}
                  </div>
                  
                  ${contest.score.map(item => `
                    <div class="scoring-row">
                      <div class="scoring-cell">
                        <div class="scoring-label">${item.description || `${item.points} points for every ${item.number} ${item.measuring_unit}`}</div>
                      </div>
                      <div class="scoring-cell">${item.points}</div>
                      ${score ? `
                        <div class="scoring-cell">
                          ${score.score.find(s => s.category === item._id)?.value || '0'}
                        </div>
                      ` : ''}
                      ${score ? `
                        <div class="scoring-cell">
                          ${score.score.find(s => s.category === item._id)?.points || '0'}
                        </div>
                      ` : ''}
                    </div>
                  `).join('')}
                  
                  ${score ? `
                    <div class="scoring-row scoring-total">
                      <div class="scoring-cell">Total Score</div>
                      <div class="scoring-cell"></div>
                      <div class="scoring-cell"></div>
                      <div class="scoring-cell">${score.score.reduce((total, item) => total + (item.points || 0), 0)}</div>
                    </div>
                  ` : ''}
                </div>
              ` : `
                <p>No scoring criteria defined for this contest.</p>
              `}
              
              ${score && contest.lottery_tickets ? `
                <div class="lottery-tickets">
                  <h3>Your Lottery Tickets</h3>
                  <p>You have <strong>${score.lottery_tickets}</strong> lottery tickets for this contest.</p>
                </div>
              ` : ''}
            </div>
          </div>
          
          <!-- Requirements -->
          ${hasRequirements(contest) ? `
            <div id="requirements" class="contest-section">
              <h2 class="section-title">Requirements</h2>
              
              <div class="requirements-list">
                ${contest.requirements.categories?.length > 0 ? `
                  <div class="requirement-group">
                    <h3>Categories</h3>
                    <ul>
                      ${contest.requirements.categories.map(category => `
                        <li>${category}</li>
                      `).join('')}
                    </ul>
                  </div>
                ` : ''}
                
                ${contest.requirements.countries?.length > 0 ? `
                  <div class="requirement-group">
                    <h3>Locations</h3>
                    <ul>
                      ${contest.requirements.countries.map(country => `
                        <li>${country}</li>
                      `).join('')}
                    </ul>
                  </div>
                ` : ''}
                
                ${contest.requirements.roles?.length > 0 ? `
                  <div class="requirement-group">
                    <h3>Roles</h3>
                    <ul>
                      ${contest.requirements.roles.map(role => `
                        <li>${role}</li>
                      `).join('')}
                    </ul>
                  </div>
                ` : ''}
                
                ${contest.requirements.additional?.length > 0 ? `
                  <div class="requirement-group">
                    <h3>Additional Requirements</h3>
                    <ul>
                      ${contest.requirements.additional.map(req => `
                        <li>
                          <strong>${req.name}:</strong> ${req.description}
                        </li>
                      `).join('')}
                    </ul>
                  </div>
                ` : ''}
                
                ${contest.requirements.organizer_platform ? `
                  <div class="requirement-group">
                    <h3>Platform</h3>
                    <p>This contest requires participation through this platform:</p>
                    <a href="${contest.requirements.organizer_platform}" target="_blank" rel="noopener noreferrer" class="platform-link">
                      ${contest.requirements.organizer_platform}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}
          
          <!-- Rules -->
          ${contest.rules?.length > 0 ? `
            <div id="rules" class="contest-section">
              <h2 class="section-title">Contest Rules</h2>
              
              <div class="rules-list">
                <ul>
                  ${contest.rules.map(rule => `
                    <li>${rule}</li>
                  `).join('')}
                </ul>
              </div>
            </div>
          ` : ''}
          
          <!-- Announcements -->
          ${contest.announcements?.length > 0 ? `
            <div id="announcements" class="contest-section">
              <h2 class="section-title">Announcements</h2>
              
              <div class="announcements-list">
                ${contest.announcements.map(announcement => `
                  <div class="announcement-item">
                    <div class="announcement-date">${formatDate(announcement.date)}</div>
                    <div class="announcement-content">${announcement.announcement}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          <!-- FAQ -->
          ${contest.faq?.length > 0 ? `
            <div id="faq" class="contest-section">
              <h2 class="section-title">Frequently Asked Questions</h2>
              
              <div class="faq-accordion">
                ${contest.faq.map((item, index) => `
                  <div class="faq-item">
                    <button class="faq-question">
                      <span>${item.question}</span>
                      <svg class="faq-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                    <div class="faq-answer">
                      <p>${item.answer}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
              
              ${currentUser ? `
                <div class="ask-question">
                  <button id="ask-question-btn" class="btn btn-outline">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    Ask a Question
                  </button>
                </div>
              ` : ''}
            </div>
          ` : `
            <div id="faq" class="contest-section">
              <h2 class="section-title">Frequently Asked Questions</h2>
              
              <div class="no-faq">
                <p>No FAQs available for this contest yet.</p>
                ${currentUser ? `
                  <button id="ask-question-btn" class="btn btn-outline">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    Ask a Question
                  </button>
                ` : ''}
              </div>
            </div>
          `}
          
          <!-- Participants -->
          <div id="participants" class="contest-section">
            <h2 class="section-title">Participants</h2>
            
            <div class="participants-container">
              ${contest.participants?.length > 0 ? `
                <div class="participants-list">
                  <div class="participant-header">
                    <div class="participant-rank">Rank</div>
                    <div class="participant-name">Participant</div>
                    <div class="participant-score">Score</div>
                    ${contest.type === 'DEADLINE' ? `<div class="participant-date">Joined</div>` : ''}
                  </div>
                  
                  ${contest.participants.map((participant, index) => `
                    <div class="participant-row ${currentUser && participant._id === currentUser._id ? 'current-user' : ''}">
                      <div class="participant-rank">${index + 1}</div>
                      <div class="participant-name">
                        <div class="participant-avatar">
                          ${participant.pfp ? `
                            <img src="${participant.pfp}" alt="${participant.fullName}">
                          ` : `
                            <div class="participant-initials">${getInitials(participant.fullName)}</div>
                          `}
                        </div>
                        <span>${participant.fullName}</span>
                      </div>
                      <div class="participant-score">${calculateParticipantScore(participant)}</div>
                      ${contest.type === 'DEADLINE' ? `
                        <div class="participant-date">${formatDate(participant.joinedDate || '')}</div>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div class="no-participants">
                  <p>No participants have joined this contest yet.</p>
                </div>
              `}
            </div>
          </div>
        </div>
        
        <!-- Sidebar -->
        <div class="contest-sidebar">
          <div class="sidebar-sticky">
            ${renderTimeline(contest)}
            
            ${isOrganizer ? `
              <div class="admin-properties">
                <h3>Admin Properties</h3>
                <div class="admin-property">
                  <span>Status:</span>
                  <span class="property-value">${contest.open ? 'Open' : 'Closed'}</span>
                </div>
                <div class="admin-property">
                  <span>Visibility:</span>
                  <span class="property-value">Public</span>
                </div>
              </div>
            ` : ''}
            
            <div class="contest-actions">
              ${renderContestActions(contest, currentUser, score)}
            </div>
            
            <div class="sidebar-links">
              <h3>Quick Links</h3>
              <ul>
                <li><a href="#prizes">Prize Details</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#scoring">How to Score</a></li>
                ${hasRequirements(contest) ? `<li><a href="#requirements">Requirements</a></li>` : ''}
                ${contest.rules?.length > 0 ? `<li><a href="#rules">Rules</a></li>` : ''}
                ${contest.announcements?.length > 0 ? `<li><a href="#announcements">Announcements</a></li>` : ''}
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#participants">Participants</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

/**
 * Sets up event listeners for the contest page
 * @param {Object} contest - The contest data
 */
function setupEventListeners(contest) {
  // FAQ accordion
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const faqItem = question.closest('.faq-item');
      faqItem.classList.toggle('open');
    });
  });
  
  // Admin menu toggle
  const adminMenuToggle = document.getElementById('admin-menu-toggle');
  const adminMenu = document.getElementById('admin-menu');
  
  if (adminMenuToggle && adminMenu) {
    adminMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      adminMenu.classList.toggle('open');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', () => {
      adminMenu.classList.remove('open');
    });
    
    // Prevent menu from closing when clicking inside
    adminMenu.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // Admin actions
    setupAdminActions(contest);
  }
  
  // Ask question button
  const askQuestionBtn = document.getElementById('ask-question-btn');
  if (askQuestionBtn) {
    askQuestionBtn.addEventListener('click', () => {
      showAskQuestionModal(contest._id);
    });
  }
  
  // Join contest button
  const joinContestBtn = document.getElementById('join-contest-btn');
  if (joinContestBtn) {
    joinContestBtn.addEventListener('click', () => {
      showJoinContestModal(contest);
    });
  }
  
  // Update score button
  const updateScoreBtn = document.getElementById('update-score-btn');
  if (updateScoreBtn) {
    updateScoreBtn.addEventListener('click', () => {
      showUpdateScoreModal(contest);
    });
  }
}

/**
 * Sets up admin action handlers
 * @param {Object} contest - The contest data
 */
function setupAdminActions(contest) {
  // Add announcement button
  const addAnnouncementBtn = document.getElementById('add-announcement-btn');
  if (addAnnouncementBtn) {
    addAnnouncementBtn.addEventListener('click', () => {
      showAddAnnouncementModal(contest._id);
    });
  }
  
  // Add FAQ button
  const addFaqBtn = document.getElementById('add-faq-btn');
  if (addFaqBtn) {
    addFaqBtn.addEventListener('click', () => {
      showAddFaqModal(contest._id);
    });
  }
  
  // Export participants button
  const exportParticipantsBtn = document.getElementById('export-participants-btn');
  if (exportParticipantsBtn) {
    exportParticipantsBtn.addEventListener('click', () => {
      exportParticipants(contest);
    });
  }
}

/**
 * Shows the add announcement modal
 * @param {string} contestId - The contest ID
 */
function showAddAnnouncementModal(contestId) {
  const content = document.createElement('div');
  content.innerHTML = `
    <form id="add-announcement-form" class="modal-form">
      <div class="form-group">
        <label for="announcement-text">Announcement</label>
        <textarea id="announcement-text" name="announcement" rows="5" required placeholder="Enter your announcement"></textarea>
        <div class="error-message" id="announcement-error"></div>
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Add Announcement</button>
        <button type="button" class="btn btn-text" id="cancel-announcement">Cancel</button>
      </div>
    </form>
  `;
  
  const modal = createModal({
    title: 'Add Announcement',
    content,
    className: 'announcement-modal'
  });
  
  // Handle form submission
  const form = content.querySelector('#add-announcement-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const announcement = form.querySelector('#announcement-text').value.trim();
    
    if (!announcement) {
      showFormError(form, 'announcement-error', 'Please enter an announcement');
      return;
    }
    
    try {
      toggleFormLoading(form, true);
      
      await api.addAnnouncement(contestId, { announcement });
      
      showNotification('Announcement added successfully', 'success');
      
      // Close modal and reload page
      modal.querySelector('.modal-close').click();
      window.location.reload();
    } catch (error) {
      console.error('Failed to add announcement:', error);
      showNotification('Failed to add announcement', 'error');
      toggleFormLoading(form, false);
    }
  });
  
  // Handle cancel button
  const cancelBtn = content.querySelector('#cancel-announcement');
  cancelBtn.addEventListener('click', () => {
    modal.querySelector('.modal-close').click();
  });
}

/**
 * Shows the add FAQ modal
 * @param {string} contestId - The contest ID
 */
function showAddFaqModal(contestId) {
  const content = document.createElement('div');
  content.innerHTML = `
    <form id="add-faq-form" class="modal-form">
      <div class="form-group">
        <label for="faq-question">Question</label>
        <input type="text" id="faq-question" name="question" required placeholder="Enter the question">
        <div class="error-message" id="question-error"></div>
      </div>
      
      <div class="form-group">
        <label for="faq-answer">Answer</label>
        <textarea id="faq-answer" name="answer" rows="5" required placeholder="Enter the answer"></textarea>
        <div class="error-message" id="answer-error"></div>
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Add FAQ</button>
        <button type="button" class="btn btn-text" id="cancel-faq">Cancel</button>
      </div>
    </form>
  `;
  
  const modal = createModal({
    title: 'Add FAQ',
    content,
    className: 'faq-modal'
  });
  
  // Handle form submission
  const form = content.querySelector('#add-faq-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const question = form.querySelector('#faq-question').value.trim();
    const answer = form.querySelector('#faq-answer').value.trim();
    
    let isValid = true;
    
    if (!question) {
      showFormError(form, 'question-error', 'Please enter a question');
      isValid = false;
    }
    
    if (!answer) {
      showFormError(form, 'answer-error', 'Please enter an answer');
      isValid = false;
    }
    
    if (!isValid) return;
    
    try {
      toggleFormLoading(form, true);
      
      await api.addFaq(contestId, { question, answer });
      
      showNotification('FAQ added successfully', 'success');
      
      // Close modal and reload page
      modal.querySelector('.modal-close').click();
      window.location.reload();
    } catch (error) {
      console.error('Failed to add FAQ:', error);
      showNotification('Failed to add FAQ', 'error');
      toggleFormLoading(form, false);
    }
  });
  
  // Handle cancel button
  const cancelBtn = content.querySelector('#cancel-faq');
  cancelBtn.addEventListener('click', () => {
    modal.querySelector('.modal-close').click();
  });
}

/**
 * Exports participants data as CSV
 * @param {Object} contest - The contest data
 */
function exportParticipants(contest) {
  if (!contest.participants || contest.participants.length === 0) {
    showNotification('No participants to export', 'warning');
    return;
  }
  
  // Create CSV content
  let csvContent = 'Rank,Name,Email,Score,Join Date\n';
  
  contest.participants.forEach((participant, index) => {
    const score = calculateParticipantScore(participant);
    const joinDate = participant.joinedDate ? formatDate(participant.joinedDate) : 'N/A';
    
    // Create CSV row
    const row = [
      index + 1,
      participant.fullName,
      participant.email || 'N/A',
      score,
      joinDate
    ].map(cell => `"${cell}"`).join(',');
    
    csvContent += row + '\n';
  });
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${contest.title.replace(/[^a-z0-9]/gi, '_')}_participants.csv`);
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Shows the ask question modal
 * @param {string} contestId - The contest ID
 */
function showAskQuestionModal(contestId) {
  const content = document.createElement('div');
  content.innerHTML = `
    <form id="ask-question-form" class="modal-form">
      <div class="form-group">
        <label for="question-text">Your Question</label>
        <textarea id="question-text" name="question" rows="5" required placeholder="Enter your question"></textarea>
        <div class="error-message" id="question-error"></div>
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Submit Question</button>
        <button type="button" class="btn btn-text" id="cancel-question">Cancel</button>
      </div>
    </form>
  `;
  
  const modal = createModal({
    title: 'Ask a Question',
    content,
    className: 'question-modal'
  });
  
  // Handle form submission
  const form = content.querySelector('#ask-question-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const question = form.querySelector('#question-text').value.trim();
    
    if (!question) {
      showFormError(form, 'question-error', 'Please enter your question');
      return;
    }
    
    try {
      toggleFormLoading(form, true);
      
      await api.askQuestion(contestId, { question });
      
      showNotification('Your question has been submitted', 'success');
      
      // Show success message
      form.innerHTML = `
        <div class="success-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <h4>Question Submitted</h4>
          <p>Thank you for your question! The contest organizer will review and answer it soon.</p>
          <button class="btn btn-primary" id="close-success-btn">Close</button>
        </div>
      `;
      
      // Add close button handler
      const closeBtn = form.querySelector('#close-success-btn');
      closeBtn.addEventListener('click', () => {
        modal.querySelector('.modal-close').click();
      });
    } catch (error) {
      console.error('Failed to submit question:', error);
      showNotification('Failed to submit question', 'error');
      toggleFormLoading(form, false);
    }
  });
  
  // Handle cancel button
  const cancelBtn = content.querySelector('#cancel-question');
  cancelBtn.addEventListener('click', () => {
    modal.querySelector('.modal-close').click();
  });
}

/**
 * Shows the join contest modal
 * @param {Object} contest - The contest data
 */
function showJoinContestModal(contest) {
  const content = document.createElement('div');
  content.innerHTML = `
    <div class="join-contest-modal">
      <div class="join-header">
        <h3>${contest.title}</h3>
        <p>Join this contest to compete for prizes and participate in the community.</p>
      </div>
      
      <div class="join-details">
        <div class="join-detail-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="7"></circle>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
          </svg>
          <div class="join-detail-text">
            <span>Grand Prize</span>
            <strong>${formatCurrency(contest.grandPrize?.amount || 0)}</strong>
          </div>
        </div>
        
        <div class="join-detail-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <div class="join-detail-text">
            <span>Contest Type</span>
            <strong>${contest.type === 'DEADLINE' ? 'Deadline-based' : 'Score-based'}</strong>
          </div>
        </div>
      </div>
      
      <div class="join-requirements">
        <h4>Requirements</h4>
        ${hasRequirements(contest) ? `
          <ul class="requirement-checklist">
            ${contest.requirements.categories?.length > 0 ? `
              <li>
                <span class="requirement-label">Categories:</span>
                <span>${contest.requirements.categories.join(', ')}</span>
              </li>
            ` : ''}
            
            ${contest.requirements.countries?.length > 0 ? `
              <li>
                <span class="requirement-label">Locations:</span>
                <span>${contest.requirements.countries.join(', ')}</span>
              </li>
            ` : ''}
            
            ${contest.requirements.roles?.length > 0 ? `
              <li>
                <span class="requirement-label">Roles:</span>
                <span>${contest.requirements.roles.join(', ')}</span>
              </li>
            ` : ''}
            
            ${contest.requirements.additional?.length > 0 ? `
              <li>
                <span class="requirement-label">Additional:</span>
                <ul>
                  ${contest.requirements.additional.map(req => `
                    <li><strong>${req.name}:</strong> ${req.description}</li>
                  `).join('')}
                </ul>
              </li>
            ` : ''}
            
            ${contest.requirements.organizer_platform ? `
              <li>
                <span class="requirement-label">Platform:</span>
                <a href="${contest.requirements.organizer_platform}" target="_blank" rel="noopener noreferrer">${contest.requirements.organizer_platform}</a>
              </li>
            ` : ''}
          </ul>
        ` : `
          <p>No special requirements for this contest.</p>
        `}
      </div>
      
      <div class="join-confirmation">
        <div class="confirmation-check">
          <input type="checkbox" id="join-confirm" name="join-confirm">
          <label for="join-confirm">I confirm that I meet all the requirements for this contest</label>
        </div>
      </div>
      
      <div class="join-actions">
        <button id="confirm-join-btn" class="btn btn-primary" disabled>Join Contest</button>
        <button id="cancel-join-btn" class="btn btn-text">Cancel</button>
      </div>
    </div>
  `;
  
  const modal = createModal({
    title: 'Join Contest',
    content,
    className: 'join-contest-modal'
  });
  
  // Handle confirmation checkbox
  const confirmCheckbox = content.querySelector('#join-confirm');
  const confirmJoinBtn = content.querySelector('#confirm-join-btn');
  
  confirmCheckbox.addEventListener('change', () => {
    confirmJoinBtn.disabled = !confirmCheckbox.checked;
  });
  
  // Handle join button
  confirmJoinBtn.addEventListener('click', async () => {
    if (!confirmCheckbox.checked) return;
    
    confirmJoinBtn.disabled = true;
    confirmJoinBtn.innerHTML = `
      <svg class="spinner small" viewBox="0 0 50 50">
        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
      </svg>
      <span>Joining...</span>
    `;
    
    try {
      await api.joinContest(contest._id);
      
      showNotification('You have successfully joined the contest', 'success');
      
      // Close modal and reload page
      modal.querySelector('.modal-close').click();
      window.location.reload();
    } catch (error) {
      console.error('Failed to join contest:', error);
      showNotification('Failed to join contest', 'error');
      
      confirmJoinBtn.disabled = false;
      confirmJoinBtn.textContent = 'Join Contest';
    }
  });
  
  // Handle cancel button
  const cancelJoinBtn = content.querySelector('#cancel-join-btn');
  cancelJoinBtn.addEventListener('click', () => {
    modal.querySelector('.modal-close').click();
  });
}

/**
 * Shows the update score modal
 * @param {Object} contest - The contest data
 */
function showUpdateScoreModal(contest) {
  const scoreCategories = contest.score || [];
  
  if (scoreCategories.length === 0) {
    showNotification('No scoring categories found for this contest', 'error');
    return;
  }
  
  // Get current score data
  const currentScore = store.getState().currentContest?.score || null;
  
  const content = document.createElement('div');
  content.innerHTML = `
    <form id="update-score-form" class="modal-form">
      <p class="form-description">
        Update your progress for this contest by entering your current values below.
      </p>
      
      ${scoreCategories.map(category => {
        const currentValue = currentScore?.score?.find(s => s.category === category._id)?.value || 0;
        
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
    
    const scoreData = Array.from(scoreInputs).map(input => ({
      category: input.dataset.category,
      value: parseFloat(input.value) || 0
    }));
    
    try {
      toggleFormLoading(form, true);
      
      await api.updateScore(contest._id, { score: scoreData });
      
      showNotification('Your score has been updated', 'success');
      
      // Close modal and reload page
      modal.querySelector('.modal-close').click();
      window.location.reload();
    } catch (error) {
      console.error('Failed to update score:', error);
      showNotification('Failed to update score', 'error');
      toggleFormLoading(form, false);
    }
  });
  
  // Handle cancel button
  const cancelBtn = content.querySelector('#cancel-update');
  cancelBtn.addEventListener('click', () => {
    modal.querySelector('.modal-close').click();
  });
}

/**
 * Renders the contest timeline
 * @param {Object} contest - The contest data
 * @returns {string} Timeline HTML
 */
function renderTimeline(contest) {
  const now = new Date();
  const startDate = new Date(contest.startDate);
  const endDate = new Date(contest.endDate);
  
  // Calculate contest status
  let statusText, statusClass;
  
  if (!contest.open) {
    statusText = 'Closed';
    statusClass = 'status-closed';
  } else if (now < startDate) {
    statusText = 'Coming Soon';
    statusClass = 'status-upcoming';
  } else if (now > endDate) {
    statusText = 'Ended';
    statusClass = 'status-closed';
  } else {
    statusText = 'Active';
    statusClass = 'status-active';
  }
  
  // Calculate progress
  let progressPercentage = 0;
  let daysRemaining = 0;
  
  if (contest.type === 'DEADLINE') {
    if (now > endDate) {
      progressPercentage = 100;
    } else if (now < startDate) {
      progressPercentage = 0;
    } else {
      const totalDuration = endDate.getTime() - startDate.getTime();
      const elapsed = now.getTime() - startDate.getTime();
      progressPercentage = Math.min(100, Math.round((elapsed / totalDuration) * 100));
    }
    
    daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
  } else {
    // For SCORE type contests
    const targetScore = getTargetScore(contest.size);
    const bestScore = contest.participants?.[0]?.score || 0;
    progressPercentage = Math.min(100, Math.round((bestScore / targetScore) * 100));
  }
  
  return `
    <div class="contest-timeline">
      <div class="timeline-header">
        <div class="timeline-type ${contest.type === 'DEADLINE' ? 'type-deadline' : 'type-score'}">
          ${contest.type === 'DEADLINE' ? 'Deadline-based' : 'Score-based'}
        </div>
        <div class="timeline-status ${statusClass}">
          ${statusText}
        </div>
      </div>
      
      <div class="timeline-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progressPercentage}%"></div>
        </div>
        
        ${contest.type === 'DEADLINE' ? `
          <div class="timeline-dates">
            <div class="timeline-date">
              <span>Start</span>
              <strong>${formatDate(contest.startDate, { shortMonth: true })}</strong>
            </div>
            <div class="timeline-date">
              <span>End</span>
              <strong>${formatDate(contest.endDate, { shortMonth: true })}</strong>
            </div>
          </div>
          
          <div class="days-remaining">
            ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining
          </div>
        ` : `
          <div class="score-progress">
            <div class="score-target">
              <span>Target Score: </span>
              <strong>${getTargetScore(contest.size)}</strong>
            </div>
            <div class="score-best">
              <span>Best Score: </span>
              <strong>${contest.participants?.[0]?.score || 0}</strong>
            </div>
          </div>
        `}
      </div>
      
      ${contest.milestones?.length > 0 ? `
        <div class="timeline-milestones">
          <h4>Milestones</h4>
          <ul>
            ${contest.milestones.map(milestone => {
              let isMilestoneReached = false;
              let milestoneLabel = '';
              
              if (contest.type === 'DEADLINE') {
                const milestoneDate = new Date(milestone.date);
                isMilestoneReached = now >= milestoneDate;
                milestoneLabel = formatDate(milestone.date, { shortMonth: true });
              } else {
                isMilestoneReached = contest.participants?.[0]?.score >= milestone.points;
                milestoneLabel = `${milestone.points} Points`;
              }
              
              return `
                <li class="milestone ${isMilestoneReached ? 'reached' : ''}">
                  <div class="milestone-marker"></div>
                  <div class="milestone-content">
                    <span class="milestone-prize">${formatCurrency(milestone.prize)}</span>
                    <span class="milestone-label">${milestoneLabel}</span>
                  </div>
                </li>
              `;
            }).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Renders contest action buttons
 * @param {Object} contest - The contest data
 * @param {Object} currentUser - The current user
 * @param {Object} score - The user's score data
 * @returns {string} Actions HTML
 */
function renderContestActions(contest, currentUser, score) {
  if (!currentUser) {
    return `
      <div class="login-required">
        <p>You need to be logged in to participate in this contest.</p>
        <button class="btn btn-primary btn-block login-btn">Login to Join</button>
      </div>
    `;
  }
  
  // Check if user is the organizer
  if (currentUser._id === contest.organizer) {
    return `
      <div class="organizer-actions">
        <p>You are the organizer of this contest.</p>
        <a href="/contests/${contest._id}/edit" class="btn btn-outline btn-block">
          Edit Contest
        </a>
      </div>
    `;
  }
  
  // Check if user has already joined
  const hasJoined = contest.participants?.some(p => p._id === currentUser._id);
  
  if (!hasJoined) {
    // Check if contest is open
    if (!contest.open) {
      return `
        <div class="contest-closed">
          <p>This contest is currently closed for new participants.</p>
        </div>
      `;
    }
    
    return `
      <button id="join-contest-btn" class="btn btn-primary btn-block">
        Join Contest
      </button>
    `;
  }
  
  // User has joined
  return `
    <div class="participant-actions">
      <div class="participant-status">
        <p>You are participating in this contest.</p>
        ${score ? `
          <div class="participant-score">
            <span>Your Score: </span>
            <strong>${score.score.reduce((total, item) => total + (item.points || 0), 0)}</strong>
          </div>
          <div class="participant-rank">
            <span>Your Rank: </span>
            <strong>${score.rank || 'N/A'}</strong>
          </div>
        ` : ''}
      </div>
      
      <button id="update-score-btn" class="btn btn-primary btn-block">
        Update Score
      </button>
    </div>
  `;
}

/**
 * Gets the target score based on contest size
 * @param {string} size - Contest size (SMALL, MEDIUM, LARGE)
 * @returns {number} Target score
 */
function getTargetScore(size) {
  switch (size) {
    case 'SMALL':
      return 5;
    case 'MEDIUM':
      return 25;
    case 'LARGE':
      return 100;
    default:
      return 100;
  }
}

/**
 * Calculates a participant's total score
 * @param {Object} participant - Participant data
 * @returns {number} Total score
 */
function calculateParticipantScore(participant) {
  if (!participant || !participant.score) return 0;
  
  return participant.score.reduce((total, item) => total + (item.points || 0), 0);
}

/**
 * Gets initials from a name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
function getInitials(name) {
  if (!name) return '';
  
  const parts = name.split(' ').filter(part => part.length > 0);
  
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Shows an error message in a form
 * @param {HTMLElement} form - The form element
 * @param {string} errorId - Error element ID
 * @param {string} message - Error message
 */
function showFormError(form, errorId, message) {
  const errorElement = form.querySelector(`#${errorId}`);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

/**
 * Toggles form loading state
 * @param {HTMLElement} form - The form element
 * @param {boolean} isLoading - Loading state
 */
function toggleFormLoading(form, isLoading) {
  const submitButton = form.querySelector('button[type="submit"]');
  
  if (submitButton) {
    if (isLoading) {
      submitButton.disabled = true;
      submitButton.dataset.originalText = submitButton.textContent;
      submitButton.innerHTML = `
        <svg class="spinner small" viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
        </svg>
        <span>Processing...</span>
      `;
    } else {
      submitButton.disabled = false;
      submitButton.textContent = submitButton.dataset.originalText || 'Submit';
    }
  }
  
  // Disable all inputs
  const inputs = form.querySelectorAll('input, textarea, select, button');
  inputs.forEach(input => {
    if (input !== submitButton) {
      input.disabled = isLoading;
    }
  });
}

/**
 * Checks if a contest has any requirements
 * @param {Object} contest - Contest data
 * @returns {boolean} True if the contest has requirements
 */
function hasRequirements(contest) {
  return (
    contest.requirements &&
    (
      (contest.requirements.categories && contest.requirements.categories.length > 0) ||
      (contest.requirements.countries && contest.requirements.countries.length > 0) ||
      (contest.requirements.roles && contest.requirements.roles.length > 0) ||
      (contest.requirements.additional && contest.requirements.additional.length > 0) ||
      contest.requirements.organizer_platform
    )
  );
}