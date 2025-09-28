#!/usr/bin/env node
/**
 * CLI Entry Point for GitHub Commit Reporter
 * 
 * This is the main CLI interface that uses the MVC architecture
 */

const { program } = require('commander');
const chalk = require('chalk');
const CommitController = require('./app/controllers/CommitController');
const RepositoryController = require('./app/controllers/RepositoryController');
const ReportController = require('./app/controllers/ReportController');

// Initialize controllers
const commitController = new CommitController();
const repositoryController = new RepositoryController();
const reportController = new ReportController();

program
    .name('github-commit-reporter')
    .description('Generate day-wise commit reports from GitHub repositories using MVC architecture')
    .version('1.0.0');

// Quick reporter command
program
    .command('quick <repo_url> <date>')
    .description('Generate a quick commit report (fast and efficient)')
    .option('--output <filename>', 'Output filename')
    .option('--format <format>', 'Output format (markdown, text, html, json)', 'text')
    .option('--branch <branch>', 'Branch name', 'main')
    .action(async (repoUrl, date, options) => {
        console.log(chalk.blue('🚀 Running Quick Commit Reporter...'));
        try {
            console.log(chalk.blue(`Repository: ${repoUrl}`));
            console.log(chalk.blue(`Target date: ${date}`));
            console.log(chalk.blue(`Branch: ${options.branch}`));

            const reportData = await reportController.generateQuickReport(
                repoUrl,
                date,
                date,
                options.branch,
                options.format
            );

            console.log(chalk.green(`Found ${reportData.summary.totalCommits} commits`));

            if (reportData.summary.totalCommits > 0) {
                // Save report if output filename is provided
                if (options.output) {
                    const filePath = await reportController.saveReport(reportData.report, options.output);
                    console.log(chalk.green(`Report saved to: ${filePath}`));
                } else {
                    // Print report to console
                    console.log(chalk.cyan('\n' + '='.repeat(50)));
                    console.log(chalk.cyan('REPORT'));
                    console.log(chalk.cyan('='.repeat(50)));
                    console.log(reportData.report);
                }

                // Print summary
                console.log(chalk.cyan('\nSummary:'));
                console.log(chalk.cyan(`- Total commits: ${reportData.summary.totalCommits}`));
                console.log(chalk.cyan(`- Total additions: +${reportData.summary.totalAdditions}`));
                console.log(chalk.cyan(`- Total deletions: -${reportData.summary.totalDeletions}`));
                console.log(chalk.cyan(`- Net changes: ${reportData.summary.netChanges}`));
            } else {
                console.log(chalk.yellow('No commits found for the specified date'));
            }
        } catch (error) {
            console.error(chalk.red(`Error: ${error.message}`));
            process.exit(1);
        }
    });

// Enhanced reporter command
program
    .command('enhanced <repo_url> <date>')
    .description('Generate an enhanced commit report with AI analysis')
    .option('--output <filename>', 'Output filename')
    .option('--format <format>', 'Output format (markdown, text, html, json)', 'text')
    .option('--branch <branch>', 'Branch name', 'main')
    .option('--openai-key <key>', 'OpenAI API key for AI analysis')
    .action(async (repoUrl, date, options) => {
        console.log(chalk.blue('🤖 Running Enhanced Commit Reporter...'));
        try {
            console.log(chalk.blue(`Repository: ${repoUrl}`));
            console.log(chalk.blue(`Target date: ${date}`));
            console.log(chalk.blue(`Branch: ${options.branch}`));

            const reportData = await reportController.generateEnhancedReport(
                repoUrl,
                date,
                date,
                options.branch,
                options.format,
                options.openaiKey
            );

            console.log(chalk.green(`Found ${reportData.summary.totalCommits} commits`));

            if (reportData.summary.totalCommits > 0) {
                // Save report if output filename is provided
                if (options.output) {
                    const filePath = await reportController.saveReport(reportData.report, options.output);
                    console.log(chalk.green(`Report saved to: ${filePath}`));
                } else {
                    // Print report to console
                    console.log(chalk.cyan('\n' + '='.repeat(50)));
                    console.log(chalk.cyan('ENHANCED REPORT'));
                    console.log(chalk.cyan('='.repeat(50)));
                    console.log(reportData.report);
                }

                // Print summary
                console.log(chalk.cyan('\nSummary:'));
                console.log(chalk.cyan(`- Total commits: ${reportData.summary.totalCommits}`));
                console.log(chalk.cyan(`- Total additions: +${reportData.summary.totalAdditions}`));
                console.log(chalk.cyan(`- Total deletions: -${reportData.summary.totalDeletions}`));
                console.log(chalk.cyan(`- Net changes: ${reportData.summary.netChanges}`));
                console.log(chalk.cyan(`- AI Analysis: ${reportData.summary.aiAnalysis ? 'Enabled' : 'Disabled'}`));
            } else {
                console.log(chalk.yellow('No commits found for the specified date'));
            }
        } catch (error) {
            console.error(chalk.red(`Error: ${error.message}`));
            process.exit(1);
        }
    });

