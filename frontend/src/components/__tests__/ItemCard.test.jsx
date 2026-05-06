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
    
    fireEvent.click(screen.getByText('Test Title'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('renders subtitle correctly', () => {
    render(
      <ItemCard 
        title="Test Title" 
        subtitle="Test Subtitle" 
        description="Test Description" 
      />
    );
    
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders badge when provided', () => {
    render(
      <ItemCard 
        title="Budi Santoso" 
        description="Darah O+" 
        badge="Aktif" 
      />
    );
    expect(screen.getByText('Aktif')).toBeInTheDocument();
  });

  it('uses custom badge color when provided', () => {
    render(
      <ItemCard 
        title="Budi Santoso" 
        description="Darah O+" 
        badge="Langka" 
        badgeColor="bg-purple-600"
      />
    );
    const badge = screen.getByText('Langka');
    expect(badge).toHaveClass('bg-purple-600');
  });
});