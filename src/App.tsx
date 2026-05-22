import { useState, useEffect, useCallback } from 'react';
import './App.css';

// Security module
import { SecurityCodes } from './components/PinCodes/org.qwertyos.android.codes';

// Setup / OOBE components
import StartAndroid from './components/SYSTEM/setup_i_oobe/start_phone/start_android';
import OOBE from './components/SYSTEM/setup_i_oobe/OOBE';

// App imports
import CameraApp from './components/apps/CameraApp';
import MusicApp from './components/apps/MusicApp';
import CalculatorApp from './components/apps/CalculatorApp';
import NotesApp from './components/apps/NotesApp';
import SettingsApp from './components/apps/SettingsApp';
import BrowserApp from './components/apps/BrowserApp';
import DialerApp from './components/apps/DialerApp';
import GalleryApp from './components/apps/GalleryApp';
import MessagesApp from './components/apps/MessagesApp';
import QwertyApps from './components/apps/QwertyApps';

const STORAGE_OOBE = 'wintophone_oobe_done';
const STORAGE_FIRST_LAUNCH = 'wintophone_first_launch';

// ===== SPLASH SCREEN =====
const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const isFirst = !localStorage.getItem(STORAGE_FIRST_LAUNCH);

  useEffect(() => {
    if (isFirst) {
      localStorage.setItem(STORAGE_FIRST_LAUNCH, 'true');
      SecurityCodes.migrate();
    }
  }, [isFirst]);

  return <StartAndroid onComplete={onComplete} isFirstLaunch={isFirst} />;
};

// ===== OOBE (использует внешний компонент из setup_i_oobe) =====
// Компонент импортирован выше: import OOBE from './components/SYSTEM/setup_i_oobe/OOBE';

