import React from 'react'
import { FaMapMarkerAlt } from 'react-icons/fa'

function HotelCard({ name, location, price, image }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
      <div className="aspect-w-16 aspect-h-9">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{name}</h3>
        <p className="text-gray-600 mb-4">
          <FaMapMarkerAlt className="inline mr-2" />
          {location}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-sahara">{price}€</span>
          <button className="btn-outline">Réserver</button>
        </div>
      </div>
    </div>
  )
}

export default HotelCard
