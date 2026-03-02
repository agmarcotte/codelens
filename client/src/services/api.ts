import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type {
  ApiResponse,
  AnalysisResult,
  Documentation,
  CacheStats,
  AnalyzeFileRequest,
  AnalyzeDirectoryRequest,
  GenerateDocumentationRequest,
  GenerateDiagramRequest,
  DiagramInfo,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API] Response from ${response.config.url}:`, response.status);
        return response;
      },
      (error: AxiosError) => {
        console.error('[API] Response error:', error.message);
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      // Server responded with error
      const data = error.response.data as any;
      return new Error(data?.error?.message || data?.message || 'Server error');
    } else if (error.request) {
      // Request made but no response
      return new Error('No response from server. Please check if the backend is running.');
    } else {
      // Error in request setup
      return new Error(error.message || 'Request failed');
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get<{ status: string; timestamp: string }>('/health');
    return response.data;
  }

  // Analysis endpoints
  async analyzeFile(request: AnalyzeFileRequest): Promise<AnalysisResult> {
    const response = await this.client.post<ApiResponse<AnalysisResult>>(
      '/api/v1/analyze/file',
      request
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Analysis failed');
    }
    return response.data.data;
  }

  async analyzeDirectory(request: AnalyzeDirectoryRequest): Promise<AnalysisResult[]> {
    const response = await this.client.post<ApiResponse<AnalysisResult[]>>(
      '/api/v1/analyze/directory',
      request
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Analysis failed');
    }
    return response.data.data;
  }

  async analyzeProject(path: string, useCache = true): Promise<AnalysisResult[]> {
    const response = await this.client.post<ApiResponse<AnalysisResult[]>>(
      '/api/v1/analyze/project',
      { path, useCache }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Analysis failed');
    }
    return response.data.data;
  }

  async getAnalysisStatus(id: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    result?: AnalysisResult;
    error?: string;
  }> {
    const response = await this.client.get(`/api/v1/analyze/status/${id}`);
    return response.data;
  }

  // Documentation endpoints
  async generateDocumentation(request: GenerateDocumentationRequest): Promise<Documentation> {
    const response = await this.client.post<ApiResponse<Documentation>>(
      '/api/v1/documentation/generate',
      request
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Documentation generation failed');
    }
    return response.data.data;
  }

  async generateDocumentationFromProject(
    projectPath: string,
    options?: GenerateDocumentationRequest['options']
  ): Promise<Documentation> {
    const response = await this.client.post<ApiResponse<Documentation>>(
      '/api/v1/documentation/generate-from-project',
      { projectPath, options }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Documentation generation failed');
    }
    return response.data.data;
  }

  async exportDocumentationAsMarkdown(documentation: Documentation): Promise<string> {
    const response = await this.client.post<ApiResponse<{ markdown: string }>>(
      '/api/v1/documentation/export/markdown',
      { documentation }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Export failed');
    }
    return response.data.data.markdown;
  }

  async downloadMarkdown(documentation: Documentation, filename: string): Promise<Blob> {
    const response = await this.client.post(
      '/api/v1/documentation/download/markdown',
      { documentation, filename },
      { responseType: 'blob' }
    );
    return response.data;
  }

  async generateDiagram(request: GenerateDiagramRequest): Promise<DiagramInfo> {
    const response = await this.client.post<ApiResponse<DiagramInfo>>(
      '/api/v1/documentation/diagram',
      request
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Diagram generation failed');
    }
    return response.data.data;
  }

  // Cache endpoints
  async getCacheStats(): Promise<CacheStats> {
    const response = await this.client.get<ApiResponse<CacheStats>>('/api/v1/cache/stats');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to get cache stats');
    }
    return response.data.data;
  }

  async clearCache(): Promise<void> {
    const response = await this.client.delete<ApiResponse>('/api/v1/cache/clear');
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to clear cache');
    }
  }

  async deleteCacheEntry(key: string): Promise<void> {
    const response = await this.client.delete<ApiResponse>(`/api/v1/cache/${key}`);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete cache entry');
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;