import React from 'react'
import { FaFacebook, FaTwitter, FaInstagram, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUniversity, FaLock } from 'react-icons/fa'

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 sm:py-12">
      <div className="w-full max-w-full mx-auto px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* À propos */}
          <div className="space-y-4 sm:space-y-6 px-4">
            <div className="flex items-center gap-3 max-w-[350px]">
              {/* Image du logo */}
              <div className="flex-shrink-0">
                <img 
                  src="/logo.png" 
                  alt="MaghrebXplore Logo" 
                  className="w-28 h-28 object-contain"
                />
              </div>
              
              {/* Texte du logo */}
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold">
                  <span className="text-white">Maghreb</span>
                  <span className="text-sahara">Xplore</span>
                </h1>
                <span className="text-sm uppercase tracking-widest text-gray-300">Voyages & Découvertes</span>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-400">
              Découvrez le Maroc authentique avec nos expériences de voyage uniques. 
              Nous vous offrons des moments inoubliables et des aventures exceptionnelles.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-xl sm:text-2xl text-gray-400 hover:text-sahara transition-colors">
                <FaFacebook />
              </a>
              <a href="#" className="text-xl sm:text-2xl text-gray-400 hover:text-sahara transition-colors">
                <FaTwitter />
              </a>
              <a href="#" className="text-xl sm:text-2xl text-gray-400 hover:text-sahara transition-colors">
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4 sm:space-y-6 pl-8 pr-2 flex justify-center">
            <div>
              <h4 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Contactez-nous</h4>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start space-x-3">
                  <FaMapMarkerAlt className="text-sahara mt-1 text-lg sm:text-xl" />
                  <p className="text-sm sm:text-base text-gray-400">123 Avenue Mohammed V,<br />Marrakech 40000, Maroc</p>
                </div>
                <div className="flex items-center space-x-3">
                  <FaPhone className="text-sahara text-lg sm:text-xl" />
                  <p className="text-sm sm:text-base text-gray-400">+212 5XX-XXXXXX</p>
                </div>
                <div className="flex items-center space-x-3">
                  <FaEnvelope className="text-sahara text-lg sm:text-xl" />
                  <p className="text-sm sm:text-base text-gray-400">contact@maghrebxplore.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Paiement */}
          <div className="space-y-4 sm:space-y-6 pl-0 pr-4">
            <h4 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Modalités de paiement</h4>
            <p className="text-sm sm:text-base text-gray-400 mb-2">
              Le paiement s'effectue exclusivement par virement bancaire
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 flex justify-center">
                  <FaUniversity className="text-xl sm:text-2xl text-sahara" />
                </div>
                <p className="text-sm text-gray-400">Virement bancaire sécurisé</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 flex justify-center">
                  <FaLock className="text-xl sm:text-2xl text-sahara" />
                </div>
                <p className="text-sm text-gray-400">Les informations bancaires vous seront communiquées après réservation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-800 px-2">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-xs sm:text-sm text-gray-400">
              &copy; {new Date().getFullYear()} MaghrebXplore. Tous droits réservés.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:space-x-6 text-xs sm:text-sm">
              <a href="#" className="text-gray-400 hover:text-sahara no-underline transition-colors duration-300">Mentions légales</a>
              <a href="#" className="text-gray-400 hover:text-sahara no-underline transition-colors duration-300">Politique de confidentialité</a>
              <a href="#" className="text-gray-400 hover:text-sahara no-underline transition-colors duration-300">CGV</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
