import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md',
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Logo image failed to load');
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const textFallback = target.nextElementSibling as HTMLElement;
    if (textFallback) {
      textFallback.style.display = 'block';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/lovable-uploads/b90719cc-2e3b-458b-92fc-27bea503ec8e.png"
        alt="Fourmula Logo" 
        className={`${sizeClasses[size]} w-auto object-contain`}
        onError={handleImageError}
        onLoad={() => console.log('Logo loaded successfully')}
      />
      <span 
        className={`font-inter font-semibold gradient-text ${textSizeClasses[size]} hidden`}
        style={{ display: 'none' }}
      >
        fourmula
      </span>
    </div>
  );
};

export default Logo;