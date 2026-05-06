import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ItemList } from '../ItemList';

describe('ItemList Component', () => {
  it('renders loading state', () => {
    render(<ItemList loading={true} items={[]} renderItem={() => null} />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders empty message when no items', () => {
    render(<ItemList loading={false} items={[]} renderItem={() => null} emptyMessage="Empty test message" />);
    expect(screen.getByText('Empty test message')).toBeInTheDocument();
  });

  it('renders items correctly', () => {
    const mockItems = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }];
    render(
      <ItemList 
        loading={false} 
        items={mockItems} 
        renderItem={(item) => <div key={item.id}>{item.name}</div>} 
      />
    );
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByTestId('item-grid')).toBeInTheDocument();
  });
});