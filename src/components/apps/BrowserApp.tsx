import React, { useState } from 'react';
import './styles/BrowserApp.css';

interface BrowserAppProps {
  onClose: () => void;
  theme: string;
}

const BrowserApp: React.FC<BrowserAppProps> = ({ onClose, theme }) => {
  const [url, setUrl] = useState('https://www.bing.com');
  const [inputUrl, setInputUrl] = useState('bing.com');

  const handleNavigate = () => {
    let navUrl = inputUrl.trim();
    if (!navUrl.startsWith('http')) {
      navUrl = 'https://' + navUrl;
    }
    setUrl(navUrl);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleNavigate();
  };

  return (
    <div className={`browser-app theme-${theme}`}>
      <div className="browser-header">
        <button className="back-button" onClick={onClose}>←</button>
        <div className="browser-address-bar">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите адрес..."
          />
          <button className="browser-go" onClick={handleNavigate}>➤</button>
        </div>
      </div>
      <div className="browser-content">
        <iframe
          src={url}
          title="Browser"
          className="browser-frame"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    </div>
  );
};

export default BrowserApp;
