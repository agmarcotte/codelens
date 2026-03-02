import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FadeIn } from '../FadeIn';

describe('FadeIn', () => {
  it('should render children', () => {
    render(
      <FadeIn>
        <div>Test Content</div>
      </FadeIn>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <FadeIn className="custom-class">
        <div data-testid="content">Test</div>
      </FadeIn>
    );
    const content = screen.getByTestId('content').parentElement;
    expect(content).toHaveClass('custom-class');
  });

  it('should render with default direction (up)', () => {
    const { container } = render(
      <FadeIn>
        <div>Test</div>
      </FadeIn>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render with down direction', () => {
    const { container } = render(
      <FadeIn direction="down">
        <div>Test</div>
      </FadeIn>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render with left direction', () => {
    const { container } = render(
      <FadeIn direction="left">
        <div>Test</div>
      </FadeIn>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render with right direction', () => {
    const { container } = render(
      <FadeIn direction="right">
        <div>Test</div>
      </FadeIn>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render with no direction', () => {
    const { container } = render(
      <FadeIn direction="none">
        <div>Test</div>
      </FadeIn>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should accept delay prop', () => {
    const { container } = render(
      <FadeIn delay={0.5}>
        <div>Test</div>
      </FadeIn>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should accept duration prop', () => {
    const { container } = render(
      <FadeIn duration={1.0}>
        <div>Test</div>
      </FadeIn>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle multiple children', () => {
    render(
      <FadeIn>
        <div>Child 1</div>
        <div>Child 2</div>
      </FadeIn>
    );
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });
});