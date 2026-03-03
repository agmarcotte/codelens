import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnalyzeView } from '../AnalyzeView';
import { useAppStore } from '../../../store/useAppStore';
import { apiService } from '../../../services/api';

// Mock the store
vi.mock('../../../store/useAppStore');

// Mock the API service
vi.mock('../../../services/api', () => ({
  apiService: {
    analyzeFile: vi.fn(),
    analyzeDirectory: vi.fn(),
  },
}));

// Mock AnalysisResults component
vi.mock('../../analysis/AnalysisResults', () => ({
  AnalysisResults: () => <div data-testid="analysis-results">Analysis Results</div>,
}));

describe('AnalyzeView', () => {
  const mockSetAnalyzing = vi.fn();
  const mockSetAnalysisResult = vi.fn();
  const mockSetAnalysisResults = vi.fn();
  const mockSetAnalysisError = vi.fn();

  const mockAnalysisState = {
    isAnalyzing: false,
    result: null,
    results: [],
    error: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockReturnValue({
      analysis: mockAnalysisState,
      setAnalyzing: mockSetAnalyzing,
      setAnalysisResult: mockSetAnalysisResult,
      setAnalysisResults: mockSetAnalysisResults,
      setAnalysisError: mockSetAnalysisError,
    });
  });

  it('should render the code analysis title', () => {
    render(<AnalyzeView />);
    expect(screen.getByText('Code Analysis')).toBeInTheDocument();
    expect(
      screen.getByText('Analyze your code to extract functions, classes, and complexity metrics')
    ).toBeInTheDocument();
  });

  it('should render file path input', () => {
    render(<AnalyzeView />);
    const input = screen.getByLabelText('File or Directory Path');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'e.g., ./src/index.ts or ./src');
  });

  it('should render directory checkbox', () => {
    render(<AnalyzeView />);
    const checkbox = screen.getByLabelText('Analyze entire directory');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute('type', 'checkbox');
  });

  it('should render analyze button', () => {
    render(<AnalyzeView />);
    expect(screen.getByText('Analyze')).toBeInTheDocument();
  });

  it('should update file path when input changes', () => {
    render(<AnalyzeView />);
    const input = screen.getByLabelText('File or Directory Path') as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: './src/test.ts' } });
    
    expect(input.value).toBe('./src/test.ts');
  });

  it('should toggle directory checkbox', () => {
    render(<AnalyzeView />);
    const checkbox = screen.getByLabelText('Analyze entire directory') as HTMLInputElement;
    
    expect(checkbox.checked).toBe(false);
    
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
    
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });

  it('should show error when analyzing without file path', async () => {
    render(<AnalyzeView />);
    const analyzeButton = screen.getByText('Analyze');
    
    fireEvent.click(analyzeButton);
    
    await waitFor(() => {
      expect(mockSetAnalysisError).toHaveBeenCalledWith('Please enter a file or directory path');
    });
  });

  it('should call analyzeFile when analyzing a single file', async () => {
    const mockResult = { filePath: './src/test.ts', functions: [], classes: [] };
    (apiService.analyzeFile as any).mockResolvedValue(mockResult);

    render(<AnalyzeView />);
    
    const input = screen.getByLabelText('File or Directory Path');
    fireEvent.change(input, { target: { value: './src/test.ts' } });
    
    const analyzeButton = screen.getByText('Analyze');
    fireEvent.click(analyzeButton);
    
    await waitFor(() => {
      expect(mockSetAnalyzing).toHaveBeenCalledWith(true);
      expect(apiService.analyzeFile).toHaveBeenCalledWith({
        path: './src/test.ts',
        useCache: true,
      });
      expect(mockSetAnalysisResult).toHaveBeenCalledWith(mockResult);
    });
  });

  it('should call analyzeDirectory when analyzing a directory', async () => {
    const mockResults = [
      { filePath: './src/test1.ts', functions: [], classes: [] },
      { filePath: './src/test2.ts', functions: [], classes: [] },
    ];
    (apiService.analyzeDirectory as any).mockResolvedValue(mockResults);

    render(<AnalyzeView />);
    
    const input = screen.getByLabelText('File or Directory Path');
    fireEvent.change(input, { target: { value: './src' } });
    
    const checkbox = screen.getByLabelText('Analyze entire directory');
    fireEvent.click(checkbox);
    
    const analyzeButton = screen.getByText('Analyze');
    fireEvent.click(analyzeButton);
    
    await waitFor(() => {
      expect(mockSetAnalyzing).toHaveBeenCalledWith(true);
      expect(apiService.analyzeDirectory).toHaveBeenCalledWith({
        path: './src',
        recursive: true,
        useCache: true,
      });
      expect(mockSetAnalysisResults).toHaveBeenCalledWith(mockResults);
    });
  });

  it('should display error message when analysis fails', async () => {
    (apiService.analyzeFile as any).mockRejectedValue(new Error('Analysis failed'));

    render(<AnalyzeView />);
    
    const input = screen.getByLabelText('File or Directory Path');
    fireEvent.change(input, { target: { value: './src/test.ts' } });
    
    const analyzeButton = screen.getByText('Analyze');
    fireEvent.click(analyzeButton);
    
    await waitFor(() => {
      expect(mockSetAnalysisError).toHaveBeenCalledWith('Analysis failed');
      expect(mockSetAnalyzing).toHaveBeenCalledWith(false);
    });
  });

  it('should display error message in UI', () => {
    (useAppStore as any).mockReturnValue({
      analysis: { ...mockAnalysisState, error: 'Test error message' },
      setAnalyzing: mockSetAnalyzing,
      setAnalysisResult: mockSetAnalysisResult,
      setAnalysisResults: mockSetAnalysisResults,
      setAnalysisError: mockSetAnalysisError,
    });

    render(<AnalyzeView />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should show loading state when analyzing', () => {
    (useAppStore as any).mockReturnValue({
      analysis: { ...mockAnalysisState, isAnalyzing: true },
      setAnalyzing: mockSetAnalyzing,
      setAnalysisResult: mockSetAnalysisResult,
      setAnalysisResults: mockSetAnalysisResults,
      setAnalysisError: mockSetAnalysisError,
    });

    render(<AnalyzeView />);
    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
  });

  it('should disable inputs when analyzing', () => {
    (useAppStore as any).mockReturnValue({
      analysis: { ...mockAnalysisState, isAnalyzing: true },
      setAnalyzing: mockSetAnalyzing,
      setAnalysisResult: mockSetAnalysisResult,
      setAnalysisResults: mockSetAnalysisResults,
      setAnalysisError: mockSetAnalysisError,
    });

    render(<AnalyzeView />);
    
    const input = screen.getByLabelText('File or Directory Path');
    const checkbox = screen.getByLabelText('Analyze entire directory');
    const button = screen.getByText('Analyzing...');
    
    expect(input).toBeDisabled();
    expect(checkbox).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('should show FileSearch icon for single file analysis', () => {
    render(<AnalyzeView />);
    const button = screen.getByText('Analyze').closest('button');
    expect(button?.querySelector('svg')).toBeInTheDocument();
  });

  it('should show Folder icon for directory analysis', () => {
    render(<AnalyzeView />);
    
    const checkbox = screen.getByLabelText('Analyze entire directory');
    fireEvent.click(checkbox);
    
    const button = screen.getByText('Analyze').closest('button');
    expect(button?.querySelector('svg')).toBeInTheDocument();
  });

  it('should show spinning loader icon when analyzing', () => {
    (useAppStore as any).mockReturnValue({
      analysis: { ...mockAnalysisState, isAnalyzing: true },
      setAnalyzing: mockSetAnalyzing,
      setAnalysisResult: mockSetAnalysisResult,
      setAnalysisResults: mockSetAnalysisResults,
      setAnalysisError: mockSetAnalysisError,
    });

    render(<AnalyzeView />);
    const button = screen.getByText('Analyzing...').closest('button');
    const icon = button?.querySelector('.animate-spin');
    expect(icon).toBeInTheDocument();
  });

  it('should render AnalysisResults when result is available', () => {
    (useAppStore as any).mockReturnValue({
      analysis: { 
        ...mockAnalysisState, 
        result: { filePath: './src/test.ts', functions: [], classes: [] } 
      },
      setAnalyzing: mockSetAnalyzing,
      setAnalysisResult: mockSetAnalysisResult,
      setAnalysisResults: mockSetAnalysisResults,
      setAnalysisError: mockSetAnalysisError,
    });

    render(<AnalyzeView />);
    expect(screen.getByTestId('analysis-results')).toBeInTheDocument();
  });

  it('should render AnalysisResults when analyzing', () => {
    (useAppStore as any).mockReturnValue({
      analysis: { ...mockAnalysisState, isAnalyzing: true },
      setAnalyzing: mockSetAnalyzing,
      setAnalysisResult: mockSetAnalysisResult,
      setAnalysisResults: mockSetAnalysisResults,
      setAnalysisError: mockSetAnalysisError,
    });

    render(<AnalyzeView />);
    expect(screen.getByTestId('analysis-results')).toBeInTheDocument();
  });

  it('should clear error before starting new analysis', async () => {
    const mockResult = { filePath: './src/test.ts', functions: [], classes: [] };
    (apiService.analyzeFile as any).mockResolvedValue(mockResult);

    render(<AnalyzeView />);
    
    const input = screen.getByLabelText('File or Directory Path');
    fireEvent.change(input, { target: { value: './src/test.ts' } });
    
    const analyzeButton = screen.getByText('Analyze');
    fireEvent.click(analyzeButton);
    
    await waitFor(() => {
      expect(mockSetAnalysisError).toHaveBeenCalledWith(undefined);
    });
  });
});