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
  });

  it('renders correct number of items', () => {
    const mockItems = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }];
    render(
      <ItemList 
        loading={false} 
        items={mockItems} 
        renderItem={(item) => <div key={item.id}>{item.name}</div>} 
      />
    );
    expect(screen.getByTestId('item-grid').children.length).toBe(2);
  });

  it('provides the correct index to renderItem', () => {
    const mockItems = [{ id: 1, name: 'Item A' }];
    const renderItem = vi.fn((item, index) => <div key={item.id}>{item.name} - {index}</div>);
    
    render(
      <ItemList 
        loading={false} 
        items={mockItems} 
        renderItem={renderItem} 
      />
    );
    
    expect(renderItem).toHaveBeenCalledWith(mockItems[0], 0);
    expect(screen.getByText('Item A - 0')).toBeInTheDocument();
  });

  it('renders custom empty message correctly', () => {
    render(<ItemList loading={false} items={[]} renderItem={() => null} emptyMessage="No results found" />);
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });
});