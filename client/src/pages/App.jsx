import '../styles/App.css'
import HeroGeometric from '../components/Hero'
import HeroBackground from '../components/Background'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Problem from '../components/Problem'
import Solution from '../components/Solution'
import HowItWorks from '../components/HowItWorks'
import BookVehicle from '../components/BookVehicle'
import TextLoop from '../components/TextLoop'

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
        <h2 className='aboutus-title'>About us</h2>
        <Solution />
        <h2 className='aboutus-title'>How it works</h2>
        <HowItWorks />
        <BookVehicle />
        <TextLoop
            text="THAT's IT"
            shape="wave"
            speed={90}
            direction="forward"
            separator="✦"
            curviness={25}
            fontSize={36}
            fontWeight={800}
            letterSpacing={2}
            uppercase
            color="#ffffff"
            ribbon
            ribbonColor="#5227FF"
            ribbonWidth={86}
          />
      </div>
      <Footer />
    </div>
  )
}

export default App