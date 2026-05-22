import React from 'react';
import './Step3.css';

interface Step3Props {
  theme: 'dark' | 'light' | 'indigo' | 'purple';
  onThemeChange: (theme: 'dark' | 'light' | 'indigo' | 'purple') => void;
  onNext: () => void;
}

const themes: { key: 'dark' | 'light' | 'indigo' | 'purple'; label: string }[] = [
  { key: 'dark', label: 'Тёмная' },
  { key: 'light', label: 'Светлая' },
  { key: 'indigo', label: 'Индиго' },
  { key: 'purple', label: 'Фиолетовая' },
];

const Step3: React.FC<Step3Props> = ({ theme, onThemeChange, onNext }) => {
  return (
    <div className="oobe-step">
      <h1 className="oobe-step-title">Тема</h1>
      <p className="oobe-step-subtitle">Выберите оформление</p>
      
      <div className="oobe-theme-options">
        {themes.map((t) => (
          <button
            key={t.key}
            className={`oobe-theme-btn ${theme === t.key ? 'active' : ''}`}
            onClick={() => onThemeChange(t.key)}
          >
            <div className={`theme-preview theme-${t.key}`} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>
      
      <button className="oobe-step-btn" onClick={onNext}>Далее</button>
    </div>
  );
};

export default Step3;
