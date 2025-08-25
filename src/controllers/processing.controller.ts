import { Request, Response } from 'express';
import * as fs from 'fs';
import { Logger } from '../utils/logger';
import { DocumentProcessingService } from '../services/document-processing-service';
import { ProcessingRequest } from '../models';
import { DEFAULT_CONFIG } from '../config/app-config';

const processingService = new DocumentProcessingService(DEFAULT_CONFIG);

/**
 * @swagger
 * /process:
 *   post:
 *     summary: Process PDF document
 *     description: Upload a PDF file and generate intelligent summaries using LLM
 *     tags: [Processing]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: PDF file to process
 *               sectionPattern:
 *                 type: string
 *                 description: Pattern to detect main sections
 *                 default: "Unit"
 *                 example: "Unit"
 *               subSectionPattern:
 *                 type: string
 *                 description: Pattern to detect subsections
 *                 default: "Lesson"
 *                 example: "Lesson"
 *               documentTitle:
 *                 type: string
 *                 description: Optional custom title for the output
 *                 example: "My Document Summary"
 *               filename:
 *                 type: string
 *                 description: Optional custom filename for the output
 *                 example: "my-summary.pdf"
 *               subject:
 *                 type: string
 *                 description: Subject context for better summaries
 *                 default: "academic content"
 *                 example: "software engineering"
 *               language:
 *                 type: string
 *                 description: Output language
 *                 example: "English"
 *             required:
 *               - document
 *     responses:
 *       200:
 *         description: Processing completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProcessingResult'
 *       400:
 *         description: Bad request (no file, invalid file type)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Processing failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const processDocument = async (req: Request, res: Response) => {
  const startTime = Date.now();
  Logger.info('Processing', 'process', 'New processing request');

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    // Simple validation
    if (req.file.mimetype !== 'application/pdf') {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Only PDF files allowed' });
    }

    const request: ProcessingRequest = {
      sectionPattern: req.body.sectionPattern || 'Unit',
      subSectionPattern: req.body.subSectionPattern || 'Lesson',
      documentTitle: req.body.documentTitle,
      filename: req.body.filename,
      subject: req.body.subject || 'academic content',
      language: req.body.language,
    };

    const result = await processingService.processDocument(req.file.path, request);

    // Cleanup
    fs.unlinkSync(req.file.path);

    const totalTime = Date.now() - startTime;

    if (result.success) {
      res.json({ ...result, requestTimeMs: totalTime });
    } else {
      res.status(500).json({ ...result, requestTimeMs: totalTime });
    }
  } catch (error) {
    const totalTime = Date.now() - startTime;

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    Logger.error('Processing', 'process', 'Request failed', error as Error);
    res.status(500).json({
      success: false,
      error: 'Processing failed',
      requestTimeMs: totalTime,
    });
  }
};
