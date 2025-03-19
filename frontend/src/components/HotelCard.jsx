import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaStar, FaCheck, FaCalendarAlt } from 'react-icons/fa';

function HotelCard({ 
  name, 
  location, 
  price, 
  image, 
  rating, 
  type, 
  agencyPackage, 
  features 
}) {
  const navigate = useNavigate();

  const handleViewPackage = () => {
    if (agencyPackage) {
      navigate(`/voyage/${agencyPackage.id}`);
    } else {
      navigate(`/hotels/${name.toLowerCase().replace(/\s+/g, '-')}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 w-full">
      <div className="relative h-52 sm:h-64 overflow-hidden group">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
        />
        {agencyPackage && (
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-sahara/90 backdrop-blur-sm text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
            <FaCalendarAlt className="text-xs sm:text-sm" />
            {agencyPackage.duration}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">{name}</h3>
            <p className="text-gray-600 flex items-center text-xs sm:text-sm mb-1.5 sm:mb-2">
              <FaMapMarkerAlt className="mr-1.5 sm:mr-2 text-sahara text-xs sm:text-sm" />
              {location}
            </p>
            <div className="flex items-center mb-1.5 sm:mb-2">
              {Array.from({ length: Math.floor(rating) }).map((_, index) => (
                <FaStar key={index} className="text-yellow-400 text-sm sm:text-base" />
              ))}
              <span className="ml-2 text-xs sm:text-sm text-gray-600">{rating}/5</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl sm:text-2xl font-bold text-sahara">{price}DH</div>
            <span className="text-gray-500 text-xs sm:text-sm">/nuit</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3 sm:pt-4 mb-3 sm:mb-4">
          <p className="text-xs sm:text-sm text-gray-600 mb-2">Type: <span className="font-medium">{type}</span></p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {features?.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center text-xs text-gray-600">
                <FaCheck className="text-sahara mr-1 text-xs sm:text-sm" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {agencyPackage && (
          <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-sahara/5 rounded-lg">
            <p className="text-xs sm:text-sm font-medium text-gray-900">Package inclus dans:</p>
            <p className="text-sahara font-semibold text-sm sm:text-base">{agencyPackage.name}</p>
          </div>
        )}

        <button 
          onClick={handleViewPackage}
          className={`w-full py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base
            ${agencyPackage 
              ? 'bg-sahara text-white hover:bg-sahara/90' 
              : 'border-2 border-sahara text-sahara hover:bg-sahara hover:text-white'}`}
        >
          {agencyPackage ? 'Voir le Package' : 'Réserver Directement'}
        </button>
      </div>
    </div>
  );
}

export default HotelCard;