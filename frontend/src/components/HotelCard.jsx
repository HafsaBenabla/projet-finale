import React from 'react'
import { FaMapMarkerAlt } from 'react-icons/fa'

function HotelCard({ name, location, price, image }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="h-52">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold mb-2 text-gray-900">{name}</h3>
        <p className="text-gray-600 mb-4 flex items-center text-sm">
          <FaMapMarkerAlt className="mr-1" />
          {location}
        </p>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-orange-500">{price}DH</span>
            <span className="text-gray-500 text-sm">/nuit</span>
          </div>
          <button className="px-4 py-2 border-2 border-orange-500 text-orange-500 font-semibold rounded-full hover:bg-orange-500 hover:text-white transition-colors">
            Réserver
          </button>
        </div>
      </div>
    </div>
  )
}

export default HotelCard
