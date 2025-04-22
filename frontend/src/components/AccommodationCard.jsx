import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaBuilding, FaStar, FaCalendarAlt, FaChevronRight } from 'react-icons/fa';

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
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    // Ajouter un délai avant la navigation pour voir l'effet
    setTimeout(() => {
      navigate(`/voyage/${voyageId}`);
    }, 300);
  };

  // S'assurer que l'URL de l'image est complète
  const imageUrl = hebergementImage?.startsWith('http') 
    ? hebergementImage 
    : `http://localhost:5000${hebergementImage}`;

  return (
    <div 
      className={`bg-white rounded-xl overflow-hidden group hover:shadow-2xl transition-all duration-500 cursor-pointer relative transform hover:-translate-y-2 flex flex-col ${isClicked ? 'shadow-[0_0_15px_5px_rgba(224,148,65,0.7)] scale-95' : ''}`}
      onClick={handleClick}
      onMouseDown={() => setIsClicked(true)}
      onMouseUp={() => setIsClicked(false)}
      onMouseLeave={() => setIsClicked(false)}
    >
      {/* Image de l'hébergement avec overlay amélioré */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={imageUrl}
          alt={hebergementName || voyageTitle} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            console.error("Erreur de chargement d'image d'hébergement:", imageUrl);
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/400x300?text=Hébergement";
          }}
        />
        {/* Overlay gradient amélioré */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
        
        {/* Badge de durée revu */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-sahara font-semibold text-sm py-1.5 px-3 rounded-full flex items-center gap-1.5 shadow-lg transition-transform duration-300 group-hover:scale-110">
          <FaCalendarAlt className="text-xs" />
          <span>{duration} jours</span>
        </div>
        
        {/* Destination sur l'image */}
        <div className="absolute bottom-4 left-4 text-white flex items-center gap-2">
          <div className="bg-sahara/90 p-1.5 rounded-full">
            <FaMapMarkerAlt className="text-sm" />
          </div>
          <span className="font-medium text-sm tracking-wide">{destination}</span>
        </div>
      </div>
      
      {/* Contenu avec design amélioré */}
      <div className="p-6 flex-grow flex flex-col">
        {/* Nom de l'hébergement */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 transition-colors duration-300 group-hover:text-sahara line-clamp-1">
          {hebergementName || "Hébergement non spécifié"}
        </h3>
        
        {/* Étoiles (système amélioré) */}
        <div className="flex items-center mb-4">
          <div className="flex mr-2">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={`${i < 4 ? 'text-yellow-400' : 'text-gray-200'} mr-0.5 text-sm`} />
            ))}
          </div>
          <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">4.0</span>
        </div>
        
        {/* Prix et lien vers le voyage */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Inclus dans :</p>
              <p className="text-gray-800 font-medium text-sm line-clamp-1 max-w-[150px]">{voyageTitle}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-sahara">{price} <span className="text-sm font-medium">DH</span></p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bouton voir détails (apparaît au survol) */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-white to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500">
        <div className="flex items-center justify-center w-full">
          <span className="text-sm font-medium text-sahara flex items-center gap-1">
            Voir détails <FaChevronRight className="text-xs" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default AccommodationCard; 