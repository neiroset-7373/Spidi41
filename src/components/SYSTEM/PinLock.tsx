import React, { useState } from 'react';
import './styles/PinLock.css';
import { SecurityCodes } from '../PinCodes/org.qwertyos.android.codes';

interface PinLockProps {
  onUnlock: (pin?: string) => void;
  onClose?: () => void;
  setupMode?: boolean;
  onSavePin?: (pin: string) => void;
}

const PinLock: React.FC<PinLockProps> = ({ 
  onUnlock, 
  onClose, 
  setupMode = false,
  onSavePin 
}) => {
  const [pin, setPin] = useState('');
  const [showError, setShowError] = useState(false);
  const storedPin = SecurityCodes.load()?.type === 'pin' ? SecurityCodes.load()!.pin! : '';

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);

      if (setupMode) {
        if (newPin.length === 4) {
          onSavePin?.(newPin);
        }
      } else {
        if (newPin.length === 4) {
          setTimeout(() => {
            if (newPin === storedPin) {
              onUnlock(newPin);
            } else {
              setShowError(true);
              setTimeout(() => {
                setPin('');
                setShowError(false);
              }, 500);
            }
          }, 200);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="pin-lock">
      <div className="pin-header">
        <span className="pin-title">
          {setupMode ? 'Введите 4 цифры' : 'Введите PIN-код'}
        </span>
        {!setupMode && onClose && (
          <button className="back-btn" onClick={onClose}>←</button>
        )}
      </div>

      <div className="pin-dots">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`pin-dot ${pin.length > i ? 'filled' : ''} ${showError ? 'error' : ''}`}
          />
        ))}
      </div>

      {showError && <div className="error-message">Неверный PIN</div>}

      <div className="pin-keypad">
        {numbers.map((num) => (
          <button
            key={num}
            className="pin-btn"
            onClick={() => handleNumberClick(num)}
          >
            {num}
          </button>
        ))}
        <button className="pin-btn empty" />
        <button className="pin-btn" onClick={() => handleNumberClick('0')}>0</button>
        <button className="pin-btn delete" onClick={handleDelete}>⌫</button>
      </div>

      {setupMode && pin.length === 4 && (
        <div className="pin-complete">
          <span>✓ PIN установлен!</span>
        </div>
      )}
    </div>
  );
};

export default PinLock;
