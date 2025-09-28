/**
 * Repository Controller
 * Handles repository-related operations
 */

const GitHubService = require('../services/GitHubService');
const Repository = require('../models/Repository');

class RepositoryController {
    constructor() {
        this.githubService = new GitHubService();
    }

    /**
     * Get user repositories
     * @param {Object} options - Options for fetching repositories
     * @returns {Promise<Array>} Array of repositories
     */
    async getUserRepositories(options = {}) {
        try {
            const repositories = await this.githubService.getUserRepositories(options);
            return repositories.map(repoData => new Repository(repoData));
        } catch (error) {
            throw new Error(`Failed to get user repositories: ${error.message}`);
        }
    }

    /**
     * Get repository by URL
     * @param {string} repoUrl - Repository URL
     * @returns {Promise<Repository>} Repository object
     */
    async getRepositoryByUrl(repoUrl) {
        try {
            const { owner, repo } = this.githubService.extractRepoInfo(repoUrl);
            const repoData = await this.githubService.getRepository(owner, repo);
            return new Repository(repoData);
        } catch (error) {
            throw new Error(`Failed to get repository: ${error.message}`);
        }
    }

    /**
     * Get repository branches
     * @param {string} repoUrl - Repository URL
     * @returns {Promise<Array>} Array of branches
     */
    async getRepositoryBranches(repoUrl) {
        try {
            const { owner, repo } = this.githubService.extractRepoInfo(repoUrl);
            return await this.githubService.getRepositoryBranches(owner, repo);
        } catch (error) {
            throw new Error(`Failed to get repository branches: ${error.message}`);
        }
    }

    /**
     * Validate repository URL
     * @param {string} repoUrl - Repository URL
     * @returns {boolean} True if valid
     */
    validateRepositoryUrl(repoUrl) {
        try {
            this.githubService.extractRepoInfo(repoUrl);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get repository information
     * @param {string} repoUrl - Repository URL
     * @returns {Promise<Object>} Repository information
     */
    async getRepositoryInfo(repoUrl) {
        try {
            const repository = await this.getRepositoryByUrl(repoUrl);
            return {
                name: repository.name,
                fullName: repository.fullName,
                owner: repository.owner,
                description: repository.getDescription(),
                defaultBranch: repository.defaultBranch,
                isPrivate: repository.private,
                lastUpdated: repository.getLastUpdated(),
                urls: repository.getUrls()
            };
        } catch (error) {
            throw new Error(`Failed to get repository information: ${error.message}`);
        }
    }

    /**
     * Check if repository is accessible
     * @param {string} repoUrl - Repository URL
     * @returns {Promise<boolean>} True if accessible
     */
    async isRepositoryAccessible(repoUrl) {
        try {
            const repository = await this.getRepositoryByUrl(repoUrl);
            return repository.isAccessible();
        } catch (error) {
            return false;
        }
    }

    /**
     * Get repository statistics
     * @param {string} repoUrl - Repository URL
     * @returns {Promise<Object>} Repository statistics
     */
    async getRepositoryStatistics(repoUrl) {
        try {
            const repository = await this.getRepositoryByUrl(repoUrl);
            const branches = await this.getRepositoryBranches(repoUrl);

            return {
                name: repository.name,
                fullName: repository.fullName,
                owner: repository.owner,
                description: repository.getDescription(),
                defaultBranch: repository.defaultBranch,
                branchCount: branches.length,
                branches: branches.map(branch => ({
                    name: branch.name,
                    protected: branch.protected
                })),
                isPrivate: repository.private,
                lastUpdated: repository.getLastUpdated(),
                urls: repository.getUrls()
            };
        } catch (error) {
            throw new Error(`Failed to get repository statistics: ${error.message}`);
        }
    }

    /**
     * Search repositories
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @returns {Promise<Array>} Array of repositories
     */
    async searchRepositories(query, options = {}) {
        try {
            const repositories = await this.getUserRepositories(options);
            return repositories.filter(repo =>
                repo.name.toLowerCase().includes(query.toLowerCase()) ||
                repo.description.toLowerCase().includes(query.toLowerCase())
            );
        } catch (error) {
            throw new Error(`Failed to search repositories: ${error.message}`);
        }
    }

    /**
     * Get repository by name
     * @param {string} name - Repository name
     * @param {Array} repositories - Array of repositories
     * @returns {Repository|null} Repository object or null
     */
    getRepositoryByName(name, repositories) {
        return repositories.find(repo => repo.name === name) || null;
    }

    /**
     * Get repositories by owner
     * @param {string} owner - Owner name
     * @param {Array} repositories - Array of repositories
     * @returns {Array} Array of repositories
     */
    getRepositoriesByOwner(owner, repositories) {
        return repositories.filter(repo => repo.owner === owner);
    }

    /**
     * Get private repositories
     * @param {Array} repositories - Array of repositories
     * @returns {Array} Array of private repositories
     */
    getPrivateRepositories(repositories) {
        return repositories.filter(repo => repo.private);
    }

    /**
     * Get public repositories
     * @param {Array} repositories - Array of repositories
     * @returns {Array} Array of public repositories
     */
    getPublicRepositories(repositories) {
        return repositories.filter(repo => !repo.private);
    }

    /**
     * Sort repositories by update date
     * @param {Array} repositories - Array of repositories
     * @param {string} order - Sort order ('asc' or 'desc')
     * @returns {Array} Sorted repositories
     */
    sortRepositoriesByDate(repositories, order = 'desc') {
        return repositories.sort((a, b) => {
            const dateA = new Date(a.updatedAt);
            const dateB = new Date(b.updatedAt);

            if (order === 'asc') {
                return dateA - dateB;
            } else {
                return dateB - dateA;
            }
        });
    }

    /**
     * Get repository summary
     * @param {string} repoUrl - Repository URL
     * @returns {Promise<Object>} Repository summary
     */
    async getRepositorySummary(repoUrl) {
        try {
            const repository = await this.getRepositoryByUrl(repoUrl);
            const branches = await this.getRepositoryBranches(repoUrl);

            return {
                name: repository.getDisplayName(),
                description: repository.getDescription(),
                defaultBranch: repository.defaultBranch,
                branchCount: branches.length,
                isPrivate: repository.private,
                lastUpdated: repository.getLastUpdated(),
                urls: repository.getUrls()
            };
        } catch (error) {
            throw new Error(`Failed to get repository summary: ${error.message}`);
        }
    }
}

module.exports = RepositoryController;
