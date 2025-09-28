/**
 * GitHub Configuration
 * Replace 'your_token_here' with your actual GitHub Personal Access Token
 */
require('dotenv').config();
// GitHub Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEFAULT_REPO = process.env.DEFAULT_REPO;
const DEFAULT_DATE = process.env.DEFAULT_DATE;

module.exports = {
    GITHUB_TOKEN,
    OPENAI_API_KEY,
    DEFAULT_REPO,
    DEFAULT_DATE
};
