import React from 'react';
import { PosterConfig, PosterLayout } from '../types';

interface PosterPreviewProps {
  text: string;
  config: PosterConfig | null;
  backgroundImageUrl: string | null;
  isLoading: boolean;
}

export const PosterPreview: React.FC<PosterPreviewProps> = ({ 
  text, 
  config, 
  backgroundImageUrl, 
  isLoading 
}) => {
  if (!config && !isLoading) {
    return (
      <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p>Enter text to generate your poster</p>
      </div>
    );
  }

  // Skeleton loading state
  if (isLoading && !config) {
     return (
      <div className="w-full aspect-[3/4] bg-gray-800 rounded-lg animate-pulse flex items-center justify-center relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-50"></div>
        <div className="text-gray-500 font-mono text-sm animate-bounce">Generating Art...</div>
      </div>
    );
  }

  const { colorPalette, fontStyle, layout } = config!;
  const bgImage = backgroundImageUrl || 'https://picsum.photos/800/1200?grayscale&blur=2'; // Fallback

  // Dynamic Styles
  const containerStyle: React.CSSProperties = {
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    boxShadow: `0 20px 50px -12px ${colorPalette.primary}66`, // Colored shadow based on palette
  };

  const textStyle: React.CSSProperties = {
    color: colorPalette.text,
    textShadow: `0 2px 10px ${colorPalette.secondary}80`, // Soft shadow for readability
  };

  // Layout Logic
  const getLayoutClasses = (layout: PosterLayout) => {
    switch (layout) {
      case PosterLayout.CENTERED:
        return "justify-center items-center text-center p-12";
      case PosterLayout.BOTTOM_HEAVY:
        return "justify-end items-start text-left p-12 pb-24";
      case PosterLayout.TOP_HEAVY:
        return "justify-start items-center text-center p-12 pt-24";
      case PosterLayout.SPLIT:
        return "justify-between items-start p-12";
      default:
        return "justify-center items-center";
    }
  };

  // Split text for visual interest if needed (simple implementation)
  const words = text.split(' ');
  const firstHalf = words.slice(0, Math.ceil(words.length / 2)).join(' ');
  const secondHalf = words.slice(Math.ceil(words.length / 2)).join(' ');

  return (
    <div className="relative w-full flex justify-center perspective-1000">
        {/* The Poster Canvas */}
        <div 
            id="poster-canvas"
            className={`
                relative w-full max-w-[600px] aspect-[3/4] 
                bg-gray-900 rounded-lg overflow-hidden 
                flex flex-col ${getLayoutClasses(layout)}
                transition-all duration-700 ease-in-out
                transform hover:scale-[1.01]
            `}
            style={containerStyle}
        >
            {/* Overlay Gradient to ensure text readability */}
            <div 
                className="absolute inset-0 opacity-40 mix-blend-multiply transition-opacity duration-1000"
                style={{ 
                    background: `linear-gradient(to bottom, ${colorPalette.primary}, ${colorPalette.secondary})` 
                }}
            />

            {/* Decorative Elements based on Layout */}
            <div className={`
                relative z-10 w-full
                ${fontStyle} 
                leading-tight tracking-tight
            `}>
                {layout === PosterLayout.SPLIT ? (
                    <>
                        <h1 className="text-6xl md:text-7xl font-bold uppercase mb-auto opacity-0 animate-fade-in-up" 
                            style={{ ...textStyle, animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                            {firstHalf}
                        </h1>
                        <div className="h-32"></div> {/* Spacer */}
                        <h1 className="text-6xl md:text-7xl font-bold uppercase text-right opacity-0 animate-fade-in-up" 
                            style={{ ...textStyle, animationDelay: '0.5s', animationFillMode: 'forwards' }}>
                            {secondHalf}
                        </h1>
                    </>
                ) : (
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase drop-shadow-2xl opacity-0 animate-fade-in-up" 
                        style={{ ...textStyle, animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                        {text}
                    </h1>
                )}
                
                {/* Decorative sub-line/graphic */}
                <div 
                    className="mt-6 w-24 h-2 bg-white/80 rounded-full mx-auto opacity-0 animate-width-grow"
                    style={{ 
                        backgroundColor: colorPalette.accent,
                        marginLeft: layout === PosterLayout.BOTTOM_HEAVY ? '0' : 'auto',
                        marginRight: layout === PosterLayout.BOTTOM_HEAVY ? 'auto' : 'auto',
                        animationDelay: '0.8s', 
                        animationFillMode: 'forwards' 
                    }}
                />
            </div>

            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" 
                 style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}} 
            />
        </div>
        
        <style>{`
            @keyframes fade-in-up {
                0% { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            @keyframes width-grow {
                0% { width: 0; opacity: 0; }
                100% { width: 6rem; opacity: 1; }
            }
        `}</style>
    </div>
  );
};