/**
 * Simple router for the Joridiro application
 * Handles navigation and page rendering
 */
class Router {
    constructor(routes) {
      this.routes = routes;
      this.currentRoute = null;
      
      // Handle initial route and navigation
      window.addEventListener('popstate', () => this.handleRouteChange());
      document.addEventListener('DOMContentLoaded', () => this.handleRouteChange());
      
      // Intercept link clicks for SPA behavior
      document.addEventListener('click', (e) => {
        if (e.target.matches('a') || e.target.closest('a')) {
          const link = e.target.matches('a') ? e.target : e.target.closest('a');
          if (link.href && link.href.startsWith(window.location.origin) && !link.hasAttribute('target')) {
            e.preventDefault();
            this.navigate(link.pathname);
          }
        }
      });
    }
    
    async handleRouteChange() {
      const path = window.location.pathname;
      let matchedRoute = null;
      let params = {};
      
      // Find matching route
      for (const route of this.routes) {
        // Check for exact match
        if (route.path === path) {
          matchedRoute = route;
          break;
        }
        
        // Check for pattern match
        if (route.pattern) {
          const match = path.match(new RegExp(route.pattern));
          if (match) {
            matchedRoute = route;
            params = { id: match[1] }; // Assuming pattern captures one param like an ID
            break;
          }
        }
      }
      
      if (!matchedRoute) {
        // Handle 404
        matchedRoute = this.routes.find(route => route.name === '404') || { 
          render: () => { 
            document.querySelector('#app').innerHTML = '<h1>Page not found</h1>';
            document.title = '404 - Page Not Found | Joridiro';
          }
        };
      }
      
      // Clear previous route
      if (this.currentRoute && this.currentRoute.onLeave) {
        this.currentRoute.onLeave();
      }
      
      // Set current route
      this.currentRoute = matchedRoute;
      
      // Handle before enter hook
      if (matchedRoute.onBeforeEnter) {
        const shouldContinue = await matchedRoute.onBeforeEnter(params);
        if (shouldContinue === false) {
          return;
        }
      }
      
      // Render the route
      await matchedRoute.render(params);
      
      // Set page title
      if (matchedRoute.title) {
        document.title = `${matchedRoute.title} | Joridiro`;
      }
      
      // Handle after enter hook
      if (matchedRoute.onAfterEnter) {
        await matchedRoute.onAfterEnter(params);
      }
      
      // Scroll to top or hash
      if (window.location.hash) {
        const element = document.querySelector(window.location.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        window.scrollTo(0, 0);
      }
    }
    
    navigate(path, replace = false) {
      if (replace) {
        window.history.replaceState({}, '', path);
      } else {
        window.history.pushState({}, '', path);
      }
      this.handleRouteChange();
    }
  }
  
  export default Router;