/**
 * Smooth scroll utility component
 */

import { useEffect } from 'react';

interface SmoothScrollProps {
  behavior?: ScrollBehavior;
  offset?: number;
}

/**
 * Hook to enable smooth scrolling for anchor links
 */
export function useSmoothScroll({ behavior = 'smooth', offset = 80 }: SmoothScrollProps = {}) {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      
      if (!anchor) return;
      
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      
      e.preventDefault();
      
      const targetId = href.slice(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior,
        });
        
        // Update URL without triggering navigation
        window.history.pushState(null, '', href);
      }
    };
    
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [behavior, offset]);
}

/**
 * Scroll to top utility function
 */
export function scrollToTop(behavior: ScrollBehavior = 'smooth') {
  window.scrollTo({
    top: 0,
    behavior,
  });
}

/**
 * Scroll to element utility function
 */
export function scrollToElement(
  elementId: string,
  behavior: ScrollBehavior = 'smooth',
  offset: number = 80
) {
  const element = document.getElementById(elementId);
  
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior,
    });
  }
}

/**
 * Component wrapper for smooth scroll functionality
 */
export function SmoothScroll({ behavior = 'smooth', offset = 80 }: SmoothScrollProps) {
  useSmoothScroll({ behavior, offset });
  return null;
}

export default SmoothScroll;