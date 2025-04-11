import React from 'react';

/**
 * Composant d'affichage d'un indicateur de chargement
 * @param {Object} props - Les propriétés du composant
 * @param {string} [props.size='md'] - Taille du spinner ('sm', 'md', 'lg')
 * @param {string} [props.color='sahara'] - Couleur du spinner
 * @param {string} [props.message='Chargement en cours...'] - Message à afficher sous le spinner
 * @returns {JSX.Element} Le composant LoadingSpinner
 */
const LoadingSpinner = ({ size = 'md', color = 'sahara', message = 'Chargement en cours...' }) => {
  // Déterminer les tailles en fonction du paramètre de taille
  const dimensions = {
    sm: 'h-8 w-8 border-2',
    md: 'h-16 w-16 border-4',
    lg: 'h-24 w-24 border-6'
  };

  // Déterminer la classe de couleur
  const colorClass = color === 'sahara' ? 'border-sahara' : `border-${color}-500`;
  
  // Classes CSS pour le spinner
  const spinnerClasses = `${dimensions[size]} ${colorClass} rounded-full animate-spin border-t-transparent`;

  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center p-4">
      <div className={spinnerClasses}></div>
      {message && (
        <p className="mt-4 text-gray-600 text-center">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner; 