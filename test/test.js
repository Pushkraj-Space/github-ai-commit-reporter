#!/usr/bin/env node
/**
 * Test file for GitHub Commit Reporter
 * 
 * This file tests the basic functionality of the reporters
 * without making actual API calls.
 */

const chalk = require('chalk');
const QuickGitHubCommitReporter = require('../app/controllers/quick-commit-reporter');
const EnhancedGitHubCommitReporter = require('../enhanced-commit-reporter');

console.log(chalk.blue('🧪 Testing GitHub Commit Reporter...\n'));

// Test 1: Check if classes can be instantiated
console.log(chalk.yellow('Test 1: Class Instantiation'));

try {
    const quickReporter = new QuickGitHubCommitReporter('test_token');
    console.log(chalk.green('✅ QuickGitHubCommitReporter instantiated successfully'));
} catch (error) {
    console.log(chalk.red(`❌ QuickGitHubCommitReporter failed: ${error.message}`));
}

try {
    const enhancedReporter = new EnhancedGitHubCommitReporter('test_token');
    console.log(chalk.green('✅ EnhancedGitHubCommitReporter instantiated successfully'));
} catch (error) {
    console.log(chalk.red(`❌ EnhancedGitHubCommitReporter failed: ${error.message}`));
}

// Test 2: Test URL parsing
console.log(chalk.yellow('\nTest 2: URL Parsing'));

const testUrls = [
    'https://github.com/microsoft/vscode',
    'https://github.com/microsoft/vscode.git',
    'git@github.com:microsoft/vscode.git',
    'git@github.com:microsoft/vscode'
];

testUrls.forEach((url, index) => {
    try {
        const quickReporter = new QuickGitHubCommitReporter('test_token');
        const { owner, repo } = quickReporter.extractRepoInfo(url);
        console.log(chalk.green(`✅ URL ${index + 1}: ${owner}/${repo}`));
    } catch (error) {
        console.log(chalk.red(`❌ URL ${index + 1} failed: ${error.message}`));
    }
});

// Test 3: Test report generation with mock data
console.log(chalk.yellow('\nTest 3: Report Generation'));

const mockCommits = [
    {
        sha: 'abc123',
        message: 'Add new feature for user authentication',
        author: {
            name: 'John Doe',
            email: 'john@example.com',
            date: '2025-01-15T14:30:25Z'
        },
        stats: {
            additions: 150,
            deletions: 25,
            total: 175
        },
        files: [
            {
                filename: 'src/auth.js',
                status: 'added',
                additions: 100,
                deletions: 0,
                changes: 100
            },
            {
                filename: 'tests/test_auth.js',
                status: 'added',
                additions: 50,
                deletions: 0,
                changes: 50
            }
        ]
    },
    {
        sha: 'def456',
        message: 'Fix bug in login validation',
        author: {
            name: 'John Doe',
            email: 'john@example.com',
            date: '2025-01-15T16:45:12Z'
        },
        stats: {
            additions: 12,
            deletions: 8,
            total: 20
        },
        files: [
            {
                filename: 'src/auth.js',
                status: 'modified',
                additions: 8,
                deletions: 4,
                changes: 12
            },
            {
                filename: 'tests/test_auth.js',
                status: 'modified',
                additions: 4,
                deletions: 4,
                changes: 8
            }
        ]
    }
];

try {
    const quickReporter = new QuickGitHubCommitReporter('test_token');
    const report = quickReporter.generateQuickReport(mockCommits, '2025-01-15', 'text');
    console.log(chalk.green('✅ Quick report generation successful'));
    console.log(chalk.cyan('Sample output:'));
    console.log(report.substring(0, 200) + '...\n');
} catch (error) {
    console.log(chalk.red(`❌ Quick report generation failed: ${error.message}`));
}

try {
    const enhancedReporter = new EnhancedGitHubCommitReporter('test_token');
    const report = enhancedReporter.generateBasicAnalysis(mockCommits[0]);
    console.log(chalk.green('✅ Enhanced analysis generation successful'));
    console.log(chalk.cyan('Sample analysis:'));
    console.log(report.substring(0, 200) + '...\n');
} catch (error) {
    console.log(chalk.red(`❌ Enhanced analysis generation failed: ${error.message}`));
}

// Test 4: Test date filtering
console.log(chalk.yellow('Test 4: Date Filtering'));

try {
    const enhancedReporter = new EnhancedGitHubCommitReporter('test_token');
    const filteredCommits = enhancedReporter.filterCommitsByDate(mockCommits, '2025-01-15');
    console.log(chalk.green(`✅ Date filtering successful: ${filteredCommits.length} commits found`));
} catch (error) {
    console.log(chalk.red(`❌ Date filtering failed: ${error.message}`));
}

// Test 5: Test status emoji generation
console.log(chalk.yellow('\nTest 5: Status Emoji Generation'));

const statusTests = ['added', 'modified', 'removed', 'renamed', 'unknown'];

statusTests.forEach(status => {
    try {
        const quickReporter = new QuickGitHubCommitReporter('test_token');
        const emoji = quickReporter.getStatusEmoji(status);
        console.log(chalk.green(`✅ Status '${status}': ${emoji}`));
    } catch (error) {
        console.log(chalk.red(`❌ Status '${status}' failed: ${error.message}`));
    }
});

// Test 6: Check configuration
console.log(chalk.yellow('\nTest 6: Configuration Check'));

try {
    const config = require('../app/config/config');
    console.log(chalk.green('✅ Configuration loaded successfully'));
    console.log(chalk.cyan(`GitHub Token: ${config.GITHUB_TOKEN ? 'Set' : 'Not set'}`));
    console.log(chalk.cyan(`OpenAI API Key: ${config.OPENAI_API_KEY ? 'Set' : 'Not set'}`));
} catch (error) {
    console.log(chalk.red(`❌ Configuration loading failed: ${error.message}`));
}

console.log(chalk.blue('\n🎉 All tests completed!'));
console.log(chalk.yellow('\nTo run the actual reporters:'));
console.log(chalk.cyan('  node quick-commit-reporter.js <repo_url> <date>'));
console.log(chalk.cyan('  node enhanced-commit-reporter.js <repo_url> <date>'));
console.log(chalk.cyan('  node index.js quick <repo_url> <date>'));
console.log(chalk.cyan('  node index.js enhanced <repo_url> <date>'));
