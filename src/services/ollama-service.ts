import 'dotenv/config';
import axios from 'axios';
import { Logger } from '../utils/logger';

// Single responsibility: Communicate with Ollama
export class OllamaService {
  private readonly baseUrl: string;
  private readonly model: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'gpt-oss';
  }

  async testConnection(prompt = `Answer in ${process.env.OLLAMA_OUTPUT_LANGUAGE}: Hello!`): Promise<string> {
    Logger.info('OllamaService', 'testConnection', `Testing connection to ${this.baseUrl} with model ${this.model}`);
    Logger.debug('OllamaService', 'testConnection', `Using prompt: "${prompt}"`);

    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.model,
        prompt,
        stream: false,
      });

      Logger.success('OllamaService', 'testConnection', `Connection successful, response length: ${response.data.response.length} chars`);
      return response.data.response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.error('OllamaService', 'testConnection', `Connection failed to ${this.baseUrl}`, error as Error);
      throw new Error(`Ollama connection failed: ${errorMsg}`);
    }
  }

  async generateSubSectionSummary(title: string, content: string, subject: string, language?: string): Promise<string> {
    const languageInstruction = language ? `Please respond in ${language}` : 'Please respond in the same language as the content';

    const prompt = `I have several academic texts related to ${subject}. 

      Your role is to act as an AI assistant that excels in understanding and summarizing academic content. Please generate a concise summary, or abstract, of each text. The summary should encapsulate the main points, arguments, and findings of the text, ideally not exceeding 200 words for each. Ensure that the summaries maintain the original text's tone and academic integrity while being accessible for quick review.

      SUBJECT: ${subject}
      TITLE: ${title}
      CONTENT: ${content}

      ${languageInstruction}, adhering to the following guidelines:

      1. Retain the key arguments and findings of the original text.
      2. Ensure the summaries are free from personal interpretations or biases.
      3. Maintain an objective and neutral language.
      4. Each summary should be self-contained, understandable without the original text.
      5. Preserve important concepts and technical terms.
      6. Organize the summary in a clear and structured way.
      7. **IMPORTANT: Format your response using Markdown syntax** (use ### for headings, **bold**, *italic*, numbered lists, bullet points, etc.).

      Start by signaling the structure with headings for each main point or argument in the original text, followed by a brief paragraph explaining each.

      I aim to use these summaries to efficiently review and prepare for an upcoming exam, so clarity and accuracy are paramount.
      `;

    return this.executeWithRetry(async () => {
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.model,
        prompt,
        stream: false,
      });

      return response.data.response;
    }, `subsection summary for ${title}`);
  }

  private async executeWithRetry<T>(operation: () => Promise<T>, operationName: string, maxRetries = 3, baseDelay = 1000): Promise<T> {
    Logger.info('OllamaService', 'executeWithRetry', `Starting retry mechanism for ${operationName}, max attempts: ${maxRetries}`);
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        Logger.debug('OllamaService', 'executeWithRetry', `Attempt ${attempt}/${maxRetries} for ${operationName}`);
        const result = await operation();
        Logger.success('OllamaService', 'executeWithRetry', `Operation ${operationName} succeeded on attempt ${attempt}`);
        return result;
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          Logger.error('OllamaService', 'executeWithRetry', `All ${maxRetries} attempts failed for ${operationName}`, lastError);
          break;
        }

        const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        Logger.warn('OllamaService', 'executeWithRetry', `Attempt ${attempt} failed for ${operationName}, retrying in ${delay}ms`);
        Logger.debug('OllamaService', 'executeWithRetry', `Error details: ${lastError.message}`);

        await this.sleep(delay);
      }
    }

    throw new Error(`Failed to ${operationName} after ${maxRetries} attempts: ${lastError!.message}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Note: generateSectionSummary removed - we now concatenate individual summaries
  // to preserve full content instead of creating "summary of summaries"

  async generateGeneralSummary(allContent: string): Promise<string> {
    const prompt = `Create a general summary of this complete document, highlighting the main themes and concepts discussed throughout all sections:\n\n${allContent}`;

    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.model,
        prompt,
        stream: false,
      });

      return response.data.response;
    } catch (error) {
      throw new Error(`Failed to generate general summary: ${error}`);
    }
  }

  async generateSimpleSummary(htmlContent: string, language?: string): Promise<string> {
    const languageInstruction = language ? `Please respond in ${language}` : 'Please respond in the same language as the content';

    const prompt = `Your role is to act as an AI assistant that excels in understanding and summarizing content. Please generate a concise summary of the HTML content. The summary should encapsulate the main points, arguments, and findings, ideally not exceeding 200 words. Ensure that the summary maintains the original content's tone while being accessible for quick review.

HTML CONTENT: ${htmlContent}

      ${languageInstruction}, adhering to the following guidelines:

      1. Retain the key arguments and findings of the original content.
      2. Ensure the summary is free from personal interpretations or biases.
      3. Maintain an objective and neutral language.
      4. The summary should be self-contained, understandable without the original content.
      5. Preserve important concepts and technical terms.
      6. Organize the summary in a clear and structured way.
      7. **IMPORTANT: Format your response using Markdown syntax** (use ### for headings, **bold**, *italic*, numbered lists, bullet points, etc.).

      I aim to use this summary to efficiently review content, so clarity and accuracy are paramount.`;

    Logger.info('OllamaService', 'generateSimpleSummary', 'Generating simple summary');
    Logger.debug('OllamaService', 'generateSimpleSummary', `HTML content length: ${htmlContent.length} characters`);

    return this.executeWithRetry(async () => {
      Logger.info('OllamaService', 'generateSimpleSummary', `Attempting simple summary generation`);

      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.model,
        prompt,
        stream: false,
      });

      return response.data.response;
    }, 'simple summary');
  }
}
