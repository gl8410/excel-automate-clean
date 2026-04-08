import { TemplateColumn, FragmentAnalysisResult } from '../types';

/**
 * This file now contains true static mocks for development without a backend.
 * All sensitive LLM logic has been moved to the secure Python backend.
 */

export const mockAnalyzeTemplate = async (csvData: any[][]): Promise<TemplateColumn[]> => {
  console.log("[Mock] Returning static template analysis...");
  // Return a simple mock structure if needed for offline dev
  if (csvData.length > 0) {
    return csvData[0].map((header, index) => ({
      originalHeader: String(header),
      description: `Mock description for ${header}`,
      index: index,
      selected: true
    }));
  }
  return [];
};

export const mockMapFragments = async (
  _fragmentData: any[][],
  templateColumns: TemplateColumn[]
): Promise<FragmentAnalysisResult> => {
  console.log("[Mock] Returning static fragment mapping...");
  return {
    headerRowIndex: 0,
    mappings: templateColumns.map(col => ({
      templateHeader: col.originalHeader,
      fragmentIndex: col.index,
      confidence: "high" as const
    }))
  };
};