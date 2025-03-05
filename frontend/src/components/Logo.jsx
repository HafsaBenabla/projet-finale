import React from 'react'
import LogoSvg from './LogoSvg'

function Logo() {
  return (
    <div className="flex items-center gap-3">
      {/* Logo SVG */}
      <div className="logo-hover">
        <LogoSvg />
      </div>

      {/* Texte du logo */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">
          <span className="text-gray-800">Maghreb</span>
          <span className="text-orange-500">Xplore</span>
        </h1>
        <span className="text-xs uppercase tracking-widest text-gray-500">Voyages & Découvertes</span>
      </div>
    </div>
  )
}

export default Logo
