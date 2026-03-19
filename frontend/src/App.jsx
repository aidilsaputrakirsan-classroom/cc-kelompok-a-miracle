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

  // ================= AUTH =================
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ================= STATE =================
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [sortBy, setSortBy] = useState("newest");
  const [filterStock, setFilterStock] = useState("all");

  // ================= LOAD DATA =================
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

  // ================= AUTH HANDLER =================
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

  // ================= STAT =================
  const totalStock = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalValue = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  // ================= FILTER =================
  const filteredItems = items.filter((item) => {
    if (filterStock === "available") return item.quantity > 0;
    if (filterStock === "empty") return item.quantity === 0;
    return true;
  });

  // ================= SORT =================
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "price") return a.price - b.price;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // ================= CRUD =================
  const handleSubmit = async (itemData, editId) => {
    try {
      if (editId) {
        await updateItem(editId, itemData);
        setEditingItem(null);
        showToast("Item diupdate", "success");
      } else {
        await createItem(itemData);
        showToast("Item ditambahkan", "success");
      }
      loadItems(searchQuery);
    } catch (err) {
      if (err.message === "UNAUTHORIZED") handleLogout();
      else showToast("Error: " + err.message, "error");
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
      showToast("Item dihapus", "success");
      loadItems(searchQuery);
    } catch (err) {
      if (err.message === "UNAUTHORIZED") handleLogout();
      else showToast("Gagal hapus", "error");
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    loadItems(query);
  };

  // ================= LOGIN PAGE =================
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} onRegister={handleRegister} />;
  }

  // ================= UI =================
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

        {/* STATS */}
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

        <ItemForm
          onSubmit={handleSubmit}
          editingItem={editingItem}
          onCancelEdit={() => setEditingItem(null)}
        />

        <SearchBar onSearch={handleSearch} />

        {/* SORT */}
        <div>
          <button onClick={() => setSortBy("newest")}>Terbaru</button>
          <button onClick={() => setSortBy("name")}>Nama</button>
          <button onClick={() => setSortBy("price")}>Harga</button>
        </div>

        {/* FILTER */}
        <div>
          <button onClick={() => setFilterStock("all")}>Semua</button>
          <button onClick={() => setFilterStock("available")}>Ada</button>
          <button onClick={() => setFilterStock("empty")}>Habis</button>
        </div>

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
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "1rem",
    marginBottom: "1rem",
  },
  card: {
    background: "#2E75B6",
    color: "white",
    padding: "1rem",
    borderRadius: "10px",
    textAlign: "center",
  },
};

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}