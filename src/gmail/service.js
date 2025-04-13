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
exports.GmailService = void 0;
const googleapis_1 = require("googleapis");
const auth_1 = require("./auth");
const logger_1 = __importDefault(require("../logger"));
const retry_1 = require("../utils/retry");
class GmailService {
    constructor() {
        this.auth = null;
        this.gmail = null;
        this.initialize();
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.auth = yield (0, auth_1.getAuthClient)();
                this.gmail = googleapis_1.google.gmail({ version: 'v1', auth: this.auth });
                logger_1.default.info('Gmail service initialized');
            }
            catch (error) {
                logger_1.default.error('Failed to initialize Gmail service:', error);
                throw error;
            }
        });
    }
    /**
     * Get starred emails that haven't been processed yet
     */
    getStarredEmails() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.gmail) {
                    yield this.initialize();
                }
                const response = yield (0, retry_1.retry)(() => __awaiter(this, void 0, void 0, function* () {
                    return this.gmail.users.messages.list({
                        userId: 'me',
                        q: 'is:starred -label:processed',
                        maxResults: 10,
                    });
                }), 3);
                const messages = response.data.messages || [];
                if (messages.length === 0) {
                    logger_1.default.debug('No new starred emails found');
                    return [];
                }
                logger_1.default.info(`Found ${messages.length} new starred emails`);
                const emails = [];
                for (const message of messages) {
                    try {
                        const email = yield this.getEmailData(message.id);
                        emails.push(email);
                    }
                    catch (error) {
                        logger_1.default.error(`Error fetching email ${message.id}:`, error);
                    }
                }
                return emails;
            }
            catch (error) {
                logger_1.default.error('Error fetching starred emails:', error);
                throw error;
            }
        });
    }
    /**
     * Get full email data by ID
     */
    getEmailData(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                const response = yield (0, retry_1.retry)(() => __awaiter(this, void 0, void 0, function* () {
                    return this.gmail.users.messages.get({
                        userId: 'me',
                        id: messageId,
                        format: 'full',
                    });
                }), 3);
                const message = response.data;
                const headers = message.payload.headers;
                const subject = ((_a = headers.find((h) => h.name === 'Subject')) === null || _a === void 0 ? void 0 : _a.value) || '(No Subject)';
                const from = ((_b = headers.find((h) => h.name === 'From')) === null || _b === void 0 ? void 0 : _b.value) || '';
                const to = ((_c = headers.find((h) => h.name === 'To')) === null || _c === void 0 ? void 0 : _c.value) || '';
                const date = ((_d = headers.find((h) => h.name === 'Date')) === null || _d === void 0 ? void 0 : _d.value) || '';
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
            }
            catch (error) {
                logger_1.default.error(`Error fetching email data for ${messageId}:`, error);
                throw error;
            }
        });
    }
    /**
     * Extract email body from message parts
     */
    getEmailBody(message) {
        let body = '';
        const extractParts = (part) => {
            if (part.mimeType === 'text/plain' && part.body.data) {
                const buff = Buffer.from(part.body.data, 'base64');
                body += buff.toString('utf-8');
            }
            else if (part.mimeType === 'text/html' && part.body.data && body === '') {
                const buff = Buffer.from(part.body.data, 'base64');
                body += buff.toString('utf-8');
            }
            else if (part.parts) {
                part.parts.forEach(extractParts);
            }
        };
        if (message.payload) {
            if (message.payload.body && message.payload.body.data) {
                const buff = Buffer.from(message.payload.body.data, 'base64');
                body = buff.toString('utf-8');
            }
            else if (message.payload.parts) {
                message.payload.parts.forEach(extractParts);
            }
        }
        return body;
    }
    /**
     * Mark an email as processed
     */
    markAsProcessed(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, retry_1.retry)(() => __awaiter(this, void 0, void 0, function* () {
                    return this.gmail.users.messages.modify({
                        userId: 'me',
                        id: messageId,
                        requestBody: {
                            addLabelIds: ['Label_processed'], // You need to create this label in Gmail
                            removeLabelIds: ['STARRED'],
                        },
                    });
                }), 3);
                logger_1.default.info(`Marked email ${messageId} as processed`);
            }
            catch (error) {
                logger_1.default.error(`Error marking email ${messageId} as processed:`, error);
                throw error;
            }
        });
    }
}
exports.GmailService = GmailService;
