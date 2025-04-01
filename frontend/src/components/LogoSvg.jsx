import React from 'react';

const LogoSvg = () => {
  return (
    <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fond circulaire */}
      <circle cx="50" cy="50" r="40" fill="#FFF" />
      
      {/* Motif zellige marocain en arrière-plan */}
      <g opacity="0.3">
        {/* Rangée 1 de motif zellige */}
        <path d="M30 30L40 30L35 38L30 30Z" fill="#FF8C38" stroke="#FF8C38" strokeWidth="0.5" />
        <path d="M40 30L50 30L45 38L40 30Z" fill="#FF8C38" stroke="#FF8C38" strokeWidth="0.5" />
        <path d="M50 30L60 30L55 38L50 30Z" fill="#FF8C38" stroke="#FF8C38" strokeWidth="0.5" />
        <path d="M60 30L70 30L65 38L60 30Z" fill="#FF8C38" stroke="#FF8C38" strokeWidth="0.5" />
        
        {/* Rangée 2 de motif zellige */}
        <path d="M25 38L35 38L30 46L25 38Z" fill="#FF8C38" stroke="#FF8C38" strokeWidth="0.5" />
        <path d="M35 38L45 38L40 46L35 38Z" fill="#FF8C38" stroke="#FF8C38" strokeWidth="0.5" />
        <path d="M45 38L55 38L50 46L45 38Z" fill="#FF8C38" stroke="#FF8C38" strokeWidth="0.5" />
        <path d="M55 38L65 38L60 46L55 38Z" fill="#FF8C38" stroke="#FF8C38" strokeWidth="0.5" />
        <path d="M65 38L75 38L70 46L65 38Z" fill="#FF8C38" stroke="#FF8C38" strokeWidth="0.5" />
        
        {/* Rangée 3 de motif zellige */}
        <path d="M30 46L40 46L35 54L30 46Z" fill="#FF8C38" stroke="#FF8C38" strokeWidth="0.5" />
        <path d="M40 46L50 46L45 54L40 46Z" fill="#FF8C38" stroke="#FF8C38" strokeWidth="0.5" />
        <path d="M50 46L60 46L55 54L50 46Z" fill="#FF8C38" stroke="#FF8C38" strokeWidth="0.5" />
        <path d="M60 46L70 46L65 54L60 46Z" fill="#FF8C38" stroke="#FF8C38" strokeWidth="0.5" />
        
        {/* Rangée 4 de motif zellige */}
        <path d="M25 54L35 54L30 62L25 54Z" fill="#FF8C38" stroke="#FF8C38" strokeWidth="0.5" />
        <path d="M35 54L45 54L40 62L35 54Z" fill="#FF8C38" stroke="#FF8C38" strokeWidth="0.5" />
        <path d="M45 54L55 54L50 62L45 54Z" fill="#FF8C38" stroke="#FF8C38" strokeWidth="0.5" />
        <path d="M55 54L65 54L60 62L55 54Z" fill="#FF8C38" stroke="#FF8C38" strokeWidth="0.5" />
        <path d="M65 54L75 54L70 62L65 54Z" fill="#FF8C38" stroke="#FF8C38" strokeWidth="0.5" />
        
        {/* Rangée 5 de motif zellige */}
        <path d="M30 62L40 62L35 70L30 62Z" fill="#FF8C38" stroke="#FF8C38" strokeWidth="0.5" />
        <path d="M40 62L50 62L45 70L40 62Z" fill="#FF8C38" stroke="#FF8C38" strokeWidth="0.5" />
        <path d="M50 62L60 62L55 70L50 62Z" fill="#FF8C38" stroke="#FF8C38" strokeWidth="0.5" />
        <path d="M60 62L70 62L65 70L60 62Z" fill="#FF8C38" stroke="#FF8C38" strokeWidth="0.5" />
      </g>
      
      {/* Combinaison de M et X au centre */}
      {/* Lettre M */}
      <path 
        d="M25 35L35 55L45 35L55 55L65 35" 
        stroke="#FF8C38" 
        strokeWidth="4" 
        fill="none" 
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Lettre X qui se superpose */}
      <path 
        d="M30 35L60 65M60 35L30 65" 
        stroke="#FF8C38" 
        strokeWidth="4" 
        fill="none" 
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Étoile marocaine au centre */}
      <path
        d="M50 43L52 48L57 48L53 51L55 56L50 53L45 56L47 51L43 48L48 48L50 43Z"
        fill="#FF8C38"
      />
      
      {/* Cercle extérieur (contour) */}
      <circle 
        cx="50" 
        cy="50" 
        r="44" 
        stroke="#FF8C38" 
        strokeWidth="2" 
        fill="none"
        strokeDasharray="4 2" 
      />
      
      {/* Petit arc décoratif en bas */}
      <path
        d="M35 70C40 75 45 77 50 77C55 77 60 75 65 70"
        stroke="#FF8C38"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
};

export default LogoSvg;
