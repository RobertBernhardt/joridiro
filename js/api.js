/**
 * API module for the Joridiro application
 * Handles all communication with the backend server
 */

// Base API URL (would typically come from environment variables)
const API_BASE_URL = 'https://api.joridiro.com';
const API_VERSION = '/v1';
const API_ENDPOINT = API_BASE_URL + API_VERSION;

// Socket URL for real-time features
const SOCKET_URL = 'wss://socket.joridiro.com';

/**
 * Makes an authenticated API request
 * @param {string} method - HTTP method
 * @param {string} path - API path
 * @param {Object} [data] - Request data
 * @param {Object} [options] - Additional options
 * @returns {Promise} - Promise resolving to the response data
 */
async function request(method, path, data = null, options = {}) {
  const url = `${API_ENDPOINT}${path}`;
  
  // Default request options
  const requestOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    credentials: 'include', // Include cookies for authentication
    ...options
  };
  
  // Add body data if needed
  if (data && method !== 'GET') {
    if (data instanceof FormData) {
      // If data is FormData, remove Content-Type header
      // to let the browser set it with the boundary
      delete requestOptions.headers['Content-Type'];
      requestOptions.body = data;
    } else {
      requestOptions.body = JSON.stringify(data);
    }
  }
  
  try {
    // For demonstration in this implementation, we'll simulate API responses
    // In a real app, this would be a fetch call to the actual API
    // return await fetch(url, requestOptions).then(response => handleResponse(response));
    
    return await simulateApiRequest(method, path, data, requestOptions);
  } catch (error) {
    // Format error for consistent handling
    const formattedError = formatError(error);
    throw formattedError;
  }
}

/**
 * Simulates an API request (for demonstration purposes)
 * In a real application, this would be replaced with actual fetch calls
 */
async function simulateApiRequest(method, path, data, options) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Simulate different API endpoints
  if (path.startsWith('/user/me')) {
    // Simulate getting current user
    return { 
      user: {
        _id: '12345',
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        email_verified: true,
        pfp: null,
        country: 'Germany',
        city: 'Berlin',
        street: '123 Main St',
        zip_code: '10115',
        vat_id: 'DE123456789',
        tax_id: '123456789'
      }
    };
  } else if (path.startsWith('/user/login')) {
    // Simulate login
    if (data.email === 'test@example.com' && data.password === 'Password123!') {
      return {
        user: {
          _id: '12345',
          fullName: 'Test User',
          email: 'test@example.com',
          email_verified: true,
          pfp: null
        }
      };
    } else {
      throw {
        status: 401,
        message: 'Invalid email or password'
      };
    }
  } else if (path.startsWith('/user/register')) {
    // Simulate registration
    return {
      user: {
        _id: '12345',
        fullName: data.fullName,
        email: data.email,
        email_verified: false,
        pfp: null
      }
    };
  } else if (path.startsWith('/contest') && method === 'GET') {
    // Simulate getting contests
    if (path.includes('/') && path.split('/').length > 2) {
      // Single contest
      const contestId = path.split('/')[2];
      return {
        data: generateMockContest(contestId),
        score: generateMockScore(contestId),
        rank: 5
      };
    } else {
      // List of contests
      return {
        data: [
          generateMockContest('1'),
          generateMockContest('2'),
          generateMockContest('3')
        ]
      };
    }
  } else if (path.startsWith('/contest/search')) {
    // Simulate contest search
    return {
      data: [
        generateMockContest('1'),
        generateMockContest('2')
      ].filter(contest => 
        contest.title.toLowerCase().includes((data.query || '').toLowerCase())
      )
    };
  } else if (path.startsWith('/user/contests')) {
    // Simulate user contests
    return {
      data: [
        {
          ...generateMockContest('1'),
          score: 35,
          rank: 2
        },
        {
          ...generateMockContest('2'),
          score: 15,
          rank: 7
        }
      ]
    };
  } else if (path.startsWith('/message/user/all')) {
    // Simulate getting all conversations
    return {
      data: [
        {
          _id: 'conversation1',
          fullName: 'Support Team',
          pfp: null,
          messages: generateMockMessages('conversation1', 5),
          unreadMessages: 2
        },
        {
          _id: 'conversation2',
          fullName: 'Contest Organizer',
          pfp: null,
          messages: generateMockMessages('conversation2', 3),
          unreadMessages: 0
        }
      ]
    };
  } else if (path.startsWith('/message/user/') && path.split('/').length > 3) {
    // Simulate getting a single conversation
    const userId = path.split('/')[3];
    return {
      data: {
        _id: userId,
        fullName: userId === 'conversation1' ? 'Support Team' : 'Contest Organizer',
        pfp: null,
        messages: generateMockMessages(userId, userId === 'conversation1' ? 5 : 3),
        unreadMessages: userId === 'conversation1' ? 2 : 0
      }
    };
  }
  
  // Default empty response
  return {};
}

