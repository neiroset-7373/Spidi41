import React, { useEffect } from 'react';
import './start_android.css';

interface StartAndroidProps {
  onComplete: () => void;
  isFirstLaunch: boolean;
}

const StartAndroid: React.FC<StartAndroidProps> = ({ onComplete, isFirstLaunch }) => {
  const duration = isFirstLaunch ? 10000 : 4000;

  useEffect(() => {
    const t = setTimeout(onComplete, duration);
    return () => clearTimeout(t);
  }, [onComplete, duration]);

  return (
    <div className="start-android-screen">
      <img
        src="/system_setup/WintoPhone_Setup.jpg"
        alt="WintoPhone"
        className="start-android-image"
      />
    </div>
  );
};

export default StartAndroid;
