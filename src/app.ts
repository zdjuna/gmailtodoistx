import * as cron from 'node-cron';
import config from './config';
import logger from './logger';
import { GmailService } from './gmail/service';
import { EmailProcessor } from './email/processor';
import { AnthropicService } from './anthropic/service';
import { TodoistService } from './todoist/service';

export class Application {
  private gmailService: GmailService;
  private emailProcessor: EmailProcessor;
  private anthropicService: AnthropicService;
  private todoistService: TodoistService;
  private cronJob: cron.ScheduledTask | null = null;
  
  constructor() {
    this.gmailService = new GmailService();
    this.emailProcessor = new EmailProcessor();
    this.anthropicService = new AnthropicService();
    this.todoistService = new TodoistService();
  }
  
  /**
   * Start the application
   */
  async start(): Promise<void> {
    logger.info('Starting Gmail-Todoist application');
    
    try {
      await this.processEmails();
      
      const intervalMinutes = Math.max(1, Math.floor(config.gmail.pollingInterval / 60000));
      const cronExpression = `*/${intervalMinutes} * * * *`;
      
      logger.info(`Setting up cron job to run every ${intervalMinutes} minute(s)`);
      
      this.cronJob = cron.schedule(cronExpression, async () => {
        try {
          await this.processEmails();
        } catch (error) {
          logger.error('Error in scheduled email processing:', error);
        }
      });
      
      logger.info('Application started successfully');
    } catch (error) {
      logger.error('Error starting application:', error);
      throw error;
    }
  }
  
  /**
   * Stop the application
   */
  stop(): void {
    logger.info('Stopping application');
    
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    
    logger.info('Application stopped');
  }
  
  /**
   * Process new starred emails
   */
  private async processEmails(): Promise<void> {
    try {
      logger.info('Checking for new starred emails');
      
      const emails = await this.gmailService.getStarredEmails();
      
      if (emails.length === 0) {
        logger.info('No new starred emails to process');
        return;
      }
      
      logger.info(`Processing ${emails.length} starred emails`);
      
      for (const email of emails) {
        try {
          const processedEmail = this.emailProcessor.processEmail(email);
          
          const analysis = await this.anthropicService.analyzeEmail(processedEmail);
          
          const taskId = await this.todoistService.createTask(processedEmail, analysis);
          
          await this.gmailService.markAsProcessed(email.id);
          
          logger.info(`Successfully processed email ${email.id} and created Todoist task ${taskId}`);
        } catch (error) {
          logger.error(`Error processing email ${email.id}:`, error);
        }
      }
      
      logger.info('Finished processing emails');
    } catch (error) {
      logger.error('Error in email processing:', error);
      throw error;
    }
  }
}
