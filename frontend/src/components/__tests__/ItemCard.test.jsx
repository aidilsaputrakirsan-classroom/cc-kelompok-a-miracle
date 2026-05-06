// import { render, screen, fireEvent } from '@testing-library/react'
// import { describe, it, expect, vi } from 'vitest'
// import ItemCard from '../ItemCard'

// const mockItem = {
//   id: 1,
//   name: 'Laptop',
//   description: 'Laptop untuk cloud computing',
//   price: 15000000,
//   quantity: 5,
// }

// describe('ItemCard Component', () => {
//   it('menampilkan nama dan harga item', () => {
//     render(
//       <ItemCard
//         item={mockItem}
//         onEdit={() => {}}
//         onDelete={() => {}}
//       />
//     )
//     expect(screen.getByText('Laptop')).toBeInTheDocument()
//     expect(screen.getByText(/15/)).toBeInTheDocument()
//   })

//   it('memanggil onEdit saat tombol edit diklik', () => {
//     const handleEdit = vi.fn()
//     render(
//       <ItemCard
//         item={mockItem}
//         onEdit={handleEdit}
//         onDelete={() => {}}
//       />
//     )
//     // Sesuaikan selector dengan teks tombol edit di komponen Anda
//     const editButton = screen.getByText(/edit/i)
//     fireEvent.click(editButton)
//     expect(handleEdit).toHaveBeenCalledWith(mockItem)
//   })

//   it('memanggil onDelete saat tombol hapus diklik', () => {
//     const handleDelete = vi.fn()
//     render(
//       <ItemCard
//         item={mockItem}
//         onEdit={() => {}}
//         onDelete={handleDelete}
//       />
//     )
//     const deleteButton = screen.getByText(/hapus|delete/i)
//     fireEvent.click(deleteButton)
//     expect(handleDelete).toHaveBeenCalledWith(mockItem.id)
//   })
// })

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