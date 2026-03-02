/**
 * Unit tests for MarkdownBuilder service
 */

import { jest } from '@jest/globals';
import { MarkdownBuilder } from '../MarkdownBuilder';
import type { Documentation } from '../../../shared/types.js';

// Mock logger
jest.mock('@utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

describe('MarkdownBuilder', () => {
  let builder: MarkdownBuilder;

  beforeEach(() => {
    builder = new MarkdownBuilder();
  });

  describe('buildMarkdown', () => {
    it('should build complete markdown documentation', () => {
      const documentation: Documentation = {
        title: 'Test Documentation',
        description: 'This is a test documentation',
        metadata: {
          generatedAt: new Date('2024-01-01T00:00:00Z').getTime(),
          version: '1.0.0',
          projectName: 'TestProject',
        },
        sections: [
          {
            id: 'functions',
            title: 'Functions',
            content: 'Function documentation',
          },
          {
            id: 'classes',
            title: 'Classes',
            content: 'Class documentation',
          },
        ],
        diagrams: [
          {
            type: 'class',
            title: 'Class Diagram',
            mermaidCode: 'classDiagram\n  class User',
          },
        ],
        examples: [
          {
            title: 'Basic Usage',
            description: 'How to use the library',
            code: 'const x = 1;',
            language: 'typescript',
          },
        ],
      };

      const markdown = builder.buildMarkdown(documentation);

      expect(markdown).toContain('# Test Documentation');
      expect(markdown).toContain('This is a test documentation');
      expect(markdown).toContain('## Functions');
      expect(markdown).toContain('## Classes');
      expect(markdown).toContain('## Diagrams');
      expect(markdown).toContain('## Examples');
    });

    it('should handle documentation without description', () => {
      const documentation: Documentation = {
        title: 'Test',
        description: '',
        metadata: {
          generatedAt: Date.now(),
          version: '1.0.0',
          projectName: 'TestProject',
        },
        sections: [],
        diagrams: [],
        examples: [],
      };

      const markdown = builder.buildMarkdown(documentation);

      expect(markdown).toContain('# Test');
      expect(markdown).toContain('**Documentation Metadata**');
    });

    it('should handle documentation without diagrams', () => {
      const documentation: Documentation = {
        title: 'Test',
        description: 'Test description',
        metadata: {
          generatedAt: Date.now(),
          version: '1.0.0',
          projectName: 'TestProject',
        },
        sections: [],
        diagrams: [],
        examples: [],
      };

      const markdown = builder.buildMarkdown(documentation);

      expect(markdown).not.toContain('## Diagrams');
    });

    it('should handle documentation without examples', () => {
      const documentation: Documentation = {
        title: 'Test',
        description: 'Test description',
        metadata: {
          generatedAt: Date.now(),
          version: '1.0.0',
          projectName: 'TestProject',
        },
        sections: [],
        diagrams: [],
        examples: [],
      };

      const markdown = builder.buildMarkdown(documentation);

      expect(markdown).not.toContain('## Examples');
    });

    it('should include table of contents', () => {
      const documentation: Documentation = {
        title: 'Test',
        description: 'Test description',
        metadata: {
          generatedAt: Date.now(),
          version: '1.0.0',
          projectName: 'TestProject',
        },
        sections: [
          {
            id: 'section1',
            title: 'Section 1',
            content: 'Content 1',
          },
          {
            id: 'section2',
            title: 'Section 2',
            content: 'Content 2',
          },
        ],
        diagrams: [],
        examples: [],
      };

      const markdown = builder.buildMarkdown(documentation);

      expect(markdown).toContain('## Table of Contents');
      expect(markdown).toContain('- [Section 1](#section-1)');
      expect(markdown).toContain('- [Section 2](#section-2)');
    });

    it('should format code examples correctly', () => {
      const documentation: Documentation = {
        title: 'Test',
        description: 'Test description',
        metadata: {
          generatedAt: Date.now(),
          version: '1.0.0',
          projectName: 'TestProject',
        },
        sections: [],
        diagrams: [],
        examples: [
          {
            title: 'Example 1',
            description: 'Example description',
            code: 'const x = 1;\nconst y = 2;',
            language: 'typescript',
          },
        ],
      };

      const markdown = builder.buildMarkdown(documentation);

      expect(markdown).toContain('```typescript');
      expect(markdown).toContain('const x = 1;');
      expect(markdown).toContain('const y = 2;');
      expect(markdown).toContain('```');
    });

    it('should format diagrams correctly', () => {
      const documentation: Documentation = {
        title: 'Test',
        description: 'Test description',
        metadata: {
          generatedAt: Date.now(),
          version: '1.0.0',
          projectName: 'TestProject',
        },
        sections: [],
        diagrams: [
          {
            type: 'class',
            title: 'Class Diagram',
            mermaidCode: 'classDiagram\n  class User\n  class Admin',
          },
        ],
        examples: [],
      };

      const markdown = builder.buildMarkdown(documentation);

      expect(markdown).toContain('### Class Diagram');
      expect(markdown).toContain('```mermaid');
      expect(markdown).toContain('classDiagram');
      expect(markdown).toContain('class User');
      expect(markdown).toContain('```');
    });

    it('should include metadata information', () => {
      const documentation: Documentation = {
        title: 'Test',
        description: 'Test description',
        metadata: {
          generatedAt: new Date('2024-01-01T12:00:00Z').getTime(),
          version: '2.0.0',
          projectName: 'MyProject',
          author: 'John Doe',
          license: 'MIT',
        },
        sections: [],
        diagrams: [],
        examples: [],
      };

      const markdown = builder.buildMarkdown(documentation);

      expect(markdown).toContain('**Documentation Metadata**');
      expect(markdown).toContain('**Version**: 2.0.0');
      expect(markdown).toContain('**Project**: MyProject');
    });

    it('should handle sections with subsections', () => {
      const documentation: Documentation = {
        title: 'Test',
        description: 'Test description',
        metadata: {
          generatedAt: Date.now(),
          version: '1.0.0',
          projectName: 'TestProject',
        },
        sections: [
          {
            id: 'main',
            title: 'Main Section',
            content: 'Main content',
            subsections: [
              {
                id: 'sub1',
                title: 'Subsection 1',
                content: 'Subsection content 1',
              },
              {
                id: 'sub2',
                title: 'Subsection 2',
                content: 'Subsection content 2',
              },
            ],
          },
        ],
        diagrams: [],
        examples: [],
      };

      const markdown = builder.buildMarkdown(documentation);

      expect(markdown).toContain('## Main Section');
      expect(markdown).toContain('### Subsection 1');
      expect(markdown).toContain('### Subsection 2');
    });
  });
});