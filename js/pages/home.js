/**
 * Home page for the Joridiro application
 */
import * as api from '../api.js';
import { showNotification } from '../components/notification.js';
import { showContactForm } from '../components/contact-form.js';

/**
 * Renders the home page
 */
export async function renderHomePage() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;
  
  // Set initial content with sections from the original Svelte components
  appContainer.innerHTML = `
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">Launch Contests That Inspire Action</h1>
          <p class="hero-subtitle">
            Help businesses scale through innovative contests and campaigns that reward users for completing actions.
          </p>
          <div class="hero-buttons">
            <a href="/contests" class="btn btn-primary">Explore Contests</a>
            <button id="learn-more-btn" class="btn btn-outline">Learn More</button>
          </div>
        </div>
        <div class="hero-image">
          <img src="./images/hero-illustration.svg" alt="Joridiro Platform">
        </div>
      </div>
    </section>
    
    <section class="features-section">
      <div class="section-container">
        <h2 class="section-title">What makes Joridiro special?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <h3>Grand Prizes</h3>
            <p>Award significant prizes to top performers who achieve your contest goals.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3>Milestone Prizes</h3>
            <p>Keep participants engaged with achievements and rewards throughout the contest.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3>Lottery Prizes</h3>
            <p>Encourage broader participation with random rewards that anyone can win.</p>
          </div>
        </div>
      </div>
    </section>
    
    <section class="why-section">
      <div class="section-container">
        <h2 class="section-title">Why choose Joridiro?</h2>
        <div class="why-content">
          <div class="why-text">
            <div class="why-point">
              <h3>Drive Tangible Results</h3>
              <p>Create contests that incentivize specific user actions aligned with your business goals.</p>
            </div>
            <div class="why-point">
              <h3>Engage Your Community</h3>
              <p>Foster competition and collaboration while building a loyal community around your brand.</p>
            </div>
            <div class="why-point">
              <h3>Simple to Deploy</h3>
              <p>Set up and launch contests in minutes with our intuitive platform.</p>
            </div>
          </div>
          <div class="why-image">
            <img src="./images/why-illustration.svg" alt="Why Joridiro">
          </div>
        </div>
      </div>
    </section>
    
    <section class="how-it-works-section">
      <div class="section-container">
        <h2 class="section-title">How It Works</h2>
        <div class="steps-container">
          <div class="step">
            <div class="step-number">1</div>
            <h3>Create a Contest</h3>
            <p>Define your goals, set prizes, and customize scoring criteria.</p>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <h3>Participants Join</h3>
            <p>Users discover and join your contest, motivated by your incentives.</p>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <h3>Track Progress</h3>
            <p>Monitor engagement and performance with real-time analytics.</p>
          </div>
          <div class="step">
            <div class="step-number">4</div>
            <h3>Award Winners</h3>
            <p>Winners are determined and prizes are automatically distributed.</p>
          </div>
        </div>
      </div>
    </section>
    
    <section class="domino-section">
      <div class="section-container">
        <h2 class="section-title">The Domino Effect</h2>
        <p class="section-subtitle">One contest can create a chain reaction of positive outcomes for your business.</p>
        <div class="domino-illustration">
          <div class="domino-piece">
            <div class="domino-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>Participants Join</h3>
          </div>
          <div class="domino-arrow">→</div>
          <div class="domino-piece">
            <div class="domino-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <h3>Actions Completed</h3>
          </div>
          <div class="domino-arrow">→</div>
          <div class="domino-piece">
            <div class="domino-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
              </svg>
            </div>
            <h3>Growth Accelerates</h3>
          </div>
        </div>
      </div>
    </section>
    
    <section class="demo-section">
      <div class="section-container">
        <h2 class="section-title">See Joridiro in Action</h2>
        <p class="section-subtitle">Explore our interactive demo to experience the platform firsthand.</p>
        <div class="demo-content">
          <div class="demo-image">
            <img src="./images/demo-screenshot.png" alt="Joridiro Demo">
          </div>
          <div class="demo-cta">
            <h3>Ready to see how it works?</h3>
            <p>Check out our demo contest to experience Joridiro from a participant's perspective.</p>
            <a href="/demo?data=QUARTERMEAL_LARGE_DEADLINE" class="btn btn-primary">View Demo Contest</a>
          </div>
        </div>
      </div>
    </section>
    
    <section class="latest-contests-section">
      <div class="section-container">
        <h2 class="section-title">Latest Contests</h2>
        <div class="contests-grid" id="latest-contests-container">
          <div class="loading-spinner">
            <svg class="spinner" viewBox="0 0 50 50">
              <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
            </svg>
            <span>Loading contests...</span>
          </div>
        </div>
        <div class="view-all-contests">
          <a href="/contests" class="btn btn-outline">View All Contests</a>
        </div>
      </div>
    </section>
    
    <section class="testimonial-section">
      <div class="section-container">
        <h2 class="section-title">What Our Customers Say</h2>
        <div class="testimonial-slider" id="testimonial-slider">
          <div class="testimonial-slide active">
            <div class="testimonial-content">
              <p class="testimonial-quote">"Joridiro helped us increase user engagement by 240% within just two weeks. The contest format was perfect for driving the actions we needed."</p>
              <div class="testimonial-author">
                <img src="./images/testimonial-1.jpg" alt="Sarah Johnson">
                <div class="testimonial-author-info">
                  <p class="testimonial-name">Sarah Johnson</p>
                  <p class="testimonial-position">Marketing Director, TechCorp</p>
                </div>
              </div>
            </div>
          </div>
          <div class="testimonial-slide">
            <div class="testimonial-content">
              <p class="testimonial-quote">"Setting up our contest took minutes, but the impact has lasted months. We've seen a sustained increase in activity even after the contest ended."</p>
              <div class="testimonial-author">
                <img src="./images/testimonial-2.jpg" alt="Mark Williams">
                <div class="testimonial-author-info">
                  <p class="testimonial-name">Mark Williams</p>
                  <p class="testimonial-position">CEO, GrowthStar</p>
                </div>
              </div>
            </div>
          </div>
          <div class="testimonial-slide">
            <div class="testimonial-content">
              <p class="testimonial-quote">"The milestone prizes feature kept our community engaged throughout the entire contest period. It was the perfect balance of competition and reward."</p>
              <div class="testimonial-author">
                <img src="./images/testimonial-3.jpg" alt="Emma Chen">
                <div class="testimonial-author-info">
                  <p class="testimonial-name">Emma Chen</p>
                  <p class="testimonial-position">Community Manager, SocialHub</p>
                </div>
              </div>
            </div>
          </div>
          <div class="testimonial-controls">
            <button class="testimonial-prev">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <div class="testimonial-dots">
              <button class="testimonial-dot active" data-index="0"></button>
              <button class="testimonial-dot" data-index="1"></button>
              <button class="testimonial-dot" data-index="2"></button>
            </div>
            <button class="testimonial-next">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
    
    <section class="faq-section">
      <div class="section-container">
        <h2 class="section-title">Frequently Asked Questions</h2>
        <div class="faq-accordion">
          <div class="faq-item">
            <button class="faq-question">
              <span>What types of contests can I create on Joridiro?</span>
              <svg class="faq-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="faq-answer">
              <p>Joridiro supports two primary contest types: Score-based and Deadline-based. Score-based contests end when a participant reaches a target score. Deadline-based contests run for a set period, and whoever has the highest score at the end wins. Both types support customizable scoring criteria and multiple prize tiers.</p>
            </div>
          </div>
          <div class="faq-item">
            <button class="faq-question">
              <span>How much does it cost to run a contest?</span>
              <svg class="faq-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="faq-answer">
              <p>Contest costs include the prize amount you set and a small platform fee. We offer three contest sizes: Small (€250 prize pool), Medium (€1,500 prize pool), and Large (€5,000 prize pool). Platform fees vary by size and are transparently displayed during the contest creation process.</p>
            </div>
          </div>
          <div class="faq-item">
            <button class="faq-question">
              <span>How do participants verify their contest actions?</span>
              <svg class="faq-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="faq-answer">
              <p>Participants submit evidence of completed actions through our platform. Contest creators can define verification requirements, which may include screenshots, links, or other proof. Our system also supports automatic verification through API integrations for many common platforms.</p>
            </div>
          </div>
          <div class="faq-item">
            <button class="faq-question">
              <span>How are contest winners paid?</span>
              <svg class="faq-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="faq-answer">
              <p>Winners receive their prizes directly through our secure payment system. We support multiple payout methods including bank transfers, PayPal, and cryptocurrency. Prize money is held in escrow during the contest to ensure fair and guaranteed payments to winners.</p>
            </div>
          </div>
          <div class="faq-item">
            <button class="faq-question">
              <span>Can I target specific participants for my contest?</span>
              <svg class="faq-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="faq-answer">
              <p>Yes, Joridiro allows you to set eligibility requirements including geographic location, professional roles, and other criteria. You can also create private contests that require an invitation to join, perfect for targeting specific communities or customer segments.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <section class="contact-section">
      <div class="section-container">
        <h2 class="section-title">Ready to Get Started?</h2>
        <p class="section-subtitle">Contact us to learn more about how Joridiro can help grow your business.</p>
        <button id="contact-us-section-btn" class="btn btn-primary btn-large">Contact Us</button>
      </div>
    </section>
  `;
  
  // Load latest contests
  loadLatestContests();
  
  // Set up interaction handlers after the content is in the DOM
  setupInteractionHandlers();
}

