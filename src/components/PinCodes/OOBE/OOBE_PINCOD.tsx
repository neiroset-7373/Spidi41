import React, { useState } from 'react';
import { SecurityCodes } from '../org.qwertyos.android.codes';

interface OOBE_PINCODProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OOBE_PINCOD: React.FC<OOBE_PINCODProps> = ({ onComplete, onSkip }) => {
  const [securityType, setSecurityType] = useState<'pin' | 'pattern' | null>(null);
  const [pin, setPin] = useState('');
  const [pattern, setPattern] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [confirmMode, setConfirmMode] = useState(false);
  const [confirmPin, setConfirmPin] = useState('');
  const [confirmPattern, setConfirmPattern] = useState<number[]>([]);

  const handlePinKey = (n: string) => {
    if (n === '⌫') {
      if (confirmMode) { setConfirmPin(p => p.slice(0, -1)); } else { setPin(p => p.slice(0, -1)); }
      setError(''); return;
    }
    if (confirmMode) {
      if (confirmPin.length >= 4) return;
      const np = confirmPin + n; setConfirmPin(np); setError('');
      if (np.length === 4) {
        if (np === pin) { SecurityCodes.save({ type: 'pin', pin: np, createdAt: Date.now() }); onComplete(); }
        else { setError('PIN-коды не совпадают'); setConfirmPin(''); }
      }
    } else {
      if (pin.length >= 4) return;
      const np = pin + n; setPin(np); setError('');
      if (np.length === 4) { setConfirmMode(true); }
    }
  };

  const handlePatternDot = (i: number) => {
    if (confirmMode) {
      if (confirmPattern.includes(i)) return;
      const np = [...confirmPattern, i]; setConfirmPattern(np);
      if (np.length >= 4) {
        if (JSON.stringify(np) === JSON.stringify(pattern)) { SecurityCodes.save({ type: 'pattern', pattern: np, createdAt: Date.now() }); onComplete(); }
        else { setError('Ключи не совпадают'); setConfirmPattern([]); }
      }
    } else {
      if (pattern.includes(i)) return;
      const np = [...pattern, i]; setPattern(np);
      if (np.length >= 4) { setConfirmMode(true); }
    }
  };

  const handleSkip = () => { SecurityCodes.clear(); onSkip(); };

  if (!securityType) {
    return (
      <div className="oobe-screen">
        <h1 className="oobe-title">Безопасность</h1>
        <p className="oobe-subtitle">Защитите свой телефон</p>
        <div className="oobe-security-options">
          <button className="oobe-security-btn" onClick={() => setSecurityType('pin')}>
            <span className="oobe-security-icon">🔢</span><span>PIN-код</span><span className="oobe-security-desc">4 цифры</span>
          </button>
          <button className="oobe-security-btn" onClick={() => setSecurityType('pattern')}>
            <span className="oobe-security-icon">🔓</span><span>Графический ключ</span><span className="oobe-security-desc">Соедините точки</span>
          </button>
        </div>
        <button className="oobe-skip-btn" onClick={handleSkip}>Пропустить</button>
      </div>
    );
  }

  if (securityType === 'pin') {
    return (
      <div className="oobe-screen">
        <h1 className="oobe-title">{confirmMode ? 'Подтвердите PIN' : 'Создайте PIN-код'}</h1>
        <p className="oobe-subtitle">{confirmMode ? 'Введите код ещё раз' : 'Введите 4 цифры'}</p>
        <div className="pin-dots">{[0,1,2,3].map(i => <div key={i} className={`pin-dot ${(confirmMode ? confirmPin : pin).length > i ? 'filled' : ''}`} />)}</div>
        {error && <p className="pin-error">{error}</p>}
        <div className="pin-keypad">
          {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(n => (
            <button key={n||'empty'} className={`pin-key ${n===''?'empty':''}`} onClick={() => handlePinKey(String(n))} disabled={n===''}>{n}</button>
          ))}
        </div>
        <button className="oobe-back-btn" onClick={() => { if(confirmMode){setConfirmMode(false);setPin('');setConfirmPin('');}else{setSecurityType(null);setPin('');} setError(''); }}>Назад</button>
      </div>
    );
  }

  return (
    <div className="oobe-screen">
      <h1 className="oobe-title">{confirmMode ? 'Подтвердите ключ' : 'Нарисуйте ключ'}</h1>
      <p className="oobe-subtitle">{confirmMode ? 'Повторите узор' : 'Соедините минимум 4 точки'}</p>
      {error && <p className="pin-error">{error}</p>}
      <div className="pattern-grid">{Array.from({length:9},(_,i)=>(<button key={i} className={`pattern-dot ${(confirmMode ? confirmPattern : pattern).includes(i)?'selected':''}`} onClick={()=>handlePatternDot(i)} />))}</div>
      <button className="oobe-btn" onClick={() => { if(confirmMode){if(JSON.stringify(confirmPattern)===JSON.stringify(pattern)){SecurityCodes.save({type:'pattern',pattern:confirmPattern,createdAt:Date.now()});onComplete();}else{setError('Ключи не совпадают');setConfirmPattern([]);}}else{if(pattern.length>=4){setConfirmMode(true);}else{setError('Минимум 4 точки');}} }}>{confirmMode ? 'Готово' : 'Далее'}</button>
      <button className="oobe-back-btn" onClick={() => { if(confirmMode){setConfirmMode(false);setPattern([]);setConfirmPattern([]);}else{setSecurityType(null);setPattern([]);} setError(''); }}>Назад</button>
    </div>
  );
};

export default OOBE_PINCOD;
