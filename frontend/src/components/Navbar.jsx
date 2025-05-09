import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaUserCircle } from 'react-icons/fa'
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
      button: "flex items-center space-x-3 px-6 py-3 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all duration-300",
      menu: "absolute top-full right-0 mt-3 w-56 bg-white rounded-xl shadow-xl py-2 border border-gray-100 transform transition-all duration-300 ease-out",
      item: "flex items-center space-x-3 px-5 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 cursor-pointer"
    },
    mobile: {
      button: "flex items-center justify-center space-x-3 w-full py-4 text-orange-600 hover:bg-orange-50 transition-all duration-300",
      menu: "absolute top-full left-0 right-0 bg-white shadow-xl py-2 border-t border-gray-100",
      item: "flex items-center justify-center space-x-3 w-full py-4 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200"
    }
  }

  // Style pour le lien Dashboard
  const dashboardLinkStyle = {
    desktop: "no-underline text-gray-800 hover:text-orange-500 text-xl font-semibold mx-5 transition-colors duration-200",
    mobile: "no-underline flex items-center justify-center space-x-2 w-full py-3 bg-orange-50 text-orange-600 font-medium"
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="w-full max-w-full mx-auto flex justify-between items-center h-24">
        {/* Logo à gauche */}
        <div className="flex-shrink-0 pl-2">
          <Link to="/" className="flex items-center no-underline">
            {/* Image du logo */}
            <div className="logo-hover">
              <img 
                src="/logo.png" 
                alt="MaghrebXplore Logo" 
                className="w-32 h-32 object-contain"
              />
            </div>
            
            {/* Texte du logo */}
            <div className="flex flex-col ml-2">
              <h1 className="text-4xl font-bold leading-tight border-0">
                <span className="text-gray-800">Maghreb</span>
                <span className="text-orange-500">Xplore</span>
              </h1>
              <span className="text-base uppercase tracking-wider text-gray-500 border-0 border-b-0 no-underline">VOYAGES & DÉCOUVERTES</span>
            </div>
          </Link>
        </div>
        
        {/* Menu burger pour mobile */}
        <button 
          className="md:hidden text-3xl text-gray-800 hover:text-orange-500 mr-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Menu mobile */}
        <div className={`${isMenuOpen ? 'flex' : 'hidden'} md:hidden absolute top-full left-0 right-0 bg-white flex-col items-center space-y-3 py-4 shadow-lg`}>
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="no-underline text-gray-800 hover:text-orange-500 w-full text-center py-2 text-lg font-semibold"
          >
            Accueil
          </Link>
          <Link
            to="/voyages"
            onClick={handleVoyagesClick}
            className="no-underline text-gray-800 hover:text-orange-500 w-full text-center py-2 text-lg font-semibold"
          >
            Voyages
          </Link>
          <Link
            to="/activites"
            onClick={() => setIsMenuOpen(false)}
            className="no-underline text-gray-800 hover:text-orange-500 w-full text-center py-2 text-lg font-semibold"
          >
            Activités
          </Link>
          <Link
            to="/city-agencies/Toutes les villes du Maroc"
            onClick={() => setIsMenuOpen(false)}
            className="no-underline text-gray-800 hover:text-orange-500 w-full text-center py-2 text-lg font-semibold"
          >
            Agences
          </Link>
          <Link
            to="/about"
            onClick={() => setIsMenuOpen(false)}
            className="no-underline text-gray-800 hover:text-orange-500 w-full text-center py-2 text-lg font-semibold"
          >
            À Propos
          </Link>
          <Link
            to="/contact"
            onClick={() => setIsMenuOpen(false)}
            className="no-underline text-gray-800 hover:text-orange-500 w-full text-center py-2 text-lg font-semibold"
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
              Dashboard
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
                  <span>{isAdmin ? 'Benabla' : user.username}</span>
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
              className="no-underline inline-flex items-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-colors duration-300 w-[80%] justify-center"
            >
              Se connecter
            </Link>
          )}
        </div>

        {/* Menu desktop - Liens au milieu */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <Link
            to="/"
            className="no-underline text-gray-800 hover:text-orange-500 text-xl font-semibold mx-5 transition-colors duration-200"
          >
            Accueil
          </Link>
          <Link
            to="/voyages"
            onClick={handleVoyagesClick}
            className="no-underline text-gray-800 hover:text-orange-500 text-xl font-semibold mx-5 transition-colors duration-200"
          >
            Voyages
          </Link>
          <Link
            to="/activites"
            className="no-underline text-gray-800 hover:text-orange-500 text-xl font-semibold mx-5 transition-colors duration-200"
          >
            Activités
          </Link>
          <Link
            to="/city-agencies/Toutes les villes du Maroc"
            className="no-underline text-gray-800 hover:text-orange-500 text-xl font-semibold mx-5 transition-colors duration-200"
          >
            Agences
          </Link>
          <Link
            to="/about"
            className="no-underline text-gray-800 hover:text-orange-500 text-xl font-semibold mx-5 transition-colors duration-200"
          >
            À Propos
          </Link>
          <Link
            to="/contact"
            className="no-underline text-gray-800 hover:text-orange-500 text-xl font-semibold mx-5 transition-colors duration-200"
          >
            Contact
          </Link>

          {/* Lien Dashboard pour admin (desktop) */}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className={dashboardLinkStyle.desktop}
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Bouton connexion à droite */}
        <div className="hidden md:block pr-2">
          {user ? (
            <div className="relative">
              <button
                onClick={handleProfileClick}
                className={profileMenuStyle.desktop.button}
              >
                <FaUserCircle className="text-3xl" />
                <span className="text-lg font-medium">{isAdmin ? 'Benabla' : user.username}</span>
              </button>
              {isProfileOpen && (
                <div className={profileMenuStyle.desktop.menu}>
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className={profileMenuStyle.desktop.item}
                  >
                    <FaUser className="text-orange-500 text-lg" />
                    <span className="font-medium">Mon Profil</span>
                  </Link>
                  <div className="border-t border-gray-100"></div>
                  <button
                    onClick={handleLogout}
                    className={profileMenuStyle.desktop.item + " w-full text-left"}
                  >
                    <FaSignOutAlt className="text-orange-500 text-lg" />
                    <span className="font-medium">Se déconnecter</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="no-underline inline-flex items-center px-7 py-3 bg-orange-500 text-white text-lg font-semibold rounded-full hover:bg-orange-600 transition-colors duration-300"
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
