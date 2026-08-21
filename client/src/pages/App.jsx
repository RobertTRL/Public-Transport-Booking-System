import '../styles/App.css'
import HeroGeometric from '../components/Hero'
import HeroBackground from '../components/Background'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Problem from '../components/Problem'

function App() {
  return (
    <div>
      <div className='hero-section'>
        <HeroBackground color1="#3B82F6" color2="#F0F9FF" speed={0.6} />
        <Header/>
        <HeroGeometric
          title2="HopOn!"
          description="View public transport vehicle routes, stops and reserve seats for customers or add stops for routes and manage them for service providers!"
        />
        <Problem />
      </div>
      <Footer />
    </div>
  )
}

export default App