/**
 * Messages page for the Joridiro application
 */
import * as api from '../api.js';
import { store } from '../store.js';
import { showNotification } from '../components/notification.js';
import { createModal } from '../components/modal.js';
import { showContactForm } from '../components/contact-form.js';
import { getInitials, timeAgo } from '../utils/formatters.js';

// Socket instance for real-time messaging
let socket = null;

/**
 * Renders the messages page
 */
export async function renderMessagesPage() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;
  
  const user = store.getState().user;
  if (!user) {
    // Redirect to home if not logged in
    window.router.navigate('/');
    return;
  }
  
  // Get conversation ID from URL if any
  const urlParts = window.location.pathname.split('/');
  const conversationId = urlParts.length > 2 ? urlParts[2] : null;
  
  // Set initial content
  appContainer.innerHTML = `
    <div class="messages-container">
      <div class="messages-sidebar" id="messages-sidebar">
        <div class="sidebar-header">
          <button id="create-ticket-btn" class="btn btn-primary">Create a Ticket</button>
        </div>
        
        <div class="user-list" id="user-list">
          <div class="loading-conversations">
            <div class="loading-spinner small">
              <svg class="spinner" viewBox="0 0 50 50">
                <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
              </svg>
            </div>
            <span>Loading conversations...</span>
          </div>
        </div>
      </div>
      
      <div class="messages-content ${conversationId ? '' : 'empty-state'}" id="messages-content">
        ${conversationId ? `
          <div class="conversation-loading">
            <div class="loading-spinner">
              <svg class="spinner" viewBox="0 0 50 50">
                <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
              </svg>
            </div>
            <span>Loading conversation...</span>
          </div>
        ` : `
          <div class="no-conversation-selected">
            <div class="no-conversation-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h2>No Conversation Selected</h2>
            <p>Select a conversation from the sidebar or create a new ticket.</p>
            <button id="create-ticket-empty-btn" class="btn btn-primary">Create a Ticket</button>
          </div>
        `}
      </div>
    </div>
  `;
  
  // Set up create ticket buttons
  setupCreateTicketButtons();
  
  // Load user conversations
  await loadConversations(conversationId);
  
  // Initialize socket connection
  initializeSocket();
  
  // If conversation ID is provided, load that conversation
  if (conversationId) {
    await loadConversation(conversationId);
  }
}

/**
 * Sets up create ticket button handlers
 */
function setupCreateTicketButtons() {
  const createTicketBtn = document.getElementById('create-ticket-btn');
  if (createTicketBtn) {
    createTicketBtn.addEventListener('click', showContactForm);
  }
  
  const createTicketEmptyBtn = document.getElementById('create-ticket-empty-btn');
  if (createTicketEmptyBtn) {
    createTicketEmptyBtn.addEventListener('click', showContactForm);
  }
}

/**
 * Loads user conversations (sidebar)
 * @param {string} [activeId] - Active conversation ID
 */
