import React from 'react';
import { OOBE_PINCOD } from '../../../PinCodes/OOBE/OOBE_PINCOD';

interface Step4Props {
  onComplete: () => void;
  onSkip: () => void;
}

const Step4: React.FC<Step4Props> = ({ onComplete, onSkip }) => {
  return (
    <div className="oobe-step">
      <OOBE_PINCOD onComplete={onComplete} onSkip={onSkip} />
    </div>
  );
};

export default Step4;
