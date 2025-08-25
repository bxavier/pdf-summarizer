import 'dotenv/config';

// Re-export from models for backwards compatibility
export type { ProcessingRequest } from '../models';

export interface AppConfig {
  // Ollama configuration
  ollamaBaseUrl: string;
  ollamaModel: string;

  // Processing configuration
  maxRetries: number;
  retryBaseDelay: number;

  // Output configuration
  outputDirectory: string;
  templateDirectory: string;
}

export const DEFAULT_CONFIG: AppConfig = {
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'granite3.3',
  maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
  retryBaseDelay: parseInt(process.env.RETRY_BASE_DELAY || '1000'),
  outputDirectory: process.env.OUTPUT_DIRECTORY || './pdf-output',
  templateDirectory: process.env.TEMPLATE_DIRECTORY || './templates',
};
