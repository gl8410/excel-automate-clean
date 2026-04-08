import { TemplateColumn, FragmentAnalysisResult } from '../types';
import { mockAnalyzeTemplate, mockMapFragments } from './mock';
import { APP_CONFIG } from '../app.config';

// The app now always uses the backend for LLM calls to protect API keys
const API_BASE_URL = APP_CONFIG.api.baseUrl;

export const apiService = {
    /**
     * Analyzes an Excel template to extract column headers and semantic descriptions.
     */
    analyzeTemplate: async (data: any[][]): Promise<TemplateColumn[]> => {
        const response = await fetch(`${API_BASE_URL}/analyze-template`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data })
        });
        
        if (!response.ok) throw new Error("Backend API Error");
        return response.json();
    },

    /**
     * Maps a fragment file to the existing template structure using semantic analysis.
     */
    mapFragment: async (fragmentData: any[][], templateColumns: TemplateColumn[]): Promise<FragmentAnalysisResult> => {
        const response = await fetch(`${API_BASE_URL}/map-fragments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                fragmentData, 
                templateColumns 
            })
        });

        if (!response.ok) throw new Error("Backend API Error");
        return response.json();
    }
};
