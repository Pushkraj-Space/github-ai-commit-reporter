/**
 * Repository Model
 * Represents a GitHub repository with its properties and methods
 */

class Repository {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.fullName = data.full_name || data.fullName || '';
        this.owner = data.owner || '';
        this.description = data.description || '';
        this.private = data.private || false;
        this.htmlUrl = data.html_url || data.htmlUrl || '';
        this.defaultBranch = data.default_branch || data.defaultBranch || 'main';
        this.updatedAt = data.updated_at || data.updatedAt || '';
        this.cloneUrl = data.clone_url || data.cloneUrl || '';
        this.sshUrl = data.ssh_url || data.sshUrl || '';
    }

    /**
     * Extract owner and repo from full name
     * @returns {Object} {owner, repo}
     */
    getOwnerAndRepo() {
        const parts = this.fullName.split('/');
        return {
            owner: parts[0] || this.owner,
            repo: parts[1] || this.name
        };
    }

    /**
     * Get repository URL in different formats
     * @returns {Object} URLs in different formats
     */
    getUrls() {
        const { owner, repo } = this.getOwnerAndRepo();
        return {
            https: `https://github.com/${owner}/${repo}`,
            ssh: `git@github.com:${owner}/${repo}.git`,
            api: `https://api.github.com/repos/${owner}/${repo}`
        };
    }

    /**
     * Check if repository is accessible
     * @returns {boolean} True if accessible
     */
    isAccessible() {
        return !!(this.id && this.name && this.owner);
    }

    /**
     * Get repository display name
     * @returns {string} Display name
     */
    getDisplayName() {
        return this.fullName || `${this.owner}/${this.name}`;
    }

    /**
     * Get repository description or default
     * @returns {string} Description
     */
    getDescription() {
        return this.description || 'No description available';
    }

    /**
     * Get last updated date
     * @returns {string} Formatted date
     */
    getLastUpdated() {
        const moment = require('moment');
        return moment(this.updatedAt).format('MMMM Do YYYY, h:mm:ss a');
    }

    /**
     * Validate repository data
     * @returns {boolean} True if valid
     */
    isValid() {
        return !!(this.name && this.owner);
    }

    /**
     * Convert to JSON
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            full_name: this.fullName,
            owner: this.owner,
            description: this.description,
            private: this.private,
            html_url: this.htmlUrl,
            default_branch: this.defaultBranch,
            updated_at: this.updatedAt,
            clone_url: this.cloneUrl,
            ssh_url: this.sshUrl
        };
    }
}

module.exports = Repository;
