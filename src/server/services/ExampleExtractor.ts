/**
 * Example extractor service
 * Extracts code examples from analysis results and source files
 */

import type {
  AnalysisResult,
  CodeExample,
  FunctionInfo,
  ClassInfo,
} from '@shared/types';
import { readFile } from '@utils/fileSystem.js';
import logger from '@utils/logger.js';

export class ExampleExtractor {
  /**
   * Extract code examples from analysis results
   */
  async extractExamples(analysisResults: AnalysisResult[]): Promise<CodeExample[]> {
    logger.info(`Extracting code examples from ${analysisResults.length} files`);

    const examples: CodeExample[] = [];

    for (const result of analysisResults) {
      // Extract function examples
      const functionExamples = await this.extractFunctionExamples(result);
      examples.push(...functionExamples);

      // Extract class examples
      const classExamples = await this.extractClassExamples(result);
      examples.push(...classExamples);

      // Extract usage examples from comments
      const commentExamples = await this.extractCommentExamples(result);
      examples.push(...commentExamples);
    }

    return examples;
  }

  /**
   * Extract function usage examples
   */
  private async extractFunctionExamples(result: AnalysisResult): Promise<CodeExample[]> {
    const examples: CodeExample[] = [];

    // Only extract examples for exported functions
    const exportedFunctions = result.functions.filter(f => f.isExported);

    for (const func of exportedFunctions) {
      try {
        const content = await readFile(result.filePath);
        const lines = content.split('\n');
        
        // Extract the function code
        const functionCode = lines.slice(func.line - 1, func.endLine).join('\n');

        // Create a usage example
        const usageExample = this.generateFunctionUsageExample(func, result.filePath);

        examples.push({
          title: `Using ${func.name}`,
          description: func.documentation || `Example usage of the ${func.name} function`,
          code: usageExample,
          language: result.language,
        });

        // Also include the actual implementation as an example
        examples.push({
          title: `${func.name} Implementation`,
          description: `Implementation of ${func.name} from ${result.filePath}`,
          code: functionCode,
          language: result.language,
        });
      } catch (error) {
        logger.error(`Failed to extract example for function ${func.name}:`, error);
      }
    }

    return examples;
  }

  /**
   * Extract class usage examples
   */
  private async extractClassExamples(result: AnalysisResult): Promise<CodeExample[]> {
    const examples: CodeExample[] = [];

    // Only extract examples for exported classes
    const exportedClasses = result.classes.filter(c => c.isExported);

    for (const cls of exportedClasses) {
      try {
        const content = await readFile(result.filePath);
        const lines = content.split('\n');
        
        // Extract the class code
        const classCode = lines.slice(cls.line - 1, cls.endLine).join('\n');

        // Create a usage example
        const usageExample = this.generateClassUsageExample(cls, result.filePath);

        examples.push({
          title: `Using ${cls.name}`,
          description: cls.documentation || `Example usage of the ${cls.name} class`,
          code: usageExample,
          language: result.language,
        });

        // Also include the actual implementation as an example
        examples.push({
          title: `${cls.name} Implementation`,
          description: `Implementation of ${cls.name} from ${result.filePath}`,
          code: classCode,
          language: result.language,
        });
      } catch (error) {
        logger.error(`Failed to extract example for class ${cls.name}:`, error);
      }
    }

    return examples;
  }

  /**
   * Extract examples from JSDoc/TSDoc comments
   */
  private async extractCommentExamples(result: AnalysisResult): Promise<CodeExample[]> {
    const examples: CodeExample[] = [];

    try {
      const content = await readFile(result.filePath);
      
      // Look for @example tags in comments
      const exampleRegex = /@example\s+([\s\S]*?)(?=\*\/|@\w+|$)/g;
      let match;

      while ((match = exampleRegex.exec(content)) !== null) {
        const exampleCode = match[1].trim();
        
        if (exampleCode) {
          // Clean up the example code (remove leading asterisks from comment lines)
          const cleanedCode = exampleCode
            .split('\n')
            .map(line => line.replace(/^\s*\*\s?/, ''))
            .join('\n')
            .trim();

          examples.push({
            title: `Example from ${result.filePath}`,
            description: 'Code example extracted from documentation comments',
            code: cleanedCode,
            language: result.language,
          });
        }
      }
    } catch (error) {
      logger.error(`Failed to extract comment examples from ${result.filePath}:`, error);
    }

    return examples;
  }

  /**
   * Generate a usage example for a function
   */
  private generateFunctionUsageExample(func: FunctionInfo, filePath: string): string {
    const fileName = filePath.split('/').pop()?.replace(/\.(ts|js|tsx|jsx)$/, '') || 'module';
    const importStatement = `import { ${func.name} } from './${fileName}';`;

    // Generate example parameters
    const exampleParams = func.params.map(param => {
      if (param.defaultValue) {
        return ''; // Skip parameters with defaults
      }
      return this.generateExampleValue(param.type, param.name);
    }).filter(Boolean);

    const paramsString = exampleParams.join(', ');
    const asyncKeyword = func.isAsync ? 'await ' : '';
    const callStatement = `const result = ${asyncKeyword}${func.name}(${paramsString});`;

    let example = `${importStatement}\n\n`;
    
    if (func.isAsync) {
      example += 'async function example() {\n';
      example += `  ${callStatement}\n`;
      example += '  console.log(result);\n';
      example += '}\n';
    } else {
      example += `${callStatement}\n`;
      example += 'console.log(result);\n';
    }

    return example;
  }

