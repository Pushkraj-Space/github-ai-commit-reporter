/**
 * Commit Controller
 * Handles commit-related operations
 */

const GitHubService = require('../services/GitHubService');
const AIAnalysisService = require('../services/AIAnalysisService');
const ReportService = require('../services/ReportService');
const Commit = require('../models/Commit');
const Report = require('../models/Report');

class CommitController {
    constructor() {
        this.githubService = new GitHubService();
        this.aiAnalysisService = new AIAnalysisService();
        this.reportService = new ReportService();
    }

    /**
     * Get commits for a specific date
     * @param {string} repoUrl - Repository URL
     * @param {string} date - Target date
     * @param {string} branch - Branch name
     * @returns {Promise<Array>} Array of commits
     */
    async getCommitsForDate(repoUrl, date, branch = 'main') {
        try {
            const { owner, repo } = this.githubService.extractRepoInfo(repoUrl);
            const commits = await this.githubService.getCommitsForDate(owner, repo, date, branch);

            return commits.map(commitData => new Commit(commitData));
        } catch (error) {
            throw new Error(`Failed to get commits for date: ${error.message}`);
        }
    }

    /**
     * Get commits for a date range
     * @param {string} repoUrl - Repository URL
     * @param {string} fromDate - Start date
     * @param {string} toDate - End date
     * @param {string} branch - Branch name
     * @returns {Promise<Array>} Array of commits
     */
    async getCommitsForDateRange(repoUrl, fromDate, toDate, branch = 'main') {
        try {
            const { owner, repo } = this.githubService.extractRepoInfo(repoUrl);
            const commits = await this.githubService.getCommitsForDateRange(owner, repo, fromDate, toDate, branch);

            return commits.map(commitData => new Commit(commitData));
        } catch (error) {
            throw new Error(`Failed to get commits for date range: ${error.message}`);
        }
    }

    /**
     * Get all commits for a repository
     * @param {string} repoUrl - Repository URL
     * @param {string} branch - Branch name
     * @returns {Promise<Array>} Array of commits
     */
    async getAllCommits(repoUrl, branch = 'main') {
        try {
            const { owner, repo } = this.githubService.extractRepoInfo(repoUrl);
            const commits = await this.githubService.getCommits(owner, repo, { branch });

            return commits.map(commitData => new Commit(commitData));
        } catch (error) {
            throw new Error(`Failed to get all commits: ${error.message}`);
        }
    }

    /**
     * Filter commits by date
     * @param {Array} commits - Array of commits
     * @param {string} targetDate - Target date
     * @returns {Array} Filtered commits
     */
    filterCommitsByDate(commits, targetDate) {
        const moment = require('moment');
        return commits.filter(commit => {
            const commitDate = moment(commit.author.date).format('YYYY-MM-DD');
            return commitDate === targetDate;
        });
    }

    /**
     * Get contributors (authors/committers) for a repository
     * @param {string} repoUrl - Repository URL
     * @param {string} branch - Branch name
     * @returns {Promise<Array>} Array of contributors
     */
    async getRepositoryContributors(repoUrl, branch = 'main') {
        try {
            const { owner, repo } = this.githubService.extractRepoInfo(repoUrl);
            const contributors = await this.githubService.getRepositoryContributors(owner, repo);
            // Also get recent commits to get more contributors
            // const commits = await this.githubService.getCommits(owner, repo, { branch, per_page: 100 });

            const contributorMap = new Map();

            // Add GitHub API contributors
            contributors.forEach(contributor => {
                contributorMap.set(contributor.login, {
                    login: contributor.login,
                    name: contributor.name || contributor.login,
                    email: contributor.email || '',
                    avatar_url: contributor.avatar_url,
                    contributions: contributor.contributions,
                    type: 'github_contributor'
                });
            });

            // Add commit authors/committers
            // commits.forEach(commit => {
            //     const author = commit.commit.author;
            //     const committer = commit.commit.committer;

            //     // Add author if not already in map
            //     if (author && author.name && !contributorMap.has(author.name)) {
            //         contributorMap.set(author.name, {
            //             login: author.name,
            //             name: author.name,
            //             email: author.email || '',
            //             avatar_url: '',
            //             contributions: 0,
            //             type: 'commit_author'
            //         });
            //     }

            //     // Add committer if different from author and not already in map
            //     if (committer && committer.name && committer.name !== author.name && !contributorMap.has(committer.name)) {
            //         contributorMap.set(committer.name, {
            //             login: committer.name,
            //             name: committer.name,
            //             email: committer.email || '',
            //             avatar_url: '',
            //             contributions: 0,
            //             type: 'commit_committer'
            //         });
            //     }
            // });

            return Array.from(contributorMap.values()).sort((a, b) => b.contributions - a.contributions);

        } catch (error) {
            throw new Error(`Failed to get repository contributors: ${error.message}`);
        }
    }

