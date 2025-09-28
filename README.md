# GitHub Commit Reporter (Node.js)

A Node.js program that takes a GitHub repository link as input and generates day-wise commit and changes reports using the GitHub API.

## Features

- 🔍 **Date-specific reporting**: Generate detailed reports for any specific date
- 📊 **Comprehensive commit data**: Includes commit messages, authors, timestamps, and file changes
- 📄 **Multiple output formats**: Support for both Markdown and plain text formats
- 🔐 **Secure authentication**: Uses GitHub Personal Access Tokens for API access
- 📄 **Pagination support**: Handles large commit histories efficiently
- 🎯 **Detailed file tracking**: Shows added, modified, deleted, and renamed files with statistics
- 🤖 **AI-powered analysis**: Optional OpenAI integration for intelligent commit analysis

## Installation

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd github-automation-nodejs
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

## GitHub API Authentication

To use this tool, you need a GitHub Personal Access Token with repository access.

### Creating a Personal Access Token

1. Go to [GitHub Settings](https://github.com/settings)
2. Navigate to **Developer settings** > **Personal access tokens** > **Tokens (classic)**
3. Click **Generate new token (classic)**
4. Give your token a descriptive name
5. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `public_repo` (Access public repositories)
6. Click **Generate token**
7. **Copy the token immediately** (you won't be able to see it again)

### Setting up Authentication

You can provide the token in two ways:

**Option 1: Config File (Recommended)**
Edit `config.js`:
```javascript
const GITHUB_TOKEN = "your_token_here";
```

**Option 2: Environment Variable**
```bash
# Windows (PowerShell)
$env:GITHUB_TOKEN="your_token_here"

# Windows (Command Prompt)
set GITHUB_TOKEN=your_token_here

# Linux/Mac
export GITHUB_TOKEN="your_token_here"
```

## Usage

### Quick Reporter (Fast and Efficient)

```bash
# Basic usage
node quick-commit-reporter.js <repository_url> <date>

# With custom output
node quick-commit-reporter.js <repository_url> <date> --output my_report.txt

# Markdown format
node quick-commit-reporter.js <repository_url> <date> --format markdown --output report.md
```

### Enhanced Reporter (With AI Analysis)

```bash
# Basic usage
node enhanced-commit-reporter.js <repository_url> <date>

# With AI analysis
node enhanced-commit-reporter.js <repository_url> <date> --openai-key your_openai_key

# Custom output with AI
node enhanced-commit-reporter.js <repository_url> <date> --format markdown --output ai_report.md --openai-key your_openai_key
```

### Examples

**Generate a quick report for July 2nd, 2025:**
```bash
node quick-commit-reporter.js https://github.com/username/repo 2025-07-02
```

**Generate a detailed report with AI analysis:**
```bash
node enhanced-commit-reporter.js https://github.com/username/repo 2025-07-02 --openai-key sk-your_key_here
```

**Generate a markdown report:**
```bash
node quick-commit-reporter.js https://github.com/username/repo 2025-07-02 --format markdown --output report.md
```

### Command Line Arguments

- `repo_url`: GitHub repository URL (required)
- `date`: Target date in YYYY-MM-DD format (required)
- `--token`: GitHub Personal Access Token (optional if set in config.js)
- `--openai-key`: OpenAI API key for AI analysis (optional)
- `--output`: Output filename (default: report-YYYY-MM-DD.txt)
- `--format`: Output format - 'markdown' or 'text' (default: text)

## Output Format

### Markdown Output Example

```markdown
# Hey, on 2nd July 2025 you did these changes:

## Commit 1: Add new feature for user authentication

**Author:** John Doe | **Time:** 14:30:25

**Changes:** +150 -25 lines

**What you accomplished:**
* Authentication/Authorization changes
  - Implemented or modified user authentication system
  - Updated security protocols or access controls

**Changed Files:**
- ✏️ `src/auth.js` (45 changes)
- ➕ `tests/test_auth.js` (30 changes)
- ✏️ `README.md` (5 changes)

---
```

### Text Output Example

```
Hey, on 2nd July 2025 you did these changes:

Commit 1: Add new feature for user authentication
Author: John Doe | Time: 14:30:25
Changes: +150 -25 lines
What you accomplished:
* Authentication/Authorization changes
  - Implemented or modified user authentication system
  - Updated security protocols or access controls
Changed Files:
  ✏️ src/auth.js (45 changes)
  ➕ tests/test_auth.js (30 changes)
  ✏️ README.md (5 changes)
--------------------------------------------------
```

## Supported Repository URL Formats

The program supports various GitHub repository URL formats:

- `https://github.com/owner/repo`
- `https://github.com/owner/repo.git`
- `git@github.com:owner/repo.git`
- `git@github.com:owner/repo`

## File Status Indicators

- ➕ **[ADDED]**: New files added in the commit
- ✏️ **[MODIFIED]**: Existing files that were changed
- 🗑️ **[REMOVED]**: Files that were deleted
- 🔄 **[RENAMED]**: Files that were renamed or moved

## AI Analysis Features

When using the enhanced reporter with OpenAI API, you get:

1. **Feature Analysis**: What new features were added
2. **Bug Fixes**: What issues were resolved
3. **Technical Improvements**: What code quality improvements were made
4. **Integration Changes**: What APIs or services were integrated
5. **UI/UX Updates**: What design or user experience changes were made

### Setting up OpenAI API

1. Get your API key from: https://platform.openai.com/api-keys
2. Add it to `config.js`:
   ```javascript
   const OPENAI_API_KEY = "sk-your_openai_api_key_here";
   ```
3. Or use the command line argument: `--openai-key your_key_here`

## Error Handling

The program includes comprehensive error handling for:

- Invalid repository URLs
- Authentication failures
- API rate limiting
- Network connectivity issues
- Invalid date formats
- Missing or invalid tokens

## Rate Limiting

GitHub API has rate limits:
- **Authenticated requests**: 5,000 requests per hour
- **Unauthenticated requests**: 60 requests per hour

The program handles pagination efficiently to minimize API calls.

## Troubleshooting

### Common Issues

1. **"Error: GitHub Personal Access Token is required"**
   - Make sure you've set the GITHUB_TOKEN in config.js or provided the --token argument
   - Verify your token has the correct permissions

2. **"Invalid GitHub repository URL format"**
   - Ensure the repository URL is in a supported format
   - Check that the repository exists and is accessible

3. **"Error fetching commits"**
   - Verify your token has access to the repository
   - Check your internet connection
   - Ensure the repository has commits

4. **"No commits found for [date]"**
   - Verify the date format (YYYY-MM-DD)
   - Check if there were actually commits on that date
   - Consider timezone differences

### Getting Help

If you encounter issues:

1. Check that your GitHub token has the correct permissions
2. Verify the repository URL is correct and accessible
3. Ensure the target date is in the correct format
4. Check your internet connection and GitHub API status

## Scripts

The package.json includes several convenient scripts:

```bash
# Run quick reporter
npm run quick <repo_url> <date>

# Run enhanced reporter
npm run enhanced <repo_url> <date>

# Install dependencies
npm install
```

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve this tool.

## License

This project is open source and available under the MIT License.
