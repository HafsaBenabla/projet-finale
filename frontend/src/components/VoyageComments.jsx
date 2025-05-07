import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaComment, FaPaperPlane, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

const VoyageComments = ({ voyageId, onCommentAdded }) => {
  const { user, isAuthenticated, token } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [voyageId]);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/voyages/${voyageId}/comments`);
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error('Erreur lors du chargement des commentaires:', err);
      setError('Impossible de charger les commentaires. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Veuillez vous connecter pour commenter');
      return;
    }

    if (!newComment.trim()) {
      setError('Le commentaire ne peut pas être vide');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/voyages/${voyageId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newComment,
          userId: user?.userId || user?._id || user?.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
      }

      const newCommentData = await response.json();
      setComments(prevComments => [newCommentData, ...prevComments]);
      setNewComment('');
      setSuccess('Votre commentaire a été publié avec succès!');
      
      // Notifier le parent qu'un commentaire a été ajouté
      if (typeof onCommentAdded === 'function') {
        onCommentAdded();
      }
      
      // Réinitialiser le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Erreur lors de l\'envoi du commentaire:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'envoi du commentaire');
    } finally {
      setSubmitting(false);
    }
  };

  // Fonction pour vérifier si un commentaire appartient à l'utilisateur connecté
  const isUserComment = (comment) => {
    if (!isAuthenticated || !user) return false;
    
    // Récupérer tous les formats possibles d'ID utilisateur
    const currentUserIds = [
      user?.userId, 
      user?._id, 
      user?.id,
      user?.userId?.toString(),
      user?._id?.toString(), 
      user?.id?.toString()
    ].filter(Boolean); // Filtrer les valeurs null/undefined
    
    // Convertir l'ID du commentaire également (si c'est un objet)
    const commentUserIdStr = typeof comment.userId === 'object' ? comment.userId.toString() : comment.userId;
    
    console.log('Vérification du commentaire détaillée:', {
      commentUserId: comment.userId,
      commentUserIdStr: commentUserIdStr,
      commentUserIdType: typeof comment.userId,
      currentUserIds: currentUserIds,
      user: JSON.stringify(user)
    });
    
    // Vérifier si l'un des IDs de l'utilisateur actuel correspond à celui du commentaire
    return currentUserIds.some(id => 
      comment.userId === id || 
      commentUserIdStr === id
    );
  };

  // Fonction pour afficher la boîte de dialogue de confirmation
  const showDeleteConfirmation = (comment) => {
    setCommentToDelete(comment);
    setShowConfirmDialog(true);
  };

  // Fonction pour annuler la suppression
  const cancelDelete = () => {
    setShowConfirmDialog(false);
    setCommentToDelete(null);
  };

  // Fonction modifiée pour la suppression
  const confirmDelete = async () => {
    if (!commentToDelete) return;
    
    await handleDeleteComment(commentToDelete._id);
    setShowConfirmDialog(false);
    setCommentToDelete(null);
  };

  // Fonction pour supprimer un commentaire
  const handleDeleteComment = async (commentId) => {
    if (!isAuthenticated || !token) {
      setError('Vous devez être connecté pour supprimer un commentaire');
      return;
    }

    setDeletingCommentId(commentId);
    setError(null);

    try {
      console.log(`Tentative de suppression du commentaire ${commentId} pour le voyage ${voyageId}`);
      
      // Trouver le commentaire à supprimer pour les logs
      const commentToDelete = comments.find(c => c._id === commentId);
      console.log('Commentaire à supprimer:', {
        commentId,
        commentData: commentToDelete,
        userData: user,
        userIds: [user?.userId, user?._id, user?.id].filter(Boolean),
        tokenInfo: token ? `Token présent (${token.substring(0, 10)}...)` : 'Token absent'
      });
      
      // Vérifier que le token est valide avant de l'utiliser
      const storedToken = localStorage.getItem('token');
      
      // Si le token stocké dans AuthContext ne correspond pas à celui du localStorage, utiliser celui du localStorage
      const finalToken = token === storedToken ? token : storedToken;
      
      if (!finalToken) {
        throw new Error('Votre session a expiré. Veuillez vous reconnecter.');
      }
      
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/voyages/${voyageId}/comments/${commentId}`;
      console.log('URL de l\'API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${finalToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Réponse du serveur:', {
        status: response.status,
        statusText: response.statusText
      });
      
      if (!response.ok) {
        let errorMessage = 'Erreur lors de la suppression du commentaire';
        
        // Gérer spécifiquement les erreurs d'authentification
        if (response.status === 401) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter pour supprimer ce commentaire.';
        }
        
        try {
          const errorData = await response.json();
          console.error('Détails de l\'erreur:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Ignorer l'erreur de parsing JSON si la réponse n'est pas au format JSON
          console.error('Impossible de parser la réponse d\'erreur:', e);
        }
        throw new Error(errorMessage);
      }

      // Supprimer le commentaire de l'état local
      setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
      setSuccess('Commentaire supprimé avec succès');
      
      // Notifier le parent qu'un commentaire a été supprimé
      if (typeof onCommentAdded === 'function') {
        onCommentAdded('delete');
      }
      
      // Réinitialiser le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

    } catch (err) {
      console.error('Erreur lors de la suppression du commentaire:', err);
      setError(err.message || 'Une erreur est survenue lors de la suppression du commentaire');
      
      // Si l'erreur concerne l'authentification, suggérer à l'utilisateur de se reconnecter
      if (err.message.includes('Token') || err.message.includes('session') || err.message.includes('connecter')) {
        setTimeout(() => {
          // Rediriger vers la page de connexion après 3 secondes
          window.location.href = '/login';
        }, 3000);
      }
    } finally {
      setDeletingCommentId(null);
    }
  };

  if (loading && comments.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sahara"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Boîte de dialogue de confirmation */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 transform transition-all">
            <div className="flex items-center justify-center mb-4 text-red-500">
              <FaExclamationTriangle size={48} />
            </div>
            <h3 className="text-xl font-bold text-center mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 text-center mb-6">
              Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire de commentaire */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-sahara/20 flex items-center justify-center">
              <FaUser className="text-sahara" />
            </div>
          </div>
          <div className="flex-grow">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={isAuthenticated ? "Discutez avec les autres voyageurs à propos de cette destination..." : "Connectez-vous pour participer à la discussion..."}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sahara focus:border-transparent transition-all resize-none"
              rows="3"
              disabled={!isAuthenticated || submitting}
            />
            <div className="flex justify-between mt-2">
              {error && (
                <div className="text-red-500 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-green-500 text-sm">
                  {success}
                </div>
              )}
              <button
                type="submit"
                disabled={!newComment.trim() || !isAuthenticated || submitting}
                className="bg-sahara text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-sahara/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Envoi...</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    <span>Envoyer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Liste des commentaires */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-sahara/20 flex items-center justify-center">
                  <FaUser className="text-sahara" />
                </div>
              </div>
              <div className="flex-grow relative">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{comment.userName}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
                
                {/* Bouton de suppression modifié */}
                {isUserComment(comment) && (
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => showDeleteConfirmation(comment)}
                      className="text-gray-400 hover:text-red-500 bg-white p-1 rounded-full opacity-70 hover:opacity-100 transition-all"
                      title="Supprimer ce commentaire"
                      disabled={deletingCommentId === comment._id}
                    >
                      {deletingCommentId === comment._id ? (
                        <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full" />
                      ) : (
                        <FaTrash className="text-sm" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FaComment className="mx-auto text-4xl mb-4 text-sahara/50" />
            <p>Soyez le premier à commenter ce voyage !</p>
          </div>
        )}
      </div>

      {/* Bouton pour charger à nouveau les commentaires en cas d'erreur */}
      {error && comments.length === 0 && (
        <div className="text-center">
          <button 
            onClick={fetchComments}
            className="mt-4 px-4 py-2 bg-sahara/20 text-sahara rounded-lg hover:bg-sahara/30 transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}
    </div>
  );
};

export default VoyageComments; 