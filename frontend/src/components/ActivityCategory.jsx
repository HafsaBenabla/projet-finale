import React from 'react';
import { FaArrowRight } from 'react-icons/fa';

const ActivityCategory = ({ 
  icon: Icon, 
  title, 
  description, 
  image, 
  tags, 
  onClick 
}) => (
  <div 
    className="group relative overflow-hidden rounded-2xl shadow-xl cursor-pointer transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl bg-white"
    onClick={onClick}
  >
    <div className="h-80">
      <img 
        src={image}
        alt={title}
        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90">
        <div className="absolute top-6 left-6 bg-sahara text-white text-sm py-1.5 px-4 rounded-full font-medium flex items-center gap-2 shadow-lg">
          <Icon className="text-lg" />
          <span>{title === 'Activités de Voyage' ? 'Circuits complets' : 'Weekend'}</span>
        </div>
      </div>
    </div>
    
    <div className="p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-sahara transition-colors">{title}</h3>
      <p className="text-gray-600 mb-6 line-clamp-2">
        {description}
      </p>
      
      <div className="flex flex-wrap gap-4 mb-6">
        {tags.map((tag, index) => (
          <span key={index} className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-700">
            {tag.icon} {tag.text}
          </span>
        ))}
      </div>
      
      <button className="w-full py-3 bg-sahara text-white rounded-full flex items-center justify-center gap-2 font-medium hover:bg-sahara/90 transition-colors">
        Découvrir <FaArrowRight className="text-lg" />
      </button>
    </div>
  </div>
);

export default ActivityCategory; 