// ===== LOCK SCREEN =====
const LockScreen = ({ onUnlock }: { onUnlock: () => void }) => {
  const [pin, setPin] = useState('');
  const [pattern, setPattern] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [time, setTime] = useState(new Date());
  const sec = SecurityCodes.load();

  useEffect(() => { const t = setInterval(()=>setTime(new Date()),1000); return ()=>clearInterval(t); }, []);

  const handlePinKey = (n: string) => {
    if(n==='⌫'){setPin(p=>p.slice(0,-1));setError('');return}
    if(pin.length>=4)return;
    const np = pin+n; setPin(np); setError('');
    if(np.length===4) setTimeout(()=>{
      if(SecurityCodes.verifyPin(np))onUnlock();
      else{setError('Неверный PIN');setPin('')}
    },150);
  };

  if (sec?.type === 'pin') {
    return (
      <div className="lock-screen">
        <div className="lock-header">
          <div className="lock-time">{time.getHours().toString().padStart(2,'0')}:{time.getMinutes().toString().padStart(2,'0')}</div>
          <div className="lock-date">{time.toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'})}</div>
        </div>
        <p className="lock-prompt">Введите PIN-код</p>
        <div className="pin-dots">{[0,1,2,3].map(i=><div key={i} className={`pin-dot ${pin.length>i?'filled':''}`} />)}</div>
        {error&&<p className="pin-error">{error}</p>}
        <div className="pin-keypad">
          {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(n=>(
            <button key={n||'e'} className={`pin-key ${n===''?'empty':''}`} onClick={()=>handlePinKey(String(n))} disabled={n===''}>{n}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="lock-screen">
      <div className="lock-header">
        <div className="lock-time">{time.getHours().toString().padStart(2,'0')}:{time.getMinutes().toString().padStart(2,'0')}</div>
        <div className="lock-date">{time.toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'})}</div>
      </div>
      <p className="lock-prompt">Нарисуйте ключ</p>
      {error&&<p className="pin-error">{error}</p>}
      <div className="pattern-grid">
        {Array.from({length:9},(_,i)=>(
          <button key={i} className={`pattern-dot ${pattern.includes(i)?'selected':''}`}
            onClick={()=>{if(pattern.includes(i))return;const np=[...pattern,i];setPattern(np);if(np.length>=4){setTimeout(()=>{if(SecurityCodes.verifyPattern(np))onUnlock();else{setError('Неверный ключ');setPattern([])}},200)}}} />
        ))}
      </div>
      <button className="oobe-back-btn" onClick={()=>setPattern([])}>Сбросить</button>
    </div>
  );
};

// ===== HOME SCREEN =====
const HomeScreen = ({ onOpenApp, onLock }: { onOpenApp: (id: string) => void; onLock: () => void }) => {
  const [time, setTime] = useState(new Date());
  const [installedApps, setInstalledApps] = useState<{ id: string; name: string; icon: string }[]>([]);
  
  useEffect(() => {
    const t = setInterval(()=>setTime(new Date()),1000); 
    return ()=>clearInterval(t); 
  }, []);

  useEffect(() => {
    const loadApps = () => {
      const saved = localStorage.getItem('wintophone_installed_apps');
      if (saved) setInstalledApps(JSON.parse(saved));
    };
    loadApps();
    window.addEventListener('appInstalled', loadApps);
    return () => window.removeEventListener('appInstalled', loadApps);
  }, []);

  const theme = localStorage.getItem('wintophone_theme') || 'dark';
  const iconStyle = localStorage.getItem('wintophone_icon_style') || 'wintozo';
  const getAppIcon = (appId: string) => {
    const wintozoMap: Record<string, string> = {
      phone: 'phone.jpg', messages: 'messeges.png', camera: 'camera.jpeg',
      gallery: 'gallery_App.png', music: 'music.png', browser: 'browser.png',
      calculator: 'calculator.png', notes: 'zametki.png', settings: 'settings.png', qwerty: 'qwerty_Apps.png'
    };
    const androidMap: Record<string, string> = {
      phone: 'dialer.jpg', messages: 'messages.jpg', camera: 'camera.jpeg',
      gallery: 'gallery.webp', music: 'music.png', browser: 'browser.png',
      calculator: 'calculator.jpg', notes: 'zametki.png', settings: 'settings.jpeg', qwerty: 'store.png'
    };
    const map = iconStyle === 'wintozo' ? wintozoMap : androidMap;
    const folder = iconStyle === 'wintozo' ? 'Wintozo Syle' : 'Android Style';
    const iconFile = map[appId] || 'browser.png';
    
    // Для Wintozo: если нет иконки камеры, берём из Android Style
    if (iconStyle === 'wintozo' && appId === 'camera') {
      return `/apps_icons/system/Android Style/${iconFile}`;
    }
    return `/apps_icons/system/${folder}/${iconFile}`;
  };

  const systemApps = [
    { id: 'phone', name: 'Телефон', icon: getAppIcon('phone') },
    { id: 'messages', name: 'Сообщения', icon: getAppIcon('messages') },
    { id: 'camera', name: 'Камера', icon: getAppIcon('camera') },
    { id: 'settings', name: 'Настройки', icon: getAppIcon('settings') },
    { id: 'qwerty', name: 'Qwerty Apps', icon: getAppIcon('qwerty') },
  ];

  const apps = [...systemApps, ...installedApps];

  const dockApps = [
    { id: 'phone', icon: getAppIcon('phone') },
    { id: 'messages', icon: getAppIcon('messages') },
    { id: 'camera', icon: getAppIcon('camera') },
    { id: 'qwerty', icon: getAppIcon('qwerty') },
  ];

  return (
    <div className={`home-screen theme-${theme}`}>
      <div className="status-bar">
        <span className="status-bar-left">{time.getHours().toString().padStart(2,'0')}:{time.getMinutes().toString().padStart(2,'0')}</span>
        <div className="status-bar-right">
          <button className="lock-btn" onClick={onLock}>🔒</button>
          <span className="status-icon">📶</span>
          <span className="status-icon">🔋</span>
        </div>
      </div>
      <div className="home-content">
        <div className="clock-widget">
          <div className="clock-time">{time.getHours().toString().padStart(2,'0')}:{time.getMinutes().toString().padStart(2,'0')}</div>
          <div className="clock-date">{time.toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'})}</div>
        </div>
        <div className="apps-grid">
          {apps.map(app=>(
            <button key={app.id} className="app-btn" onClick={()=>onOpenApp(app.id)}>
              <img src={app.icon} alt={app.name} className="app-icon-img" />
              <span className="app-label">{app.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="dock">
        {dockApps.map(app=>(
          <button key={app.id} className="dock-btn" onClick={()=>onOpenApp(app.id)}>
            <img src={app.icon} alt="" className="dock-icon-img" />
          </button>
        ))}
      </div>
      <div className="home-indicator" />
    </div>
  );
};

// ===== APP =====
function App() {
  const [phase, setPhase] = useState<'splash'|'oobe'|'lock'|'home'|'app'>('splash');
  const [activeApp, setActiveApp] = useState<string|null>(null);
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('wintophone_theme') || 'dark');

  useEffect(() => {
    const handleStorage = () => setCurrentTheme(localStorage.getItem('wintophone_theme') || 'dark');
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleSplashDone = useCallback(()=>{
    if(localStorage.getItem(STORAGE_OOBE)){
      if(SecurityCodes.has())setPhase('lock'); else setPhase('home');
    } else setPhase('oobe');
  },[]);

  const handleOOBEDone = useCallback(()=>{
    if(SecurityCodes.has())setPhase('lock'); else setPhase('home');
  },[]);

  const handleOpenApp = useCallback((id:string)=>{
    setActiveApp(id); setPhase('app');
  },[]);

  const handleCloseApp = useCallback(()=>{
    setActiveApp(null); setPhase('home');
  },[]);

  const handleLock = useCallback(()=>{
    setActiveApp(null); setPhase('lock');
  },[]);

  const renderApp = () => {
    const theme = currentTheme;
    switch(activeApp) {
      case 'camera': return <CameraApp onClose={handleCloseApp} theme={theme} />;
      case 'music': return <MusicApp onClose={handleCloseApp} theme={theme} />;
      case 'calculator': return <CalculatorApp onClose={handleCloseApp} theme={theme} />;
      case 'notes': return <NotesApp onClose={handleCloseApp} theme={theme} />;
      case 'settings': return <SettingsApp onClose={handleCloseApp} theme={theme} />;
      case 'browser': return <BrowserApp onClose={handleCloseApp} theme={theme} />;
      case 'phone': return <DialerApp onClose={handleCloseApp} theme={theme} />;
      case 'gallery': return <GalleryApp onClose={handleCloseApp} theme={theme} />;
      case 'messages': return <MessagesApp onClose={handleCloseApp} theme={theme} />;
      case 'qwerty': return <QwertyApps onClose={handleCloseApp} theme={theme} onAppInstalled={()=>{}} onOpenApp={handleOpenApp} />;
      default: return (
        <div className="app-view">
          <div className="app-header-bar">
            <button className="back-btn" onClick={handleCloseApp}>←</button>
            <span className="app-title-text">Приложение</span>
            <div style={{width:32}} />
          </div>
          <div className="app-placeholder-content">
            <img src="/apps_icons/system/logo_app.png" alt="" className="app-placeholder-logo" />
            <p className="app-placeholder-name">Раздел в разработке</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="phone-frame">
      {phase==='splash' && <SplashScreen onComplete={handleSplashDone} />}
      {phase==='oobe' && <OOBE onComplete={handleOOBEDone} />}
      {phase==='lock' && <LockScreen onUnlock={()=>setPhase('home')} />}
      {phase==='home' && <HomeScreen onOpenApp={handleOpenApp} onLock={handleLock} />}
      {phase==='app' && renderApp()}
    </div>
  );
}

export default App;