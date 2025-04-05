import React from 'react';
import { Link } from 'react-router-dom';
import { FaGlobeAfrica } from 'react-icons/fa';

const HomeSection = () => {
  return (
    <div className="flex items-center justify-center bg-white rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg border border-gray-100 hover:border-orange-200/50">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-orange-100 flex items-center justify-center shadow-sm border border-orange-200">
          <FaGlobeAfrica className="text-orange-500" size={18} />
        </div>
        <h3 className="font-light text-base text-gray-800">Toutes les villes</h3>
      </div>
    </div>
  );
};

export default HomeSection; 