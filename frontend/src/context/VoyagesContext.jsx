import React, { createContext, useContext, useState, useEffect } from 'react';

const VoyagesContext = createContext();

export const VoyagesProvider = ({ children }) => {
  const [voyages, setVoyages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVoyages = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/voyages');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des voyages');
      }
      const data = await response.json();
      setVoyages(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoyages();
  }, []);

  return (
    <VoyagesContext.Provider value={{ voyages, loading, error, refreshVoyages: fetchVoyages }}>
      {children}
    </VoyagesContext.Provider>
  );
};

export const useVoyages = () => {
  const context = useContext(VoyagesContext);
  if (context === undefined) {
    throw new Error('useVoyages must be used within a VoyagesProvider');
  }
  return context;
};
