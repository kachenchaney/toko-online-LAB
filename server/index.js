const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); 

const app = express();

// --- KONFIGURASI ---
const JWT_SECRET = process.env.JWT_SECRET || "kuncirahasia_courtney_store_123"; 
const MONGO_URI = 'mongodb+srv://admin:admin123@cluster0.rtinywq.mongodb.net/?appName=Cluster0';

// --- MIDDLEWARE ---
// Pengaturan agar bisa menerima data besar (gambar base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// PENGATURAN CORS: Ganti URL di bawah dengan URL asli Vercel kamu
app.use(cors({
  origin: '*', // Untuk tahap awal agar lancar, jika sudah fix ganti ke URL Vercel-mu
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// --- KONEKSI DATABASE ---
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Database MongoDB Terhubung!"))
  .catch((err) => console.error("❌ Gagal Konek MongoDB:", err));

// --- MODEL DATA PRODUK ---
const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String
});
const Product = mongoose.model('Product', ProductSchema);

// --- ROUTE API ---

// 1. Ambil Semua Data
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Ambil 1 Data berdasarkan ID
app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Produk tidak ditemukan" });
    res.json(product);
  } catch (error) {
    res.status(404).json({ message: "ID tidak valid" });
  }
});

// 3. Tambah Data Baru
app.post('/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 4. Edit Data
app.put('/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 5. Hapus Data
app.delete('/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- AUTHENTICATION ---

// REGISTER
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- RUN SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});

module.exports = app;