/**
 * Generates a mock contest for simulation
 * @param {string} id - Contest ID
 * @returns {Object} - Mock contest data
 */
function generateMockContest(id) {
  // Create a random date in the near future
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);
  
  return {
    _id: id,
    title: `Sample Contest ${id}`,
    type: Math.random() > 0.5 ? 'DEADLINE' : 'SCORE',
    size: ['SMALL', 'MEDIUM', 'LARGE'][Math.floor(Math.random() * 3)],
    open: true,
    organizer: '12345',
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    banner: null,
    about_company: {
      name: 'Sample Company',
      link: 'https://example.com',
      logo: null,
      description: 'A sample company description'
    },
    about_contest: {
      short_description: 'This is a sample contest description.',
      target_audience: 'Target audience description',
      purpose: 'Purpose of the contest',
      how_to_win: 'How to win the contest',
      boost: 'What we bring to the table',
      tags: ['Sample', 'Contest', 'Tag']
    },
    grandPrize: {
      amount: id === '1' ? 5000 : (id === '2' ? 1500 : 250),
      winner: null,
      participants_reached: []
    },
    lotteryPrize: {
      amount: id === '1' ? 666 : (id === '2' ? 222 : 0),
      winner: null
    },
    milestones: id === '1' ? [
      {
        points: 10,
        prize: 500,
        date: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        winner: null
      },
      {
        points: 30,
        prize: 1000,
        date: new Date(startDate.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        winner: null
      },
      {
        points: 50,
        prize: 1500,
        date: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        winner: null
      }
    ] : (id === '2' ? [
      {
        points: 5,
        prize: 300,
        date: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        winner: null
      }
    ] : []),
    score: [
      {
        _id: '1',
        name: '1',
        number: 1,
        points: 1,
        measuring_unit: 'action',
        description: 'Get 1 point for every action'
      },
      {
        _id: '2',
        name: '1',
        number: 100,
        points: 2,
        measuring_unit: '€ revenue',
        description: 'Get 2 points for every 100€ revenue'
      }
    ],
    requirements: {
      categories: [],
      countries: ['Germany', 'France'],
      roles: ['Business Owner'],
      additional: [
        {
          name: 'Platform',
          description: 'Must have an account on our platform'
        }
      ],
      organizer_platform: 'https://example.com/platform'
    },
    rules: [
      'Follow all contest guidelines',
      'One entry per participant',
      'Decisions of judges are final'
    ],
    announcements: [
      {
        announcement: 'Contest is now open for entries!',
        date: new Date(startDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    faq: [
      {
        question: 'How do I participate?',
        answer: 'Sign up and follow the contest instructions.',
        questioner: '12345'
      },
      {
        question: 'When will winners be announced?',
        answer: 'Winners will be announced one week after the contest ends.',
        questioner: '12345'
      }
    ],
    participants: [
      {
        _id: '12345',
        fullName: 'John Doe',
        pfp: null,
        score: 35,
        joinedDate: new Date(startDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '67890',
        fullName: 'Jane Smith',
        pfp: null,
        score: 42,
        joinedDate: new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  };
}

/**
 * Generates mock score data for simulation
 * @param {string} contestId - Contest ID
 * @returns {Object} - Mock score data
 */
function generateMockScore(contestId) {
  return {
    score: [
      { category: '1', value: 15, points: 15 },
      { category: '2', value: 300, points: 6 }
    ],
    lottery_tickets: 3
  };
}

/**
 * Generates mock messages for simulation
 * @param {string} conversationId - Conversation ID
 * @param {number} count - Number of messages to generate
 * @returns {Array} - Array of mock messages
 */
function generateMockMessages(conversationId, count) {
  const messages = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const isFromUser = i % 2 === 0;
    
    messages.push({
      _id: `msg_${conversationId}_${i}`,
      conversation: conversationId,
      sender: isFromUser ? '12345' : 'admin',
      senderName: isFromUser ? 'John Doe' : (conversationId === 'conversation1' ? 'Support Team' : 'Contest Organizer'),
      senderPfp: null,
      message: `This is message #${i + 1} in the conversation.`,
      file: null,
      timestamp: new Date(now.getTime() - (count - i) * 3600000).toISOString()
    });
  }
  
  return messages;
}

/**
 * Handles API response
 * @param {Response} response - Fetch API response
 * @returns {Promise} - Promise resolving to the response data
 */
async function handleResponse(response) {
  const data = await response.json();
  
  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || 'Something went wrong',
      errors: data.errors
    };
  }
  
  return data;
}

/**
 * Formats an error object for consistent handling
 * @param {Error|Object} error - Error object
 * @returns {Object} - Formatted error
 */
function formatError(error) {
  if (error.status) {
    return error;
  }
  
  return {
    status: 500,
    message: error.message || 'Something went wrong',
    original: error
  };
}

/**
 * Gets the base URL for socket connections
 * @returns {string} Socket base URL
 */
export function getBaseSocketUrl() {
  return SOCKET_URL;
}

// Authentication APIs
/**
 * Registers a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} - Promise resolving to the user data
 */
export async function registerUser(userData) {
  const response = await request('POST', '/user/register', userData);
  return response.user;
}

/**
 * Logs in a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Promise resolving to the user data
 */
export async function loginUser(email, password) {
  const response = await request('POST', '/user/login', { email, password });
  return response.user;
}

/**
 * Logs out the current user
 * @returns {Promise} - Promise resolving to the logout result
 */
export async function logoutUser() {
  return await request('POST', '/user/logout');
}

/**
 * Gets the current logged in user
 * @returns {Promise} - Promise resolving to the user data
 */
export async function getCurrentUser() {
  const response = await request('POST', '/user/me', {});
  return response.user;
}

/**
 * Sends a password reset email
 * @param {string} email - User email
 * @returns {Promise} - Promise resolving to the result
 */
export async function forgotPassword(email) {
  return await request('POST', '/user/forgot-password', { email });
}

/**
 * Resets a user's password
 * @param {string} token - Reset token
 * @param {Object} data - Password reset data
 * @returns {Promise} - Promise resolving to the result
 */
export async function resetPassword(token, data) {
  return await request('POST', `/user/resetPassword/${token}`, data);
}

/**
 * Resends the verification email
 * @param {string} [email] - Optional email (uses current user if not provided)
 * @returns {Promise} - Promise resolving to the result
 */
export async function resendVerificationEmail(email) {
  return await request('POST', '/user/sendOTP', email ? { email } : {});
}

// Profile APIs
/**
 * Updates a user's profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise} - Promise resolving to the updated user data
 */
export async function updateProfile(profileData) {
  const response = await request('POST', '/user/profile/update', profileData);
  return response.user;
}

/**
 * Updates a user's profile picture
 * @param {FormData} formData - Form data containing the profile picture
 * @returns {Promise} - Promise resolving to the updated user data
 */
export async function updateProfilePicture(formData) {
  const response = await request('POST', '/user/profile/update-picture', formData, {
    // FormData will automatically set the correct Content-Type with boundary
  });
  return response.user;
}

/**
 * Removes a user's profile picture
 * @returns {Promise} - Promise resolving to the updated user data
 */
export async function removeProfilePicture() {
  const response = await request('POST', '/user/profile/remove-picture', {});
  return response.user;
}

// Contest APIs
/**
 * Gets contests with pagination
 * @param {number} [page=1] - Page number
 * @param {number} [limit=10] - Number of contests per page
 * @returns {Promise} - Promise resolving to the contests data
 */
export async function getContests(page = 1, limit = 10) {
  const response = await request('GET', `/contest?page=${page}&limit=${limit}`);
  return response.data || [];
}

/**
 * Gets a specific contest by ID
 * @param {string} contestId - Contest ID
 * @returns {Promise} - Promise resolving to the contest data
 */
export async function getContestDetails(contestId) {
  return await request('GET', `/contest/${contestId}`);
}

/**
 * Searches for contests
 * @param {string} query - Search query
 * @returns {Promise} - Promise resolving to the search results
 */
export async function searchContests(query) {
  const response = await request('POST', '/contest/search', { query });
  return response.data || [];
}

/**
 * Gets contests the user has participated in
 * @returns {Promise} - Promise resolving to the user's contests
 */
export async function getUserContests() {
  const response = await request('GET', '/user/contests');
  return response.data || [];
}

/**
 * Joins a contest
 * @param {string} contestId - Contest ID
 * @returns {Promise} - Promise resolving to the join result
 */
export async function joinContest(contestId) {
  return await request('POST', `/contest/${contestId}/join`, {});
}

/**
 * Updates the user's score in a contest
 * @param {string} contestId - Contest ID
 * @param {Object} scoreData - Score data to update
 * @returns {Promise} - Promise resolving to the update result
 */
export async function updateScore(contestId, scoreData) {
  return await request('POST', `/contest/${contestId}/score`, scoreData);
}

/**
 * Creates a new contest
 * @param {Object} contestData - Contest data
 * @returns {Promise} - Promise resolving to the created contest
 */
export async function createContest(contestData) {
  return await request('POST', '/contest/create', contestData);
}

/**
 * Updates an existing contest
 * @param {string} contestId - Contest ID
 * @param {Object} contestData - Updated contest data
 * @returns {Promise} - Promise resolving to the update result
 */
export async function updateContest(contestId, contestData) {
  return await request('POST', `/contest/${contestId}/edit`, contestData);
}

/**
 * Adds an announcement to a contest
 * @param {string} contestId - Contest ID
 * @param {Object} announcementData - Announcement data
 * @returns {Promise} - Promise resolving to the result
 */
export async function addAnnouncement(contestId, announcementData) {
  return await request('POST', `/contest/${contestId}/announcement`, announcementData);
}

/**
 * Adds a FAQ to a contest
 * @param {string} contestId - Contest ID
 * @param {Object} faqData - FAQ data
 * @returns {Promise} - Promise resolving to the result
 */
export async function addFaq(contestId, faqData) {
  return await request('POST', `/contest/${contestId}/faq`, faqData);
}

/**
 * Asks a question about a contest
 * @param {string} contestId - Contest ID
 * @param {Object} questionData - Question data
 * @returns {Promise} - Promise resolving to the result
 */
export async function askQuestion(contestId, questionData) {
  return await request('POST', `/contest/${contestId}/question`, questionData);
}

// Messaging APIs
/**
 * Gets all user conversations
 * @returns {Promise} - Promise resolving to the conversations data
 */
export async function getConversations() {
  const response = await request('GET', '/message/user/all');
  return response.data || [];
}

/**
 * Gets a specific conversation
 * @param {string} userId - User/conversation ID
 * @returns {Promise} - Promise resolving to the conversation data
 */
export async function getConversation(userId) {
  const response = await request('GET', `/message/user/${userId}`);
  return response.data || null;
}

/**
 * Sends a message
 * @param {string} conversationId - Conversation ID
 * @param {Object} messageData - Message data
 * @returns {Promise} - Promise resolving to the message data
 */
export async function sendMessage(conversationId, messageData) {
  return await request('POST', `/message/${conversationId}`, messageData);
}

/**
 * Uploads a file attachment for a message
 * @param {string} conversationId - Conversation ID
 * @param {FormData} formData - Form data containing the file
 * @returns {Promise} - Promise resolving to the upload result
 */
export async function uploadMessageFile(conversationId, formData) {
  return await request('POST', `/message/${conversationId}/file`, formData, {
    // FormData will automatically set the correct Content-Type with boundary
  });
}

/**
 * Marks a conversation as read
 * @param {string} conversationId - Conversation ID
 * @returns {Promise} - Promise resolving to the result
 */
export async function markConversationAsRead(conversationId) {
  return await request('POST', `/message/${conversationId}/read`, {});
}

/**
 * Sends a contact form message
 * @param {Object} contactData - Contact form data
 * @returns {Promise} - Promise resolving to the result
 */
export async function sendContactMessage(contactData) {
  return await request('POST', '/contact', contactData);
}

// For simpler exports, we can also export the request function
export { request };