  /**
   * Generate a usage example for a class
   */
  private generateClassUsageExample(cls: ClassInfo, filePath: string): string {
    const fileName = filePath.split('/').pop()?.replace(/\.(ts|js|tsx|jsx)$/, '') || 'module';
    const importStatement = `import { ${cls.name} } from './${fileName}';`;

    // Find constructor parameters (if any)
    const constructor = cls.methods.find(m => m.name === 'constructor');
    const constructorParams = constructor?.params || [];

    // Generate example constructor parameters
    const exampleParams = constructorParams.map(param => {
      return this.generateExampleValue(param.type, param.name);
    });

    const paramsString = exampleParams.join(', ');
    const instantiation = `const instance = new ${cls.name}(${paramsString});`;

    // Find a public method to demonstrate
    const publicMethod = cls.methods.find(m => 
      m.visibility === 'public' && 
      m.name !== 'constructor'
    );

    let example = `${importStatement}\n\n`;
    example += `${instantiation}\n`;

    if (publicMethod) {
      const methodParams = publicMethod.params.map(param => {
        return this.generateExampleValue(param.type, param.name);
      });
      const methodParamsString = methodParams.join(', ');
      const asyncKeyword = publicMethod.isAsync ? 'await ' : '';
      
      if (publicMethod.isAsync) {
        example += '\nasync function example() {\n';
        example += `  const result = ${asyncKeyword}instance.${publicMethod.name}(${methodParamsString});\n`;
        example += '  console.log(result);\n';
        example += '}\n';
      } else {
        example += `const result = instance.${publicMethod.name}(${methodParamsString});\n`;
        example += 'console.log(result);\n';
      }
    }

    return example;
  }

  /**
   * Generate an example value based on type
   */
  private generateExampleValue(type: string | undefined, paramName: string): string {
    if (!type) return `'example${paramName}'`;

    const lowerType = type.toLowerCase();

    // Handle common types
    if (lowerType.includes('string')) {
      return `'example${paramName}'`;
    }
    if (lowerType.includes('number') || lowerType.includes('int')) {
      return '42';
    }
    if (lowerType.includes('boolean') || lowerType.includes('bool')) {
      return 'true';
    }
    if (lowerType.includes('array') || lowerType.includes('[]')) {
      return '[]';
    }
    if (lowerType.includes('object') || lowerType === 'any') {
      return '{}';
    }
    if (lowerType.includes('date')) {
      return 'new Date()';
    }
    if (lowerType.includes('function') || lowerType.includes('=>')) {
      return '() => {}';
    }
    if (lowerType.includes('promise')) {
      return 'Promise.resolve()';
    }

    // For custom types, create an empty object
    return '{}';
  }

  /**
   * Extract test examples from test files
   */
  async extractTestExamples(testFilePath: string): Promise<CodeExample[]> {
    const examples: CodeExample[] = [];

    try {
      const content = await readFile(testFilePath);
      
      // Look for test cases (describe/it blocks)
      const testRegex = /(?:it|test)\s*\(\s*['"`](.*?)['"`]\s*,\s*(?:async\s*)?\(\)\s*=>\s*\{([\s\S]*?)\n\s*\}\s*\)/g;
      let match;

      while ((match = testRegex.exec(content)) !== null) {
        const testName = match[1];
        const testCode = match[2].trim();

        examples.push({
          title: testName,
          description: `Test case from ${testFilePath}`,
          code: testCode,
          language: 'typescript',
        });
      }
    } catch (error) {
      logger.error(`Failed to extract test examples from ${testFilePath}:`, error);
    }

    return examples;
  }

  /**
   * Generate quick start example
   */
  generateQuickStartExample(
    analysisResults: AnalysisResult[],
    projectName: string
  ): CodeExample {
    // Find the main entry point or most important exported function/class
    let mainExport: { name: string; type: 'function' | 'class'; file: string } | null = null;

    for (const result of analysisResults) {
      // Look for index files or main files
      if (result.filePath.includes('index') || result.filePath.includes('main')) {
        const exportedFunc = result.functions.find(f => f.isExported);
        if (exportedFunc) {
          mainExport = { name: exportedFunc.name, type: 'function', file: result.filePath };
          break;
        }

        const exportedClass = result.classes.find(c => c.isExported);
        if (exportedClass) {
          mainExport = { name: exportedClass.name, type: 'class', file: result.filePath };
          break;
        }
      }
    }

    if (!mainExport) {
      // Fallback: use the first exported item
      for (const result of analysisResults) {
        const exportedFunc = result.functions.find(f => f.isExported);
        if (exportedFunc) {
          mainExport = { name: exportedFunc.name, type: 'function', file: result.filePath };
          break;
        }

        const exportedClass = result.classes.find(c => c.isExported);
        if (exportedClass) {
          mainExport = { name: exportedClass.name, type: 'class', file: result.filePath };
          break;
        }
      }
    }

    let code = `// Quick Start Guide for ${projectName}\n\n`;
    code += '// 1. Install dependencies\n';
    code += '// npm install\n\n';
    code += '// 2. Import and use\n';

    if (mainExport) {
      const fileName = mainExport.file.split('/').pop()?.replace(/\.(ts|js|tsx|jsx)$/, '') || 'module';
      code += `import { ${mainExport.name} } from './${fileName}';\n\n`;

      if (mainExport.type === 'function') {
        code += `const result = ${mainExport.name}();\n`;
        code += 'console.log(result);\n';
      } else {
        code += `const instance = new ${mainExport.name}();\n`;
        code += '// Use the instance...\n';
      }
    } else {
      code += '// Import your modules here\n';
    }

    return {
      title: 'Quick Start',
      description: `Get started with ${projectName} in seconds`,
      code,
      language: 'typescript',
    };
  }
}

export default ExampleExtractor;