export interface TemplateColumn {
  originalHeader: string;
  description: string; // Description now includes aliases/synonyms in natural language
  index: number;
  selected: boolean;
}

export interface FragmentMapping {
  templateHeader: string; // The header name in the template
  fragmentIndex: number; // The index in the fragment file (-1 if not found)
  confidence: 'high' | 'low' | 'none';
}

export interface FragmentAnalysisResult {
  headerRowIndex: number;
  mappings: FragmentMapping[];
}

export interface FragmentFile {
  id: string;
  name: string;
  file: File;
  status: 'pending' | 'processing' | 'success' | 'warning' | 'error';
  mappings: FragmentMapping[];
  headerRowIndex?: number;
  errorMessage?: string;
}

export interface ExcelRow {
  [key: string]: any;
}

export type TabState = 'template' | string; // 'template' or fragment ID

// Add global definition for SheetJS loaded via CDN
declare global {
  interface Window {
    XLSX: any;
  }
}