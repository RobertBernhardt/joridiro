/**
 * Store - Simple state management system
 * Maintains application state and notifies subscribers of changes
 */
class Store {
    constructor() {
      // Initial state
      this.state = {
        user: null,
        isAuthenticated: false,
        currentContest: null,
        contests: [],
        notifications: [],
        loading: {
          auth: false,
          contests: false,
          currentContest: false
        },
        errors: {
          auth: null,
          contests: null,
          currentContest: null
        }
      };
      
      // Array of subscribers (callbacks to be called when state changes)
      this.subscribers = [];
    }
  
    /**
     * Get current state
     * @returns {Object} Current state
     */
    getState() {
      return this.state;
    }
  
    /**
     * Update state
     * @param {Object} newState - State changes to apply
     */
    setState(newState) {
      // Only update state if there are changes
      if (!newState || Object.keys(newState).length === 0) {
        return;
      }
      
      // Deep merge the new state with the existing state
      this.state = this._mergeState(this.state, newState);
      
      // Notify subscribers
      this._notifySubscribers();
    }
  
    /**
     * Subscribe to state changes
     * @param {Function} callback - Function to call when state changes
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
      if (typeof callback !== 'function') {
        console.error('Subscriber must be a function');
        return () => {};
      }
      
      this.subscribers.push(callback);
      
      // Return unsubscribe function
      return () => {
        this.subscribers = this.subscribers.filter(cb => cb !== callback);
      };
    }
  
    /**
     * Deep merge objects for state update
     * @private
     * @param {Object} target - Target object
     * @param {Object} source - Source object
     * @returns {Object} Merged object
     */
    _mergeState(target, source) {
      // Create a new object to avoid modifying the original
      const output = { ...target };
      
      // Handle array merging
      if (Array.isArray(source)) {
        return [...source];
      }
      
      // Handle object merging
      if (source && typeof source === 'object') {
        Object.keys(source).forEach(key => {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (target[key]) {
              // Recursively merge nested objects
              output[key] = this._mergeState(target[key], source[key]);
            } else {
              // If key doesn't exist in target, just assign
              output[key] = source[key];
            }
          } else {
            // For primitives and arrays, just assign
            output[key] = source[key];
          }
        });
      }
      
      return output;
    }
  
    /**
     * Notify all subscribers of state changes
     * @private
     */
    _notifySubscribers() {
      this.subscribers.forEach(callback => {
        try {
          callback(this.state);
        } catch (error) {
          console.error('Error in subscriber:', error);
        }
      });
    }
  
    // ===== Authentication Actions =====
  
    /**
     * Set the authenticated user
     * @param {Object} user - User data
     */
    setUser(user) {
      this.setState({
        user,
        isAuthenticated: !!user,
        loading: { ...this.state.loading, auth: false },
        errors: { ...this.state.errors, auth: null }
      });
    }
  
    /**
     * Start loading authentication state
     */
    setAuthLoading() {
      this.setState({
        loading: { ...this.state.loading, auth: true }
      });
    }
  
    /**
     * Set authentication error
     * @param {Object} error - Error data
     */
    setAuthError(error) {
      this.setState({
        loading: { ...this.state.loading, auth: false },
        errors: { ...this.state.errors, auth: error }
      });
    }
    
    /**
     * Clear the authenticated user
     */
    clearUser() {
      this.setState({
        user: null,
        isAuthenticated: false,
        loading: { ...this.state.loading, auth: false },
        errors: { ...this.state.errors, auth: null }
      });
    }
  
    // ===== Contest Actions =====
  
    /**
     * Set the contests list
     * @param {Array} contests - List of contests
     */
    setContests(contests) {
      this.setState({
        contests,
        loading: { ...this.state.loading, contests: false },
        errors: { ...this.state.errors, contests: null }
      });
    }
  
    /**
     * Set current contest
     * @param {Object} contest - Contest data
     */
    setCurrentContest(contest) {
      this.setState({
        currentContest: contest,
        loading: { ...this.state.loading, currentContest: false },
        errors: { ...this.state.errors, currentContest: null }
      });
    }
  
    /**
     * Start loading contests
     */
    setContestsLoading() {
      this.setState({
        loading: { ...this.state.loading, contests: true }
      });
    }
  
    /**
     * Start loading current contest
     */
    setCurrentContestLoading() {
      this.setState({
        loading: { ...this.state.loading, currentContest: true }
      });
    }
  
    /**
     * Set contests error
     * @param {Object} error - Error data
     */
    setContestsError(error) {
      this.setState({
        loading: { ...this.state.loading, contests: false },
        errors: { ...this.state.errors, contests: error }
      });
    }
  
    /**
     * Set current contest error
     * @param {Object} error - Error data
     */
    setCurrentContestError(error) {
      this.setState({
        loading: { ...this.state.loading, currentContest: false },
        errors: { ...this.state.errors, currentContest: error }
      });
    }
  
    // ===== Notification Actions =====
    
    /**
     * Add a notification
     * @param {String} type - Notification type (success, error, info)
     * @param {String} message - Notification message
     * @param {Number} timeout - Time in ms before auto-removing (0 for permanent)
     */
    addNotification(type, message, timeout = 5000) {
      const id = Date.now() + Math.random().toString(36).substr(2, 5);
      const notification = { id, type, message };
      
      this.setState({
        notifications: [...this.state.notifications, notification]
      });
      
      // Auto-remove notification after timeout (if timeout > 0)
      if (timeout > 0) {
        setTimeout(() => {
          this.removeNotification(id);
        }, timeout);
      }
      
      return id;
    }
    
    /**
     * Remove a notification by ID
     * @param {String} id - Notification ID
     */
    removeNotification(id) {
      this.setState({
        notifications: this.state.notifications.filter(n => n.id !== id)
      });
    }
  }
  
  // Create and export a singleton instance
  const store = new Store();
  export default store;