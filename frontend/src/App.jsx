import { useState, useEffect, useCallback } from "react"
import Header from "./components/Header"
import SearchBar from "./components/SearchBar"
import ItemForm from "./components/ItemForm"
import ItemList from "./components/ItemList"
import {
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
  checkHealth,
} from "./services/api"

function App() {
  // ================= STATE =================

  const [items, setItems] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  const [sortBy, setSortBy] = useState("newest")
  const [filterStock, setFilterStock] = useState("all")

  // ================= LOAD DATA =================

  const loadItems = useCallback(async (search = "") => {
    setLoading(true)

    try {
      const data = await fetchItems(search)

      setItems(data.items)
      setTotalItems(data.total)
    } catch (err) {
      console.error("Error loading items:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkHealth().then(setIsConnected)
    loadItems()
  }, [loadItems])

  // ================= STATISTIK =================

  const totalStock = items.reduce((sum, item) => sum + item.quantity, 0)

  const totalValue = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  // ================= FILTER =================

  const filteredItems = items.filter((item) => {
    if (filterStock === "available") return item.quantity > 0
    if (filterStock === "empty") return item.quantity === 0
    return true
  })

  // ================= SORTING =================

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name)
    }

    if (sortBy === "price") {
      return a.price - b.price
    }

    if (sortBy === "newest") {
      return new Date(b.created_at) - new Date(a.created_at)
    }

    return 0
  })

  // ================= HANDLERS =================

  const handleSubmit = async (itemData, editId) => {
    if (editId) {
      await updateItem(editId, itemData)
      setEditingItem(null)
      alert("Item berhasil diupdate")
    } else {
      await createItem(itemData)
      alert("Item berhasil ditambahkan")
    }

    loadItems(searchQuery)
  }

  const handleEdit = (item) => {
    setEditingItem(item)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const handleDelete = async (id) => {
    const item = items.find((i) => i.id === id)

    if (!window.confirm(`Yakin ingin menghapus "${item?.name}"?`)) return

    try {
      await deleteItem(id)

      alert("Item berhasil dihapus")

      loadItems(searchQuery)
    } catch (err) {
      alert("Gagal menghapus: " + err.message)
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    loadItems(query)
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
  }

  // ================= RENDER =================

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <Header totalItems={totalItems} isConnected={isConnected} />

        {/* DASHBOARD STATS */}
        <div style={styles.statsContainer}>

            <div style={{ ...styles.statCard, ...styles.itemCard }}>
              <p style={styles.statTitle}>📦 Total Item</p>
              <h2>{totalItems}</h2>
            </div>

            <div style={{ ...styles.statCard, ...styles.stockCard }}>
              <p style={styles.statTitle}>📊 Total Stok</p>
              <h2>{totalStock}</h2>
            </div>

            <div style={{ ...styles.statCard, ...styles.valueCard }}>
              <p style={styles.statTitle}>💰 Total Nilai Barang</p>
              <h2>
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(totalValue)}
              </h2>
            </div>

          </div>

        <ItemForm
          onSubmit={handleSubmit}
          editingItem={editingItem}
          onCancelEdit={handleCancelEdit}
        />

        <SearchBar onSearch={handleSearch} />

        {/* SORTING */}
        <div style={styles.sortContainer}>
          <span style={styles.sortLabel}>Urutkan:</span>

          <button
            style={sortBy === "newest" ? styles.activeBtn : styles.btn}
            onClick={() => setSortBy("newest")}
          >
            Terbaru
          </button>

          <button
            style={sortBy === "name" ? styles.activeBtn : styles.btn}
            onClick={() => setSortBy("name")}
          >
            Nama
          </button>

          <button
            style={sortBy === "price" ? styles.activeBtn : styles.btn}
            onClick={() => setSortBy("price")}
          >
            Harga
          </button>
        </div>

        {/* FILTER STOK */}
        <div style={styles.filterContainer}>
          <span style={styles.sortLabel}>Filter Stok:</span>

          <button
            style={filterStock === "all" ? styles.activeBtn : styles.btn}
            onClick={() => setFilterStock("all")}
          >
            Semua
          </button>

          <button
            style={filterStock === "available" ? styles.activeBtn : styles.btn}
            onClick={() => setFilterStock("available")}
          >
            Ada Stok
          </button>

          <button
            style={filterStock === "empty" ? styles.activeBtn : styles.btn}
            onClick={() => setFilterStock("empty")}
          >
            Habis
          </button>
        </div>

        <ItemList
          items={sortedItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
    </div>
  )
}

// ================= STYLES =================

const styles = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#eef2f7,#dbe9f6)",
    padding: "2rem",
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },

  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },

  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "1rem",
    marginBottom: "1rem",
  },

  statCard: {
  padding: "1.2rem",
  borderRadius: "12px",
  textAlign: "center",
  boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
  color: "white",
  background: "linear-gradient(135deg,#5B86E5,#36D1DC)",
  },
  
  sortContainer: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "0.5rem",
  },

  filterContainer: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "1rem",
  },

  sortLabel: {
    fontWeight: "bold",
  },

  btn: {
    padding: "6px 12px",
    borderRadius: "20px",
    border: "1px solid #ccc",
    background: "white",
    cursor: "pointer",
  },

  activeBtn: {
    padding: "6px 12px",
    borderRadius: "20px",
    border: "none",
    background: "#2E75B6",
    color: "white",
    cursor: "pointer",
  },
}

export default App