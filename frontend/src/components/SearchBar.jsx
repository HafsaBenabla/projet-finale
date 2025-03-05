import React from 'react'
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaUsers } from 'react-icons/fa'

function SearchBar() {
  return (
    <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-4 flex flex-wrap gap-4">
      <div className="flex-1 min-w-[200px] flex items-center gap-2 text-gray-800">
        <FaMapMarkerAlt className="text-sahara" />
        <input type="text" placeholder="Destination" className="w-full p-2 outline-none" />
      </div>
      <div className="flex-1 min-w-[200px] flex items-center gap-2 text-gray-800">
        <FaCalendarAlt className="text-sahara" />
        <input type="date" className="w-full p-2 outline-none" />
      </div>
      <div className="flex-1 min-w-[200px] flex items-center gap-2 text-gray-800">
        <FaUsers className="text-sahara" />
        <select className="w-full p-2 outline-none">
          <option>1 Voyageur</option>
          <option>2 Voyageurs</option>
          <option>3 Voyageurs</option>
          <option>4+ Voyageurs</option>
        </select>
      </div>
      <button className="inline-flex items-center px-6 py-3 bg-sahara text-white font-semibold rounded-full hover:bg-sahara/90 transition-colors duration-300 transform hover:-translate-y-0.5 min-w-[120px]">
        <FaSearch className="mr-2" /> Rechercher
      </button>
    </div>
  )
}

export default SearchBar
