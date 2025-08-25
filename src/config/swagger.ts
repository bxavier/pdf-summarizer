import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'PDF Summarizer API',
    version: '1.0.0',
    description: 'A Node.js application that extracts text from PDFs and generates intelligent summaries using local LLM models (Ollama)',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'http://localhost:3001',
      description: 'Alternative development server',
    },
  ],
  components: {
    schemas: {
      ProcessingRequest: {
        type: 'object',
        properties: {
          sectionPattern: {
            type: 'string',
            description: 'Pattern to detect main sections',
            example: 'Unit'
          },
          subSectionPattern: {
            type: 'string',
            description: 'Pattern to detect subsections',
            example: 'Lesson'
          },
          documentTitle: {
            type: 'string',
            description: 'Optional custom title for the output',
            example: 'My Document Summary'
          },
          filename: {
            type: 'string',
            description: 'Optional custom filename for the output',
            example: 'my-summary.pdf'
          },
          subject: {
            type: 'string',
            description: 'Subject context for better summaries',
            example: 'software engineering'
          },
          language: {
            type: 'string',
            description: 'Output language',
            example: 'English'
          }
        },
        required: ['sectionPattern', 'subSectionPattern']
      },
      SummarizeRequest: {
        type: 'object',
        properties: {
          html: {
            type: 'string',
            description: 'HTML content to summarize',
            example: '<div><h1>Title</h1><p>Content...</p></div>'
          },
          language: {
            type: 'string',
            description: 'Output language',
            example: 'English'
          }
        },
        required: ['html']
      },
      ProcessingResult: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the operation was successful'
          },
          message: {
            type: 'string',
            description: 'Status message'
          },
          outputPath: {
            type: 'string',
            description: 'Path to the generated PDF file'
          },
          processingTimeMs: {
            type: 'number',
            description: 'Processing time in milliseconds'
          },
          statistics: {
            type: 'object',
            properties: {
              totalSections: { type: 'number' },
              totalSubSections: { type: 'number' },
              successfulSummaries: { type: 'number' },
              failedSummaries: { type: 'number' }
            }
          }
        }
      },
      SummarizeResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the operation was successful'
          },
          summary: {
            type: 'string',
            description: 'Generated summary'
          },
          processingTimeMs: {
            type: 'number',
            description: 'Processing time in milliseconds'
          },
          error: {
            type: 'string',
            description: 'Error message if failed'
          }
        }
      },
      FileInfo: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'File name'
          },
          path: {
            type: 'string',
            description: 'File path'
          },
          size: {
            type: 'number',
            description: 'File size in bytes'
          },
          created: {
            type: 'string',
            format: 'date-time',
            description: 'Creation date'
          },
          modified: {
            type: 'string',
            format: 'date-time',
            description: 'Last modification date'
          }
        }
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'healthy'
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          },
          version: {
            type: 'string',
            example: '1.0.0'
          },
          uptime: {
            type: 'number',
            description: 'Uptime in seconds'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'string',
            description: 'Error message'
          }
        }
      }
    }
  }
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
