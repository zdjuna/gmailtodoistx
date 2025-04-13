import { convert } from 'html-to-text';
import logger from '../logger';
import { EmailData } from '../gmail/service';

export interface ProcessedEmail {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  content: string;
  link: string;
}

export class EmailProcessor {
  /**
   * Process an email by cleaning HTML and extracting content
   */
  processEmail(email: EmailData): ProcessedEmail {
    logger.info(`Processing email: ${email.id} - ${email.subject}`);
    
    try {
      const isHtml = email.body.includes('<html') || 
                     email.body.includes('<body') || 
                     email.body.includes('<div') || 
                     email.body.includes('<p');
      
      let content = '';
      
      if (isHtml) {
        content = this.convertHtmlToText(email.body);
      } else {
        content = email.body;
      }
      
      content = this.cleanContent(content);
      
      logger.debug(`Email processed successfully: ${email.id}`);
      
      return {
        id: email.id,
        threadId: email.threadId,
        subject: email.subject,
        from: email.from,
        to: email.to,
        date: email.date,
        content,
        link: email.link,
      };
    } catch (error) {
      logger.error(`Error processing email ${email.id}:`, error);
      
      return {
        id: email.id,
        threadId: email.threadId,
        subject: email.subject,
        from: email.from,
        to: email.to,
        date: email.date,
        content: `Failed to process email content. Snippet: ${email.snippet}`,
        link: email.link,
      };
    }
  }

  /**
   * Convert HTML to plain text
   */
  private convertHtmlToText(html: string): string {
    return convert(html, {
      wordwrap: false,
      selectors: [
        { selector: 'a', options: { linkBrackets: false } },
        { selector: 'img', format: 'skip' }, // Skip images to save tokens
      ],
      preserveNewlines: true,
    });
  }

  /**
   * Clean up the content by removing extra whitespace, etc.
   */
  private cleanContent(content: string): string {
    return content
      .replace(/\n{3,}/g, '\n\n')
      .replace(/ {2,}/g, ' ')
      .trim();
  }
}
