import React, { useRef, useState, useEffect } from 'react';
import './styles/Camera.css';

interface CameraAppProps {
  onClose: () => void;
  theme: string;
}

const CameraApp: React.FC<CameraAppProps> = ({ onClose, theme }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  const startCamera = async () => {
    try {
      setError(null);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Ошибка доступа к камере:', err);
      setError('Не удалось получить доступ к камере. Проверьте разрешения.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      setFlash(true);
      setTimeout(() => setFlash(false), 150);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        context.drawImage(video, 0, 0);

        const photoData = canvas.toDataURL('image/png');
        
        const savedPhotos = localStorage.getItem('wintophone_photos');
        const photos = savedPhotos ? JSON.parse(savedPhotos) : [];
        photos.push(photoData);
        localStorage.setItem('wintophone_photos', JSON.stringify(photos));

        const link = document.createElement('a');
        link.download = `photo-${Date.now()}.png`;
        link.href = photoData;
        link.click();
      }
    }
  };

  return (
    <div className={`camera-app theme-${theme}`}>
      <div className="camera-header">
        <button className="back-button" onClick={onClose}>←</button>
        <span className="camera-mode">Камера</span>
        <div className="header-spacer" />
      </div>

      <div className="camera-viewfinder">
        {error ? (
          <div className="camera-error">
            <span className="error-icon">📷</span>
            <p>{error}</p>
            <button className="retry-button" onClick={startCamera}>Попробовать снова</button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-video"
          />
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        {flash && <div className="camera-flash" />}
      </div>

      <div className="camera-controls">
        <button className="camera-button gallery-btn" onClick={() => { onClose(); setTimeout(() => window.dispatchEvent(new CustomEvent('openApp', { detail: 'gallery' })), 100); }}>
          <span>🖼️</span>
        </button>
        <button className="camera-button shutter-btn" onClick={takePhoto}>
          <div className="shutter-inner" />
        </button>
        <button className="camera-button switch-btn" onClick={switchCamera}>
          <span>🔄</span>
        </button>
      </div>
    </div>
  );
};

export default CameraApp;
