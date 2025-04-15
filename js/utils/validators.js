/**
 * Validation utilities for the Joridiro application
 */

/**
 * Validates an email address
 * @param {string} email - The email address to validate
 * @returns {boolean} True if the email is valid
 */
export function validateEmail(email) {
    if (!email) return false;
    
    // Simple regex for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Validates a password against the application's password policy
   * @param {string} password - The password to validate
   * @returns {Object} Object containing isValid boolean and message string
   */
  export function validatePassword(password) {
    // Password must be at least 10 characters long
    if (!password || password.length < 10) {
      return {
        isValid: false,
        message: 'Password must be at least 10 characters long'
      };
    }
    
    // Password must contain at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one uppercase letter'
      };
    }
    
    // Password must contain at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one lowercase letter'
      };
    }
    
    // Password must contain at least one number
    if (!/[0-9]/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one number'
      };
    }
    
    // Password must contain at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one special character'
      };
    }
    
    return {
      isValid: true,
      message: ''
    };
  }
  
  /**
   * Validates a URL
   * @param {string} url - The URL to validate
   * @returns {boolean} True if the URL is valid
   */
  export function validateUrl(url) {
    if (!url) return false;
    
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Validates if a string is a valid number
   * @param {string} value - The value to validate
   * @returns {boolean} True if the value is a valid number
   */
  export function validateNumber(value) {
    if (value === null || value === undefined || value === '') return false;
    
    return !isNaN(parseFloat(value)) && isFinite(value);
  }
  
  /**
   * Validates if a string is a valid integer
   * @param {string} value - The value to validate
   * @returns {boolean} True if the value is a valid integer
   */
  export function validateInteger(value) {
    if (value === null || value === undefined || value === '') return false;
    
    const num = Number(value);
    return Number.isInteger(num);
  }
  
  /**
   * Validates a date string
   * @param {string} dateStr - The date string to validate
   * @returns {boolean} True if the date is valid
   */
  export function validateDate(dateStr) {
    if (!dateStr) return false;
    
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }