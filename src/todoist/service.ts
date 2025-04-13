import { TodoistApi } from '@doist/todoist-api-typescript';
import config from '../config';
import logger from '../logger';
import { ProcessedEmail } from '../email/processor';
import { AnalysisResult } from '../anthropic/service';
import { retry } from '../utils/retry';

export interface TaskPriority {
  p1: number;
  p2: number;
  p3: number;
  p4: number;
}

export class TodoistService {
  private api: TodoistApi;
  private priorities: TaskPriority = {
    p1: 4, // Highest priority in Todoist
    p2: 3,
    p3: 2,
    p4: 1, // Lowest priority in Todoist
  };
  
  constructor() {
    this.api = new TodoistApi(config.todoist.apiKey);
  }
  
  /**
   * Create a task in Todoist based on email analysis
   */
  async createTask(email: ProcessedEmail, analysis: AnalysisResult): Promise<string> {
    try {
      logger.info(`Creating Todoist task for email: ${email.id}`);
      
      const dueDate = this.extractDueDate(email);
      
      const priority = this.determinePriority(email);
      
      const labels = this.determineLabels(email);
      
      const description = this.createTaskDescription(email);
      
      const task = await retry(async () => {
        return this.api.addTask({
          content: analysis.taskTitle,
          description,
          priority,
          dueString: dueDate, // Changed from dueDate to dueString
          labels,
        });
      }, 3);
      
      logger.info(`Created Todoist task: ${task.id} - ${task.content}`);
      
      return task.id;
    } catch (error) {
      logger.error(`Error creating Todoist task for email ${email.id}:`, error);
      throw error;
    }
  }
  
  /**
   * Extract potential due date from email
   */
  private extractDueDate(email: ProcessedEmail): string | undefined {
    const datePatterns = [
      /(\d{1,2})\.(\d{1,2})\.(\d{2,4})/g,
      /(\d{4})-(\d{1,2})-(\d{1,2})/g,
      /do (\d{1,2}) (\w+)/gi, // "do 15 kwietnia"
      /przed (\d{1,2}) (\w+)/gi, // "przed 20 maja"
    ];
    
    const textToCheck = `${email.subject} ${email.content}`;
    
    for (const pattern of datePatterns) {
      const matches = textToCheck.matchAll(pattern);
      for (const match of matches) {
        return match[0];
      }
    }
    
    return undefined;
  }
  
  /**
   * Determine priority based on content
   */
  private determinePriority(email: ProcessedEmail): number {
    const textToCheck = `${email.subject} ${email.content}`.toLowerCase();
    
    if (
      textToCheck.includes('pilne') ||
      textToCheck.includes('natychmiast') ||
      textToCheck.includes('urgent') ||
      textToCheck.includes('asap') ||
      textToCheck.includes('jak najszybciej')
    ) {
      return this.priorities.p1;
    }
    
    if (
      textToCheck.includes('ważne') ||
      textToCheck.includes('important') ||
      textToCheck.includes('priorytet')
    ) {
      return this.priorities.p2;
    }
    
    return this.priorities.p3;
  }
  
  /**
   * Determine labels based on content
   */
  private determineLabels(email: ProcessedEmail): string[] {
    const labels: string[] = [];
    const textToCheck = `${email.subject} ${email.content}`.toLowerCase();
    
    if (
      textToCheck.includes('pacjent') ||
      textToCheck.includes('patient') ||
      textToCheck.includes('wizyta') ||
      textToCheck.includes('konsultacja')
    ) {
      labels.push('pacjenci');
    }
    
    if (
      textToCheck.includes('faktura') ||
      textToCheck.includes('rachunek') ||
      textToCheck.includes('płatność') ||
      textToCheck.includes('invoice') ||
      textToCheck.includes('payment')
    ) {
      labels.push('finanse');
    }
    
    if (
      textToCheck.includes('spotkanie') ||
      textToCheck.includes('meeting') ||
      textToCheck.includes('konferencja') ||
      textToCheck.includes('webinar')
    ) {
      labels.push('spotkania');
    }
    
    if (
      textToCheck.includes('zamówienie') ||
      textToCheck.includes('order') ||
      textToCheck.includes('dostawa') ||
      textToCheck.includes('delivery')
    ) {
      labels.push('zamówienia');
    }
    
    return labels;
  }
  
  /**
   * Create task description with context from email
   */
  private createTaskDescription(email: ProcessedEmail): string {
    return `
Od: ${email.from}
Data: ${email.date}
Temat: ${email.subject}

${email.content.substring(0, 500)}${email.content.length > 500 ? '...' : ''}

---
Link do emaila: ${email.link}
    `.trim();
  }
}
