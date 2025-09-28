/**
 * Report Controller
 * Handles report generation and management
 */

const ReportService = require('../services/ReportService');
const CommitController = require('./CommitController');
const RepositoryController = require('./RepositoryController');
const Report = require('../models/Report');
const moment = require('moment');

class ReportController {
    constructor() {
        this.reportService = new ReportService();
        this.commitController = new CommitController();
        this.repositoryController = new RepositoryController();
    }

    /**
     * Generate a quick report
     * @param {string} repoUrl - Repository URL
     * @param {string} fromDate - Start date
     * @param {string} toDate - End date
     * @param {string} branch - Branch name
     * @param {string} format - Output format
     * @param {string} author - Author/committer filter (optional)
     * @returns {Promise<Object>} Report data
     */
    async generateQuickReport(repoUrl, fromDate, toDate, branch = 'main', format = 'text', author = null) {
        try {
            // Validate inputs
            if (!this.repositoryController.validateRepositoryUrl(repoUrl)) {
                throw new Error('Invalid repository URL');
            }

            if (!moment(fromDate, 'YYYY-MM-DD', true).isValid() || !moment(toDate, 'YYYY-MM-DD', true).isValid()) {
                throw new Error('Invalid date format. Use YYYY-MM-DD');
            }

            if (moment(fromDate).isAfter(moment(toDate))) {
                throw new Error('From date cannot be after to date');
            }

            // Get commits
            let commits = await this.commitController.getCommitsForDateRange(repoUrl, fromDate, toDate, branch);

            // Filter by author if specified
            if (author) {
                commits = this.filterCommitsByAuthor(commits, author);
            }

            if (commits.length === 0) {
                const authorText = author ? ` by ${author}` : '';
                return {
                    report: `No commits found for the date range ${fromDate} to ${toDate}${authorText}`,
                    filename: `no-commits-${fromDate}-to-${toDate}${author ? `-${author}` : ''}.txt`,
                    summary: {
                        totalCommits: 0,
                        totalAdditions: 0,
                        totalDeletions: 0,
                        netChanges: 0,
                        dateRange: `${fromDate} to ${toDate}`,
                        author: author || 'All contributors'
                    }
                };
            }

            // Generate report
            const dateRange = fromDate === toDate ? fromDate : `${fromDate} to ${toDate}`;
            const report = this.reportService.generateQuickReport(commits, dateRange, format);

            // Generate filename
            const filename = this.reportService.generateFilename('quick', dateRange, format);

            // Get statistics
            const statistics = this.reportService.getReportStatistics(commits);

            return {
                report,
                filename,
                summary: {
                    totalCommits: statistics.totalCommits,
                    totalAdditions: statistics.totalAdditions,
                    totalDeletions: statistics.totalDeletions,
                    netChanges: statistics.netChanges,
                    dateRange: `${fromDate} to ${toDate}`,
                    author: author || 'All contributors'
                }
            };

        } catch (error) {
            throw new Error(`Failed to generate quick report: ${error.message}`);
        }
    }

    /**
     * Generate an enhanced report with AI analysis
     * @param {string} repoUrl - Repository URL
     * @param {string} fromDate - Start date
     * @param {string} toDate - End date
     * @param {string} branch - Branch name
     * @param {string} format - Output format
     * @param {string} openaiKey - OpenAI API key
     * @param {string} author - Author/committer filter (optional)
     * @returns {Promise<Object>} Report data
     */
    async generateEnhancedReport(repoUrl, fromDate, toDate, branch = 'main', format = 'text', openaiKey = null, author = null) {
        try {
            // Validate inputs
            if (!this.repositoryController.validateRepositoryUrl(repoUrl)) {
                throw new Error('Invalid repository URL');
            }

            if (!moment(fromDate, 'YYYY-MM-DD', true).isValid() || !moment(toDate, 'YYYY-MM-DD', true).isValid()) {
                throw new Error('Invalid date format. Use YYYY-MM-DD');
            }

            if (moment(fromDate).isAfter(moment(toDate))) {
                throw new Error('From date cannot be after to date');
            }

            // Get commits
            let commits = await this.commitController.getCommitsForDateRange(repoUrl, fromDate, toDate, branch);

            // Filter by author if specified
            if (author) {
                commits = this.filterCommitsByAuthor(commits, author);
            }

            if (commits.length === 0) {
                const authorText = author ? ` by ${author}` : '';
                return {
                    report: `No commits found for the date range ${fromDate} to ${toDate}${authorText}`,
                    filename: `no-commits-${fromDate}-to-${toDate}${author ? `-${author}` : ''}.txt`,
                    summary: {
                        totalCommits: 0,
                        totalAdditions: 0,
                        totalDeletions: 0,
                        netChanges: 0,
                        dateRange: `${fromDate} to ${toDate}`,
                        author: author || 'All contributors',
                        aiAnalysis: false
                    }
                };
            }

            // Generate report with AI analysis
            const dateRange = fromDate === toDate ? fromDate : `${fromDate} to ${toDate}`;
            const report = await this.reportService.generateEnhancedReport(
                commits,
                dateRange,
                format,
                openaiKey ? (commit) => this.commitController.analyzeCommitsWithAI([commit]) : null
            );

            // Generate filename
            const filename = this.reportService.generateFilename('enhanced', dateRange, format);

            // Get statistics
            const statistics = this.reportService.getReportStatistics(commits);

            return {
                report,
                filename,
                summary: {
                    totalCommits: statistics.totalCommits,
                    totalAdditions: statistics.totalAdditions,
                    totalDeletions: statistics.totalDeletions,
                    netChanges: statistics.netChanges,
                    dateRange: `${fromDate} to ${toDate}`,
                    author: author || 'All contributors',
                    aiAnalysis: !!openaiKey
                }
            };

        } catch (error) {
            throw new Error(`Failed to generate enhanced report: ${error.message}`);
        }
    }

