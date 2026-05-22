import React, { useState } from 'react';
import './styles/SettingsApp.css';
import PatternLock from '../SYSTEM/PatternLock';
import PinLock from '../SYSTEM/PinLock';
import { SecurityCodes } from '../PinCodes/org.qwertyos.android.codes';

interface SettingsAppProps {
  onClose: () => void;
  theme: string;
}

const SettingsApp: React.FC<SettingsAppProps> = ({ onClose, theme }) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showApps, setShowApps] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showNetwork, setShowNetwork] = useState(false);
  const [showSound, setShowSound] = useState(false);
  const [showDisplay, setShowDisplay] = useState(false);
  const [showBattery, setShowBattery] = useState(false);
  const [showUiPack, setShowUiPack] = useState(false);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [passwordSetupType, setPasswordSetupType] = useState<'pattern' | 'pin' | null>(null);
  const [newPattern, setNewPattern] = useState<number[]>([]);
  const [newPin, setNewPin] = useState('');
  const [passwordConfirmMode, setPasswordConfirmMode] = useState<'pattern' | 'pin' | null>(null);
  const [currentTheme, setCurrentTheme] = useState<string>(() => localStorage.getItem('wintophone_theme') || 'dark');
  const [currentUiPack, setCurrentUiPack] = useState<string>(() => localStorage.getItem('wintophone_ui_pack') || 'qwerty2');

  const hasPassword = SecurityCodes.has();
  const passwordType = SecurityCodes.getType();

  const getSettingsIcon = (iconKey: string) => {
    const uiPack = localStorage.getItem('wintophone_ui_pack') || 'qwerty2';
    
    const qwerty1Map: Record<string, string> = {
      internet: 'vkladka_internet.png',
      sound: 'vkladka_zvuk.jpg',
      display: 'vkladka_ekran.jpg',
      battery: 'vkladka_battery.png',
      security: 'Vkladka_bezopasnost.png',
      apps: 'vkladka_apps.png',
      about: 'vkladka about phone.png',
      reset: 'vkladka_sbros_nastrojek.png',
    };
    
    const qwerty2Map: Record<string, string> = {
      internet: 'vkladka wifi.jpg',
      sound: 'vkladka_zvyk.jpg',
      display: 'vkladka ekran.jpg',
      battery: 'vkaldka battery.jpg',
      security: 'vkladka_bezopasnost.jpg',
      apps: 'vkladka apps.jpg',
      about: 'vkladka about phone.png',
      reset: 'Sbrosit_nastroiki.jpg',
    };
    
    const map = uiPack === 'qwerty1' ? qwerty1Map : qwerty2Map;
    const folder = uiPack === 'qwerty1' ? 'QwerUI 1.0 Pack' : 'QwerUI 2.0 Pack';
    return `/settings/${folder}/${map[iconKey] || iconKey}`;
  };

  const handleReset = () => {
    localStorage.clear();
    setShowResetConfirm(false);
    window.location.reload();
  };

  const getInstalledApps = () => {
    const savedApps = localStorage.getItem('wintophone_installed_apps');
    return savedApps ? JSON.parse(savedApps) : [];
  };

  const handleUninstallApp = (appId: string) => {
    const savedApps = localStorage.getItem('wintophone_installed_apps');
    if (savedApps) {
      const apps = JSON.parse(savedApps);
      const filtered = apps.filter((a: { id: string }) => a.id !== appId);
      localStorage.setItem('wintophone_installed_apps', JSON.stringify(filtered));
      window.dispatchEvent(new Event('appInstalled'));
    }
  };

  const handlePatternSetup = (pattern: string[]) => {
    setNewPattern(pattern.map(Number));
    setPasswordConfirmMode('pattern');
  };

  const handlePinSetup = (pin: string) => {
    setNewPin(pin);
    setPasswordConfirmMode('pin');
  };

  const handlePasswordConfirm = (confirmedPattern?: number[], confirmedPin?: string) => {
    if (passwordConfirmMode === 'pattern' && confirmedPattern) {
      if (JSON.stringify(confirmedPattern) === JSON.stringify(newPattern)) {
        SecurityCodes.save({ type: 'pattern', pattern: newPattern, createdAt: Date.now() });
        setShowPasswordSetup(false);
        setPasswordConfirmMode(null);
        setNewPattern([]);
        setNewPin('');
      }
    } else if (passwordConfirmMode === 'pin' && confirmedPin) {
      if (confirmedPin === newPin) {
        SecurityCodes.save({ type: 'pin', pin: newPin, createdAt: Date.now() });
        setShowPasswordSetup(false);
        setPasswordConfirmMode(null);
        setNewPattern([]);
        setNewPin('');
      }
    }
  };

  const startPasswordSetup = (type: 'pattern' | 'pin') => {
    setPasswordSetupType(type);
    setShowPasswordSetup(true);
  };

  const removePassword = () => {
    SecurityCodes.clear();
    setShowSecurity(false);
  };

  if (showPasswordSetup && passwordConfirmMode === null) {
    return (
      <div className={`settings-app theme-${theme}`}>
        <div className="app-header">
          <button className="back-button" onClick={() => { setShowPasswordSetup(false); setPasswordSetupType(null); }}>←</button>
          <span className="app-title">Установка пароля</span>
          <div className="header-spacer" />
        </div>
        <div className="password-setup-content">
          {passwordSetupType === 'pattern' && (
            <PatternLock 
              setupMode 
              onSavePattern={handlePatternSetup} 
              onUnlock={() => {}} 
            />
          )}
          {passwordSetupType === 'pin' && (
            <PinLock 
              setupMode 
              onSavePin={handlePinSetup} 
              onUnlock={() => {}} 
            />
          )}
        </div>
      </div>
    );
  }

  if (showPasswordSetup && passwordConfirmMode !== null) {
    return (
      <div className={`settings-app theme-${theme}`}>
        <div className="app-header">
          <span className="app-title">Подтвердите пароль</span>
          <div className="header-spacer" />
        </div>
        <div className="password-setup-content">
          {passwordConfirmMode === 'pattern' && (
            <PatternLock 
              onUnlock={(pattern) => pattern && handlePasswordConfirm(pattern.map(Number))} 
            />
          )}
          {passwordConfirmMode === 'pin' && (
            <PinLock 
              onUnlock={(pin) => pin && handlePasswordConfirm(undefined, pin)} 
            />
          )}
        </div>
      </div>
    );
  }

  if (showResetConfirm) {
    return (
      <div className={`settings-app theme-${theme}`}>
        <div className="app-header">
          <button className="back-button" onClick={() => setShowResetConfirm(false)}>←</button>
          <span className="app-title">Сброс настроек</span>
          <div className="header-spacer" />
        </div>
        <div className="reset-confirm">
          <div className="reset-icon">⚠️</div>
          <h3>Внимание!</h3>
          <p>Все данные будут удалены:</p>
          <ul>
            <li>Установленные приложения</li>
            <li>Сообщения</li>
            <li>Фотографии</li>
            <li>Настройки</li>
          </ul>
          <div className="reset-buttons">
            <button className="reset-cancel" onClick={() => setShowResetConfirm(false)}>Отмена</button>
            <button className="reset-confirm-btn" onClick={handleReset}>Сбросить</button>
          </div>
        </div>
      </div>
    );
  }

  if (showAbout) {
    return (
      <div className={`settings-app theme-${theme}`}>
        <div className="app-header">
          <button className="back-button" onClick={() => setShowAbout(false)}>←</button>
          <span className="app-title">О телефоне</span>
          <div className="header-spacer" />
        </div>
        <div className="about-content">
          <div className="about-logo">W</div>
          <h2>WintoPhone 1</h2>
          <div className="about-info">
            <div className="about-row"><span>Модель</span><span>WintoPhone 1</span></div>
            <div className="about-row"><span>ОС</span><span>Android 17</span></div>
            <div className="about-row"><span>Оболочка</span><span>QwerUI 2.0</span></div>
            <div className="about-row"><span>Версия</span><span>2.0.0</span></div>
            <div className="about-row"><span>Процессор</span><span>Snapdragon 8 Elite Gen 5</span></div>
            <div className="about-row"><span>Память</span><span>16 / 1028 ГБ</span></div>
          </div>
        </div>
      </div>
    );
  }

  if (showApps) {
    const apps = getInstalledApps();
    return (
      <div className={`settings-app theme-${theme}`}>
        <div className="app-header">
          <button className="back-button" onClick={() => setShowApps(false)}>←</button>
          <span className="app-title">Приложения</span>
          <div className="header-spacer" />
        </div>
        <div className="apps-list">
          {apps.length === 0 ? (
            <div className="empty-apps">Нет установленных приложений</div>
          ) : (
            apps.map((app: { id: string; name: string; icon: string }) => (
              <div key={app.id} className="app-row">
                <img src={app.icon} alt={app.name} className="app-row-icon" />
                <span className="app-row-name">{app.name}</span>
                <button className="app-uninstall-btn" onClick={() => handleUninstallApp(app.id)}>Удалить</button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (showSecurity) {
    return (
      <div className={`settings-app theme-${theme}`}>
        <div className="app-header">
          <button className="back-button" onClick={() => setShowSecurity(false)}>←</button>
          <span className="app-title">Безопасность</span>
          <div className="header-spacer" />
        </div>
        <div className="settings-content">
          <div className="security-section">
            <div className="security-item">
              <img src={getSettingsIcon('security')} alt="Pattern" className="security-icon" />
              <div className="security-text">
                <span className="security-label">Графический ключ</span>
                <span className="security-desc">{hasPassword && passwordType !== 'pattern' ? 'Не установлен' : hasPassword ? 'Изменить' : 'Установить'}</span>
              </div>
              <button 
                className="security-btn"
                onClick={() => startPasswordSetup('pattern')}
              >
                {hasPassword && passwordType !== 'pattern' ? 'Изменить' : hasPassword ? 'Установить' : 'Установить'}
              </button>
            </div>
            <div className="security-item">
              <img src={getSettingsIcon('security')} alt="PIN" className="security-icon" />
              <div className="security-text">
                <span className="security-label">PIN-код</span>
                <span className="security-desc">{hasPassword && passwordType !== 'pin' ? 'Не установлен' : hasPassword ? 'Изменить' : 'Установить'}</span>
              </div>
              <button 
                className="security-btn"
                onClick={() => startPasswordSetup('pin')}
              >
                {hasPassword && passwordType !== 'pin' ? 'Изменить' : hasPassword ? 'Установить' : 'Установить'}
              </button>
            </div>
            {hasPassword && (
              <button className="remove-password-btn" onClick={removePassword}>Удалить все пароли</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showNetwork) {
    return (
      <div className={`settings-app theme-${theme}`}>
        <div className="app-header">
          <button className="back-button" onClick={() => setShowNetwork(false)}>←</button>
          <span className="app-title">Сеть и интернет</span>
          <div className="header-spacer" />
        </div>
        <div className="settings-content">
          <div className="network-section">
            <div className="network-item">
              <img src={getSettingsIcon('internet')} alt="Wi-Fi" className="network-icon" />
              <div className="network-text">
                <span className="network-label">Wi-Fi</span>
                <span className="network-desc">Подключено: Home_WiFi</span>
              </div>
              <div className="toggle-switch">
                <input type="checkbox" defaultChecked className="toggle-input" />
                <span className="toggle-slider"></span>
              </div>
            </div>
            <div className="network-item">
              <img src={getSettingsIcon('internet')} alt="Мобильные данные" className="network-icon" />
              <div className="network-text">
                <span className="network-label">Мобильные данные</span>
                <span className="network-desc">Включены</span>
              </div>
              <div className="toggle-switch">
                <input type="checkbox" defaultChecked className="toggle-input" />
                <span className="toggle-slider"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showSound) {
    return (
      <div className={`settings-app theme-${theme}`}>
        <div className="app-header">
          <button className="back-button" onClick={() => setShowSound(false)}>←</button>
          <span className="app-title">Звук и вибрация</span>
          <div className="header-spacer" />
        </div>
        <div className="settings-content">
          <div className="sound-section">
            <div className="sound-item">
              <span className="sound-label">Громкость звонка</span>
              <input type="range" min="0" max="100" defaultValue="70" className="sound-slider" />
            </div>
            <div className="sound-item">
              <span className="sound-label">Громкость мультимедиа</span>
              <input type="range" min="0" max="100" defaultValue="80" className="sound-slider" />
            </div>
            <div className="sound-item">
              <span className="sound-label">Вибрация при нажатии</span>
              <div className="toggle-switch">
                <input type="checkbox" defaultChecked className="toggle-input" />
                <span className="toggle-slider"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showDisplay) {
    const themes: Record<string, string> = {
      dark: 'Тёмная',
      light: 'Светлая',
      indigo: 'Индиго',
      purple: 'Фиолетовая'
    };
    return (
      <div className={`settings-app theme-${theme}`}>
        <div className="app-header">
          <button className="back-button" onClick={() => setShowDisplay(false)}>←</button>
          <span className="app-title">Дисплей</span>
          <div className="header-spacer" />
        </div>
        <div className="settings-content">
          <div className="display-section">
            <div className="display-item">
              <img src={getSettingsIcon('display')} alt="Тема" className="display-icon" />
              <div className="display-text">
                <span className="display-label">Тема</span>
                <span className="display-desc">{themes[currentTheme] || 'Тёмная'}</span>
              </div>
            </div>
            <div className="display-item theme-selector">
              {Object.entries(themes).map(([key, label]) => (
                <button
                  key={key}
                  className={`theme-option ${currentTheme === key ? 'active' : ''}`}
                  onClick={() => {
                    localStorage.setItem('wintophone_theme', key);
                    setCurrentTheme(key);
                    window.dispatchEvent(new Event('storage'));
                  }}
                >
                  <div className={`theme-preview-small theme-${key}`} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <div className="display-item">
              <span className="display-label">Яркость</span>
              <input type="range" min="0" max="100" defaultValue="75" className="display-slider" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showUiPack) {
    const uiPacks: Record<string, { name: string; desc: string; folder: string }> = {
      qwerty1: { name: 'QwerUI 1.0', desc: 'QwertyOS 4', folder: 'QwerUI 1.0 Pack' },
      qwerty2: { name: 'QwerUI 2.0', desc: 'Новый дизайн', folder: 'QwerUI 2.0 Pack' }
    };
    return (
      <div className={`settings-app theme-${theme}`}>
        <div className="app-header">
          <button className="back-button" onClick={() => setShowUiPack(false)}>←</button>
          <span className="app-title">Персонализация</span>
          <div className="header-spacer" />
        </div>
        <div className="settings-content">
          <div className="ui-pack-section">
            <p className="ui-pack-title">Выберите пак иконок</p>
            <div className="ui-pack-options">
              {Object.entries(uiPacks).map(([key, pack]) => (
                <button
                  key={key}
                  className={`ui-pack-btn ${currentUiPack === key ? 'active' : ''}`}
                  onClick={() => {
                    localStorage.setItem('wintophone_ui_pack', key);
                    setCurrentUiPack(key);
                  }}
                >
                  <div className={`ui-pack-preview ui-pack-${key}`}>
                    <span>{key === 'qwerty1' ? '1.0' : '2.0'}</span>
                  </div>
                  <span className="ui-pack-name">{pack.name}</span>
                  <span className="ui-pack-desc">{pack.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showBattery) {
    return (
      <div className={`settings-app theme-${theme}`}>
        <div className="app-header">
          <button className="back-button" onClick={() => setShowBattery(false)}>←</button>
          <span className="app-title">Батарея</span>
          <div className="header-spacer" />
        </div>
        <div className="battery-content">
          <div className="battery-icon">87%</div>
          <h3>87% заряда</h3>
          <div className="battery-info">
            <div className="battery-row"><span>Экран</span><span>4ч 32м</span></div>
            <div className="battery-row"><span>Система</span><span>2ч 15м</span></div>
            <div className="battery-row"><span>Приложения</span><span>1ч 45м</span></div>
          </div>
        </div>
      </div>
    );
  }

  const themeLabels: Record<string, string> = {
    dark: 'Тёмная',
    light: 'Светлая',
    indigo: 'Индиго',
    purple: 'Фиолетовая'
  };

  const settingsItems = [
    { label: 'Сеть и интернет', desc: 'Wi-Fi, мобильная сеть', icon: getSettingsIcon('internet'), action: () => setShowNetwork(true) },
    { label: 'Звук и вибрация', desc: 'Громкость, вибрация', icon: getSettingsIcon('sound'), action: () => setShowSound(true) },
    { label: 'Дисплей', desc: `${themeLabels[currentTheme] || 'Тёмная'} тема`, icon: getSettingsIcon('display'), action: () => setShowDisplay(true) },
    { label: 'Батарея', desc: '87% заряда', icon: getSettingsIcon('battery'), action: () => setShowBattery(true) },
    { label: 'Персонализация', desc: 'Пак иконок', icon: getSettingsIcon('display'), action: () => setShowUiPack(true) },
    { label: 'Безопасность', desc: 'Отпечаток, разблокировка', icon: getSettingsIcon('security'), action: () => setShowSecurity(true) },
    { label: 'Приложения', desc: 'Управление приложениями', icon: getSettingsIcon('apps'), action: () => setShowApps(true) },
    { label: 'О телефоне', desc: 'WintoPhone 1, Android 17', icon: getSettingsIcon('about'), action: () => setShowAbout(true) },
  ];

  return (
    <div className={`settings-app theme-${theme}`}>
      <div className="app-header">
        <button className="back-button" onClick={onClose}>←</button>
        <span className="app-title">Настройки</span>
        <div className="header-spacer" />
      </div>

      <div className="settings-content">
        <div className="profile-section">
          <div className="profile-avatar">W</div>
          <div className="profile-info">
            <span className="profile-name">Пользователь</span>
            <span className="profile-email">WintoPhone 1</span>
          </div>
        </div>

        <div className="settings-list">
          {settingsItems.map((item, index) => (
            <div key={index} className="settings-item" onClick={item.action}>
              <img src={item.icon} alt={item.label} className="settings-item-icon" />
              <div className="settings-text">
                <span className="settings-label">{item.label}</span>
                <span className="settings-desc">{item.desc}</span>
              </div>
              <span className="settings-arrow">›</span>
            </div>
          ))}
        </div>

        <div className="settings-list reset-section">
          <div className="settings-item reset-item" onClick={() => setShowResetConfirm(true)}>
            <img src={getSettingsIcon('reset')} alt="Сброс" className="settings-item-icon" />
            <div className="settings-text">
              <span className="settings-label reset-label">Сброс настроек</span>
              <span className="settings-desc">Удалить все данные</span>
            </div>
            <span className="settings-arrow">›</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsApp;