    /**
     * Get commit statistics
     * @param {Array} commits - Array of commits
     * @returns {Object} Statistics
     */
    getCommitStatistics(commits) {
        if (!commits || commits.length === 0) {
            return {
                totalCommits: 0,
                totalAdditions: 0,
                totalDeletions: 0,
                netChanges: 0,
                averageChangesPerCommit: 0,
                topContributors: [],
                fileStatistics: []
            };
        }

        const totalCommits = commits.length;
        const totalAdditions = commits.reduce((sum, commit) => sum + commit.stats.additions, 0);
        const totalDeletions = commits.reduce((sum, commit) => sum + commit.stats.deletions, 0);
        const netChanges = totalAdditions - totalDeletions;
        const averageChangesPerCommit = Math.round((totalAdditions + totalDeletions) / totalCommits);

        // Get top contributors
        const contributors = {};
        commits.forEach(commit => {
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

        const topContributors = Object.values(contributors)
            .sort((a, b) => b.commits - a.commits)
            .slice(0, 5);

        // Get file statistics
        const fileStats = {};
        commits.forEach(commit => {
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

        const fileStatistics = Object.values(fileStats)
            .sort((a, b) => b.changes - a.changes)
            .slice(0, 10);

        return {
            totalCommits,
            totalAdditions,
            totalDeletions,
            netChanges,
            averageChangesPerCommit,
            topContributors,
            fileStatistics
        };
    }

    /**
     * Analyze commits with AI
     * @param {Array} commits - Array of commits
     * @returns {Promise<Array>} Array of analyses
     */
    async analyzeCommitsWithAI(commits) {
        try {
            return await this.aiAnalysisService.analyzeCommits(commits);
        } catch (error) {
            throw new Error(`Failed to analyze commits with AI: ${error.message}`);
        }
    }

    /**
     * Generate commit report
     * @param {Array} commits - Array of commits
     * @param {string} dateRange - Date range
     * @param {string} format - Output format
     * @param {boolean} useAI - Whether to use AI analysis
     * @returns {Promise<string>} Generated report
     */
    async generateCommitReport(commits, dateRange, format = 'text', useAI = false) {
        try {
            if (useAI && this.aiAnalysisService.isAvailable()) {
                return await this.reportService.generateEnhancedReport(
                    commits,
                    dateRange,
                    format,
                    (commit) => this.aiAnalysisService.analyzeCommit(commit)
                );
            } else {
                return this.reportService.generateQuickReport(commits, dateRange, format);
            }
        } catch (error) {
            throw new Error(`Failed to generate commit report: ${error.message}`);
        }
    }

    /**
     * Save commit report
     * @param {string} report - Report content
     * @param {string} filename - Output filename
     * @returns {Promise<string>} File path
     */
    async saveCommitReport(report, filename) {
        try {
            return await this.reportService.saveReport(report, filename);
        } catch (error) {
            throw new Error(`Failed to save commit report: ${error.message}`);
        }
    }

    /**
     * Get commit details
     * @param {string} repoUrl - Repository URL
     * @param {string} sha - Commit SHA
     * @returns {Promise<Commit>} Commit details
     */
    async getCommitDetails(repoUrl, sha) {
        try {
            const { owner, repo } = this.githubService.extractRepoInfo(repoUrl);
            const commitData = await this.githubService.getCommitDetails(owner, repo, sha);

            return new Commit(commitData);
        } catch (error) {
            throw new Error(`Failed to get commit details: ${error.message}`);
        }
    }

    /**
     * Validate commit data
     * @param {Object} commitData - Commit data
     * @returns {boolean} True if valid
     */
    validateCommit(commitData) {
        const commit = new Commit(commitData);
        return commit.isValid();
    }
}

module.exports = CommitController;
