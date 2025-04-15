/**
 * Modal component for the Joridiro application
 */

let activeModal = null;

/**
 * Creates and displays a modal dialog
 * @param {Object} options - Modal configuration options
 * @param {string} options.title - Modal title
 * @param {string|HTMLElement} options.content - Modal content (HTML string or element)
 * @param {string} [options.className] - Additional CSS class for the modal
 * @param {boolean} [options.closable=true] - Whether the modal can be closed by the user
 * @param {Function} [options.onClose] - Callback function when modal is closed
 * @returns {HTMLElement} The modal element
 */
export function createModal(options) {
  // Close any existing modal
  if (activeModal) {
    closeModal(activeModal);
  }
  
  // Create modal container if it doesn't exist
  let modalContainer = document.getElementById('modal-container');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'modal-container';
    document.body.appendChild(modalContainer);
  }
  
  // Create modal element
  const modal = document.createElement('div');
  modal.className = `modal ${options.className || ''}`;
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">${options.title || ''}</h3>
          ${options.closable !== false ? '<button class="modal-close">&times;</button>' : ''}
        </div>
        <div class="modal-body">
          ${typeof options.content === 'string' ? options.content : ''}
        </div>
      </div>
    </div>
  `;
  
  // If content is an element, append it to the modal body
  if (options.content instanceof HTMLElement) {
    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = '';
    modalBody.appendChild(options.content);
  }
  
  // Add to container
  modalContainer.appendChild(modal);
  
  // Store onClose callback
  if (typeof options.onClose === 'function') {
    modal.onClose = options.onClose;
  }
  
  // Add event listeners
  const closeButton = modal.querySelector('.modal-close');
  if (closeButton) {
    closeButton.addEventListener('click', () => closeModal(modal));
  }
  
  const backdrop = modal.querySelector('.modal-backdrop');
  if (backdrop && options.closable !== false) {
    backdrop.addEventListener('click', () => closeModal(modal));
  }
  
  // Prevent clicks inside modal dialog from closing the modal
  const dialog = modal.querySelector('.modal-dialog');
  if (dialog) {
    dialog.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
  
  // Add keyboard event listener for ESC key
  const keyHandler = (e) => {
    if (e.key === 'Escape' && options.closable !== false) {
      closeModal(modal);
    }
  };
  document.addEventListener('keydown', keyHandler);
  modal.keyHandler = keyHandler;
  
  // Store as active modal
  activeModal = modal;
  
  // Force reflow to trigger animation
  modal.offsetHeight;
  
  // Show modal with animation
  modal.classList.add('modal-show');
  
  // Make body non-scrollable
  document.body.classList.add('modal-open');
  
  return modal;
}

/**
 * Closes a modal dialog
 * @param {HTMLElement} modal - The modal element to close
 */
export function closeModal(modal) {
  if (!modal) return;
  
  // Remove keyboard event listener
  if (modal.keyHandler) {
    document.removeEventListener('keydown', modal.keyHandler);
  }
  
  // Start closing animation
  modal.classList.remove('modal-show');
  modal.classList.add('modal-hide');
  
  // Remove modal after animation completes
  setTimeout(() => {
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
    
    // If this was the active modal, clear it
    if (activeModal === modal) {
      activeModal = null;
    }
    
    // Make body scrollable again if no more modals
    if (!activeModal) {
      document.body.classList.remove('modal-open');
    }
    
    // Call onClose callback
    if (typeof modal.onClose === 'function') {
      modal.onClose();
    }
  }, 300); // Match CSS transition duration
}

/**
 * Updates the content of an open modal
 * @param {HTMLElement} modal - The modal element to update
 * @param {string|HTMLElement} content - New content for the modal
 */
export function updateModalContent(modal, content) {
  if (!modal) return;
  
  const modalBody = modal.querySelector('.modal-body');
  if (!modalBody) return;
  
  if (typeof content === 'string') {
    modalBody.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    modalBody.innerHTML = '';
    modalBody.appendChild(content);
  }
}

/**
 * Updates the title of an open modal
 * @param {HTMLElement} modal - The modal element to update
 * @param {string} title - New title for the modal
 */
export function updateModalTitle(modal, title) {
  if (!modal) return;
  
  const modalTitle = modal.querySelector('.modal-title');
  if (modalTitle) {
    modalTitle.textContent = title;
  }
}