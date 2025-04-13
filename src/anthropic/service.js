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
exports.AnthropicService = void 0;
const { Anthropic } = require('anthropic');
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../logger"));
const retry_1 = require("../utils/retry");
class AnthropicService {
    constructor() {
        this.client = new Anthropic({
            apiKey: config_1.default.anthropic.apiKey,
        });
    }
    /**
     * Analyze email content with Claude
     */
    analyzeEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info(`Analyzing email with Claude: ${email.id}`);
                const prompt = this.createPrompt(email);
                const response = yield (0, retry_1.retry)(() => __awaiter(this, void 0, void 0, function* () {
                    return this.client.messages.create({
                        model: config_1.default.anthropic.model,
                        max_tokens: config_1.default.anthropic.maxTokens,
                        temperature: config_1.default.anthropic.temperature,
                        system: "You are a helpful assistant that analyzes emails and extracts tasks.",
                        messages: [
                            {
                                role: "user",
                                content: prompt,
                            },
                        ],
                    });
                }), 3);
                const taskTitle = response.content[0].text.trim();
                logger_1.default.info(`Generated task title: ${taskTitle}`);
                return { taskTitle };
            }
            catch (error) {
                logger_1.default.error(`Error analyzing email ${email.id} with Claude:`, error);
                return {
                    taskTitle: `Sprawdź email: ${email.subject}`,
                    error: `Failed to analyze email: ${error}`
                };
            }
        });
    }
    /**
     * Create the prompt for Claude
     */
    createPrompt(email) {
        const emailContent = `
Od: ${email.from}
Do: ${email.to}
Data: ${email.date}
Temat: ${email.subject}

${email.content}
    `.trim();
        return `Użyj rozszerzonego rozumowania, aby dokładnie przeanalizować ten email krok po kroku. Zwróć szczególną uwagę na kontekst, ukryte intencje i szczegóły, które mogą wpłynąć na zadanie.

Przeanalizuj tego emaila i zwróć TYLKO zwięzłe zadanie Z MOJEJ PERSPEKTYWY w trybie rozkazującym, max 7 słów.

WAŻNE: JA (Adam Zduńczyk - lekarz) jestem odbiorcą tego emaila!

PROCES ANALIZY: 
1. Przeczytaj dokładnie CAŁY email, zwracając uwagę na daty, kwoty, prośby i kontekst, IGNORUJ obrazy, żeby nie marnować tokenów
2. Zidentyfikuj GŁÓWNY cel emaila i jego FAKTYCZNĄ pilność
3. Ustal KONKRETNE działanie, które powinienem podjąć
4. Sformułuj zadanie według poniższych zasad

ZASADY TWORZENIA ZADAŃ:
1. Zacznij od MOCNEGO CZASOWNIKA: 'Zadzwoń', 'Odpowiedz', 'Zweryfikuj', 'Wyślij'
2. Dla pacjentów: używaj danych pacjentów w postaci imienia i pierwszej litery nazwiska, np. 'Kamil P.'
3. Dla faktur i rachunków: Dodaj kwotę jeśli znana, np. 'Zapłać fakturę T-Mobile: 120 PLN'
4. Dla spotkań i deadlineów: Dodaj datę jeśli znana, np. 'Potwierdź spotkanie: 15.04'
5. Dla zamówień: Użyj dokładnie formatu 'zamówienie: {sklep} {produkt}', np. 'zamówienie: hmv.de winyl Sabrina Carpenter - Short'n'Sweet'
6. Dla pracy: Dodaj kontekst

Treść emaila do analizy: ${emailContent}`;
    }
}
exports.AnthropicService = AnthropicService;
