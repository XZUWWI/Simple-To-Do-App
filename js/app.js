/**
 * Main application module
 */
console.log('App.js loading...');

import { TaskStorage } from './storage.js';
import { TaskModel } from './taskModel.js';
import { UIRenderer } from './uiRenderer.js';

class TodoApp {
    constructor() {
        this.storage = new TaskStorage();
        this.ui = new UIRenderer();
        this.tasks = [];
        this.currentFilter = '';
        this.currentSort = 'created';
        this.isDarkMode = this.loadDarkModePreference();
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        console.log('Initializing TodoApp...');
        
        // Load tasks from storage
        this.tasks = this.storage.loadTasks();
        console.log('Loaded tasks:', this.tasks);
        
        // Set up dark mode
        this.ui.toggleDarkMode(this.isDarkMode);
        console.log('Dark mode set to:', this.isDarkMode);
        
        // Add event listeners
        this.ui.addEventListeners({
            onTaskSubmit: this.handleTaskSubmit.bind(this),
            onTaskToggle: this.handleTaskToggle.bind(this),
            onTaskEdit: this.handleTaskEdit.bind(this),
            onTaskDelete: this.handleTaskDelete.bind(this),
            onEditSubmit: this.handleEditSubmit.bind(this),
            onTagFilterChange: this.handleTagFilterChange.bind(this),
            onSortChange: this.handleSortChange.bind(this),
            onClearCompleted: this.handleClearCompleted.bind(this),
            onDarkModeToggle: this.handleDarkModeToggle.bind(this)
        });
        console.log('Event listeners added');

        // Initial render
        this.render();
        
        // Set default due date to today
        const today = new Date().toISOString().split('T')[0];
        this.ui.elements.dueDateInput.value = today;
        console.log('App initialized successfully');
    }

    /**
     * Handle task form submission
     * @param {Event} e - Form submit event
     */
    handleTaskSubmit(e) {
        console.log('Task submit handler called');
        e.preventDefault();
        
        const formData = this.ui.getFormData();
        console.log('Form data:', formData);
        
        const validation = TaskModel.validateTask(formData);
        console.log('Validation result:', validation);
        
        if (!validation.isValid) {
            this.ui.showNotification(validation.errors.join(', '), 'error');
            return;
        }

        const newTask = TaskModel.createTask(
            formData.text,
            formData.dueDate,
            formData.tags
        );
        console.log('Created new task:', newTask);

        this.tasks.unshift(newTask);
        this.saveAndRender();
        this.ui.clearTaskForm();
        this.ui.showNotification('Task added successfully!');
    }

    /**
     * Handle task completion toggle
     * @param {string} taskId - Task ID
     * @param {boolean} completed - Completion status
     */
    handleTaskToggle(taskId, completed) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = completed;
            task.priority = TaskModel.calculatePriority(task.dueDate);
            this.saveAndRender();
            
            const message = completed ? 'Task completed!' : 'Task marked as pending';
            this.ui.showNotification(message);
        }
    }

    /**
     * Handle task edit request
     * @param {string} taskId - Task ID
     */
    handleTaskEdit(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.ui.showEditModal(task);
        }
    }

    /**
     * Handle task deletion
     * @param {string} taskId - Task ID
     */
    handleTaskDelete(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveAndRender();
            this.ui.showNotification('Task deleted successfully!');
        }
    }

    /**
     * Handle edit form submission
     * @param {Event} e - Form submit event
     */
    handleEditSubmit(e) {
        e.preventDefault();
        
        const taskId = this.ui.elements.editModal.dataset.taskId;
        const task = this.tasks.find(t => t.id === taskId);
        
        if (!task) {
            this.ui.hideEditModal();
            return;
        }

        const formData = this.ui.getEditFormData();
        const validation = TaskModel.validateTask(formData);
        
        if (!validation.isValid) {
            this.ui.showNotification(validation.errors.join(', '), 'error');
            return;
        }

        // Update task
        task.text = formData.text.trim();
        task.dueDate = formData.dueDate;
        task.tags = TaskModel.parseTags(formData.tags);
        task.priority = TaskModel.calculatePriority(formData.dueDate);

        this.saveAndRender();
        this.ui.hideEditModal();
        this.ui.showNotification('Task updated successfully!');
    }

    /**
     * Handle tag filter change
     * @param {Event} e - Change event
     */
    handleTagFilterChange(e) {
        this.currentFilter = e.target.value;
        this.render();
    }

    /**
     * Handle sort change
     * @param {Event} e - Change event
     */
    handleSortChange(e) {
        this.currentSort = e.target.value;
        this.render();
    }

    /**
     * Handle clear completed tasks
     */
    handleClearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        
        if (completedCount === 0) {
            this.ui.showNotification('No completed tasks to clear', 'warning');
            return;
        }

        if (confirm(`Are you sure you want to delete ${completedCount} completed task${completedCount !== 1 ? 's' : ''}?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveAndRender();
            this.ui.showNotification(`${completedCount} completed task${completedCount !== 1 ? 's' : ''} cleared!`);
        }
    }

    /**
     * Handle dark mode toggle
     */
    handleDarkModeToggle() {
        console.log('Dark mode toggle handler called');
        this.isDarkMode = !this.isDarkMode;
        console.log('Dark mode toggled to:', this.isDarkMode);
        this.ui.toggleDarkMode(this.isDarkMode);
        this.saveDarkModePreference();
        this.ui.showNotification(
            this.isDarkMode ? 'Dark mode enabled' : 'Light mode enabled',
            'success'
        );
    }

    /**
     * Get filtered and sorted tasks
     * @returns {Array} Filtered and sorted tasks
     */
    getFilteredTasks() {
        let filteredTasks = this.tasks;
        
        // Apply tag filter
        if (this.currentFilter) {
            filteredTasks = TaskModel.filterTasksByTag(filteredTasks, this.currentFilter);
        }
        
        // Apply sorting
        filteredTasks = TaskModel.sortTasks(filteredTasks, this.currentSort);
        
        return filteredTasks;
    }

    /**
     * Render the application
     */
    render() {
        const filteredTasks = this.getFilteredTasks();
        
        // Update UI
        this.ui.renderTasks(filteredTasks);
        this.ui.updateTaskCount(this.tasks.length);
        this.ui.updateTagFilter(TaskModel.getAllTags(this.tasks));
        
        // Log statistics
        const stats = TaskModel.getTaskStats(this.tasks);
        console.log('Task Statistics:', stats);
    }

    /**
     * Save tasks and re-render
     */
    saveAndRender() {
        this.storage.saveTasks(this.tasks);
        this.render();
    }

    /**
     * Load dark mode preference from localStorage
     * @returns {boolean} Dark mode preference
     */
    loadDarkModePreference() {
        try {
            const saved = localStorage.getItem('todo-dark-mode');
            return saved ? JSON.parse(saved) : false;
        } catch (error) {
            console.error('Error loading dark mode preference:', error);
            return false;
        }
    }

    /**
     * Save dark mode preference to localStorage
     */
    saveDarkModePreference() {
        try {
            localStorage.setItem('todo-dark-mode', JSON.stringify(this.isDarkMode));
        } catch (error) {
            console.error('Error saving dark mode preference:', error);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    new TodoApp();
});

console.log('App.js loaded, waiting for DOM...'); 