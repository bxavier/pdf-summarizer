// Core domain types - KISS principle
export interface SubSection {
  number: number;
  title: string;
  content: string;
}

export interface Section {
  number: number;
  title: string;
  subSections: SubSection[];
  summary?: string;
}

export interface ProcessingRequest {
  sectionPattern: string;
  subSectionPattern: string;
  documentTitle?: string;
  filename?: string;
  subject?: string;
  language?: string;
}

export interface ProcessingResult {
  success: boolean;
  message: string;
  outputPath?: string;
  statistics?: {
    totalSections: number;
    totalSubSections: number;
    successfulSummaries: number;
    processingTimeMs: number;
  };
  error?: string;
}

export interface FileInfo {
  filename: string;
  size: number;
  created: string;
  modified: string;
}

export interface SummarizeRequest {
  html: string;
  language?: string;
}

export interface SummarizeResponse {
  success: boolean;
  summary?: string;
  error?: string;
  processingTimeMs: number;
}
