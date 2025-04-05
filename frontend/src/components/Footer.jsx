import React from 'react'
import { FaFacebook, FaTwitter, FaInstagram, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUniversity, FaLock } from 'react-icons/fa'
import Logo from './Logo'

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 sm:py-12">
      <div className="w-full max-w-[1400px] mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
          {/* À propos */}
          <div className="space-y-4 sm:space-y-6">
            <div className="invert brightness-200 max-w-[150px] sm:max-w-[180px]">
              <Logo />
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
          <div className="space-y-4 sm:space-y-6">
            <h4 className="text-lg sm:text-xl font-semibold">Contactez-nous</h4>
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

          {/* Paiement */}
          <div className="space-y-4 sm:space-y-6">
            <h4 className="text-lg sm:text-xl font-semibold">Modalités de paiement</h4>
            <p className="text-sm sm:text-base text-gray-400 mb-2">
              Le paiement s'effectue exclusivement par virement bancaire
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FaUniversity className="text-2xl sm:text-3xl text-sahara" />
                <p className="text-sm text-gray-400">Virement bancaire sécurisé</p>
              </div>
              <div className="flex items-center space-x-3">
                <FaLock className="text-xl sm:text-2xl text-sahara" />
                <p className="text-sm text-gray-400">Les informations bancaires vous seront communiquées après réservation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-800">
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
