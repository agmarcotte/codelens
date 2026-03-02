/**
 * TypeScript/JavaScript analyzer using Babel parser
 */

import { parse } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { BaseAnalyzer, AnalyzerOptions } from './BaseAnalyzer.js';
import type {
  AnalysisResult,
  FunctionInfo,
  ClassInfo,
  InterfaceInfo,
  ImportInfo,
  ExportInfo,
  MethodInfo,
  PropertyInfo,
  ParameterInfo,
} from '@shared/types';
import logger from '@utils/logger.js';

export class TypeScriptAnalyzer extends BaseAnalyzer {
  constructor(options: AnalyzerOptions = {}) {
    super('typescript', options);
  }

  getSupportedExtensions(): string[] {
    return ['.ts', '.tsx', '.js', '.jsx'];
  }

  async analyzeFile(filePath: string, content: string): Promise<AnalysisResult> {
    if (!this.shouldAnalyzeFile(filePath, content)) {
      throw new Error(`File ${filePath} should not be analyzed`);
    }

    try {
      logger.info(`Analyzing TypeScript file: ${filePath}`);

      // Parse the code into AST
      const ast = parse(content, {
        sourceType: 'module',
        plugins: [
          'typescript',
          'jsx',
          'decorators-legacy',
          'classProperties',
          'objectRestSpread',
          'asyncGenerators',
          'dynamicImport',
          'optionalChaining',
          'nullishCoalescingOperator',
        ],
      });

      const functions: FunctionInfo[] = [];
      const classes: ClassInfo[] = [];
      const interfaces: InterfaceInfo[] = [];
      const imports: ImportInfo[] = [];
      const exports: ExportInfo[] = [];
      const dependencies: Set<string> = new Set();

      // Traverse the AST
      traverse(ast, {
        // Function declarations
        FunctionDeclaration: (path) => {
          const func = this.extractFunctionInfo(path, content);
          if (func) functions.push(func);
        },

        // Arrow functions and function expressions
        VariableDeclarator: (path) => {
          if (
            t.isArrowFunctionExpression(path.node.init) ||
            t.isFunctionExpression(path.node.init)
          ) {
            const func = this.extractFunctionFromVariable(path, content);
            if (func) functions.push(func);
          }
        },

        // Class declarations
        ClassDeclaration: (path) => {
          const classInfo = this.extractClassInfo(path, content);
          if (classInfo) classes.push(classInfo);
        },

        // Interface declarations
        TSInterfaceDeclaration: (path) => {
          const interfaceInfo = this.extractInterfaceInfo(path);
          if (interfaceInfo) interfaces.push(interfaceInfo);
        },

        // Import declarations
        ImportDeclaration: (path) => {
          const importInfo = this.extractImportInfo(path);
          if (importInfo) {
            imports.push(importInfo);
            dependencies.add(importInfo.source);
          }
        },

        // Export declarations
        ExportNamedDeclaration: (path) => {
          const exportInfos = this.extractExportInfo(path);
          exports.push(...exportInfos);
        },

        ExportDefaultDeclaration: (path) => {
          const exportInfo = this.extractDefaultExport(path);
          if (exportInfo) exports.push(exportInfo);
        },
      });

      // Calculate complexity metrics
      const linesOfCode = this.countLinesOfCode(content);
      const cyclomaticComplexity = this.calculateCyclomaticComplexity(content);
      const cognitiveComplexity = this.calculateCognitiveComplexity(content);
      const maintainabilityIndex = this.calculateMaintainabilityIndex(
        linesOfCode,
        cyclomaticComplexity
      );

      return {
        filePath,
        language: 'typescript',
        functions,
        classes,
        interfaces,
        imports,
        exports,
        complexity: {
          cyclomatic: cyclomaticComplexity,
          cognitive: cognitiveComplexity,
          linesOfCode,
          maintainabilityIndex,
        },
        dependencies: Array.from(dependencies),
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(`Failed to analyze ${filePath}:`, error);
      throw new Error(`Analysis failed for ${filePath}: ${(error as Error).message}`);
    }
  }

  private extractFunctionInfo(
    path: NodePath<t.FunctionDeclaration>,
    content: string
  ): FunctionInfo | null {
    const node = path.node;
    if (!node.id) return null;

    const name = node.id.name;
    const line = node.loc?.start.line || 0;
    const endLine = node.loc?.end.line || 0;
    const params = this.extractParameters(node.params);
    const returnType = this.extractReturnType(node);
    const isAsync = node.async || false;
    const isExported = this.isExported(path);

    // Extract function body for complexity calculation
    const functionCode = content.split('\n').slice(line - 1, endLine).join('\n');
    const complexity = this.calculateCyclomaticComplexity(functionCode);

    // Extract documentation
    const leadingComments = node.leadingComments?.map((c) => c.value) || [];
    const documentation = this.extractDocumentation(leadingComments);

    return {
      name,
      line,
      endLine,
      params,
      returnType,
      isAsync,
      isExported,
      complexity,
      documentation,
    };
  }

  private extractFunctionFromVariable(
    path: NodePath<t.VariableDeclarator>,
    content: string
  ): FunctionInfo | null {
    const node = path.node;
    if (!t.isIdentifier(node.id)) return null;

    const init = node.init;
    if (!init || (!t.isArrowFunctionExpression(init) && !t.isFunctionExpression(init))) {
      return null;
    }

    const name = node.id.name;
    const line = node.loc?.start.line || 0;
    const endLine = node.loc?.end.line || 0;
    const params = this.extractParameters(init.params);
    const returnType = this.extractReturnType(init);
    const isAsync = init.async || false;
    const isExported = this.isExported(path.parentPath);

    const functionCode = content.split('\n').slice(line - 1, endLine).join('\n');
    const complexity = this.calculateCyclomaticComplexity(functionCode);

    const leadingComments = node.leadingComments?.map((c) => c.value) || [];
    const documentation = this.extractDocumentation(leadingComments);

    return {
      name,
      line,
      endLine,
      params,
      returnType,
      isAsync,
      isExported,
      complexity,
      documentation,
    };
  }

  private extractClassInfo(
    path: NodePath<t.ClassDeclaration>,
    content: string
  ): ClassInfo | null {
    const node = path.node;
    if (!node.id) return null;

    const name = node.id.name;
    const line = node.loc?.start.line || 0;
    const endLine = node.loc?.end.line || 0;
    const isExported = this.isExported(path);

    const methods: MethodInfo[] = [];
    const properties: PropertyInfo[] = [];

    // Extract methods and properties
    for (const member of node.body.body) {
      if (t.isClassMethod(member)) {
        const method = this.extractMethodInfo(member, content);
        if (method) methods.push(method);
      } else if (t.isClassProperty(member)) {
        const property = this.extractPropertyInfo(member);
        if (property) properties.push(property);
      }
    }

    // Extract extends and implements
    const extendsClass = node.superClass && t.isIdentifier(node.superClass)
      ? node.superClass.name
      : undefined;

    const implementsInterfaces = node.implements?.map((impl) => {
      if (t.isTSExpressionWithTypeArguments(impl) && t.isIdentifier(impl.expression)) {
        return impl.expression.name;
      }
      return '';
    }).filter(Boolean);

    const leadingComments = node.leadingComments?.map((c) => c.value) || [];
    const documentation = this.extractDocumentation(leadingComments);

    return {
      name,
      line,
      endLine,
      methods,
      properties,
      extends: extendsClass,
      implements: implementsInterfaces,
      isExported,
      documentation,
    };
  }

  private extractMethodInfo(node: t.ClassMethod, content: string): MethodInfo | null {
    if (!t.isIdentifier(node.key)) return null;

    const name = node.key.name;
    const line = node.loc?.start.line || 0;
    const params = this.extractParameters(node.params as Array<t.Identifier | t.Pattern | t.RestElement>);
    const returnType = this.extractReturnType(node);
    const isAsync = node.async || false;
    const isStatic = node.static || false;

    // Determine visibility
    let visibility: 'public' | 'private' | 'protected' = 'public';
    if (node.accessibility) {
      visibility = node.accessibility as 'public' | 'private' | 'protected';
    }

    const methodCode = content.split('\n').slice(line - 1, node.loc?.end.line || line).join('\n');
    const complexity = this.calculateCyclomaticComplexity(methodCode);

    const leadingComments = node.leadingComments?.map((c) => c.value) || [];
    const documentation = this.extractDocumentation(leadingComments);

    return {
      name,
      line,
      params,
      returnType,
      isAsync,
      isStatic,
      visibility,
      complexity,
      documentation,
    };
  }

  private extractPropertyInfo(node: t.ClassProperty): PropertyInfo | null {
    if (!t.isIdentifier(node.key)) return null;

    const name = node.key.name;
    const line = node.loc?.start.line || 0;
    const type = node.typeAnnotation ? this.getTypeAnnotation(node.typeAnnotation) : undefined;
    const isOptional = node.optional || false;
    const isReadonly = node.readonly || false;

    let visibility: 'public' | 'private' | 'protected' | undefined;
    if (node.accessibility) {
      visibility = node.accessibility as 'public' | 'private' | 'protected';
    }

    const leadingComments = node.leadingComments?.map((c) => c.value) || [];
    const documentation = this.extractDocumentation(leadingComments);

    return {
      name,
      type,
      line,
      isOptional,
      isReadonly,
      visibility,
      documentation,
    };
  }

  private extractInterfaceInfo(
    path: NodePath<t.TSInterfaceDeclaration>
  ): InterfaceInfo | null {
    const node = path.node;
    const name = node.id.name;
    const line = node.loc?.start.line || 0;
    const endLine = node.loc?.end.line || 0;
    const isExported = this.isExported(path);

    const properties: PropertyInfo[] = [];

    for (const member of node.body.body) {
      if (t.isTSPropertySignature(member) && t.isIdentifier(member.key)) {
        const prop: PropertyInfo = {
          name: member.key.name,
          type: member.typeAnnotation ? this.getTypeAnnotation(member.typeAnnotation) : undefined,
          line: member.loc?.start.line || 0,
          isOptional: member.optional || false,
          isReadonly: member.readonly || false,
        };
        properties.push(prop);
      }
    }

    const extendsInterfaces = node.extends?.map((ext) =>
      t.isIdentifier(ext.expression) ? ext.expression.name : ''
    ).filter(Boolean);

    const leadingComments = node.leadingComments?.map((c) => c.value) || [];
    const documentation = this.extractDocumentation(leadingComments);

    return {
      name,
      line,
      endLine,
      properties,
      extends: extendsInterfaces,
      isExported,
      documentation,
    };
  }

  private extractImportInfo(path: NodePath<t.ImportDeclaration>): ImportInfo | null {
    const node = path.node;
    const source = node.source.value;
    const line = node.loc?.start.line || 0;
    const specifiers: string[] = [];
    let isDefault = false;

    for (const spec of node.specifiers) {
      if (t.isImportDefaultSpecifier(spec)) {
        specifiers.push(spec.local.name);
        isDefault = true;
      } else if (t.isImportSpecifier(spec)) {
        specifiers.push(spec.local.name);
      } else if (t.isImportNamespaceSpecifier(spec)) {
        specifiers.push(spec.local.name);
      }
    }

    return {
      source,
      specifiers,
      isDefault,
      line,
    };
  }

  private extractExportInfo(path: NodePath<t.ExportNamedDeclaration>): ExportInfo[] {
    const node = path.node;
    const exports: ExportInfo[] = [];
    const line = node.loc?.start.line || 0;

    if (node.declaration) {
      if (t.isFunctionDeclaration(node.declaration) && node.declaration.id) {
        exports.push({
          name: node.declaration.id.name,
          type: 'function',
          isDefault: false,
          line,
        });
      } else if (t.isClassDeclaration(node.declaration) && node.declaration.id) {
        exports.push({
          name: node.declaration.id.name,
          type: 'class',
          isDefault: false,
          line,
        });
      } else if (t.isTSInterfaceDeclaration(node.declaration)) {
        exports.push({
          name: node.declaration.id.name,
          type: 'interface',
          isDefault: false,
          line,
        });
      } else if (t.isVariableDeclaration(node.declaration)) {
        for (const decl of node.declaration.declarations) {
          if (t.isIdentifier(decl.id)) {
            exports.push({
              name: decl.id.name,
              type: 'variable',
              isDefault: false,
              line,
            });
          }
        }
      }
    }

    for (const spec of node.specifiers) {
      if (t.isExportSpecifier(spec)) {
        const exportedName = t.isIdentifier(spec.exported)
          ? spec.exported.name
          : spec.exported.value;
        exports.push({
          name: exportedName,
          type: 'variable',
          isDefault: false,
          line,
        });
      }
    }

    return exports;
  }

  private extractDefaultExport(path: NodePath<t.ExportDefaultDeclaration>): ExportInfo | null {
    const node = path.node;
    const line = node.loc?.start.line || 0;

    if (t.isFunctionDeclaration(node.declaration) && node.declaration.id) {
      return {
        name: node.declaration.id.name,
        type: 'function',
        isDefault: true,
        line,
      };
    } else if (t.isClassDeclaration(node.declaration) && node.declaration.id) {
      return {
        name: node.declaration.id.name,
        type: 'class',
        isDefault: true,
        line,
      };
    } else if (t.isIdentifier(node.declaration)) {
      return {
        name: node.declaration.name,
        type: 'variable',
        isDefault: true,
        line,
      };
    }

    return null;
  }

  private extractParameters(params: Array<t.Identifier | t.Pattern | t.RestElement>): ParameterInfo[] {
    return params.map((param) => {
      if (t.isIdentifier(param)) {
        return {
          name: param.name,
          type: param.typeAnnotation ? this.getTypeAnnotation(param.typeAnnotation) : undefined,
          isOptional: param.optional || false,
        };
      } else if (t.isAssignmentPattern(param) && t.isIdentifier(param.left)) {
        return {
          name: param.left.name,
          type: param.left.typeAnnotation ? this.getTypeAnnotation(param.left.typeAnnotation) : undefined,
          isOptional: true,
          defaultValue: this.getDefaultValue(param.right),
        };
      } else if (t.isRestElement(param) && t.isIdentifier(param.argument)) {
        return {
          name: `...${param.argument.name}`,
          type: param.argument.typeAnnotation ? this.getTypeAnnotation(param.argument.typeAnnotation) : undefined,
          isOptional: false,
        };
      }
      return {
        name: 'unknown',
        isOptional: false,
      };
    });
  }

  private extractReturnType(node: t.Function): string | undefined {
    if (node.returnType) {
      return this.getTypeAnnotation(node.returnType);
    }
    return undefined;
  }

  private getTypeAnnotation(typeAnnotation: t.TSTypeAnnotation | t.TypeAnnotation | t.Noop): string {
    if (t.isTSTypeAnnotation(typeAnnotation)) {
      return this.getTSType(typeAnnotation.typeAnnotation);
    } else if (t.isTypeAnnotation(typeAnnotation)) {
      return 'any'; // Flow types not fully supported
    }
    return 'any';
  }

  private getTSType(type: t.TSType): string {
    if (t.isTSStringKeyword(type)) return 'string';
    if (t.isTSNumberKeyword(type)) return 'number';
    if (t.isTSBooleanKeyword(type)) return 'boolean';
    if (t.isTSAnyKeyword(type)) return 'any';
    if (t.isTSVoidKeyword(type)) return 'void';
    if (t.isTSNullKeyword(type)) return 'null';
    if (t.isTSUndefinedKeyword(type)) return 'undefined';
    if (t.isTSTypeReference(type) && t.isIdentifier(type.typeName)) {
      return type.typeName.name;
    }
    if (t.isTSArrayType(type)) {
      return `${this.getTSType(type.elementType)}[]`;
    }
    return 'unknown';
  }

  private getDefaultValue(node: t.Expression): string {
    if (t.isStringLiteral(node)) return `"${node.value}"`;
    if (t.isNumericLiteral(node)) return node.value.toString();
    if (t.isBooleanLiteral(node)) return node.value.toString();
    if (t.isNullLiteral(node)) return 'null';
    if (t.isIdentifier(node)) return node.name;
    return 'unknown';
  }

  private isExported(path: NodePath): boolean {
    let current = path.parentPath;
    while (current) {
      if (
        t.isExportNamedDeclaration(current.node) ||
        t.isExportDefaultDeclaration(current.node)
      ) {
        return true;
      }
      current = current.parentPath;
    }
    return false;
  }
}

export default TypeScriptAnalyzer;