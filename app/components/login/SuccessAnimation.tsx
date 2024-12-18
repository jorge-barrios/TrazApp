import { FC, useEffect, useState } from 'react';

interface SuccessAnimationProps {
  show: boolean;
  onAnimationComplete?: () => void;
}

const SuccessAnimation: FC<SuccessAnimationProps> = ({ show, onAnimationComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onAnimationComplete?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [show, onAnimationComplete]);

  if (!show && !isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm
        transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    </div>
  );
};

export default SuccessAnimation;
