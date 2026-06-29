/**
 * Thiranex Accessible Portfolio - Core JavaScript
 * Handles: Light/Dark Theme, Accessible Mobile Menu, 
 * Dynamic Project Filtering, and Semantic Form Validation.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initContactForm();
  initProjectFilters();
});

/* ==========================================================================
   1. THEME CONTROLLER (Light / Dark Mode)
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  // Retrieve saved theme or default to system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  
  const isLight = savedTheme === 'light' || (!savedTheme && systemPrefersLight);
  
  if (isLight) {
    document.body.classList.add('light-theme');
    updateThemeButton(true);
  } else {
    document.body.classList.remove('light-theme');
    updateThemeButton(false);
  }

  themeToggleBtn.addEventListener('click', () => {
    const currentlyLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', currentlyLight ? 'light' : 'dark');
    updateThemeButton(currentlyLight);
    
    // Announce theme change to screen readers
    announceToScreenReader(`Theme changed to ${currentlyLight ? 'Light' : 'Dark'} mode`);
  });
}

function updateThemeButton(isLight) {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  
  btn.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
}

/* ==========================================================================
   2. MOBILE NAV DRAWER (Keyboard Trapping & ARIA Toggling)
   ========================================================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links-list');
  if (!menuBtn || !navLinks) return;

  const links = navLinks.querySelectorAll('a');

  function toggleMenu(forceClose = false) {
    const isOpen = forceClose ? false : menuBtn.getAttribute('aria-expanded') === 'false';
    
    menuBtn.setAttribute('aria-expanded', isOpen);
    navLinks.classList.toggle('open', isOpen);
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Shift focus to the first nav link in the list when opened
      setTimeout(() => links[0]?.focus(), 100);
      document.addEventListener('keydown', trapMenuFocus);
    } else {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', trapMenuFocus);
    }
  }

  // Keyboard Navigation: Trap focus inside menu when open
  function trapMenuFocus(e) {
    if (e.key !== 'Tab') return;
    
    const focusable = [menuBtn, ...links];
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    if (e.shiftKey) { // Backwards
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else { // Forwards
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  }

  menuBtn.addEventListener('click', () => toggleMenu());

  // Close menu on selecting a link
  links.forEach(link => {
    link.addEventListener('click', () => {
      if (menuBtn.getAttribute('aria-expanded') === 'true') {
        toggleMenu(true);
        menuBtn.focus();
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
      toggleMenu(true);
      menuBtn.focus();
    }
  });

  // Handle window resizing (close menu if viewport expands beyond mobile breakpoint)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && menuBtn.getAttribute('aria-expanded') === 'true') {
      toggleMenu(true);
    }
  });
}

/* ==========================================================================
   3. ACCESSIBLE CONTACT FORM VALIDATION
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const liveFeedback = document.getElementById('form-feedback-alert');
  if (!form || !liveFeedback) return;

  const inputs = form.querySelectorAll('.form-control');

  // Real-time validation on input blur
  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      validateInput(input);
    });
    
    input.addEventListener('input', () => {
      // Clear errors dynamically when correcting input
      if (input.classList.contains('invalid')) {
        clearInputError(input);
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isFormValid = true;

    // Validate all inputs before submitting
    inputs.forEach(input => {
      const isValid = validateInput(input);
      if (!isValid) isFormValid = false;
    });

    // Reset feedback live container
    liveFeedback.style.display = 'none';
    liveFeedback.className = 'form-feedback';
    liveFeedback.innerHTML = '';

    if (isFormValid) {
      // Simulate form submission
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending message...';
      
      // Focus live feedback region so screen readers catch updates immediately
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        form.reset();
        
        // Show success alert
        liveFeedback.className = 'form-feedback success';
        liveFeedback.innerHTML = `
          <svg aria-hidden="true" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
          </svg>
          Thank you! Your message has been sent successfully.
        `;
        liveFeedback.style.display = 'flex';
        liveFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 1000);
      
    } else {
      // Show error alert and focus the first invalid input
      liveFeedback.className = 'form-feedback error';
      liveFeedback.innerHTML = `
        <svg aria-hidden="true" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
        </svg>
        Please fix the highlighted errors before submitting the form.
      `;
      liveFeedback.style.display = 'flex';
      
      const firstInvalid = form.querySelector('.form-control.invalid');
      firstInvalid?.focus();
    }
  });
}

function validateInput(input) {
  const value = input.value.trim();
  let isValid = true;
  let errorMsg = '';

  // Required Field Checks
  if (input.hasAttribute('required') && value === '') {
    isValid = false;
    errorMsg = 'This field is required.';
  } 
  // Email pattern check
  else if (input.type === 'email' && value !== '') {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      isValid = false;
      errorMsg = 'Please enter a valid email address.';
    }
  }

  if (!isValid) {
    showInputError(input, errorMsg);
  } else {
    clearInputError(input);
  }

  return isValid;
}

function showInputError(input, message) {
  input.classList.add('invalid');
  input.setAttribute('aria-invalid', 'true');
  
  const errorId = input.getAttribute('aria-describedby');
  if (errorId) {
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  }
}

function clearInputError(input) {
  input.classList.remove('invalid');
  input.setAttribute('aria-invalid', 'false');
  
  const errorId = input.getAttribute('aria-describedby');
  if (errorId) {
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  }
}

/* ==========================================================================
   4. ACCESSIBLE PROJECTS FILTERING (ARIA Pressed States)
   ========================================================================== */
function initProjectFilters() {
  const filterContainer = document.getElementById('project-filters');
  const cards = document.querySelectorAll('.project-card');
  if (!filterContainer || cards.length === 0) return;

  const buttons = filterContainer.querySelectorAll('.filter-btn');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      // Update ARIA attributes
      buttons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      });

      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');

      const filterValue = button.getAttribute('data-filter');
      let visibleCount = 0;

      cards.forEach(card => {
        const categories = card.getAttribute('data-category').split(' ');
        
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.style.display = 'block';
          card.setAttribute('aria-hidden', 'false');
          visibleCount++;
        } else {
          card.style.display = 'none';
          card.setAttribute('aria-hidden', 'true');
        }
      });

      // Announce filter results to screen readers
      const categoryName = button.textContent.trim();
      announceToScreenReader(`Filtered projects by ${categoryName}. Showing ${visibleCount} project${visibleCount === 1 ? '' : 's'}.`);
    });
  });
}

/* ==========================================================================
   UTILITY: Screen Reader Live Region Announcer
   ========================================================================== */
function announceToScreenReader(message) {
  let announcer = document.getElementById('sr-announcer');
  
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'sr-announcer';
    announcer.className = 'sr-only';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    document.body.appendChild(announcer);
  }
  
  announcer.textContent = '';
  // Timeout ensures screen readers catch the text insertion as a change
  setTimeout(() => {
    announcer.textContent = message;
  }, 100);
}
