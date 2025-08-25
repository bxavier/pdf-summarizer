import { Request, Response } from 'express';
import { Logger } from '../utils/logger';
import { OllamaService } from '../services/ollama-service';
import { SummarizeRequest } from '../models';

const ollamaService = new OllamaService();

/**
 * @swagger
 * /summarize:
 *   post:
 *     summary: Summarize HTML content
 *     description: Generate a summary of provided HTML content using LLM
 *     tags: [Summarization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SummarizeRequest'
 *           example:
 *             html: "<div><h1>Software Engineering</h1><p>This is about agile methodologies...</p></div>"
 *             language: "English"
 *     responses:
 *       200:
 *         description: Summary generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SummarizeResponse'
 *             example:
 *               success: true
 *               summary: "### Agile Methodologies\n\nThis discussion focuses on **agile methodologies**..."
 *               processingTimeMs: 2500
 *       400:
 *         description: Bad request (missing HTML content)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Summary generation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
