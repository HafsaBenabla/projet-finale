import React from 'react'

function DestinationCard({ name, image }) {
  return (
    <div className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer">
      <div className="h-48">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
        <h3 className="text-white text-xl font-semibold">{name}</h3>
      </div>
    </div>
  )
}

export default DestinationCard
