/**
 * Profile page for the Joridiro application
 */
import * as api from '../api.js';
import { store } from '../store.js';
import { showNotification } from '../components/notification.js';
import { getInitials } from '../utils/formatters.js';

/**
 * Renders the user profile page
 */
export async function renderProfilePage() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;
  
  const user = store.getState().user;
  if (!user) {
    // Redirect to home if not logged in
    window.router.navigate('/');
    return;
  }
  
  // Set initial content with profile layout
  appContainer.innerHTML = `
    <div class="profile-container">
      ${renderProfileSidebar(user, 'details')}
      
      <div class="profile-content">
        <header class="profile-header">
          <h1>My Details</h1>
        </header>
        
        <form id="profile-form" class="profile-form">
          <div class="profile-form-section">
            <div class="profile-picture-upload">
              <label>Profile Picture</label>
              <div class="upload-container">
                <div class="profile-picture-preview">
                  ${user.pfp ? 
                    `<img src="${user.pfp}" alt="${user.fullName}">` : 
                    `<span class="initials">${getInitials(user.fullName)}</span>`
                  }
                </div>
                <div class="upload-controls">
                  <input type="file" id="pfp-upload" name="pfp" accept="image/*" hidden>
                  <button type="button" id="upload-button" class="btn btn-outline">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Upload Image
                  </button>
                  ${user.pfp ? `
                    <button type="button" id="remove-button" class="btn btn-text">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      Remove
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>
          
          <div class="profile-form-section">
            <div class="form-row">
              <div class="form-group">
                <label for="fullName">Full Name</label>
                <input type="text" id="fullName" name="fullName" value="${user.fullName || ''}" required>
                <div class="error-message" id="fullName-error"></div>
              </div>
              
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" value="${user.email || ''}" disabled>
                <div class="email-verified ${user.email_verified ? 'verified' : 'not-verified'}">
                  ${user.email_verified ? 
                    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Verified` : 
                    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    Not Verified
                    <button type="button" id="resend-verification" class="btn btn-text btn-small">Resend Verification</button>`
                  }
                </div>
              </div>
            </div>
          </div>
          
          <div class="profile-form-section">
            <h3>Business Information</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="vat_id">VAT ID</label>
                <input type="text" id="vat_id" name="vat_id" value="${user.vat_id || ''}">
                <div class="error-message" id="vat_id-error"></div>
              </div>
              
              <div class="form-group">
                <label for="tax_id">Tax ID</label>
                <input type="text" id="tax_id" name="tax_id" value="${user.tax_id || ''}">
                <div class="error-message" id="tax_id-error"></div>
              </div>
            </div>
          </div>
          
          <div class="profile-form-section">
            <h3>Address</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="country">Country</label>
                <input type="text" id="country" name="country" value="${user.country || ''}">
                <div class="error-message" id="country-error"></div>
              </div>
              
              <div class="form-group">
                <label for="city">City</label>
                <input type="text" id="city" name="city" value="${user.city || ''}">
                <div class="error-message" id="city-error"></div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="street">Street</label>
                <input type="text" id="street" name="street" value="${user.street || ''}">
                <div class="error-message" id="street-error"></div>
              </div>
              
              <div class="form-group">
                <label for="zip_code">Zip Code</label>
                <input type="text" id="zip_code" name="zip_code" value="${user.zip_code || ''}">
                <div class="error-message" id="zip_code-error"></div>
              </div>
            </div>
          </div>
          
          <div class="profile-form-actions">
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  // Set up event handlers
  setupProfileFormHandlers();
}

/**
 * Renders the profile sidebar
 * @param {Object} user - User data
 * @param {string} activeTab - The active tab
 * @returns {string} Sidebar HTML
 */
