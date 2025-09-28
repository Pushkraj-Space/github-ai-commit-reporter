#!/usr/bin/env node
/**
 * Enhanced GitHub Commit Reporter with AI Analysis
 * 
 * A Node.js program that takes a GitHub repository link as input and generates
 * detailed day-wise commit reports with AI-powered analysis of changes.
 */

const axios = require('axios');
const { program } = require('commander');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const chalk = require('chalk');
const OpenAI = require('openai');
const { GITHUB_TOKEN, OPENAI_API_KEY } = require('../config/config');

class EnhancedGitHubCommitReporter {
    constructor(token, openaiApiKey = null) {
        this.token = token;
        this.headers = {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        };
        this.baseUrl = 'https://api.github.com';
        this.openaiApiKey = openaiApiKey;
        this.openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;
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
     * Fetch commits from GitHub API with pagination support
     * @param {string} owner - Repository owner
     * @param {string} repo - Repository name
     * @param {string} sinceDate - Start date in ISO format (optional)
     * @param {string} untilDate - End date in ISO format (optional)
     * @param {string} branch - Branch name (optional, defaults to main)
     * @returns {Array} - List of commit data
     */
    async getCommits(owner, repo, sinceDate = null, untilDate = null, branch = 'main') {
        const commits = [];
        let page = 1;
        const perPage = 100; // Maximum allowed by GitHub API

        while (true) {
            const url = `${this.baseUrl}/repos/${owner}/${repo}/commits`;
            const params = {
                page,
                per_page: perPage,
                sha: branch
            };

            if (sinceDate) params.since = sinceDate;
            if (untilDate) params.until = untilDate;

            try {
                const response = await axios.get(url, {
                    headers: this.headers,
                    params
                });

                const pageCommits = response.data;

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
                console.error(`Error fetching commits: ${error.message}`);
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
            console.error(`Error fetching commit details for ${sha}: ${error.message}`);
            return null;
        }
    }

    /**
     * Fetch commits for a specific date only (similar to quick reporter)
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
        const sinceDate = targetDate;
        const untilDate = moment(targetDate).add(1, 'day').format('YYYY-MM-DD');

        console.log(`Fetching commits from ${sinceDate} to ${untilDate} for branch ${branch}`);

        while (true) {
            const url = `${this.baseUrl}/repos/${owner}/${repo}/commits`;
            const params = {
                page,
                per_page: perPage,
                since: sinceDate,
                until: untilDate,
                sha: branch
            };

            try {
                const response = await axios.get(url, {
                    headers: this.headers,
                    params
                });

                const pageCommits = response.data;

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
                console.error(`Error fetching commits: ${error.message}`);
                break;
            }
        }

        return commits;
    }

    /**
     * Filter commits by a specific date
     * @param {Array} commits - List of commits
     * @param {string} targetDate - Target date in YYYY-MM-DD format
     * @returns {Array} - Filtered commits for the target date
     */
    filterCommitsByDate(commits, targetDate) {
        return commits.filter(commit => {
            const commitDate = moment(commit.author.date).format('YYYY-MM-DD');
            return commitDate === targetDate;
        });
    }

    /**
     * Use AI to analyze a commit and provide detailed insights
     * @param {Object} commit - Commit data
     * @returns {string} - AI-generated analysis
     */
    async analyzeCommitWithAI(commit) {
        if (!this.openai) {
            return this.generateBasicAnalysis(commit);
        }

        try {
            // Prepare context for AI analysis
            const commitMessage = commit.message;
            const filesChanged = commit.files;
            const stats = commit.stats;

            // Create a detailed context for AI
            let context = `Commit Message: ${commitMessage}\n\nFiles Changed:\n`;

            for (const file of filesChanged) {
                context += `- ${file.filename} (${file.status}, +${file.additions} -${file.deletions})\n`;
            }

            context += `\nTotal Changes: +${stats.additions} -${stats.deletions} lines\n\n`;
            context += `Please analyze this commit and provide:\n`;
            context += `1. What features or functionality were added/modified/removed\n`;
            context += `2. What specific changes were made (e.g., "Added user authentication", "Updated API integration", "Fixed UI design")\n`;
            context += `3. What the developer accomplished in this commit\n`;
            context += `4. Any technical improvements or bug fixes\n\n`;
            context += `Provide a clear, concise analysis in bullet points focusing on the actual functionality and purpose of the changes.`;

            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a software development analyst. Analyze commit changes and provide clear, technical insights about what was accomplished."
                    },
                    { role: "user", content: context }
                ],
                max_tokens: 300,
                temperature: 0.3
            });

