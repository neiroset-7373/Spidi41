import React, { useState, useEffect } from 'react';
import './styles/QwertyApps.css';

interface QwertyAppsProps {
  onClose: () => void;
  theme: string;
  onAppInstalled: (app: { id: string; name: string; icon: string }) => void;
  onOpenApp?: (appId: string) => void;
}

interface AppItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  size: string;
  rating: number;
  category: string;
}

const getAvailableApps = (): AppItem[] => {
  const iconStyle = localStorage.getItem('wintophone_icon_style') || 'android';
  const getIcon = (app: string): string => {
    if (iconStyle === 'wintozo') {
      const wintozoIcons: Record<string, string> = {
        camera: 'camera.jpeg', gallery: 'gallery_App.png', messages: 'messeges.png',
        dialer: 'phone.jpg', browser: 'browser.png', music: 'music.png', notes: 'zametki.png',
        calculator: 'calculator.png', settings: 'settings.png', qwerty_apps: 'qwerty_Apps.png',
      };
      if (wintozoIcons[app]) return '/apps_icons/system/Wintozo Syle/' + wintozoIcons[app];
    }
    const androidIcons: Record<string, string> = {
      camera: 'camera.jpeg', gallery: 'gallery.webp', messages: 'messages.jpg',
      dialer: 'dialer.jpg', browser: 'browser.png', music: 'music.png', notes: 'zametki.png',
      calculator: 'calculator.jpg', settings: 'settings.jpeg', qwerty_apps: 'store.png',
    };
    return '/apps_icons/system/Android Style/' + (androidIcons[app] || 'browser.png');
  };
  return [
    { id: 'gallery', name: 'Галерея', icon: getIcon('gallery'), description: 'Просмотр фотографий', size: '25 МБ', rating: 4.5, category: 'Медиа' },
    { id: 'music', name: 'Музыка', icon: getIcon('music'), description: 'Музыкальный плеер', size: '40 МБ', rating: 4.6, category: 'Музыка' },
    { id: 'browser', name: 'Браузер', icon: getIcon('browser'), description: 'Веб-браузер', size: '55 МБ', rating: 4.7, category: 'Интернет' },
    { id: 'calculator', name: 'Калькулятор', icon: getIcon('calculator'), description: 'Простой калькулятор', size: '5 МБ', rating: 4.5, category: 'Инструменты' },
    { id: 'notes', name: 'Заметки', icon: getIcon('notes'), description: 'Быстрые заметки', size: '8 МБ', rating: 4.4, category: 'Продуктивность' },
  ];
};

