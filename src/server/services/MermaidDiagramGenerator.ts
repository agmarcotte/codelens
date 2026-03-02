/**
 * Mermaid diagram generator service
 * Generates Mermaid diagrams from analysis results
 */

import type {
  AnalysisResult,
  DiagramInfo,
  ClassInfo,
  FunctionInfo,
} from '@shared/types';
import logger from '@utils/logger.js';

export class MermaidDiagramGenerator {
  /**
   * Generate all diagrams from analysis results
   */
  async generateDiagrams(analysisResults: AnalysisResult[]): Promise<DiagramInfo[]> {
    logger.info(`Generating Mermaid diagrams for ${analysisResults.length} files`);

    const diagrams: DiagramInfo[] = [];

    // Generate class diagram
    const classDiagram = this.generateClassDiagram(analysisResults);
    if (classDiagram) diagrams.push(classDiagram);

    // Generate component diagram (file dependencies)
    const componentDiagram = this.generateComponentDiagram(analysisResults);
    if (componentDiagram) diagrams.push(componentDiagram);

    // Generate flowchart for complex functions
    const flowcharts = this.generateFlowcharts(analysisResults);
    diagrams.push(...flowcharts);

    return diagrams;
  }

  /**
   * Generate class diagram showing relationships between classes
   */
  private generateClassDiagram(analysisResults: AnalysisResult[]): DiagramInfo | null {
    const allClasses: Array<{ class: ClassInfo; file: string }> = [];

    // Collect all classes
    for (const result of analysisResults) {
      for (const cls of result.classes) {
        allClasses.push({ class: cls, file: result.filePath });
      }
    }

    if (allClasses.length === 0) return null;

    let mermaidCode = 'classDiagram\n';

    // Add class definitions
    for (const { class: cls } of allClasses) {
      mermaidCode += `  class ${cls.name} {\n`;

      // Add properties
      for (const prop of cls.properties) {
        const visibility = this.getVisibilitySymbol(prop.visibility);
        const type = prop.type || 'any';
        mermaidCode += `    ${visibility}${prop.type ? type + ' ' : ''}${prop.name}\n`;
      }

      // Add methods
      for (const method of cls.methods) {
        const visibility = this.getVisibilitySymbol(method.visibility);
        const params = method.params.map(p => `${p.name}: ${p.type || 'any'}`).join(', ');
        const returnType = method.returnType || 'void';
        mermaidCode += `    ${visibility}${method.name}(${params}) ${returnType}\n`;
      }

      mermaidCode += '  }\n';

      // Add inheritance relationships
      if (cls.extends) {
        mermaidCode += `  ${cls.extends} <|-- ${cls.name}\n`;
      }

      // Add interface implementations
      if (cls.implements) {
        for (const iface of cls.implements) {
          mermaidCode += `  ${iface} <|.. ${cls.name}\n`;
        }
      }
    }

    return {
      type: 'class',
      title: 'Class Diagram',
      mermaidCode,
      description: 'Shows the relationships between classes in the project',
    };
  }

  /**
   * Generate component diagram showing file dependencies
   */
  private generateComponentDiagram(analysisResults: AnalysisResult[]): DiagramInfo | null {
    if (analysisResults.length === 0) return null;

    let mermaidCode = 'graph TD\n';

    // Create nodes for each file
    const fileNodes = new Map<string, string>();
    for (let i = 0; i < analysisResults.length; i++) {
      const result = analysisResults[i];
      const nodeId = `F${i}`;
      const fileName = result.filePath.split('/').pop() || result.filePath;
      fileNodes.set(result.filePath, nodeId);
      mermaidCode += `  ${nodeId}["${fileName}"]\n`;
    }

    // Add dependency edges
    for (const result of analysisResults) {
      const sourceNode = fileNodes.get(result.filePath);
      if (!sourceNode) continue;

      for (const dep of result.dependencies) {
        // Only show internal dependencies
        if (dep.startsWith('.')) {
          // Try to resolve the dependency path
          const depPath = this.resolveDependencyPath(result.filePath, dep);
          const targetNode = fileNodes.get(depPath);
          
          if (targetNode) {
            mermaidCode += `  ${sourceNode} --> ${targetNode}\n`;
          }
        }
      }
    }

    return {
      type: 'component',
      title: 'Component Diagram',
      mermaidCode,
      description: 'Shows the dependencies between files in the project',
    };
  }

  /**
   * Generate flowcharts for complex functions
   */
  private generateFlowcharts(analysisResults: AnalysisResult[]): DiagramInfo[] {
    const flowcharts: DiagramInfo[] = [];
    const COMPLEXITY_THRESHOLD = 10;

    for (const result of analysisResults) {
      for (const func of result.functions) {
        if (func.complexity >= COMPLEXITY_THRESHOLD) {
          const flowchart = this.generateFunctionFlowchart(func, result.filePath);
          if (flowchart) flowcharts.push(flowchart);
        }
      }

      for (const cls of result.classes) {
        for (const method of cls.methods) {
          if (method.complexity >= COMPLEXITY_THRESHOLD) {
            const flowchart = this.generateMethodFlowchart(method, cls.name, result.filePath);
            if (flowchart) flowcharts.push(flowchart);
          }
        }
      }
    }

    return flowcharts;
  }

