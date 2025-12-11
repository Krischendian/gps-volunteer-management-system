import React from 'react';
import { Heart, Star, Cloud, Sparkles, Zap } from 'lucide-react';

const AnimatedBackground: React.FC = () => {
  // Generate random shapes
  const shapes = Array.from({ length: 15 }).map((_, i) => {
    const icons = [Heart, Star, Cloud, Sparkles, Zap];
    const Icon = icons[Math.floor(Math.random() * icons.length)];
    const size = Math.floor(Math.random() * 30) + 15; // 15px to 45px
    const left = Math.floor(Math.random() * 100); // 0% to 100%
    const delay = Math.random() * 10; // 0s to 10s delay
    const duration = Math.random() * 10 + 15; // 15s to 25s duration
    const colorClass = [
      'text-gps-blue/20',
      'text-gps-green/20',
      'text-yellow-400/30',
      'text-pink-300/30'
    ][Math.floor(Math.random() * 4)];

    return (
      <div
        key={i}
        className={`absolute ${colorClass} animate-float`}
        style={{
          left: `${left}%`,
          top: '100%',
          animationDelay: `-${delay}s`, // Negative delay to start immediately
          animationDuration: `${duration}s`,
        }}
      >
        <Icon size={size} fill="currentColor" />
      </div>
    );
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {/* Pattern Overlay */}
      <div className="absolute inset-0 bg-dot-pattern opacity-40"></div>
      
      {/* Floating Shapes */}
      {shapes}
    </div>
  );
};

export default AnimatedBackground;