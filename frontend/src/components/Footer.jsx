import React from 'react'
import { FaFacebook, FaTwitter, FaInstagram, FaCcVisa, FaCcMastercard, FaCcPaypal, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa'
import Logo from './Logo'

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="w-full max-w-[1400px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* À propos */}
          <div className="space-y-6">
            <div className="invert brightness-200">
              <Logo />
            </div>
            <p className="text-gray-400">
              Découvrez le Maroc authentique avec nos expériences de voyage uniques. 
              Nous vous offrons des moments inoubliables et des aventures exceptionnelles.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-2xl text-gray-400 hover:text-sahara transition-colors">
                <FaFacebook />
              </a>
              <a href="#" className="text-2xl text-gray-400 hover:text-sahara transition-colors">
                <FaTwitter />
              </a>
              <a href="#" className="text-2xl text-gray-400 hover:text-sahara transition-colors">
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold">Contactez-nous</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-sahara mt-1" />
                <p className="text-gray-400">123 Avenue Mohammed V,<br />Marrakech 40000, Maroc</p>
              </div>
              <div className="flex items-center space-x-3">
                <FaPhone className="text-sahara" />
                <p className="text-gray-400">+212 5XX-XXXXXX</p>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-sahara" />
                <p className="text-gray-400">contact@maghrebxplore.com</p>
              </div>
            </div>
          </div>

          {/* Paiement */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold">Paiement sécurisé</h4>
            <p className="text-gray-400 mb-4">
              Nous acceptons plusieurs moyens de paiement pour votre confort et votre sécurité
            </p>
            <div className="flex space-x-6">
              <FaCcVisa className="text-4xl text-gray-400" />
              <FaCcMastercard className="text-4xl text-gray-400" />
              <FaCcPaypal className="text-4xl text-gray-400" />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} MaghrebXplore. Tous droits réservés.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
              <a href="#" className="hover:text-white transition-colors">CGV</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
