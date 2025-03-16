import React from 'react';
import { FaClock, FaUsers, FaCheck } from 'react-icons/fa';

const ActivitySelectionCard = ({ 
  activity, 
  isSelected, 
  onSelect 
}) => {
  return (
    <div 
      className={`relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:-translate-y-1 ${
        isSelected ? 'ring-2 ring-sahara' : ''
      }`}
      onClick={() => onSelect(activity)}
    >
      <div className="h-48 relative">
        <img 
          src={activity.image} 
          alt={activity.title} 
          className="w-full h-full object-cover"
        />
        {isSelected && (
          <div className="absolute top-4 right-4 w-8 h-8 bg-sahara rounded-full flex items-center justify-center">
            <FaCheck className="text-white" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{activity.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{activity.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <span className="flex items-center gap-1">
            <FaClock className="text-sahara" />
            {activity.duration}h
          </span>
          <span className="flex items-center gap-1">
            <FaUsers className="text-sahara" />
            Max {activity.maxParticipants} pers.
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-sahara">{activity.price} MAD</span>
          <button 
            className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
              isSelected 
                ? 'bg-sahara text-white' 
                : 'border border-sahara text-sahara hover:bg-sahara hover:text-white'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(activity);
            }}
          >
            {isSelected ? 'Sélectionné' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivitySelectionCard; 