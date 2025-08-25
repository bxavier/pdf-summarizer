import { Request, Response } from 'express';
import { Logger } from '../utils/logger';
import { OllamaService } from '../services/ollama-service';
import { SummarizeRequest } from '../models';

const ollamaService = new OllamaService();

export const summarizeHtml = async (req: Request, res: Response) => {
  const startTime = Date.now();
  Logger.info('Summarize', 'html', 'HTML summarization requested');

  try {
    const { html, language }: SummarizeRequest = req.body;

    if (!html || html.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'HTML content is required',
      });
    }

    Logger.info('Summarize', 'html', `Processing HTML content (${html.length} chars)${language ? ` in ${language}` : ''}`);

    const summary = await ollamaService.generateSimpleSummary(html, language);

    const processingTimeMs = Date.now() - startTime;

    Logger.success('Summarize', 'html', `Summary generated successfully in ${processingTimeMs}ms`);

    res.json({
      success: true,
      summary,
      processingTimeMs,
    });
  } catch (error) {
    const processingTimeMs = Date.now() - startTime;
    Logger.error('Summarize', 'html', 'Summary generation failed', error as Error);

    res.status(500).json({
      success: false,
      error: 'Summary generation failed',
      processingTimeMs,
    });
  }
};
