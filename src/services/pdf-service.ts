import * as fs from 'fs';
import pdfParse from 'pdf-parse';

// Single responsibility: Extract text from PDF
export class PdfService {
  async extractText(filePath: string): Promise<string> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error}`);
    }
  }
}
