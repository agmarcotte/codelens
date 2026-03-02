/**
 * Unit tests for TypeScript analyzer
 */

import { jest } from '@jest/globals';
import { TypeScriptAnalyzer } from '../TypeScriptAnalyzer';

// Mock logger
jest.mock('@utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

describe('TypeScriptAnalyzer', () => {
  let analyzer: TypeScriptAnalyzer;

  beforeEach(() => {
    analyzer = new TypeScriptAnalyzer();
  });

  describe('getSupportedExtensions', () => {
    it('should return supported file extensions', () => {
      const extensions = analyzer.getSupportedExtensions();
      expect(extensions).toEqual(['.ts', '.tsx', '.js', '.jsx']);
    });
  });

  describe('analyzeFile', () => {
    it('should analyze a simple TypeScript file with functions', async () => {
      const content = `
        /**
         * Add two numbers
         */
        function add(a: number, b: number): number {
          return a + b;
        }

        /**
         * Subtract two numbers
         */
        const subtract = (a: number, b: number): number => {
          return a - b;
        };
      `;

      const result = await analyzer.analyzeFile('test.ts', content);

      expect(result.filePath).toBe('test.ts');
      expect(result.language).toBe('typescript');
      expect(result.functions).toHaveLength(2);
      
      const addFunc = result.functions.find((f: any) => f.name === 'add');
      expect(addFunc).toBeDefined();
      expect(addFunc?.parameters).toHaveLength(2);
      expect(addFunc?.returnType).toBe('number');
      
      const subtractFunc = result.functions.find((f: any) => f.name === 'subtract');
      expect(subtractFunc).toBeDefined();
    });

    it('should analyze a TypeScript file with classes', async () => {
      const content = `
        /**
         * A simple calculator class
         */
        class Calculator {
          private value: number = 0;

          /**
           * Add to the current value
           */
          add(n: number): void {
            this.value += n;
          }

          /**
           * Get the current value
           */
          getValue(): number {
            return this.value;
          }
        }
      `;

      const result = await analyzer.analyzeFile('test.ts', content);

      expect(result.classes).toHaveLength(1);
      
      const calcClass = result.classes[0];
      expect(calcClass.name).toBe('Calculator');
      expect(calcClass.methods).toHaveLength(2);
      expect(calcClass.properties).toHaveLength(1);
      
      const addMethod = calcClass.methods.find((m: any) => m.name === 'add');
      expect(addMethod).toBeDefined();
      expect(addMethod?.parameters).toHaveLength(1);
    });

    it('should analyze a TypeScript file with interfaces', async () => {
      const content = `
        /**
         * User interface
         */
        interface User {
          id: number;
          name: string;
          email: string;
        }

        /**
         * Admin interface
         */
        interface Admin extends User {
          role: string;
        }
      `;

      const result = await analyzer.analyzeFile('test.ts', content);

      expect(result.interfaces).toHaveLength(2);
      
      const userInterface = result.interfaces.find((i: any) => i.name === 'User');
      expect(userInterface).toBeDefined();
      expect(userInterface?.properties).toHaveLength(3);
      
      const adminInterface = result.interfaces.find((i: any) => i.name === 'Admin');
      expect(adminInterface).toBeDefined();
    });

    it('should analyze imports and exports', async () => {
      const content = `
        import { useState } from 'react';
        import axios from 'axios';
        import type { User } from './types';

        export function useUser() {
          const [user, setUser] = useState<User | null>(null);
          return { user, setUser };
        }

        export default useUser;
      `;

      const result = await analyzer.analyzeFile('test.ts', content);

      expect(result.imports).toHaveLength(3);
      expect(result.exports).toHaveLength(2);
      expect(result.dependencies).toContain('react');
      expect(result.dependencies).toContain('axios');
      expect(result.dependencies).toContain('./types');
    });

    it('should handle JSX/TSX files', async () => {
      const content = `
        import React from 'react';

        interface Props {
          title: string;
          count: number;
        }

        /**
         * A simple counter component
         */
        export function Counter({ title, count }: Props) {
          return (
            <div>
              <h1>{title}</h1>
              <p>Count: {count}</p>
            </div>
          );
        }
      `;

      const result = await analyzer.analyzeFile('test.tsx', content);

      expect(result.functions).toHaveLength(1);
      expect(result.interfaces).toHaveLength(1);
      
      const counterFunc = result.functions[0];
      expect(counterFunc.name).toBe('Counter');
      expect(counterFunc.parameters).toHaveLength(1);
    });

    it('should extract JSDoc comments', async () => {
      const content = `
        /**
         * Calculate the sum of an array
         * @param numbers - Array of numbers to sum
         * @returns The sum of all numbers
         * @example
         * sum([1, 2, 3]) // returns 6
         */
        function sum(numbers: number[]): number {
          return numbers.reduce((a, b) => a + b, 0);
        }
      `;

      const result = await analyzer.analyzeFile('test.ts', content);

      const sumFunc = result.functions[0];
      expect(sumFunc.name).toBe('sum');
      expect(sumFunc.description).toContain('Calculate the sum');
      expect(sumFunc.examples).toBeDefined();
    });

    it('should handle async functions', async () => {
      const content = `
        /**
         * Fetch user data
         */
        async function fetchUser(id: number): Promise<User> {
          const response = await fetch(\`/api/users/\${id}\`);
          return response.json();
        }

        /**
         * Fetch all users
         */
        const fetchAllUsers = async (): Promise<User[]> => {
          const response = await fetch('/api/users');
          return response.json();
        };
      `;

      const result = await analyzer.analyzeFile('test.ts', content);

      expect(result.functions).toHaveLength(2);
      
      const fetchUserFunc = result.functions.find((f: any) => f.name === 'fetchUser');
      expect(fetchUserFunc).toBeDefined();
      expect(fetchUserFunc?.async).toBe(true);
      
      const fetchAllFunc = result.functions.find((f: any) => f.name === 'fetchAllUsers');
      expect(fetchAllFunc).toBeDefined();
      expect(fetchAllFunc?.async).toBe(true);
    });

    it('should handle generic types', async () => {
      const content = `
        /**
         * Generic identity function
         */
        function identity<T>(value: T): T {
          return value;
        }

        /**
         * Generic class
         */
        class Container<T> {
          private value: T;

          constructor(value: T) {
            this.value = value;
          }

          getValue(): T {
            return this.value;
          }
        }
      `;

      const result = await analyzer.analyzeFile('test.ts', content);

      expect(result.functions).toHaveLength(1);
      expect(result.classes).toHaveLength(1);
      
      const identityFunc = result.functions[0];
      expect(identityFunc.name).toBe('identity');
      
      const containerClass = result.classes[0];
      expect(containerClass.name).toBe('Container');
    });

    it('should throw error for unsupported file', async () => {
      await expect(
        analyzer.analyzeFile('test.py', 'print("hello")')
      ).rejects.toThrow('should not be analyzed');
    });

    it('should handle syntax errors gracefully', async () => {
      const content = `
        function broken( {
          // Missing closing brace
      `;

      await expect(
        analyzer.analyzeFile('test.ts', content)
      ).rejects.toThrow();
    });
  });

});