            return response.choices[0].message.content.trim();

        } catch (error) {
            console.error(`AI analysis failed: ${error.message}`);
            return this.generateBasicAnalysis(commit);
        }
    }

    /**
     * Generate detailed analysis without AI
     * @param {Object} commit - Commit data
     * @returns {string} - Detailed analysis
     */
    generateBasicAnalysis(commit) {
        const analysis = [];
        const commitMessage = commit.message.toLowerCase();
        const files = commit.files;

        // Analyze based on file patterns and commit message
        if (files.some(f => f.filename.toLowerCase().includes('auth')) || commitMessage.includes('auth')) {
            analysis.push("* Authentication/Authorization changes");
            analysis.push("  - Implemented or modified user authentication system");
            analysis.push("  - Updated security protocols or access controls");
        }

        if (files.some(f => f.filename.toLowerCase().includes('api')) || commitMessage.includes('api')) {
            analysis.push("* API integration or endpoint changes");
            analysis.push("  - Added new API endpoints or modified existing ones");
            analysis.push("  - Integrated external services or third-party APIs");
            analysis.push("  - Updated API configuration or connection settings");
        }

        if (files.some(f => f.filename.toLowerCase().includes('ui') || f.filename.toLowerCase().includes('css') || f.filename.toLowerCase().includes('jsx'))) {
            analysis.push("* UI/UX design updates");
            analysis.push("  - Modified user interface components and layouts");
            analysis.push("  - Updated styling, themes, or visual elements");
            analysis.push("  - Improved user experience and interface responsiveness");
        }

        if (files.some(f => f.filename.toLowerCase().includes('test'))) {
            analysis.push("* Testing improvements");
            analysis.push("  - Added or updated test cases and test coverage");
            analysis.push("  - Implemented automated testing or quality assurance");
        }

        if (files.some(f => f.filename.toLowerCase().includes('readme'))) {
            analysis.push("* Documentation updates");
            analysis.push("  - Updated project documentation and guides");
            analysis.push("  - Improved code comments or technical documentation");
        }

        if (files.some(f => f.filename.toLowerCase().includes('env'))) {
            analysis.push("* Environment configuration changes");
            analysis.push("  - Updated environment variables and configuration settings");
            analysis.push("  - Modified deployment or development environment setup");
        }

        if (files.some(f => f.filename.toLowerCase().includes('package'))) {
            analysis.push("* Dependency updates");
            analysis.push("  - Updated project dependencies and libraries");
            analysis.push("  - Added new packages or updated existing ones");
        }

        // Add general insights based on file types
        const backendFiles = files.filter(f =>
            ['.js', '.py', '.java', '.php'].some(ext => f.filename.toLowerCase().includes(ext))
        );
        const frontendFiles = files.filter(f =>
            ['.jsx', '.tsx', '.vue', '.html', '.css'].some(ext => f.filename.toLowerCase().includes(ext))
        );

        if (backendFiles.length > 0 && frontendFiles.length > 0) {
            analysis.push("* Full-stack development changes");
            analysis.push("  - Worked on both frontend and backend components");
            analysis.push("  - Implemented end-to-end features or functionality");
        } else if (backendFiles.length > 0) {
            analysis.push("* Backend functionality updates");
            analysis.push("  - Modified server-side logic and business rules");
            analysis.push("  - Updated database operations or data processing");
        } else if (frontendFiles.length > 0) {
            analysis.push("* Frontend development changes");
            analysis.push("  - Updated client-side components and user interface");
            analysis.push("  - Modified user interactions and frontend logic");
        }

        if (analysis.length === 0) {
            analysis.push("* General code changes and improvements");
            analysis.push("  - Made general code improvements and optimizations");
            analysis.push("  - Updated existing functionality or fixed issues");
        }

        return analysis.join('\n');
    }

    /**
     * Generate an enhanced detailed report for the specified date
     * @param {Array} commits - List of commits for the target date
     * @param {string} targetDate - Target date
     * @param {string} outputFormat - Output format ('markdown' or 'text')
     * @returns {string} - Generated report
     */
    async generateEnhancedReport(commits, targetDate, outputFormat = 'markdown') {
        if (!commits || commits.length === 0) {
            return `No commits found for ${moment(targetDate).format('Do MMMM YYYY')}`;
        }

        // Format the date
        const formattedDate = moment(targetDate).format('Do MMMM YYYY');

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

            // AI Analysis
            const analysis = await this.analyzeCommitWithAI(commit);
            if (outputFormat === 'markdown') {
                report += `**What you accomplished:**\n${analysis}\n\n`;
            } else {
                report += `What you accomplished:\n${analysis}\n`;
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
        .name('enhanced-commit-reporter')
        .description('Generate enhanced day-wise commit reports with AI analysis')
        .argument('<repo_url>', 'GitHub repository URL (e.g., https://github.com/owner/repo)')
        .argument('<date>', 'Target date in YYYY-MM-DD format (e.g., 2025-07-02)')
        .option('--token <token>', 'GitHub Personal Access Token (or set GITHUB_TOKEN environment variable)')
        .option('--openai-key <key>', 'OpenAI API key for AI analysis (or set OPENAI_API_KEY environment variable)')
        .option('--output <filename>', 'Output filename (default: report-YYYY-MM-DD.txt)')
        .option('--format <format>', 'Output format (markdown or text)', 'text')
        .parse();

    const options = program.opts();
    const [repoUrl, date] = program.args;

    // Get GitHub token
    let token = options.token || process.env.GITHUB_TOKEN || GITHUB_TOKEN;

    if (!token) {
        console.error(chalk.red('Error: GitHub Personal Access Token is required.'));
        console.log('Set it using one of these methods:');
        console.log('1. --token argument: node enhanced-commit-reporter.js <repo> <date> --token your_token');
        console.log('2. Environment variable: set GITHUB_TOKEN=your_token');
        console.log('3. Config file: Edit config.js and set GITHUB_TOKEN = "your_token"');
        console.log('\nTo create a token:');
        console.log('1. Go to GitHub Settings > Developer settings > Personal access tokens');
        console.log('2. Generate a new token with "repo" scope');
        process.exit(1);
    }

    // Get OpenAI API key
    const openaiKey = options.openaiKey || process.env.OPENAI_API_KEY || OPENAI_API_KEY;

    // Validate date format
    if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
        console.error(chalk.red('Error: Invalid date format. Use YYYY-MM-DD (e.g., 2025-07-02)'));
        process.exit(1);
    }

    // Initialize reporter
    const reporter = new EnhancedGitHubCommitReporter(token, openaiKey);

    try {
        // Extract repository information
        const { owner, repo } = reporter.extractRepoInfo(repoUrl);
        console.log(chalk.blue(`Repository: ${owner}/${repo}`));
        console.log(chalk.blue(`Target date: ${moment(date).format('Do MMMM YYYY')}`));
        console.log(chalk.yellow('Fetching commits...'));

        // Get commits for the target date
        const sinceDate = date;
        const untilDate = moment(date).add(1, 'day').format('YYYY-MM-DD');

        console.log(chalk.yellow(`Fetching commits from ${sinceDate} to ${untilDate}`));
        let allCommits = await reporter.getCommits(owner, repo, sinceDate, untilDate);

        // Always fetch all commits to ensure we don't miss any due to timezone issues
        console.log(chalk.yellow('Fetching all commits to ensure accurate date filtering...'));
        allCommits = await reporter.getCommits(owner, repo);
        const targetCommits = reporter.filterCommitsByDate(allCommits, date);

        console.log(chalk.green(`Found ${targetCommits.length} commits for ${moment(date).format('Do MMMM YYYY')}`));

        if (targetCommits.length > 0) {
            // Generate enhanced report
            const report = await reporter.generateEnhancedReport(targetCommits, date, options.format);

            // Set default output filename if not provided
            const outputFilename = options.output || `report-${date}.txt`;

            // Save report
            await reporter.saveReport(report, outputFilename);

            // Print summary
            console.log(chalk.cyan('\nSummary:'));
            console.log(chalk.cyan(`- Total commits: ${targetCommits.length}`));
            const totalAdditions = targetCommits.reduce((sum, commit) => sum + commit.stats.additions, 0);
            const totalDeletions = targetCommits.reduce((sum, commit) => sum + commit.stats.deletions, 0);
            console.log(chalk.cyan(`- Total additions: +${totalAdditions}`));
            console.log(chalk.cyan(`- Total deletions: -${totalDeletions}`));
            console.log(chalk.cyan(`- Net changes: ${totalAdditions - totalDeletions}`));

            if (openaiKey) {
                console.log(chalk.cyan('- AI analysis: Enabled'));
            } else {
                console.log(chalk.cyan('- AI analysis: Disabled (use --openai-key to enable)'));
            }
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

module.exports = EnhancedGitHubCommitReporter;
