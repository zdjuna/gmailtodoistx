import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

dotenv.config();

const isGoogleCloud = process.env.K_SERVICE !== undefined;

/**
 * Get a secret from Google Cloud Secret Manager
 */
async function getSecret(secretName: string): Promise<string> {
  try {
    const client = new SecretManagerServiceClient();
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || '';
    const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;

    const [version] = await client.accessSecretVersion({ name });
    return version.payload?.data?.toString() || '';
  } catch (error) {
    console.error(`Error accessing secret ${secretName}:`, error);
    return '';
  }
}

/**
 * Load secrets from Google Cloud Secret Manager
 */
async function loadGcpSecrets(): Promise<void> {
  if (!isGoogleCloud) {
    return;
  }

  try {
    console.log('Loading secrets from Google Cloud Secret Manager');

    if (!process.env.ANTHROPIC_API_KEY) {
      process.env.ANTHROPIC_API_KEY = await getSecret('anthropic-api-key');
    }

    if (!process.env.TODOIST_API_KEY) {
      process.env.TODOIST_API_KEY = await getSecret('todoist-api-key');
    }

    if (process.env.GMAIL_CREDENTIALS_SECRET) {
      const credentialsJson = await getSecret(process.env.GMAIL_CREDENTIALS_SECRET);
      if (credentialsJson) {
        fs.writeFileSync(path.join(process.cwd(), 'credentials.json'), credentialsJson);
        process.env.GMAIL_CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
      }
    }

    if (process.env.GMAIL_TOKEN_SECRET) {
      const tokenJson = await getSecret(process.env.GMAIL_TOKEN_SECRET);
      if (tokenJson) {
        fs.writeFileSync(path.join(process.cwd(), 'token.json'), tokenJson);
        process.env.GMAIL_TOKEN_PATH = path.join(process.cwd(), 'token.json');
      }
    }

    console.log('Secrets loaded successfully');
  } catch (error) {
    console.error('Error loading secrets from Google Cloud Secret Manager:', error);
  }
}

const defaultConfig = {
  gmail: {
    credentialsPath: process.env.GMAIL_CREDENTIALS_PATH || path.join(process.cwd(), 'credentials.json'),
    tokenPath: process.env.GMAIL_TOKEN_PATH || path.join(process.cwd(), 'token.json'),
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ],
    pollingInterval: parseInt(process.env.POLLING_INTERVAL || '300', 10) * 1000, // Default: 5 minutes
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
    logFile: process.env.LOG_FILE || path.join(process.cwd(), 'app.log'),
    isGoogleCloud,
  }
};

export interface Config {
  gmail: {
    credentialsPath: string;
    tokenPath: string;
    scopes: string[];
    pollingInterval: number;
  };
  anthropic: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  todoist: {
    apiKey: string;
  };
  app: {
    logLevel: string;
    logFile: string;
    isGoogleCloud: boolean;
  };
}

let customConfig: Partial<Config> = {};
const configPath = path.join(process.cwd(), 'config.json');

if (fs.existsSync(configPath)) {
  try {
    const configFile = fs.readFileSync(configPath, 'utf8');
    customConfig = JSON.parse(configFile);
    console.log('Loaded custom configuration from config.json');
  } catch (error) {
    console.error('Error loading custom configuration:', error);
  }
}

const config: Config = {
  gmail: { ...defaultConfig.gmail, ...customConfig.gmail },
  anthropic: { ...defaultConfig.anthropic, ...customConfig.anthropic },
  todoist: { ...defaultConfig.todoist, ...customConfig.todoist },
  app: { ...defaultConfig.app, ...customConfig.app },
};

if (isGoogleCloud) {
  loadGcpSecrets().catch(error => {
    console.error('Failed to load GCP secrets:', error);
  });
}

export default config;
