import React from 'react';

interface CreatorSignatureProps {
  placement: 'splash' | 'about' | 'titlebar' | 'export' | 'gallery-footer' | 'invoice-footer' | 'welcome' | 'pitch';
}

const SIGNATURE = 'Built by ta-tech';

export function CreatorSignature({ placement }: CreatorSignatureProps) {
  switch (placement) {
    case 'splash':
      return (
        <div style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.05em',
          animation: 'fadeIn 1.2s ease 0.5s both',
        }}>
          {SIGNATURE}
        </div>
      );

    case 'titlebar':
      return (
        <span style={{
          fontSize: 10,
          color: 'rgba(255,255,255,0.25)',
          WebkitAppRegion: 'no-drag' as any,
        }}>
          {SIGNATURE}
        </span>
      );

    case 'about':
      return (
        <div style={{
          padding: 24,
          fontSize: 14,
          lineHeight: 1.7,
          color: 'rgba(255,255,255,0.7)',
          maxWidth: 420,
        }}>
          <p>
            YmShotS was built by ta-tech — because every creative
            deserves tools as exceptional as their vision.
          </p>
          <p style={{ marginTop: 16 }}>
            This is the v1.0. You flew it first.
          </p>
          <p style={{ marginTop: 16, fontStyle: 'italic', color: 'rgba(255,255,255,0.4)' }}>
            — ta-tech
          </p>
        </div>
      );

    case 'gallery-footer':
      return (
        <span style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.20)',
        }}>
          {SIGNATURE}
        </span>
      );

    case 'invoice-footer':
      return (
        <span style={{ fontSize: 10, color: '#666' }}>
          Powered by YmShotS
        </span>
      );

    default:
      return (
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
          {SIGNATURE}
        </span>
      );
  }
}
