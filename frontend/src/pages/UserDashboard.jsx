import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  LogOut,
  User,
  ShoppingBag,
  DollarSign,
  Layers,
  Sparkles,
  ChevronRight,
  Info,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { apiService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ItemCard } from '../components/ItemCard';
import { ItemForm } from '../components/ItemForm';
import { ItemList } from '../components/ItemList';
import Swal from 'sweetalert2';

export const UserDashboard = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchItems();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(items);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query))
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, items]);

  const fetchUserData = async () => {
    try {
      const res = await apiService.getPenggunaMe();
      setUser(res.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
      // If unauthorized, clear tokens and redirect to login
      if (err.response?.status === 401) {
        localStorage.removeItem('user_token');
        navigate('/login?type=user');
      }
    }
  };

  const fetchItems = async () => {
    try {
      const res = await apiService.getItems();
      const rawItems = res.data?.items || res.data || [];
      setItems(rawItems);
      setFilteredItems(rawItems);
    } catch (err) {
      console.error('Error fetching items:', err);
      setItems([]);
      setFilteredItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('admin_token');
    navigate('/login?type=user');
  };

  const openAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setIsDetailOpen(false);
    setIsModalOpen(true);
  };

  const openDetailModal = (item) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleDelete = async (itemId) => {
    setIsDetailOpen(false);
    const result = await Swal.fire({
      title: 'Hapus Barang?',
      text: 'Apakah Anda yakin ingin menghapus barang ini secara permanen?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#660000',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await apiService.deleteItem(itemId);
      await fetchItems();
      Swal.fire({
        title: 'Terhapus!',
        text: 'Barang berhasil dihapus.',
        icon: 'success',
        confirmButtonColor: '#660000',
      });
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.detail || 'Gagal menghapus barang.',
        icon: 'error',
        confirmButtonColor: '#660000',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description || '',
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10) || 0,
      };

      if (editingItem) {
        await apiService.updateItem(editingItem.id, payload);
        Swal.fire({
          title: 'Berhasil!',
          text: 'Barang berhasil diperbarui.',
          icon: 'success',
          confirmButtonColor: '#660000',
        });
      } else {
        await apiService.createItem(payload);
        Swal.fire({
          title: 'Berhasil!',
          text: 'Barang berhasil ditambahkan.',
          icon: 'success',
          confirmButtonColor: '#660000',
        });
      }

      setIsModalOpen(false);
      setEditingItem(null);
      await fetchItems();
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.detail || 'Gagal menyimpan barang.',
        icon: 'error',
        confirmButtonColor: '#660000',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formFields = [
    { name: 'name', label: 'Nama Barang', required: true, placeholder: 'Contoh: Laptop Asus ROG' },
    { name: 'description', label: 'Deskripsi Barang', required: false, placeholder: 'Spesifikasi, kondisi, atau detail lainnya...' },
    { name: 'price', label: 'Harga (Rp)', type: 'number', required: true, placeholder: 'Contoh: 12500000' },
    { name: 'quantity', label: 'Jumlah / Stok', type: 'number', required: true, placeholder: 'Contoh: 10' },
  ];

  const totalStok = items.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const totalNilai = items.reduce((acc, curr) => acc + (curr.price * (curr.quantity || 0)), 0);

  if (loading && items.length === 0) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden relative font-sans">
      {/* Decorative BG */}
      <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-[#660000]/10 to-transparent dark:from-red-950/20 pointer-events-none" />
      <div className="absolute top-48 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <Header />

      <main className="pb-24 relative z-10">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#660000] to-[#8b0000] text-white py-20 shadow-2xl shadow-black/10 dark:from-red-950 dark:to-red-900 border-b border-white/10">
          <div className="px-6 max-w-full mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-5xl lg:text-7xl font-black text-white mb-4 tracking-tighter"
                >
                  Halo, {user?.name || 'User'}!
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-white/80 font-bold text-xl dark:text-slate-300 max-w-2xl"
                >
                  Selamat datang di Dashboard Manajemen Barang TRACELT.
                </motion.p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="px-6 max-w-full mx-auto pt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800 transition-all flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 bg-[#660000]/10 rounded-[1.5rem] flex items-center justify-center text-[#660000] dark:bg-red-400/10 dark:text-red-400 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                <Layers className="w-8 h-8" />
              </div>
              <div className="text-5xl font-black text-slate-900 dark:text-white mb-2 tabular-nums">
                {items.length}
              </div>
              <div className="text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-[0.2em]">
                Jenis Barang
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-10 rounded-[3rem] shadow-xl border border-green-100 dark:bg-slate-900 dark:border-slate-800 transition-all flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-[1.5rem] flex items-center justify-center text-green-600 dark:text-green-400 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="text-5xl font-black text-green-600 dark:text-green-500 mb-2 tabular-nums">
                {totalStok}
              </div>
              <div className="text-green-600/60 dark:text-green-500/60 font-black uppercase text-[10px] tracking-[0.2em]">
                Total Stok
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-10 rounded-[3rem] shadow-xl border border-amber-100 dark:bg-slate-900 dark:border-slate-800 transition-all flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-[1.5rem] flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                <DollarSign className="w-8 h-8" />
              </div>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-500 mb-2 tabular-nums truncate max-w-full">
                Rp {totalNilai.toLocaleString('id-ID')}
              </div>
              <div className="text-amber-600/60 dark:text-amber-500/60 font-black uppercase text-[10px] tracking-[0.2em]">
                Total Nilai Barang
              </div>
            </motion.div>
          </div>

          {/* Main Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-xl group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5 group-focus-within:text-[#660000] transition-colors" />
              <input
                type="text"
                placeholder="Cari barang berdasarkan nama atau deskripsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl focus:outline-none focus:ring-4 focus:ring-[#660000]/10 dark:focus:ring-red-500/20 focus:border-[#660000] dark:focus:border-red-500 transition-all text-slate-900 dark:text-white font-medium shadow-sm"
              />
            </div>

            {/* Add Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openAddModal}
              className="bg-[#660000] hover:bg-[#550000] text-white px-8 py-4.5 rounded-3xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-[#660000]/20"
            >
              <Plus className="w-5 h-5" />
              Tambah Barang Baru
            </motion.button>
          </div>

          {/* Items Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl p-10 border border-slate-100 dark:border-slate-800">
            <ItemList
              items={filteredItems}
              loading={loading}
              emptyMessage="Tidak ada barang ditemukan. Silakan tambahkan barang baru!"
              renderItem={(item) => (
                <ItemCard
                  key={item.id}
                  icon={Package}
                  title={item.name}
                  subtitle={`Stok: ${item.quantity}`}
                  badge={`Rp ${item.price.toLocaleString('id-ID')}`}
                  description={item.description || 'Tidak ada deskripsi.'}
                  onClick={() => openDetailModal(item)}
                />
              )}
            />
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transition-colors border border-slate-100 dark:border-slate-850"
            >
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-[#660000] dark:text-red-400" />
                    {editingItem ? 'Edit Detail Barang' : 'Tambah Barang Baru'}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
                    {editingItem ? 'Perbarui data inventaris Anda' : 'Masukkan ke dalam daftar inventaris Anda'}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-950 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar">
                <ItemForm
                  fields={formFields}
                  initialData={
                    editingItem
                      ? {
                          name: editingItem.name,
                          description: editingItem.description,
                          price: editingItem.price,
                          quantity: editingItem.quantity,
                        }
                      : {}
                  }
                  onSubmit={handleFormSubmit}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailOpen && selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden transition-colors border border-slate-100 dark:border-slate-850 p-8"
            >
              <button
                onClick={() => setIsDetailOpen(false)}
                className="absolute right-6 top-6 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-950 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#660000]/10 dark:bg-red-500/10 rounded-2xl flex items-center justify-center text-[#660000] dark:text-red-400">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[#660000] dark:text-red-400 text-[10px] font-black uppercase tracking-[0.2em] block mb-1">
                    DETAIL BARANG
                  </span>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                    {selectedItem.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 text-sm font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Harga
                  </span>
                  <span className="text-slate-900 dark:text-white font-extrabold text-lg">
                    Rp {selectedItem.price.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 text-sm font-semibold flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Stok
                  </span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black rounded-lg text-sm">
                    {selectedItem.quantity} Unit
                  </span>
                </div>

                <div className="py-3">
                  <span className="text-slate-400 dark:text-slate-500 text-sm font-semibold flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4" />
                    Deskripsi
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                    {selectedItem.description || 'Tidak ada deskripsi untuk barang ini.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => openEditModal(selectedItem)}
                  className="flex items-center justify-center gap-2 bg-[#660000] hover:bg-[#550000] text-white py-4 rounded-2xl font-bold transition-all shadow-md"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Barang
                </button>
                <button
                  onClick={() => handleDelete(selectedItem.id)}
                  className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-4 rounded-2xl font-bold transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logout Floating Action */}
      <button
        onClick={handleLogout}
        className="fixed bottom-8 right-8 flex items-center gap-2 bg-[#660000] hover:bg-[#550000] text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl z-50"
        title="Keluar dari akun"
      >
        <LogOut className="w-5 h-5" />
        <span className="hidden sm:inline">Keluar</span>
      </button>
    </div>
  );
};