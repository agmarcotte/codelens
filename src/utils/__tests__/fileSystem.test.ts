/**
 * Unit tests for file system utilities
 */

import fs from 'fs/promises';
import path from 'path';
import { jest } from '@jest/globals';
import {
  fileExists,
  readFile,
  writeFile,
  getFileInfo,
  listFiles,
  buildDirectoryTree,
  findFiles,
  getRelativePath,
  normalizePath,
  isSupportedFile,
  formatFileSize,
  ensureDirectory,
  deleteFileOrDirectory,
} from '../fileSystem';

// Mock fs/promises
jest.mock('fs/promises');
const mockedFs = fs as jest.Mocked<typeof fs>;

// Mock glob
jest.mock('glob', () => ({
  glob: jest.fn(),
}));

describe('fileSystem utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fileExists', () => {
    it('should return true if file exists', async () => {
      mockedFs.access.mockResolvedValue(undefined);
      const result = await fileExists('/test/file.ts');
      expect(result).toBe(true);
      expect(mockedFs.access).toHaveBeenCalledWith('/test/file.ts');
    });

    it('should return false if file does not exist', async () => {
      mockedFs.access.mockRejectedValue(new Error('File not found'));
      const result = await fileExists('/test/nonexistent.ts');
      expect(result).toBe(false);
    });
  });

  describe('readFile', () => {
    it('should read file content successfully', async () => {
      const content = 'test content';
      mockedFs.readFile.mockResolvedValue(content);
      
      const result = await readFile('/test/file.ts');
      
      expect(result).toBe(content);
      expect(mockedFs.readFile).toHaveBeenCalledWith('/test/file.ts', 'utf-8');
    });

    it('should throw error if file cannot be read', async () => {
      mockedFs.readFile.mockRejectedValue(new Error('Permission denied'));
      
      await expect(readFile('/test/file.ts')).rejects.toThrow(
        'Failed to read file /test/file.ts: Permission denied'
      );
    });
  });

  describe('writeFile', () => {
    it('should write content to file successfully', async () => {
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.writeFile.mockResolvedValue(undefined);
      
      await writeFile('/test/dir/file.ts', 'content');
      
      expect(mockedFs.mkdir).toHaveBeenCalledWith('/test/dir', { recursive: true });
      expect(mockedFs.writeFile).toHaveBeenCalledWith('/test/dir/file.ts', 'content', 'utf-8');
    });

    it('should throw error if file cannot be written', async () => {
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.writeFile.mockRejectedValue(new Error('Disk full'));
      
      await expect(writeFile('/test/file.ts', 'content')).rejects.toThrow(
        'Failed to write file /test/file.ts: Disk full'
      );
    });
  });

  describe('getFileInfo', () => {
    it('should return file information', async () => {
      const mockStats = {
        size: 1024,
        isDirectory: () => false,
        mtimeMs: 1234567890,
      };
      mockedFs.stat.mockResolvedValue(mockStats as any);
      
      const result = await getFileInfo('/test/file.ts');
      
      expect(result).toEqual({
        path: '/test/file.ts',
        name: 'file.ts',
        extension: '.ts',
        size: 1024,
        isDirectory: false,
        modifiedAt: 1234567890,
      });
    });

    it('should throw error if stat fails', async () => {
      mockedFs.stat.mockRejectedValue(new Error('File not found'));
      
      await expect(getFileInfo('/test/file.ts')).rejects.toThrow(
        'Failed to get file info for /test/file.ts: File not found'
      );
    });
  });

  describe('getRelativePath', () => {
    it('should return relative path', () => {
      const result = getRelativePath('/project/src/file.ts', '/project');
      expect(result).toBe(path.join('src', 'file.ts'));
    });

    it('should handle same directory', () => {
      const result = getRelativePath('/project/file.ts', '/project');
      expect(result).toBe('file.ts');
    });
  });

  describe('normalizePath', () => {
    it('should normalize path separators to forward slashes', () => {
      const windowsPath = 'C:\\Users\\test\\file.ts';
      const result = normalizePath(windowsPath);
      expect(result).toBe('C:/Users/test/file.ts');
    });

    it('should handle already normalized paths', () => {
      const unixPath = '/home/user/file.ts';
      const result = normalizePath(unixPath);
      expect(result).toBe('/home/user/file.ts');
    });
  });

  describe('isSupportedFile', () => {
    const supportedExtensions = ['.ts', '.tsx', '.js', '.jsx'];

    it('should return true for supported extensions', () => {
      expect(isSupportedFile('file.ts', supportedExtensions)).toBe(true);
      expect(isSupportedFile('file.tsx', supportedExtensions)).toBe(true);
      expect(isSupportedFile('file.js', supportedExtensions)).toBe(true);
    });

    it('should return false for unsupported extensions', () => {
      expect(isSupportedFile('file.py', supportedExtensions)).toBe(false);
      expect(isSupportedFile('file.txt', supportedExtensions)).toBe(false);
      expect(isSupportedFile('file', supportedExtensions)).toBe(false);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500.00 B');
      expect(formatFileSize(1024)).toBe('1.00 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.00 GB');
    });

    it('should handle decimal values', () => {
      expect(formatFileSize(1536)).toBe('1.50 KB');
      expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.50 MB');
    });

    it('should handle zero bytes', () => {
      expect(formatFileSize(0)).toBe('0.00 B');
    });
  });

  describe('ensureDirectory', () => {
    it('should create directory if it does not exist', async () => {
      mockedFs.mkdir.mockResolvedValue(undefined);
      
      await ensureDirectory('/test/dir');
      
      expect(mockedFs.mkdir).toHaveBeenCalledWith('/test/dir', { recursive: true });
    });

    it('should throw error if directory cannot be created', async () => {
      mockedFs.mkdir.mockRejectedValue(new Error('Permission denied'));
      
      await expect(ensureDirectory('/test/dir')).rejects.toThrow(
        'Failed to create directory /test/dir: Permission denied'
      );
    });
  });

  describe('deleteFileOrDirectory', () => {
    it('should delete file', async () => {
      const mockStats = {
        isDirectory: () => false,
      };
      mockedFs.stat.mockResolvedValue(mockStats as any);
      mockedFs.unlink.mockResolvedValue(undefined);
      
      await deleteFileOrDirectory('/test/file.ts');
      
      expect(mockedFs.unlink).toHaveBeenCalledWith('/test/file.ts');
    });

    it('should delete directory recursively', async () => {
      const mockStats = {
        isDirectory: () => true,
      };
      mockedFs.stat.mockResolvedValue(mockStats as any);
      mockedFs.rm.mockResolvedValue(undefined);
      
      await deleteFileOrDirectory('/test/dir');
      
      expect(mockedFs.rm).toHaveBeenCalledWith('/test/dir', { recursive: true, force: true });
    });

    it('should throw error if deletion fails', async () => {
      mockedFs.stat.mockRejectedValue(new Error('Not found'));
      
      await expect(deleteFileOrDirectory('/test/file.ts')).rejects.toThrow(
        'Failed to delete /test/file.ts: Not found'
      );
    });
  });
});