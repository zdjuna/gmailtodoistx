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
exports.getAuthClient = getAuthClient;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const local_auth_1 = require("@google-cloud/local-auth");
const googleapis_1 = require("googleapis");
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../logger"));
function getAuthClient() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tokenPath = config_1.default.gmail.tokenPath;
            if (fs_1.default.existsSync(tokenPath)) {
                const content = fs_1.default.readFileSync(tokenPath, 'utf8');
                const credentials = JSON.parse(content);
                const client = new googleapis_1.google.auth.OAuth2(credentials.client_id, credentials.client_secret, credentials.redirect_uri);
                client.setCredentials(credentials.tokens);
                logger_1.default.info('Using existing Gmail API credentials');
                return client;
            }
            else {
                logger_1.default.info('No existing Gmail credentials found, starting OAuth flow');
                const client = yield (0, local_auth_1.authenticate)({
                    scopes: config_1.default.gmail.scopes,
                    keyfilePath: config_1.default.gmail.credentialsPath,
                });
                const tokenDir = path_1.default.dirname(tokenPath);
                if (!fs_1.default.existsSync(tokenDir)) {
                    fs_1.default.mkdirSync(tokenDir, { recursive: true });
                }
                const credentials = {
                    client_id: client._clientId,
                    client_secret: client._clientSecret,
                    redirect_uri: client._redirectUri,
                    tokens: client.credentials,
                };
                fs_1.default.writeFileSync(tokenPath, JSON.stringify(credentials, null, 2));
                logger_1.default.info('Gmail API credentials saved to token file');
                return client;
            }
        }
        catch (error) {
            logger_1.default.error('Error authenticating with Gmail API:', error);
            throw new Error('Failed to authenticate with Gmail API');
        }
    });
}
