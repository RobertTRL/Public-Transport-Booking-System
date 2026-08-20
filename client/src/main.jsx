import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './pages/App.jsx'
import { BrowserRouter, Routes, Route , Link, NavLink, Outlet } from 'react-router-dom'
// shadcn UI library, 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />

    </BrowserRouter>
  </StrictMode>,
)
