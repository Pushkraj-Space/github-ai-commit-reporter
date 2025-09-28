# Quick Start Guide

## Your GitHub Automation Project is Ready! 🚀

### What's Available

1. **Enhanced Commit Reporter** (`enhanced-commit-reporter.js`) - Full-featured with AI analysis
2. **Quick Commit Reporter** (`quick-commit-reporter.js`) - Fast and efficient for daily use

### Quick Usage Examples

#### 1. Generate a Quick Report (Recommended for daily use)
```bash
node quick-commit-reporter.js https://github.com/username/repo 2024-12-01 --format text --output my_report.txt
```

#### 2. Generate a Detailed Report with AI Analysis
```bash
node enhanced-commit-reporter.js https://github.com/username/repo 2024-12-01 --format markdown --output detailed_report.md --openai-key your_openai_key
```

### Configuration

Your GitHub token is already configured in `config.js`. For AI analysis, you can optionally add your OpenAI API key:

```javascript
// In config.js
const OPENAI_API_KEY = "your_openai_api_key_here";
```

### Sample Commands

**Generate a text report for today:**
```bash
node quick-commit-reporter.js https://github.com/microsoft/vscode 2024-12-01
```

**Generate a markdown report:**
```bash
node quick-commit-reporter.js https://github.com/microsoft/vscode 2024-12-01 --format markdown --output vscode_report.md
```

**Generate a detailed AI-powered report:**
```bash
node enhanced-commit-reporter.js https://github.com/microsoft/vscode 2024-12-01 --format markdown --output ai_report.md --openai-key sk-your_key_here
```

### Features

✅ **GitHub API Integration** - Working perfectly  
✅ **Date-specific Reports** - Get commits for any specific date  
✅ **Multiple Output Formats** - Text and Markdown  
✅ **File Change Tracking** - See what files were modified  
✅ **Statistics** - Lines added, deleted, and net changes  
✅ **AI Analysis** - Optional AI-powered insights (with OpenAI key)  

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure your GitHub token in `config.js`:**
   ```javascript
   const GITHUB_TOKEN = "your_github_token_here";
   ```

3. **Optional: Add OpenAI API key for AI analysis:**
   ```javascript
   const OPENAI_API_KEY = "sk-your_openai_api_key_here";
   ```

### Next Steps

1. Try generating reports for your own repositories
2. Set up OpenAI API key for AI analysis (optional)
3. Customize the output formats as needed
4. Integrate with your workflow

### Command Examples

**Quick Report (Fast):**
```bash
# Basic usage
node quick-commit-reporter.js https://github.com/owner/repo 2025-01-15

# With custom output
node quick-commit-reporter.js https://github.com/owner/repo 2025-01-15 --output my_report.txt

# Markdown format
node quick-commit-reporter.js https://github.com/owner/repo 2025-01-15 --format markdown --output report.md
```

**Enhanced Report (With AI):**
```bash
# Basic enhanced report
node enhanced-commit-reporter.js https://github.com/owner/repo 2025-01-15

# With AI analysis
node enhanced-commit-reporter.js https://github.com/owner/repo 2025-01-15 --openai-key sk-your_key_here

# Full featured
node enhanced-commit-reporter.js https://github.com/owner/repo 2025-01-15 --format markdown --output ai_report.md --openai-key sk-your_key_here
```

### Getting Your API Keys

**GitHub Token:**
1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate new token (classic)
3. Select "repo" scope
4. Copy the token and add to `config.js`

**OpenAI API Key (Optional):**
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy the key (starts with `sk-`)
4. Add to `config.js` or use `--openai-key` argument

Your project is ready to use! 🎉
