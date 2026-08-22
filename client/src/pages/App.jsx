import '../styles/App.css'
import HeroGeometric from '../components/landingpage/Hero'
import HeroBackground from '../components/landingpage/Background'
import Header from '../components/landingpage/Header'
import Footer from '../components/landingpage/Footer'
import Problem from '../components/landingpage/Problem'
import Solution from '../components/landingpage/Solution'
import HowItWorks from '../components/landingpage/HowItWorks'
import BookVehicle from '../components/landingpage/BookVehicle'
import TextLoop from '../components/landingpage/TextLoop'
import FAQ from '../components/landingpage/FAQs'

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
            text="THAT's IT!"
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
      <FAQ />
      <Footer />
    </div>
  )
}

export default App