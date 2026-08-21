import '../styles/App.css'
import HeroGeometric from '../components/Hero'

function App() {

  return (
  <div>
  <div className='hero-section'>
    <HeroGeometric
      title2="HopOn!"
      description="View public transport vehicle routes, stops and reserve seats for customers or add stops for routes and manage them for service providers!"
      color1="#3B82F6"
      color2="#F0F9FF"
      speed={0.6}
    />

  </div>
  </div>
  )
}

export default App