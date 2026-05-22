import React, { useState } from 'react';
import './styles/DialerApp.css';

interface DialerAppProps {
  onClose: () => void;
  theme: string;
}

const DialerApp: React.FC<DialerAppProps> = ({ onClose, theme }) => {
  const [number, setNumber] = useState('');

  const dialPad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ];

  const handlePress = (digit: string) => {
    setNumber(prev => prev + digit);
  };

  const handleDelete = () => {
    setNumber(prev => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (number) {
      alert(`Вызов номера: ${number}`);
    }
  };

  return (
    <div className={`dialer-app theme-${theme}`}>
      <div className="app-header">
        <button className="back-button" onClick={onClose}>←</button>
        <span className="app-title">Телефон</span>
        <div className="header-spacer" />
      </div>

      <div className="dialer-content">
        <div className="number-display">
          <span className="number">{number || 'Введите номер'}</span>
          {number && (
            <button className="delete-button" onClick={handleDelete}>⌫</button>
          )}
        </div>

        <div className="dial-pad">
          {dialPad.map((row, rowIndex) => (
            <div key={rowIndex} className="dial-row">
              {row.map((digit) => (
                <button
                  key={digit}
                  className="dial-button"
                  onClick={() => handlePress(digit)}
                >
                  <span className="dial-digit">{digit}</span>
                  {digit !== '*' && digit !== '#' && (
                    <span className="dial-letters">
                      {digit === '1' && ''}
                      {digit === '2' && 'ABC'}
                      {digit === '3' && 'DEF'}
                      {digit === '4' && 'GHI'}
                      {digit === '5' && 'JKL'}
                      {digit === '6' && 'MNO'}
                      {digit === '7' && 'PQRS'}
                      {digit === '8' && 'TUV'}
                      {digit === '9' && 'WXYZ'}
                      {digit === '0' && '+'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="call-button-container">
          <button className="call-button" onClick={handleCall}>
            📞
          </button>
        </div>

        <div className="dialer-tabs">
          <button className="tab active">Клавиатура</button>
          <button className="tab">Звонки</button>
          <button className="tab">Контакты</button>
        </div>
      </div>
    </div>
  );
};

export default DialerApp;
