import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { BrowserRouter, Routes, Route } from 'react-router-dom'


import './styles/index.css'
import App from './pages/App.jsx'
<<<<<<< HEAD
import Login from './pages/Login.jsx'
import AccountCreation from './pages/AccountCreation.jsx'

=======
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login.jsx'
import AccountCreation from './pages/AccountCreation.jsx'
import Dashboard from './pages/Dashboard.jsx'
// import UserComponentsTest from './pages/UserComponentsTest.jsx'
// shadcn UI library, 
>>>>>>> origin/dev

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
<<<<<<< HEAD
     <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<AccountCreation />} />
        
=======
      <Routes>
        {/* <Route path="/user-test" element={<UserComponentsTest />} /> */}
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path='/signup' element={<AccountCreation />}/>
        <Route path='/dashboard' element={<Dashboard />}/>
>>>>>>> origin/dev
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)