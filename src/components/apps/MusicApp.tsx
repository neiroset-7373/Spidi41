import React, { useState, useRef, useEffect } from 'react';
import './styles/MusicApp.css';

interface MusicAppProps {
  onClose: () => void;
  theme: string;
}

interface Track {
  id: string;
  name: string;
  artist: string;
  url: string;
}

const MusicApp: React.FC<MusicAppProps> = ({ onClose, theme }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedTracks = localStorage.getItem('wintophone_music');
    if (savedTracks) {
      setTracks(JSON.parse(savedTracks));
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const track: Track = {
        id: Date.now().toString() + Math.random().toString(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Локальный файл',
        url,
      };
      setTracks(prev => {
        const updated = [...prev, track];
        localStorage.setItem('wintophone_music', JSON.stringify(updated));
        return updated;
      });
    });
  };

  const playTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play().catch(e => console.error('Ошибка воспроизведения:', e));
        setIsPlaying(true);
      }
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.play().catch(e => console.error('Ошибка воспроизведения:', e));
    }
  }, [currentTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (repeatMode === 'all' || isShuffled) {
      const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
      let nextIndex = isShuffled
        ? Math.floor(Math.random() * tracks.length)
        : (currentIndex + 1) % tracks.length;
      if (tracks[nextIndex]) {
        playTrack(tracks[nextIndex]);
      }
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const deleteTrack = (id: string) => {
    setTracks(prev => {
      const updated = prev.filter(t => t.id !== id);
      localStorage.setItem('wintophone_music', JSON.stringify(updated));
      return updated;
    });
    if (currentTrack?.id === id) {
      setCurrentTrack(null);
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  return (
    <div className={'music-app theme-' + theme}>
      <div className="app-header">
        <button className="back-button" onClick={onClose}>←</button>
        <span className="app-title">Музыка</span>
        <button className="header-button" onClick={() => fileInputRef.current?.click()}>+</button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <div className="music-content">
        {tracks.length === 0 ? (
          <div className="empty-music">
            <span className="empty-icon">🎵</span>
            <span className="empty-text">Нет треков</span>
            <span className="empty-subtext">Нажмите + чтобы добавить музыку</span>
          </div>
        ) : (
          <div className="track-list">
            {tracks.map((track) => (
              <div
                key={track.id}
                className={'track-item ' + (currentTrack?.id === track.id ? 'active' : '')}
                onClick={() => playTrack(track)}
              >
                <div className="track-cover">
                  {currentTrack?.id === track.id && isPlaying ? (
                    <div className="playing-animation">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    '🎵'
                  )}
                </div>
                <div className="track-info">
                  <span className="track-name">{track.name}</span>
                  <span className="track-artist">{track.artist}</span>
                </div>
                <button
                  className="track-delete"
                  onClick={(e) => { e.stopPropagation(); deleteTrack(track.id); }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {currentTrack && (
        <div className="music-player">
          <div className="player-cover">
            <div className="cover-art">🎵</div>
          </div>
          <div className="player-info">
            <span className="player-name">{currentTrack.name}</span>
            <span className="player-artist">{currentTrack.artist}</span>
          </div>
          <div className="player-progress">
            <span className="time-current">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="progress-slider"
            />
            <span className="time-duration">{formatTime(duration)}</span>
          </div>
          <div className="player-controls">
            <button 
              className={'player-btn repeat-btn ' + (repeatMode !== 'off' ? 'active' : '')} 
              onClick={toggleRepeat}
              title={'Повтор: ' + (repeatMode === 'off' ? 'выкл' : repeatMode === 'all' ? 'все' : 'один')}
            >
              {repeatMode === 'one' ? '1' : '⟳'}
            </button>
            <button className="player-btn" onClick={() => setIsShuffled(!isShuffled)} title="Перемешать">
              🔀
            </button>
            <button className="player-btn play-btn" onClick={() => playTrack(currentTrack)}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button className="player-btn" onClick={() => setVolume(v => Math.max(0, v - 0.1))}>🔉</button>
            <button className="player-btn" onClick={() => setVolume(v => Math.min(1, v + 0.1))}>🔊</button>
          </div>
        </div>
      )}

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
    </div>
  );
};

export default MusicApp;
