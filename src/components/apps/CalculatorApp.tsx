import React, { useState } from 'react';
import './styles/CalculatorApp.css';

interface CalculatorAppProps {
  onClose: () => void;
  theme: string;
}

const CalculatorApp: React.FC<CalculatorAppProps> = ({ onClose, theme }) => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperation = (op: string) => {
    setPrevValue(display);
    setOperation(op);
    setNewNumber(true);
  };

  const handleEqual = () => {
    if (!prevValue || !operation) return;
    const a = parseFloat(prevValue);
    const b = parseFloat(display);
    let result = 0;

    switch (operation) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/': result = b !== 0 ? a / b : 0; break;
      case '%': result = a % b; break;
    }

    setDisplay(String(result).slice(0, 12));
    setPrevValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleDelete = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
      setNewNumber(false);
    }
  };

  const buttons = [
    ['C', '⌫', '%', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  return (
    <div className={`calculator-app theme-${theme}`}>
      <div className="app-header">
        <button className="back-button" onClick={onClose}>←</button>
        <span className="app-title">Калькулятор</span>
        <div className="header-spacer" />
      </div>
      <div className="calculator-display">
        <div className="calc-operation">{prevValue} {operation}</div>
        <div className="calc-result">{display}</div>
      </div>
      <div className="calculator-pad">
        {buttons.map((row, i) => (
          <div key={i} className="calc-row">
            {row.map((btn) => {
              const isOp = ['+', '-', '*', '/', '%', '='].includes(btn);
              const isClear = btn === 'C';
              return (
                <button
                  key={btn}
                  className={`calc-btn ${isOp ? 'op' : ''} ${isClear ? 'clear' : ''} ${btn === '0' ? 'zero' : ''}`}
                  onClick={() => {
                    if (btn === 'C') handleClear();
                    else if (btn === '⌫') handleDelete();
                    else if (btn === '=') handleEqual();
                    else if (['+', '-', '*', '/', '%'].includes(btn)) handleOperation(btn);
                    else if (btn === '.') handleDecimal();
                    else handleNumber(btn);
                  }}
                >
                  {btn}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalculatorApp;
