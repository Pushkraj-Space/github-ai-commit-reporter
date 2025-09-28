#!/usr/bin/env node
/**
 * Express Web Server for GitHub Commit Reporter
 * 
 * Provides a web interface for generating commit reports using MVC architecture
 */

const express = require('express');
const path = require('path');
const { GITHUB_TOKEN, OPENAI_API_KEY } = require('./app/config/config');
require('dotenv').config();
// Import routes
const apiRoutes = require('./app/routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', apiRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 GitHub Commit Reporter Server running on http://localhost:${PORT}`);
    console.log(`📊 Web interface available at http://localhost:${PORT}`);
    console.log(`🔧 API endpoints:`);
    console.log(`   POST /api/generate-report - Generate commit reports`);
    console.log(`   GET  /api/repositories - Get user repositories`);
    console.log(`   GET  /api/branches/:owner/:repo - Get repository branches`);
    console.log(`   GET  /api/commits/:owner/:repo - Get repository commits`);
    console.log(`   GET  /api/statistics/:owner/:repo - Get repository statistics`);
    console.log(`   POST /api/analyze-commits - Analyze commits with AI`);
    console.log(`   GET  /api/health - Health check`);

    if (!GITHUB_TOKEN) {
        console.log(`⚠️  Warning: GITHUB_TOKEN not configured in config.js`);
    }
});

module.exports = app;
