import React, { useState } from 'react'
import Logo from './Logo'
import { FaBars, FaTimes } from 'react-icons/fa'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="w-full max-w-[1400px] mx-auto py-4 px-4 sm:px-6 flex justify-between items-center">
        <Logo />
        
        {/* Menu burger pour mobile */}
        <button 
          className="md:hidden text-2xl text-gray-800 hover:text-orange-500"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Menu mobile */}
        <div className={`${isMenuOpen ? 'flex' : 'hidden'} md:hidden absolute top-full left-0 right-0 bg-white flex-col items-center space-y-4 py-6 shadow-lg`}>
          <a href="/" className="no-underline text-gray-800 hover:text-sahara w-full text-center py-2">Accueil</a>
          <a href="/voyages" className="no-underline text-gray-800 hover:text-sahara w-full text-center py-2">Voyages</a>
          <a href="/activites" className="no-underline text-gray-800 hover:text-sahara w-full text-center py-2">Activités</a>
          <a href="/about" className="no-underline text-gray-800 hover:text-sahara w-full text-center py-2">À Propos</a>
          <a href="/contact" className="no-underline text-gray-800 hover:text-sahara w-full text-center py-2">Contact</a>
          <a href="/login" className="no-underline inline-flex items-center px-6 py-3 bg-sahara text-white font-semibold rounded-full hover:bg-sahara/90 transition-colors duration-300 transform hover:-translate-y-0.5 w-[80%] justify-center">Connexion</a>
        </div>

        {/* Menu desktop */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="/" className="no-underline text-gray-800 hover:text-sahara">Accueil</a>
          <a href="/voyages" className="no-underline text-gray-800 hover:text-sahara">Voyages</a>
          <a href="/activites" className="no-underline text-gray-800 hover:text-sahara">Activités</a>
          <a href="/about" className="no-underline text-gray-800 hover:text-sahara">À Propos</a>
          <a href="/contact" className="no-underline text-gray-800 hover:text-sahara">Contact</a>
          <a href="/login" className="no-underline inline-flex items-center px-6 py-3 bg-sahara text-white font-semibold rounded-full hover:bg-sahara/90 transition-colors duration-300 transform hover:-translate-y-0.5">Connexion</a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
