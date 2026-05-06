import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ItemCard } from '../ItemCard';
import { Droplets } from 'lucide-react';

describe('ItemCard Component', () => {
  it('renders title and description correctly', () => {
    render(
      <ItemCard 
        title="Test Title" 
        description="Test Description" 
        icon={Droplets}
      />
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders badge when provided', () => {
    render(
      <ItemCard 
        title="Test Title" 
        description="Test Description" 
        badge="New"
      />
    );
    
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(
      <ItemCard 
        title="Test Title" 
        description="Test Description" 
        onClick={handleClick}
      />
    );
    
    // Clicking the title should bubble up to the container's onClick
    fireEvent.click(screen.getByText('Test Title'));
    expect(handleClick).toHaveBeenCalled();
  });
});