import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { doc, updateDoc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

const Post = ({ post }) => {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);

  useEffect(() => {
    // Fonction pour initialiser ou récupérer les données
    const initializePost = async () => {
      try {
        const postRef = doc(db, "posts", post.id.toString());
        const postDoc = await getDoc(postRef);
        
        if (postDoc.exists()) {
          // Si le document existe, on met à jour l'état avec les données existantes
          setLikes(postDoc.data().likes || 0);
          setDislikes(postDoc.data().dislikes || 0);
        } else {
          // Si le document n'existe pas, on le crée avec des valeurs initiales
          await setDoc(postRef, {
            likes: 0,
            dislikes: 0
          });
        }

        // Écouter les changements en temps réel
        const unsubscribe = onSnapshot(postRef, (doc) => {
          if (doc.exists()) {
            setLikes(doc.data().likes || 0);
            setDislikes(doc.data().dislikes || 0);
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
      }
    };

    initializePost();
  }, [post.id]);

  const handleLike = async () => {
    try {
      const postRef = doc(db, "posts", post.id.toString());
      const postDoc = await getDoc(postRef);
      
      if (postDoc.exists()) {
        await updateDoc(postRef, {
          likes: (postDoc.data().likes || 0) + 1
        });
      }
    } catch (error) {
      console.error("Erreur lors du like:", error);
    }
  };

  const handleDislike = async () => {
    try {
      const postRef = doc(db, "posts", post.id.toString());
      const postDoc = await getDoc(postRef);
      
      if (postDoc.exists()) {
        await updateDoc(postRef, {
          dislikes: (postDoc.data().dislikes || 0) + 1
        });
      }
    } catch (error) {
      console.error("Erreur lors du dislike:", error);
    }
  };

  return (
    <div className="post-container">
      {/* ... existing post content ... */}
      
      <div className="post-actions">
        <button onClick={handleLike} className="like-button">
          👍 {likes}
        </button>
        <button onClick={handleDislike} className="dislike-button">
          👎 {dislikes}
        </button>
      </div>
    </div>
  );
};

export default Post; 