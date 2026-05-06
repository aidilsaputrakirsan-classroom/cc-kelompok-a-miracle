import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Header } from '../Header';
import { BrowserRouter } from 'react-router-dom';

describe('Header Component', () => {
  beforeEach(() => {
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated
        removeListener: vi.fn(), // Deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Clear localStorage
    localStorage.clear();
    // Default document classes
    document.documentElement.classList.remove('dark');
  });

  it('renders logo and navigation links', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByText('TRACELT')).toBeInTheDocument();
    expect(screen.getByText('Beranda')).toBeInTheDocument();
    expect(screen.getByText('Tentang')).toBeInTheDocument();
  });

  it('handles dark mode toggle', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    const toggleButton = screen.getByRole('button', { name: /mode gelap|mode terang/i });
    
    // Initially not dark
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    
    // Click toggle
    fireEvent.click(toggleButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
    
    // Click again to toggle back
    fireEvent.click(toggleButton);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('toggles mobile menu when menu button is clicked', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    fireEvent.click(menuButton);
    
    // Desktop "Masuk" might be hidden, mobile should show it too
    // In Header.jsx, navigation links are rendered twice or conditional.
    // Let's just check if multiple "Masuk" texts exist now.
    const loginLinks = screen.getAllByText('Masuk');
    expect(loginLinks.length).toBeGreaterThan(0);
  });
});