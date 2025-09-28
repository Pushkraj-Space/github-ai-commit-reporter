#!/usr/bin/env node
/**
 * Quick GitHub Commit Reporter - Optimized version for faster execution
 */

const axios = require('axios');
const { program } = require('commander');
const fs = require('fs-extra');
const moment = require('moment');
const chalk = require('chalk');
const { GITHUB_TOKEN } = require('../config/config');

class QuickGitHubCommitReporter {
    constructor(token) {
        this.token = token;
        this.headers = {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version': '2022-11-28'
        };
        this.baseUrl = 'https://api.github.com';
    }

    /**
     * Extract owner and repository name from GitHub URL
     * @param {string} repoUrl - GitHub repository URL
     * @returns {Object} - {owner, repo}
     */
    extractRepoInfo(repoUrl) {
        let parts;

        if (repoUrl.startsWith('https://github.com/')) {
            parts = repoUrl.replace('https://github.com/', '').trim('/').split('/');
        } else if (repoUrl.startsWith('git@github.com:')) {
            parts = repoUrl.replace('git@github.com:', '').replace('.git', '').split('/');
        } else {
            throw new Error('Invalid GitHub repository URL format');
        }

        if (parts.length !== 2) {
            throw new Error('Invalid GitHub repository URL. Expected format: owner/repo');
        }

        const owner = parts[0];
        const repo = parts[1].replace('.git', '');
        return { owner, repo };
    }

    /**
     * Fetch commits for a specific date only
     * @param {string} owner - Repository owner
     * @param {string} repo - Repository name
     * @param {string} targetDate - Target date in YYYY-MM-DD format
     * @param {string} branch - Branch name (optional, defaults to main)
     * @returns {Array} - List of commit data
     */
    async getCommitsForDate(owner, repo, targetDate, branch = 'main') {
        const commits = [];
        let page = 1;
        const perPage = 100;

        // Calculate date range
        const sinceDate = targetDate.currentDate;
        const untilDate = targetDate.endDate;

        console.log(chalk.yellow(`Fetching commits from ${sinceDate} to ${untilDate}`));

        while (true) {
            const url = `${this.baseUrl}/repos/${owner}/${repo}/commits`;
            console.log(70, url);
            const params = {
                page,
                per_page: perPage,
                since: sinceDate,
                until: untilDate,
                sha: branch,
                author: "Pushkraj-Space"
            };
            console.log(79, params);
            try {
                const response = await axios.get(url, {
                    headers: this.headers,
                    params
                });

                const pageCommits = response.data;

                console.log(88, pageCommits);

                if (!pageCommits || pageCommits.length === 0) {
                    break;
                }

                // Get detailed commit information for each commit
                for (const commit of pageCommits) {
                    const detailedCommit = await this.getCommitDetails(owner, repo, commit.sha);
                    if (detailedCommit) {
                        commits.push(detailedCommit);
                    }
                }

                page++;

                // Check if we've reached the last page
                if (pageCommits.length < perPage) {
                    break;
                }

            } catch (error) {
                console.log(error);
                console.error(chalk.red(`Error fetching commits: ${error.message}`));
                break;
            }
        }

        return commits;
    }

    /**
     * Get detailed information about a specific commit
     * @param {string} owner - Repository owner
     * @param {string} repo - Repository name
     * @param {string} sha - Commit SHA
     * @returns {Object} - Detailed commit information
     */
    async getCommitDetails(owner, repo, sha) {
        const url = `${this.baseUrl}/repos/${owner}/${repo}/commits/${sha}`;

        try {
            const response = await axios.get(url, { headers: this.headers });
            const commitData = response.data;

            return {
                sha: commitData.sha,
                message: commitData.commit.message,
                author: {
                    name: commitData.commit.author.name,
                    email: commitData.commit.author.email,
                    date: commitData.commit.author.date
                },
                committer: {
                    name: commitData.commit.committer.name,
                    email: commitData.commit.committer.email,
                    date: commitData.commit.committer.date
                },
                files: commitData.files.map(file => ({
                    filename: file.filename,
                    status: file.status,
                    additions: file.additions || 0,
                    deletions: file.deletions || 0,
                    changes: file.changes || 0
                })),
                stats: {
                    total: commitData.stats.total,
                    additions: commitData.stats.additions,
                    deletions: commitData.stats.deletions
                }
            };

        } catch (error) {
            console.error(chalk.red(`Error fetching commit details for ${sha}: ${error.message}`));
            return null;
        }
    }