// Date range reporter command
program
    .command('range <repo_url> <from_date> <to_date>')
    .description('Generate a report for a date range')
    .option('--output <filename>', 'Output filename')
    .option('--format <format>', 'Output format (markdown, text, html, json)', 'text')
    .option('--branch <branch>', 'Branch name', 'main')
    .option('--enhanced', 'Use enhanced report with AI analysis')
    .option('--openai-key <key>', 'OpenAI API key for AI analysis')
    .action(async (repoUrl, fromDate, toDate, options) => {
        console.log(chalk.blue('📅 Running Date Range Reporter...'));
        try {
            console.log(chalk.blue(`Repository: ${repoUrl}`));
            console.log(chalk.blue(`Date range: ${fromDate} to ${toDate}`));
            console.log(chalk.blue(`Branch: ${options.branch}`));

            let reportData;
            if (options.enhanced) {
                reportData = await reportController.generateEnhancedReport(
                    repoUrl,
                    fromDate,
                    toDate,
                    options.branch,
                    options.format,
                    options.openaiKey
                );
            } else {
                reportData = await reportController.generateQuickReport(
                    repoUrl,
                    fromDate,
                    toDate,
                    options.branch,
                    options.format
                );
            }

            console.log(chalk.green(`Found ${reportData.summary.totalCommits} commits`));

            if (reportData.summary.totalCommits > 0) {
                // Save report if output filename is provided
                if (options.output) {
                    const filePath = await reportController.saveReport(reportData.report, options.output);
                    console.log(chalk.green(`Report saved to: ${filePath}`));
                } else {
                    // Print report to console
                    console.log(chalk.cyan('\n' + '='.repeat(50)));
                    console.log(chalk.cyan('DATE RANGE REPORT'));
                    console.log(chalk.cyan('='.repeat(50)));
                    console.log(reportData.report);
                }

                // Print summary
                console.log(chalk.cyan('\nSummary:'));
                console.log(chalk.cyan(`- Total commits: ${reportData.summary.totalCommits}`));
                console.log(chalk.cyan(`- Total additions: +${reportData.summary.totalAdditions}`));
                console.log(chalk.cyan(`- Total deletions: -${reportData.summary.totalDeletions}`));
                console.log(chalk.cyan(`- Net changes: ${reportData.summary.netChanges}`));
                if (options.enhanced) {
                    console.log(chalk.cyan(`- AI Analysis: ${reportData.summary.aiAnalysis ? 'Enabled' : 'Disabled'}`));
                }
            } else {
                console.log(chalk.yellow('No commits found for the specified date range'));
            }
        } catch (error) {
            console.error(chalk.red(`Error: ${error.message}`));
            process.exit(1);
        }
    });

