import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const destinations = [
  {
    id: 1,
    name: 'Marrakech',
    image: 'https://i.pinimg.com/736x/4c/bf/1f/4cbf1f5b6e463f34bb9e71337a4a72b6.jpg',
    description: 'La ville rouge, célèbre pour ses souks et la place Jemaa el-Fna'
  },
  {
    id: 2,
    name: 'Chefchaouen',
    image: 'https://i.pinimg.com/236x/24/14/0c/24140ca8ae24d75c5bb4004307d265e4.jpg',
    description: 'La ville bleue nichée dans les montagnes du Rif'
  },
  {
    id: 3,
    name: 'Fès',
    image: 'https://i.pinimg.com/236x/2d/27/d1/2d27d13abdbe5c99863a189aa39e18b0.jpg',
    description: 'La capitale culturelle avec sa médina millénaire'
  },
  {
    id: 4,
    name: 'Essaouira',
    image: 'https://i.pinimg.com/236x/2b/6d/a5/2b6da5455e9a4990265b06b939887845.jpg',
    description: 'La cité des alizés au bord de l\'océan'
  },
  {
    id: 5,
    name: 'Rabat',
    image: 'https://i.pinimg.com/236x/ae/34/0b/ae340b43d0c7243e61a4e328e6e9309d.jpg',
    description: 'La capitale administrative, mélange de modernité et tradition'
  },
  {
    id: 6,
    name: 'Tanger',
    image: 'https://i.pinimg.com/236x/0b/6d/85/0b6d859d10802e8bfb6da715180435f1.jpg',
    description: 'La porte de l\'Afrique, ville cosmopolite'
  },
  {
    id: 7,
    name: 'Agadir',
    image: 'https://i.pinimg.com/236x/43/8d/98/438d98af94ec18e88b92eb314eec6609.jpg',
    description: 'La station balnéaire aux plages dorées'
  },
  {
    id: 8,
    name: 'Ouarzazate',
    image: 'https://i.pinimg.com/236x/0b/77/76/0b7776713ea85f3cbc97b2289e16a22d.jpg',
    description: 'La porte du désert et ses kasbahs'
  },
  {
    id: 9,
    name: 'Merzouga',
    image: 'https://i.pinimg.com/236x/94/c2/74/94c2746c843628602c37fed233b9a72a.jpg',
    description: 'Les dunes dorées du Sahara'
  },
  {
    id: 10,
    name: 'Asilah',
    image: 'https://i.pinimg.com/236x/30/07/43/300743d4e51420ce07eb822a4bd448d8.jpg',
    description: 'La perle blanche de l\'Atlantique'
  }
];

const Destinations = () => {
  const trackRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    setTimeout(() => {
      track.style.animation = 'scroll 120s linear infinite';
    }, 100);

    const handleMouseEnter = () => {
      track.style.animationPlayState = 'paused';
      track.querySelectorAll('.carousel-item').forEach(item => {
        item.style.animationPlayState = 'paused';
      });
    };

    const handleMouseLeave = () => {
      track.style.animationPlayState = 'running';
      track.querySelectorAll('.carousel-item').forEach(item => {
        item.style.animationPlayState = 'running';
      });
    };

    track.addEventListener('mouseenter', handleMouseEnter);
    track.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      track.removeEventListener('mouseenter', handleMouseEnter);
      track.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleExplore = (cityName) => {
    navigate(`/city/${cityName}`);
  };

  const extendedDestinations = [...destinations, ...destinations];

  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
          Destinations Populaires
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Découvrez les plus belles villes du Maroc, chacune avec son charme unique et son histoire fascinante
        </p>
        
        <div className="carousel-container">
          <div className="carousel-track" ref={trackRef} style={{ animation: 'none' }}>
            {extendedDestinations.map((destination, index) => (
              <div
                key={`${destination.id}-${index}`}
                className="carousel-item"
                style={{ '--parallax-delay': (index % destinations.length) * 0.2 }}
              >
                <div className="destination-card">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                    loading={index < destinations.length ? "eager" : "lazy"}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1553899017-4ff76981e09e?q=80&w=1000&auto=format';
                    }}
                  />
                  <div className="destination-overlay">
                    <div className="destination-content">
                      <h3>{destination.name}</h3>
                      <p>{destination.description}</p>
                      <button 
                        onClick={() => handleExplore(destination.name)}
                        className="mt-4 px-6 py-2 bg-sahara text-white rounded-full text-sm hover:bg-sahara/90 transition-all duration-300 ease-out transform hover:scale-105"
                      >
                        Explorer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Destinations;
