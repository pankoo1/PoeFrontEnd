import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const sizeMap = {
    sm: { width: 24, height: 24, textSize: 'text-sm' },
    md: { width: 32, height: 32, textSize: 'text-base' },
    lg: { width: 48, height: 48, textSize: 'text-lg' },
    xl: { width: 64, height: 64, textSize: 'text-xl' }
  };

  const { width, height, textSize } = sizeMap[size];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img 
        src="/logo.png" 
        alt="POE - Path Optimization Engine"
        width={width} 
        height={height}
        className="flex-shrink-0 object-contain"
      />
      {showText && (
        <span className={`font-bold text-primary ${textSize}`}>
          POE
        </span>
      )}
    </div>
  );
};

export default Logo;
