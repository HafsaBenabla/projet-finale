import React from 'react'
import { useNavigate } from 'react-router-dom'

function ActivityCard({ id, name, image }) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/activities/${id}`)
  }

  return (
    <div 
      className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer"
      onClick={handleClick}
    >
      <div className="h-40">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
        <h3 className="text-white text-base font-semibold">{name}</h3>
      </div>
    </div>
  )
}

export default ActivityCard