export function renderProfileSidebar(user, activeTab) {
  return `
    <div class="profile-sidebar">
      <div class="profile-user">
        <div class="profile-avatar">
          ${user.pfp ? 
            `<img src="${user.pfp}" alt="${user.fullName}">` : 
            `<span class="initials">${getInitials(user.fullName)}</span>`
          }
        </div>
        <div class="profile-user-details">
          <p class="profile-user-name">${user.fullName}</p>
          <p class="profile-user-email">${user.email}</p>
        </div>
      </div>
      
      <nav class="profile-nav">
        <ul>
          <li class="${activeTab === 'details' ? 'active' : ''}">
            <a href="/profile">
              <div class="nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7.93251 10.6809L8.53176 10.3825L8.07556 9.89259C7.63356 9.41792 7.38428 8.79564 7.3763 8.14717C7.37705 7.44537 7.65616 6.77246 8.15247 6.27616C8.64944 5.77919 9.32348 5.49999 10.0263 5.49999C10.7291 5.49999 11.4032 5.77919 11.9001 6.27616C12.3964 6.77246 12.6756 7.44537 12.6763 8.14717C12.6683 8.79564 12.419 9.41792 11.977 9.89259L11.5276 10.3753L12.1137 10.6777C12.7652 11.0137 13.3235 11.5055 13.7391 12.1094C14.1545 12.7128 14.4145 13.4095 14.4959 14.1376C14.505 14.2247 14.4794 14.3119 14.4247 14.3804C14.3744 14.4432 14.3032 14.4856 14.2245 14.5H14.168H14.1515L14.1351 14.5011C14.0493 14.5067 13.9646 14.479 13.8988 14.4237C13.8329 14.3685 13.791 14.2899 13.7817 14.2044L13.7818 14.2044L13.7809 14.1972C13.6665 13.2687 13.2166 12.4141 12.5158 11.7943C11.815 11.1746 10.9118 10.8325 9.9763 10.8325C9.04079 10.8325 8.13757 11.1746 7.4368 11.7943C6.73603 12.4141 6.28608 13.2687 6.17172 14.1972L6.17168 14.1972L6.17097 14.2037C6.16115 14.2929 6.11631 14.3745 6.0463 14.4306C5.97629 14.4868 5.88684 14.5128 5.79764 14.503C5.70844 14.4932 5.62679 14.4483 5.57065 14.3783C5.51493 14.3088 5.48887 14.2202 5.4981 14.1316C5.58628 13.4003 5.85462 12.7023 6.27905 12.1003C6.70406 11.4974 7.27224 11.0097 7.93251 10.6809ZM8.89942 9.79907C9.22558 10.017 9.60904 10.1333 10.0013 10.1333C10.5273 10.1333 11.0318 9.92437 11.4037 9.55242C11.7757 9.18047 11.9846 8.676 11.9846 8.14999C11.9846 7.75772 11.8683 7.37427 11.6504 7.04811C11.4325 6.72195 11.1227 6.46774 10.7603 6.31763C10.3979 6.16751 9.9991 6.12824 9.61437 6.20477C9.22964 6.28129 8.87625 6.47019 8.59887 6.74756C8.3215 7.02494 8.13261 7.37833 8.05608 7.76306C7.97955 8.14779 8.01883 8.54657 8.16894 8.90898C8.31906 9.27139 8.57326 9.58114 8.89942 9.79907ZM4.16797 2.16666H15.8346C16.3651 2.16666 16.8738 2.37737 17.2488 2.75244C17.6239 3.12752 17.8346 3.63622 17.8346 4.16666V15.8333C17.8346 16.3638 17.6239 16.8725 17.2488 17.2475C16.8738 17.6226 16.3651 17.8333 15.8346 17.8333H4.16797C3.63754 17.8333 3.12883 17.6226 2.75376 17.2475C2.37868 16.8725 2.16797 16.3638 2.16797 15.8333V4.16666C2.16797 3.63622 2.37868 3.12752 2.75376 2.75244C3.12883 2.37737 3.63754 2.16666 4.16797 2.16666ZM16.7774 16.7761C17.0275 16.5261 17.168 16.1869 17.168 15.8333V4.16666C17.168 3.81304 17.0275 3.4739 16.7774 3.22385C16.5274 2.9738 16.1883 2.83332 15.8346 2.83332H4.16797C3.81435 2.83332 3.47521 2.9738 3.22516 3.22385C2.97511 3.4739 2.83464 3.81303 2.83464 4.16666V15.8333C2.83464 16.1869 2.97511 16.5261 3.22516 16.7761C3.47521 17.0262 3.81435 17.1667 4.16797 17.1667H15.8346C16.1883 17.1667 16.5274 17.0262 16.7774 16.7761Z"></path>
                </svg>
              </div>
              <p>My Details</p>
            </a>
          </li>
          <li class="${activeTab === 'contests' ? 'active' : ''}">
            <a href="/profile/contests">
              <div class="nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6.66797 17.5H13.3346"></path>
                  <path d="M10 14.1667V17.5"></path>
                  <path d="M16.668 2.5H3.33464C2.41416 2.5 1.66797 3.24619 1.66797 4.16667V12.5C1.66797 13.4205 2.41416 14.1667 3.33464 14.1667H16.668C17.5884 14.1667 18.3346 13.4205 18.3346 12.5V4.16667C18.3346 3.24619 17.5884 2.5 16.668 2.5Z"></path>
                </svg>
              </div>
              <p>Contests</p>
            </a>
          </li>
          <li>
            <a href="#" id="logout-sidebar-btn">
              <div class="nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M13.332 14.1666L17.4987 9.99998L13.332 5.83331"></path>
                  <path d="M17.5 10H7.5"></path>
                  <path d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5"></path>
                </svg>
              </div>
              <p>Logout</p>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  `;
}

