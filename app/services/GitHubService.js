/**
 * GitHub Service
 * Handles all GitHub API interactions
 */

const axios = require('axios');
const { GITHUB_TOKEN } = require('../config/config');

class GitHubService {
    constructor(token = GITHUB_TOKEN) {
        this.token = token;
        this.baseUrl = 'https://api.github.com';
        this.headers = {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version': '2022-11-28'
        };
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
     * Get user repositories
     * @param {Object} options - Options for fetching repositories
     * @returns {Promise<Array>} List of repositories
     */
    async getUserRepositories(options = {}) {
        const params = {
            sort: options.sort || 'updated',
            per_page: options.per_page || 100,
            type: options.type || 'all',
            visibility: options.visibility || 'all',
            ...options
        };

        try {
            const response = await axios.get(`${this.baseUrl}/user/repos`, {
                headers: this.headers,
                params
            });

            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch repositories: ${error.message}`);
        }
    }

    /**
     * Get repository branches
     * @param {string} owner - Repository owner
     * @param {string} repo - Repository name
     * @returns {Promise<Array>} List of branches
     */
    async getRepositoryBranches(owner, repo) {
        try {
            const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/branches`, {
                headers: this.headers
            });

            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch branches: ${error.message}`);
        }
    }

    /**
     * Get commits for a repository
     * @param {string} owner - Repository owner
     * @param {string} repo - Repository name
     * @param {Object} options - Options for fetching commits
     * @returns {Promise<Array>} List of commits
     */
    async getCommits(owner, repo, options = {}) {
        const commits = [];
        let page = 1;
        const perPage = options.per_page || 100;

        while (true) {
            const params = {
                page,
                per_page: perPage,
                sha: options.branch || 'main',
                ...options
            };

            try {
                const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/commits`, {
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
                throw new Error(`Error fetching commits: ${error.message}`);
            }
        }

        return commits;
    }

    /**
     * Get commits for a specific date range
     * @param {string} owner - Repository owner
     * @param {string} repo - Repository name
     * @param {string} fromDate - Start date
     * @param {string} toDate - End date
     * @param {string} branch - Branch name
     * @param {string} author - Author/committer filter (optional)
     * @returns {Promise<Array>} List of commits
     */
    async getCommitsForDateRange(owner, repo, fromDate, toDate, branch = 'main', author = null) {
        const options = {
            since: fromDate,
            until: toDate,
            branch
        };

        // Add author filter if specified
        if (author) {
            options.author = author;
        }

        return await this.getCommits(owner, repo, options);
    }

    /**
     * Get commits for a specific date
     * @param {string} owner - Repository owner
     * @param {string} repo - Repository name
     * @param {string} date - Target date
     * @param {string} branch - Branch name
     * @param {string} author - Author/committer filter (optional)
     * @returns {Promise<Array>} List of commits
     */
    async getCommitsForDate(owner, repo, date, branch = 'main', author = null) {
        const moment = require('moment');
        const fromDate = date;
        const toDate = moment(date).add(1, 'day').format('YYYY-MM-DD');

        return await this.getCommitsForDateRange(owner, repo, fromDate, toDate, branch, author);
    }

    /**
     * Get detailed information about a specific commit
     * @param {string} owner - Repository owner
     * @param {string} repo - Repository name
     * @param {string} sha - Commit SHA
     * @returns {Promise<Object>} Detailed commit information
     */
    async getCommitDetails(owner, repo, sha) {
        try {
            const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/commits/${sha}`, {
                headers: this.headers
            });

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
            throw new Error(`Error fetching commit details for ${sha}: ${error.message}`);
        }
    }

    /**
     * Get commit diff/patch
     * @param {string} owner - Repository owner
     * @param {string} repo - Repository name
     * @param {string} sha - Commit SHA
     * @returns {Promise<Object>} Commit diff data
     */
    async getCommitDiff(owner, repo, sha) {
        try {
            const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/commits/${sha}`, {
                headers: {
                    ...this.headers,
                    'Accept': 'application/vnd.github.v3.diff'
                }
            });

            return {
                sha: sha,
                diff: response.data,
                files: this.parseDiffFiles(response.data)
            };
        } catch (error) {
            throw new Error(`Error fetching commit diff for ${sha}: ${error.message}`);
        }
    }

    /**
     * Parse diff to extract file information
     * @param {string} diff - Raw diff string
     * @returns {Array} Array of file changes
     */
    parseDiffFiles(diff) {
        const files = [];
        const lines = diff.split('\n');
        let currentFile = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.startsWith('diff --git')) {
                if (currentFile) {
                    files.push(currentFile);
                }
                currentFile = {
                    filename: this.extractFilenameFromDiffLine(line),
                    additions: 0,
                    deletions: 0,
                    changes: []
                };
            } else if (line.startsWith('@@') && currentFile) {
                // Parse hunk header
                const hunkMatch = line.match(/@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@/);
                if (hunkMatch) {
                    currentFile.changes.push({
                        oldStart: parseInt(hunkMatch[1]),
                        oldLines: parseInt(hunkMatch[2]) || 1,
                        newStart: parseInt(hunkMatch[3]),
                        newLines: parseInt(hunkMatch[4]) || 1
                    });
                }
            } else if (line.startsWith('+') && !line.startsWith('+++') && currentFile) {
                currentFile.additions++;
            } else if (line.startsWith('-') && !line.startsWith('---') && currentFile) {
                currentFile.deletions++;
            }
        }

        if (currentFile) {
            files.push(currentFile);
        }

        return files;
    }

    /**
     * Extract filename from diff line
     * @param {string} line - Diff line
     * @returns {string} Filename
     */
    extractFilenameFromDiffLine(line) {
        const match = line.match(/diff --git a\/(.+) b\/(.+)/);
        if (match) {
            return match[2]; // Return the 'b' filename (new filename)
        }
        return '';
    }

    /**
     * Get repository information
     * @param {string} owner - Repository owner
     * @param {string} repo - Repository name
     * @returns {Promise<Object>} Repository information
     */
    async getRepository(owner, repo) {
        try {
            const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}`, {
                headers: this.headers
            });

            return response.data;
        } catch (error) {
            throw new Error(`Error fetching repository: ${error.message}`);
        }
    }

    /**
     * Check if token is valid
     * @returns {Promise<boolean>} True if token is valid
     */
    async validateToken() {
        try {
            const response = await axios.get(`${this.baseUrl}/user`, {
                headers: this.headers
            });

            return response.status === 200;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get repository contributors
     * @param {string} owner - Repository owner
     * @param {string} repo - Repository name
     * @returns {Promise<Array>} List of contributors
     */
    async getRepositoryContributors(owner, repo) {
        try {
            const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/contributors`, {
                headers: this.headers,
                params: {
                    per_page: 100,
                    sort: 'contributions',
                    order: 'desc'
                }
            });

            return response.data;
        } catch (error) {
            throw new Error(`Error fetching repository contributors: ${error.message}`);
        }
    }

    /**
     * Get rate limit information
     * @returns {Promise<Object>} Rate limit information
     */
    async getRateLimit() {
        try {
            const response = await axios.get(`${this.baseUrl}/rate_limit`, {
                headers: this.headers
            });

            return response.data;
        } catch (error) {
            throw new Error(`Error fetching rate limit: ${error.message}`);
        }
    }
}

module.exports = GitHubService;
