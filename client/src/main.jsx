import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// import react-router and react-router-dom dependecies here

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* Install react-router and react-router-dom packages */}
  </StrictMode>,
)
