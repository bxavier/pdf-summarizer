# PDF Resumer

A simple Node.js application that extracts text from PDFs and generates intelligent summaries using local LLM models (Ollama).

## Philosophy

- **KISS**: Simple and direct solutions
- **SOLID**: Single responsibility per class/function
- **DRY**: Reuse without duplication
- **YAGNI**: Only what's necessary

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file based on `env.example`:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=granite3.3
MAX_RETRIES=3
RETRY_BASE_DELAY=1000
OUTPUT_DIRECTORY=./pdf-output
TEMPLATE_DIRECTORY=./templates
```

## Usage

### API Server (default)

```bash
npm run dev        # Development
npm start          # Production
```

### CLI

```bash
npm run cli test.pdf
```

## API Documentation

The application includes comprehensive OpenAPI/Swagger documentation:

- **Interactive UI**: `http://localhost:3000/api-docs`
- **JSON Spec**: `http://localhost:3000/api-docs.json`

The documentation includes:
- Complete endpoint descriptions
- Request/response schemas
- Example payloads
- Interactive testing interface

## API Endpoints

```
GET  /health              # Application status
GET  /files               # List processed files
GET  /files/download/:filename  # Download file
POST /process             # Process PDF document
POST /summarize           # Summarize HTML content
GET  /api-docs            # Interactive API documentation (Swagger UI)
GET  /api-docs.json       # OpenAPI specification JSON
```

### PDF Processing Example

```bash
curl -X POST http://localhost:3000/process \
  -F "document=@example.pdf" \
  -F "sectionPattern=Unit" \
  -F "subSectionPattern=Lesson" \
  -F "language=English" \
  -F "subject=software engineering"
```

### HTML Summarization Example

```bash
curl -X POST http://localhost:3000/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<div><h1>Title</h1><p>Content...</p></div>",
    "language": "English"
  }'
```

## Structure

```
src/
├── models/          # Types and interfaces
├── controllers/     # Endpoint logic
├── routes/          # Route definitions
├── middleware/      # Upload and error handling
├── services/        # Business logic
├── config/          # Configuration
├── utils/           # Utilities (logger)
├── api/            # Express server
├── main.ts         # Entry point
└── app.ts          # CLI mode
```

## Dependencies

- **Express**: REST API
- **Multer**: File upload
- **pdf-parse**: Text extraction
- **Puppeteer**: PDF generation
- **Axios**: HTTP client for Ollama

## Features

1. **PDF Upload**: Up to 50MB
2. **Structure Detection**: Configurable patterns (e.g., "Unit" > "Lesson")
3. **Section Summaries**: Local LLM via Ollama
4. **PDF Export**: Customizable HTML/CSS templates
5. **Smart Language Handling**: LLM automatically determines output language from content, or follows explicit language parameter
6. **Auto Retry**: For LLM failures
7. **Structured Logging**: Colored NestJS style
8. **HTML Summarization**: Direct content summarization
9. **Markdown Support**: LLM outputs formatted markdown that's converted to styled HTML in PDFs

## Language Support

The application uses intelligent language handling powered by the Granite LLM:

- **Auto-Detection**: If no language is specified, the LLM automatically detects the input language and responds accordingly
- **Explicit Language**: You can specify any language as a string (e.g., "English", "Portuguese", "Spanish", "French", "Japanese")
- **Granite Training**: The LLM is trained in English but can understand and respond in multiple languages
- **Context-Aware**: The LLM considers both the content language and any explicit language instruction

## Parameters

### PDF Processing Parameters

- `sectionPattern`: Pattern to detect main sections (e.g., "Unit", "Chapter", "Unidade")
- `subSectionPattern`: Pattern to detect subsections (e.g., "Lesson", "Section", "Aula")
- `language`: Output language as string (e.g., "English", "Portuguese", "Spanish") - optional, LLM will infer from content if not provided
- `documentTitle`: Optional custom title for the output
- `filename`: Optional custom filename for the output
- `subject`: Optional subject context for better summaries (default: "academic content")

### HTML Summarization Parameters

- `html`: HTML content to summarize
- `language`: Output language as string (e.g., "English", "Portuguese") - optional, LLM will infer from content if not provided

## Use Cases

### Academic Documents (Portuguese)

```json
{
  "sectionPattern": "Unidade",
  "subSectionPattern": "Aula",
  "language": "Portuguese",
  "subject": "software engineering"
}
```

### Technical Books (English)

```json
{
  "sectionPattern": "Chapter",
  "subSectionPattern": "Section",
  "language": "English",
  "subject": "machine learning"
}
```

### Content with Auto-Detection

```json
{
  "sectionPattern": "Unit",
  "subSectionPattern": "Lesson",
  "subject": "physics"
}
```
*Note: Language will be automatically inferred from the content*

### HTML Content Summarization

```json
{
  "html": "<div><h1>Risk Management</h1><p>Content about software risks...</p></div>",
  "language": "English"
}
```

## Limitations

- Text only (no images)
- Depends on local Ollama
- Sequential processing
- Simple regex patterns

## Development

The application is structured to be **simple and direct**:

- Controllers are pure functions
- Models are TypeScript interfaces
- Services encapsulate specific logic
- Minimal necessary middleware
- Zero unnecessary abstractions

## Logs

```
[HH:MM:SS.mmm] LEVEL ServiceName.method(): message
```

Levels: INFO (blue), SUCCESS (green), WARN (yellow), ERROR (red), DEBUG (magenta)

## Output

PDFs are saved in `./pdf-output/` with name `document-summary-YYYY-MM-DDTHH-MM-SS.pdf`