    /**
     * Filter commits by author/committer
     * @param {Array} commits - Array of commits
     * @param {string} author - Author/committer name to filter by
     * @returns {Array} Filtered commits
     */
    filterCommitsByAuthor(commits, author) {
        return commits.filter(commit => {
            const authorName = commit.author?.name || '';
            const committerName = commit.committer?.name || '';

            // Check if author or committer matches (case-insensitive)
            return authorName.toLowerCase().includes(author.toLowerCase()) ||
                committerName.toLowerCase().includes(author.toLowerCase());
        });
    }

    /**
     * Save report to file
     * @param {string} report - Report content
     * @param {string} filename - Output filename
     * @returns {Promise<string>} File path
     */
    async saveReport(report, filename) {
        try {
            return await this.reportService.saveReport(report, filename);
        } catch (error) {
            throw new Error(`Failed to save report: ${error.message}`);
        }
    }

    /**
     * Create a report model
     * @param {Object} data - Report data
     * @returns {Report} Report model
     */
    createReport(data) {
        return this.reportService.createReport(data);
    }

    /**
     * Get report statistics
     * @param {Array} commits - Array of commits
     * @returns {Object} Statistics
     */
    getReportStatistics(commits) {
        return this.reportService.getReportStatistics(commits);
    }

    /**
     * Generate report filename
     * @param {string} reportType - Type of report
     * @param {string} dateRange - Date range
     * @param {string} format - Output format
     * @returns {string} Filename
     */
    generateFilename(reportType, dateRange, format) {
        return this.reportService.generateFilename(reportType, dateRange, format);
    }

    /**
     * Get report summary
     * @param {string} repoUrl - Repository URL
     * @param {string} fromDate - Start date
     * @param {string} toDate - End date
     * @param {string} branch - Branch name
     * @returns {Promise<Object>} Report summary
     */
    async getReportSummary(repoUrl, fromDate, toDate, branch = 'main') {
        try {
            const commits = await this.commitController.getCommitsForDateRange(repoUrl, fromDate, toDate, branch);
            const statistics = this.commitController.getCommitStatistics(commits);

            return {
                dateRange: `${fromDate} to ${toDate}`,
                repository: repoUrl,
                branch: branch,
                statistics: statistics,
                hasCommits: commits.length > 0
            };
        } catch (error) {
            throw new Error(`Failed to get report summary: ${error.message}`);
        }
    }

    /**
     * Generate report for a specific date
     * @param {string} repoUrl - Repository URL
     * @param {string} date - Target date
     * @param {string} branch - Branch name
     * @param {string} format - Output format
     * @param {boolean} useAI - Whether to use AI analysis
     * @returns {Promise<Object>} Report data
     */
    async generateReportForDate(repoUrl, date, branch = 'main', format = 'text', useAI = false) {
        try {
            if (useAI) {
                return await this.generateEnhancedReport(repoUrl, date, date, branch, format);
            } else {
                return await this.generateQuickReport(repoUrl, date, date, branch, format);
            }
        } catch (error) {
            throw new Error(`Failed to generate report for date: ${error.message}`);
        }
    }

    /**
     * Generate multiple reports for a date range
     * @param {string} repoUrl - Repository URL
     * @param {string} fromDate - Start date
     * @param {string} toDate - End date
     * @param {string} branch - Branch name
     * @param {string} format - Output format
     * @param {boolean} useAI - Whether to use AI analysis
     * @returns {Promise<Array>} Array of reports
     */
    async generateMultipleReports(repoUrl, fromDate, toDate, branch = 'main', format = 'text', useAI = false) {
        try {
            const reports = [];
            const currentDate = moment(fromDate);
            const endDate = moment(toDate);

            while (currentDate.isSameOrBefore(endDate)) {
                const dateStr = currentDate.format('YYYY-MM-DD');
                const report = await this.generateReportForDate(repoUrl, dateStr, branch, format, useAI);
                reports.push({
                    date: dateStr,
                    ...report
                });
                currentDate.add(1, 'day');
            }

            return reports;
        } catch (error) {
            throw new Error(`Failed to generate multiple reports: ${error.message}`);
        }
    }
}

module.exports = ReportController;
