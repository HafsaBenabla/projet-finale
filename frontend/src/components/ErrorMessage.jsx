import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

/**
 * Composant d'affichage de message d'erreur
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.message - Le message d'erreur à afficher
 * @param {string} [props.buttonText='Retour'] - Texte du bouton
 * @param {string} [props.redirectTo='/'] - Chemin de redirection pour le bouton
 * @returns {JSX.Element} Le composant ErrorMessage
 */
const ErrorMessage = ({ 
  message = 'Une erreur est survenue', 
  buttonText = 'Retour aux voyages', 
  redirectTo = '/voyages' 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(redirectTo);
  };

  return (
    <div className="min-h-[40vh] flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-3 rounded-full">
            <FaExclamationTriangle className="text-3xl text-red-600" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-red-600 mb-4">Erreur</h2>
        <p className="text-gray-700 mb-6">{message}</p>
        <button
          onClick={handleClick}
          className="px-6 py-2 bg-sahara text-white rounded-md hover:bg-sahara/90 transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default ErrorMessage; 