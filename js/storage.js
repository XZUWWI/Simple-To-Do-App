/**
 * Storage module for handling localStorage operations
 */
export class TaskStorage {
    constructor() {
        this.storageKey = 'todo-tasks';
    }

    /**
     * Save tasks to localStorage
     * @param {Array} tasks - Array of task objects
     */
    saveTasks(tasks) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(tasks));
        } catch (error) {
            console.error('Error saving tasks to localStorage:', error);
        }
    }

    /**
     * Load tasks from localStorage
     * @returns {Array} Array of task objects
     */
    loadTasks() {
        try {
            const tasks = localStorage.getItem(this.storageKey);
            return tasks ? JSON.parse(tasks) : [];
        } catch (error) {
            console.error('Error loading tasks from localStorage:', error);
            return [];
        }
    }

    /**
     * Clear all tasks from localStorage
     */
    clearTasks() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.error('Error clearing tasks from localStorage:', error);
        }
    }

    /**
     * Get storage usage information
     * @returns {Object} Storage usage info
     */
    getStorageInfo() {
        try {
            const tasks = this.loadTasks();
            const dataSize = JSON.stringify(tasks).length;
            return {
                taskCount: tasks.length,
                dataSize: dataSize,
                dataSizeKB: (dataSize / 1024).toFixed(2)
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return { taskCount: 0, dataSize: 0, dataSizeKB: '0.00' };
        }
    }
} 