/**
 * Report Model
 * Represents a commit report with its properties and methods
 */

class Report {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.title = data.title || '';
        this.dateRange = {
            from: data.dateRange?.from || '',
            to: data.dateRange?.to || ''
        };
        this.repository = data.repository || null;
        this.commits = data.commits || [];
        this.summary = {
            totalCommits: data.summary?.totalCommits || 0,
            totalAdditions: data.summary?.totalAdditions || 0,
            totalDeletions: data.summary?.totalDeletions || 0,
            netChanges: data.summary?.netChanges || 0
        };
        this.format = data.format || 'text';
        this.content = data.content || '';
        this.createdAt = data.createdAt || new Date().toISOString();
        this.reportType = data.reportType || 'quick';
        this.aiAnalysis = data.aiAnalysis || false;
    }

    /**
     * Generate unique ID for report
     * @returns {string} Unique ID
     */
    generateId() {
        return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Calculate summary statistics
     */
    calculateSummary() {
        this.summary.totalCommits = this.commits.length;
        this.summary.totalAdditions = this.commits.reduce((sum, commit) => sum + commit.stats.additions, 0);
        this.summary.totalDeletions = this.commits.reduce((sum, commit) => sum + commit.stats.deletions, 0);
        this.summary.netChanges = this.summary.totalAdditions - this.summary.totalDeletions;
    }

    /**
     * Get formatted date range
     * @returns {string} Formatted date range
     */
    getFormattedDateRange() {
        const moment = require('moment');
        const fromDate = moment(this.dateRange.from).format('Do MMMM YYYY');
        const toDate = moment(this.dateRange.to).format('Do MMMM YYYY');

        if (this.dateRange.from === this.dateRange.to) {
            return fromDate;
        }
        return `${fromDate} to ${toDate}`;
    }

    /**
     * Get report title
     * @returns {string} Report title
     */
    getTitle() {
        if (this.title) {
            return this.title;
        }

        const dateRange = this.getFormattedDateRange();
        return `Commit Report for ${dateRange}`;
    }

    /**
     * Get commits by author
     * @param {string} authorName - Author name
     * @returns {Array} Commits by author
     */
    getCommitsByAuthor(authorName) {
        return this.commits.filter(commit => commit.author.name === authorName);
    }

    /**
     * Get commits by date
     * @param {string} date - Date in YYYY-MM-DD format
     * @returns {Array} Commits for the date
     */
    getCommitsByDate(date) {
        const moment = require('moment');
        return this.commits.filter(commit => {
            const commitDate = moment(commit.author.date).format('YYYY-MM-DD');
            return commitDate === date;
        });
    }

    /**
     * Get top contributors
     * @param {number} limit - Number of top contributors
     * @returns {Array} Top contributors
     */
    getTopContributors(limit = 5) {
        const contributors = {};

        this.commits.forEach(commit => {
            const author = commit.author.name;
            if (!contributors[author]) {
                contributors[author] = {
                    name: author,
                    email: commit.author.email,
                    commits: 0,
                    additions: 0,
                    deletions: 0
                };
            }

            contributors[author].commits++;
            contributors[author].additions += commit.stats.additions;
            contributors[author].deletions += commit.stats.deletions;
        });

        return Object.values(contributors)
            .sort((a, b) => b.commits - a.commits)
            .slice(0, limit);
    }

    /**
     * Get file statistics
     * @returns {Object} File statistics
     */
    getFileStatistics() {
        const fileStats = {};

        this.commits.forEach(commit => {
            commit.files.forEach(file => {
                if (!fileStats[file.filename]) {
                    fileStats[file.filename] = {
                        filename: file.filename,
                        changes: 0,
                        additions: 0,
                        deletions: 0,
                        commits: 0
                    };
                }

                fileStats[file.filename].changes += file.changes || 0;
                fileStats[file.filename].additions += file.additions || 0;
                fileStats[file.filename].deletions += file.deletions || 0;
                fileStats[file.filename].commits++;
            });
        });

        return Object.values(fileStats)
            .sort((a, b) => b.changes - a.changes);
    }

    /**
     * Validate report data
     * @returns {boolean} True if valid
     */
    isValid() {
        return !!(this.dateRange.from && this.dateRange.to && this.repository);
    }

    /**
     * Convert to JSON
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            dateRange: this.dateRange,
            repository: this.repository,
            commits: this.commits,
            summary: this.summary,
            format: this.format,
            content: this.content,
            createdAt: this.createdAt,
            reportType: this.reportType,
            aiAnalysis: this.aiAnalysis
        };
    }
}

module.exports = Report;
