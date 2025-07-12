/**
 * UI Renderer module for handling DOM manipulation
 */
import { TaskModel } from './taskModel.js';

export class UIRenderer {
    constructor() {
        console.log('Initializing UIRenderer...');
        this.elements = {
            taskForm: document.getElementById('taskForm'),
            taskInput: document.getElementById('taskInput'),
            dueDateInput: document.getElementById('dueDateInput'),
            tagsInput: document.getElementById('tagsInput'),
            tasksList: document.getElementById('tasksList'),
            taskCount: document.getElementById('taskCount'),
            tagFilter: document.getElementById('tagFilter'),
            sortBy: document.getElementById('sortBy'),
            clearCompleted: document.getElementById('clearCompleted'),
            editModal: document.getElementById('editModal'),
            editForm: document.getElementById('editForm'),
            editTaskText: document.getElementById('editTaskText'),
            editDueDate: document.getElementById('editDueDate'),
            editTags: document.getElementById('editTags'),
            closeModal: document.getElementById('closeModal'),
            cancelEdit: document.getElementById('cancelEdit'),
            darkModeToggle: document.getElementById('darkModeToggle')
        };
        
        // Check if all elements were found
        const missingElements = Object.entries(this.elements)
            .filter(([name, element]) => !element)
            .map(([name]) => name);
            
        if (missingElements.length > 0) {
            console.error('Missing elements:', missingElements);
        } else {
            console.log('All UI elements found successfully');
        }
    }

    /**
     * Render tasks list
     * @param {Array} tasks - Array of tasks to render
     */
    renderTasks(tasks) {
        if (tasks.length === 0) {
            this.renderEmptyState();
            return;
        }

        this.elements.tasksList.innerHTML = tasks.map(task => this.createTaskHTML(task)).join('');
    }

