import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Voyages from './pages/Voyages'
import VoyageDetail from './pages/VoyageDetail'
import PackageDetail from './pages/PackageDetail'
import ActivitesHome from './pages/ActivitesHome'
import ActivitesVoyages from './pages/Activites'
import ActivitesLocales from './pages/ActivitesLocales'
import ActivityDetail from './pages/ActivityDetail'
import AddActivity from './pages/AddActivity'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Signup from './pages/Signup'
import CityAgencies from './pages/CityAgencies'
import { VoyagesProvider } from './context/VoyagesContext'

function App() {
  return (
    <VoyagesProvider>
      <Router>
        <div className="flex flex-col min-h-screen font-poppins bg-white text-gray-900 scroll-smooth md:scroll-auto">
          <Navbar />
          <main className="flex-grow pt-20">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/voyages" element={<Voyages />} />
              <Route path="/voyage/:id" element={<VoyageDetail />} />
              <Route path="/packages/:id" element={<PackageDetail />} />
              <Route path="/activites" element={<ActivitesHome />} />
              <Route path="/activites-voyages" element={<ActivitesVoyages />} />
              <Route path="/activites-locales" element={<ActivitesLocales />} />
              <Route path="/activities/:id" element={<ActivityDetail />} />
              <Route path="/ajouter" element={<AddActivity />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/city/:cityName" element={<CityAgencies />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </VoyagesProvider>
  )
}

export default App
