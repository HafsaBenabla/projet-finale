import React from 'react'
import Logo from './Logo'

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="container-full py-4 px-6 flex justify-between items-center">
        <Logo />
        <div className="hidden md:flex items-center space-x-8">
          <a href="/" className="text-gray-800 hover:text-sahara">Accueil</a>
          <a href="/voyages" className="text-gray-800 hover:text-sahara">Voyages</a>
          <a href="/activites" className="text-gray-800 hover:text-sahara">Activités</a>
          <a href="/about" className="text-gray-800 hover:text-sahara">À Propos</a>
          <a href="/contact" className="text-gray-800 hover:text-sahara">Contact</a>
          <a href="/login" className="btn-primary">Connexion</a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
