import React, { useState, useEffect } from 'react';
import { FaUser, FaPaperPlane, FaClock, FaTrash, FaSpinner, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

/**
 * Composant de section de commentaires
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.voyageId - L'ID du voyage concerné
 * @param {Function} [props.onCommentAdded] - Callback appelé quand un commentaire est ajouté/supprimé
 * @returns {JSX.Element} Le composant CommentSection
 */
const CommentSection = ({ voyageId }) => {
  const { user, isAuthenticated, token } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Récupérer les commentaires au chargement du composant
  useEffect(() => {
    fetchComments();
  }, [voyageId]);

  // Fonction pour récupérer les commentaires
  const fetchComments = async () => {
    try {
      setLoading(true);
      console.log("Récupération des commentaires pour le voyage ID:", voyageId);
      
      // S'assurer que l'ID du voyage est valide
      if (!voyageId) {
        console.error("ID de voyage invalide:", voyageId);
        setError("ID de voyage invalide");
        setLoading(false);
        return;
      }

      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/voyages/${voyageId}/comments`;
      console.log("URL de l'API pour récupérer les commentaires:", apiUrl);
      
      // Ajouter un timeout pour s'assurer que la requête ne bloque pas indéfiniment
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout
      
      console.log("Tentative de récupération des commentaires avec axios...");
      const response = await axios.get(apiUrl, { 
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      
      console.log("Réponse brute du serveur:", response);
      console.log("Status de la réponse:", response.status);
      console.log("Commentaires récupérés:", response.data);
      
      if (Array.isArray(response.data)) {
        console.log(`${response.data.length} commentaires trouvés`);
        setComments(response.data);
      } else {
        console.error("Les données reçues ne sont pas un tableau:", response.data);
        setComments([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des commentaires:', err);
      console.error('Message d\'erreur:', err.message);
      if (err.response) {
        console.error('Données de réponse d\'erreur:', err.response.data);
        console.error('Statut d\'erreur:', err.response.status);
        console.error('En-têtes d\'erreur:', err.response.headers);
      }
      setError(`Impossible de charger les commentaires: ${err.message}`);
      
      // Alternative : essayer de récupérer avec fetch
      try {
        console.log("Tentative avec l'API Fetch comme alternative...");
        const fetchResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/voyages/${voyageId}/comments`);
        console.log("Statut fetch:", fetchResponse.status);
        
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          console.log("Données récupérées avec fetch:", data);
          if (Array.isArray(data)) {
            setComments(data);
            setError(null);
          }
        } else {
          console.error("Échec de la requête fetch:", fetchResponse.statusText);
        }
      } catch (fetchErr) {
        console.error("Erreur avec fetch également:", fetchErr);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour soumettre un nouveau commentaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    if (!isAuthenticated) {
      setError('Vous devez être connecté pour laisser un commentaire');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const commentData = {
        content: newComment,  // Changer text en content pour correspondre au modèle de données
        voyageId,
        userId: user._id
      };
      
      console.log("Envoi d'un nouveau commentaire:", commentData);
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/voyages/${voyageId}/comments`;
      console.log("URL de l'API pour ajouter un commentaire:", apiUrl);
      
      const response = await axios.post(
        apiUrl,
        commentData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log("Réponse du serveur après ajout du commentaire:", response.data);
      
      // Ajouter le nouveau commentaire à la liste
      setComments([response.data, ...comments]);
      
      // Réinitialiser le formulaire
      setNewComment('');
      
      // Notification du commentaire ajouté
      console.log('Commentaire ajouté avec succès');
      
    } catch (err) {
      console.error('Erreur lors de l\'ajout du commentaire:', err);
      setError('Impossible d\'ajouter votre commentaire');
    } finally {
      setSubmitting(false);
    }
  };

  // Fonction pour supprimer un commentaire
  const handleDelete = async (commentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }
    
    try {
      setDeleting(commentId);
      
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/comments/${commentId}`;
      console.log("URL de l'API pour supprimer un commentaire:", apiUrl);
      
      await axios.delete(
        apiUrl,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Mettre à jour la liste des commentaires
      setComments(comments.filter(comment => comment._id !== commentId));
      console.log('Commentaire supprimé avec succès');
      
    } catch (err) {
      console.error('Erreur lors de la suppression du commentaire:', err);
      setError('Impossible de supprimer le commentaire');
    } finally {
      setDeleting(null);
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="space-y-6">
      {/* Formulaire de commentaire */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Ajouter un commentaire</h3>
          
          {/* Champ de texte du commentaire */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Votre commentaire</label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sahara focus:border-transparent transition-all resize-none"
              rows="4"
              placeholder="Partagez votre expérience..."
              required
            ></textarea>
          </div>
          
          {/* Bouton de soumission */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="bg-sahara text-white px-4 py-2 rounded-md hover:bg-sahara/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  Publier
                </>
              )}
            </button>
          </div>
          
          {/* Message d'erreur */}
          {error && (
            <div className="mt-2 text-sm text-red-600">
              {error}
            </div>
          )}
        </form>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-gray-600 mb-2">Vous devez être connecté pour laisser un commentaire</p>
          <a href="/login" className="text-sahara hover:underline">Se connecter</a>
        </div>
      )}

      {/* Liste des commentaires */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold mb-3">
          {comments.length} Commentaire{comments.length !== 1 ? 's' : ''}
        </h3>
        
        {loading ? (
          <div className="flex justify-center py-4">
            <FaSpinner className="animate-spin text-sahara text-xl" />
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="bg-gray-100 p-2 rounded-full">
                      {comment.user?.avatar ? (
                        <img
                          src={comment.user.avatar}
                          alt={comment.user.firstName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <FaUser className="text-xl text-gray-500" />
                      )}
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-800 text-base">
                        {comment.user?.firstName || comment.userName || 'Utilisateur'}
                      </h4>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    {/* Bouton de suppression (visible uniquement pour l'auteur) */}
                    {isAuthenticated && user?._id === comment.user?._id && (
                      <button
                        onClick={() => handleDelete(comment._id)}
                        disabled={deleting === comment._id}
                        className="text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Supprimer ce commentaire"
                      >
                        {deleting === comment._id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    )}
                    <div className="text-sm text-gray-500 mt-1">
                      <div className="flex items-center">
                        <FaCalendarAlt className="text-sahara mr-1 text-xs" />
                        <span className="text-xs">{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-gray-700">
                  <p>{comment.content || comment.text || 'Aucun contenu'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              Aucun commentaire pour ce voyage. Soyez le premier à partager votre expérience !
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection; 