/**
 * Formate une date en format français
 * @param {Date|string} date - La date à formater
 * @param {Object} options - Options de formatage
 * @returns {string} La date formatée
 */
export const formatDate = (date, options = {}) => {
  if (!date) return 'Date non disponible';
  
  const defaultOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  try {
    // Si la date est une chaîne, on la convertit en objet Date
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return 'Date invalide';
    }
    
    return dateObj.toLocaleDateString('fr-FR', defaultOptions);
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return 'Erreur de formatage';
  }
};

/**
 * Formate un prix avec espacement des milliers et symbole de devise
 * @param {number} price - Le prix à formater
 * @param {string} currency - La devise (MAD par défaut)
 * @returns {string} Le prix formaté
 */
export const formatPrice = (price, currency = 'MAD') => {
  if (price === undefined || price === null) return 'Prix non disponible';
  
  try {
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    return formatter.format(price);
  } catch (error) {
    console.error('Erreur lors du formatage du prix:', error);
    return `${price} ${currency}`;
  }
};

/**
 * Tronque un texte à une longueur maximale et ajoute des points de suspension
 * @param {string} text - Le texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Le texte tronqué
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Génère une classe CSS pour un badge de statut
 * @param {string} status - Le statut (confirmé, en_attente, annulé, etc.)
 * @returns {string} La classe CSS pour le badge
 */
export const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmé':
    case 'confirme':
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'en_attente':
    case 'en attente':
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'annulé':
    case 'annule':
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}; 