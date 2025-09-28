/**
 * Report View
 * Handles report formatting and presentation
 */

class ReportView {
    constructor() {
        this.formats = {
            text: 'text',
            markdown: 'markdown',
            html: 'html',
            json: 'json'
        };
    }

    /**
     * Format report for text output
     * @param {Object} reportData - Report data
     * @returns {string} Formatted report
     */
    formatTextReport(reportData) {
        const { report } = reportData;
        return report;
    }

    /**
     * Format report for markdown output
     * @param {Object} reportData - Report data
     * @returns {string} Formatted report
     */
    formatMarkdownReport(reportData) {
        const { report } = reportData;
        return report;
    }

    /**
     * Format report for HTML output
     * @param {Object} reportData - Report data
     * @returns {string} Formatted HTML report
     */
    formatHtmlReport(reportData) {
        const { report, summary } = reportData;

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GitHub Commit Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            border-bottom: 2px solid #e1e4e8;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 2em;
            color: #24292e;
            margin: 0;
        }
        .summary {
            background: #f6f8fa;
            border: 1px solid #d1d5da;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 30px;
        }
        .summary h3 {
            margin-top: 0;
            color: #24292e;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .summary-item {
            text-align: center;
            padding: 10px;
            background: white;
            border-radius: 4px;
            border: 1px solid #e1e4e8;
        }
        .summary-item .label {
            font-size: 0.9em;
            color: #586069;
            margin-bottom: 5px;
        }
        .summary-item .value {
            font-size: 1.5em;
            font-weight: bold;
            color: #24292e;
        }
        .commit {
            border: 1px solid #e1e4e8;
            border-radius: 6px;
            margin-bottom: 20px;
            overflow: hidden;
        }
        .commit-header {
            background: #f6f8fa;
            padding: 15px 20px;
            border-bottom: 1px solid #e1e4e8;
        }
        .commit-title {
            font-size: 1.2em;
            font-weight: 600;
            color: #24292e;
            margin: 0 0 10px 0;
        }
        .commit-meta {
            display: flex;
            gap: 20px;
            font-size: 0.9em;
            color: #586069;
        }
        .commit-body {
            padding: 20px;
        }
        .commit-stats {
            display: flex;
            gap: 20px;
            margin-bottom: 15px;
            font-size: 0.9em;
        }
        .stat {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .stat.additions {
            color: #28a745;
        }
        .stat.deletions {
            color: #dc3545;
        }
        .files {
            margin-top: 15px;
        }
        .files h4 {
            margin: 0 0 10px 0;
            color: #24292e;
        }
        .file-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .file-item {
            display: flex;
            align-items: center;
            padding: 5px 0;
            border-bottom: 1px solid #f1f3f4;
        }
        .file-item:last-child {
            border-bottom: none;
        }
        .file-status {
            margin-right: 10px;
            font-size: 0.8em;
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: 500;
        }
        .file-status.added {
            background: #d4edda;
            color: #155724;
        }
        .file-status.modified {
            background: #fff3cd;
            color: #856404;
        }
        .file-status.removed {
            background: #f8d7da;
            color: #721c24;
        }
        .file-status.renamed {
            background: #d1ecf1;
            color: #0c5460;
        }
        .file-name {
            flex: 1;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 0.9em;
        }
        .file-changes {
            color: #586069;
            font-size: 0.8em;
        }
        .analysis {
            background: #f8f9fa;
            border-left: 4px solid #0366d6;
            padding: 15px;
            margin-top: 15px;
        }
        .analysis h4 {
            margin: 0 0 10px 0;
            color: #0366d6;
        }
        .analysis ul {
            margin: 0;
            padding-left: 20px;
        }
        .analysis li {
            margin-bottom: 5px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e1e4e8;
            text-align: center;
            color: #586069;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">GitHub Commit Report</h1>
        </div>
        
        ${summary ? `
        <div class="summary">
            <h3>Report Summary</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="label">Total Commits</div>
                    <div class="value">${summary.totalCommits}</div>
                </div>
                <div class="summary-item">
                    <div class="label">Total Additions</div>
                    <div class="value">+${summary.totalAdditions}</div>
                </div>
                <div class="summary-item">
                    <div class="label">Total Deletions</div>
                    <div class="value">-${summary.totalDeletions}</div>
                </div>
                <div class="summary-item">
                    <div class="label">Net Changes</div>
                    <div class="value">${summary.netChanges}</div>
                </div>
            </div>
        </div>
        ` : ''}
        
        <div class="report-content">
            ${this.convertMarkdownToHtml(report)}
        </div>
        
        <div class="footer">
            <p>Generated by GitHub Commit Reporter</p>
        </div>
    </div>
</body>
</html>`;

        return html;
    }

    /**
     * Format report for JSON output
     * @param {Object} reportData - Report data
     * @returns {string} Formatted JSON report
     */
    formatJsonReport(reportData) {
        return JSON.stringify(reportData, null, 2);
    }

    /**
     * Convert markdown to HTML
     * @param {string} markdown - Markdown content
     * @returns {string} HTML content
     */
    convertMarkdownToHtml(markdown) {
        // Simple markdown to HTML conversion
        let html = markdown
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/`(.*?)`/gim, '<code>$1</code>')
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            .replace(/\n\n/gim, '</p><p>')
            .replace(/\n/gim, '<br>');

        // Wrap list items in ul tags
        html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');

        // Wrap paragraphs
        html = '<p>' + html + '</p>';

        return html;
    }

    /**
     * Format report based on format type
     * @param {Object} reportData - Report data
     * @param {string} format - Output format
     * @returns {string} Formatted report
     */
    formatReport(reportData, format = 'text') {
        switch (format.toLowerCase()) {
            case 'markdown':
                return this.formatMarkdownReport(reportData);
            case 'html':
                return this.formatHtmlReport(reportData);
            case 'json':
                return this.formatJsonReport(reportData);
            default:
                return this.formatTextReport(reportData);
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
        const timestamp = new Date().toISOString().split('T')[0];
        const extension = this.getFileExtension(format);
        return `${reportType}-report-${dateRange}-${timestamp}.${extension}`;
    }

    /**
     * Get file extension for format
     * @param {string} format - Output format
     * @returns {string} File extension
     */
    getFileExtension(format) {
        const extensions = {
            text: 'txt',
            markdown: 'md',
            html: 'html',
            json: 'json'
        };
        return extensions[format.toLowerCase()] || 'txt';
    }

    /**
     * Create report template
     * @param {Object} data - Template data
     * @returns {string} Template string
     */
    createReportTemplate(data) {
        const { title, dateRange, commits, summary } = data;

        let template = `# ${title}\n\n`;
        template += `**Date Range:** ${dateRange}\n\n`;

        if (summary) {
            template += `## Summary\n\n`;
            template += `- Total Commits: ${summary.totalCommits}\n`;
            template += `- Total Additions: +${summary.totalAdditions}\n`;
            template += `- Total Deletions: -${summary.totalDeletions}\n`;
            template += `- Net Changes: ${summary.netChanges}\n\n`;
        }

        template += `## Commits\n\n`;

        commits.forEach((commit, index) => {
            template += `### Commit ${index + 1}: ${commit.message}\n\n`;
            template += `**Author:** ${commit.author.name} | **Time:** ${commit.getFormattedDate()}\n\n`;
            template += `**Changes:** +${commit.stats.additions} -${commit.stats.deletions} lines\n\n`;

            if (commit.files && commit.files.length > 0) {
                template += `**Changed Files:**\n`;
                commit.files.forEach(file => {
                    const statusEmoji = this.getStatusEmoji(file.status);
                    template += `- ${statusEmoji} \`${file.filename}\` (${file.changes} changes)\n`;
                });
                template += `\n`;
            }

            template += `---\n\n`;
        });

        return template;
    }

    /**
     * Get status emoji for file
     * @param {string} status - File status
     * @returns {string} Status emoji
     */
    getStatusEmoji(status) {
        const statusMap = {
            'added': '➕',
            'modified': '✏️',
            'removed': '🗑️',
            'renamed': '🔄'
        };
        return statusMap[status] || '📝';
    }

    /**
     * Format commit statistics
     * @param {Object} statistics - Commit statistics
     * @returns {string} Formatted statistics
     */
    formatCommitStatistics(statistics) {
        let stats = `## Commit Statistics\n\n`;
        stats += `- **Total Commits:** ${statistics.totalCommits}\n`;
        stats += `- **Total Additions:** +${statistics.totalAdditions}\n`;
        stats += `- **Total Deletions:** -${statistics.totalDeletions}\n`;
        stats += `- **Net Changes:** ${statistics.netChanges}\n`;
        stats += `- **Average Changes per Commit:** ${statistics.averageChangesPerCommit}\n\n`;

        if (statistics.topContributors && statistics.topContributors.length > 0) {
            stats += `### Top Contributors\n\n`;
            statistics.topContributors.forEach((contributor, index) => {
                stats += `${index + 1}. **${contributor.name}** - ${contributor.commits} commits (+${contributor.additions} -${contributor.deletions})\n`;
            });
            stats += `\n`;
        }

        if (statistics.fileStatistics && statistics.fileStatistics.length > 0) {
            stats += `### Most Changed Files\n\n`;
            statistics.fileStatistics.slice(0, 10).forEach((file, index) => {
                stats += `${index + 1}. **${file.filename}** - ${file.changes} changes (${file.commits} commits)\n`;
            });
        }

        return stats;
    }
}

module.exports = ReportView;
