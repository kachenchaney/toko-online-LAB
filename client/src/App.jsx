import { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import ReactGA from "react-ga4";

// IMPORT HALAMAN LOGIN & REGISTER YANG TADI KITA BUAT
// (Pastikan file Login.jsx dan Register.jsx sudah ada di folder src)
import Login from './Login';
import Register from './Register';

// --- BAGIAN 1: KOMPONEN UI ---

const Navbar = ({ cartCount, token, handleLogout }) => (
  <nav className="navbar">
    <Link to="/" className="logo">🛍️ MobbiStore</Link> {/* Ganti nama sesuai Toko */}
    <div className="nav-actions">
      <Link to="/" className="btn btn-outline" style={{ border: 'none' }}>Beranda</Link>
      
      {/* LOGIKA TAMPILAN MENU (AUTH) */}
      {token ? (
        <>
          {/* KALAU SUDAH LOGIN: Muncul Tambah Produk & Logout */}
          <Link to="/add" className="btn btn-primary">
            + Tambah Produk
          </Link>
          <div className="cart-btn" style={{ marginLeft: '10px' }}>
            🛒 <span className="badge">{cartCount}</span>
          </div>
          <button 
            onClick={handleLogout} 
            className="btn" 
            style={{ marginLeft: '10px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          {/* KALAU BELUM LOGIN: Muncul Login & Register */}
          <Link to="/login" className="btn btn-outline" style={{ marginLeft: '10px' }}>Login</Link>
          <Link to="/register" className="btn btn-primary" style={{ marginLeft: '10px' }}>Register</Link>
        </>
      )}
    </div>
  </nav>
);

const Footer = () => (
  <footer>
    <p>&copy; 2026 Mobbi Gadget Store. Full CRUD & Security Implementation.</p>
  </footer>
);

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

// --- BAGIAN 2: HALAMAN FORMULIR (CREATE & UPDATE) ---
function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: ''
  });

  useEffect(() => {
    if (id) {
      axios.get(`https://toko-online-lab.vercel.app/products/${id}`)
        .then(res => setFormData(res.data))
        .catch(err => console.error(err));
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id) {
      axios.put(`https://toko-online-lab.vercel.app/products/${id}`, formData)
        .then(() => {
          alert("✅ Produk berhasil diperbarui!");
          navigate("/");
        })
        .catch(err => alert("Gagal update: " + err.message));
    } else {
      axios.post(`https://toko-online-lab.vercel.app/products`, formData)
        .then(() => {
          alert("✅ Produk baru berhasil disimpan!");
          navigate("/");
        })
        .catch(err => alert("Gagal simpan: " + err.message));
    }
  };

  return (
    <div className="form-container">
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {id ? "Edit Produk" : "Tambah Produk Baru"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nama Produk</label>
          <input type="text" name="name" className="form-control" required 
                 value={formData.name} onChange={handleChange} placeholder="Contoh: iPhone 15" />
        </div>
        <div className="form-group">
          <label>Harga (Rupiah)</label>
          <input type="number" name="price" className="form-control" required 
                 value={formData.price} onChange={handleChange} placeholder="Contoh: 15000000" />
        </div>
        <div className="form-group">
          <label>URL Gambar</label>
          <input type="text" name="image" className="form-control" 
                 value={formData.image} onChange={handleChange} placeholder="https://..." />
          <small style={{ color: '#888' }}>Gunakan link gambar dari internet.</small>
        </div>
        <div className="form-group">
          <label>Deskripsi</label>
          <textarea name="description" className="form-control" required 
                    value={formData.description} onChange={handleChange} placeholder="Jelaskan produkmu..." />
        </div>
        
        <button type="submit" className="btn btn-primary btn-block">
          {id ? "Update Data" : "Simpan Produk"}
        </button>
        <button type="button" onClick={() => navigate('/')} className="btn btn-outline btn-block" style={{ marginTop: '10px' }}>
          Batal
        </button>
      </form>
    </div>
  );
}

// --- BAGIAN 3: HALAMAN UTAMA (READ ALL & DELETE) ---
function ProductList({ addToCart, token }) { // TERIMA PROPS TOKEN
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProducts = () => {
    axios.get('https://toko-online-lab.vercel.app/products')
      .then(res => { 
        setProducts(res.data); 
        setLoading(false); 
      })
      .catch(err => { 
        console.error("Gagal ambil data:", err); 
        setLoading(false); 
      });
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = (id, namaProduk) => {
    if (window.confirm(`Yakin ingin menghapus produk "${namaProduk}" secara permanen?`)) {
      axios.delete(`https://toko-online-lab.vercel.app/products/${id}`)
        .then(() => {
          alert("🗑️ Produk berhasil dihapus.");
          fetchProducts();
        })
        .catch(err => {
          console.error("Error:", err);
          alert("Gagal menghapus!");
        });
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <header className="hero">
        <h1>Mobbi Gadget Store</h1>
        <p>Admin Dashboard & Customer View</p>
      </header>

      <div className="controls">
        <input type="text" placeholder="🔍 Cari produk..." className="search-bar"
               value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '50px' }}>Sedang memuat data...</div> : (
        <div className="product-grid">
          {filteredProducts.length === 0 && <p style={{ textAlign: 'center', width: '100%' }}>Produk tidak ditemukan.</p>}
          
          {filteredProducts.map((product) => (
            <div key={product._id} className="product-card">
              <img src={product.image || "https://placehold.co/300"} alt={product.name} className="card-img" />
              <div className="card-body">
                <h3 className="card-title">{product.name}</h3>
                <div className="card-price">{formatRupiah(product.price)}</div>
                
                <div className="card-actions">
                   <Link to={`/detail/${product._id}`} className="btn btn-outline">Detail</Link>
                   {/* Tombol Beli Semua Orang Bisa Lihat */}
                   <button onClick={addToCart} className="btn btn-primary">Beli</button>
                </div>
                
                {/* --- AREA KHUSUS ADMIN (HANYA MUNCUL JIKA ADA TOKEN) --- */}
                {token && (
                  <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px dashed #ddd', display: 'flex', gap: '10px' }}>
                     <Link to={`/edit/${product._id}`} className="btn" style={{ backgroundColor: '#f59e0b', color: 'white', fontSize: '0.8rem', textDecoration: 'none', textAlign: 'center' }}>
                       ✏️ Edit
                     </Link>
                     <button 
                       type="button" 
                       onClick={() => handleDelete(product._id, product.name)} 
                       className="btn btn-danger" 
                       style={{ fontSize: '0.8rem' }}
                     >
                       🗑️ Hapus
                     </button>
                  </div>
                )}
                {/* --- END AREA ADMIN --- */}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- BAGIAN 4: HALAMAN DETAIL (READ ONE) ---
function ProductDetail({ addToCart, token }) { // TERIMA PROPS TOKEN
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axios.get(`https://toko-online-lab.vercel.app/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!product) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Detail...</div>;

  return (
    <div className="detail-container">
      <img src={product.image || "https://placehold.co/400"} className="detail-img" alt={product.name} />
      <div className="detail-info">
        <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'none', cursor: 'pointer', marginBottom: '1rem' }}>&larr; Kembali</button>
        <h1>{product.name}</h1>
        <h2 style={{ color: 'blue' }}>{formatRupiah(product.price)}</h2>
        <p style={{ lineHeight: '1.6' }}>{product.description}</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={addToCart} className="btn btn-primary">Beli Sekarang</button>
            
            {/* HANYA MUNCUL JIKA LOGIN */}
            {token && (
              <Link to={`/edit/${id}`} className="btn" style={{ background: '#f59e0b', color: 'white', textDecoration: 'none' }}>Edit Produk Ini</Link>
            )}
        </div>
      </div>
    </div>
  );
}

function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search,
    });
  }, [location]);

  return null;
}

// --- APP & ROUTING CONFIGURATION ---
function App() {
  const [cartCount, setCartCount] = useState(0);
  
  // --- STATE AUTHENTICATION ---
  const [token, setToken] = useState(localStorage.getItem('token')); 

  const addToCart = () => { setCartCount(c => c + 1); alert("Masuk keranjang!"); };

  // Fungsi Logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Hapus token dari browser
    setToken(null); // Kosongkan state
    alert("Berhasil Logout!");
    window.location.href = "/"; // Paksa refresh ke home
  };

  return (
    <BrowserRouter>
      <PageTracker />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Pass token & logout function ke Navbar */}
        <Navbar cartCount={cartCount} token={token} handleLogout={handleLogout} />
        
        <Routes>
          {/* Pass token ke ProductList agar tombol edit/hapus bisa diatur */}
          <Route path="/" element={<ProductList addToCart={addToCart} token={token} />} />
          
          {/* Route Auth */}
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register />} />

          {/* Route Admin (Bisa ditambah proteksi ekstra jika mau) */}
          <Route path="/add" element={token ? <ProductForm /> : <Navigate to="/login" />} />
          <Route path="/edit/:id" element={token ? <ProductForm /> : <Navigate to="/login" />} />
          
          <Route path="/detail/:id" element={<ProductDetail addToCart={addToCart} token={token} />} />
        </Routes>
        
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