async function loadConversations(activeId = null) {
  const userListContainer = document.getElementById('user-list');
  if (!userListContainer) return;
  
  try {
    // Fetch all conversations
    const conversations = await api.getConversations();
    
    if (!conversations || conversations.length === 0) {
      userListContainer.innerHTML = `
        <div class="no-conversations">
          <p>No conversations yet</p>
        </div>
      `;
      return;
    }
    
    // Render conversation list
    userListContainer.innerHTML = conversations.map(conversation => {
      const isActive = activeId && conversation._id === activeId;
      const hasUnread = conversation.unreadMessages > 0;
      
      return `
        <a href="/messages/${conversation._id}" class="user-item ${isActive ? 'active' : ''} ${hasUnread ? 'unread' : ''}">
          <div class="user-avatar">
            ${conversation.pfp ? 
              `<img src="${conversation.pfp}" alt="${conversation.fullName}">` : 
              `<div class="user-initials">${getInitials(conversation.fullName)}</div>`
            }
          </div>
          <div class="user-info">
            <div class="user-name">${conversation.fullName}</div>
            <div class="last-message">
              ${conversation.messages && conversation.messages.length > 0 ? 
                (conversation.messages[conversation.messages.length - 1].message ? 
                  truncateMessage(conversation.messages[conversation.messages.length - 1].message) : 
                  'Sent a file'
                ) : 
                'No messages yet'
              }
            </div>
          </div>
          ${hasUnread ? `
            <div class="unread-badge">
              <span>${conversation.unreadMessages}</span>
            </div>
          ` : ''}
        </a>
      `;
    }).join('');
    
    // Update store with conversations
    store.setState({
      messages: conversations.reduce((acc, conversation) => {
        acc[conversation._id] = conversation;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Failed to load conversations:', error);
    
    userListContainer.innerHTML = `
      <div class="load-error">
        <p>Failed to load conversations</p>
        <button id="retry-conversations" class="btn btn-text btn-small">Retry</button>
      </div>
    `;
    
    // Add retry button handler
    const retryButton = userListContainer.querySelector('#retry-conversations');
    if (retryButton) {
      retryButton.addEventListener('click', () => loadConversations(activeId));
    }
  }
}

/**
 * Loads a specific conversation
 * @param {string} conversationId - Conversation ID
 */
async function loadConversation(conversationId) {
  const messagesContent = document.getElementById('messages-content');
  if (!messagesContent) return;
  
  try {
    // Fetch conversation details
    const conversation = await api.getConversation(conversationId);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    // Update store with this conversation
    const messages = store.getState().messages || {};
    messages[conversation._id] = conversation;
    store.setState({ messages });
    
    // Render conversation
    messagesContent.innerHTML = `
      <div class="conversation-header">
        <div class="conversation-user">
          <div class="user-avatar">
            ${conversation.pfp ? 
              `<img src="${conversation.pfp}" alt="${conversation.fullName}">` : 
              `<div class="user-initials">${getInitials(conversation.fullName)}</div>`
            }
          </div>
          <div class="user-name">${conversation.fullName}</div>
        </div>
        <div class="conversation-actions">
          <button id="mobile-back-btn" class="btn btn-icon mobile-only">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="conversation-messages" id="conversation-messages">
        ${renderMessages(conversation.messages)}
      </div>
      
      <div class="message-input-container">
        <form id="message-form" class="message-form">
          <div class="message-input">
            <textarea 
              id="message-text" 
              placeholder="Type your message..." 
              rows="1"
              required
            ></textarea>
          </div>
          <div class="message-actions">
            <button type="button" id="attach-file-btn" class="btn btn-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </button>
            <button type="submit" id="send-message-btn" class="btn btn-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <input type="file" id="file-input" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" hidden>
        </form>
      </div>
    `;
    
    // Scroll to bottom of messages
    const messagesContainer = document.getElementById('conversation-messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Set up form submission
    setupMessageForm(conversationId);
    
    // Set up file attachment
    setupFileAttachment(conversationId);
    
    // Set up mobile back button
    const backButton = document.getElementById('mobile-back-btn');
    if (backButton) {
      backButton.addEventListener('click', () => {
        // Add 'show-sidebar' class to messages container to show sidebar on mobile
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer) {
          messagesContainer.classList.add('show-sidebar');
        }
      });
    }
    
    // Mark conversation as read
    if (conversation.unreadMessages > 0) {
      api.markConversationAsRead(conversationId).catch(error => {
        console.error('Failed to mark conversation as read:', error);
      });
    }
  } catch (error) {
    console.error('Failed to load conversation:', error);
    
    messagesContent.innerHTML = `
      <div class="conversation-error">
        <div class="error-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3>Conversation Not Found</h3>
        <p>We couldn't load this conversation. It may have been deleted or you don't have access.</p>
        <a href="/messages" class="btn btn-primary">Back to Messages</a>
      </div>
    `;
  }
}

/**
 * Renders messages for a conversation
 * @param {Array} messages - Messages array
 * @returns {string} Messages HTML
 */
function renderMessages(messages) {
  if (!messages || messages.length === 0) {
    return `
      <div class="no-messages">
        <p>No messages yet. Start the conversation!</p>
      </div>
    `;
  }
  
  const currentUser = store.getState().user;
  if (!currentUser) return '';
  
  let result = '';
  let currentDate = null;
  
  // Group messages by date
  messages.forEach(message => {
    const messageDate = new Date(message.timestamp);
    const messageDay = messageDate.toDateString();
    
    // Add date separator if it's a new day
    if (messageDay !== currentDate) {
      result += `
        <div class="date-separator">
          <span>${formatMessageDate(messageDate)}</span>
        </div>
      `;
      currentDate = messageDay;
    }
    
    // Add message
    const isCurrentUser = message.sender === currentUser._id;
    result += `
      <div class="message ${isCurrentUser ? 'sent' : 'received'}">
        ${!isCurrentUser ? `
          <div class="message-avatar">
            ${message.senderPfp ? 
              `<img src="${message.senderPfp}" alt="">` : 
              `<div class="message-initials">${getInitials(message.senderName || 'User')}</div>`
            }
          </div>
        ` : ''}
        
        <div class="message-content">
          ${message.file ? renderFileAttachment(message.file) : ''}
          ${message.message ? `<p>${message.message}</p>` : ''}
          <div class="message-time">${formatMessageTime(message.timestamp)}</div>
        </div>
      </div>
    `;
  });
  
  return result;
}

/**
 * Renders a file attachment
 * @param {Object} file - File data
 * @returns {string} File attachment HTML
 */
function renderFileAttachment(file) {
  const fileType = getFileType(file.name);
  
  if (fileType === 'image') {
    return `
      <div class="attachment image-attachment">
        <img src="${file.url}" alt="${file.name}">
        <div class="attachment-info">
          <span class="attachment-name">${file.name}</span>
          <a href="${file.url}" download="${file.name}" class="attachment-download">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </a>
        </div>
      </div>
    `;
  } else {
    return `
      <div class="attachment file-attachment">
        <div class="file-icon">
          ${getFileIcon(fileType)}
        </div>
        <div class="attachment-info">
          <span class="attachment-name">${file.name}</span>
          <a href="${file.url}" download="${file.name}" class="attachment-download">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </a>
        </div>
      </div>
    `;
  }
}

/**
 * Sets up message form submission
 * @param {string} conversationId - Conversation ID
 */
function setupMessageForm(conversationId) {
  const messageForm = document.getElementById('message-form');
  const messageInput = document.getElementById('message-text');
  
  if (!messageForm || !messageInput) return;
  
  // Auto-resize textarea
  messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = (messageInput.scrollHeight) + 'px';
  });
  
  // Handle form submission
  messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    try {
      // Optimistically add message to UI
      appendNewMessage({
        sender: store.getState().user._id,
        message,
        timestamp: new Date().toISOString()
      });
      
      // Send message via API
      await api.sendMessage(conversationId, { message });
      
      // If socket is connected, message will be handled by the socket
      // Otherwise, we'd need to refresh the conversation
      if (!socket || !socket.connected) {
        await loadConversation(conversationId);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      showNotification('Failed to send message. Please try again.', 'error');
    }
  });
}

/**
 * Sets up file attachment functionality
 * @param {string} conversationId - Conversation ID
 */
function setupFileAttachment(conversationId) {
  const attachButton = document.getElementById('attach-file-btn');
  const fileInput = document.getElementById('file-input');
  
  if (!attachButton || !fileInput) return;
  
  // Trigger file input when attach button is clicked
  attachButton.addEventListener('click', () => {
    fileInput.click();
  });
  
  // Handle file selection
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('File is too large. Maximum size is 5MB.', 'error');
      fileInput.value = '';
      return;
    }
    
    try {
      // Show loading state
      attachButton.disabled = true;
      attachButton.innerHTML = `
        <svg class="spinner small" viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
        </svg>
      `;
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload file
      const response = await api.uploadMessageFile(conversationId, formData);
      
      // Reset file input
      fileInput.value = '';
      
      // If socket is connected, file message will be handled by the socket
      // Otherwise, we'd need to refresh the conversation
      if (!socket || !socket.connected) {
        await loadConversation(conversationId);
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      showNotification('Failed to upload file. Please try again.', 'error');
    } finally {
      // Restore attach button
      attachButton.disabled = false;
      attachButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
        </svg>
      `;
    }
  });
}

/**
 * Initializes socket connection for real-time messaging
 */
function initializeSocket() {
  const user = store.getState().user;
  if (!user) return;
  
  try {
    // Use dynamic import for the socket.io-client library
    // This allows for better code splitting
    import('socket.io-client').then(({ default: io }) => {
      // Connect to socket server
      socket = io(`${api.getBaseSocketUrl()}`);
      
      // Handle connection
      socket.on('connect', () => {
        console.log('Socket connected');
        
        // Assign user to socket
        socket.emit('assign_user', user._id);
      });
      
      // Handle new messages
      socket.on('message', (message) => {
        handleNewMessage(message);
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
      
      // Handle errors
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });
  } catch (error) {
    console.error('Failed to initialize socket:', error);
  }
}

/**
 * Handles a new message received via socket
 * @param {Object} message - Message data
 */
function handleNewMessage(message) {
  // Update store with new message
  const messages = store.getState().messages || {};
  const conversation = messages[message.conversation];
  
  if (conversation) {
    // Add message to conversation
    conversation.messages = [...(conversation.messages || []), message];
    
    // Update unread count if this is not the active conversation
    const urlParts = window.location.pathname.split('/');
    const activeConversation = urlParts.length > 2 ? urlParts[2] : null;
    
    if (activeConversation !== message.conversation) {
      conversation.unreadMessages = (conversation.unreadMessages || 0) + 1;
    }
    
    // Update store
    store.setState({ messages });
    
    // Update UI if this is the active conversation
    if (activeConversation === message.conversation) {
      appendNewMessage(message);
      
      // Mark as read
      api.markConversationAsRead(message.conversation).catch(error => {
        console.error('Failed to mark conversation as read:', error);
      });
    } else {
      // Update conversation list to show new message
      loadConversations(activeConversation);
      
      // Show notification
      showNotification(`New message from ${conversation.fullName}`, 'info');
    }
  } else {
    // This is a new conversation, reload conversations
    loadConversations();
  }
}

/**
 * Appends a new message to the conversation UI
 * @param {Object} message - Message data
 */
function appendNewMessage(message) {
  const messagesContainer = document.getElementById('conversation-messages');
  if (!messagesContainer) return;
  
  const currentUser = store.getState().user;
  if (!currentUser) return;
  
  // Check if we need to add a date separator
  const messageDate = new Date(message.timestamp);
  const messageDay = messageDate.toDateString();
  
  const lastDateSeparator = messagesContainer.querySelector('.date-separator:last-child');
  const needsDateSeparator = !lastDateSeparator || 
    lastDateSeparator.textContent.trim() !== formatMessageDate(messageDate);
  
  // Add date separator if needed
  if (needsDateSeparator) {
    const dateSeparator = document.createElement('div');
    dateSeparator.className = 'date-separator';
    dateSeparator.innerHTML = `<span>${formatMessageDate(messageDate)}</span>`;
    messagesContainer.appendChild(dateSeparator);
  }
  
  // Create message element
  const isCurrentUser = message.sender === currentUser._id;
  const messageElement = document.createElement('div');
  messageElement.className = `message ${isCurrentUser ? 'sent' : 'received'}`;
  
  messageElement.innerHTML = `
    ${!isCurrentUser ? `
      <div class="message-avatar">
        ${message.senderPfp ? 
          `<img src="${message.senderPfp}" alt="">` : 
          `<div class="message-initials">${getInitials(message.senderName || 'User')}</div>`
        }
      </div>
    ` : ''}
    
    <div class="message-content">
      ${message.file ? renderFileAttachment(message.file) : ''}
      ${message.message ? `<p>${message.message}</p>` : ''}
      <div class="message-time">${formatMessageTime(message.timestamp)}</div>
    </div>
  `;
  
  // Add message to container
  messagesContainer.appendChild(messageElement);
  
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Formats a date for message groups
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
function formatMessageDate(date) {
  const now = new Date();
  const messageDate = new Date(date);
  
  // If it's today
  if (messageDate.toDateString() === now.toDateString()) {
    return 'Today';
  }
  
  // If it's yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  // If it's within the last 7 days
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);
  if (messageDate >= oneWeekAgo) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[messageDate.getDay()];
  }
  
  // Default format
  return messageDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Formats a timestamp for message display
 * @param {string} timestamp - Timestamp to format
 * @returns {string} Formatted time
 */
function formatMessageTime(timestamp) {
  const date = new Date(timestamp);
  
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Truncates a message for preview
 * @param {string} message - Message to truncate
 * @param {number} [length=30] - Maximum length
 * @returns {string} Truncated message
 */
function truncateMessage(message, length = 30) {
  if (!message) return '';
  
  if (message.length <= length) {
    return message;
  }
  
  return message.substring(0, length).trim() + '...';
}

/**
 * Determines the file type from a filename
 * @param {string} filename - Filename
 * @returns {string} File type
 */
function getFileType(filename) {
  if (!filename) return 'other';
  
  const extension = filename.split('.').pop().toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
    return 'image';
  } else if (['pdf'].includes(extension)) {
    return 'pdf';
  } else if (['doc', 'docx'].includes(extension)) {
    return 'word';
  } else if (['xls', 'xlsx'].includes(extension)) {
    return 'excel';
  } else {
    return 'other';
  }
}

/**
 * Gets the icon for a specific file type
 * @param {string} fileType - File type
 * @returns {string} Icon HTML
 */
function getFileIcon(fileType) {
  switch (fileType) {
    case 'pdf':
      return `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      `;
    case 'word':
      return `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      `;
    case 'excel':
      return `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="8" y1="13" x2="16" y2="13"></line>
          <line x1="8" y1="17" x2="16" y2="17"></line>
          <line x1="8" y1="9" x2="16" y2="9"></line>
        </svg>
      `;
    default:
      return `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
          <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
      `;
  }
}