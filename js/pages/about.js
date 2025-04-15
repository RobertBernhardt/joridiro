/**
 * About page for the Joridiro application
 */
import { showContactForm } from '../components/contact-form.js';

/**
 * Renders the about page
 */
export function renderAboutPage() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;
  
  appContainer.innerHTML = `
    <div class="about-container">
      <section class="about-header">
        <div class="about-header-content">
          <h1>About Joridiro</h1>
          <p class="subtitle">Connecting businesses with their audience through engaging contests</p>
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
      </section>
      
      <section class="about-story">
        <div class="section-container">
          <div class="story-content">
            <div class="story-text">
              <h2>Our Story</h2>
              <p>
                The journey of Joridiro began in 2022 when a team of entrepreneurs recognized a common challenge faced by businesses: effectively engaging their audience and driving specific actions that contribute to growth.
              </p>
              <p>
                Traditional marketing approaches often fell short in motivating users to take meaningful actions. Meanwhile, the power of gamification and incentives was being underutilized in business strategies.
              </p>
              <p>
                This realization led to the birth of Joridiro, a platform designed to transform how businesses connect with their audience through contest-based engagement. By combining the thrill of competition with meaningful rewards, we created a system where everyone wins - businesses achieve their goals, and participants are recognized and rewarded for their contributions.
              </p>
              <p>
                Since our launch, we've helped companies of all sizes run successful contests that drive measurable results and create lasting relationships with their communities.
              </p>
            </div>
            <div class="story-image">
              <img src="./images/about-story.jpg" alt="Joridiro Team">
            </div>
          </div>
        </div>
      </section>
      
      <section class="about-mission">
        <div class="section-container">
          <div class="mission-content">
            <div class="mission-image">
              <img src="./images/about-mission.jpg" alt="Our Mission">
            </div>
            <div class="mission-text">
              <h2>Our Mission</h2>
              <p>
                At Joridiro, our mission is to empower businesses to achieve their growth objectives by fostering meaningful engagement with their audience through innovative contest frameworks.
              </p>
              <p>
                We believe in the power of incentives to drive action, the importance of recognition to build community, and the effectiveness of competition to bring out the best in people.
              </p>
              <h3>Our Core Values</h3>
              <ul class="values-list">
                <li>
                  <div class="value-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </div>
                  <div class="value-content">
                    <h4>Trust & Transparency</h4>
                    <p>We build trust through clear rules, transparent processes, and fair outcomes for all contest participants.</p>
                  </div>
                </li>
                <li>
                  <div class="value-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </div>
                  <div class="value-content">
                    <h4>Excellence in Execution</h4>
                    <p>We strive for excellence in every contest we help create, ensuring a seamless experience for organizers and participants alike.</p>
                  </div>
                </li>
                <li>
                  <div class="value-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div class="value-content">
                    <h4>Community Focus</h4>
                    <p>We believe in the power of community and design our platform to strengthen relationships between businesses and their audiences.</p>
                  </div>
                </li>
                <li>
                  <div class="value-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                      <line x1="6" y1="1" x2="6" y2="4"></line>
                      <line x1="10" y1="1" x2="10" y2="4"></line>
                      <line x1="14" y1="1" x2="14" y2="4"></line>
                    </svg>
                  </div>
                  <div class="value-content">
                    <h4>Innovation</h4>
                    <p>We continuously innovate our contest frameworks and platform features to help businesses achieve their goals in creative ways.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      <section class="about-team">
        <div class="section-container">
          <h2 class="section-title">Meet Our Team</h2>
          <p class="section-subtitle">The passionate individuals behind Joridiro</p>
          
          <div class="team-grid">
            <div class="team-member">
              <div class="member-image">
                <img src="./images/team/founder.jpg" alt="Robert Bernhardt">
              </div>
              <h3 class="member-name">Robert Bernhardt</h3>
              <p class="member-role">Founder & CEO</p>
              <p class="member-bio">
                Robert brings over 15 years of experience in digital marketing and growth strategies. His vision drives Joridiro's mission to connect businesses with their audiences.
              </p>
            </div>
            
            <div class="team-member">
              <div class="member-image">
                <img src="./images/team/cto.jpg" alt="Sarah Chen">
              </div>
              <h3 class="member-name">Sarah Chen</h3>
              <p class="member-role">Chief Technology Officer</p>
              <p class="member-bio">
                With a background in full-stack development and AI, Sarah leads our technical team to develop innovative contest frameworks and platform features.
              </p>
            </div>
            
            <div class="team-member">
              <div class="member-image">
                <img src="./images/team/design.jpg" alt="Michael Rodriguez">
              </div>
              <h3 class="member-name">Michael Rodriguez</h3>
              <p class="member-role">Head of Design</p>
              <p class="member-bio">
                Michael ensures that every contest on Joridiro is visually engaging and provides an intuitive experience for all participants.
              </p>
            </div>
            
            <div class="team-member">
              <div class="member-image">
                <img src="./images/team/marketing.jpg" alt="Emma Wilson">
              </div>
              <h3 class="member-name">Emma Wilson</h3>
              <p class="member-role">Marketing Director</p>
              <p class="member-bio">
                Emma helps businesses maximize their contest impact through strategic marketing approaches and community engagement tactics.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section class="about-contact">
        <div class="section-container">
          <div class="contact-content">
            <h2>Get in Touch</h2>
            <p>
              Have questions about how Joridiro can help your business? We'd love to hear from you!
            </p>
            <button id="contact-about-btn" class="btn btn-primary">Contact Us</button>
          </div>
        </div>
      </section>
    </div>
  `;
  
  // Set up contact button
  const contactBtn = document.getElementById('contact-about-btn');
  if (contactBtn) {
    contactBtn.addEventListener('click', () => {
      showContactForm();
    });
  }
}