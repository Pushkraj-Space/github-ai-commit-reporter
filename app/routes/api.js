/**
 * API Routes
 * Defines all API endpoints for the GitHub Commit Reporter
 */

const express = require('express');
const router = express.Router();
const CommitController = require('../controllers/CommitController');
const RepositoryController = require('../controllers/RepositoryController');
const ReportController = require('../controllers/ReportController');

// Initialize controllers
const commitController = new CommitController();
const repositoryController = new RepositoryController();
const reportController = new ReportController();

/**
 * @route POST /api/generate-report
 * @desc Generate a commit report
 * @access Public
 */
router.post('/generate-report', async (req, res) => {
    try {
        const { repoUrl, branch, fromDate, toDate, reportType, outputFormat, openaiKey, author } = req.body;

        // Validate inputs
        if (!repoUrl || !fromDate || !toDate) {
            return res.status(400).json({
                error: 'Repository URL, from date, and to date are required'
            });
        }

        let reportData;

        if (reportType === 'enhanced') {
            reportData = await reportController.generateEnhancedReport(
                repoUrl,
                fromDate,
                toDate,
                branch || 'main',
                outputFormat || 'text',
                openaiKey,
                author
            );
        } else {
            reportData = await reportController.generateQuickReport(
                repoUrl,
                fromDate,
                toDate,
                branch || 'main',
                outputFormat || 'text',
                author
            );
        }

        res.json(reportData);

    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route GET /api/repositories
 * @desc Get user repositories
 * @access Public
 */
router.get('/repositories', async (req, res) => {
    try {
        const { sort, per_page, type } = req.query;
        const options = { sort, per_page, type, visibility: 'all' };

        const repositories = await repositoryController.getUserRepositories(options);
        // console.log(repositories);
        res.json(repositories);

    } catch (error) {
        console.error('Error fetching repositories:', error);
        res.status(500).json({ error: 'Failed to fetch repositories. Please check your GitHub token.' });
    }
});

/**
 * @route GET /api/branches/:owner/:repo
 * @desc Get repository branches
 * @access Public
 */
router.get('/branches/:owner/:repo', async (req, res) => {
    try {
        const { owner, repo } = req.params;
        const repoUrl = `https://github.com/${owner}/${repo}`;

        const branches = await repositoryController.getRepositoryBranches(repoUrl);
        res.json(branches);

    } catch (error) {
        console.error('Error fetching branches:', error);
        res.status(500).json({ error: 'Failed to fetch branches' });
    }
});

/**
 * @route GET /api/repository/:owner/:repo
 * @desc Get repository information
 * @access Public
 */
router.get('/repository/:owner/:repo', async (req, res) => {
    try {
        const { owner, repo } = req.params;
        const repoUrl = `https://github.com/${owner}/${repo}`;

        const repository = await repositoryController.getRepositoryByUrl(repoUrl);
        res.json(repository);

    } catch (error) {
        console.error('Error fetching repository:', error);
        res.status(500).json({ error: 'Failed to fetch repository' });
    }
});

/**
 * @route GET /api/commits/:owner/:repo
 * @desc Get commits for a repository
 * @access Public
 */
router.get('/commits/:owner/:repo', async (req, res) => {
    try {
        const { owner, repo } = req.params;
        const { branch, fromDate, toDate, author } = req.query;
        const repoUrl = `https://github.com/${owner}/${repo}`;

        let commits;
        if (fromDate && toDate) {
            commits = await commitController.getCommitsForDateRange(repoUrl, fromDate, toDate, branch, author);
        } else {
            commits = await commitController.getAllCommits(repoUrl, branch);
        }

        res.json(commits);

    } catch (error) {
        console.error('Error fetching commits:', error);
        res.status(500).json({ error: 'Failed to fetch commits' });
    }
});

/**
 * @route GET /api/commits/:owner/:repo/:sha
 * @desc Get specific commit details
 * @access Public
 */
router.get('/commits/:owner/:repo/:sha', async (req, res) => {
    try {
        const { owner, repo, sha } = req.params;
        const repoUrl = `https://github.com/${owner}/${repo}`;

        const commit = await commitController.getCommitDetails(repoUrl, sha);
        res.json(commit);

    } catch (error) {
        console.error('Error fetching commit details:', error);
        res.status(500).json({ error: 'Failed to fetch commit details' });
    }
});

/**
 * @route GET /api/commits/:owner/:repo/:sha/diff
 * @desc Get commit diff/patch
 * @access Public
 */
router.get('/commits/:owner/:repo/:sha/diff', async (req, res) => {
    try {
        const { owner, repo, sha } = req.params;
        const repoUrl = `https://github.com/${owner}/${repo}`;

        const diff = await commitController.getCommitDiff(repoUrl, sha);
        res.json(diff);

    } catch (error) {
        console.error('Error fetching commit diff:', error);
        res.status(500).json({ error: 'Failed to fetch commit diff' });
    }
});

/**
 * @route GET /api/statistics/:owner/:repo
 * @desc Get repository statistics
 * @access Public
 */
router.get('/statistics/:owner/:repo', async (req, res) => {
    try {
        const { owner, repo } = req.params;
        const { fromDate, toDate, branch } = req.query;
        const repoUrl = `https://github.com/${owner}/${repo}`;

        let commits;
        if (fromDate && toDate) {
            commits = await commitController.getCommitsForDateRange(repoUrl, fromDate, toDate, branch);
        } else {
            commits = await commitController.getAllCommits(repoUrl, branch);
        }

        const statistics = commitController.getCommitStatistics(commits);
        res.json(statistics);

    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

/**
 * @route GET /api/contributors/:owner/:repo
 * @desc Get repository contributors (authors/committers)
 * @access Public
 */
router.get('/contributors/:owner/:repo', async (req, res) => {
    try {
        const { owner, repo } = req.params;
        const { branch } = req.query;
        const repoUrl = `https://github.com/${owner}/${repo}`;

        const contributors = await commitController.getRepositoryContributors(repoUrl, branch);
        res.json(contributors);

    } catch (error) {
        console.error('Error fetching contributors:', error);
        res.status(500).json({ error: 'Failed to fetch contributors' });
    }
});

/**
 * @route POST /api/analyze-commits
 * @desc Analyze commits with AI
 * @access Public
 */
router.post('/analyze-commits', async (req, res) => {
    try {
        const { commits, openaiKey } = req.body;

        if (!commits || !Array.isArray(commits)) {
            return res.status(400).json({ error: 'Commits array is required' });
        }

        const analyses = await commitController.analyzeCommitsWithAI(commits);
        res.json(analyses);

    } catch (error) {
        console.error('Error analyzing commits:', error);
        res.status(500).json({ error: 'Failed to analyze commits' });
    }
});

/**
 * @route GET /api/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/health', (req, res) => {
    const { GITHUB_TOKEN } = require('../config/config');

    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        githubToken: GITHUB_TOKEN ? 'Configured' : 'Not configured',
        version: '1.0.0'
    });
});

/**
 * @route GET /api/validate-repository
 * @desc Validate repository URL
 * @access Public
 */
router.get('/validate-repository', (req, res) => {
    try {
        const { repoUrl } = req.query;

        if (!repoUrl) {
            return res.status(400).json({ error: 'Repository URL is required' });
        }

        const isValid = repositoryController.validateRepositoryUrl(repoUrl);
        res.json({ valid: isValid });

    } catch (error) {
        console.error('Error validating repository:', error);
        res.status(500).json({ error: 'Failed to validate repository' });
    }
});

/**
 * @route POST /api/save-report
 * @desc Save report to file
 * @access Public
 */
router.post('/save-report', async (req, res) => {
    try {
        const { report, filename } = req.body;

        if (!report || !filename) {
            return res.status(400).json({ error: 'Report content and filename are required' });
        }

        const filePath = await reportController.saveReport(report, filename);
        res.json({ filePath, message: 'Report saved successfully' });

    } catch (error) {
        console.error('Error saving report:', error);
        res.status(500).json({ error: 'Failed to save report' });
    }
});

/**
 * @route POST /api/generate-selected-commits-report
 * @desc Generate report for selected commits
 * @access Public
 */
router.post('/generate-selected-commits-report', async (req, res) => {
    try {
        const { commits, reportType, outputFormat, openaiKey } = req.body;

        // Validate inputs
        if (!commits || !Array.isArray(commits) || commits.length === 0) {
            return res.status(400).json({
                error: 'Commits array is required and must not be empty'
            });
        }

        if (!reportType || !outputFormat) {
            return res.status(400).json({
                error: 'Report type and output format are required'
            });
        }

        let reportData;

        if (reportType === 'enhanced') {
            if (!openaiKey) {
                return res.status(400).json({
                    error: 'OpenAI API key is required for enhanced reports'
                });
            }
            reportData = await reportController.generateEnhancedReportForSelectedCommits(
                commits,
                outputFormat,
                openaiKey
            );
        } else {
            reportData = await reportController.generateQuickReportForSelectedCommits(
                commits,
                outputFormat
            );
        }

        res.json(reportData);

    } catch (error) {
        console.error('Error generating selected commits report:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
