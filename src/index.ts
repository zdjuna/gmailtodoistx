import { Application } from './app';
import logger from './logger';
import config from './config';

function checkConfig(): boolean {
  const missingConfig: string[] = [];
  
  if (!config.gmail.credentialsPath) {
    missingConfig.push('Gmail credentials path (GMAIL_CREDENTIALS_PATH)');
  }
  
  if (!config.anthropic.apiKey) {
    missingConfig.push('Anthropic API key (ANTHROPIC_API_KEY)');
  }
  
  if (!config.todoist.apiKey) {
    missingConfig.push('Todoist API key (TODOIST_API_KEY)');
  }
  
  if (missingConfig.length > 0) {
    logger.error(`Missing required configuration: ${missingConfig.join(', ')}`);
    return false;
  }
  
  return true;
}

async function main() {
  try {
    logger.info('Starting application');
    
    if (!checkConfig()) {
      process.exit(1);
    }
    
    const app = new Application();
    await app.start();
    
    const shutdown = async () => {
      logger.info('Shutting down application');
      app.stop();
      process.exit(0);
    };
    
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    
    logger.info('Application running');
  } catch (error) {
    logger.error('Error in main:', error);
    process.exit(1);
  }
}

main();
