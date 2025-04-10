import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaUserCircle, FaCog } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
// Suppression de l'import problématique

const Navbar = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Vérifier si l'utilisateur est administrateur (email spécifique)
  const adminEmail = 'benablahafsa@gmail.com'
  const isAdmin = user?.email && user.email.toLowerCase() === adminEmail.toLowerCase()
  
  console.log('Navbar: Vérification administrateur:', { 
    userEmail: user?.email, 
    adminEmail, 
    isAdmin 
  })

  // Fonction pour gérer le clic sur le lien Voyages
  const handleVoyagesClick = () => {
    // Fermer le menu mobile si ouvert
    setIsMenuOpen(false)
    
    // Navigation standard pour éviter les problèmes
    // Pas besoin de logique complexe qui pourrait causer des erreurs
  };

  const handleLogout = () => {
    logout()
    setIsProfileOpen(false)
    setIsMenuOpen(false)
    navigate('/')
  }

  const handleProfileClick = () => {
    setIsProfileOpen(!isProfileOpen)
  }

  // Style du menu profil
  const profileMenuStyle = {
    desktop: {
      button: "flex items-center space-x-2 px-4 py-2 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all duration-300",
      menu: "absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-100 transition-all duration-300",
      item: "flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200"
    },
    mobile: {
      button: "flex items-center justify-center space-x-2 w-full py-3 text-orange-600 hover:bg-orange-50 transition-all duration-300",
      menu: "absolute top-full left-0 right-0 bg-white shadow-lg py-1 border-t border-gray-100",
      item: "flex items-center justify-center space-x-2 w-full py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200"
    }
  }

  // Style pour le lien Dashboard
  const dashboardLinkStyle = {
    desktop: "no-underline flex items-center space-x-1 text-orange-600 font-medium hover:text-orange-800",
    mobile: "no-underline flex items-center justify-center space-x-2 w-full py-3 bg-orange-50 text-orange-600 font-medium"
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="w-full max-w-[1400px] mx-auto py-2 px-4 sm:px-6 flex justify-between items-center">
        <Link to="/" className="flex-shrink-0 flex items-center gap-2 -ml-2">
          {/* Image du logo */}
          <div className="logo-hover">
            <img 
              src="/logo.png" 
              alt="MaghrebXplore Logo" 
              className="w-24 h-24 object-contain"
            />
          </div>
          
          {/* Texte du logo */}
          <div className="flex flex-col">
            <h1 className="text-4xl font-bold">
              <span className="text-gray-800">Maghreb</span>
              <span className="text-orange-500">Xplore</span>
            </h1>
            <span className="text-base uppercase tracking-widest text-gray-500">Voyages & Découvertes</span>
          </div>
        </Link>
        
        {/* Menu burger pour mobile */}
        <button 
          className="md:hidden text-2xl text-gray-800 hover:text-orange-500"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Menu mobile */}
        <div className={`${isMenuOpen ? 'flex' : 'hidden'} md:hidden absolute top-full left-0 right-0 bg-white flex-col items-center space-y-3 py-4 shadow-lg`}>
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="no-underline text-gray-800 hover:text-sahara w-full text-center py-2 text-base font-medium"
          >
            Accueil
          </Link>
          <Link
            to="/voyages"
            onClick={handleVoyagesClick}
            className="no-underline text-gray-800 hover:text-sahara w-full text-center py-2 text-base font-medium"
          >
            Voyages
          </Link>
          <Link
            to="/activites"
            onClick={() => setIsMenuOpen(false)}
            className="no-underline text-gray-800 hover:text-sahara w-full text-center py-2 text-base font-medium"
          >
            Activités
          </Link>
          <Link
            to="/about"
            onClick={() => setIsMenuOpen(false)}
            className="no-underline text-gray-800 hover:text-sahara w-full text-center py-2 text-base font-medium"
          >
            À Propos
          </Link>
          <Link
            to="/contact"
            onClick={() => setIsMenuOpen(false)}
            className="no-underline text-gray-800 hover:text-sahara w-full text-center py-2 text-base font-medium"
          >
            Contact
          </Link>

          {/* Lien Dashboard Admin (mobile) */}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className={dashboardLinkStyle.mobile}
            >
              <FaCog className="text-xl" />
              <span>Dashboard</span>
            </Link>
          )}

          {user ? (
            <>
              <div className="relative w-full">
                <button
                  onClick={handleProfileClick}
                  className={profileMenuStyle.mobile.button}
                >
                  <FaUserCircle className="text-xl" />
                  <span>{user.username}</span>
                </button>
                {isProfileOpen && (
                  <div className={profileMenuStyle.mobile.menu}>
                    <Link
                      to="/profile"
                      onClick={() => {
                        setIsProfileOpen(false)
                        setIsMenuOpen(false)
                      }}
                      className={profileMenuStyle.mobile.item}
                    >
                      <FaUser />
                      <span>Mon Profil</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={profileMenuStyle.mobile.item}
                    >
                      <FaSignOutAlt />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="no-underline inline-flex items-center px-6 py-3 bg-sahara text-white font-semibold rounded-full hover:bg-sahara/90 transition-colors duration-300 transform hover:-translate-y-0.5 w-[80%] justify-center"
            >
              Se connecter
            </Link>
          )}
        </div>

        {/* Menu desktop */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className="no-underline text-gray-800 hover:text-sahara text-base font-medium px-1"
          >
            Accueil
          </Link>
          <Link
            to="/voyages"
            onClick={handleVoyagesClick}
            className="no-underline text-gray-800 hover:text-sahara text-base font-medium px-1"
          >
            Voyages
          </Link>
          <Link
            to="/activites"
            className="no-underline text-gray-800 hover:text-sahara text-base font-medium px-1"
          >
            Activités
          </Link>
          <Link
            to="/about"
            className="no-underline text-gray-800 hover:text-sahara text-base font-medium px-1"
          >
            À Propos
          </Link>
          <Link
            to="/contact"
            className="no-underline text-gray-800 hover:text-sahara text-base font-medium px-1"
          >
            Contact
          </Link>

          {/* Lien Dashboard pour admin (desktop) */}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className={dashboardLinkStyle.desktop}
            >
              <FaCog className="text-lg" />
              <span>Dashboard</span>
            </Link>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={handleProfileClick}
                className={profileMenuStyle.desktop.button}
              >
                <FaUserCircle className="text-xl" />
                <span>{user.username}</span>
              </button>
              {isProfileOpen && (
                <div className={profileMenuStyle.desktop.menu}>
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className={profileMenuStyle.desktop.item}
                  >
                    <FaUser className="text-orange-500" />
                    <span>Mon Profil</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={profileMenuStyle.desktop.item}
                  >
                    <FaSignOutAlt className="text-orange-500" />
                    <span>Se déconnecter</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="no-underline inline-flex items-center px-6 py-3 bg-sahara text-white font-semibold rounded-full hover:bg-sahara/90 transition-colors duration-300 transform hover:-translate-y-0.5"
            >
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
