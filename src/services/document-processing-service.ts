import { PdfService } from './pdf-service';
import { SectionDetector } from './section-detector';
import { OllamaService } from './ollama-service';
import { PdfExportService } from './pdf-export-service';
import { Logger } from '../utils/logger';
import { AppConfig } from '../config/app-config';
import { ProcessingRequest, ProcessingResult, Section } from '../models';

// Interface moved to models - keep for backwards compatibility
export type { ProcessingResult } from '../models';

// Single responsibility: Orchestrate complete document processing
export class DocumentProcessingService {
  private config: AppConfig;
  private pdfService: PdfService;
  private ollamaService: OllamaService;
  private pdfExportService: PdfExportService;

  constructor(config: AppConfig) {
    this.config = config;
    this.pdfService = new PdfService();
    this.ollamaService = new OllamaService();
    this.pdfExportService = new PdfExportService(config);
  }

  async processDocument(inputFile: string, request: ProcessingRequest): Promise<ProcessingResult> {
    const startTime = Date.now();

    try {
      Logger.info('DocumentProcessingService', 'processDocument', 'Starting document processing');
      Logger.info(
        'DocumentProcessingService',
        'processDocument',
        `Configuration: Sections=${request.sectionPattern}, Subsections=${request.subSectionPattern}`
      );

      // Test LLM connection
      const testResponse = await this.ollamaService.testConnection();
      Logger.success('DocumentProcessingService', 'processDocument', `LLM connected successfully`);

      // Extract text from PDF
      Logger.info('DocumentProcessingService', 'processDocument', `Extracting text from PDF: ${inputFile}`);
      const text = await this.pdfService.extractText(inputFile);
      Logger.success('DocumentProcessingService', 'processDocument', `PDF text extracted, length: ${text.length} characters`);

      // Detect document structure with custom patterns
      Logger.info('DocumentProcessingService', 'processDocument', 'Detecting document structure');
      const sectionDetector = new SectionDetector(request.sectionPattern, request.subSectionPattern);
      const sections = sectionDetector.detectSections(text);
      Logger.success('DocumentProcessingService', 'processDocument', `Document structure detected: ${sections.length} sections found`);

      if (sections.length === 0) {
        return {
          success: false,
          message: `No sections found using patterns: ${request.sectionPattern}/${request.subSectionPattern}`,
          error: 'No document structure detected',
        };
      }

      // Process all sections
      Logger.info('DocumentProcessingService', 'processDocument', `Processing ${sections.length} sections`);

      let successfulSummaries = 0;

      for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
        const section = sections[sectionIndex];
        Logger.info(
          'DocumentProcessingService',
          'processDocument',
          `Processing section ${sectionIndex + 1}/${sections.length}: ${section.title}`
        );

        const subSectionSummaries: string[] = [];

        for (let i = 0; i < section.subSections.length; i++) {
          const subSection = section.subSections[i];
          Logger.info(
            'DocumentProcessingService',
            'processDocument',
            `Processing subsection ${i + 1}/${section.subSections.length}: ${subSection.title}`
          );

          try {
            const summary = await this.ollamaService.generateSubSectionSummary(
              subSection.title,
              subSection.content,
              request.subject || 'academic content',
              request.language
            );
            subSectionSummaries.push(`**${subSection.title}**\n\n${summary}`);
            successfulSummaries++;
            Logger.success('DocumentProcessingService', 'processDocument', `${subSection.title} processed successfully`);
          } catch (error) {
            Logger.error('DocumentProcessingService', 'processDocument', `Failed to process ${subSection.title}`, error as Error);
            subSectionSummaries.push(`**${subSection.title}**\n\nError generating summary for this lesson after multiple attempts`);
          }
        }

        // Create section summary by concatenating subsection summaries
        section.summary = subSectionSummaries.join('\n\n---\n\n');
        Logger.success('DocumentProcessingService', 'processDocument', `Section ${section.title} completed`);
      }

      // Generate output filename if not provided
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = request.filename || `document-summary-${timestamp}.pdf`;
      const documentTitle = request.documentTitle || 'Document Summary';

      // Export to PDF
      Logger.info('DocumentProcessingService', 'processDocument', `Exporting to PDF: ${filename}`);
      const outputPath = await this.pdfExportService.exportSummaryToPdf(sections, filename, documentTitle);

      const processingTimeMs = Date.now() - startTime;
      const totalSubSections = sections.reduce((sum, section) => sum + section.subSections.length, 0);

      Logger.success('DocumentProcessingService', 'processDocument', `Document processing completed in ${processingTimeMs}ms`);

      return {
        success: true,
        message: 'Processing completed successfully',
        outputPath,
        statistics: {
          totalSections: sections.length,
          totalSubSections,
          successfulSummaries,
          processingTimeMs,
        },
      };
    } catch (error) {
      const processingTimeMs = Date.now() - startTime;
      Logger.error('DocumentProcessingService', 'processDocument', 'Document processing failed', error as Error);

      return {
        success: false,
        message: 'Document processing failed',
        error: error instanceof Error ? error.message : String(error),
        statistics: {
          totalSections: 0,
          totalSubSections: 0,
          successfulSummaries: 0,
          processingTimeMs,
        },
      };
    }
  }
}
