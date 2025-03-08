import React from 'react'
import { useNavigate } from 'react-router-dom'

function DestinationCard({ name, image }) {
  const navigate = useNavigate();

  const handleExplore = (e) => {
    e.stopPropagation();
    navigate(`/city/${name}`);
  };

  return (
    <div className="group relative overflow-hidden rounded-xl shadow-lg">
      <div className="h-48">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4">
        <h3 className="text-white text-xl font-semibold mb-3">{name}</h3>
        <button 
          onClick={handleExplore}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 w-full"
        >
          Explorer
        </button>
      </div>
    </div>
  )
}

export default DestinationCard
