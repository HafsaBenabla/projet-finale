import React from 'react'
import { FaFacebook, FaTwitter, FaInstagram, FaCcVisa, FaCcMastercard, FaCcPaypal } from 'react-icons/fa'
import Logo from './Logo'

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="invert brightness-200">
              <Logo />
            </div>
            <p className="text-gray-400 mt-4">Découvrez le Maroc authentique avec nos expériences de voyage uniques.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Navigation</h4>
            <div className="flex flex-col space-y-2">
              <a href="/" className="text-gray-400 hover:text-white">Accueil</a>
              <a href="/voyages" className="text-gray-400 hover:text-white">Voyages</a>
              <a href="/activites" className="text-gray-400 hover:text-white">Activités</a>
              <a href="/about" className="text-gray-400 hover:text-white">À Propos</a>
              <a href="/contact" className="text-gray-400 hover:text-white">Contact</a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Suivez-nous</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-2xl hover:text-sahara"><FaFacebook /></a>
              <a href="#" className="text-2xl hover:text-sahara"><FaTwitter /></a>
              <a href="#" className="text-2xl hover:text-sahara"><FaInstagram /></a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Paiement sécurisé</h4>
            <div className="flex space-x-4">
              <FaCcVisa className="text-3xl" />
              <FaCcMastercard className="text-3xl" />
              <FaCcPaypal className="text-3xl" />
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} MaghrebXplore. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
