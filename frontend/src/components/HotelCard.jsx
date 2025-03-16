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
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
      <div className="relative h-64 overflow-hidden group">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
        />
        {agencyPackage && (
          <div className="absolute top-4 right-4 bg-sahara/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
            <FaCalendarAlt />
            {agencyPackage.duration}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
            <p className="text-gray-600 flex items-center text-sm mb-2">
              <FaMapMarkerAlt className="mr-2 text-sahara" />
              {location}
            </p>
            <div className="flex items-center mb-2">
              {Array.from({ length: Math.floor(rating) }).map((_, index) => (
                <FaStar key={index} className="text-yellow-400" />
              ))}
              <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-sahara">{price}DH</div>
            <span className="text-gray-500 text-sm">/nuit</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 mb-4">
          <p className="text-sm text-gray-600 mb-2">Type: <span className="font-medium">{type}</span></p>
          <div className="flex flex-wrap gap-2">
            {features?.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center text-xs text-gray-600">
                <FaCheck className="text-sahara mr-1" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {agencyPackage && (
          <div className="mb-4 p-3 bg-sahara/5 rounded-lg">
            <p className="text-sm font-medium text-gray-900">Package inclus dans:</p>
            <p className="text-sahara font-semibold">{agencyPackage.name}</p>
          </div>
        )}

        <button 
          onClick={handleViewPackage}
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2
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