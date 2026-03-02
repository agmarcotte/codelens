/**
 * Tests for TypeScriptAnalyzer
 */

import { TypeScriptAnalyzer } from '../analyzers/TypeScriptAnalyzer';

describe('TypeScriptAnalyzer', () => {
  let analyzer: TypeScriptAnalyzer;

  beforeEach(() => {
    analyzer = new TypeScriptAnalyzer({
      includePrivate: true,
      includeTests: false,
    });
  });

  describe('getSupportedExtensions', () => {
    it('should return supported file extensions', () => {
      const extensions = analyzer.getSupportedExtensions();
      expect(extensions).toContain('.ts');
      expect(extensions).toContain('.tsx');
      expect(extensions).toContain('.js');
      expect(extensions).toContain('.jsx');
    });
  });

  describe('analyzeFile', () => {
    it('should analyze a simple function', async () => {
      const code = `
        /**
         * Add two numbers
         */
        function add(a: number, b: number): number {
          return a + b;
        }
      `;

      const result = await analyzer.analyzeFile('test.ts', code);

      expect(result.filePath).toBe('test.ts');
      expect(result.language).toBe('typescript');
      expect(result.functions).toHaveLength(1);
      expect(result.functions[0].name).toBe('add');
      expect(result.functions[0].params).toHaveLength(2);
      expect(result.functions[0].returnType).toBe('number');
      expect(result.functions[0].documentation).toContain('Add two numbers');
    });

    it('should analyze a class with methods', async () => {
      const code = `
        /**
         * Calculator class
         */
        export class Calculator {
          private result: number = 0;

          /**
           * Add a number
           */
          add(value: number): void {
            this.result += value;
          }

          /**
           * Get the result
           */
          getResult(): number {
            return this.result;
          }
        }
      `;

      const result = await analyzer.analyzeFile('test.ts', code);

      expect(result.classes).toHaveLength(1);
      expect(result.classes[0].name).toBe('Calculator');
      expect(result.classes[0].isExported).toBe(true);
      expect(result.classes[0].methods).toHaveLength(2);
      expect(result.classes[0].properties).toHaveLength(1);
      expect(result.classes[0].properties[0].name).toBe('result');
      expect(result.classes[0].properties[0].visibility).toBe('private');
    });

    it('should analyze interfaces', async () => {
      const code = `
        /**
         * User interface
         */
        export interface User {
          id: number;
          name: string;
          email?: string;
          readonly createdAt: Date;
        }
      `;

      const result = await analyzer.analyzeFile('test.ts', code);

      expect(result.interfaces).toHaveLength(1);
      expect(result.interfaces[0].name).toBe('User');
      expect(result.interfaces[0].isExported).toBe(true);
      expect(result.interfaces[0].properties).toHaveLength(4);
      
      const emailProp = result.interfaces[0].properties.find(p => p.name === 'email');
      expect(emailProp?.isOptional).toBe(true);
      
      const createdAtProp = result.interfaces[0].properties.find(p => p.name === 'createdAt');
      expect(createdAtProp?.isReadonly).toBe(true);
    });

    it('should track imports and exports', async () => {
      const code = `
        import { useState } from 'react';
        import axios from 'axios';

        export function useData() {
          const [data, setData] = useState(null);
          return { data, setData };
        }

        export default useData;
      `;

      const result = await analyzer.analyzeFile('test.ts', code);

      expect(result.imports).toHaveLength(2);
      expect(result.imports[0].source).toBe('react');
      expect(result.imports[1].source).toBe('axios');
      expect(result.imports[1].isDefault).toBe(true);

      expect(result.exports.length).toBeGreaterThan(0);
      const defaultExport = result.exports.find(e => e.isDefault);
      expect(defaultExport).toBeDefined();
    });

    it('should calculate complexity metrics', async () => {
      const code = `
        function complexFunction(x: number): number {
          if (x > 10) {
            for (let i = 0; i < x; i++) {
              if (i % 2 === 0) {
                x += i;
              } else {
                x -= i;
              }
            }
          } else if (x < 0) {
            x = Math.abs(x);
          }
          return x;
        }
      `;

      const result = await analyzer.analyzeFile('test.ts', code);

      expect(result.complexity.cyclomatic).toBeGreaterThan(1);
      expect(result.complexity.cognitive).toBeGreaterThan(0);
      expect(result.complexity.linesOfCode).toBeGreaterThan(0);
      expect(result.complexity.maintainabilityIndex).toBeGreaterThan(0);
      expect(result.complexity.maintainabilityIndex).toBeLessThanOrEqual(100);
    });

    it('should handle async functions', async () => {
      const code = `
        async function fetchData(url: string): Promise<any> {
          const response = await fetch(url);
          return response.json();
        }
      `;

      const result = await analyzer.analyzeFile('test.ts', code);

      expect(result.functions).toHaveLength(1);
      expect(result.functions[0].isAsync).toBe(true);
      expect(result.functions[0].returnType).toBe('Promise');
    });

    it('should handle arrow functions', async () => {
      const code = `
        const multiply = (a: number, b: number): number => a * b;
        
        export const divide = (a: number, b: number): number => {
          if (b === 0) throw new Error('Division by zero');
          return a / b;
        };
      `;

      const result = await analyzer.analyzeFile('test.ts', code);

      expect(result.functions).toHaveLength(2);
      expect(result.functions[0].name).toBe('multiply');
      expect(result.functions[1].name).toBe('divide');
      expect(result.functions[1].isExported).toBe(true);
    });
  });

  describe('getLanguage', () => {
    it('should return typescript as the language', () => {
      expect(analyzer.getLanguage()).toBe('typescript');
    });
  });
});