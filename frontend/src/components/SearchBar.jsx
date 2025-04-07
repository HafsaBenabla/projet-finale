import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaUsers } from 'react-icons/fa'

function SearchBar() {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    destination: '',
    date: '',
    travelers: '1 Voyageur'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Rediriger vers la page des voyages avec les paramètres de recherche
    navigate(`/voyages?destination=${searchData.destination}&date=${searchData.date}&travelers=${searchData.travelers}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-4 flex flex-wrap gap-4">
      <div className="flex-1 min-w-[200px] flex items-center gap-2 text-gray-800">
        <FaMapMarkerAlt className="text-sahara" />
        <input 
          type="text" 
          name="destination" 
          placeholder="Destination" 
          className="w-full p-2 outline-none" 
          value={searchData.destination}
          onChange={handleInputChange}
        />
      </div>
      <div className="flex-1 min-w-[200px] flex items-center gap-2 text-gray-800">
        <FaCalendarAlt className="text-sahara" />
        <input 
          type="date" 
          name="date" 
          className="w-full p-2 outline-none" 
          value={searchData.date}
          onChange={handleInputChange}
        />
      </div>
      <div className="flex-1 min-w-[200px] flex items-center gap-2 text-gray-800">
        <FaUsers className="text-sahara" />
        <select 
          name="travelers" 
          className="w-full p-2 outline-none"
          value={searchData.travelers}
          onChange={handleInputChange}
        >
          <option>1 Voyageur</option>
          <option>2 Voyageurs</option>
          <option>3 Voyageurs</option>
          <option>4+ Voyageurs</option>
        </select>
      </div>
      <button 
        type="submit" 
        className="inline-flex items-center px-6 py-3 bg-sahara text-white font-semibold rounded-full hover:bg-sahara/90 transition-colors duration-300 transform hover:-translate-y-0.5 min-w-[120px]"
      >
        <FaSearch className="mr-2" /> Rechercher
      </button>
    </form>
  )
}

export default SearchBar
