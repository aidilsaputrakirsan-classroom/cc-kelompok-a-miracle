import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SearchBar } from '../SearchBar';

describe('SearchBar Component', () => {
  it('updates value when typing', () => {
    const handleChange = vi.fn();
    render(<SearchBar value="" onChange={handleChange} onClear={() => {}} />);
    
    const input = screen.getByLabelText('search-input');
    fireEvent.change(input, { target: { value: 'test query' } });
    
    expect(handleChange).toHaveBeenCalledWith('test query');
  });

  it('calls onClear when clear button is clicked', () => {
    const handleClear = vi.fn();
    render(<SearchBar value="some text" onChange={() => {}} onClear={handleClear} />);
    
    const clearButton = screen.getByLabelText('clear-search');
    fireEvent.click(clearButton);
    
    expect(handleClear).toHaveBeenCalled();
  });
});