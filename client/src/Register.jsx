// client/src/Register.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://toko-online-lab.vercel.app/register', { username, password });
      alert('Registrasi Berhasil! Silakan Login.');
      navigate('/login'); // Pindah ke halaman login
    } catch (error) {
      alert('Registrasi Gagal: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Daftar Akun Baru</h2>
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="text" placeholder="Username" 
          value={username} onChange={e => setUsername(e.target.value)} 
          required 
          style={{ padding: '10px', borderRadius: '12px', }}
        />
        <input 
          type="password" placeholder="Password" 
          value={password} onChange={e => setPassword(e.target.value)} 
          required 
          style={{ padding: '10px', borderRadius: '12px', }}
        />
        <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none' }}>
          Daftar Sekarang
        </button>
      </form>
    </div>
  );
}
