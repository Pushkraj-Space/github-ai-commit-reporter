/**
 * Report Service
 * Handles report generation and formatting
 */

const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const Commit = require('../models/Commit');
const Report = require('../models/Report');
const Repository = require('../models/Repository');

class ReportService {
    constructor() {
        this.outputDir = path.join(__dirname, '../../reports');
        this.ensureOutputDir();
    }

    /**
     * Ensure output directory exists
     */
    async ensureOutputDir() {
        try {
            await fs.ensureDir(this.outputDir);
        } catch (error) {
            console.error('Error creating output directory:', error);
        }
    }

    /**
     * Generate a quick report
     * @param {Array} commits - Array of commit data
     * @param {string} dateRange - Date range string
     * @param {string} format - Output format ('markdown' or 'text')
     * @returns {string} Generated report
     */
    generateQuickReport(commits, dateRange, format = 'text') {
        if (!commits || commits.length === 0) {
            return `No commits found for ${dateRange}`;
        }

        let report;
        if (format === 'markdown') {
            report = `# Hey, on ${dateRange} you did these changes:\n\n`;
        } else {
            report = `Hey, on ${dateRange} you did these changes:\n\n`;
        }

        for (let i = 0; i < commits.length; i++) {
            const commit = new Commit(commits[i]);

            // Commit message
            const message = commit.message.trim();
            if (format === 'markdown') {
                report += `## Commit ${i + 1}: ${message}\n\n`;
            } else {
                report += `Commit ${i + 1}: ${message}\n`;
            }

            // Author and date
            const author = commit.author.name;
            const timeStr = commit.getFormattedDate();

            if (format === 'markdown') {
                report += `**Author:** ${author} | **Time:** ${timeStr}\n\n`;
            } else {
                report += `Author: ${author} | Time: ${timeStr}\n`;
            }

            // Statistics
            const stats = commit.stats;
            if (format === 'markdown') {
                report += `**Changes:** +${stats.additions} -${stats.deletions} lines\n\n`;
            } else {
                report += `Changes: +${stats.additions} -${stats.deletions} lines\n`;
            }

            // Changed files
            if (commit.files && commit.files.length > 0) {
                if (format === 'markdown') {
                    report += '**Changed Files:**\n';
                } else {
                    report += 'Changed Files:\n';
                }

                for (const file of commit.files) {
                    const statusEmoji = this.getStatusEmoji(file.status);
                    const filename = file.filename;
                    const changes = file.changes;

                    if (format === 'markdown') {
                        report += `- ${statusEmoji} \`${filename}\` (${changes} changes)\n`;
                    } else {
                        report += `  ${statusEmoji} ${filename} (${changes} changes)\n`;
                    }
                }

                report += '\n';
            }

            if (format === 'text') {
                report += '-'.repeat(50) + '\n\n';
            } else {
                report += '---\n\n';
            }
        }

        return report;
    }

