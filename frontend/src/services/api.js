const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

// ==================== TOKEN MANAGEMENT ====================

// SIMPAN TOKEN KE LOCAL STORAGE
export function setToken(token) {
  localStorage.setItem("token", token)
}

// AMBIL TOKEN
export function getToken() {
  return localStorage.getItem("token")
}

// HAPUS TOKEN
export function clearToken() {
  localStorage.removeItem("token")
}

// ==================== HEADER AUTH ====================

function authHeaders() {
  const headers = {
    "Content-Type": "application/json",
  }

  const token = getToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return headers
}

// ==================== HANDLE RESPONSE ====================

async function handleResponse(response) {
  if (response.status === 401) {
    clearToken()

    // Optional: auto redirect ke login
    // window.location.href = "/login"

    throw new Error("UNAUTHORIZED")
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || `Request gagal (${response.status})`)
  }

  if (response.status === 204) return null

  return response.json()
}

// ==================== AUTH API ====================

export async function register(userData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  })

  return handleResponse(response)
}

export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  const data = await handleResponse(response)

  // SIMPAN TOKEN DI SINI
  setToken(data.access_token)

  console.log("TOKEN DISIMPAN:", data.access_token)

  return data
}

export async function getMe() {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: authHeaders(),
  })

  return handleResponse(response)
}

// ==================== ITEMS API ====================

export async function fetchItems(search = "", skip = 0, limit = 20) {
  const params = new URLSearchParams()

  if (search) params.append("search", search)
  params.append("skip", skip)
  params.append("limit", limit)

  console.log("TOKEN DI FETCH:", getToken())

  const response = await fetch(`${API_URL}/items?${params}`, {
    headers: authHeaders(),
  })

  return handleResponse(response)
}

export async function createItem(itemData) {
  const response = await fetch(`${API_URL}/items`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(itemData),
  })

  return handleResponse(response)
}

export async function updateItem(id, itemData) {
  const response = await fetch(`${API_URL}/items/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(itemData),
  })

  return handleResponse(response)
}

export async function deleteItem(id) {
  const response = await fetch(`${API_URL}/items/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })

  return handleResponse(response)
}

// ==================== HEALTH CHECK ====================

export async function checkHealth() {
  try {
    const response = await fetch(`${API_URL}/health`)
    const data = await response.json()
    return data.status === "healthy"
  } catch {
    return false
  }
}