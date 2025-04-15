/**
 * Main application entry point for Joridiro
 */
import Router from './router.js';
import { store } from './store.js';
import * as api from './api.js';
import { showNotification } from './components/notification.js';
import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';

// Import page renderers
import { renderHomePage } from './pages/home.js';
import { renderContestsPage } from './pages/contests.js';
import { renderContestDetailPage } from './pages/contest-detail.js';
import { renderContestEditPage } from './pages/contest-edit.js';
import { renderContestCreatePage } from './pages/contest-create.js';
import { renderProfilePage } from './pages/profile.js';
import { renderProfileContestsPage } from './pages/profile-contests.js';
import { renderAboutPage } from './pages/about.js';
import { renderErrorPage } from './pages/error.js';
import { renderImpressumPage } from './pages/impressum.js';
import { renderDemoPage } from './pages/demo.js';
import { renderMessagesPage } from './pages/messages.js';

// Define routes
const routes = [
  {
    path: '/',
    name: 'home',
    title: 'Home',
    render: renderHomePage
  },
  {
    path: '/contests',
    name: 'contests',
    title: 'Contests',
    render: renderContestsPage
  },
  {
    pattern: '^/contests/([^/]+)$',
    name: 'contest-detail',
    title: 'Contest Details',
    render: (params) => renderContestDetailPage(params.id)
  },
  {
    pattern: '^/contests/([^/]+)/edit$',
    name: 'contest-edit',
    title: 'Edit Contest',
    onBeforeEnter: async () => {
      // Check if user is logged in
      if (!store.getState().user) {
        showNotification('Please log in to edit contests', 'error');
        router.navigate('/');
        return false;
      }
      return true;
    },
    render: (params) => renderContestEditPage(params.id)
  },
  {
    path: '/contests/create',
    name: 'contest-create',
    title: 'Create Contest',
    onBeforeEnter: async () => {
      // Check if user is logged in
      if (!store.getState().user) {
        showNotification('Please log in to create contests', 'error');
        router.navigate('/');
        return false;
      }
      return true;
    },
    render: renderContestCreatePage
  },
  {
    path: '/profile',
    name: 'profile',
    title: 'My Profile',
    onBeforeEnter: async () => {
      // Check if user is logged in
      if (!store.getState().user) {
        showNotification('Please log in to view your profile', 'error');
        router.navigate('/');
        return false;
      }
      return true;
    },
    render: renderProfilePage
  },
  {
    path: '/profile/contests',
    name: 'profile-contests',
    title: 'My Contests',
    onBeforeEnter: async () => {
      // Check if user is logged in
      if (!store.getState().user) {
        showNotification('Please log in to view your contests', 'error');
        router.navigate('/');
        return false;
      }
      return true;
    },
    render: renderProfileContestsPage
  },
  {
    path: '/about',
    name: 'about',
    title: 'About Us',
    render: renderAboutPage
  },
  {
    path: '/impressum',
    name: 'impressum',
    title: 'Impressum',
    render: renderImpressumPage
  },
  {
    pattern: '^/demo',
    name: 'demo',
    title: 'Demo Contest',
    render: () => renderDemoPage()
  },
  {
    pattern: '^/messages',
    name: 'messages',
    title: 'Messages',
    onBeforeEnter: async () => {
      // Check if user is logged in
      if (!store.getState().user) {
        showNotification('Please log in to view messages', 'error');
        router.navigate('/');
        return false;
      }
      return true;
    },
    render: renderMessagesPage
  },
  {
    name: '404',
    title: 'Page Not Found',
    render: renderErrorPage
  }
];

// Initialize router
const router = new Router(routes);

// Make router available globally
window.router = router;

// Initialize app
async function initApp() {
  // Create app container if it doesn't exist
  if (!document.getElementById('app')) {
    const appContainer = document.createElement('div');
    appContainer.id = 'app';
    document.body.appendChild(appContainer);
  }
  
  // Create notification container
  const notificationContainer = document.createElement('div');
  notificationContainer.id = 'notification-container';
  document.body.appendChild(notificationContainer);
  
  // Render persistent components
  renderHeader();
  renderFooter();
  
  // Check for existing session
  try {
    const userData = await api.getCurrentUser();
    if (userData) {
      store.setState({ user: userData });
    }
  } catch (error) {
    console.error('Failed to get current user:', error);
    store.setState({ user: null });
  }
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Expose key functionality to window for debugging
window.joridiro = {
  store,
  api,
  router
};