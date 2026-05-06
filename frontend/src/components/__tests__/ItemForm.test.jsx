import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ItemForm } from '../ItemForm';

describe('ItemForm Component', () => {
  const fields = [
    { name: 'name', label: 'Nama', required: true },
    { name: 'email', label: 'Email', type: 'email' }
  ];

  it('shows error when required field is empty on submit', () => {
    const handleSubmit = vi.fn();
    render(<ItemForm fields={fields} onSubmit={handleSubmit} />);
    
    fireEvent.click(screen.getByText('Simpan'));
    
    expect(screen.getByText('Nama wajib diisi')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with form data when valid', () => {
    const handleSubmit = vi.fn();
    render(<ItemForm fields={fields} onSubmit={handleSubmit} />);
    
    // Now we can use labels properly
    fireEvent.change(screen.getByLabelText(/Nama/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
    
    fireEvent.click(screen.getByText('Simpan'));
    
    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com'
    });
  });
});