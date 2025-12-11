
import React from 'react';
import { useStore } from '../contexts/StoreContext';

const BrandLogo: React.FC<{ className?: string }> = ({ className }) => {
  const { appLogo } = useStore();

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      {/* Graphic Section */}
      <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
        {appLogo ? (
          <img 
            src={appLogo} 
            alt="Logo" 
            className="object-contain max-h-full max-w-full"
          />
        ) : (
          <svg 
            viewBox="120 20 160 140" 
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
          >
              {/* Peacock Body - Abstracted */}
              <path d="M180 80 Q160 80 160 100 Q160 130 180 150 Q200 170 200 130 Z" fill="#005eb8" />
              <circle cx="185" cy="90" r="3" fill="white" />
              <path d="M180 80 Q190 60 205 65" stroke="#005eb8" strokeWidth="3" fill="none" />
              <circle cx="205" cy="65" r="2" fill="#3dae49" />

              {/* Tail Feathers */}
              <path d="M160 100 Q140 60 180 40 Q220 60 200 130" fill="#3dae49" opacity="0.9" />
              <circle cx="170" cy="70" r="5" fill="white" opacity="0.8" />
              <circle cx="190" cy="60" r="5" fill="white" opacity="0.8" />
              <circle cx="205" cy="90" r="5" fill="white" opacity="0.8" />
          </svg>
        )}
      </div>

      {/* Text Section */}
      <div className="text-center shrink-0">
          <h1 className="font-extrabold text-gps-blue leading-tight tracking-tight text-lg md:text-xl uppercase">
            Volunteer
          </h1>
          <h2 className="font-bold text-gps-green text-[10px] md:text-xs uppercase tracking-[0.2em]">
            Management
          </h2>
      </div>
    </div>
  );
};

export default BrandLogo;
