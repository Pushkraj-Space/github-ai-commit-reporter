/**
 * Commit Model
 * Represents a Git commit with all its properties and methods
 */

class Commit {
    constructor(data = {}) {
        this.sha = data.sha || '';
        this.message = data.message || '';
        this.author = {
            name: data.author?.name || '',
            email: data.author?.email || '',
            date: data.author?.date || ''
        };
        this.committer = {
            name: data.committer?.name || '',
            email: data.committer?.email || '',
            date: data.committer?.date || ''
        };
        this.files = data.files || [];
        this.stats = {
            total: data.stats?.total || 0,
            additions: data.stats?.additions || 0,
            deletions: data.stats?.deletions || 0
        };
    }

    /**
     * Get formatted author date
     * @returns {string} Formatted date string
     */
    getFormattedDate() {
        const moment = require('moment');
        return moment(this.author.date).format('HH:mm:ss');
    }

    /**
     * Get formatted author date for display
     * @returns {string} Formatted date string
     */
    getDisplayDate() {
        const moment = require('moment');
        return moment(this.author.date).format('Do MMMM YYYY');
    }

    /**
     * Get net changes (additions - deletions)
     * @returns {number} Net changes
     */
    getNetChanges() {
        return this.stats.additions - this.stats.deletions;
    }

    /**
     * Get total file changes
     * @returns {number} Total file changes
     */
    getTotalFileChanges() {
        return this.files.reduce((total, file) => total + (file.changes || 0), 0);
    }

    /**
     * Get files by status
     * @param {string} status - File status (added, modified, removed, renamed)
     * @returns {Array} Files with the specified status
     */
    getFilesByStatus(status) {
        return this.files.filter(file => file.status === status);
    }

    /**
     * Get commit summary
     * @returns {Object} Commit summary
     */
    getSummary() {
        return {
            sha: this.sha,
            message: this.message,
            author: this.author.name,
            date: this.getFormattedDate(),
            changes: {
                additions: this.stats.additions,
                deletions: this.stats.deletions,
                net: this.getNetChanges(),
                total: this.stats.total
            },
            files: {
                total: this.files.length,
                added: this.getFilesByStatus('added').length,
                modified: this.getFilesByStatus('modified').length,
                removed: this.getFilesByStatus('removed').length,
                renamed: this.getFilesByStatus('renamed').length
            }
        };
    }

    /**
     * Validate commit data
     * @returns {boolean} True if valid
     */
    isValid() {
        return !!(this.sha && this.message && this.author.name);
    }

    /**
     * Convert to JSON
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            sha: this.sha,
            message: this.message,
            author: this.author,
            committer: this.committer,
            files: this.files,
            stats: this.stats
        };
    }
}

module.exports = Commit;
