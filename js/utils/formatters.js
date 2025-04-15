/**
 * Formatting utilities for the Joridiro application
 */

/**
 * Formats a number as currency
 * @param {number} amount - The amount to format
 * @param {string} [currency='€'] - The currency symbol
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = '€') {
    if (amount === null || amount === undefined) return `${currency}0`;
    
    return `${currency}${parseInt(amount).toLocaleString()}`;
  }
  
  /**
   * Formats a date for display
   * @param {string|Date} date - The date to format
   * @param {Object} [options] - Formatting options
   * @param {boolean} [options.includeTime=false] - Whether to include time
   * @param {boolean} [options.shortMonth=false] - Whether to use short month names
   * @returns {string} Formatted date string
   */
  export function formatDate(date, options = {}) {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Return empty string for invalid dates
    if (isNaN(dateObj.getTime())) return '';
    
    const { includeTime = false, shortMonth = false } = options;
    
    const day = dateObj.getDate();
    const monthIndex = dateObj.getMonth();
    const year = dateObj.getFullYear();
    
    const months = shortMonth ? 
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] :
      ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    let formattedDate = `${day} ${months[monthIndex]} ${year}`;
    
    if (includeTime) {
      const hours = dateObj.getHours();
      const minutes = dateObj.getMinutes();
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      
      formattedDate += ` ${formattedHours}:${formattedMinutes}`;
    }
    
    return formattedDate;
  }
  
  /**
   * Returns a relative time string (e.g., "2 hours ago")
   * @param {string|Date} date - The date to format
   * @returns {string} Relative time string
   */
  export function timeAgo(date) {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Return empty string for invalid dates
    if (isNaN(dateObj.getTime())) return '';
    
    const now = new Date();
    const secondsAgo = Math.floor((now - dateObj) / 1000);
    
    if (secondsAgo < 60) {
      return secondsAgo <= 1 ? 'just now' : `${secondsAgo} seconds ago`;
    }
    
    const minutesAgo = Math.floor(secondsAgo / 60);
    if (minutesAgo < 60) {
      return minutesAgo === 1 ? '1 minute ago' : `${minutesAgo} minutes ago`;
    }
    
    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24) {
      return hoursAgo === 1 ? '1 hour ago' : `${hoursAgo} hours ago`;
    }
    
    const daysAgo = Math.floor(hoursAgo / 24);
    if (daysAgo < 30) {
      return daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;
    }
    
    const monthsAgo = Math.floor(daysAgo / 30);
    if (monthsAgo < 12) {
      return monthsAgo === 1 ? '1 month ago' : `${monthsAgo} months ago`;
    }
    
    const yearsAgo = Math.floor(monthsAgo / 12);
    return yearsAgo === 1 ? '1 year ago' : `${yearsAgo} years ago`;
  }
  
  /**
   * Truncates text to a specified length
   * @param {string} text - The text to truncate
   * @param {number} [maxLength=100] - Maximum length
   * @param {string} [suffix='...'] - Suffix to add when truncated
   * @returns {string} Truncated text
   */
  export function truncateText(text, maxLength = 100, suffix = '...') {
    if (!text) return '';
    
    if (text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength).trim() + suffix;
  }
  
  /**
   * Formats a number with commas as thousands separators
   * @param {number} number - The number to format
   * @returns {string} Formatted number
   */
  export function formatNumber(number) {
    if (number === null || number === undefined) return '0';
    
    return parseInt(number).toLocaleString();
  }
  
  /**
   * Gets initials from a name
   * @param {string} name - The full name
   * @returns {string} Initials
   */
  export function getInitials(name) {
    if (!name) return '';
    
    const parts = name.split(' ').filter(part => part.length > 0);
    
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }