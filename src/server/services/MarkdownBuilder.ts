/**
 * Markdown builder service
 * Converts documentation objects to formatted markdown
 */

import type {
  Documentation,
  DocumentationSection,
  DiagramInfo,
  CodeExample,
} from '@shared/types';
import logger from '@utils/logger.js';

export class MarkdownBuilder {
  /**
   * Build complete markdown documentation
   */
  buildMarkdown(documentation: Documentation): string {
    logger.info(`Building markdown for: ${documentation.title}`);

    let markdown = '';

    // Add title
    markdown += this.buildTitle(documentation.title);
    markdown += '\n\n';

    // Add description
    if (documentation.description) {
      markdown += documentation.description;
      markdown += '\n\n';
    }

    // Add metadata
    markdown += this.buildMetadata(documentation);
    markdown += '\n\n';

    // Add table of contents
    markdown += this.buildTableOfContents(documentation.sections);
    markdown += '\n\n';

    // Add sections
    for (const section of documentation.sections) {
      markdown += this.buildSection(section);
      markdown += '\n\n';
    }

    // Add diagrams section
    if (documentation.diagrams.length > 0) {
      markdown += this.buildDiagramsSection(documentation.diagrams);
      markdown += '\n\n';
    }

    // Add examples section
    if (documentation.examples.length > 0) {
      markdown += this.buildExamplesSection(documentation.examples);
      markdown += '\n\n';
    }

    return markdown.trim();
  }

  /**
   * Build title with proper heading level
   */
  private buildTitle(title: string, level: number = 1): string {
    const hashes = '#'.repeat(level);
    return `${hashes} ${title}`;
  }

  /**
   * Build metadata section
   */
  private buildMetadata(documentation: Documentation): string {
    const { metadata } = documentation;
    const date = new Date(metadata.generatedAt).toLocaleString();

    let markdown = '---\n\n';
    markdown += '**Documentation Metadata**\n\n';
    markdown += `- **Generated**: ${date}\n`;
    markdown += `- **Version**: ${metadata.version}\n`;
    markdown += `- **Project**: ${metadata.projectName}\n`;

    if (metadata.author) {
      markdown += `- **Author**: ${metadata.author}\n`;
    }

    if (metadata.license) {
      markdown += `- **License**: ${metadata.license}\n`;
    }

    markdown += '\n---';

    return markdown;
  }

  /**
   * Build table of contents
   */
  private buildTableOfContents(sections: DocumentationSection[]): string {
    let toc = '## Table of Contents\n\n';

    for (const section of sections) {
      const anchor = this.createAnchor(section.title);
      toc += `- [${section.title}](#${anchor})\n`;

      if (section.subsections) {
        for (const subsection of section.subsections) {
          const subAnchor = this.createAnchor(subsection.title);
          toc += `  - [${subsection.title}](#${subAnchor})\n`;
        }
      }
    }

    return toc;
  }

  /**
   * Build a documentation section
   */
  private buildSection(section: DocumentationSection, level: number = 2): string {
    let markdown = '';

    // Add section title
    markdown += this.buildTitle(section.title, level);
    markdown += '\n\n';

    // Add section content
    if (section.content) {
      markdown += section.content;
      markdown += '\n\n';
    }

    // Add code blocks
    if (section.codeBlocks && section.codeBlocks.length > 0) {
      for (const codeBlock of section.codeBlocks) {
        markdown += this.buildCodeBlock(
          codeBlock.code,
          codeBlock.language,
          codeBlock.fileName
        );
        markdown += '\n\n';
      }
    }

    // Add subsections
    if (section.subsections && section.subsections.length > 0) {
      for (const subsection of section.subsections) {
        markdown += this.buildSection(subsection, level + 1);
      }
    }

    return markdown;
  }

  /**
   * Build diagrams section
   */
  private buildDiagramsSection(diagrams: DiagramInfo[]): string {
    let markdown = '## Diagrams\n\n';

    for (const diagram of diagrams) {
      markdown += `### ${diagram.title}\n\n`;

      if (diagram.description) {
        markdown += `${diagram.description}\n\n`;
      }

      markdown += '```mermaid\n';
      markdown += diagram.mermaidCode;
      markdown += '\n```\n\n';
    }

    return markdown;
  }

  /**
   * Build examples section
   */
  private buildExamplesSection(examples: CodeExample[]): string {
    let markdown = '## Code Examples\n\n';

    for (const example of examples) {
      markdown += `### ${example.title}\n\n`;

      if (example.description) {
        markdown += `${example.description}\n\n`;
      }

      markdown += this.buildCodeBlock(example.code, example.language);
      markdown += '\n';

      if (example.output) {
        markdown += '**Output:**\n\n';
        markdown += '```\n';
        markdown += example.output;
        markdown += '\n```\n';
      }

      markdown += '\n';
    }

    return markdown;
  }