/**
 * Sets up event handlers for the profile form
 */
function setupProfileFormHandlers() {
  // Profile picture upload button
  const uploadButton = document.getElementById('upload-button');
  const fileInput = document.getElementById('pfp-upload');
  
  if (uploadButton && fileInput) {
    uploadButton.addEventListener('click', () => {
      fileInput.click();
    });
    
    fileInput.addEventListener('change', handleProfileImageChange);
  }
  
  // Profile picture remove button
  const removeButton = document.getElementById('remove-button');
  if (removeButton) {
    removeButton.addEventListener('click', handleProfileImageRemove);
  }
  
  // Resend verification button
  const resendButton = document.getElementById('resend-verification');
  if (resendButton) {
    resendButton.addEventListener('click', handleResendVerification);
  }
  
  // Profile form submission
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileSubmit);
  }
  
  // Logout button
  const logoutBtn = document.getElementById('logout-sidebar-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

/**
 * Handles profile image changes
 * @param {Event} e - Change event
 */
async function handleProfileImageChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    showNotification('Please select a valid image file (JPEG, PNG, GIF or WebP)', 'error');
    return;
  }
  
  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    showNotification('Image file is too large. Maximum size is 2MB', 'error');
    return;
  }
  
  // Display loading state
  const previewContainer = document.querySelector('.profile-picture-preview');
  const uploadButton = document.getElementById('upload-button');
  
  if (previewContainer && uploadButton) {
    previewContainer.innerHTML = `
      <div class="loading-spinner">
        <svg class="spinner" viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
        </svg>
      </div>
    `;
    
    uploadButton.disabled = true;
  }
  
  try {
    // Upload the file
    const formData = new FormData();
    formData.append('pfp', file);
    
    const userData = await api.updateProfilePicture(formData);
    
    // Update store
    store.setState({ user: userData });
    
    // Update preview
    if (previewContainer) {
      previewContainer.innerHTML = `<img src="${userData.pfp}" alt="${userData.fullName}">`;
    }
    
    // Add remove button if it doesn't exist
    const uploadControls = document.querySelector('.upload-controls');
    if (uploadControls && !document.getElementById('remove-button')) {
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.id = 'remove-button';
      removeButton.className = 'btn btn-text';
      removeButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
        Remove
      `;
      
      removeButton.addEventListener('click', handleProfileImageRemove);
      uploadControls.appendChild(removeButton);
    }
    
    showNotification('Profile picture updated successfully', 'success');
  } catch (error) {
    console.error('Failed to update profile picture:', error);
    
    // Restore preview
    const user = store.getState().user;
    if (previewContainer && user) {
      previewContainer.innerHTML = user.pfp ? 
        `<img src="${user.pfp}" alt="${user.fullName}">` : 
        `<span class="initials">${getInitials(user.fullName)}</span>`;
    }
    
    showNotification('Failed to update profile picture', 'error');
  } finally {
    // Re-enable upload button
    if (uploadButton) {
      uploadButton.disabled = false;
    }
  }
}

/**
 * Handles profile image removal
 * @param {Event} e - Click event
 */
async function handleProfileImageRemove(e) {
  e.preventDefault();
  
  const previewContainer = document.querySelector('.profile-picture-preview');
  const removeButton = document.getElementById('remove-button');
  
  if (previewContainer && removeButton) {
    // Display loading state
    previewContainer.innerHTML = `
      <div class="loading-spinner">
        <svg class="spinner" viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
        </svg>
      </div>
    `;
    
    removeButton.disabled = true;
  }
  
  try {
    // Remove profile picture
    const userData = await api.removeProfilePicture();
    
    // Update store
    store.setState({ user: userData });
    
    // Update preview
    if (previewContainer) {
      previewContainer.innerHTML = `<span class="initials">${getInitials(userData.fullName)}</span>`;
    }
    
    // Remove the remove button
    if (removeButton) {
      removeButton.remove();
    }
    
    showNotification('Profile picture removed successfully', 'success');
  } catch (error) {
    console.error('Failed to remove profile picture:', error);
    
    // Restore preview
    const user = store.getState().user;
    if (previewContainer && user) {
      previewContainer.innerHTML = user.pfp ? 
        `<img src="${user.pfp}" alt="${user.fullName}">` : 
        `<span class="initials">${getInitials(user.fullName)}</span>`;
    }
    
    showNotification('Failed to remove profile picture', 'error');
  }
}

/**
 * Handles resending verification email
 * @param {Event} e - Click event
 */
async function handleResendVerification(e) {
  e.preventDefault();
  
  const button = e.target;
  button.disabled = true;
  button.textContent = 'Sending...';
  
  try {
    // Resend verification email
    await api.resendVerificationEmail();
    
    showNotification('Verification email has been sent', 'success');
    
    // Update button text
    button.textContent = 'Sent';
    
    // Disable button for 60 seconds
    setTimeout(() => {
      button.disabled = false;
      button.textContent = 'Resend Verification';
    }, 60000);
  } catch (error) {
    console.error('Failed to resend verification email:', error);
    
    showNotification('Failed to resend verification email', 'error');
    
    // Restore button
    button.disabled = false;
    button.textContent = 'Resend Verification';
  }
}

/**
 * Handles profile form submission
 * @param {Event} e - Submit event
 */
async function handleProfileSubmit(e) {
  e.preventDefault();
  
  // Get form data
  const form = e.target;
  const formData = new FormData(form);
  
  // Convert FormData to object
  const profileData = Object.fromEntries(formData.entries());
  
  // Clear previous errors
  clearFormErrors(form);
  
  try {
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = `
      <svg class="spinner small" viewBox="0 0 50 50">
        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
      </svg>
      <span>Saving...</span>
    `;
    
    // Update profile
    const userData = await api.updateProfile(profileData);
    
    // Update store
    store.setState({ user: userData });
    
    showNotification('Profile updated successfully', 'success');
  } catch (error) {
    console.error('Failed to update profile:', error);
    
    // Handle validation errors
    if (error.status === 400 && error.errors) {
      handleValidationErrors(form, error.errors);
    } else {
      showNotification('Failed to update profile', 'error');
    }
  } finally {
    // Restore submit button
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = false;
    submitButton.textContent = 'Save Changes';
  }
}

/**
 * Handles logout
 * @param {Event} e - Click event
 */
async function handleLogout(e) {
  e.preventDefault();
  
  try {
    await api.logoutUser();
    
    // Clear user state
    store.setState({ user: null });
    
    showNotification('Logged out successfully', 'success');
    
    // Redirect to home
    window.router.navigate('/', true);
  } catch (error) {
    console.error('Failed to logout:', error);
    showNotification('Failed to logout', 'error');
  }
}

/**
 * Clears all form errors
 * @param {HTMLFormElement} form - The form element
 */
function clearFormErrors(form) {
  const errorElements = form.querySelectorAll('.error-message');
  errorElements.forEach(element => {
    element.textContent = '';
    element.style.display = 'none';
  });
}

/**
 * Handles validation errors
 * @param {HTMLFormElement} form - The form element
 * @param {Object} errors - Validation errors
 */
function handleValidationErrors(form, errors) {
  Object.entries(errors).forEach(([field, message]) => {
    const errorElement = form.querySelector(`#${field}-error`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  });
}