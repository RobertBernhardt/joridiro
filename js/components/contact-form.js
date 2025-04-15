/**
 * Contact form component for the Joridiro application
 */
import { createModal, closeModal } from './modal.js';
import { validateEmail } from '../utils/validators.js';
import * as api from '../api.js';
import { showNotification } from './notification.js';
import { store } from '../store.js';

/**
 * Shows the contact form modal
 */
export function showContactForm() {
  const currentUser = store.getState().user;
  
  const content = document.createElement('div');
  content.innerHTML = `
    <form class="contact-form">
      <div class="form-group">
        <label for="contact-name">Your Name</label>
        <input 
          type="text" 
          id="contact-name" 
          name="name" 
          required 
          placeholder="Enter your name"
          value="${currentUser ? currentUser.fullName : ''}"
          ${currentUser ? 'readonly' : ''}
        >
        <div class="error-message" id="contact-name-error"></div>
      </div>
      
      <div class="form-group">
        <label for="contact-email">Your Email</label>
        <input 
          type="email" 
          id="contact-email" 
          name="email" 
          required 
          placeholder="Enter your email"
          value="${currentUser ? currentUser.email : ''}"
          ${currentUser ? 'readonly' : ''}
        >
        <div class="error-message" id="contact-email-error"></div>
      </div>
      
      <div class="form-group">
        <label for="contact-subject">Subject</label>
        <input type="text" id="contact-subject" name="subject" required placeholder="Enter subject">
        <div class="error-message" id="contact-subject-error"></div>
      </div>
      
      <div class="form-group">
        <label for="contact-message">Message</label>
        <textarea id="contact-message" name="message" rows="5" required placeholder="Enter your message"></textarea>
        <div class="error-message" id="contact-message-error"></div>
      </div>
      
      <div class="form-group form-actions">
        <button type="submit" class="btn btn-primary btn-block">Send Message</button>
      </div>
    </form>
  `;
  
  const modal = createModal({
    title: 'Contact Us',
    content,
    className: 'contact-modal'
  });
  
  const form = content.querySelector('form');
  
  // Add form submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset error messages
    clearErrors(form);
    
    // Get form data
    const name = form.querySelector('#contact-name').value;
    const email = form.querySelector('#contact-email').value;
    const subject = form.querySelector('#contact-subject').value;
    const message = form.querySelector('#contact-message').value;
    
    // Validate form
    let isValid = true;
    
    if (!name || name.trim().length < 2) {
      showError(form, 'contact-name-error', 'Please enter your name');
      isValid = false;
    }
    
    if (!validateEmail(email)) {
      showError(form, 'contact-email-error', 'Please enter a valid email address');
      isValid = false;
    }
    
    if (!subject || subject.trim().length < 3) {
      showError(form, 'contact-subject-error', 'Please enter a subject');
      isValid = false;
    }
    
    if (!message || message.trim().length < 10) {
      showError(form, 'contact-message-error', 'Please enter a message (at least a few words)');
      isValid = false;
    }
    
    if (!isValid) return;
    
    // Disable form and show loading state
    toggleFormLoading(form, true);
    
    try {
      // Call contact API
      await api.sendContactMessage({
        name,
        email,
        subject,
        message
      });
      
      // Update modal to show success message
      form.innerHTML = `
        <div class="success-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <h4>Message Sent</h4>
          <p>Thank you for getting in touch! We will get back to you as soon as possible.</p>
          <button class="btn btn-primary" id="close-success-btn">Close</button>
        </div>
      `;
      
      // Add close button handler
      const closeBtn = form.querySelector('#close-success-btn');
      closeBtn.addEventListener('click', () => {
        closeModal(modal);
      });
      
      // Show notification
      showNotification('Your message has been sent successfully', 'success');
    } catch (error) {
      console.error('Contact form error:', error);
      showNotification('Failed to send message. Please try again later.', 'error');
      
      // Re-enable form
      toggleFormLoading(form, false);
    }
  });
}

/**
 * Shows an error message for a form field
 * @param {HTMLElement} form - The form containing the field
 * @param {string} errorId - The ID of the error message element
 * @param {string} message - The error message to display
 */
function showError(form, errorId, message) {
  const errorElement = form.querySelector(`#${errorId}`);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Add error class to the parent form group
    const formGroup = errorElement.closest('.form-group');
    if (formGroup) {
      formGroup.classList.add('has-error');
    }
  }
}

/**
 * Clears all error messages in a form
 * @param {HTMLElement} form - The form to clear errors from
 */
function clearErrors(form) {
  const errorElements = form.querySelectorAll('.error-message');
  errorElements.forEach(element => {
    element.textContent = '';
    element.style.display = 'none';
    
    // Remove error class from the parent form group
    const formGroup = element.closest('.form-group');
    if (formGroup) {
      formGroup.classList.remove('has-error');
    }
  });
}

/**
 * Toggles loading state for a form
 * @param {HTMLElement} form - The form to toggle loading state for
 * @param {boolean} isLoading - Whether the form is in loading state
 */
function toggleFormLoading(form, isLoading) {
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    if (isLoading) {
      submitButton.disabled = true;
      submitButton.dataset.originalText = submitButton.textContent;
      submitButton.innerHTML = `
        <svg class="spinner" viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
        </svg>
        <span>Sending...</span>
      `;
    } else {
      submitButton.disabled = false;
      submitButton.textContent = submitButton.dataset.originalText || 'Submit';
    }
  }
  
  // Disable/enable all inputs
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.disabled = isLoading;
  });
}