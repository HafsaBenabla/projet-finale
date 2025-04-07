import React, { createContext, useContext, useState, useEffect } from 'react';

const VoyagesContext = createContext();

export const VoyagesProvider = ({ children }) => {
  // Récupérer les voyages du localStorage au chargement initial
  const getInitialVoyages = () => {
    try {
      const savedVoyages = localStorage.getItem('voyages');
      return savedVoyages ? JSON.parse(savedVoyages) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération du cache:', error);
      return [];
    }
  };

  const [voyages, setVoyages] = useState(getInitialVoyages);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(localStorage.getItem('lastVoyagesFetchTime') || 0);

  const fetchVoyages = async (forceRefresh = false) => {
    try {
      // Vérifier si le cache est récent (moins de 5 minutes) et non forcé
      const currentTime = Date.now();
      const cacheAge = currentTime - lastFetchTime;
      const cacheIsValid = cacheAge < 5 * 60 * 1000; // 5 minutes en millisecondes
      
      // Si le cache est valide et non forcé, ne pas charger depuis le serveur
      if (voyages.length > 0 && cacheIsValid && !forceRefresh) {
        console.log('Utilisation du cache récent');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      console.log('Chargement des voyages depuis l\'API...');
      
      const response = await fetch('http://localhost:5000/api/voyages');
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des voyages: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`${data.length} voyages récupérés`);
      
      // Sauvegarder les voyages dans localStorage
      try {
        localStorage.setItem('voyages', JSON.stringify(data));
        localStorage.setItem('lastVoyagesFetchTime', currentTime.toString());
        setLastFetchTime(currentTime);
      } catch (storageError) {
        console.error('Erreur lors de la sauvegarde dans localStorage:', storageError);
      }
      
      setVoyages(data);
      setError(null);
    } catch (err) {
      console.error('Erreur de récupération des voyages:', err);
      setError(err.message);
      
      // Si erreur, utiliser les données mises en cache si disponibles
      const cachedVoyages = getInitialVoyages();
      if (cachedVoyages.length > 0) {
        console.log('Utilisation des données en cache suite à une erreur');
        setVoyages(cachedVoyages);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour mettre à jour un voyage spécifique après modification dans le dashboard
  const updateVoyageInContext = (updatedVoyage) => {
    console.log('Mise à jour du voyage dans le contexte:', updatedVoyage);
    
    // Mettre à jour le voyage dans le tableau des voyages
    setVoyages(prevVoyages => {
      const updatedVoyages = prevVoyages.map(voyage => 
        voyage._id === updatedVoyage._id ? updatedVoyage : voyage
      );
      
      // Mettre à jour le localStorage avec les nouvelles données
      try {
        const currentTime = Date.now();
        localStorage.setItem('voyages', JSON.stringify(updatedVoyages));
        localStorage.setItem('lastVoyagesFetchTime', currentTime.toString());
        setLastFetchTime(currentTime);
        
        // Déclencher un événement personnalisé pour notifier les autres composants
        const event = new CustomEvent('voyagesUpdated', { 
          detail: { 
            updatedVoyage: updatedVoyage,
            timestamp: currentTime
          } 
        });
        window.dispatchEvent(event);
        
      } catch (storageError) {
        console.error('Erreur lors de la mise à jour du cache:', storageError);
      }
      
      return updatedVoyages;
    });
  };
  
  // Fonction pour effacer le cache et forcer un rechargement
  const clearCache = () => {
    console.log('Effacement du cache des voyages');
    localStorage.removeItem('voyages');
    localStorage.removeItem('lastVoyagesFetchTime');
    setLastFetchTime(0);
    fetchVoyages(true);
  };

  // Effet lors du montage du composant
  useEffect(() => {
    console.log('VoyagesContext initialisé');
    
    // Si des voyages sont déjà en cache, afficher immédiatement
    if (voyages.length > 0) {
      setLoading(false);
    }
    
    // Toujours chercher les dernières données
    fetchVoyages();
    
    // Nettoyer au démontage
    return () => {
      console.log('VoyagesContext démonté');
    };
  }, []);
  
  // Écouter les événements de stockage pour synchroniser entre les onglets/fenêtres
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'voyages' || e.key === 'lastVoyagesFetchTime') {
        console.log('Changement détecté dans localStorage, synchronisation des données');
        fetchVoyages(true);
      }
    };
    
    // Écouter l'événement personnalisé voyagesUpdated
    const handleVoyagesUpdated = (e) => {
      console.log('Événement voyagesUpdated détecté', e.detail);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('voyagesUpdated', handleVoyagesUpdated);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('voyagesUpdated', handleVoyagesUpdated);
    };
  }, []);

  // Exposer le contexte
  const contextValue = {
    voyages,
    loading,
    error,
    lastFetchTime,
    refreshVoyages: () => fetchVoyages(true),
    updateVoyageInContext,
    clearCache
  };

  return (
    <VoyagesContext.Provider value={contextValue}>
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
