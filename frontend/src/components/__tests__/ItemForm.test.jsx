import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ItemForm } from '../ItemForm';

describe('ItemForm Component', () => {
  const fields = [
    { name: 'name', label: 'Nama', required: true },
    { name: 'email', label: 'Email', type: 'email' }
  ];

  it('menampilkan error jika field wajib kosong saat submit', () => {
    const handleSubmit = vi.fn();
    render(<ItemForm fields={fields} onSubmit={handleSubmit} />);
    
    const submitButton = screen.getByText('Simpan');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Nama wajib diisi')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('memanggil onSubmit dengan data form jika input valid', () => {
    const handleSubmit = vi.fn();
    render(<ItemForm fields={fields} onSubmit={handleSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/Nama/i), { target: { value: 'Budi Santoso' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'budi@example.com' } });
    
    fireEvent.click(screen.getByText('Simpan'));
    
    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'Budi Santoso',
      email: 'budi@example.com'
    });
  });

  it('mengisi data awal (initialData) dengan benar', () => {
    const initialData = { name: 'Siti', email: 'siti@example.com' };
    render(<ItemForm fields={fields} onSubmit={vi.fn()} initialData={initialData} />);
    
    expect(screen.getByLabelText(/Nama/i).value).toBe('Siti');
    expect(screen.getByLabelText(/Email/i).value).toBe('siti@example.com');
  });

  it('menghapus pesan error saat pengguna mulai mengetik', () => {
    render(<ItemForm fields={fields} onSubmit={vi.fn()} />);
    
    fireEvent.click(screen.getByText('Simpan'));
    expect(screen.getByText('Nama wajib diisi')).toBeInTheDocument();
    
    fireEvent.change(screen.getByLabelText(/Nama/i), { target: { value: 'A' } });
    expect(screen.queryByText('Nama wajib diisi')).not.toBeInTheDocument();
  });

  it('berhasil submit tanpa mengisi field opsional', () => {
    const handleSubmit = vi.fn();
    render(<ItemForm fields={fields} onSubmit={handleSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/Nama/i), { target: { value: 'Nama Wajib' } });
    fireEvent.click(screen.getByText('Simpan'));
    
    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'Nama Wajib'
    });
  });
});