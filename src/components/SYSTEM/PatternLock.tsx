import React, { useState } from 'react';
import './styles/PatternLock.css';
import { SecurityCodes } from '../PinCodes/org.qwertyos.android.codes';

interface PatternLockProps {
  onUnlock: (pattern?: string[]) => void;
  onClose?: () => void;
  setupMode?: boolean;
  onSavePattern?: (pattern: string[]) => void;
}

const PatternLock: React.FC<PatternLockProps> = ({ 
  onUnlock, 
  onClose, 
  setupMode = false,
  onSavePattern 
}) => {
  const [pattern, setPattern] = useState<string[]>([]);
  const [selectedDot, setSelectedDot] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const dots = ['1','2','3','4','5','6','7','8','9'];
  const storedPattern = SecurityCodes.load()?.type === 'pattern' ? SecurityCodes.load()!.pattern!.map(String) : [];

  const handleDotClick = (dot: string) => {
    if (!pattern.includes(dot)) {
      const newPattern = [...pattern, dot];
      setPattern(newPattern);
      setSelectedDot(dot);

      if (setupMode) {
        if (newPattern.length >= 4) {
          onSavePattern?.(newPattern);
        }
      } else {
        if (newPattern.length >= 4) {
          setTimeout(() => {
            if (JSON.stringify(newPattern) === JSON.stringify(storedPattern)) {
              onUnlock(newPattern);
            } else {
              setShowError(true);
              setTimeout(() => {
                setPattern([]);
                setSelectedDot(null);
                setShowError(false);
              }, 500);
            }
          }, 300);
        }
      }
    }
  };

  return (
    <div className="pattern-lock">
      <div className="pattern-header">
        <span className="pattern-title">
          {setupMode ? 'Нарисуйте графический ключ' : 'Введите графический ключ'}
        </span>
        {!setupMode && onClose && (
          <button className="back-btn" onClick={onClose}>←</button>
        )}
      </div>

      {showError && <div className="error-message">Неверный ключ</div>}

      <div className="pattern-grid">
        {dots.map((dot, index) => (
          <div
            key={dot}
            className={`pattern-dot ${pattern.includes(dot) ? 'filled' : ''} ${selectedDot === dot ? 'selected' : ''}`}
            onClick={() => handleDotClick(dot)}
            style={{ '--index': index } as React.CSSProperties}
          />
        ))}
      </div>

      {setupMode && pattern.length >= 4 && (
        <div className="pattern-complete">
          <span>✓ Ключ установлен!</span>
        </div>
      )}
    </div>
  );
};

export default PatternLock;
