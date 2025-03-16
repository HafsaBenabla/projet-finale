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
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute top-4 right-4 bg-sahara/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
          <FaClock />
          {duration}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between">
          <div className="text-sahara font-bold text-xl">
            {price.toLocaleString()} DH
          </div>
          <button 
            className="px-4 py-2 bg-sahara text-white rounded-full text-sm font-medium hover:bg-sahara/90 transition-colors"
          >
            Voir le Voyage
          </button>
        </div>
      </div>
    </div>
  )
}

export default ActivityCard