  /**
   * Generate flowchart for a function
   */
  private generateFunctionFlowchart(func: FunctionInfo, filePath: string): DiagramInfo {
    let mermaidCode = 'flowchart TD\n';
    mermaidCode += `  Start([Start: ${func.name}])\n`;
    
    // Add parameters
    if (func.params.length > 0) {
      mermaidCode += `  Params[/"Parameters: ${func.params.map(p => p.name).join(', ')}"/]\n`;
      mermaidCode += '  Start --> Params\n';
    }

    // Add async indicator
    if (func.isAsync) {
      mermaidCode += '  Async{Async Function}\n';
      mermaidCode += func.params.length > 0 ? '  Params --> Async\n' : '  Start --> Async\n';
    }

    // Add complexity indicator
    mermaidCode += `  Process["Function Logic\\n(Complexity: ${func.complexity})"]\n`;
    const lastNode = func.isAsync ? 'Async' : (func.params.length > 0 ? 'Params' : 'Start');
    mermaidCode += `  ${lastNode} --> Process\n`;

    // Add return
    if (func.returnType) {
      mermaidCode += `  Return[/"Return: ${func.returnType}"/]\n`;
      mermaidCode += '  Process --> Return\n';
      mermaidCode += '  Return --> End\n';
    } else {
      mermaidCode += '  Process --> End\n';
    }

    mermaidCode += '  End([End])\n';

    return {
      type: 'flowchart',
      title: `Flowchart: ${func.name}`,
      mermaidCode,
      description: `Flowchart for function ${func.name} in ${filePath} (Complexity: ${func.complexity})`,
    };
  }

  /**
   * Generate flowchart for a method
   */
  private generateMethodFlowchart(
    method: { name: string; params: Array<{ name: string }>; returnType?: string; complexity: number; isAsync: boolean },
    className: string,
    filePath: string
  ): DiagramInfo {
    let mermaidCode = 'flowchart TD\n';
    mermaidCode += `  Start([Start: ${className}.${method.name}])\n`;
    
    // Add parameters
    if (method.params.length > 0) {
      mermaidCode += `  Params[/"Parameters: ${method.params.map(p => p.name).join(', ')}"/]\n`;
      mermaidCode += '  Start --> Params\n';
    }

    // Add async indicator
    if (method.isAsync) {
      mermaidCode += '  Async{Async Method}\n';
      mermaidCode += method.params.length > 0 ? '  Params --> Async\n' : '  Start --> Async\n';
    }

    // Add complexity indicator
    mermaidCode += `  Process["Method Logic\\n(Complexity: ${method.complexity})"]\n`;
    const lastNode = method.isAsync ? 'Async' : (method.params.length > 0 ? 'Params' : 'Start');
    mermaidCode += `  ${lastNode} --> Process\n`;

    // Add return
    if (method.returnType) {
      mermaidCode += `  Return[/"Return: ${method.returnType}"/]\n`;
      mermaidCode += '  Process --> Return\n';
      mermaidCode += '  Return --> End\n';
    } else {
      mermaidCode += '  Process --> End\n';
    }

    mermaidCode += '  End([End])\n';

    return {
      type: 'flowchart',
      title: `Flowchart: ${className}.${method.name}`,
      mermaidCode,
      description: `Flowchart for method ${className}.${method.name} in ${filePath} (Complexity: ${method.complexity})`,
    };
  }

  /**
   * Generate sequence diagram for function calls
   */
  generateSequenceDiagram(
    analysisResults: AnalysisResult[],
    entryPoint: string
  ): DiagramInfo | null {
    // Find the entry point function
    let entryFunction: FunctionInfo | null = null;
    let entryFile: string | null = null;

    for (const result of analysisResults) {
      const func = result.functions.find(f => f.name === entryPoint);
      if (func) {
        entryFunction = func;
        entryFile = result.filePath;
        break;
      }
    }

    if (!entryFunction || !entryFile) return null;

    let mermaidCode = 'sequenceDiagram\n';
    mermaidCode += '  participant User\n';
    mermaidCode += `  participant ${entryPoint}\n`;
    mermaidCode += `  User->>+${entryPoint}: call\n`;

    // Add parameters
    if (entryFunction.params.length > 0) {
      const params = entryFunction.params.map(p => p.name).join(', ');
      mermaidCode += `  Note right of ${entryPoint}: Parameters: ${params}\n`;
    }

    // Add async indicator
    if (entryFunction.isAsync) {
      mermaidCode += `  ${entryPoint}-->>User: Promise\n`;
    }

    mermaidCode += `  ${entryPoint}-->>-User: return\n`;

    return {
      type: 'sequence',
      title: `Sequence Diagram: ${entryPoint}`,
      mermaidCode,
      description: `Sequence diagram showing the execution flow of ${entryPoint}`,
    };
  }

  /**
   * Get visibility symbol for Mermaid
   */
  private getVisibilitySymbol(visibility?: 'public' | 'private' | 'protected'): string {
    switch (visibility) {
      case 'private':
        return '-';
      case 'protected':
        return '#';
      case 'public':
      default:
        return '+';
    }
  }

  /**
   * Resolve dependency path (simplified)
   */
  private resolveDependencyPath(currentFile: string, dependency: string): string {
    // This is a simplified version - in production, you'd want proper path resolution
    const currentDir = currentFile.split('/').slice(0, -1).join('/');
    
    if (dependency.startsWith('./')) {
      return `${currentDir}/${dependency.slice(2)}`;
    } else if (dependency.startsWith('../')) {
      const parts = currentDir.split('/');
      const upLevels = dependency.match(/\.\.\//g)?.length || 0;
      const newDir = parts.slice(0, -upLevels).join('/');
      const file = dependency.replace(/\.\.\//g, '');
      return `${newDir}/${file}`;
    }
    
    return dependency;
  }
}

export default MermaidDiagramGenerator;