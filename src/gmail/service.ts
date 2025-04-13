import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getAuthClient } from './auth';
import logger from '../logger';
import { retry } from '../utils/retry';

export interface EmailData {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  body: string;
  snippet: string;
  link: string;
}

export class GmailService {
  private auth: OAuth2Client | null = null;
  private gmail: any = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      this.auth = await getAuthClient();
      this.gmail = google.gmail({ version: 'v1', auth: this.auth });
      logger.info('Gmail service initialized');
    } catch (error) {
      logger.error('Failed to initialize Gmail service:', error);
      throw error;
    }
  }

  /**
   * Get starred emails that haven't been processed yet
   */
  async getStarredEmails(): Promise<EmailData[]> {
    try {
      if (!this.gmail) {
        await this.initialize();
      }

      const response = await retry(async () => {
        return this.gmail.users.messages.list({
          userId: 'me',
          q: 'is:starred -label:processed',
          maxResults: 10,
        });
      }, 3);

      const messages = response.data.messages || [];
      
      if (messages.length === 0) {
        logger.debug('No new starred emails found');
        return [];
      }
      
      logger.info(`Found ${messages.length} new starred emails`);
      
      const emails: EmailData[] = [];
      
      for (const message of messages) {
        try {
          const email = await this.getEmailData(message.id);
          emails.push(email);
        } catch (error) {
          logger.error(`Error fetching email ${message.id}:`, error);
        }
      }
      
      return emails;
    } catch (error) {
      logger.error('Error fetching starred emails:', error);
      throw error;
    }
  }

  /**
   * Get full email data by ID
   */
  async getEmailData(messageId: string): Promise<EmailData> {
    try {
      const response = await retry(async () => {
        return this.gmail.users.messages.get({
          userId: 'me',
          id: messageId,
          format: 'full',
        });
      }, 3);

      const message = response.data;
      const headers = message.payload.headers;
      
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(No Subject)';
      const from = headers.find((h: any) => h.name === 'From')?.value || '';
      const to = headers.find((h: any) => h.name === 'To')?.value || '';
      const date = headers.find((h: any) => h.name === 'Date')?.value || '';
      
      const body = this.getEmailBody(message);
      
      const emailLink = `https://mail.google.com/mail/u/0/#inbox/${messageId}`;
      
      return {
        id: messageId,
        threadId: message.threadId,
        subject,
        from,
        to,
        date,
        body,
        snippet: message.snippet || '',
        link: emailLink,
      };
    } catch (error) {
      logger.error(`Error fetching email data for ${messageId}:`, error);
      throw error;
    }
  }

  /**
   * Extract email body from message parts
   */
  private getEmailBody(message: any): string {
    let body = '';
    
    const extractParts = (part: any) => {
      if (part.mimeType === 'text/plain' && part.body.data) {
        const buff = Buffer.from(part.body.data, 'base64');
        body += buff.toString('utf-8');
      } else if (part.mimeType === 'text/html' && part.body.data && body === '') {
        const buff = Buffer.from(part.body.data, 'base64');
        body += buff.toString('utf-8');
      } else if (part.parts) {
        part.parts.forEach(extractParts);
      }
    };
    
    if (message.payload) {
      if (message.payload.body && message.payload.body.data) {
        const buff = Buffer.from(message.payload.body.data, 'base64');
        body = buff.toString('utf-8');
      } else if (message.payload.parts) {
        message.payload.parts.forEach(extractParts);
      }
    }
    
    return body;
  }

  /**
   * Mark an email as processed
   */
  async markAsProcessed(messageId: string): Promise<void> {
    try {
      await retry(async () => {
        return this.gmail.users.messages.modify({
          userId: 'me',
          id: messageId,
          requestBody: {
            addLabelIds: ['Label_processed'], // You need to create this label in Gmail
            removeLabelIds: ['STARRED'],
          },
        });
      }, 3);
      
      logger.info(`Marked email ${messageId} as processed`);
    } catch (error) {
      logger.error(`Error marking email ${messageId} as processed:`, error);
      throw error;
    }
  }
}
