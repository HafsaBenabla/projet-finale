import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaRegClock, FaUsers, FaRegStar, FaCompass } from 'react-icons/fa';
import VoyageReactionPanel from './VoyageReactionPanel';

const VoyageCard = ({ voyage }) => {
  const navigate = useNavigate();

  // S'assurer que l'URL de l'image est complète
  const imageUrl = voyage.image?.startsWith('http') 
    ? voyage.image 
    : `http://localhost:5000${voyage.image}`;

  return (
    <div 
      className="relative group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform transition-all duration-500 hover:-translate-y-2"
    >
      {/* Badge promotion si applicable */}
      {voyage.isPromotion && (
        <div className="absolute top-4 left-4 z-20 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
          Promotion
        </div>
      )}
      
      {/* Image container avec overlay */}
      <div className="relative h-56 md:h-64 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={voyage.title}
          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.pexels.com/photos/7412095/pexels-photo-7412095.jpeg';
          }}
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-70"></div>
        
        {/* Infos superposées sur l'image */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md group-hover:text-orange-200 transition-colors duration-300">{voyage.title}</h3>
          <div className="flex items-center space-x-1">
            <FaMapMarkerAlt className="text-orange-400" />
            <span className="text-sm font-medium">{voyage.destination}</span>
          </div>
        </div>
      </div>
      
      {/* Card content */}
      <div className="p-5">
        {/* Description courte */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {voyage.description}
        </p>
        
        {/* Caractéristiques */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center text-gray-700 text-sm">
            <FaRegClock className="text-orange-500 mr-2" />
            <span>{voyage.duration} jour{voyage.duration > 1 ? 's' : ''}</span>
          </div>
          
          <div className="flex items-center text-gray-700 text-sm">
            <FaUsers className="text-orange-500 mr-2" />
            <span>{voyage.availableSpots || 0} places disponibles</span>
          </div>
          
          <div className="flex items-center text-gray-700 text-sm">
            <FaCalendarAlt className="text-orange-500 mr-2" />
            <span>{voyage.departureDate ? new Date(voyage.departureDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'Flexible'}</span>
          </div>
          
          <div className="flex items-center text-gray-700 text-sm">
            <FaCompass className="text-orange-500 mr-2" />
            <span>{voyage.type || 'Circuit'}</span>
          </div>
        </div>
        
        {/* Séparateur */}
        <div className="border-t border-gray-100 mb-4"></div>
        
        {/* Prix et actions */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs">À partir de</span>
            <span className="text-2xl font-bold text-orange-600">
              {voyage.price?.toLocaleString()} <span className="text-sm font-normal">DH</span>
            </span>
          </div>
          
          <button 
            onClick={() => navigate(`/voyage/${voyage._id}`)}
            className="px-5 py-2 bg-sahara text-white rounded-full text-sm font-medium hover:bg-sahara/90 transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sahara focus:ring-offset-2 shadow-md"
          >
            Voir le voyage
          </button>
        </div>
        
        {/* Panneau de réactions */}
        <div className="mt-4">
          <VoyageReactionPanel voyageId={voyage._id} />
        </div>
      </div>
    </div>
  );
};

export default VoyageCard; 