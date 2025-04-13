declare module 'node-cron' {
  export interface ScheduledTask {
    stop: () => void;
    start: () => void;
  }
  
  export function schedule(
    expression: string,
    task: Function,
    options?: { scheduled?: boolean; timezone?: string }
  ): ScheduledTask;
}

declare module 'html-to-text';
