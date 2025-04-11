import React, { useState, useEffect } from 'react';
import { FaUser, FaStar, FaPaperPlane, FaClock, FaTrash, FaSpinner } from 'react-icons/fa';
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
  const [rating, setRating] = useState(5);
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
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/comments/voyage/${voyageId}`);
      setComments(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des commentaires:', err);
      setError('Impossible de charger les commentaires');
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
        text: newComment,
        rating,
        voyageId,
        userId: user._id
      };
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/comments`,
        commentData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Ajouter le nouveau commentaire à la liste
      setComments([response.data, ...comments]);
      
      // Réinitialiser le formulaire
      setNewComment('');
      setRating(5);
      
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
      
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/comments/${commentId}`,
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
          
          {/* Sélection d'étoiles pour la note */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Votre note</label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none p-1"
                >
                  <FaStar 
                    className={`text-xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
            </div>
          </div>
          
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
                      <h4 className="font-medium text-gray-800">
                        {comment.user?.firstName} {comment.user?.lastName}
                      </h4>
                      <div className="flex items-center text-sm text-gray-500">
                        <FaClock className="mr-1" />
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`${
                            i < comment.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    
                    {/* Bouton de suppression (visible uniquement pour l'auteur) */}
                    {isAuthenticated && user?._id === comment.user?._id && (
                      <button
                        onClick={() => handleDelete(comment._id)}
                        disabled={deleting === comment._id}
                        className="ml-4 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                        title="Supprimer ce commentaire"
                      >
                        {deleting === comment._id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 text-gray-700">
                  <p>{comment.text}</p>
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