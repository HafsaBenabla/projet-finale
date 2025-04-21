import React, { useState, useEffect } from 'react';
import { FaUser, FaPaperPlane, FaClock, FaTrash, FaSpinner, FaCalendarAlt, FaUserCircle } from 'react-icons/fa';
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
  const [commentToDelete, setCommentToDelete] = useState(null);

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

  // Fonction pour ouvrir la modal de confirmation pour supprimer un commentaire
  const confirmDelete = (commentId) => {
    setCommentToDelete(commentId);
  };

  // Fonction pour fermer la modal sans action
  const cancelDelete = () => {
    setCommentToDelete(null);
  };

  // Fonction pour supprimer un commentaire
  const handleDelete = async (commentId) => {
    try {
      setDeleting(commentId);
      setCommentToDelete(null); // Fermer la modal de confirmation
      
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
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Tous les commentaires ({comments.length})</h3>
        
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment._id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-sahara/20 flex items-center justify-center">
                      <FaUserCircle className="h-8 w-8 text-sahara" />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold">
                        {comment.user?.firstName || comment.user?.name || 'Utilisateur'}
                        {comment.user?.lastName && ` ${comment.user.lastName}`}
                      </h4>
                      <p className="text-sm text-gray-500">{comment.user?.email || 'Anonyme'}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    {/* Bouton de suppression (visible uniquement pour l'auteur) */}
                    {isAuthenticated && user?._id === comment.user?._id && (
                      <button
                        onClick={() => confirmDelete(comment._id)}
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
      
      {/* Modal de confirmation de suppression */}
      {commentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-slideUp">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
                <FaTrash className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Supprimer ce commentaire ?</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(commentToDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <FaTrash className="mr-2" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection; 