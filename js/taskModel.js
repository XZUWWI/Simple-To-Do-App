/**
 * Task model and utility functions
 */
export class TaskModel {
    /**
     * Create a new task object
     * @param {string} text - Task text
     * @param {string} dueDate - Due date (optional)
     * @param {string} tags - Tags string (optional)
     * @returns {Object} Task object
     */
    static createTask(text, dueDate = '', tags = '') {
        return {
            id: this.generateId(),
            text: text.trim(),
            completed: false,
            dueDate: dueDate,
            tags: this.parseTags(tags),
            createdAt: new Date().toISOString(),
            priority: this.calculatePriority(dueDate)
        };
    }

    /**
     * Generate unique ID for task
     * @returns {string} Unique ID
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Parse tags from string input
     * @param {string} tagsString - Tags as string (e.g., "#work #urgent")
     * @returns {Array} Array of unique tags
     */
    static parseTags(tagsString) {
        if (!tagsString || typeof tagsString !== 'string') return [];
        
        const tags = tagsString
            .split(/\s+/)
            .filter(tag => tag.startsWith('#'))
            .map(tag => tag.toLowerCase())
            .filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates
        
        return tags;
    }

    /**
     * Calculate task priority based on due date
     * @param {string} dueDate - Due date string
     * @returns {string} Priority level
     */
    static calculatePriority(dueDate) {
        if (!dueDate) return 'low';
        
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'overdue';
        if (diffDays <= 1) return 'high';
        if (diffDays <= 3) return 'medium';
        return 'low';
    }

    /**
     * Get due date status for display
     * @param {string} dueDate - Due date string
     * @returns {Object} Status object with class and text
     */
    static getDueDateStatus(dueDate) {
        if (!dueDate) return { class: '', text: '' };
        
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return { 
                class: 'overdue', 
                text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}` 
            };
        } else if (diffDays === 0) {
            return { class: 'due-soon', text: 'Due today' };
        } else if (diffDays === 1) {
            return { class: 'due-soon', text: 'Due tomorrow' };
        } else if (diffDays <= 3) {
            return { class: 'due-soon', text: `Due in ${diffDays} days` };
        } else {
            return { class: '', text: `Due ${diffDays} days` };
        }
    }

    /**
     * Format date for display
     * @param {string} dateString - Date string
     * @returns {string} Formatted date
     */
    static formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Validate task data
     * @param {Object} taskData - Task data to validate
     * @returns {Object} Validation result
     */
    static validateTask(taskData) {
        const errors = [];
        
        if (!taskData.text || taskData.text.trim().length === 0) {
            errors.push('Task text is required');
        }
        
        if (taskData.text && taskData.text.trim().length > 500) {
            errors.push('Task text must be less than 500 characters');
        }
        
        if (taskData.dueDate) {
            const dueDate = new Date(taskData.dueDate);
            if (isNaN(dueDate.getTime())) {
                errors.push('Invalid due date format');
            }
        }
        
        if (taskData.tags && taskData.tags.length > 10) {
            errors.push('Maximum 10 tags allowed');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Sort tasks by different criteria
     * @param {Array} tasks - Array of tasks
     * @param {string} sortBy - Sort criteria
     * @returns {Array} Sorted tasks
     */
    static sortTasks(tasks, sortBy = 'created') {
        const sortedTasks = [...tasks];
        
        switch (sortBy) {
            case 'dueDate':
                return sortedTasks.sort((a, b) => {
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
            
            case 'priority':
                const priorityOrder = { 'overdue': 0, 'high': 1, 'medium': 2, 'low': 3 };
                return sortedTasks.sort((a, b) => {
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                });
            
            case 'created':
            default:
                return sortedTasks.sort((a, b) => {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
        }
    }

    /**
     * Filter tasks by tag
     * @param {Array} tasks - Array of tasks
     * @param {string} tagFilter - Tag to filter by
     * @returns {Array} Filtered tasks
     */
    static filterTasksByTag(tasks, tagFilter) {
        if (!tagFilter) return tasks;
        
        return tasks.filter(task => 
            task.tags.some(tag => tag.toLowerCase() === tagFilter.toLowerCase())
        );
    }

    /**
     * Get all unique tags from tasks
     * @param {Array} tasks - Array of tasks
     * @returns {Array} Array of unique tags
     */
    static getAllTags(tasks) {
        const allTags = tasks.flatMap(task => task.tags);
        return [...new Set(allTags)].sort();
    }

    /**
     * Get task statistics
     * @param {Array} tasks - Array of tasks
     * @returns {Object} Statistics object
     */
    static getTaskStats(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const pending = total - completed;
        const overdue = tasks.filter(task => 
            task.dueDate && !task.completed && 
            new Date(task.dueDate) < new Date()
        ).length;
        
        return {
            total,
            completed,
            pending,
            overdue,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }
} 