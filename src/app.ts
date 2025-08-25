import { PdfService } from './services/pdf-service';
import { SectionDetector } from './services/section-detector';
import { OllamaService } from './services/ollama-service';
import { PdfExportService } from './services/pdf-export-service';
import { Section } from './models';
import { Logger } from './utils/logger';
import { DEFAULT_CONFIG } from './config/app-config';

// Main application: Process complete document with configurable parameters
async function processDocument(inputFile: string = 'test.pdf') {
  const config = DEFAULT_CONFIG;

  // Default processing parameters for CLI mode
  const defaultRequest = {
    sectionPattern: 'Unidade',
    subSectionPattern: 'Aula',
    documentTitle: 'Document Summary',
    subject: 'academic content',
    language: 'Portuguese',
  };

  const pdfService = new PdfService();
  const ollamaService = new OllamaService();
  const pdfExportService = new PdfExportService(config);

  try {
    Logger.info('DocumentProcessor', 'processDocument', `Starting complete document processing with ${config.ollamaModel}`);
    Logger.info(
      'DocumentProcessor',
      'processDocument',
      `Configuration: Language=${defaultRequest.language}, Sections=${defaultRequest.sectionPattern}, Subsections=${defaultRequest.subSectionPattern}`
    );

    // Test LLM connection
    const testResponse = await ollamaService.testConnection();
    Logger.success('DocumentProcessor', 'processDocument', `LLM connected: ${testResponse.substring(0, 50)}...`);

    Logger.info('DocumentProcessor', 'processDocument', `Extracting text from PDF: ${inputFile}`);
    const text = await pdfService.extractText(inputFile);
    Logger.success('DocumentProcessor', 'processDocument', `PDF text extracted successfully, total length: ${text.length} characters`);

    Logger.info('DocumentProcessor', 'processDocument', 'Detecting hierarchical document structure');
    const sectionDetectorWithParams = new SectionDetector(defaultRequest.sectionPattern, defaultRequest.subSectionPattern);
    const sections = sectionDetectorWithParams.detectSections(text);
    Logger.success('DocumentProcessor', 'processDocument', `Document structure detected: ${sections.length} sections found`);

    // Log discovered structure
    sections.forEach((section, index) => {
      Logger.info(
        'DocumentProcessor',
        'processDocument',
        `Section ${index + 1}: ${section.title} (${section.subSections.length} subsections)`
      );
      section.subSections.forEach((subSection: any) => {
        Logger.debug('DocumentProcessor', 'processDocument', `  └── ${subSection.title} (${subSection.content.length} chars)`);
      });
    });

    // Process all sections
    Logger.info('DocumentProcessor', 'processDocument', `Starting processing of all ${sections.length} sections`);

    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
      const section = sections[sectionIndex];
      Logger.info('DocumentProcessor', 'processDocument', `Processing section ${sectionIndex + 1}/${sections.length}: ${section.title}`);
      Logger.info('DocumentProcessor', 'processDocument', `Section contains ${section.subSections.length} subsections to process`);

      // Process all subsections in this section
      const subSectionSummaries: string[] = [];

      for (let i = 0; i < section.subSections.length; i++) {
        const subSection = section.subSections[i];
        Logger.info(
          'DocumentProcessor',
          'processDocument',
          `Processing subsection ${i + 1}/${section.subSections.length} in ${section.title}: ${subSection.title}`
        );
        Logger.debug('DocumentProcessor', 'processDocument', `Subsection content size: ${subSection.content.length} characters`);

        try {
          const summary = await ollamaService.generateSubSectionSummary(
            subSection.title,
            subSection.content,
            defaultRequest.subject,
            defaultRequest.language
          );
          subSectionSummaries.push(`**${subSection.title}**\n\n${summary}`);
          Logger.success('DocumentProcessor', 'processDocument', `${subSection.title} processed successfully (${summary.length} chars)`);
        } catch (error) {
          Logger.error(
            'DocumentProcessor',
            'processDocument',
            `CRITICAL: Failed to process ${subSection.title} after all retries`,
            error as Error
          );
          Logger.warn('DocumentProcessor', 'processDocument', 'Adding error placeholder to maintain document structure');

          subSectionSummaries.push(`**${subSection.title}**\n\nError generating summary for this lesson after multiple attempts`);
        }
      }

      // Create section summary by concatenating subsection summaries
      Logger.info(
        'DocumentProcessor',
        'processDocument',
        `Creating unified summary for ${section.title} by concatenating subsection summaries`
      );
      section.summary = subSectionSummaries.join('\n\n---\n\n');
      Logger.success(
        'DocumentProcessor',
        'processDocument',
        `Section ${section.title} summary created (${section.summary.length} characters)`
      );
    }

    // Export complete document to PDF
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `complete-document-summary-${timestamp}.pdf`;
    const documentTitle = 'Complete Document Summary';

    Logger.info('DocumentProcessor', 'processDocument', `Exporting complete document to PDF: ${filename}`);
    const outputPath = await pdfExportService.exportSummaryToPdf(sections, filename, documentTitle);

    Logger.success('DocumentProcessor', 'processDocument', `Document processing completed successfully!`);
    Logger.info('DocumentProcessor', 'processDocument', `Output file: ${outputPath}`);

    // Processing statistics
    const totalSections = sections.length;
    const totalSubSections = sections.reduce((sum, section) => sum + section.subSections.length, 0);
    const successfulSummaries = sections.reduce((sum, section) => {
      const successCount = section.summary ? section.summary.split('⚠️').length - 1 : 0;
      return sum + (section.subSections.length - successCount);
    }, 0);

    Logger.info(
      'DocumentProcessor',
      'processDocument',
      `Final statistics: ${totalSections} sections, ${totalSubSections} subsections, ${successfulSummaries}/${totalSubSections} successfully processed`
    );
  } catch (error) {
    Logger.error('DocumentProcessor', 'processDocument', 'Document processing failed', error as Error);
  }
}

// CLI interface
const inputFile = process.argv[2] || 'test.pdf';
Logger.info('Application', 'main', `Starting PDF Resumer application with input file: ${inputFile}`);

if (require.main === module) {
  processDocument(inputFile);
}
