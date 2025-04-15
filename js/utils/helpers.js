/**
 * Helper utilities for the Joridiro application
 */

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last invocation
 * @param {Function} func - The function to debounce
 * @param {number} wait - The wait time in milliseconds
 * @returns {Function} The debounced function
 */
export function debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  /**
   * Creates a throttled function that only invokes the provided function
   * at most once per every wait milliseconds
   * @param {Function} func - The function to throttle
   * @param {number} limit - The time limit in milliseconds
   * @returns {Function} The throttled function
   */
  export function throttle(func, limit) {
    let inThrottle;
    
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  /**
   * Converts a string to title case
   * @param {string} str - The string to convert
   * @returns {string} The title-cased string
   */
  export function toTitleCase(str) {
    if (!str) return '';
    
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }
  
  /**
   * Deep clones an object
   * @param {Object} obj - The object to clone
   * @returns {Object} The cloned object
   */
  export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
      return obj.map(item => deepClone(item));
    }
    
    if (obj instanceof Object) {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, deepClone(value)])
      );
    }
  }
  
  /**
   * Gets a query parameter from the URL
   * @param {string} name - The name of the parameter
   * @returns {string|null} The parameter value or null if not found
   */
  export function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }
  
  /**
   * Sets a query parameter in the URL without causing a page reload
   * @param {string} name - The name of the parameter
   * @param {string} value - The value to set
   */
  export function setQueryParam(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.replaceState({}, '', url);
  }
  
  /**
   * Removes a query parameter from the URL without causing a page reload
   * @param {string} name - The name of the parameter to remove
   */
  export function removeQueryParam(name) {
    const url = new URL(window.location);
    url.searchParams.delete(name);
    window.history.replaceState({}, '', url);
  }
  
  /**
   * Generates a unique ID
   * @returns {string} A unique ID
   */
  export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  /**
   * Waits for a specified amount of time
   * @param {number} ms - The time to wait in milliseconds
   * @returns {Promise} A promise that resolves after the specified time
   */
  export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Safely parses JSON without throwing exceptions
   * @param {string} str - The string to parse
   * @param {*} [fallback=null] - Fallback value if parsing fails
   * @returns {*} The parsed object or fallback value
   */
  export function safeJsonParse(str, fallback = null) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return fallback;
    }
  }