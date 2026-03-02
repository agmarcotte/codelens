/**
 * File system utility functions
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import type { FileInfo, DirectoryTree } from '@shared/types';

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read file content
 */
export async function readFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${(error as Error).message}`);
  }
}

/**
 * Write content to file
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${(error as Error).message}`);
  }
}

/**
 * Get file information
 */
export async function getFileInfo(filePath: string): Promise<FileInfo> {
  try {
    const stats = await fs.stat(filePath);
    return {
      path: filePath,
      name: path.basename(filePath),
      extension: path.extname(filePath),
      size: stats.size,
      isDirectory: stats.isDirectory(),
      modifiedAt: stats.mtimeMs,
    };
  } catch (error) {
    throw new Error(`Failed to get file info for ${filePath}: ${(error as Error).message}`);
  }
}

/**
 * List files in a directory
 */
export async function listFiles(
  dirPath: string,
  options: {
    recursive?: boolean;
    extensions?: string[];
    excludePatterns?: string[];
  } = {}
): Promise<FileInfo[]> {
  const { recursive = false, extensions = [], excludePatterns = [] } = options;

  try {
    const pattern = recursive ? '**/*' : '*';
    const fullPattern = path.join(dirPath, pattern);

    const files = await glob(fullPattern, {
      nodir: true,
      ignore: excludePatterns,
      absolute: true,
    });

    const fileInfos = await Promise.all(
      files.map(async (file) => {
        const info = await getFileInfo(file);
        return info;
      })
    );

    // Filter by extensions if specified
    if (extensions.length > 0) {
      return fileInfos.filter((info) => extensions.includes(info.extension));
    }

    return fileInfos;
  } catch (error) {
    throw new Error(`Failed to list files in ${dirPath}: ${(error as Error).message}`);
  }
}

/**
 * Build directory tree structure
 */
export async function buildDirectoryTree(
  dirPath: string,
  maxDepth: number = 5,
  currentDepth: number = 0
): Promise<DirectoryTree> {
  if (currentDepth >= maxDepth) {
    return {
      path: dirPath,
      name: path.basename(dirPath),
      children: [],
      files: [],
    };
  }

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const children: DirectoryTree[] = [];
    const files: FileInfo[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      // Skip node_modules and hidden files
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
        continue;
      }

      if (entry.isDirectory()) {
        const subTree = await buildDirectoryTree(fullPath, maxDepth, currentDepth + 1);
        children.push(subTree);
      } else {
        const fileInfo = await getFileInfo(fullPath);
        files.push(fileInfo);
      }
    }

    return {
      path: dirPath,
      name: path.basename(dirPath),
      children,
      files,
    };
  } catch (error) {
    throw new Error(`Failed to build directory tree for ${dirPath}: ${(error as Error).message}`);
  }
}

/**
 * Find files matching a pattern
 */
export async function findFiles(
  dirPath: string,
  pattern: string,
  options: {
    maxDepth?: number;
    excludePatterns?: string[];
  } = {}
): Promise<string[]> {
  const { maxDepth = 10, excludePatterns = [] } = options;

  try {
    const fullPattern = path.join(dirPath, pattern);
    const files = await glob(fullPattern, {
      nodir: true,
      ignore: excludePatterns,
      absolute: true,
      maxDepth,
    });

    return files;
  } catch (error) {
    throw new Error(`Failed to find files matching ${pattern}: ${(error as Error).message}`);
  }
}

/**
 * Get relative path from base directory
 */
export function getRelativePath(filePath: string, baseDir: string): string {
  return path.relative(baseDir, filePath);
}

/**
 * Normalize path separators
 */
export function normalizePath(filePath: string): string {
  return filePath.split(path.sep).join('/');
}

/**
 * Check if file is supported for analysis
 */
export function isSupportedFile(filePath: string, supportedExtensions: string[]): boolean {
  const ext = path.extname(filePath);
  return supportedExtensions.includes(ext);
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Ensure directory exists
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create directory ${dirPath}: ${(error as Error).message}`);
  }
}

/**
 * Delete file or directory
 */
export async function deleteFileOrDirectory(targetPath: string): Promise<void> {
  try {
    const stats = await fs.stat(targetPath);
    if (stats.isDirectory()) {
      await fs.rm(targetPath, { recursive: true, force: true });
    } else {
      await fs.unlink(targetPath);
    }
  } catch (error) {
    throw new Error(`Failed to delete ${targetPath}: ${(error as Error).message}`);
  }
}