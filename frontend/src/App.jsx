import { useState, useEffect, useCallback } from "react";
import { ToastProvider, useToast } from "./components/ToastContext";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import ItemForm from "./components/ItemForm";
import ItemList from "./components/ItemList";
import Toast from "./components/Toast";
import LoginPage from "./components/LoginPage";

import {
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
  checkHealth,
  login,
  register,
  clearToken,
} from "./services/api";

function AppContent() {
  const { toast, showToast, closeToast } = useToast();

  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [isConnected, setIsConnected] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [sortBy, setSortBy] = useState("newest");
  const [filterStock, setFilterStock] = useState("all");


  const loadItems = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const data = await fetchItems(search);
      setItems(data.items);
      setTotalItems(data.total);
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        handleLogout();
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth().then(setIsConnected);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadItems();
    }
  }, [isAuthenticated, loadItems]);


  const handleLogin = async (email, password) => {
    try {
      const data = await login(email, password);
      setUser(data.user);
      setIsAuthenticated(true);
      showToast("Login berhasil 🎉", "success");
    } catch (err) {
      showToast("Login gagal: " + err.message, "error");
    }
  };

  const handleRegister = async (userData) => {
    try {
      await register(userData);
      await handleLogin(userData.email, userData.password);
    } catch (err) {
      showToast("Register gagal: " + err.message, "error");
    }
  };

  const handleLogout = () => {
    clearToken();
    setUser(null);
    setIsAuthenticated(false);
    setItems([]);
    setTotalItems(0);
    setEditingItem(null);
    setSearchQuery("");
    showToast("Logout berhasil", "success");
  };


  const totalStock = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalValue = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );


  const filteredItems = items.filter((item) => {
    if (filterStock === "available") return item.quantity > 0;
    if (filterStock === "empty") return item.quantity === 0;
    return true;
  });


  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "price") return a.price - b.price;
    return new Date(b.created_at) - new Date(a.created_at);
  });

    const handleSubmit = async (itemData, editId) => {
    setIsSubmitting(true); 
    
    try {
      if (editId) {
        await updateItem(editId, itemData);
        setEditingItem(null); 
        showToast("Item berhasil diperbarui", "success");
      } else {
        await createItem(itemData);
        showToast("Item berhasil ditambahkan", "success");
      }
      await loadItems(searchQuery); 
      
    } catch (err) {

      if (err.message === "UNAUTHORIZED") {
        handleLogout(); 
      } else {
        showToast("Kesalahan: " + err.message, "error");
      }
    } finally {
     
      setIsSubmitting(false); 
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const item = items.find((i) => i.id === id);
    if (!window.confirm(`Hapus "${item?.name}"?`)) return;

    try {
      await deleteItem(id);
      showToast("Item berhasil dihapus 🗑️", "success");
      loadItems(searchQuery);
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        handleLogout();
      } else {
        showToast("Gagal menghapus item: " + err.message, "error");
      }
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    loadItems(query);
  };

  
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div style={styles.app}>
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />

      <div style={styles.container}>
        <Header
          totalItems={totalItems}
          isConnected={isConnected}
          user={user}
          onLogout={handleLogout}
        />

        
        <div style={styles.stats}>
          <div style={styles.card}>
            <p>Total Item</p>
            <h2>{totalItems}</h2>
          </div>
          <div style={styles.card}>
            <p>Total Stok</p>
            <h2>{totalStock}</h2>
          </div>
          <div style={styles.card}>
            <p>Total Nilai</p>
            <h2>
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
              }).format(totalValue)}
            </h2>
          </div>
        </div>

        
        <div className={isSubmitting ? "loading-overlay" : ""}>
          <ItemForm
            onSubmit={handleSubmit}
            editingItem={editingItem}
            onCancelEdit={() => setEditingItem(null)}
            isSubmitting={isSubmitting} 
          />
        </div>

        <SearchBar onSearch={handleSearch} />

        <div style={styles.filterSection}>
          <div style={styles.buttonGroup}>
            <span style={styles.label}>Urutkan: </span>
            <button 
              style={sortBy === "newest" ? styles.btnActive : styles.btn} 
              onClick={() => setSortBy("newest")}
            >Terbaru</button>
            <button 
              style={sortBy === "name" ? styles.btnActive : styles.btn} 
              onClick={() => setSortBy("name")}
            >Nama</button>
            <button 
              style={sortBy === "price" ? styles.btnActive : styles.btn} 
              onClick={() => setSortBy("price")}
            >Harga</button>
          </div>

          <div style={styles.buttonGroup}>
            <span style={styles.label}>Stok: </span>
            <button 
              style={filterStock === "all" ? styles.btnActive : styles.btn} 
              onClick={() => setFilterStock("all")}
            >Semua</button>
            <button 
              style={filterStock === "available" ? styles.btnActive : styles.btn} 
              onClick={() => setFilterStock("available")}
            >Ada</button>
            <button 
              style={filterStock === "empty" ? styles.btnActive : styles.btn} 
              onClick={() => setFilterStock("empty")}
            >Habis</button>
          </div>
        </div>

        {/* LIST ITEMS DENGAN SPINNER LOADING */}
        <ItemList
          items={sortedItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    background: "#f5f7fa",
    padding: "2rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  card: {
    background: "#2E75B6",
    color: "white",
    padding: "1rem",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  filterSection: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "1rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  buttonGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "bold",
    color: "#555",
  },
  btn: {
    padding: "0.4rem 0.8rem",
    border: "1px solid #2E75B6",
    background: "white",
    color: "#2E75B6",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  btnActive: {
    padding: "0.4rem 0.8rem",
    border: "1px solid #2E75B6",
    background: "#2E75B6",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
};

// Wrapper utama dengan Context Provider
export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}