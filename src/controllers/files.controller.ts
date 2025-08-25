import { Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { Logger } from '../utils/logger';
import { DEFAULT_CONFIG } from '../config/app-config';

/**
 * @swagger
 * /files:
 *   get:
 *     summary: List generated PDF files
 *     description: Returns a list of all generated PDF files in the output directory
 *     tags: [Files]
 *     responses:
 *       200:
 *         description: Files listed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 files:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FileInfo'
 *                 totalCount:
 *                   type: number
 *                   description: Total number of files
 *             example:
 *               files:
 *                 - name: "document-summary-2025-08-25T01-30-00.pdf"
 *                   path: "/files/document-summary-2025-08-25T01-30-00.pdf"
 *                   size: 125432
 *                   created: "2025-08-25T01:30:00.000Z"
 *                   modified: "2025-08-25T01:30:00.000Z"
 *               totalCount: 1
 *       500:
 *         description: Failed to list files
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const listFiles = (req: Request, res: Response) => {
  Logger.info('Files', 'list', 'File list requested');

  try {
    if (!fs.existsSync(DEFAULT_CONFIG.outputDirectory)) {
      return res.json({ files: [], totalCount: 0 });
    }

    const files = fs
      .readdirSync(DEFAULT_CONFIG.outputDirectory)
      .filter((file) => file.endsWith('.pdf'))
      .map((file) => {
        const filePath = path.join(DEFAULT_CONFIG.outputDirectory, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime.toISOString(),
          modified: stats.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    res.json({ files, totalCount: files.length });
  } catch (error) {
    Logger.error('Files', 'list', 'Failed to list files', error as Error);
    res.status(500).json({ error: 'Failed to list files' });
  }
};

/**
 * @swagger
 * /files/{filename}:
 *   get:
 *     summary: Download a generated PDF file
 *     description: Download a specific PDF file by filename
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the PDF file to download
 *         example: "document-summary-2025-08-25T01-30-00.pdf"
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Download failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const downloadFile = (req: Request, res: Response) => {
  const filename = req.params.filename;
  Logger.info('Files', 'download', `Download requested: ${filename}`);

  try {
    const filePath = path.join(DEFAULT_CONFIG.outputDirectory, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Security check
    const resolvedPath = path.resolve(filePath);
    const outputDirPath = path.resolve(DEFAULT_CONFIG.outputDirectory);

    if (!resolvedPath.startsWith(outputDirPath)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(resolvedPath);
  } catch (error) {
    Logger.error('Files', 'download', 'Download failed', error as Error);
    res.status(500).json({ error: 'Download failed' });
  }
};
