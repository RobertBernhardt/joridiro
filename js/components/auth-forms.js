/**
 * Authentication forms for the Joridiro application
 */
import * as api from '../api.js';
import { store } from '../store.js';
import { showNotification } from './notification.js';
import { closeModal, createModal } from './modal.js';
import { validateEmail, validatePassword } from '../utils/validators.js';

/**
 * Creates the login form
 * @returns {HTMLElement} The login form element
 */
export function loginForm() {
  const form = document.createElement('form');
  form.className = 'auth-form login-form';
  form.innerHTML = `
    <div class="form-group">
      <label for="email">Email</label>
      <input type="email" id="login-email" name="email" required placeholder="Enter your email">
      <div class="error-message" id="login-email-error"></div>
    </div>
    
    <div class="form-group">
      <label for="password">Password</label>
      <input type="password" id="login-password" name="password" required placeholder="Enter your password">
      <div class="error-message" id="login-password-error"></div>
    </div>
    
    <div class="form-group form-actions">
      <button type="submit" class="btn btn-primary btn-block">Login</button>
    </div>
    
    <div class="form-footer">
      <a href="#" id="forgot-password-link">Forgot password?</a>
      <span class="divider">|</span>
      <a href="#" id="register-link">Don't have an account? Register</a>
    </div>
  `;
  
  // Add form submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset error messages
    clearErrors(form);
    
    // Get form data
    const email = form.querySelector('#login-email').value;
    const password = form.querySelector('#login-password').value;
    
    // Validate form
    let isValid = true;
    
    if (!validateEmail(email)) {
      showError(form, 'login-email-error', 'Please enter a valid email address');
      isValid = false;
    }
    
    if (!password) {
      showError(form, 'login-password-error', 'Please enter your password');
      isValid = false;
    }
    
    if (!isValid) return;
    
    // Disable form and show loading state
    toggleFormLoading(form, true);
    
    try {
      // Call login API
      const userData = await api.loginUser(email, password);
      
      // Update store with user data
      store.setState({ user: userData });
      
      // Show success notification
      showNotification('Login successful! Welcome back.', 'success');
      
      // Close modal
      closeModal(form.closest('.modal'));
    } catch (error) {
      console.error('Login error:', error);
      
      // Show appropriate error message
      if (error.status === 401) {
        showError(form, 'login-password-error', 'Invalid email or password');
      } else {
        showNotification('Login failed. Please try again.', 'error');
      }
    } finally {
      // Re-enable form
      toggleFormLoading(form, false);
    }
  });
  
  // Add forgot password handler
  const forgotPasswordLink = form.querySelector('#forgot-password-link');
  forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Replace login form with forgot password form
    const modal = form.closest('.modal');
    if (modal) {
      closeModal(modal);
      showForgotPasswordModal();
    }
  });
  
  // Add register link handler
  const registerLink = form.querySelector('#register-link');
  registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Replace login form with register form
    const modal = form.closest('.modal');
    if (modal) {
      closeModal(modal);
      createModal({
        title: 'Create an Account',
        content: registerForm(),
        className: 'auth-modal'
      });
    }
  });
  
  return form;
}

/**
 * Creates the registration form
 * @returns {HTMLElement} The registration form element
 */
export function registerForm() {
  const form = document.createElement('form');
  form.className = 'auth-form register-form';
  form.innerHTML = `
    <div class="form-group">
      <label for="register-fullname">Full Name</label>
      <input type="text" id="register-fullname" name="fullName" required placeholder="Enter your full name">
      <div class="error-message" id="register-fullname-error"></div>
    </div>
    
    <div class="form-group">
      <label for="register-email">Email</label>
      <input type="email" id="register-email" name="email" required placeholder="Enter your email">
      <div class="error-message" id="register-email-error"></div>
    </div>
    
    <div class="form-group">
      <label for="register-password">Password</label>
      <input type="password" id="register-password" name="password" required placeholder="Create a password">
      <div class="error-message" id="register-password-error"></div>
      <div class="password-requirements">
        Password must be at least 10 characters and include uppercase letter, lowercase letter, number, and special character.
      </div>
    </div>
    
    <div class="form-group">
      <label for="register-confirm-password">Confirm Password</label>
      <input type="password" id="register-confirm-password" name="confirmPassword" required placeholder="Confirm your password">
      <div class="error-message" id="register-confirm-password-error"></div>
    </div>
    
    <div class="form-group form-actions">
      <button type="submit" class="btn btn-primary btn-block">Create Account</button>
    </div>
    
    <div class="form-footer">
      <p>Already have an account? <a href="#" id="login-link">Login</a></p>
    </div>
  `;
  
  // Add form submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset error messages
    clearErrors(form);
    
    // Get form data
    const fullName = form.querySelector('#register-fullname').value;
    const email = form.querySelector('#register-email').value;
    const password = form.querySelector('#register-password').value;
    const confirmPassword = form.querySelector('#register-confirm-password').value;
    
    // Validate form
    let isValid = true;
    
    if (!fullName || fullName.trim().length < 3) {
      showError(form, 'register-fullname-error', 'Please enter your full name (at least 3 characters)');
      isValid = false;
    }
    
    if (!validateEmail(email)) {
      showError(form, 'register-email-error', 'Please enter a valid email address');
      isValid = false;
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      showError(form, 'register-password-error', passwordValidation.message);
      isValid = false;
    }
    
    if (password !== confirmPassword) {
      showError(form, 'register-confirm-password-error', 'Passwords do not match');
      isValid = false;
    }
    
    if (!isValid) return;
    
    // Disable form and show loading state
    toggleFormLoading(form, true);
    
    try {
      // Call register API
      await api.registerUser({
        fullName,
        email,
        password
      });
      
      // Show success notification
      showNotification('Registration successful! Please check your email to verify your account.', 'success');
      
      // Close modal
      closeModal(form.closest('.modal'));
      
      // Show verification modal
      showVerificationNeededModal(email);
    } catch (error) {
      console.error('Registration error:', error);
      
      // Show appropriate error message
      if (error.status === 409) {
        showError(form, 'register-email-error', 'This email address is already registered');
      } else {
        showNotification('Registration failed. Please try again.', 'error');
      }
    } finally {
      // Re-enable form
      toggleFormLoading(form, false);
    }
  });
  
  // Add login link handler
  const loginLink = form.querySelector('#login-link');
  loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Replace register form with login form
    const modal = form.closest('.modal');
    if (modal) {
      closeModal(modal);
      createModal({
        title: 'Login to Your Account',
        content: loginForm(),
        className: 'auth-modal'
      });
    }
  });
  
  return form;
}

