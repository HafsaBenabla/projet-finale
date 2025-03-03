import React from 'react'

function Logo() {
  return (
    <div className="flex items-center gap-3">
      {/* Logo image */}
      <img 
        src="https://cdn-icons-png.flaticon.com/512/7216/7216133.png"
        alt="MaghrebXplore Logo"
        className="w-12 h-12 object-contain"
      />

      {/* Texte du logo */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">
          <span className="text-gray-800">Maghreb</span>
          <span className="text-sahara">Xplore</span>
        </h1>
        <span className="text-xs uppercase tracking-widest text-gray-500">Voyages & Découvertes</span>
      </div>
    </div>
  )
}

export default Logo
