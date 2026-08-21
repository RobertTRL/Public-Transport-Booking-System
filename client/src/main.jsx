import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './pages/App.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login.jsx'
import AccountCreation from './pages/AccountCreation.jsx'
import Dashboard from './pages/Dashboard.jsx'
// import UserComponentsTest from './pages/UserComponentsTest.jsx'
// shadcn UI library, 

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