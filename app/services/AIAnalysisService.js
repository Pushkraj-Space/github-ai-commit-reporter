/**
 * AI Analysis Service
 * Handles AI-powered analysis of commits using OpenAI
 */

const OpenAI = require('openai');
const { OPENAI_API_KEY } = require('../config/config');

class AIAnalysisService {
    constructor(apiKey = OPENAI_API_KEY) {
        this.apiKey = apiKey;
        this.openai = apiKey ? new OpenAI({ apiKey }) : null;
    }

    /**
     * Analyze a commit using AI
     * @param {Object} commit - Commit data
     * @returns {Promise<string>} AI-generated analysis
     */
    async analyzeCommit(commit) {
        if (!this.openai) {
            return this.generateBasicAnalysis(commit);
        }

        try {
            const context = this.prepareContext(commit);

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
     * Prepare context for AI analysis
     * @param {Object} commit - Commit data
     * @returns {string} Formatted context
     */
    prepareContext(commit) {
        const commitMessage = commit.message;
        const filesChanged = commit.files;
        const stats = commit.stats;

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

        return context;
    }

    /**
     * Generate basic analysis without AI
     * @param {Object} commit - Commit data
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
     * Analyze multiple commits
     * @param {Array} commits - Array of commit data
     * @returns {Promise<Array>} Array of analyses
     */
    async analyzeCommits(commits) {
        const analyses = [];

        for (const commit of commits) {
            const analysis = await this.analyzeCommit(commit);
            analyses.push({
                commit: commit,
                analysis: analysis
            });
        }

        return analyses;
    }

    /**
     * Generate summary analysis for multiple commits
     * @param {Array} commits - Array of commit data
     * @returns {Promise<string>} Summary analysis
     */
    async generateSummaryAnalysis(commits) {
        if (!this.openai || commits.length === 0) {
            return this.generateBasicSummary(commits);
        }

        try {
            const context = this.prepareSummaryContext(commits);

            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a software development analyst. Analyze a series of commits and provide a comprehensive summary of the development work accomplished."
                    },
                    { role: "user", content: context }
                ],
                max_tokens: 500,
                temperature: 0.3
            });

            return response.choices[0].message.content.trim();

        } catch (error) {
            console.error(`AI summary analysis failed: ${error.message}`);
            return this.generateBasicSummary(commits);
        }
    }

    /**
     * Prepare context for summary analysis
     * @param {Array} commits - Array of commit data
     * @returns {string} Formatted context
     */
    prepareSummaryContext(commits) {
        let context = `Analyze the following commits and provide a comprehensive summary:\n\n`;

        commits.forEach((commit, index) => {
            context += `Commit ${index + 1}: ${commit.message}\n`;
            context += `Files: ${commit.files.map(f => f.filename).join(', ')}\n`;
            context += `Changes: +${commit.stats.additions} -${commit.stats.deletions} lines\n\n`;
        });

        context += `Please provide:\n`;
        context += `1. Overall development themes and patterns\n`;
        context += `2. Key features or improvements implemented\n`;
        context += `3. Technical areas of focus\n`;
        context += `4. Development progress and accomplishments\n`;

        return context;
    }

    /**
     * Generate basic summary without AI
     * @param {Array} commits - Array of commit data
     * @returns {string} Basic summary
     */
    generateBasicSummary(commits) {
        if (commits.length === 0) {
            return "No commits to analyze.";
        }

        const totalCommits = commits.length;
        const totalAdditions = commits.reduce((sum, commit) => sum + commit.stats.additions, 0);
        const totalDeletions = commits.reduce((sum, commit) => sum + commit.stats.deletions, 0);
        const netChanges = totalAdditions - totalDeletions;

        return `Development Summary:\n` +
            `- Total commits: ${totalCommits}\n` +
            `- Total additions: +${totalAdditions} lines\n` +
            `- Total deletions: -${totalDeletions} lines\n` +
            `- Net changes: ${netChanges} lines\n` +
            `- Average changes per commit: ${Math.round((totalAdditions + totalDeletions) / totalCommits)} lines`;
    }

    /**
     * Check if AI analysis is available
     * @returns {boolean} True if AI is available
     */
    isAvailable() {
        return !!this.openai;
    }
}

module.exports = AIAnalysisService;