  /**
   * Build a code block
   */
  private buildCodeBlock(
    code: string,
    language: string = '',
    fileName?: string
  ): string {
    let markdown = '';

    if (fileName) {
      markdown += `**${fileName}**\n\n`;
    }

    markdown += '```' + language + '\n';
    markdown += code;
    markdown += '\n```';

    return markdown;
  }

  /**
   * Create anchor link from title
   */
  private createAnchor(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  /**
   * Build a list
   */
  buildList(items: string[], ordered: boolean = false): string {
    return items
      .map((item, index) => {
        const prefix = ordered ? `${index + 1}.` : '-';
        return `${prefix} ${item}`;
      })
      .join('\n');
  }

  /**
   * Build a table
   */
  buildTable(headers: string[], rows: string[][]): string {
    let markdown = '';

    // Add headers
    markdown += '| ' + headers.join(' | ') + ' |\n';

    // Add separator
    markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n';

    // Add rows
    for (const row of rows) {
      markdown += '| ' + row.join(' | ') + ' |\n';
    }

    return markdown;
  }

  /**
   * Build a blockquote
   */
  buildBlockquote(text: string): string {
    return text
      .split('\n')
      .map(line => `> ${line}`)
      .join('\n');
  }

  /**
   * Build a horizontal rule
   */
  buildHorizontalRule(): string {
    return '---';
  }

  /**
   * Build an inline code snippet
   */
  buildInlineCode(code: string): string {
    return `\`${code}\``;
  }

  /**
   * Build a link
   */
  buildLink(text: string, url: string, title?: string): string {
    if (title) {
      return `[${text}](${url} "${title}")`;
    }
    return `[${text}](${url})`;
  }

  /**
   * Build an image
   */
  buildImage(altText: string, url: string, title?: string): string {
    if (title) {
      return `![${altText}](${url} "${title}")`;
    }
    return `![${altText}](${url})`;
  }

  /**
   * Build bold text
   */
  buildBold(text: string): string {
    return `**${text}**`;
  }

  /**
   * Build italic text
   */
  buildItalic(text: string): string {
    return `*${text}*`;
  }

  /**
   * Build strikethrough text
   */
  buildStrikethrough(text: string): string {
    return `~~${text}~~`;
  }

  /**
   * Build a task list
   */
  buildTaskList(tasks: Array<{ text: string; completed: boolean }>): string {
    return tasks
      .map(task => {
        const checkbox = task.completed ? '[x]' : '[ ]';
        return `- ${checkbox} ${task.text}`;
      })
      .join('\n');
  }

  /**
   * Build a collapsible section (details/summary)
   */
  buildCollapsible(summary: string, content: string): string {
    return `<details>\n<summary>${summary}</summary>\n\n${content}\n\n</details>`;
  }

  /**
   * Build a badge
   */
  buildBadge(label: string, message: string, color: string = 'blue'): string {
    const encodedLabel = encodeURIComponent(label);
    const encodedMessage = encodeURIComponent(message);
    return `![${label}](https://img.shields.io/badge/${encodedLabel}-${encodedMessage}-${color})`;
  }

  /**
   * Escape markdown special characters
   */
  escapeMarkdown(text: string): string {
    return text.replace(/([\\`*_{}[\]()#+\-.!])/g, '\\$1');
  }

  /**
   * Build a footnote
   */
  buildFootnote(id: string, text: string): string {
    return `[^${id}]: ${text}`;
  }

  /**
   * Build a footnote reference
   */
  buildFootnoteReference(id: string): string {
    return `[^${id}]`;
  }

  /**
   * Build an alert/admonition
   */
  buildAlert(type: 'note' | 'tip' | 'important' | 'warning' | 'caution', content: string): string {
    const emoji = {
      note: '📝',
      tip: '💡',
      important: '❗',
      warning: '⚠️',
      caution: '🚨',
    };

    return `> ${emoji[type]} **${type.toUpperCase()}**\n> \n> ${content.split('\n').join('\n> ')}`;
  }

  /**
   * Build a definition list
   */
  buildDefinitionList(definitions: Array<{ term: string; definition: string }>): string {
    return definitions
      .map(def => `${def.term}\n: ${def.definition}`)
      .join('\n\n');
  }

  /**
   * Convert documentation to HTML-friendly markdown
   */
  buildHtmlMarkdown(documentation: Documentation): string {
    // Similar to buildMarkdown but with HTML-safe formatting
    return this.buildMarkdown(documentation);
  }

  /**
   * Build a summary card
   */
  buildSummaryCard(title: string, items: Record<string, string | number>): string {
    let markdown = `### ${title}\n\n`;
    markdown += '<table>\n';

    for (const [key, value] of Object.entries(items)) {
      markdown += `<tr><td><strong>${key}</strong></td><td>${value}</td></tr>\n`;
    }

    markdown += '</table>\n';

    return markdown;
  }
}

export default MarkdownBuilder;