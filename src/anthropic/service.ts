import config from '../config';
import logger from '../logger';
import { ProcessedEmail } from '../email/processor';
import { retry } from '../utils/retry';

const Anthropic = require('anthropic').Anthropic;

export interface AnalysisResult {
  taskTitle: string;
  error?: string;
}

export class AnthropicService {
  private client: any;
  
  constructor() {
    this.client = new Anthropic({
      apiKey: config.anthropic.apiKey,
    });
  }
  
  /**
   * Analyze email content with Claude
   */
  async analyzeEmail(email: ProcessedEmail): Promise<AnalysisResult> {
    try {
      logger.info(`Analyzing email with Claude: ${email.id}`);
      
      const prompt = this.createPrompt(email);
      
      const response = await retry(async () => {
        return this.client.messages.create({
          model: config.anthropic.model,
          max_tokens: config.anthropic.maxTokens,
          temperature: config.anthropic.temperature,
          system: "You are a helpful assistant that analyzes emails and extracts tasks.",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });
      }, 3);
      
      const taskTitle = response.content[0].text.trim();
      
      logger.info(`Generated task title: ${taskTitle}`);
      
      return { taskTitle };
    } catch (error) {
      logger.error(`Error analyzing email ${email.id} with Claude:`, error);
      return { 
        taskTitle: `Sprawdź email: ${email.subject}`,
        error: `Failed to analyze email: ${error}`
      };
    }
  }
  
  /**
   * Create the prompt for Claude
   */
  private createPrompt(email: ProcessedEmail): string {
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