    /**
     * Generate an enhanced report with AI analysis
     * @param {Array} commits - Array of commit data
     * @param {string} dateRange - Date range string
     * @param {string} format - Output format ('markdown' or 'text')
     * @param {Function} aiAnalyzer - AI analysis function
     * @returns {Promise<string>} Generated report
     */
    async generateEnhancedReport(commits, dateRange, format = 'text', aiAnalyzer = null) {
        if (!commits || commits.length === 0) {
            return `No commits found for ${dateRange}`;
        }

        let report;
        if (format === 'markdown') {
            report = `# Hey, on ${dateRange} you did these changes:\n\n`;
        } else {
            report = `Hey, on ${dateRange} you did these changes:\n\n`;
        }

        for (let i = 0; i < commits.length; i++) {
            const commit = new Commit(commits[i]);

            // Commit message
            const message = commit.message.trim();
            if (format === 'markdown') {
                report += `## Commit ${i + 1}: ${message}\n\n`;
            } else {
                report += `Commit ${i + 1}: ${message}\n`;
            }

            // Author and date
            const author = commit.author.name;
            const timeStr = commit.getFormattedDate();

            if (format === 'markdown') {
                report += `**Author:** ${author} | **Time:** ${timeStr}\n\n`;
            } else {
                report += `Author: ${author} | Time: ${timeStr}\n`;
            }

            // Statistics
            const stats = commit.stats;
            if (format === 'markdown') {
                report += `**Changes:** +${stats.additions} -${stats.deletions} lines\n\n`;
            } else {
                report += `Changes: +${stats.additions} -${stats.deletions} lines\n`;
            }

            // AI Analysis
            let analysis;
            if (aiAnalyzer) {
                analysis = await aiAnalyzer(commit);
            } else {
                analysis = this.generateBasicAnalysis(commit);
            }

            if (format === 'markdown') {
                report += `**What you accomplished:**\n${analysis}\n\n`;
            } else {
                report += `What you accomplished:\n${analysis}\n`;
            }

            // Changed files
            if (commit.files && commit.files.length > 0) {
                if (format === 'markdown') {
                    report += '**Changed Files:**\n';
                } else {
                    report += 'Changed Files:\n';
                }

                for (const file of commit.files) {
                    const statusEmoji = this.getStatusEmoji(file.status);
                    const filename = file.filename;
                    const changes = file.changes;

                    if (format === 'markdown') {
                        report += `- ${statusEmoji} \`${filename}\` (${changes} changes)\n`;
                    } else {
                        report += `  ${statusEmoji} ${filename} (${changes} changes)\n`;
                    }
                }

                report += '\n';
            }

            if (format === 'text') {
                report += '-'.repeat(50) + '\n\n';
            } else {
                report += '---\n\n';
            }
        }

        return report;
    }

    /**
     * Generate basic analysis for a commit
     * @param {Commit} commit - Commit object
     * @returns {string} Basic analysis
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
     * Get status indicator for file
     * @param {string} status - File status
     * @returns {string} Status emoji
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
     * Save report to file
     * @param {string} report - Report content
     * @param {string} filename - Output filename
     * @returns {Promise<string>} File path
     */
    async saveReport(report, filename) {
        try {
            const filePath = path.join(this.outputDir, filename);
            await fs.writeFile(filePath, report, 'utf8');
            return filePath;
        } catch (error) {
            throw new Error(`Error saving report: ${error.message}`);
        }
    }

    /**
     * Generate report filename
     * @param {string} reportType - Type of report
     * @param {string} dateRange - Date range
     * @param {string} format - Output format
     * @returns {string} Filename
     */
    generateFilename(reportType, dateRange, format) {
        const timestamp = moment().format('YYYY-MM-DD-HH-mm-ss');
        const extension = format === 'markdown' ? 'md' : 'txt';
        return `${reportType}-report-${dateRange}-${timestamp}.${extension}`;
    }

    /**
     * Create a Report model instance
     * @param {Object} data - Report data
     * @returns {Report} Report instance
     */
    createReport(data) {
        return new Report(data);
    }

    /**
     * Get report statistics
     * @param {Array} commits - Array of commit data
     * @returns {Object} Statistics
     */
    getReportStatistics(commits) {
        if (!commits || commits.length === 0) {
            return {
                totalCommits: 0,
                totalAdditions: 0,
                totalDeletions: 0,
                netChanges: 0,
                averageChangesPerCommit: 0
            };
        }

        const totalCommits = commits.length;
        const totalAdditions = commits.reduce((sum, commit) => sum + commit.stats.additions, 0);
        const totalDeletions = commits.reduce((sum, commit) => sum + commit.stats.deletions, 0);
        const netChanges = totalAdditions - totalDeletions;
        const averageChangesPerCommit = Math.round((totalAdditions + totalDeletions) / totalCommits);

        return {
            totalCommits,
            totalAdditions,
            totalDeletions,
            netChanges,
            averageChangesPerCommit
        };
    }
}

module.exports = ReportService;
