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
exports.TodoistService = void 0;
const todoist_api_typescript_1 = require("@doist/todoist-api-typescript");
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../logger"));
const retry_1 = require("../utils/retry");
class TodoistService {
    constructor() {
        this.priorities = {
            p1: 4, // Highest priority in Todoist
            p2: 3,
            p3: 2,
            p4: 1, // Lowest priority in Todoist
        };
        this.api = new todoist_api_typescript_1.TodoistApi(config_1.default.todoist.apiKey);
    }
    /**
     * Create a task in Todoist based on email analysis
     */
    createTask(email, analysis) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info(`Creating Todoist task for email: ${email.id}`);
                const dueDate = this.extractDueDate(email);
                const priority = this.determinePriority(email);
                const labels = this.determineLabels(email);
                const description = this.createTaskDescription(email);
                const task = yield (0, retry_1.retry)(() => __awaiter(this, void 0, void 0, function* () {
                    return this.api.addTask({
                        content: analysis.taskTitle,
                        description,
                        priority,
                        dueString: dueDate, // Changed from dueDate to dueString
                        labels,
                    });
                }), 3);
                logger_1.default.info(`Created Todoist task: ${task.id} - ${task.content}`);
                return task.id;
            }
            catch (error) {
                logger_1.default.error(`Error creating Todoist task for email ${email.id}:`, error);
                throw error;
            }
        });
    }
    /**
     * Extract potential due date from email
     */
    extractDueDate(email) {
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
    determinePriority(email) {
        const textToCheck = `${email.subject} ${email.content}`.toLowerCase();
        if (textToCheck.includes('pilne') ||
            textToCheck.includes('natychmiast') ||
            textToCheck.includes('urgent') ||
            textToCheck.includes('asap') ||
            textToCheck.includes('jak najszybciej')) {
            return this.priorities.p1;
        }
        if (textToCheck.includes('ważne') ||
            textToCheck.includes('important') ||
            textToCheck.includes('priorytet')) {
            return this.priorities.p2;
        }
        return this.priorities.p3;
    }
    /**
     * Determine labels based on content
     */
    determineLabels(email) {
        const labels = [];
        const textToCheck = `${email.subject} ${email.content}`.toLowerCase();
        if (textToCheck.includes('pacjent') ||
            textToCheck.includes('patient') ||
            textToCheck.includes('wizyta') ||
            textToCheck.includes('konsultacja')) {
            labels.push('pacjenci');
        }
        if (textToCheck.includes('faktura') ||
            textToCheck.includes('rachunek') ||
            textToCheck.includes('płatność') ||
            textToCheck.includes('invoice') ||
            textToCheck.includes('payment')) {
            labels.push('finanse');
        }
        if (textToCheck.includes('spotkanie') ||
            textToCheck.includes('meeting') ||
            textToCheck.includes('konferencja') ||
            textToCheck.includes('webinar')) {
            labels.push('spotkania');
        }
        if (textToCheck.includes('zamówienie') ||
            textToCheck.includes('order') ||
            textToCheck.includes('dostawa') ||
            textToCheck.includes('delivery')) {
            labels.push('zamówienia');
        }
        return labels;
    }
    /**
     * Create task description with context from email
     */
    createTaskDescription(email) {
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
exports.TodoistService = TodoistService;
