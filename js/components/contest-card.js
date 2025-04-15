/**
 * Contest card component for the Joridiro application
 */
import { formatCurrency, formatDate } from '../utils/formatters.js';

/**
 * Creates a contest card element
 * @param {Object} contest - Contest data
 * @param {boolean} [detailed=false] - Whether to show more details
 * @returns {HTMLElement} The contest card element
 */
export function createContestCard(contest, detailed = false) {
  const card = document.createElement('div');
  card.className = 'contest-card';
  if (detailed) card.classList.add('contest-card-detailed');
  
  // Calculate contest status
  const [statusText, statusClass] = getContestStatus(contest);
  
  // Calculate contest metrics based on type
  const metrics = calculateContestMetrics(contest);
  
  // Create contest tags
  const tagsHtml = contest.about_contest?.tags?.length > 0 ? 
    `<div class="contest-tags">
      ${contest.about_contest.tags.map(tag => `<span class="contest-tag">${tag}</span>`).join('')}
    </div>` : '';
  
  // Create card content
  card.innerHTML = `
    <div class="contest-card-image">
      <img src="${contest.banner || './images/default-contest-banner.png'}" alt="${contest.title}">
    </div>
    <div class="contest-card-content">
      <div class="contest-header">
        <div class="contest-company">
          <img src="${contest.about_company?.logo || './images/default-company-logo.png'}" alt="${contest.about_company?.name || 'Company'}">
          <span>${contest.about_company?.name || 'Company'}</span>
        </div>
        <div class="contest-status ${statusClass}">
          ${statusText}
        </div>
      </div>
      
      <h3 class="contest-title">${contest.title}</h3>
      
      ${tagsHtml}
      
      <p class="contest-description">${contest.about_contest?.short_description || ''}</p>
      
      <div class="contest-metrics">
        <div class="contest-metric">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="7"></circle>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
          </svg>
          <span>${formatCurrency(contest.grandPrize?.amount || 0)}</span>
          <small>Grand Prize</small>
        </div>
        
        <div class="contest-metric">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>${metrics.deadline}</span>
          <small>${contest.type === 'DEADLINE' ? 'Deadline' : 'Target'}</small>
        </div>
        
        <div class="contest-metric">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>${contest.participants?.length || 0}</span>
          <small>Participants</small>
        </div>
      </div>
      
      ${detailed ? getDetailedContent(contest, metrics) : ''}
      
      <div class="contest-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${metrics.progressPercentage}%"></div>
        </div>
        <div class="progress-text">
          ${metrics.progressText}
        </div>
      </div>
      
      <a href="/contests/${contest._id}" class="contest-card-link">View Contest</a>
    </div>
  `;
  
  return card;
}

/**
 * Gets additional content for detailed contest cards
 * @param {Object} contest - Contest data
 * @param {Object} metrics - Contest metrics
 * @returns {string} HTML for detailed content
 */
function getDetailedContent(contest, metrics) {
  return `
    <div class="contest-details">
      <div class="contest-milestones">
        <h4>Milestones</h4>
        ${contest.milestones?.length > 0 ? 
          `<ul>
            ${contest.milestones.map(milestone => `
              <li>
                <span class="milestone-prize">${formatCurrency(milestone.prize)}</span>
                <span class="milestone-target">
                  ${contest.type === 'DEADLINE' 
                    ? formatDate(milestone.date) 
                    : `${milestone.points} points`}
                </span>
              </li>
            `).join('')}
          </ul>` : 
          '<p>No milestones for this contest</p>'
        }
      </div>
      
      ${contest.lotteryPrize?.amount > 0 ? 
        `<div class="contest-lottery">
          <h4>Lottery Prize</h4>
          <p>${formatCurrency(contest.lotteryPrize.amount)}</p>
        </div>` : 
        ''
      }
    </div>
  `;
}

/**
 * Gets the contest status text and class
 * @param {Object} contest - Contest data
 * @returns {Array} [statusText, statusClass]
 */
function getContestStatus(contest) {
  if (!contest.open) {
    return ['Closed', 'status-closed'];
  }
  
  const now = new Date();
  const startDate = new Date(contest.startDate);
  const endDate = new Date(contest.endDate);
  
  if (now < startDate) {
    return ['Coming Soon', 'status-upcoming'];
  }
  
  if (now > endDate) {
    return ['Ended', 'status-closed'];
  }
  
  return [contest.type === 'DEADLINE' ? 'Deadline' : 'Score', 'status-active'];
}

/**
 * Calculates contest metrics for display
 * @param {Object} contest - Contest data
 * @returns {Object} Contest metrics
 */
function calculateContestMetrics(contest) {
  const now = new Date();
  const startDate = new Date(contest.startDate);
  const endDate = new Date(contest.endDate);
  
  // Default metrics
  const metrics = {
    deadline: '',
    progressPercentage: 0,
    progressText: '',
  };
  
  // Set deadline text
  if (contest.type === 'DEADLINE') {
    metrics.deadline = formatDate(contest.endDate);
    
    // Calculate progress percentage based on time
    if (now < startDate) {
      metrics.progressPercentage = 0;
      metrics.progressText = 'Starting soon';
    } else if (now > endDate) {
      metrics.progressPercentage = 100;
      metrics.progressText = 'Contest ended';
    } else {
      const totalDuration = endDate.getTime() - startDate.getTime();
      const elapsed = now.getTime() - startDate.getTime();
      metrics.progressPercentage = Math.min(100, Math.round((elapsed / totalDuration) * 100));
      
      // Calculate days remaining
      const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      metrics.progressText = `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`;
    }
  } else {
    // For SCORE type contests
    const targetScore = getTargetScore(contest.size);
    metrics.deadline = `${targetScore} Points`;
    
    // Calculate progress percentage based on best score
    const bestScore = contest.participants?.[0]?.score || 0;
    metrics.progressPercentage = Math.min(100, Math.round((bestScore / targetScore) * 100));
    metrics.progressText = `Best score: ${bestScore}/${targetScore}`;
  }
  
  return metrics;
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