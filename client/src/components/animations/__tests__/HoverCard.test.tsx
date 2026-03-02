import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HoverCard } from '../HoverCard';

describe('HoverCard', () => {
  it('should render children', () => {
    render(
      <HoverCard>
        <div>Card Content</div>
      </HoverCard>
    );
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <HoverCard className="custom-card">
        <div data-testid="content">Test</div>
      </HoverCard>
    );
    const content = screen.getByTestId('content').parentElement;
    expect(content).toHaveClass('custom-card');
  });

  it('should apply default shadow intensity (md)', () => {
    render(
      <HoverCard>
        <div data-testid="content">Test</div>
      </HoverCard>
    );
    const content = screen.getByTestId('content').parentElement;
    expect(content).toHaveClass('hover:shadow-md');
  });

  it('should apply small shadow intensity', () => {
    render(
      <HoverCard shadowIntensity="sm">
        <div data-testid="content">Test</div>
      </HoverCard>
    );
    const content = screen.getByTestId('content').parentElement;
    expect(content).toHaveClass('hover:shadow-sm');
  });

  it('should apply large shadow intensity', () => {
    render(
      <HoverCard shadowIntensity="lg">
        <div data-testid="content">Test</div>
      </HoverCard>
    );
    const content = screen.getByTestId('content').parentElement;
    expect(content).toHaveClass('hover:shadow-lg');
  });

  it('should apply extra large shadow intensity', () => {
    render(
      <HoverCard shadowIntensity="xl">
        <div data-testid="content">Test</div>
      </HoverCard>
    );
    const content = screen.getByTestId('content').parentElement;
    expect(content).toHaveClass('hover:shadow-xl');
  });

  it('should accept scale prop', () => {
    const { container } = render(
      <HoverCard scale={1.05}>
        <div>Test</div>
      </HoverCard>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should accept lift prop', () => {
    const { container } = render(
      <HoverCard lift={-8}>
        <div>Test</div>
      </HoverCard>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should have transition classes', () => {
    render(
      <HoverCard>
        <div data-testid="content">Test</div>
      </HoverCard>
    );
    const content = screen.getByTestId('content').parentElement;
    expect(content).toHaveClass('transition-shadow', 'duration-200');
  });

  it('should handle complex children', () => {
    render(
      <HoverCard>
        <div>
          <h2>Title</h2>
          <p>Description</p>
        </div>
      </HoverCard>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });
});