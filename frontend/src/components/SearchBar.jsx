import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaChevronDown } from 'react-icons/fa'

// Liste des destinations populaires au Maroc
const destinations = [
  "Marrakech",
  "Casablanca",
  "Fès",
  "Rabat",
  "Tanger",
  "Agadir",
  "Chefchaouen",
  "Essaouira",
  "Ouarzazate",
  "Merzouga",
  "Dakhla",
  "Tétouan",
  "Ifrane",
  "Meknès",
  "Oujda"
];

function SearchBar() {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    destination: '',
    date: '',
    travelers: '1 Voyageur'
  });
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const destinationRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDestinationSelect = (destination) => {
    setSearchData(prev => ({
      ...prev,
      destination
    }));
    setIsDestinationOpen(false);
  };

  const handleClickOutside = (event) => {
    if (destinationRef.current && !destinationRef.current.contains(event.target)) {
      setIsDestinationOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/voyages?destination=${searchData.destination}&date=${searchData.date}&travelers=${searchData.travelers}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-4 flex flex-wrap gap-4">
      <div className="flex-1 min-w-[200px] relative" ref={destinationRef}>
        <div 
          className="flex items-center gap-2 text-gray-800 p-3 cursor-pointer relative h-[46px]"
          onClick={() => setIsDestinationOpen(!isDestinationOpen)}
        >
          <FaMapMarkerAlt className="text-sahara text-xl" />
          <div className="flex-grow">
            <input
              type="text"
              readOnly
              placeholder="Destination"
              className="w-full outline-none cursor-pointer bg-transparent"
              value={searchData.destination}
            />
          </div>
          <FaChevronDown className={`text-gray-400 transition-transform duration-200 ${isDestinationOpen ? 'transform rotate-180' : ''}`} />
        </div>
        
        {/* Liste déroulante personnalisée */}
        {isDestinationOpen && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-[200px] overflow-y-auto custom-scrollbar">
            {destinations.map((destination) => (
              <div
                key={destination}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700 transition-colors"
                onClick={() => handleDestinationSelect(destination)}
              >
                {destination}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-[200px] flex items-center gap-2 text-gray-800 h-[46px]">
        <div className="flex items-center gap-2 w-full h-full px-3">
          <FaCalendarAlt className="text-sahara text-xl" />
          <input 
            type="date" 
            name="date" 
            className="w-full outline-none h-full" 
            value={searchData.date}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="flex-1 min-w-[200px] relative h-[46px]">
        <div className="flex items-center gap-2 text-gray-800 h-full px-3">
          <FaUsers className="text-sahara text-xl" />
          <div className="relative w-full h-full flex items-center">
            <select 
              name="travelers" 
              className="w-full outline-none appearance-none cursor-pointer bg-transparent h-full"
              value={searchData.travelers}
              onChange={handleInputChange}
              style={{ 
                WebkitAppearance: 'none',
                MozAppearance: 'none' 
              }}
            >
              <option>1 Voyageur</option>
              <option>2 Voyageurs</option>
              <option>3 Voyageurs</option>
              <option>4+ Voyageurs</option>
            </select>
            <FaChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        className="inline-flex items-center px-6 py-3 bg-sahara text-white font-semibold rounded-full hover:bg-sahara/90 transition-colors duration-300 transform hover:-translate-y-0.5 min-w-[120px] h-[46px]"
      >
        <FaSearch className="mr-2" /> Rechercher
      </button>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E4A853;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d19544;
        }

        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          filter: invert(60%) sepia(93%) saturate(1352%) hue-rotate(0deg) brightness(119%) contrast(119%);
        }
      `}</style>
    </form>
  )
}

export default SearchBar
