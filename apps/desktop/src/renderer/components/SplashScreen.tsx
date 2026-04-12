import React, { useState, useEffect } from 'react';
import { CreatorSignature } from './CreatorSignature';

export function SplashScreen() {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // Fade in after a tiny delay
    const timer = setTimeout(() => setOpacity(1), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#0A0A0A',
      transition: 'opacity 0.8s ease',
      opacity,
    }}>
      {/* Logo / App name */}
      <div style={{
        fontSize: 48,
        fontWeight: 800,
        letterSpacing: '-0.03em',
        color: '#ffffff',
        marginBottom: 12,
      }}>
        YmShotS
      </div>

      {/* Tagline */}
      <div style={{
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: '0.1em',
        textTransform: 'lowercase',
        marginBottom: 48,
      }}>
        your moments. your shots.
      </div>

      {/* Creator signature */}
      <CreatorSignature placement="splash" />
    </div>
  );
}