/**
 * Creates and shows the forgot password modal
 */
function showForgotPasswordModal() {
  const content = document.createElement('div');
  content.innerHTML = `
    <form class="auth-form forgot-password-form">
      <p class="form-description">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      
      <div class="form-group">
        <label for="forgot-email">Email</label>
        <input type="email" id="forgot-email" name="email" required placeholder="Enter your email">
        <div class="error-message" id="forgot-email-error"></div>
      </div>
      
      <div class="form-group form-actions">
        <button type="submit" class="btn btn-primary btn-block">Send Reset Link</button>
      </div>
      
      <div class="form-footer">
        <a href="#" id="back-to-login">Back to Login</a>
      </div>
    </form>
  `;
  
  const modal = createModal({
    title: 'Reset Your Password',
    content,
    className: 'auth-modal'
  });
  
  const form = content.querySelector('form');
  
  // Add form submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset error messages
    clearErrors(form);
    
    // Get email
    const email = form.querySelector('#forgot-email').value;
    
    // Validate email
    if (!validateEmail(email)) {
      showError(form, 'forgot-email-error', 'Please enter a valid email address');
      return;
    }
    
    // Disable form and show loading state
    toggleFormLoading(form, true);
    
    try {
      // Call forgot password API
      await api.forgotPassword(email);
      
      // Update modal to show success message
      form.innerHTML = `
        <div class="success-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <h4>Reset Link Sent</h4>
          <p>We've sent a password reset link to ${email}. Please check your email and follow the instructions to reset your password.</p>
          <button class="btn btn-primary" id="close-success-btn">Close</button>
        </div>
      `;
      
      // Add close button handler
      const closeBtn = form.querySelector('#close-success-btn');
      closeBtn.addEventListener('click', () => {
        closeModal(modal);
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      showNotification('Failed to send reset link. Please try again.', 'error');
      
      // Re-enable form
      toggleFormLoading(form, false);
    }
  });
  
  // Add back to login handler
  const backToLoginLink = form.querySelector('#back-to-login');
  backToLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Replace forgot password form with login form
    closeModal(modal);
    createModal({
      title: 'Login to Your Account',
      content: loginForm(),
      className: 'auth-modal'
    });
  });
}

/**
 * Shows a modal informing the user they need to verify their email
 * @param {string} email - The email address to verify
 */
function showVerificationNeededModal(email) {
  const content = document.createElement('div');
  content.className = 'verification-needed';
  content.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
    </svg>
    
    <h4>Verify Your Email</h4>
    <p>We've sent a verification link to <strong>${email}</strong>. Please check your email and verify your account to continue.</p>
    
    <div class="action-buttons">
      <button class="btn btn-primary" id="done-btn">Done</button>
      <button class="btn btn-text" id="resend-btn">Resend Email</button>
    </div>
  `;
  
  const modal = createModal({
    title: 'Email Verification Required',
    content,
    className: 'auth-modal',
    closable: false
  });
  
  // Add done button handler
  const doneBtn = content.querySelector('#done-btn');
  doneBtn.addEventListener('click', () => {
    closeModal(modal);
  });
  
  // Add resend button handler
  const resendBtn = content.querySelector('#resend-btn');
  resendBtn.addEventListener('click', async () => {
    resendBtn.disabled = true;
    resendBtn.textContent = 'Sending...';
    
    try {
      await api.resendVerificationEmail(email);
      showNotification('Verification email has been resent', 'success');
      
      // Update button and disable for a period
      resendBtn.textContent = 'Email Sent';
      setTimeout(() => {
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend Email';
      }, 30000); // 30 seconds cooldown
    } catch (error) {
      console.error('Resend verification error:', error);
      showNotification('Failed to resend verification email. Please try again.', 'error');
      
      resendBtn.disabled = false;
      resendBtn.textContent = 'Resend Email';
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
        <span>Processing...</span>
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