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
      <button className="btn-primary min-w-[120px]">
        <FaSearch className="mr-2" /> Rechercher
      </button>
    </div>
  )
}

export default SearchBar
