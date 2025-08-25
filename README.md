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

## API Endpoints

```
GET  /health              # Application status
GET  /files               # List processed files
GET  /files/download/:filename  # Download file
POST /process             # Process PDF document
POST /summarize           # Summarize HTML content
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
5. **Multi-language**: pt, en, es, fr
6. **Auto Retry**: For LLM failures
7. **Structured Logging**: Colored NestJS style
8. **HTML Summarization**: Direct content summarization

## Parameters

### PDF Processing Parameters

- `sectionPattern`: Pattern to detect main sections (e.g., "Unit", "Chapter", "Unidade")
- `subSectionPattern`: Pattern to detect subsections (e.g., "Lesson", "Section", "Aula")
- `outputLanguage`: Output language (`en`, `pt`, `es`, `fr`)
- `documentTitle`: Optional custom title for the output
- `filename`: Optional custom filename for the output
- `subject`: Optional subject context for better summaries (default: "academic content")

### HTML Summarization Parameters

- `html`: HTML content to summarize
- `language`: Output language (`en`, `pt`, `es`, `fr`)

## Use Cases

### Academic Documents (Portuguese)

```json
{
  "sectionPattern": "Unidade",
  "subSectionPattern": "Aula",
  "outputLanguage": "pt",
  "subject": "software engineering"
}
```

### Technical Books (English)

```json
{
  "sectionPattern": "Chapter",
  "subSectionPattern": "Section",
  "outputLanguage": "en",
  "subject": "machine learning"
}
```

### HTML Content Summarization

```json
{
  "html": "<div><h1>Risk Management</h1><p>Content about software risks...</p></div>",
  "language": "en"
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
