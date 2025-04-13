"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const defaultConfig = {
    gmail: {
        credentialsPath: process.env.GMAIL_CREDENTIALS_PATH || path_1.default.join(process.cwd(), 'credentials.json'),
        tokenPath: process.env.GMAIL_TOKEN_PATH || path_1.default.join(process.cwd(), 'token.json'),
        scopes: [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.modify'
        ],
        pollingInterval: parseInt(process.env.POLLING_INTERVAL || '60', 10) * 1000, // Default: 60 seconds
    },
    anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
        maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '4096', 10),
        temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0.7'),
    },
    todoist: {
        apiKey: process.env.TODOIST_API_KEY || '',
    },
    app: {
        logLevel: process.env.LOG_LEVEL || 'info',
        logFile: process.env.LOG_FILE || path_1.default.join(process.cwd(), 'app.log'),
    }
};
let customConfig = {};
const configPath = path_1.default.join(process.cwd(), 'config.json');
if (fs_1.default.existsSync(configPath)) {
    try {
        const configFile = fs_1.default.readFileSync(configPath, 'utf8');
        customConfig = JSON.parse(configFile);
        console.log('Loaded custom configuration from config.json');
    }
    catch (error) {
        console.error('Error loading custom configuration:', error);
    }
}
const config = {
    gmail: Object.assign(Object.assign({}, defaultConfig.gmail), customConfig.gmail),
    anthropic: Object.assign(Object.assign({}, defaultConfig.anthropic), customConfig.anthropic),
    todoist: Object.assign(Object.assign({}, defaultConfig.todoist), customConfig.todoist),
    app: Object.assign(Object.assign({}, defaultConfig.app), customConfig.app),
};
exports.default = config;
