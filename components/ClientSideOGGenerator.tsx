"use client";

import { useEffect } from 'react';
import KhmerOGImage from './OgImage';

interface ClientSideOGGeneratorProps {
  guestSlug: string;
  displayName: string;
  themeName?: string;
}

export default function ClientSideOGGenerator({ 
  guestSlug, 
  displayName, 
  themeName = "red" 
}: ClientSideOGGeneratorProps) {
  
  useEffect(() => {
    console.log(`Generating OG image for: ${displayName}`);
  }, [guestSlug, displayName]);

  return (
    <>
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          position: 'fixed', 
          bottom: '20px', 
          right: '20px', 
          zIndex: 1000,
          background: 'white',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          maxWidth: '300px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
            OG Image Preview (Development)
          </h4>
          <KhmerOGImage
            guestSlug={guestSlug}
            displayName={displayName}
            themeName={themeName}
          />
        </div>
      )}
      
      <div style={{ display: 'none' }}>
        <KhmerOGImage
          guestSlug={guestSlug}
          displayName={displayName}
          themeName={themeName}
        />
      </div>
    </>
  );
}