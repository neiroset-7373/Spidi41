import React, { useState, useEffect } from 'react';
import './styles/GalleryApp.css';

interface GalleryAppProps {
  onClose: () => void;
  theme: string;
}

const GalleryApp: React.FC<GalleryAppProps> = ({ onClose, theme }) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    const savedPhotos = localStorage.getItem('wintophone_photos');
    if (savedPhotos) {
      setPhotos(JSON.parse(savedPhotos));
    }
  }, []);

  const handleDeletePhoto = (photo: string) => {
    const newPhotos = photos.filter(p => p !== photo);
    setPhotos(newPhotos);
    localStorage.setItem('wintophone_photos', JSON.stringify(newPhotos));
    setSelectedPhoto(null);
  };

  if (selectedPhoto) {
    return (
      <div className={`gallery-app theme-${theme}`}>
        <div className="app-header">
          <button className="back-button" onClick={() => setSelectedPhoto(null)}>←</button>
          <span className="app-title">Фото</span>
          <button className="header-button" onClick={() => handleDeletePhoto(selectedPhoto)}>🗑️</button>
        </div>
        <div className="photo-viewer">
          <img src={selectedPhoto} alt="Фото" className="full-photo" />
        </div>
      </div>
    );
  }

  return (
    <div className={`gallery-app theme-${theme}`}>
      <div className="app-header">
        <button className="back-button" onClick={onClose}>←</button>
        <span className="app-title">Галерея</span>
        <div className="header-spacer" />
      </div>
      <div className="gallery-content">
        {photos.length === 0 ? (
          <div className="empty-gallery">
            <span className="empty-icon">🖼️</span>
            <span className="empty-text">Нет фотографий</span>
            <span className="empty-subtext">Сделайте снимок с помощью камеры</span>
          </div>
        ) : (
          <div className="photo-grid">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="photo-item"
                onClick={() => setSelectedPhoto(photo)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <img src={photo} alt={`Фото ${index + 1}`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryApp;
