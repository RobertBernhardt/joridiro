/**
 * API - Handles all API requests to the backend
 */
class API {
    constructor() {
      this.baseURL = 'https://localhost:8000'; // Default for development
      this.headers = {
        'Content-Type': 'application/json'
      };
    }
  
    /**
     * Set the base URL for API requests (for production)
     * @param {string} url - The base URL
     */
    setBaseURL(url) {
      this.baseURL = url;
    }
  
    /**
     * Make an API request
     * @param {string} method - HTTP method (GET, POST, etc.)
     * @param {string} endpoint - API endpoint
     * @param {object|null} data - Request data (for POST, PUT, etc.)
     * @returns {Promise} - Promise resolving to response data
     */
    async request(method, endpoint, data = null) {
      const url = `${this.baseURL}${endpoint}`;
      
      const options = {
        method,
        headers: this.headers,
        credentials: 'include', // Include cookies for authentication
      };
  
      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }
  
      try {
        const response = await fetch(url, options);
        
        // Try to parse as JSON first
        const contentType = response.headers.get('content-type');
        let responseData;
        
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }
  
        if (!response.ok) {
          throw {
            status: response.status,
            message: responseData.message || 'Request failed',
            data: responseData
          };
        }
  
        return responseData;
      } catch (error) {
        // Re-throw any error to be handled by the caller
        throw error;
      }
    }
  
    // === AUTH ENDPOINTS ===
  
    /**
     * Login a user
     * @param {object} credentials - User credentials
     * @returns {Promise} - Promise resolving to user data
     */
    async login(credentials) {
      return this.request('POST', '/user/login', credentials);
    }
  
    /**
     * Register a new user
     * @param {object} userData - User registration data
     * @returns {Promise} - Promise resolving to registration result
     */
    async register(userData) {
      return this.request('POST', '/user/register', userData);
    }
  
    /**
     * Log out the current user
     * @returns {Promise} - Promise resolving to logout result
     */
    async logout() {
      return this.request('POST', '/user/logout');
    }
  
    /**
     * Get the currently logged in user
     * @returns {Promise} - Promise resolving to user data
     */
    async getCurrentUser() {
      return this.request('POST', '/user/me');
    }
  
    /**
     * Send verification OTP to user's email
     * @returns {Promise} - Promise resolving to OTP result
     */
    async sendOTP() {
      return this.request('POST', '/user/sendOTP');
    }
  
    /**
     * Verify user's email with OTP
     * @param {string} otp - The OTP to verify
     * @returns {Promise} - Promise resolving to verification result
     */
    async verifyOTP(otp) {
      return this.request('POST', `/user/verifyOTP/${otp}`);
    }
  
    /**
     * Request password reset
     * @param {object} data - Email object
     * @returns {Promise} - Promise resolving to reset request result
     */
    async forgotPassword(data) {
      return this.request('POST', '/user/forgotPassword', data);
    }
  
    /**
     * Reset password with OTP
     * @param {string} otp - The reset OTP
     * @param {object} data - New password data
     * @returns {Promise} - Promise resolving to reset result
     */
    async resetPassword(otp, data) {
      return this.request('POST', `/user/resetPassword/${otp}`, data);
    }
  
    /**
     * Update user profile
     * @param {object} profileData - User profile data
     * @returns {Promise} - Promise resolving to update result
     */
    async updateProfile(profileData) {
      return this.request('POST', '/user/profile/update', profileData);
    }
  
    // === CONTEST ENDPOINTS ===
  
    /**
     * Get all contests
     * @param {number} page - Page number for pagination
     * @returns {Promise} - Promise resolving to contests data
     */
    async getContests(page = 1) {
      return this.request('GET', `/contest?page=${page}`);
    }
  
    /**
     * Get a specific contest by ID
     * @param {string} id - Contest ID
     * @returns {Promise} - Promise resolving to contest data
     */
    async getContest(id) {
      return this.request('GET', `/contest/${id}`);
    }
  
    /**
     * Create a new contest
     * @param {object} contestData - Contest data
     * @returns {Promise} - Promise resolving to created contest
     */
    async createContest(contestData) {
      return this.request('POST', '/contest/create', contestData);
    }
  
    /**
     * Join a contest
     * @param {string} contestId - Contest ID
     * @param {object} data - Join data (alias, etc.)
     * @returns {Promise} - Promise resolving to join result
     */
    async joinContest(contestId, data) {
      return this.request('POST', `/contest/${contestId}/join`, data);
    }
  
    /**
     * Update a user's score in a contest
     * @param {string} contestId - Contest ID
     * @param {object} scoreData - Score data
     * @returns {Promise} - Promise resolving to update result
     */
    async updateScore(contestId, scoreData) {
      return this.request('POST', `/contest/${contestId}/score`, scoreData);
    }
  
    /**
     * Search for contests
     * @param {string} query - Search query
     * @returns {Promise} - Promise resolving to search results
     */
    async searchContests(query) {
      return this.request('POST', '/contest/search', { query });
    }
  
    /**
     * Edit a contest
     * @param {string} contestId - Contest ID
     * @param {object} contestData - Updated contest data
     * @returns {Promise} - Promise resolving to edit result
     */
    async editContest(contestId, contestData) {
      return this.request('POST', `/contest/${contestId}/edit`, contestData);
    }
  
    /**
     * Add an announcement to a contest
     * @param {string} contestId - Contest ID
     * @param {object} data - Announcement data
     * @returns {Promise} - Promise resolving to announcement result
     */
    async addAnnouncement(contestId, data) {
      return this.request('POST', `/contest/${contestId}/announce`, data);
    }
  
    /**
     * Add a FAQ question to a contest
     * @param {string} contestId - Contest ID
     * @param {object} data - FAQ question data
     * @returns {Promise} - Promise resolving to FAQ result
     */
    async addFAQ(contestId, data) {
      return this.request('POST', `/contest/${contestId}/faq`, data);
    }
  
    /**
     * Answer a FAQ question
     * @param {string} contestId - Contest ID
     * @param {string} faqId - FAQ ID
     * @param {object} data - Answer data
     * @returns {Promise} - Promise resolving to answer result
     */
    async answerFAQ(contestId, faqId, data) {
      return this.request('POST', `/contest/${contestId}/${faqId}/answerfaq`, data);
    }
  
    /**
     * Get user's contests
     * @returns {Promise} - Promise resolving to user's contests
     */
    async getUserContests() {
      return this.request('GET', '/user/contests');
    }
  
    // === MESSAGING ENDPOINTS ===
  
    /**
     * Send a message
     * @param {object} messageData - Message data
     * @returns {Promise} - Promise resolving to message result
     */
    async sendMessage(messageData) {
      return this.request('POST', '/message/send', messageData);
    }
  
    /**
     * Get messages with a specific user
     * @param {string} receiverId - Receiver ID
     * @param {number} start - Start index for pagination
     * @param {number} limit - Limit for pagination
     * @returns {Promise} - Promise resolving to messages
     */
    async getMessages(receiverId, start = 0, limit = 15) {
      return this.request('GET', `/message/${receiverId}?start=${start}&limit=${limit}`);
    }
  
    /**
     * Get all users the current user has messaged
     * @returns {Promise} - Promise resolving to users
     */
    async getMessagedUsers() {
      return this.request('GET', '/message/user/all');
    }
  }
  
  // Export a singleton instance
  const api = new API();
  export default api;