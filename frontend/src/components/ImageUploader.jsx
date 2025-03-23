import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ImageUploader = ({ onImageUpload, multiple = false, maxFiles = 5 }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const uploadFile = async (file) => {
    setLoading(true);
    setError('');
    console.log('Début de l\'upload du fichier:', file.name);

    try {
      const formData = new FormData();
      formData.append('image', file);

      console.log('Envoi de la requête au serveur...');
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Réponse reçue:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur serveur:', errorText);
        throw new Error(`Erreur serveur: ${errorText}`);
      }

      const data = await response.json();
      console.log('Données reçues du serveur:', data);

      if (!data.imageUrl) {
        throw new Error('URL de l\'image non reçue du serveur');
      }

      // Extraire le chemin relatif de l'URL complète
      const relativePath = `/uploads/${data.imageUrl.split('/uploads/')[1]}`;
      console.log('Chemin relatif de l\'image:', relativePath);
      
      onImageUpload(relativePath);
      console.log('Upload réussi:', relativePath);
      return relativePath;
    } catch (err) {
      console.error('Erreur détaillée:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });

      let errorMessage = 'Une erreur est survenue lors de l\'upload';
      
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Impossible de contacter le serveur. Vérifiez que le serveur est démarré sur le port 5000.';
      } else if (err.message.includes('NetworkError')) {
        errorMessage = 'Erreur réseau. Vérifiez votre connexion internet.';
      } else {
        errorMessage = `Erreur: ${err.message}`;
      }

      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    console.log('Fichiers sélectionnés:', files.map(f => ({ name: f.name, type: f.type, size: f.size })));
    
    // Validation des fichiers
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setError('Veuillez sélectionner uniquement des images (JPG, PNG)');
      return;
    }

    if (multiple && files.length > maxFiles) {
      setError(`Vous ne pouvez uploader que ${maxFiles} images maximum`);
      return;
    }

    try {
      // Upload immédiat du fichier
      if (!multiple && files.length > 0) {
        const preview = URL.createObjectURL(files[0]);
        setPreviews([preview]);
        setSelectedFiles([files[0]]);
        await uploadFile(files[0]);
      } else if (multiple) {
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
        setSelectedFiles(prev => [...prev, ...files]);
        
        // Upload de tous les fichiers
        const uploadPromises = files.map(file => uploadFile(file));
        const urls = await Promise.all(uploadPromises);
        const validUrls = urls.filter(url => url !== null);
        if (validUrls.length > 0) {
          onImageUpload(validUrls);
        }
      }
    } catch (err) {
      console.error('Erreur lors de la sélection/upload:', err);
      setError('Erreur lors du traitement des fichiers');
    }
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col items-center justify-center w-full">
        <label className={`w-full flex flex-col items-center px-4 py-6 bg-sahara bg-opacity-10 text-sahara rounded-lg border-2 border-dashed border-sahara cursor-pointer hover:bg-sahara hover:bg-opacity-20 transition-all ${loading ? 'opacity-50' : ''}`}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {loading ? (
              <svg className="animate-spin h-10 w-10 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
            <p className="mb-2 text-sm font-semibold">
              {loading ? 'Upload en cours...' : (multiple ? 'Cliquez pour sélectionner des images' : 'Cliquez pour sélectionner une image')}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG ou JPEG (MAX. {multiple ? `${maxFiles} fichiers` : '1 fichier'})
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
            disabled={loading}
          />
        </label>

        {error && (
          <div className="mt-4 w-full p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {previews.length > 0 && (
          <div className="mt-4 w-full">
            <div className="grid grid-cols-3 gap-4">
              {previews.map((preview, index) => (
                <div key={preview} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ImageUploader.propTypes = {
  onImageUpload: PropTypes.func.isRequired,
  multiple: PropTypes.bool,
  maxFiles: PropTypes.number,
};

export default ImageUploader; 