/**
 * Documentation generator service
 * Generates comprehensive documentation from analysis results
 */

import type {
  AnalysisResult,
  Documentation,
  DocumentationSection,
  DocumentationMetadata,
  DocumentationOptions,
  FunctionInfo,
  ClassInfo,
  InterfaceInfo,
} from '@shared/types';
import logger from '@utils/logger.js';

export class DocumentationGenerator {
  private options: Required<DocumentationOptions>;

  constructor(options: DocumentationOptions = {}) {
    this.options = {
      includePrivate: options.includePrivate ?? false,
      includeDiagrams: options.includeDiagrams ?? true,
      includeExamples: options.includeExamples ?? true,
      format: options.format ?? 'markdown',
      theme: options.theme ?? 'light',
    };
  }

  /**
   * Generate documentation from analysis results
   */
  async generate(
    analysisResults: AnalysisResult[],
    projectName: string = 'Project'
  ): Promise<Documentation> {
    logger.info(`Generating documentation for ${analysisResults.length} files`);

    const sections = this.generateSections(analysisResults);
    const diagrams = this.options.includeDiagrams ? [] : []; // Will be populated by MermaidDiagramGenerator
    const examples = this.options.includeExamples ? [] : []; // Will be populated by ExampleExtractor

    const metadata: DocumentationMetadata = {
      generatedAt: Date.now(),
      version: '1.0.0',
      projectName,
    };

    return {
      title: `${projectName} Documentation`,
      description: `Auto-generated documentation for ${projectName}`,
      sections,
      diagrams,
      examples,
      metadata,
    };
  }

  /**
   * Generate documentation sections from analysis results
   */
  private generateSections(analysisResults: AnalysisResult[]): DocumentationSection[] {
    const sections: DocumentationSection[] = [];

    // Overview section
    sections.push(this.generateOverviewSection(analysisResults));

    // API Reference section
    sections.push(this.generateApiReferenceSection(analysisResults));

    // Complexity Analysis section
    sections.push(this.generateComplexitySection(analysisResults));

    // Dependencies section
    sections.push(this.generateDependenciesSection(analysisResults));

    return sections;
  }

