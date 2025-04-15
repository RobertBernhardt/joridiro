/**
 * Header component for the Joridiro application
 */
import { store } from '../store.js';
import { createModal } from './modal.js';
import { loginForm, registerForm } from './auth-forms.js';
import * as api from '../api.js';
import { showNotification } from './notification.js';

export function renderHeader() {
  // Create header if it doesn't exist
  if (!document.querySelector('header')) {
    const header = document.createElement('header');
    document.body.insertBefore(header, document.body.firstChild);
  }
  
  const headerElement = document.querySelector('header');
  
  // Subscribe to store updates to re-render header when user state changes
  store.subscribe(state => {
    updateHeader(headerElement, state);
  });
  
  // Initial render with current state
  updateHeader(headerElement, store.getState());
}

/**
 * Updates the header based on the current state
 * @param {HTMLElement} headerElement - The header DOM element
 * @param {Object} state - The current application state
 */
function updateHeader(headerElement, state) {
  const isTransparent = shouldHeaderBeTransparent();
  const position = isTransparent ? 'absolute' : 'relative';
  
  headerElement.innerHTML = `
    <div class="header-container ${isTransparent ? 'transparent' : ''}">
      <div class="logo">
        <a href="/">
          <img src="./images/logo.svg" alt="Joridiro">
        </a>
      </div>
      
      <nav class="main-nav">
        <ul>
          <li><a href="/contests">Contests</a></li>
          <li><a href="/about">About</a></li>
          ${state.user ? `
            <li class="dropdown">
              <a href="#" class="dropdown-toggle">
                <div class="user-avatar">
                  ${state.user.pfp ? 
                    `<img src="${state.user.pfp}" alt="${state.user.fullName}">` : 
                    `<span>${getInitials(state.user.fullName)}</span>`
                  }
                </div>
                <span>${state.user.fullName}</span>
              </a>
              <ul class="dropdown-menu">
                <li><a href="/profile">My Profile</a></li>
                <li><a href="/profile/contests">My Contests</a></li>
                <li><a href="/messages">Messages</a></li>
                <li><a href="#" id="logout-btn">Logout</a></li>
              </ul>
            </li>
          ` : `
            <li><a href="#" id="login-btn" class="btn btn-text">Login</a></li>
            <li><a href="#" id="register-btn" class="btn btn-primary">Register</a></li>
          `}
        </ul>
      </nav>
      
      <button class="mobile-menu-toggle">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  `;
  
  // Apply styling
  headerElement.style.position = position;
  
  // Add event listeners for auth actions
  if (state.user) {
    const logoutBtn = headerElement.querySelector('#logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
  } else {
    const loginBtn = headerElement.querySelector('#login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', showLoginModal);
    }
    
    const registerBtn = headerElement.querySelector('#register-btn');
    if (registerBtn) {
      registerBtn.addEventListener('click', showRegisterModal);
    }
  }
  
  // Set up mobile menu toggle
  const mobileMenuToggle = headerElement.querySelector('.mobile-menu-toggle');
  const mainNav = headerElement.querySelector('.main-nav');
  
  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenuToggle.classList.toggle('active');
      mainNav.classList.toggle('active');
    });
  }
  
  // Setup dropdown menus
  const dropdowns = headerElement.querySelectorAll('.dropdown');
  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');
    
    if (toggle && menu) {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        dropdown.classList.toggle('active');
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
          dropdown.classList.remove('active');
        }
      });
    }
  });
}

/**
 * Determines if the header should be transparent based on the current route
 * @returns {boolean} True if the header should be transparent
 */
function shouldHeaderBeTransparent() {
  const path = window.location.pathname;
  return (
    path === '/' || 
    path === '/about' || 
    (path === '/contests' && !path.includes('/contests/'))
  );
}

/**
 * Gets a user's initials from their full name
 * @param {string} fullName - The user's full name
 * @returns {string} The user's initials
 */
function getInitials(fullName) {
  if (!fullName) return '';
  
  const names = fullName.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

/**
 * Handles user logout
 * @param {Event} e - The click event
 */
async function handleLogout(e) {
  e.preventDefault();
  
  try {
    await api.logoutUser();
    store.setState({ user: null });
    showNotification('You have been logged out successfully', 'success');
    window.router.navigate('/', true);
  } catch (error) {
    console.error('Logout failed:', error);
    showNotification('Logout failed. Please try again.', 'error');
  }
}

/**
 * Shows the login modal
 * @param {Event} e - The click event
 */
function showLoginModal(e) {
  e.preventDefault();
  createModal({
    title: 'Login to Your Account',
    content: loginForm(),
    className: 'auth-modal'
  });
}

/**
 * Shows the registration modal
 * @param {Event} e - The click event
 */
function showRegisterModal(e) {
  e.preventDefault();
  createModal({
    title: 'Create an Account',
    content: registerForm(),
    className: 'auth-modal'
  });
}