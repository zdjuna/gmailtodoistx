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
exports.retry = retry;
const logger_1 = __importDefault(require("../logger"));
/**
 * Retry a function with exponential backoff
 */
function retry(fn_1, maxRetries_1) {
    return __awaiter(this, arguments, void 0, function* (fn, maxRetries, initialDelay = 1000) {
        var _a, _b;
        let retries = 0;
        let delay = initialDelay;
        while (true) {
            try {
                return yield fn();
            }
            catch (error) {
                retries++;
                if (retries >= maxRetries) {
                    logger_1.default.error(`Max retries (${maxRetries}) reached. Giving up.`, error);
                    throw error;
                }
                const isRateLimit = error.code === 429 ||
                    error.status === 429 ||
                    (error.response && error.response.status === 429);
                if (isRateLimit) {
                    const retryAfter = (_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.headers) === null || _b === void 0 ? void 0 : _b['retry-after'];
                    if (retryAfter) {
                        delay = parseInt(retryAfter, 10) * 1000;
                    }
                    else {
                        delay = delay * 2;
                    }
                }
                else {
                    delay = delay * 2;
                }
                logger_1.default.warn(`Retry ${retries}/${maxRetries} after ${delay}ms: ${error.message}`);
                yield new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    });
}
