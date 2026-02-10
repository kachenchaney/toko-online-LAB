// client/src/Login.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login({ setToken }) { // Terima props setToken
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://toko-online-lab.vercel.app/login', { username, password });
      
      // SIMPAN TOKEN (Sesuai Soal LO3)
      const token = res.data.token;
      localStorage.setItem('token', token); // Simpan di browser
      setToken(token); // Update state di App.jsx
      
      alert('Login Berhasil!');
      navigate('/'); // Kembali ke Home
    } catch (error) {
      alert('Login Gagal: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: 'auto'}}>
      <h2>Silakan Login</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="text" placeholder="Username" 
          value={username} onChange={e => setUsername(e.target.value)} 
          required 
          style={{ padding: '10px', borderRadius: '12px', borderColor: '#949494', }}
        />
        <input 
          type="password" placeholder="Password" 
          value={password} onChange={e => setPassword(e.target.value)} 
          required 
          style={{ padding: '10px', borderRadius: '12px', borderColor: '#949494', }}
        />
        <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none' }}>
          Masuk
        </button>
      </form>
    </div>
  );
}
