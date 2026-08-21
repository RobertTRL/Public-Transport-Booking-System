import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './pages/App.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login.jsx'
import AccountCreation from './pages/AccountCreation.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Bookings from './pages/Bookings.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
// shadcn UI library, 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
      <Route path="/bookings" element={<Bookings />} />
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path='/signup' element={<AccountCreation />}/>
        <Route path='/dashboard' element={<Dashboard />}/>
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
