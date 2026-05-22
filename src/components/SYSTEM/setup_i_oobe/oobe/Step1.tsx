import React from 'react';
import './Step1.css';

interface Step1Props {
  onNext: () => void;
}

const Step1: React.FC<Step1Props> = ({ onNext }) => {
  return (
    <div className="oobe-step">
      <h1 className="oobe-step-title">Добро пожаловать</h1>
      <p className="oobe-step-subtitle">WintoPhone — ваш новый смартфон</p>
      <button className="oobe-step-btn" onClick={onNext}>Далее</button>
    </div>
  );
};

export default Step1;
