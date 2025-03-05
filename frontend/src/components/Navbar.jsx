import React from 'react'
import Logo from './Logo'

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="w-full max-w-[1400px] mx-auto py-4 px-6 flex justify-between items-center">
        <Logo />
        <div className="hidden md:flex items-center space-x-8">
          <a href="/" className="text-gray-800 hover:text-orange-500">Accueil</a>
          <a href="/voyages" className="text-gray-800 hover:text-orange-500">Voyages</a>
          <a href="/activites" className="text-gray-800 hover:text-orange-500">Activités</a>
          <a href="/about" className="text-gray-800 hover:text-orange-500">À Propos</a>
          <a href="/contact" className="text-gray-800 hover:text-orange-500">Contact</a>
          <a href="/login" className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-colors duration-300 transform hover:-translate-y-0.5">Connexion</a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