    /**
     * Generate a quick report for the specified date
     * @param {Array} commits - List of commits for the target date
     * @param {string} targetDate - Target date
     * @param {string} outputFormat - Output format ('markdown' or 'text')
     * @returns {string} - Generated report
     */
    generateQuickReport(commits, targetDate, outputFormat = 'text') {
        if (!commits || commits.length === 0) {
            return `No commits found for ${moment(targetDate).format('Do MMMM YYYY')}`;
        }

        // Format the date
        const formattedDate = targetDate// moment(targetDate).format('Do MMMM YYYY');

        let report;
        if (outputFormat === 'markdown') {
            report = `# Hey, on ${formattedDate} you did these changes:\n\n`;
        } else {
            report = `Hey, on ${formattedDate} you did these changes:\n\n`;
        }

        for (let i = 0; i < commits.length; i++) {
            const commit = commits[i];

            // Commit message
            const message = commit.message.trim();
            if (outputFormat === 'markdown') {
                report += `## Commit ${i + 1}: ${message}\n\n`;
            } else {
                report += `Commit ${i + 1}: ${message}\n`;
            }

            // Author and date
            const author = commit.author.name;
            const timeStr = moment(commit.author.date).format('HH:mm:ss');

            if (outputFormat === 'markdown') {
                report += `**Author:** ${author} | **Time:** ${timeStr}\n\n`;
            } else {
                report += `Author: ${author} | Time: ${timeStr}\n`;
            }

            // Statistics
            const stats = commit.stats;
            if (outputFormat === 'markdown') {
                report += `**Changes:** +${stats.additions} -${stats.deletions} lines\n\n`;
            } else {
                report += `Changes: +${stats.additions} -${stats.deletions} lines\n`;
            }

            // Changed files
            if (commit.files && commit.files.length > 0) {
                if (outputFormat === 'markdown') {
                    report += '**Changed Files:**\n';
                } else {
                    report += 'Changed Files:\n';
                }

                for (const file of commit.files) {
                    const statusEmoji = this.getStatusEmoji(file.status);
                    const filename = file.filename;
                    const changes = file.changes;

                    if (outputFormat === 'markdown') {
                        report += `- ${statusEmoji} \`${filename}\` (${changes} changes)\n`;
                    } else {
                        report += `  ${statusEmoji} ${filename} (${changes} changes)\n`;
                    }
                }

                report += '\n';
            }

            if (outputFormat === 'text') {
                report += '-'.repeat(50) + '\n\n';
            } else {
                report += '---\n\n';
            }
        }

        return report;
    }

    /**
     * Get status indicator for file
     * @param {string} status - File status
     * @returns {string} - Status emoji
     */
    getStatusEmoji(status) {
        const statusMap = {
            'added': '[ADDED]',
            'modified': '[MODIFIED]',
            'removed': '[REMOVED]',
            'renamed': '[RENAMED]'
        };
        return statusMap[status] || '[CHANGED]';
    }

    /**
     * Save the report to a file
     * @param {string} report - Report content
     * @param {string} filename - Output filename
     */
    async saveReport(report, filename) {
        try {
            await fs.writeFile(filename, report, 'utf8');
            console.log(chalk.green(`Report saved to: ${filename}`));
        } catch (error) {
            console.error(chalk.red(`Error saving report: ${error.message}`));
        }
    }
}

// Main function
async function main() {
    program
        .name('quick-commit-reporter')
        .description('Generate quick day-wise commit reports')
        .argument('<repo_url>', 'GitHub repository URL (e.g., https://github.com/owner/repo)')
        .argument('<date>', 'Target date in YYYY-MM-DD format (e.g., 2025-07-02)')
        .option('--output <filename>', 'Output filename (default: quick-report-YYYY-MM-DD.txt)')
        .option('--format <format>', 'Output format (markdown or text)', 'text')
        .parse();

    const options = program.opts();
    const [repoUrl, date] = program.args;

    // Get GitHub token
    const token = GITHUB_TOKEN;

    if (!token) {
        console.error(chalk.red('Error: GitHub Personal Access Token is required.'));
        console.log('Please set GITHUB_TOKEN in config.js');
        process.exit(1);
    }

    // Validate date format
    if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
        console.error(chalk.red('Error: Invalid date format. Use YYYY-MM-DD (e.g., 2025-07-02)'));
        process.exit(1);
    }

    // Initialize reporter
    const reporter = new QuickGitHubCommitReporter(token);

    try {
        // Extract repository information
        const { owner, repo } = reporter.extractRepoInfo(repoUrl);
        console.log(chalk.blue(`Repository: ${owner}/${repo}`));
        console.log(chalk.blue(`Target date: ${moment(date).format('Do MMMM YYYY')}`));
        console.log(chalk.yellow('Fetching commits...'));

        // Get commits for the target date
        const commits = await reporter.getCommitsForDate(owner, repo, date);

        console.log(chalk.green(`Found ${commits.length} commits for ${moment(date).format('Do MMMM YYYY')}`));

        if (commits.length > 0) {
            // Generate report
            const report = reporter.generateQuickReport(commits, date, options.format);

            // Set default output filename if not provided
            const outputFilename = options.output || `quick-report-${date}.txt`;

            // Save report
            await reporter.saveReport(report, outputFilename);

            // Print summary
            console.log(chalk.cyan('\nSummary:'));
            console.log(chalk.cyan(`- Total commits: ${commits.length}`));
            const totalAdditions = commits.reduce((sum, commit) => sum + commit.stats.additions, 0);
            const totalDeletions = commits.reduce((sum, commit) => sum + commit.stats.deletions, 0);
            console.log(chalk.cyan(`- Total additions: +${totalAdditions}`));
            console.log(chalk.cyan(`- Total deletions: -${totalDeletions}`));
            console.log(chalk.cyan(`- Net changes: ${totalAdditions - totalDeletions}`));
        } else {
            console.log(chalk.yellow(`No commits found for ${moment(date).format('Do MMMM YYYY')}`));
        }

    } catch (error) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
    }
}

// Run if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = QuickGitHubCommitReporter;
