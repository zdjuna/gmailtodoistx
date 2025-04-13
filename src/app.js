"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./logger"));
const service_1 = require("./gmail/service");
const processor_1 = require("./email/processor");
const service_2 = require("./anthropic/service");
const service_3 = require("./todoist/service");
class Application {
    constructor() {
        this.cronJob = null;
        this.gmailService = new service_1.GmailService();
        this.emailProcessor = new processor_1.EmailProcessor();
        this.anthropicService = new service_2.AnthropicService();
        this.todoistService = new service_3.TodoistService();
    }
    /**
     * Start the application
     */
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info('Starting Gmail-Todoist application');
            try {
                yield this.processEmails();
                const intervalMinutes = Math.max(1, Math.floor(config_1.default.gmail.pollingInterval / 60000));
                const cronExpression = `*/${intervalMinutes} * * * *`;
                logger_1.default.info(`Setting up cron job to run every ${intervalMinutes} minute(s)`);
                this.cronJob = node_cron_1.default.schedule(cronExpression, () => __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield this.processEmails();
                    }
                    catch (error) {
                        logger_1.default.error('Error in scheduled email processing:', error);
                    }
                }));
                logger_1.default.info('Application started successfully');
            }
            catch (error) {
                logger_1.default.error('Error starting application:', error);
                throw error;
            }
        });
    }
    /**
     * Stop the application
     */
    stop() {
        logger_1.default.info('Stopping application');
        if (this.cronJob) {
            this.cronJob.stop();
            this.cronJob = null;
        }
        logger_1.default.info('Application stopped');
    }
    /**
     * Process new starred emails
     */
    processEmails() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info('Checking for new starred emails');
                const emails = yield this.gmailService.getStarredEmails();
                if (emails.length === 0) {
                    logger_1.default.info('No new starred emails to process');
                    return;
                }
                logger_1.default.info(`Processing ${emails.length} starred emails`);
                for (const email of emails) {
                    try {
                        const processedEmail = this.emailProcessor.processEmail(email);
                        const analysis = yield this.anthropicService.analyzeEmail(processedEmail);
                        const taskId = yield this.todoistService.createTask(processedEmail, analysis);
                        yield this.gmailService.markAsProcessed(email.id);
                        logger_1.default.info(`Successfully processed email ${email.id} and created Todoist task ${taskId}`);
                    }
                    catch (error) {
                        logger_1.default.error(`Error processing email ${email.id}:`, error);
                    }
                }
                logger_1.default.info('Finished processing emails');
            }
            catch (error) {
                logger_1.default.error('Error in email processing:', error);
                throw error;
            }
        });
    }
}
exports.Application = Application;
