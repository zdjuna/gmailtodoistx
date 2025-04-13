"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailProcessor = void 0;
const html_to_text_1 = require("html-to-text");
const logger_1 = __importDefault(require("../logger"));
class EmailProcessor {
    /**
     * Process an email by cleaning HTML and extracting content
     */
    processEmail(email) {
        logger_1.default.info(`Processing email: ${email.id} - ${email.subject}`);
        try {
            const isHtml = email.body.includes('<html') ||
                email.body.includes('<body') ||
                email.body.includes('<div') ||
                email.body.includes('<p');
            let content = '';
            if (isHtml) {
                content = this.convertHtmlToText(email.body);
            }
            else {
                content = email.body;
            }
            content = this.cleanContent(content);
            logger_1.default.debug(`Email processed successfully: ${email.id}`);
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
        }
        catch (error) {
            logger_1.default.error(`Error processing email ${email.id}:`, error);
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
    convertHtmlToText(html) {
        return (0, html_to_text_1.convert)(html, {
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
    cleanContent(content) {
        return content
            .replace(/\n{3,}/g, '\n\n')
            .replace(/ {2,}/g, ' ')
            .trim();
    }
}
exports.EmailProcessor = EmailProcessor;