const QwertyApps: React.FC<QwertyAppsProps> = ({ onClose, theme, onAppInstalled, onOpenApp }) => {
  const [installedApps, setInstalledApps] = useState<string[]>([]);
  const [downloadingApps, setDownloadingApps] = useState<string[]>([]);
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'installed'>('home');
  const availableApps = getAvailableApps();

  useEffect(() => {
    const savedApps = localStorage.getItem('wintophone_installed_apps');
    if (savedApps) setInstalledApps(JSON.parse(savedApps).map((a: { id: string }) => a.id));
  }, []);

  const handleInstall = (app: AppItem) => {
    setDownloadingApps(prev => [...prev, app.id]);
    setTimeout(() => {
      const savedApps = localStorage.getItem('wintophone_installed_apps');
      const apps = savedApps ? JSON.parse(savedApps) : [];
      if (!apps.find((a: { id: string }) => a.id === app.id)) {
        apps.push({ id: app.id, name: app.name, icon: app.icon });
        localStorage.setItem('wintophone_installed_apps', JSON.stringify(apps));
      }
      setInstalledApps(prev => [...prev, app.id]);
      setDownloadingApps(prev => prev.filter(id => id !== app.id));
      onAppInstalled({ id: app.id, name: app.name, icon: app.icon });
    }, 2000);
  };

  const handleUninstall = (appId: string) => {
    const savedApps = localStorage.getItem('wintophone_installed_apps');
    if (savedApps) {
      const filtered = JSON.parse(savedApps).filter((a: { id: string }) => a.id !== appId);
      localStorage.setItem('wintophone_installed_apps', JSON.stringify(filtered));
      setInstalledApps(prev => prev.filter(id => id !== appId));
    }
  };

  const installedAppsList = availableApps.filter(app => installedApps.includes(app.id));

  if (selectedApp) {
    const isInstalled = installedApps.includes(selectedApp.id);
    const isDownloading = downloadingApps.includes(selectedApp.id);
    return (
      <div className={'qwerty-apps theme-' + theme}>
        <div className='app-header'>
          <button className='back-button' onClick={() => setSelectedApp(null)}>←</button>
          <span className='app-title'>Приложение</span>
          <div className='header-spacer' />
        </div>
        <div className='app-detail'>
          <img src={selectedApp.icon} alt={selectedApp.name} className='detail-icon' />
          <h2 className='detail-name'>{selectedApp.name}</h2>
          <p className='detail-description'>{selectedApp.description}</p>
          <div className='detail-info'><span>⭐ {selectedApp.rating}</span><span>📦 {selectedApp.size}</span><span>📁 {selectedApp.category}</span></div>
          <div className='detail-actions'>
            {isInstalled ? (
              <button className='action-button uninstall' onClick={() => handleUninstall(selectedApp.id)}>Удалить</button>
            ) : isDownloading ? (
              <button className='action-button downloading' disabled>Загрузка...</button>
            ) : (
              <button className='action-button install' onClick={() => handleInstall(selectedApp)}>Установить</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={'qwerty-apps theme-' + theme}>
      <div className='app-header'>
        <button className='back-button' onClick={onClose}>←</button>
        <span className='app-title'>Qwerty Apps</span>
        <div className='header-spacer' />
      </div>
      <div className='tabs'>
        <button className={'tab' + (activeTab === 'home' ? ' active' : '')} onClick={() => setActiveTab('home')}>Главная</button>
        <button className={'tab' + (activeTab === 'installed' ? ' active' : '')} onClick={() => setActiveTab('installed')}>Мои приложения ({installedApps.length})</button>
      </div>
      <div className='apps-content'>
        {activeTab === 'home' ? (
          <div className='qwerty-apps-grid'>
            {availableApps.map((app) => {
              const isInstalled = installedApps.includes(app.id);
              const isDownloading = downloadingApps.includes(app.id);
              return (
                <div key={app.id} className='app-card' onClick={() => setSelectedApp(app)}>
                  <img src={app.icon} alt={app.name} className='app-card-icon' />
                  <div className='app-card-info'><span className='app-card-name'>{app.name}</span><span className='app-card-category'>{app.category}</span></div>
                  <div className='app-card-action'>
                    {isInstalled ? (
                      <button className='open-button' onClick={(e) => { e.stopPropagation(); if (onOpenApp) onOpenApp(app.id); }}>Открыть</button>
                    ) : isDownloading ? (
                      <span className='downloading-badge'>⏳</span>
                    ) : (
                      <button className='install-button' onClick={(e) => { e.stopPropagation(); handleInstall(app); }}>+</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className='qwerty-apps-grid'>
            {installedAppsList.length === 0 ? (
              <div className='empty-installed'><span className='empty-icon'>📱</span><span className='empty-text'>Нет установленных приложений</span></div>
            ) : (
              installedAppsList.map((app) => (
                <div key={app.id} className='app-card' onClick={() => setSelectedApp(app)}>
                  <img src={app.icon} alt={app.name} className='app-card-icon' />
                  <div className='app-card-info'><span className='app-card-name'>{app.name}</span><span className='app-card-category'>{app.category}</span></div>
                  <button className='uninstall-button' onClick={(e) => { e.stopPropagation(); handleUninstall(app.id); }}>🗑️</button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QwertyApps;
