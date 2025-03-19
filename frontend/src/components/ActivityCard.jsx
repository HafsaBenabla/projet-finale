import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCalendarAlt, FaMoneyBillWave, FaClock } from 'react-icons/fa'

function ActivityCard({ 
  id, 
  name, 
  image, 
  description, 
  duration, 
  price,
  voyageId 
}) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/voyage/${voyageId}`)
  }

  return (
    <div 
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer w-full"
      onClick={handleClick}
    >
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-sahara/90 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
          <FaClock className="text-xs sm:text-sm" />
          {duration}
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">{name}</h3>
        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between">
          <div className="text-sahara font-bold text-lg sm:text-xl">
            {price.toLocaleString()} DH
          </div>
          <button 
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-sahara text-white rounded-full text-xs sm:text-sm font-medium hover:bg-sahara/90 transition-colors"
          >
            Voir le Voyage
          </button>
        </div>
      </div>
    </div>
  )
}

export default ActivityCard
