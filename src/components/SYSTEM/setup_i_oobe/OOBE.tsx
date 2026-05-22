import React, { useState } from 'react';
import './OOBE.css';
import Step1 from './oobe/Step1';
import Step2 from './oobe/Step2';
import Step3 from './oobe/Step3';
import Step4 from './oobe/Step4';

interface OOBEProps {
  onComplete: () => void;
}

const OOBE: React.FC<OOBEProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [iconStyle, setIconStyle] = useState<'wintozo' | 'android'>('wintozo');
  const [theme, setTheme] = useState<'dark' | 'light' | 'indigo' | 'purple'>('dark');

  const totalSteps = 5;

  const handleStep1Next = () => setStep(1);

  const handleStep2Next = () => {
    localStorage.setItem('wintophone_icon_style', iconStyle);
    setStep(2);
  };

  const handleStep3Next = () => {
    localStorage.setItem('wintophone_theme', theme);
    setStep(3);
  };

  const handleStep4Complete = () => {
    localStorage.setItem('wintophone_oobe_done', 'true');
    onComplete();
  };

  const handleStep4Skip = () => {
    localStorage.setItem('wintophone_oobe_done', 'true');
    onComplete();
  };

  return (
    <div className="oobe-container">
      {step === 0 && (
        <>
          <Step1 onNext={handleStep1Next} />
          <div className="oobe-progress">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className={`oobe-progress-dot ${i === step ? 'active' : ''}`} />
            ))}
          </div>
        </>
      )}
      
      {step === 1 && (
        <>
          <Step2
            iconStyle={iconStyle}
            onIconStyleChange={setIconStyle}
            onNext={handleStep2Next}
          />
          <div className="oobe-progress">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className={`oobe-progress-dot ${i === step ? 'active' : ''}`} />
            ))}
          </div>
        </>
      )}
      
      {step === 2 && (
        <>
          <Step3
            theme={theme}
            onThemeChange={setTheme}
            onNext={handleStep3Next}
          />
          <div className="oobe-progress">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className={`oobe-progress-dot ${i === step ? 'active' : ''}`} />
            ))}
          </div>
        </>
      )}
      
      {step === 3 && (
        <>
          <Step4 onComplete={handleStep4Complete} onSkip={handleStep4Skip} />
          <div className="oobe-progress">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className={`oobe-progress-dot ${i === step ? 'active' : ''}`} />
            ))}
          </div>
        </>
      )}
      
      {step === 4 && (
        <div className="oobe-step">
          <div className="oobe-step-icon">
            <img src="/system_setup/WintoPhone_Setup.jpg" alt="Done" />
          </div>
          <h1 className="oobe-step-title">Готово!</h1>
          <p className="oobe-step-subtitle">Ваш телефон настроен</p>
          <button className="oobe-step-btn" onClick={onComplete}>Начать</button>
          <div className="oobe-progress">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className={`oobe-progress-dot ${i === step ? 'active' : ''}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OOBE;