// Statistics command
program
    .command('stats <repo_url>')
    .description('Get repository statistics')
    .option('--from <date>', 'Start date (YYYY-MM-DD)')
    .option('--to <date>', 'End date (YYYY-MM-DD)')
    .option('--branch <branch>', 'Branch name', 'main')
    .action(async (repoUrl, options) => {
        console.log(chalk.blue('📊 Getting Repository Statistics...'));
        try {
            console.log(chalk.blue(`Repository: ${repoUrl}`));
            console.log(chalk.blue(`Branch: ${options.branch}`));

            const summary = await reportController.getReportSummary(
                repoUrl,
                options.from || '2020-01-01',
                options.to || new Date().toISOString().split('T')[0],
                options.branch
            );

            console.log(chalk.cyan('\nRepository Statistics:'));
            console.log(chalk.cyan(`- Repository: ${summary.repository}`));
            console.log(chalk.cyan(`- Date Range: ${summary.dateRange}`));
            console.log(chalk.cyan(`- Branch: ${summary.branch}`));
            console.log(chalk.cyan(`- Total Commits: ${summary.statistics.totalCommits}`));
            console.log(chalk.cyan(`- Total Additions: +${summary.statistics.totalAdditions}`));
            console.log(chalk.cyan(`- Total Deletions: -${summary.statistics.totalDeletions}`));
            console.log(chalk.cyan(`- Net Changes: ${summary.statistics.netChanges}`));
            console.log(chalk.cyan(`- Average Changes per Commit: ${summary.statistics.averageChangesPerCommit}`));

            if (summary.statistics.topContributors.length > 0) {
                console.log(chalk.cyan('\nTop Contributors:'));
                summary.statistics.topContributors.forEach((contributor, index) => {
                    console.log(chalk.cyan(`${index + 1}. ${contributor.name} - ${contributor.commits} commits (+${contributor.additions} -${contributor.deletions})`));
                });
            }

            if (summary.statistics.fileStatistics.length > 0) {
                console.log(chalk.cyan('\nMost Changed Files:'));
                summary.statistics.fileStatistics.slice(0, 10).forEach((file, index) => {
                    console.log(chalk.cyan(`${index + 1}. ${file.filename} - ${file.changes} changes (${file.commits} commits)`));
                });
            }
        } catch (error) {
            console.error(chalk.red(`Error: ${error.message}`));
            process.exit(1);
        }
    });

// Help command
program
    .command('help')
    .description('Show detailed help information')
    .action(() => {
        console.log(chalk.cyan('\n📚 GitHub Commit Reporter Help\n'));
        console.log(chalk.yellow('Quick Start:'));
        console.log('  node cli.js quick <repo_url> <date>');
        console.log('  node cli.js enhanced <repo_url> <date>');
        console.log('  node cli.js range <repo_url> <from_date> <to_date>\n');

        console.log(chalk.yellow('Examples:'));
        console.log('  node cli.js quick https://github.com/microsoft/vscode 2025-01-15');
        console.log('  node cli.js enhanced https://github.com/microsoft/vscode 2025-01-15 --openai-key sk-...');
        console.log('  node cli.js range https://github.com/microsoft/vscode 2025-01-01 2025-01-15 --enhanced');
        console.log('  node cli.js stats https://github.com/microsoft/vscode --from 2025-01-01 --to 2025-01-15\n');

        console.log(chalk.yellow('Options:'));
        console.log('  --output <filename>    Output filename');
        console.log('  --format <format>      Output format (markdown, text, html, json)');
        console.log('  --branch <branch>       Branch name (default: main)');
        console.log('  --openai-key <key>     OpenAI API key (enhanced only)');
        console.log('  --enhanced             Use enhanced report with AI analysis');
        console.log('  --from <date>         Start date for statistics (YYYY-MM-DD)');
        console.log('  --to <date>           End date for statistics (YYYY-MM-DD)\n');

        console.log(chalk.yellow('Configuration:'));
        console.log('  Edit app/config/config.js to set your GitHub token and OpenAI API key\n');
    });

// Parse command line arguments
program.parse();

// If no command provided, show help
if (!process.argv.slice(2).length) {
    program.help();
}
