import { useState } from 'react'
import '../styles/App.css'
import '../styles/hero.css'

function App() {
              
  return (
  <div className='hero-section'>
    <HeroGeometric
      title1="Robert's"
      title2="Coffee Shop"
      description="Enjoy the finest coffee from Kenya's leading coffee shop!"
      color1="#3B82F6"
      color2="#F0F9FF"
      speed={1.6}
    />
  </div>
  )
}

export default App
