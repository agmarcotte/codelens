import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  AnalysisResult,
  Documentation,
  CacheStats,
  AppState,
  AnalysisState,
  DocumentationState,
} from '../types';

interface AppStore {
  // App state
  theme: AppState['theme'];
  sidebarOpen: boolean;
  currentView: AppState['currentView'];
  
  // Analysis state
  analysis: AnalysisState;
  analysisResults: AnalysisResult[];
  
  // Documentation state
  documentation: DocumentationState;
  
  // Cache state
  cacheStats: CacheStats | null;
  
  // Actions
  setTheme: (theme: AppState['theme']) => void;
  toggleSidebar: () => void;
  setCurrentView: (view: AppState['currentView']) => void;
  
  // Analysis actions
  setAnalyzing: (isAnalyzing: boolean) => void;
  setAnalysisProgress: (progress: number, currentFile?: string) => void;
  setAnalysisResult: (result: AnalysisResult) => void;
  setAnalysisResults: (results: AnalysisResult[]) => void;
  setAnalysisError: (error: string | undefined) => void;
  clearAnalysis: () => void;
  
  // Documentation actions
  setGeneratingDocumentation: (isGenerating: boolean) => void;
  setDocumentation: (documentation: Documentation) => void;
  setMarkdown: (markdown: string) => void;
  setDocumentationError: (error: string | undefined) => void;
  clearDocumentation: () => void;
  
  // Cache actions
  setCacheStats: (stats: CacheStats) => void;
  clearCacheStats: () => void;
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        theme: 'light',
        sidebarOpen: true,
        currentView: 'analyze',
        
        analysis: {
          isAnalyzing: false,
          progress: 0,
          currentFile: undefined,
          result: undefined,
          error: undefined,
        },
        analysisResults: [],
        
        documentation: {
          isGenerating: false,
          documentation: undefined,
          markdown: undefined,
          error: undefined,
        },
        
        cacheStats: null,
        
        // App actions
        setTheme: (theme) => set({ theme }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setCurrentView: (currentView) => set({ currentView }),
        
        // Analysis actions
        setAnalyzing: (isAnalyzing) =>
          set((state) => ({
            analysis: { ...state.analysis, isAnalyzing },
          })),
        
        setAnalysisProgress: (progress, currentFile) =>
          set((state) => ({
            analysis: { ...state.analysis, progress, currentFile },
          })),
        
        setAnalysisResult: (result) =>
          set((state) => ({
            analysis: { ...state.analysis, result, error: undefined },
            analysisResults: [...state.analysisResults, result],
          })),
        
        setAnalysisResults: (results) =>
          set((state) => ({
            analysisResults: results,
            analysis: { ...state.analysis, error: undefined },
          })),
        
        setAnalysisError: (error) =>
          set((state) => ({
            analysis: { ...state.analysis, error, isAnalyzing: false },
          })),
        
        clearAnalysis: () =>
          set({
            analysis: {
              isAnalyzing: false,
              progress: 0,
              currentFile: undefined,
              result: undefined,
              error: undefined,
            },
            analysisResults: [],
          }),
        
        // Documentation actions
        setGeneratingDocumentation: (isGenerating) =>
          set((state) => ({
            documentation: { ...state.documentation, isGenerating },
          })),
        
        setDocumentation: (documentation) =>
          set((state) => ({
            documentation: {
              ...state.documentation,
              documentation,
              error: undefined,
            },
          })),
        
        setMarkdown: (markdown) =>
          set((state) => ({
            documentation: { ...state.documentation, markdown },
          })),
        
        setDocumentationError: (error) =>
          set((state) => ({
            documentation: {
              ...state.documentation,
              error,
              isGenerating: false,
            },
          })),
        
        clearDocumentation: () =>
          set({
            documentation: {
              isGenerating: false,
              documentation: undefined,
              markdown: undefined,
              error: undefined,
            },
          }),
        
        // Cache actions
        setCacheStats: (cacheStats) => set({ cacheStats }),
        clearCacheStats: () => set({ cacheStats: null }),
      }),
      {
        name: 'codelens-storage',
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    )
  )
);