"use client";

import { useRef, useEffect, useState } from 'react';

const themeConfig = {
  red: {
    gradient: "radial-gradient(ellipse at center, #6f0000 0%, #200122 100%)",
    accent: "#efbf04",
  },
  green: {
    gradient: "radial-gradient(ellipse at center, #15803d 0%, #166534 50%, #052e16 100%)",
    accent: "#efbf04",
  },
  blue: {
    gradient: "radial-gradient(ellipse at center, #004e92 0%, #000428 100%)",
    accent: "#efbf04",
  },
  roseGold: {
    gradient: "radial-gradient(ellipse at center, #dbe6f6 0%, #c5796d 100%)",
    accent: "#5d2f40",
  },
  peach: {
    gradient: "radial-gradient(ellipse at center, #ffedbc 0%, #ed4264 100%)",
    accent: "#5d2f40",
  },
  aurora: {
    gradient: "radial-gradient(ellipse at center, #667eea 0%, #764ba2 50%, #2b1055 100%)",
    accent: "#fbbf24",
  },
  ocean: {
    gradient: "radial-gradient(ellipse at center, #006d77 0%, #003049 50%, #001219 100%)",
    accent: "#ffd60a",
  },
  sunset: {
    gradient: "radial-gradient(ellipse at center, #ff6b35 0%, #f7931e 30%, #c1121f 70%, #370617 100%)",
    accent: "#ffe5d9",
  },
  jade: {
    gradient: "radial-gradient(ellipse at center, #064e3b 0%, #022c22 50%, #0a0e0d 100%)",
    accent: "#10b981",
  },
};

interface KhmerOGImageProps {
  guestSlug: string;
  displayName: string;
  themeName?: string;
  title?: string;
  subtitle?: string;
  details?: string;
  location?: string;
  onImageGenerated?: (dataUrl: string) => void;
}

export default function KhmerOGImage({ 
  guestSlug, 
  displayName,
  themeName = "red",
  title = "សូមគោរពអញ្ជើញ",
  subtitle = "សិរីសួស្ដីអាពាហ៍ពិពាហ៍",
  details = "អាទិត្យ ១៧ មេសា ២០២៦",
  location = "នៅគេហដ្ឋានខាងស្រី",
  onImageGenerated
}: KhmerOGImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const loadFont = async () => {
      try {
        // Try to load Khmer font
        const font = new FontFace(
          'Khmer Boran', 
          'url(/fonts/khmer.ttf)',
          { weight: '700' }
        );
        
        await font.load();
        document.fonts.add(font);
        setFontLoaded(true);
      } catch (error) {
        console.log('Khmer font not available, using fallback');
        // Use system fonts as fallback
        setFontLoaded(true);
      }
    };

    loadFont();
  }, []);

  useEffect(() => {
    if (fontLoaded && canvasRef.current) {
      generateOGImage();
    }
  }, [fontLoaded, guestSlug, themeName, displayName, title, subtitle, details, location]);

  const getTheme = (name: string) => {
    return themeConfig[name as keyof typeof themeConfig] || themeConfig.red;
  };

  const generateOGImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const theme = getTheme(themeName);

    // Set canvas dimensions (OG standard)
    canvas.width = 1200;
    canvas.height = 630;

    // Create gradient background
    const gradient = ctx.createRadialGradient(600, 315, 0, 600, 315, 800);
    
    const gradientColors = theme.gradient.match(/#[0-9a-f]{3,6}/gi) || ['#6f0000', '#200122'];
    gradient.addColorStop(0, gradientColors[0]);
    if (gradientColors.length > 2) {
      gradient.addColorStop(0.5, gradientColors[1]);
      gradient.addColorStop(1, gradientColors[2] || gradientColors[1]);
    } else {
      gradient.addColorStop(1, gradientColors[1]);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Add decorative elements
    ctx.fillStyle = `${theme.accent}66`;
    ctx.fillRect(40, 40, 1120, 2);

    // Set text properties
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw subtitle with gradient
    const subtitleGradient = ctx.createLinearGradient(400, 150, 800, 200);
    subtitleGradient.addColorStop(0, theme.accent);
    subtitleGradient.addColorStop(1, '#ffffff');
    
    ctx.fillStyle = subtitleGradient;
    ctx.font = 'bold 64px "Khmer Boran", "Noto Sans Khmer", "Khmer OS", sans-serif';
    ctx.fillText(subtitle, 600, 180);

    // Draw title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px "Khmer Boran", "Noto Sans Khmer", "Khmer OS", sans-serif';
    ctx.fillText(title, 600, 280);

    // Draw display name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px "Khmer Boran", "Noto Sans Khmer", "Khmer OS", sans-serif';
    ctx.fillText(displayName, 600, 360);

    // Draw details with separator
    ctx.strokeStyle = `${theme.accent}4d`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(200, 450);
    ctx.lineTo(1000, 450);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.9;
    ctx.font = 'bold 32px "Khmer Boran", "Noto Sans Khmer", "Khmer OS", sans-serif';
    ctx.fillText(details, 600, 480);

    // Draw location
    ctx.globalAlpha = 0.7;
    ctx.font = 'bold 24px "Khmer Boran", "Noto Sans Khmer", "Khmer OS", sans-serif';
    ctx.fillText(location, 600, 530);

    // Add decorative bottom line
    ctx.globalAlpha = 1;
    ctx.fillStyle = `${theme.accent}66`;
    ctx.fillRect(40, 588, 1120, 2);

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png');
    setImageDataUrl(dataUrl);
    
    // Callback for parent component
    if (onImageGenerated) {
      onImageGenerated(dataUrl);
    }
  };

  // For social media sharing, you might want to implement a download
  // or direct upload to your CDN here

  return (
    <>
      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }} 
      />
      
      {/* Development preview */}
      {process.env.NODE_ENV === 'development' && imageDataUrl && (
        <div style={{ textAlign: 'center' }}>
          <img 
            src={imageDataUrl} 
            alt="OG Preview"
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }} 
          />
        </div>
      )}
    </>
  );
}