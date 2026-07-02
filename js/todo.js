/**
 * Thiranex Accessible Portfolio - To-Do List Application (Phase 3)
 * Handles: Full CRUD, state management, event delegation, search/filters,
 * sorting, localStorage sync, undo notification, and screen reader announcements.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. App State
  let tasks = [];
  let deletedTaskBackup = null;
  let activeFilter = 'all';
  let searchQuery = '';
  let activeSort = 'created-desc';

  // Priority mapping for sorting
  const priorityMap = {
    high: 3,
    medium: 2,
    low: 1
  };

  // 2. DOM Elements
  const todoForm = document.getElementById('todo-form');
  const titleInput = document.getElementById('todo-title-input');
  const priorityInput = document.getElementById('todo-priority-input');
  const dateInput = document.getElementById('todo-date-input');
  const titleError = document.getElementById('todo-title-error');

  const todoList = document.getElementById('todo-list');
  const searchInput = document.getElementById('todo-search');
  const filterTabs = document.getElementById('todo-filter-tabs');
  const sortSelect = document.getElementById('todo-sort');
  
  const progressText = document.getElementById('progress-text');
  const progressPercentage = document.getElementById('progress-percentage');
  const progressFill = document.getElementById('progress-fill');
  
  const liveAnnouncer = document.getElementById('todo-live-announcer');
  const toastContainer = document.getElementById('todo-toast-container');

  // Initialize the App
  init();

  function init() {
    loadTasksFromStorage();
    renderTasks();
    setupEventListeners();
  }

  // 3. Setup Event Listeners
  function setupEventListeners() {
    // Add task form submit
    todoForm.addEventListener('submit', handleAddTask);

    // Dynamic error clearing
    titleInput.addEventListener('input', () => {
      if (titleInput.classList.contains('invalid')) {
        clearInputError();
      }
    });

    // Search input event
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderTasks();
    });

    // Filter tabs click (Delegated on navigation list)
    filterTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.todo-filter-btn');
      if (!btn) return;

      // Update button active classes & accessibility states
      filterTabs.querySelectorAll('.todo-filter-btn').forEach(button => {
        button.classList.remove('active');
        button.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      // Update state and render
      activeFilter = btn.dataset.filter;
      renderTasks();
      announceToScreenReader(`Filtering tasks by ${activeFilter}`);
    });

    // Sort selection change
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      renderTasks();
    });

    // TASK LIST DELEGATED ACTIONS
    // Handles toggles, edits, saves, cancels, and deletes
    todoList.addEventListener('click', (e) => {
      const target = e.target;
      const todoItem = target.closest('.todo-item');
      if (!todoItem) return;
      const taskId = todoItem.dataset.id;

      // Click: Checkbox Toggle
      if (target.closest('.todo-checkbox-btn')) {
        toggleTaskCompletion(taskId);
        return;
      }

      // Click: Delete Button
      if (target.closest('.btn-delete')) {
        deleteTask(taskId);
        return;
      }

      // Click: Edit Button
      if (target.closest('.btn-edit')) {
        enableInlineEdit(todoItem, taskId);
        return;
      }

      // Click: Save Edit Button
      if (target.closest('.todo-btn-save')) {
        saveInlineEdit(todoItem, taskId);
        return;
      }

      // Click: Cancel Edit Button
      if (target.closest('.todo-btn-cancel')) {
        cancelInlineEdit(todoItem, taskId);
        return;
      }
    });

    // Keyboard handlers inside Task List (Enter / Escape in edit inputs)
    todoList.addEventListener('keydown', (e) => {
      const target = e.target;
      const todoItem = target.closest('.todo-item');
      if (!todoItem) return;
      const taskId = todoItem.dataset.id;

      if (target.classList.contains('todo-edit-title-input')) {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveInlineEdit(todoItem, taskId);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cancelInlineEdit(todoItem, taskId);
        }
      }
    });
  }

  // 4. Core State & Data Functions
  function loadTasksFromStorage() {
    try {
      const stored = localStorage.getItem('thiranex-tasks');
      if (stored) {
        tasks = JSON.parse(stored);
      } else {
        // Sample tasks for initial load
        tasks = [
          {
            id: 'sample-1',
            title: 'Master DOM event delegation and event listeners',
            completed: false,
            priority: 'high',
            dueDate: getOffsetDateString(1),
            createdAt: Date.now() - 600000
          },
          {
            id: 'sample-2',
            title: 'Integrate window.localStorage with safety try-catch blocks',
            completed: true,
            priority: 'medium',
            dueDate: getOffsetDateString(0),
            createdAt: Date.now() - 300000
          },
          {
            id: 'sample-3',
            title: 'Audit WCAG 2.1 compliance for accessibility checks',
            completed: false,
            priority: 'low',
            dueDate: '',
            createdAt: Date.now() - 100000
          }
        ];
        saveTasksToStorage();
      }
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      announceToScreenReader('Error loading saved tasks. Storage may be disabled.');
    }
  }

  function saveTasksToStorage() {
    try {
      localStorage.setItem('thiranex-tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to write to localStorage:', error);
      announceToScreenReader('Warning: Unable to save tasks. Disk full or private mode enabled.');
    }
  }

  // 5. CRUD Operations

  // ADD TASK
  function handleAddTask(e) {
    e.preventDefault();
    const titleVal = titleInput.value.trim();

    if (!titleVal) {
      // Show validation errors
      titleInput.classList.add('invalid');
      titleInput.setAttribute('aria-invalid', 'true');
      titleInput.setAttribute('aria-describedby', 'todo-title-error');
      titleError.style.display = 'block';
      titleInput.focus();
      announceToScreenReader('Validation error: Task title cannot be blank.');
      return;
    }

    const newTask = {
      id: 'task-' + Date.now(),
      title: titleVal,
      completed: false,
      priority: priorityInput.value,
      dueDate: dateInput.value, // YYYY-MM-DD
      createdAt: Date.now()
    };

    tasks.push(newTask);
    saveTasksToStorage();
    
    // Reset Form
    titleInput.value = '';
    dateInput.value = '';
    priorityInput.value = 'medium';
    clearInputError();

    renderTasks();
    announceToScreenReader(`Task added: "${newTask.title}".`);
  }

  function clearInputError() {
    titleInput.classList.remove('invalid');
    titleInput.removeAttribute('aria-invalid');
    titleInput.removeAttribute('aria-describedby');
    titleError.style.display = 'none';
  }

  // TOGGLE STATUS
  function toggleTaskCompletion(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    saveTasksToStorage();
    renderTasks();
    
    const announcement = `Task "${task.title}" marked as ${task.completed ? 'completed' : 'active'}.`;
    announceToScreenReader(announcement);
  }

  // INLINE EDIT FLOW
  function enableInlineEdit(todoItem, id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // Check if the item is already editing
    if (todoItem.classList.contains('editing')) return;

    todoItem.classList.add('editing');
    
    // Store original markup to revert if edit is canceled
    const originalContent = todoItem.innerHTML;
    todoItem.dataset.originalContent = originalContent;

    // Render Form Controls inline
    todoItem.innerHTML = `
      <div class="todo-edit-wrapper">
        <div class="todo-edit-inputs">
          <input type="text" class="todo-edit-title-input" value="${escapeHtml(task.title)}" aria-label="Edit task title" required>
          <select class="todo-edit-priority-select" aria-label="Edit task priority">
            <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low Priority</option>
            <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium Priority</option>
            <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High Priority</option>
          </select>
          <input type="date" class="todo-edit-date-input" value="${task.dueDate}" aria-label="Edit task due date">
        </div>
        <div class="todo-edit-buttons">
          <button type="button" class="todo-btn-save">Save</button>
          <button type="button" class="todo-btn-cancel">Cancel</button>
        </div>
      </div>
    `;

    // Shift focus to the text input inside the edit frame
    const editInput = todoItem.querySelector('.todo-edit-title-input');
    editInput.focus();
    // Move cursor to the end of input
    const len = editInput.value.length;
    editInput.setSelectionRange(len, len);

    announceToScreenReader(`Editing task "${task.title}".`);
  }

  function saveInlineEdit(todoItem, id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const titleInputEl = todoItem.querySelector('.todo-edit-title-input');
    const newTitle = titleInputEl.value.trim();

    if (!newTitle) {
      titleInputEl.focus();
      titleInputEl.setAttribute('aria-invalid', 'true');
      announceToScreenReader('Error: Task title cannot be blank.');
      return;
    }

    const prioritySelectEl = todoItem.querySelector('.todo-edit-priority-select');
    const dateInputEl = todoItem.querySelector('.todo-edit-date-input');

    task.title = newTitle;
    task.priority = prioritySelectEl.value;
    task.dueDate = dateInputEl.value;

    saveTasksToStorage();
    renderTasks();
    announceToScreenReader(`Task saved: "${task.title}".`);

    // Bring keyboard focus back to the edit button of the updated element
    setTimeout(() => {
      const updatedItem = todoList.querySelector(`[data-id="${id}"]`);
      updatedItem?.querySelector('.btn-edit')?.focus();
    }, 50);
  }

  function cancelInlineEdit(todoItem, id) {
    const originalContent = todoItem.dataset.originalContent;
    if (originalContent) {
      todoItem.innerHTML = originalContent;
      todoItem.classList.remove('editing');
      delete todoItem.dataset.originalContent;
    } else {
      renderTasks();
    }
    
    // Focus back on the edit button
    setTimeout(() => {
      todoItem.querySelector('.btn-edit')?.focus();
    }, 50);
    announceToScreenReader('Editing canceled.');
  }

  // DELETE TASK
  function deleteTask(id) {
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return;

    const task = tasks[index];
    const todoItem = todoList.querySelector(`[data-id="${id}"]`);

    if (todoItem) {
      // Trigger exit animation
      todoItem.classList.add('task-exiting');
      todoItem.addEventListener('animationend', () => {
        performDelete(index, task);
      }, { once: true });
    } else {
      performDelete(index, task);
    }
  }

  function performDelete(index, task) {
    // Save to backup for Undo
    deletedTaskBackup = {
      task: { ...task },
      index: index
    };

    // Remove from state
    tasks.splice(index, 1);
    saveTasksToStorage();
    renderTasks();

    announceToScreenReader(`Task "${task.title}" deleted.`);
    showUndoToast(task.title);
  }

  // UNDO DELETION
  function undoDelete() {
    if (!deletedTaskBackup) return;

    const { task, index } = deletedTaskBackup;
    tasks.splice(index, 0, task);
    saveTasksToStorage();

    deletedTaskBackup = null;
    hideUndoToast();

    renderTasks();
    announceToScreenReader(`Restored task: "${task.title}".`);

    // Refocus on the checkbox of the restored item
    setTimeout(() => {
      const restoredItem = todoList.querySelector(`[data-id="${task.id}"]`);
      restoredItem?.querySelector('.todo-checkbox-btn')?.focus();
    }, 50);
  }

  // 6. Rendering Logic
  function renderTasks() {
    todoList.innerHTML = '';

    // Apply Filter & Search
    let filtered = tasks.filter(task => {
      // Completion status filter
      if (activeFilter === 'active' && task.completed) return false;
      if (activeFilter === 'completed' && !task.completed) return false;

      // Text search query filter
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery)) return false;

      return true;
    });

    // Apply Sorting
    filtered.sort((a, b) => {
      switch (activeSort) {
        case 'created-asc':
          return a.createdAt - b.createdAt;
        case 'created-desc':
          return b.createdAt - a.createdAt;
        case 'due-asc':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        case 'due-desc':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return b.dueDate.localeCompare(a.dueDate);
        case 'priority-desc':
          return priorityMap[b.priority] - priorityMap[a.priority];
        case 'priority-asc':
          return priorityMap[a.priority] - priorityMap[b.priority];
        default:
          return b.createdAt - a.createdAt;
      }
    });

    // Render Empty State if no tasks match
    if (filtered.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'todo-empty-state';
      emptyState.innerHTML = `
        <svg aria-hidden="true" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-.621-.504-1.125-1.125-1.125H9.75M8.25 21h8.25A2.25 2.25 0 0 0 18.75 18.75V5.25A2.25 2.25 0 0 0 16.5 3H7.5A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21Z"/>
        </svg>
        <h3>No tasks found</h3>
        <p>${searchQuery ? 'Try matching something else or clearing the search.' : 'Add your first task in the sidebar to get started!'}</p>
      `;
      todoList.appendChild(emptyState);
    } else {
      // Loop and Append task cards
      filtered.forEach(task => {
        const item = document.createElement('li');
        item.className = `todo-item ${task.completed ? 'completed' : ''}`;
        item.dataset.id = task.id;

        // Build Metadata Badges
        let badgeHtml = '';
        
        // Priority Badge
        badgeHtml += `
          <span class="todo-badge priority-${task.priority}" aria-label="Priority level: ${task.priority}">
            <svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"/>
            </svg>
            ${capitalize(task.priority)}
          </span>
        `;

        // Due Date Badge
        if (task.dueDate) {
          const isOverdue = checkIsOverdue(task.dueDate) && !task.completed;
          const formattedDate = formatDateString(task.dueDate);
          badgeHtml += `
            <span class="todo-badge due-date ${isOverdue ? 'overdue' : ''}" aria-label="Due date: ${formattedDate} ${isOverdue ? '(overdue)' : ''}">
              <svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h10.5A2.25 2.25 0 0 1 18 11.25v7.5"/>
              </svg>
              ${formattedDate}${isOverdue ? ' (Overdue)' : ''}
            </span>
          `;
        }

        item.innerHTML = `
          <!-- Checkbox status toggle -->
          <button class="todo-checkbox-btn ${task.completed ? 'checked' : ''}" 
                  role="checkbox" 
                  aria-checked="${task.completed ? 'true' : 'false'}" 
                  aria-label="Toggle completion status of: ${escapeHtml(task.title)}">
            <svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
            </svg>
          </button>
          
          <!-- Task Text Context -->
          <div class="todo-item-content">
            <span class="todo-item-title">${escapeHtml(task.title)}</span>
            <div class="todo-item-meta">
              ${badgeHtml}
            </div>
          </div>
          
          <!-- Actions Menu -->
          <div class="todo-item-actions">
            <button class="todo-action-btn btn-edit" aria-label="Edit task: ${escapeHtml(task.title)}" type="button">
              <svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"/>
              </svg>
            </button>
            <button class="todo-action-btn btn-delete" aria-label="Delete task: ${escapeHtml(task.title)}" type="button">
              <svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
              </svg>
            </button>
          </div>
        `;
        todoList.appendChild(item);
      });
    }

    updateProgressBar();
  }

  function updateProgressBar() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    progressText.innerText = `${completed} of ${total} tasks completed`;
    progressPercentage.innerText = `${percent}%`;
    progressFill.style.width = `${percent}%`;
  }

  // 7. Toast & Toast Undo Notifications
  let toastTimeout = null;

  function showUndoToast(taskTitle) {
    // Clear any active toasts
    hideUndoToast();

    const toast = document.createElement('div');
    toast.id = 'todo-toast';
    toast.className = 'todo-toast';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <span class="todo-toast-text">Deleted "${escapeHtml(taskTitle)}"</span>
      <button class="todo-toast-undo-btn" type="button">Undo</button>
    `;

    toastContainer.appendChild(toast);

    // Trigger transition
    setTimeout(() => toast.classList.add('show'), 10);

    // Undo button click
    toast.querySelector('.todo-toast-undo-btn').addEventListener('click', () => {
      undoDelete();
    });

    // Auto dismiss after 6 seconds
    toastTimeout = setTimeout(() => {
      hideUndoToast();
    }, 6000);
  }

  function hideUndoToast() {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
      toastTimeout = null;
    }
    const currentToast = document.getElementById('todo-toast');
    if (currentToast) {
      currentToast.classList.remove('show');
      currentToast.addEventListener('transitionend', () => {
        currentToast.remove();
      }, { once: true });
    }
    deletedTaskBackup = null;
  }

  // 8. Accessibility Announcement Region
  function announceToScreenReader(message) {
    if (!liveAnnouncer) return;
    liveAnnouncer.innerText = '';
    setTimeout(() => {
      liveAnnouncer.innerText = message;
    }, 100);
  }

  // 9. Utility Functions
  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getOffsetDateString(daysOffset) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  }

  function formatDateString(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    
    // Parse safely to avoid timezone shifts
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateObj = new Date(year, month, day);

    // Check if valid date
    if (isNaN(dateObj.getTime())) return dateStr;

    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return dateObj.toLocaleDateString('en-US', options);
  }

  function checkIsOverdue(dateStr) {
    if (!dateStr) return false;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return false;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const dueMidnight = new Date(year, month, day).getTime();
    
    // Get today's date at midnight
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    return dueMidnight < todayMidnight;
  }
});
