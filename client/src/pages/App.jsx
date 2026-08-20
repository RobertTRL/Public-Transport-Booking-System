// import { useState } from 'react'
// import '../styles/App.css'
// import HeroGeometric from '../components/Hero'

// function App() {
              
//   return (
//   <div className='hero-section'>
//     <HeroGeometric
//       title2="HopOn!"
//       description="View public transport vehicle routes, stops and reserve seats for customers or add stops for routes and manage them for service providers!"
//       color1="#3B82F6"
//       color2="#F0F9FF"
//       speed={0.6}
//     />
//   </div>

//   // <BrowserRouter>
//   //     <Routes>
//   //       <Route path="/register" element={<AccountCreation />} />
//   //       <Route path="/login" element={<Login />} />
//   //     </Routes>
//   //   </BrowserRouter>
//   )
// }

// export default App

import { Routes, Route } from 'react-router-dom'

import '../styles/App.css'

import HeroGeometric from '../components/Hero'
import AccountCreation from './AccountCreation'
import Login from './Login'

function Home() {
  return (
    <div className="hero-section">
      <HeroGeometric
        title2="HopOn!"
        description="View public transport vehicle routes, stops and reserve seats for customers or add stops for routes and manage them for service providers!"
        color1="#3B82F6"
        color2="#F0F9FF"
        speed={0.6}
      />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/register" element={<AccountCreation />} />

      <Route path="/login" element={<Login />} />
    </Routes>
  )
}

export default App