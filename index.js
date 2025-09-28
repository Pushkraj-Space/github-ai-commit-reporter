#!/usr/bin/env node
/**
 * GitHub Commit Reporter - Main Entry Point
 * 
 * This is the main entry point that provides a unified interface
 * for both quick and enhanced commit reporting.
 */

const { program } = require('commander');
const chalk = require('chalk');

// Import the reporters
const QuickGitHubCommitReporter = require('./app/controllers/quick-commit-reporter');
const EnhancedGitHubCommitReporter = require('./enhanced-commit-reporter');

program
    .name('github-commit-reporter')
    .description('Generate day-wise commit reports from GitHub repositories')
    .version('1.0.0');

// Quick reporter command
program
    .command('quick <repo_url> <date>')
    .description('Generate a quick commit report (fast and efficient)')
    .option('--output <filename>', 'Output filename')
    .option('--format <format>', 'Output format (markdown or text)', 'text')
    .action(async (repoUrl, date, options) => {
        console.log(chalk.blue('🚀 Running Quick Commit Reporter...'));
        try {
            const { GITHUB_TOKEN } = require('./config');
            const reporter = new QuickGitHubCommitReporter(GITHUB_TOKEN);

            const { owner, repo } = reporter.extractRepoInfo(repoUrl);
            console.log(chalk.blue(`Repository: ${owner}/${repo}`));
            console.log(chalk.blue(`Target date: ${date}`));

            const commits = await reporter.getCommitsForDate(owner, repo, date);
            console.log(chalk.green(`Found ${commits.length} commits`));

            if (commits.length > 0) {
                const report = reporter.generateQuickReport(commits, date, options.format);
                const outputFilename = options.output || `quick-report-${date}.txt`;
                await reporter.saveReport(report, outputFilename);

                // Print summary
                const totalAdditions = commits.reduce((sum, commit) => sum + commit.stats.additions, 0);
                const totalDeletions = commits.reduce((sum, commit) => sum + commit.stats.deletions, 0);
                console.log(chalk.cyan(`\nSummary: ${commits.length} commits, +${totalAdditions} -${totalDeletions} lines`));
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
    .option('--format <format>', 'Output format (markdown or text)', 'text')
    .option('--openai-key <key>', 'OpenAI API key for AI analysis')
    .action(async (repoUrl, date, options) => {
        console.log(chalk.blue('🤖 Running Enhanced Commit Reporter...'));
        try {
            const { GITHUB_TOKEN, OPENAI_API_KEY } = require('./config');
            const openaiKey = options.openaiKey || OPENAI_API_KEY;
            const reporter = new EnhancedGitHubCommitReporter(GITHUB_TOKEN, openaiKey);

            const { owner, repo } = reporter.extractRepoInfo(repoUrl);
            console.log(chalk.blue(`Repository: ${owner}/${repo}`));
            console.log(chalk.blue(`Target date: ${date}`));

            const commits = await reporter.getCommits(owner, repo);
            const targetCommits = reporter.filterCommitsByDate(commits, date);
            console.log(chalk.green(`Found ${targetCommits.length} commits`));

            if (targetCommits.length > 0) {
                const report = await reporter.generateEnhancedReport(targetCommits, date, options.format);
                const outputFilename = options.output || `enhanced-report-${date}.txt`;
                await reporter.saveReport(report, outputFilename);

                // Print summary
                const totalAdditions = targetCommits.reduce((sum, commit) => sum + commit.stats.additions, 0);
                const totalDeletions = targetCommits.reduce((sum, commit) => sum + commit.stats.deletions, 0);
                console.log(chalk.cyan(`\nSummary: ${targetCommits.length} commits, +${totalAdditions} -${totalDeletions} lines`));
                console.log(chalk.cyan(`AI Analysis: ${openaiKey ? 'Enabled' : 'Disabled'}`));
            } else {
                console.log(chalk.yellow('No commits found for the specified date'));
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
        console.log('  node index.js quick <repo_url> <date>');
        console.log('  node index.js enhanced <repo_url> <date>\n');

        console.log(chalk.yellow('Examples:'));
        console.log('  node index.js quick https://github.com/microsoft/vscode 2025-01-15');
        console.log('  node index.js enhanced https://github.com/microsoft/vscode 2025-01-15 --openai-key sk-...\n');

        console.log(chalk.yellow('Options:'));
        console.log('  --output <filename>    Output filename');
        console.log('  --format <format>      Output format (markdown or text)');
        console.log('  --openai-key <key>     OpenAI API key (enhanced only)\n');

        console.log(chalk.yellow('Configuration:'));
        console.log('  Edit config.js to set your GitHub token and OpenAI API key\n');
    });

// Parse command line arguments
program.parse();

// If no command provided, show help
if (!process.argv.slice(2).length) {
    program.help();
}
