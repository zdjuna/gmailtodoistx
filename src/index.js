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
const app_1 = require("./app");
const logger_1 = __importDefault(require("./logger"));
const config_1 = __importDefault(require("./config"));
function checkConfig() {
    const missingConfig = [];
    if (!config_1.default.gmail.credentialsPath) {
        missingConfig.push('Gmail credentials path (GMAIL_CREDENTIALS_PATH)');
    }
    if (!config_1.default.anthropic.apiKey) {
        missingConfig.push('Anthropic API key (ANTHROPIC_API_KEY)');
    }
    if (!config_1.default.todoist.apiKey) {
        missingConfig.push('Todoist API key (TODOIST_API_KEY)');
    }
    if (missingConfig.length > 0) {
        logger_1.default.error(`Missing required configuration: ${missingConfig.join(', ')}`);
        return false;
    }
    return true;
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger_1.default.info('Starting application');
            if (!checkConfig()) {
                process.exit(1);
            }
            const app = new app_1.Application();
            yield app.start();
            const shutdown = () => __awaiter(this, void 0, void 0, function* () {
                logger_1.default.info('Shutting down application');
                app.stop();
                process.exit(0);
            });
            process.on('SIGINT', shutdown);
            process.on('SIGTERM', shutdown);
            logger_1.default.info('Application running');
        }
        catch (error) {
            logger_1.default.error('Error in main:', error);
            process.exit(1);
        }
    });
}
main();
