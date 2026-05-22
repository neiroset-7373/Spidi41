import React from 'react';
import './Step2.css';

export interface Step2Props {
  iconStyle: 'wintozo' | 'android';
  onIconStyleChange: (style: 'wintozo' | 'android') => void;
  onNext: () => void;
}

const Step2: React.FC<Step2Props> = ({ iconStyle, onIconStyleChange, onNext }) => {
  return (
    <div className="oobe-step">
      <h1 className="oobe-step-title">Персонализация</h1>
      <p className="oobe-step-subtitle">Выберите стиль иконок</p>
      
      <div className="oobe-security-options">
        <button
          className={`oobe-security-btn ${iconStyle === 'wintozo' ? 'active' : ''}`}
          onClick={() => onIconStyleChange('wintozo')}
        >
          <span className="style-preview-text">W</span>
          <span>Wintozo</span>
          <span className="oobe-security-desc">Современный стиль</span>
        </button>
        
        <button
          className={`oobe-security-btn ${iconStyle === 'android' ? 'active' : ''}`}
          onClick={() => onIconStyleChange('android')}
        >
          <span className="style-preview-text">A</span>
          <span>Android</span>
          <span className="oobe-security-desc">Классический стиль</span>
        </button>
      </div>
      
      <button className="oobe-step-btn" onClick={onNext}>Далее</button>
    </div>
  );
};

export default Step2;
