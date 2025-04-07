import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaBuilding, FaStar, FaCalendarAlt } from 'react-icons/fa';

const AccommodationCard = ({ 
  voyageId, 
  hebergementName, 
  hebergementImage, 
  destination, 
  price, 
  duration, 
  voyageTitle 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/voyage/${voyageId}`);
  };

  // S'assurer que l'URL de l'image est complète
  const imageUrl = hebergementImage?.startsWith('http') 
    ? hebergementImage 
    : `http://localhost:5000${hebergementImage}`;

  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={handleClick}
    >
      {/* Image de l'hébergement */}
      <div className="relative h-56 overflow-hidden">
        <img 
          src={imageUrl}
          alt={hebergementName || voyageTitle} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          onError={(e) => {
            console.error("Erreur de chargement d'image d'hébergement:", imageUrl);
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/400x300?text=Hébergement";
          }}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Badge de durée */}
        <div className="absolute top-3 right-3 bg-sahara text-white text-sm py-1 px-3 rounded-full font-medium flex items-center gap-1.5">
          <FaCalendarAlt className="text-xs" />
          <span>{duration} jours</span>
        </div>
      </div>
      
      {/* Contenu */}
      <div className="p-5">
        {/* Nom de l'hébergement */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
          {hebergementName || "Hébergement non spécifié"}
        </h3>
        
        {/* Destination */}
        <div className="flex items-center text-gray-600 mb-3">
          <FaMapMarkerAlt className="mr-2 text-sahara" />
          <span>{destination}</span>
        </div>
        
        {/* Étoiles (fictives) */}
        <div className="flex items-center mb-3">
          {[...Array(4)].map((_, i) => (
            <FaStar key={i} className="text-yellow-400 mr-1" />
          ))}
          <FaStar className="text-gray-300 mr-2" />
          <span className="text-sm text-gray-600">4.0/5</span>
        </div>
        
        {/* Prix et lien vers le voyage */}
        <div className="border-t border-gray-100 pt-4 mt-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Inclus dans le voyage :</p>
              <p className="text-sahara font-semibold">{voyageTitle}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-sahara">{price} DH</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccommodationCard; 