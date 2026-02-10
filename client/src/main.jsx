import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// --- 1. PANGGIL LOGROCKET (WAJIB ADA) ---
import LogRocket from 'logrocket';

// --- 2. AKTIFKAN DENGAN ID KAMU ---
LogRocket.init('acuxic/toko-mobbi'); 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