/**
 * Loads and displays the latest contests
 */
async function loadLatestContests() {
  const container = document.getElementById('latest-contests-container');
  if (!container) return;
  
  try {
    // Fetch latest contests
    const contests = await api.getContests(1, 3); // Page 1, limit 3
    
    // Clear loading indicator
    container.innerHTML = '';
    
    if (contests.length === 0) {
      container.innerHTML = `
        <div class="no-contests">
          <p>No active contests at the moment. Check back soon!</p>
        </div>
      `;
      return;
    }
    
    // Render contest cards
    contests.forEach(contest => {
      const card = createContestCard(contest);
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Failed to load latest contests:', error);
    container.innerHTML = `
      <div class="load-error">
        <p>Failed to load contests. Please try again later.</p>
        <button id="retry-load-contests" class="btn btn-text">Retry</button>
      </div>
    `;
    
    // Add retry handler
    const retryButton = container.querySelector('#retry-load-contests');
    if (retryButton) {
      retryButton.addEventListener('click', loadLatestContests);
    }
  }
}

/**
 * Creates a contest card element
 * @param {Object} contest - Contest data
 * @returns {HTMLElement} Contest card element
 */
function createContestCard(contest) {
  const card = document.createElement('div');
  card.className = 'contest-card';
  
  // Calculate days remaining or progress percentage
  let statusHtml = '';
  if (contest.type === 'DEADLINE') {
    const endDate = new Date(contest.endDate);
    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
    
    statusHtml = `
      <div class="contest-status">
        <span class="status-indicator deadline"></span>
        <span>${daysRemaining} days remaining</span>
      </div>
    `;
  } else {
    const targetScore = contest.size === 'SMALL' ? 5 : (contest.size === 'MEDIUM' ? 25 : 100);
    const bestScore = contest.participants?.[0]?.score || 0;
    const progressPercentage = Math.min(100, Math.round((bestScore / targetScore) * 100));
    
    statusHtml = `
      <div class="contest-status">
        <span class="status-indicator score"></span>
        <span>${progressPercentage}% progress to target</span>
      </div>
    `;
  }
  
  card.innerHTML = `
    <div class="contest-card-image">
      <img src="${contest.banner || './images/default-contest-banner.png'}" alt="${contest.title}">
    </div>
    <div class="contest-card-content">
      <div class="contest-company">
        <img src="${contest.about_company?.logo || './images/default-company-logo.png'}" alt="${contest.about_company?.name || 'Company'}">
        <span>${contest.about_company?.name || 'Company'}</span>
      </div>
      <h3 class="contest-title">${contest.title}</h3>
      <p class="contest-description">${contest.about_contest?.short_description || ''}</p>
      ${statusHtml}
      <div class="contest-prize">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="8" r="7"></circle>
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
        </svg>
        <span>€${contest.grandPrize?.amount} Grand Prize</span>
      </div>
      <a href="/contests/${contest._id}" class="contest-card-link">View Contest</a>
    </div>
  `;
  
  return card;
}

/**
 * Sets up interaction handlers for the home page
 */
function setupInteractionHandlers() {
  // Learn more button scrolls to features section
  const learnMoreBtn = document.getElementById('learn-more-btn');
  if (learnMoreBtn) {
    learnMoreBtn.addEventListener('click', () => {
      document.querySelector('.features-section').scrollIntoView({ behavior: 'smooth' });
    });
  }
  
  // Contact us button
  const contactUsBtn = document.getElementById('contact-us-section-btn');
  if (contactUsBtn) {
    contactUsBtn.addEventListener('click', () => {
      showContactForm();
    });
  }
  
  // FAQ accordion
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const faqItem = question.closest('.faq-item');
      const isOpen = faqItem.classList.contains('open');
      
      // Close all other FAQ items
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('open');
      });
      
      // Toggle current FAQ item
      if (!isOpen) {
        faqItem.classList.add('open');
      }
    });
  });
  
  // Testimonial slider
  setupTestimonialSlider();
}

/**
 * Sets up the testimonial slider
 */
function setupTestimonialSlider() {
  const slider = document.getElementById('testimonial-slider');
  if (!slider) return;
  
  const slides = slider.querySelectorAll('.testimonial-slide');
  const dots = slider.querySelectorAll('.testimonial-dot');
  const prevBtn = slider.querySelector('.testimonial-prev');
  const nextBtn = slider.querySelector('.testimonial-next');
  
  let currentSlide = 0;
  
  // Function to show a specific slide
  function showSlide(index) {
    // Wrap around if index is out of bounds
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    
    // Remove active class from all slides and dots
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Add active class to current slide and dot
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    
    currentSlide = index;
  }
  
  // Add click event listeners to dots
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
    });
  });
  
  // Add click event listeners to prev/next buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      showSlide(currentSlide - 1);
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      showSlide(currentSlide + 1);
    });
  }
  
  // Auto-advance slides every 5 seconds
  setInterval(() => {
    showSlide(currentSlide + 1);
  }, 5000);
}