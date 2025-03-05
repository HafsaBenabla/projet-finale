import React from 'react';

const LogoSvg = () => {
  return (
    <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cercle de base */}
      <path
        d="M50 90C72.0914 90 90 72.0914 90 50C90 27.9086 72.0914 10 50 10C27.9086 10 10 27.9086 10 50C10 72.0914 27.9086 90 50 90Z"
        className="text-orange-500"
        fill="currentColor"
        fillOpacity="0.1"
      />
      
      {/* Lettre M */}
      <path
        d="M30 65V35L40 50L50 35L60 50L70 35V65"
        className="text-orange-500"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Avion */}
      <path
        d="M75 25L90 20L85 35L75 25Z"
        className="text-gray-800"
        fill="currentColor"
      />
      
      {/* Traînée de l'avion */}
      <path
        d="M75 25C65 35 60 40 50 45"
        className="text-gray-800"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="2 2"
      />
    </svg>
  );
};

export default LogoSvg;
