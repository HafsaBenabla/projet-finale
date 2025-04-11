import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCalendarAlt, FaMoneyBillWave, FaClock, FaMapMarkerAlt, FaUsers, FaChevronDown, FaChevronUp } from 'react-icons/fa'

function ActivityCard({ 
  id, 
  name, 
  image, 
  description, 
  duration, 
  price,
  voyageId,
  city,
  maxParticipants,
  type,
  isWeekendOnly,
  timeSlots 
}) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    if (type === 'voyage') {
      navigate(`/voyage/${voyageId}`);
    } else {
      navigate(`/activite/${id}`);
    }
  }

  // Formater les dates pour affichage
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('fr-FR', options);
  };

  // Grouper les créneaux par date
  const groupedTimeSlots = timeSlots && timeSlots.length > 0 
    ? timeSlots.reduce((acc, slot) => {
        const dateKey = slot.date.substring(0, 10);
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(slot);
        return acc;
      }, {}) 
    : {};

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 w-full">
      <div 
        className="relative h-40 sm:h-48 overflow-hidden cursor-pointer"
        onClick={handleClick}
      >
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-sahara/90 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
          <FaClock className="text-xs sm:text-sm" />
          {duration} h
        </div>
        
        {type === 'locale' && isWeekendOnly && (
          <div className="absolute bottom-3 left-3 bg-sahara/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
            Weekend
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">{name}</h3>
        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{description}</p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="flex items-center text-xs text-gray-600">
            <FaMapMarkerAlt className="mr-1 text-sahara" />
            {city}
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <FaUsers className="mr-1 text-sahara" />
            {maxParticipants} pers. max
          </div>
        </div>
        
        {/* Créneaux horaires pour activités locales du weekend */}
        {type === 'locale' && isWeekendOnly && timeSlots && timeSlots.length > 0 && (
          <div className="mb-3">
            <button 
              className="flex items-center justify-between w-full bg-gray-100 p-2 rounded-lg text-sm font-medium text-gray-700"
              onClick={() => setExpanded(!expanded)}
            >
              <span className="flex items-center">
                <FaCalendarAlt className="mr-2 text-sahara" />
                Créneaux disponibles
              </span>
              {expanded ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            
            {expanded && (
              <div className="mt-2 bg-gray-50 p-2 rounded-lg text-sm">
                {Object.entries(groupedTimeSlots).map(([date, slots]) => (
                  <div key={date} className="mb-2">
                    <div className="font-medium text-gray-800 mb-1">
                      📅 {formatDate(date)}
                    </div>
                    <div className="space-y-1 pl-2">
                      {slots.map((slot, idx) => (
                        <div key={idx} className="flex items-center justify-between text-gray-600">
                          <span>⏰ {slot.startTime} - {slot.endTime}</span>
                          <span className="text-sahara">💺 {slot.availableSpots} places</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="text-sahara font-bold text-lg sm:text-xl">
            {price.toLocaleString()} DH
          </div>
          <button 
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-sahara text-white rounded-full text-xs sm:text-sm font-medium hover:bg-sahara/90 transition-colors"
            onClick={handleClick}
          >
            {type === 'voyage' ? 'Voir le Voyage' : 'Réserver'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ActivityCard
