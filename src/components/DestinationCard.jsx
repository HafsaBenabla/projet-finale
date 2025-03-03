import React from 'react'

function DestinationCard({ name, image }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl cursor-pointer">
      <div className="aspect-w-16 aspect-h-9">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
        <h3 className="text-white text-2xl font-bold">{name}</h3>
      </div>
    </div>
  )
}

export default DestinationCard