    /**
     * Create HTML for a single task
     * @param {Object} task - Task object
     * @returns {string} HTML string
     */
    createTaskHTML(task) {
        const dueDateStatus = TaskModel.getDueDateStatus(task.dueDate);
        const formattedDate = TaskModel.formatDate(task.dueDate);
        
        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-content">
                    <div class="task-text">${this.escapeHtml(task.text)}</div>
                    <div class="task-meta">
                        ${task.dueDate ? `
                            <div class="task-due-date ${dueDateStatus.class}">
                                <i class="fas fa-calendar"></i>
                                <span>${formattedDate} - ${dueDateStatus.text}</span>
                            </div>
                        ` : ''}
                        ${task.tags.length > 0 ? `
                            <div class="task-tags">
                                ${task.tags.map(tag => `
                                    <span class="task-tag">${this.escapeHtml(tag)}</span>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-btn edit-btn" title="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-btn delete-btn" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render empty state when no tasks
     */
    renderEmptyState() {
        this.elements.tasksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>No tasks yet</h3>
                <p>Add your first task to get started!</p>
            </div>
        `;
    }

    /**
     * Update task count display
     * @param {number} count - Number of tasks
     */
    updateTaskCount(count) {
        this.elements.taskCount.textContent = `(${count})`;
    }

    /**
     * Update tag filter options
     * @param {Array} tags - Array of available tags
     */
    updateTagFilter(tags) {
        const currentValue = this.elements.tagFilter.value;
        
        // Keep "All tags" option and add new tags
        this.elements.tagFilter.innerHTML = `
            <option value="">All tags</option>
            ${tags.map(tag => `
                <option value="${this.escapeHtml(tag)}" ${currentValue === tag ? 'selected' : ''}>
                    ${this.escapeHtml(tag)}
                </option>
            `).join('')}
        `;
    }

    /**
     * Show edit modal with task data
     * @param {Object} task - Task object to edit
     */
    showEditModal(task) {
        this.elements.editTaskText.value = task.text;
        this.elements.editDueDate.value = task.dueDate || '';
        this.elements.editTags.value = task.tags.join(' ');
        this.elements.editModal.style.display = 'block';
        
        // Store task ID for reference
        this.elements.editModal.dataset.taskId = task.id;
        
        // Focus on first input
        this.elements.editTaskText.focus();
    }

    /**
     * Hide edit modal
     */
    hideEditModal() {
        this.elements.editModal.style.display = 'none';
        this.elements.editForm.reset();
        delete this.elements.editModal.dataset.taskId;
    }

    /**
     * Get current form data
     * @returns {Object} Form data object
     */
    getFormData() {
        return {
            text: this.elements.taskInput.value,
            dueDate: this.elements.dueDateInput.value,
            tags: this.elements.tagsInput.value
        };
    }

    /**
     * Get edit form data
     * @returns {Object} Edit form data object
     */
    getEditFormData() {
        return {
            text: this.elements.editTaskText.value,
            dueDate: this.elements.editDueDate.value,
            tags: this.elements.editTags.value
        };
    }

    /**
     * Clear task input form
     */
    clearTaskForm() {
        this.elements.taskForm.reset();
        this.elements.taskInput.focus();
    }

    /**
     * Show notification message
     * @param {string} message - Message to show
     * @param {string} type - Message type (success, error, warning)
     */
    showNotification(message, type = 'success') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Set background color based on type
        const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b';
        notification.style.backgroundColor = bgColor;
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${this.escapeHtml(message)}</span>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add to DOM
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
    }

    /**
     * Toggle dark mode
     * @param {boolean} isDark - Whether dark mode is enabled
     */
    toggleDarkMode(isDark) {
        console.log('toggleDarkMode called with:', isDark);
        
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            this.elements.darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            console.log('Dark mode enabled, data-theme set to dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            this.elements.darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            console.log('Dark mode disabled, data-theme removed');
        }
        
        // Verify the attribute was set/removed
        console.log('Current data-theme attribute:', document.documentElement.getAttribute('data-theme'));
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Add event listeners for UI interactions
     * @param {Object} handlers - Event handler functions
     */
    addEventListeners(handlers) {
        // Task form submission
        this.elements.taskForm.addEventListener('submit', handlers.onTaskSubmit);

        // Task list interactions
        this.elements.tasksList.addEventListener('click', (e) => {
            const taskItem = e.target.closest('.task-item');
            if (!taskItem) return;

            const taskId = taskItem.dataset.taskId;

            if (e.target.classList.contains('task-checkbox')) {
                handlers.onTaskToggle(taskId, e.target.checked);
            } else if (e.target.closest('.edit-btn')) {
                handlers.onTaskEdit(taskId);
            } else if (e.target.closest('.delete-btn')) {
                handlers.onTaskDelete(taskId);
            }
        });

        // Filter and sort controls
        this.elements.tagFilter.addEventListener('change', handlers.onTagFilterChange);
        this.elements.sortBy.addEventListener('change', handlers.onSortChange);
        this.elements.clearCompleted.addEventListener('click', handlers.onClearCompleted);

        // Modal interactions
        this.elements.closeModal.addEventListener('click', () => this.hideEditModal());
        this.elements.cancelEdit.addEventListener('click', () => this.hideEditModal());
        this.elements.editForm.addEventListener('submit', handlers.onEditSubmit);

        // Close modal when clicking outside
        this.elements.editModal.addEventListener('click', (e) => {
            if (e.target === this.elements.editModal) {
                this.hideEditModal();
            }
        });

        // Dark mode toggle
        if (this.elements.darkModeToggle) {
            this.elements.darkModeToggle.addEventListener('click', handlers.onDarkModeToggle);
            console.log('Dark mode toggle event listener added');
        } else {
            console.error('Dark mode toggle button not found!');
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Enter':
                        if (document.activeElement === this.elements.taskInput) {
                            e.preventDefault();
                            this.elements.taskForm.dispatchEvent(new Event('submit'));
                        }
                        break;
                    case 'Escape':
                        if (this.elements.editModal.style.display === 'block') {
                            this.hideEditModal();
                        }
                        break;
                }
            }
        });
    }
} 