  /**
   * Generate overview section
   */
  private generateOverviewSection(analysisResults: AnalysisResult[]): DocumentationSection {
    const totalFiles = analysisResults.length;
    const totalFunctions = analysisResults.reduce((sum, r) => sum + r.functions.length, 0);
    const totalClasses = analysisResults.reduce((sum, r) => sum + r.classes.length, 0);
    const totalInterfaces = analysisResults.reduce((sum, r) => sum + r.interfaces.length, 0);
    const totalLOC = analysisResults.reduce((sum, r) => sum + r.complexity.linesOfCode, 0);

    const content = `
# Project Overview

This project contains **${totalFiles}** files with the following structure:

- **Functions**: ${totalFunctions}
- **Classes**: ${totalClasses}
- **Interfaces**: ${totalInterfaces}
- **Total Lines of Code**: ${totalLOC.toLocaleString()}

## File Structure

${analysisResults.map(r => `- \`${r.filePath}\` (${r.language})`).join('\n')}
    `.trim();

    return {
      id: 'overview',
      title: 'Overview',
      content,
    };
  }

  /**
   * Generate API reference section
   */
  private generateApiReferenceSection(analysisResults: AnalysisResult[]): DocumentationSection {
    const subsections: DocumentationSection[] = [];

    for (const result of analysisResults) {
      const fileSubsections: DocumentationSection[] = [];

      // Functions subsection
      if (result.functions.length > 0) {
        fileSubsections.push(this.generateFunctionsSubsection(result.functions, result.filePath));
      }

      // Classes subsection
      if (result.classes.length > 0) {
        fileSubsections.push(this.generateClassesSubsection(result.classes, result.filePath));
      }

      // Interfaces subsection
      if (result.interfaces.length > 0) {
        fileSubsections.push(this.generateInterfacesSubsection(result.interfaces, result.filePath));
      }

      if (fileSubsections.length > 0) {
        subsections.push({
          id: `api-${result.filePath.replace(/[^a-zA-Z0-9]/g, '-')}`,
          title: result.filePath,
          content: `API reference for \`${result.filePath}\``,
          subsections: fileSubsections,
        });
      }
    }

    return {
      id: 'api-reference',
      title: 'API Reference',
      content: 'Comprehensive API documentation for all exported functions, classes, and interfaces.',
      subsections,
    };
  }

  /**
   * Generate functions subsection
   */
  private generateFunctionsSubsection(
    functions: FunctionInfo[],
    filePath: string
  ): DocumentationSection {
    const exportedFunctions = this.options.includePrivate
      ? functions
      : functions.filter(f => f.isExported);

    const content = exportedFunctions
      .map(func => {
        const params = func.params.map(p => {
          const optional = p.isOptional ? '?' : '';
          const type = p.type ? `: ${p.type}` : '';
          const defaultVal = p.defaultValue ? ` = ${p.defaultValue}` : '';
          return `${p.name}${optional}${type}${defaultVal}`;
        }).join(', ');

        const returnType = func.returnType ? `: ${func.returnType}` : '';
        const asyncKeyword = func.isAsync ? 'async ' : '';
        const signature = `${asyncKeyword}function ${func.name}(${params})${returnType}`;

        return `
### ${func.name}

\`\`\`typescript
${signature}
\`\`\`

${func.documentation || 'No documentation available.'}

**Location**: \`${filePath}:${func.line}\`  
**Complexity**: ${func.complexity}  
**Exported**: ${func.isExported ? 'Yes' : 'No'}
        `.trim();
      })
      .join('\n\n---\n\n');

    return {
      id: `functions-${filePath.replace(/[^a-zA-Z0-9]/g, '-')}`,
      title: 'Functions',
      content: content || 'No functions found.',
    };
  }

  /**
   * Generate classes subsection
   */
  private generateClassesSubsection(
    classes: ClassInfo[],
    filePath: string
  ): DocumentationSection {
    const exportedClasses = this.options.includePrivate
      ? classes
      : classes.filter(c => c.isExported);

    const content = exportedClasses
      .map(cls => {
        const extendsClause = cls.extends ? ` extends ${cls.extends}` : '';
        const implementsClause = cls.implements?.length
          ? ` implements ${cls.implements.join(', ')}`
          : '';

        const methods = cls.methods
          .filter(m => this.options.includePrivate || m.visibility === 'public')
          .map(m => {
            const params = m.params.map(p => `${p.name}${p.isOptional ? '?' : ''}${p.type ? `: ${p.type}` : ''}`).join(', ');
            const returnType = m.returnType ? `: ${m.returnType}` : '';
            const modifiers = [
              m.visibility !== 'public' ? m.visibility : '',
              m.isStatic ? 'static' : '',
              m.isAsync ? 'async' : '',
            ].filter(Boolean).join(' ');

            return `  ${modifiers} ${m.name}(${params})${returnType}`;
          })
          .join('\n');

        const properties = cls.properties
          .filter(p => this.options.includePrivate || p.visibility === 'public')
          .map(p => {
            const modifiers = [
              p.visibility && p.visibility !== 'public' ? p.visibility : '',
              p.isReadonly ? 'readonly' : '',
            ].filter(Boolean).join(' ');
            const optional = p.isOptional ? '?' : '';
            const type = p.type ? `: ${p.type}` : '';

            return `  ${modifiers} ${p.name}${optional}${type}`;
          })
          .join('\n');

        return `
### ${cls.name}

\`\`\`typescript
class ${cls.name}${extendsClause}${implementsClause} {
${properties}

${methods}
}
\`\`\`

${cls.documentation || 'No documentation available.'}

**Location**: \`${filePath}:${cls.line}\`  
**Exported**: ${cls.isExported ? 'Yes' : 'No'}  
**Methods**: ${cls.methods.length}  
**Properties**: ${cls.properties.length}
        `.trim();
      })
      .join('\n\n---\n\n');

    return {
      id: `classes-${filePath.replace(/[^a-zA-Z0-9]/g, '-')}`,
      title: 'Classes',
      content: content || 'No classes found.',
    };
  }

  /**
   * Generate interfaces subsection
   */
  private generateInterfacesSubsection(
    interfaces: InterfaceInfo[],
    filePath: string
  ): DocumentationSection {
    const exportedInterfaces = this.options.includePrivate
      ? interfaces
      : interfaces.filter(i => i.isExported);

    const content = exportedInterfaces
      .map(iface => {
        const extendsClause = iface.extends?.length
          ? ` extends ${iface.extends.join(', ')}`
          : '';

        const properties = iface.properties
          .map(p => {
            const optional = p.isOptional ? '?' : '';
            const readonly = p.isReadonly ? 'readonly ' : '';
            const type = p.type ? `: ${p.type}` : '';
            return `  ${readonly}${p.name}${optional}${type};`;
          })
          .join('\n');

        return `
### ${iface.name}

\`\`\`typescript
interface ${iface.name}${extendsClause} {
${properties}
}
\`\`\`

${iface.documentation || 'No documentation available.'}

**Location**: \`${filePath}:${iface.line}\`  
**Exported**: ${iface.isExported ? 'Yes' : 'No'}  
**Properties**: ${iface.properties.length}
        `.trim();
      })
      .join('\n\n---\n\n');

    return {
      id: `interfaces-${filePath.replace(/[^a-zA-Z0-9]/g, '-')}`,
      title: 'Interfaces',
      content: content || 'No interfaces found.',
    };
  }

  /**
   * Generate complexity analysis section
   */
  private generateComplexitySection(analysisResults: AnalysisResult[]): DocumentationSection {
    const complexityData = analysisResults.map(r => ({
      file: r.filePath,
      cyclomatic: r.complexity.cyclomatic,
      cognitive: r.complexity.cognitive,
      maintainability: r.complexity.maintainabilityIndex,
      loc: r.complexity.linesOfCode,
    }));

    const avgCyclomatic = complexityData.reduce((sum, d) => sum + d.cyclomatic, 0) / complexityData.length;
    const avgCognitive = complexityData.reduce((sum, d) => sum + d.cognitive, 0) / complexityData.length;
    const avgMaintainability = complexityData.reduce((sum, d) => sum + d.maintainability, 0) / complexityData.length;

    const content = `
# Complexity Analysis

## Summary

- **Average Cyclomatic Complexity**: ${avgCyclomatic.toFixed(2)}
- **Average Cognitive Complexity**: ${avgCognitive.toFixed(2)}
- **Average Maintainability Index**: ${avgMaintainability.toFixed(2)}

## Per-File Metrics

${complexityData
  .sort((a, b) => b.cyclomatic - a.cyclomatic)
  .map(d => `
### ${d.file}

- **Cyclomatic Complexity**: ${d.cyclomatic}
- **Cognitive Complexity**: ${d.cognitive}
- **Maintainability Index**: ${d.maintainability.toFixed(2)}
- **Lines of Code**: ${d.loc}
  `.trim())
  .join('\n\n')}
    `.trim();

    return {
      id: 'complexity',
      title: 'Complexity Analysis',
      content,
    };
  }

  /**
   * Generate dependencies section
   */
  private generateDependenciesSection(analysisResults: AnalysisResult[]): DocumentationSection {
    const allDependencies = new Set<string>();
    const dependencyMap = new Map<string, string[]>();

    for (const result of analysisResults) {
      result.dependencies.forEach(dep => allDependencies.add(dep));
      dependencyMap.set(result.filePath, result.dependencies);
    }

    const content = `
# Dependencies

## External Dependencies

${Array.from(allDependencies)
  .filter(dep => !dep.startsWith('.'))
  .sort()
  .map(dep => `- \`${dep}\``)
  .join('\n') || 'No external dependencies found.'}

## Internal Dependencies

${Array.from(dependencyMap.entries())
  .filter(([_, deps]) => deps.some(d => d.startsWith('.')))
  .map(([file, deps]) => `
### ${file}

${deps.filter(d => d.startsWith('.')).map(d => `- \`${d}\``).join('\n')}
  `.trim())
  .join('\n\n') || 'No internal dependencies found.'}
    `.trim();

    return {
      id: 'dependencies',
      title: 'Dependencies',
      content,
    };
  }
}

export default DocumentationGenerator;