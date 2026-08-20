import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { BrowserRouter, Routes, Route } from 'react-router-dom'


import './styles/index.css'
import App from './pages/App.jsx'
import Login from './pages/Login.jsx'
import AccountCreation from './pages/AccountCreation.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
     <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<AccountCreation />} />
        
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)