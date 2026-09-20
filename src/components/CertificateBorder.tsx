import React from 'react';
import { ReportDesignConfig } from '../data/reportDesign';

interface CertificateBorderProps {
  children: React.ReactNode;
  className?: string;
  designConfig?: ReportDesignConfig;
  onUpdateDesignConfig?: (newConfig: ReportDesignConfig) => void;
  isPrintOnly?: boolean;
  isEditingMode?: boolean;
}

export const CertificateBorder: React.FC<CertificateBorderProps> = ({
  children,
  className = '',
  designConfig,
  onUpdateDesignConfig,
  isPrintOnly = false,
  isEditingMode = false,
}) => {
  const paddingTop = designConfig?.framePaddingTop ?? 16;
  const paddingBottom = designConfig?.framePaddingBottom ?? 16;
  const paddingLeft = designConfig?.framePaddingLeft ?? 20;
  const paddingRight = designConfig?.framePaddingRight ?? 20;

  // Islamic Academic Palette sesuai spesifikasi resmi:
  // Deep Islamic Green: #1F6B4F
  // Dark Forest Green: #174D3A
  // Elegant Gold: #B28A3A
  // Soft Champagne Gold: #D8BE78
  // Warm Ivory: #FFFDF5
  const colorDarkForest = '#174D3A';
  const colorIslamicGreen = '#1F6B4F';
  const colorElegantGold = '#B28A3A';
  const colorChampagneGold = '#D8BE78';

  // Drag handlers for Frame Padding in all 4 directions (Top, Bottom, Left, Right)
  const handleStartDrag = (
    edge: 'top' | 'bottom' | 'left' | 'right',
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onUpdateDesignConfig || !designConfig) return;

    const startY = e.clientY;
    const startX = e.clientX;
    const initialTop = paddingTop;
    const initialBottom = paddingBottom;
    const initialLeft = paddingLeft;
    const initialRight = paddingRight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const deltaX = moveEvent.clientX - startX;

      if (edge === 'top') {
        const nextTop = Math.max(0, Math.min(60, Math.round(initialTop + deltaY)));
        onUpdateDesignConfig({ ...designConfig, framePaddingTop: nextTop });
      } else if (edge === 'bottom') {
        const nextBottom = Math.max(0, Math.min(60, Math.round(initialBottom - deltaY)));
        onUpdateDesignConfig({ ...designConfig, framePaddingBottom: nextBottom });
      } else if (edge === 'left') {
        const nextLeft = Math.max(0, Math.min(60, Math.round(initialLeft + deltaX)));
        onUpdateDesignConfig({ ...designConfig, framePaddingLeft: nextLeft });
      } else if (edge === 'right') {
        const nextRight = Math.max(0, Math.min(60, Math.round(initialRight - deltaX)));
        onUpdateDesignConfig({ ...designConfig, framePaddingRight: nextRight });
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = edge === 'top' || edge === 'bottom' ? 'ns-resize' : 'ew-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Border band thickness (46px ≈ 12.2mm)
  const B = 46;
  // Corner rosette dimensions (64px × 64px)
  const C = 64;

  return (
    <div 
      className={`frame-container relative w-full h-full bg-white text-stone-900 box-border group/frame ${className}`}
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* =========================================================================
          MASTER TEMPLATE: BINGKAI RAPORT PONDOK MODERN ISLAMI
          (ELEGANT ADAPTIVE ISLAMIC GEOMETRIC REPORT FRAME - F4 210 × 330 mm)
          Komponen:
          - 4 Pita Pola Geometris Islami (Atas, Bawah, Kiri, Kanan)
          - 4 Roset Sudut Arabesque Besar (Top-Left, Top-Right, Bottom-Left, Bottom-Right)
          - 4 Medallion Diamond Tengah (Atas, Bawah, Kiri, Kanan)
          - Garis Ganda Emas Luar & Garis Ganda Emas/Hijau Dalam
          ========================================================================= */}
      <div 
        className="absolute inset-0 pointer-events-none select-none z-10"
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        {/* SVG Global Definitions: Islamic Geometric Lattice Patterns */}
        <svg width="0" height="0" className="absolute">
          <defs>
            {/* Pola Geometris Horizontal (Bintang 8 Sudut & Anyaman Emas) */}
            <pattern id="islamic-band-h" width="40" height={B} patternUnits="userSpaceOnUse">
              {/* Latar Belakang Hijau Hutan Gelap */}
              <rect width="40" height={B} fill={colorDarkForest} />
              
              {/* Garis Aksen Emas Tepi Atas & Bawah Pita */}
              <line x1="0" y1="2" x2="40" y2="2" stroke={colorElegantGold} strokeWidth="1" />
              <line x1="0" y1="4" x2="40" y2="4" stroke={colorChampagneGold} strokeWidth="0.5" />
              <line x1="0" y1={B - 2} x2="40" y2={B - 2} stroke={colorElegantGold} strokeWidth="1" />
              <line x1="0" y1={B - 4} x2="40" y2={B - 4} stroke={colorChampagneGold} strokeWidth="0.5" />

              {/* Anyaman Geometris Islami: Bintang 8 Sudut (Khatim Sulayman / Rub el Hizb) */}
              <g transform="translate(20, 23)">
                {/* 2 Persegi Bersilang Membentuk Bintang 8 */}
                <rect x="-8" y="-8" width="16" height="16" fill="none" stroke={colorChampagneGold} strokeWidth="0.85" />
                <rect x="-8" y="-8" width="16" height="16" fill="none" stroke={colorChampagneGold} strokeWidth="0.85" transform="rotate(45)" />
                {/* Inti Bintang */}
                <circle cx="0" cy="0" r="3.5" fill={colorIslamicGreen} stroke={colorElegantGold} strokeWidth="0.75" />
                <circle cx="0" cy="0" r="1.5" fill={colorChampagneGold} />
              </g>

              {/* Setengah Bintang di Tepi Kiri & Kanan (Seamless Looping) */}
              <g transform="translate(0, 23)">
                <rect x="-8" y="-8" width="16" height="16" fill="none" stroke={colorChampagneGold} strokeWidth="0.85" />
                <rect x="-8" y="-8" width="16" height="16" fill="none" stroke={colorChampagneGold} strokeWidth="0.85" transform="rotate(45)" />
                <circle cx="0" cy="0" r="3.5" fill={colorIslamicGreen} stroke={colorElegantGold} strokeWidth="0.75" />
                <circle cx="0" cy="0" r="1.5" fill={colorChampagneGold} />
              </g>
              <g transform="translate(40, 23)">
                <rect x="-8" y="-8" width="16" height="16" fill="none" stroke={colorChampagneGold} strokeWidth="0.85" />
                <rect x="-8" y="-8" width="16" height="16" fill="none" stroke={colorChampagneGold} strokeWidth="0.85" transform="rotate(45)" />
                <circle cx="0" cy="0" r="3.5" fill={colorIslamicGreen} stroke={colorElegantGold} strokeWidth="0.75" />
                <circle cx="0" cy="0" r="1.5" fill={colorChampagneGold} />
              </g>

              {/* Tali Anyaman Penghubung (Interlacing Straps) */}
              <path d="M 0,23 L 10,13 L 20,23 L 30,13 L 40,23" fill="none" stroke={colorElegantGold} strokeWidth="0.75" />
              <path d="M 0,23 L 10,33 L 20,23 L 30,33 L 40,23" fill="none" stroke={colorElegantGold} strokeWidth="0.75" />
              <circle cx="10" cy="23" r="1.5" fill={colorChampagneGold} />
              <circle cx="30" cy="23" r="1.5" fill={colorChampagneGold} />
            </pattern>

            {/* Pola Geometris Vertikal (Sisi Kiri & Kanan) */}
            <pattern id="islamic-band-v" width={B} height="40" patternUnits="userSpaceOnUse">
              <rect width={B} height="40" fill={colorDarkForest} />
              
              <line x1="2" y1="0" x2="2" y2="40" stroke={colorElegantGold} strokeWidth="1" />
              <line x1="4" y1="0" x2="4" y2="40" stroke={colorChampagneGold} strokeWidth="0.5" />
              <line x1={B - 2} y1="0" x2={B - 2} y2="40" stroke={colorElegantGold} strokeWidth="1" />
              <line x1={B - 4} y1="0" x2={B - 4} y2="40" stroke={colorChampagneGold} strokeWidth="0.5" />

              <g transform="translate(23, 20)">
                <rect x="-8" y="-8" width="16" height="16" fill="none" stroke={colorChampagneGold} strokeWidth="0.85" />
                <rect x="-8" y="-8" width="16" height="16" fill="none" stroke={colorChampagneGold} strokeWidth="0.85" transform="rotate(45)" />
                <circle cx="0" cy="0" r="3.5" fill={colorIslamicGreen} stroke={colorElegantGold} strokeWidth="0.75" />
                <circle cx="0" cy="0" r="1.5" fill={colorChampagneGold} />
              </g>

              <g transform="translate(23, 0)">
                <rect x="-8" y="-8" width="16" height="16" fill="none" stroke={colorChampagneGold} strokeWidth="0.85" />
                <rect x="-8" y="-8" width="16" height="16" fill="none" stroke={colorChampagneGold} strokeWidth="0.85" transform="rotate(45)" />
                <circle cx="0" cy="0" r="3.5" fill={colorIslamicGreen} stroke={colorElegantGold} strokeWidth="0.75" />
                <circle cx="0" cy="0" r="1.5" fill={colorChampagneGold} />
              </g>
              <g transform="translate(23, 40)">
                <rect x="-8" y="-8" width="16" height="16" fill="none" stroke={colorChampagneGold} strokeWidth="0.85" />
                <rect x="-8" y="-8" width="16" height="16" fill="none" stroke={colorChampagneGold} strokeWidth="0.85" transform="rotate(45)" />
                <circle cx="0" cy="0" r="3.5" fill={colorIslamicGreen} stroke={colorElegantGold} strokeWidth="0.75" />
                <circle cx="0" cy="0" r="1.5" fill={colorChampagneGold} />
              </g>

              <path d="M 23,0 L 13,10 L 23,20 L 13,30 L 23,40" fill="none" stroke={colorElegantGold} strokeWidth="0.75" />
              <path d="M 23,0 L 33,10 L 23,20 L 33,30 L 23,40" fill="none" stroke={colorElegantGold} strokeWidth="0.75" />
              <circle cx="23" cy="10" r="1.5" fill={colorChampagneGold} />
              <circle cx="23" cy="30" r="1.5" fill={colorChampagneGold} />
            </pattern>
          </defs>
        </svg>

        {/* 1. SISI ATAS (TOP BAND) */}
        <div 
          className="absolute"
          style={{ top: 0, left: `${B}px`, right: `${B}px`, height: `${B}px` }}
        >
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="url(#islamic-band-h)" />
          </svg>
        </div>

        {/* 2. SISI BAWAH (BOTTOM BAND) */}
        <div 
          className="absolute"
          style={{ bottom: 0, left: `${B}px`, right: `${B}px`, height: `${B}px` }}
        >
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="url(#islamic-band-h)" />
          </svg>
        </div>

        {/* 3. SISI KIRI (LEFT BAND) */}
        <div 
          className="absolute"
          style={{ top: `${B}px`, bottom: `${B}px`, left: 0, width: `${B}px` }}
        >
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="url(#islamic-band-v)" />
          </svg>
        </div>

        {/* 4. SISI KANAN (RIGHT BAND) */}
        <div 
          className="absolute"
          style={{ top: `${B}px`, bottom: `${B}px`, right: 0, width: `${B}px` }}
        >
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="url(#islamic-band-v)" />
          </svg>
        </div>

        {/* =========================================================================
            4 ROSET SUDUT ARABESQUE BESAR (4 LARGE CORNER ROSETTES)
            Didesain presisi 64px × 64px dengan motif mandala 8 & 16 kelopak emas-hijau
           ========================================================================= */}
        {/* SUDUT KIRI ATAS (TOP-LEFT CORNER) */}
        <div 
          className="absolute z-20"
          style={{ top: 0, left: 0, width: `${C}px`, height: `${C}px` }}
        >
          <svg width={C} height={C} viewBox={`0 0 ${C} ${C}`} xmlns="http://www.w3.org/2000/svg">
            {/* Latar Belakang & Bingkai Siku Sudut */}
            <path d={`M 0,0 L ${C},0 L ${C},${B} L ${B},${B} L ${B},${C} L 0,${C} Z`} fill={colorDarkForest} />
            <path d={`M 2,2 L ${C},2 M 2,2 L 2,${C}`} stroke={colorElegantGold} strokeWidth="1.5" fill="none" />
            <path d={`M 4,4 L ${C},4 M 4,4 L 4,${C}`} stroke={colorChampagneGold} strokeWidth="0.8" fill="none" />
            <path d={`M ${B - 2},${B - 2} L ${C},${B - 2} M ${B - 2},${B - 2} L ${B - 2},${C}`} stroke={colorElegantGold} strokeWidth="1.2" fill="none" />

            {/* Roset Arabesque Mandala Sudut */}
            <g transform={`translate(${B / 2 + 3}, ${B / 2 + 3})`}>
              {/* Lingkaran Konsentris Berornamen */}
              <circle cx="0" cy="0" r="23" fill={colorDarkForest} stroke={colorElegantGold} strokeWidth="1.2" />
              <circle cx="0" cy="0" r="20" fill="none" stroke={colorChampagneGold} strokeWidth="0.75" strokeDasharray="1.5, 1" />
              <circle cx="0" cy="0" r="16.5" fill={colorIslamicGreen} stroke={colorElegantGold} strokeWidth="1" />
              <circle cx="0" cy="0" r="12" fill="none" stroke={colorChampagneGold} strokeWidth="0.8" />
              <circle cx="0" cy="0" r="8" fill={colorDarkForest} stroke={colorElegantGold} strokeWidth="1" />

              {/* 16 Kelopak Bunga Emas Berputar */}
              {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((angle) => (
                <g key={angle} transform={`rotate(${angle})`}>
                  <line x1="0" y1="-12" x2="0" y2="-19.5" stroke={colorChampagneGold} strokeWidth="0.8" />
                  <circle cx="0" cy="-20" r="1.3" fill={colorChampagneGold} />
                </g>
              ))}

              {/* Bintang 8 Sudut Inti */}
              <rect x="-5" y="-5" width="10" height="10" fill="none" stroke={colorChampagneGold} strokeWidth="1" />
              <rect x="-5" y="-5" width="10" height="10" fill="none" stroke={colorChampagneGold} strokeWidth="1" transform="rotate(45)" />

              {/* Inti Tengah Zamrud & Emas */}
              <circle cx="0" cy="0" r="4" fill={colorIslamicGreen} stroke={colorElegantGold} strokeWidth="1" />
              <circle cx="0" cy="0" r="1.6" fill={colorChampagneGold} />
            </g>
          </svg>
        </div>

        {/* SUDUT KANAN ATAS (TOP-RIGHT CORNER) */}
        <div 
          className="absolute z-20"
          style={{ top: 0, right: 0, width: `${C}px`, height: `${C}px` }}
        >
          <svg width={C} height={C} viewBox={`0 0 ${C} ${C}`} xmlns="http://www.w3.org/2000/svg">
            <path d={`M 0,0 L ${C},0 L ${C},${C} L ${C - B},${C} L ${C - B},${B} L 0,${B} Z`} fill={colorDarkForest} />
            <path d={`M 0,2 L ${C - 2},2 L ${C - 2},${C}`} stroke={colorElegantGold} strokeWidth="1.5" fill="none" />
            <path d={`M 0,4 L ${C - 4},4 L ${C - 4},${C}`} stroke={colorChampagneGold} strokeWidth="0.8" fill="none" />
            <path d={`M 0,${B - 2} L ${C - B + 2},${B - 2} L ${C - B + 2},${C}`} stroke={colorElegantGold} strokeWidth="1.2" fill="none" />

            <g transform={`translate(${C - B / 2 - 3}, ${B / 2 + 3})`}>
              <circle cx="0" cy="0" r="23" fill={colorDarkForest} stroke={colorElegantGold} strokeWidth="1.2" />
              <circle cx="0" cy="0" r="20" fill="none" stroke={colorChampagneGold} strokeWidth="0.75" strokeDasharray="1.5, 1" />
              <circle cx="0" cy="0" r="16.5" fill={colorIslamicGreen} stroke={colorElegantGold} strokeWidth="1" />
              <circle cx="0" cy="0" r="12" fill="none" stroke={colorChampagneGold} strokeWidth="0.8" />
              <circle cx="0" cy="0" r="8" fill={colorDarkForest} stroke={colorElegantGold} strokeWidth="1" />

              {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((angle) => (
                <g key={angle} transform={`rotate(${angle})`}>
                  <line x1="0" y1="-12" x2="0" y2="-19.5" stroke={colorChampagneGold} strokeWidth="0.8" />
                  <circle cx="0" cy="-20" r="1.3" fill={colorChampagneGold} />
                </g>
              ))}

              <rect x="-5" y="-5" width="10" height="10" fill="none" stroke={colorChampagneGold} strokeWidth="1" />
              <rect x="-5" y="-5" width="10" height="10" fill="none" stroke={colorChampagneGold} strokeWidth="1" transform="rotate(45)" />

              <circle cx="0" cy="0" r="4" fill={colorIslamicGreen} stroke={colorElegantGold} strokeWidth="1" />
              <circle cx="0" cy="0" r="1.6" fill={colorChampagneGold} />
            </g>
          </svg>
        </div>

        {/* SUDUT KIRI BAWAH (BOTTOM-LEFT CORNER) */}
        <div 
          className="absolute z-20"
          style={{ bottom: 0, left: 0, width: `${C}px`, height: `${C}px` }}
        >
          <svg width={C} height={C} viewBox={`0 0 ${C} ${C}`} xmlns="http://www.w3.org/2000/svg">
            <path d={`M 0,0 L ${B},0 L ${B},${C - B} L ${C},${C - B} L ${C},${C} L 0,${C} Z`} fill={colorDarkForest} />
            <path d={`M 2,0 L 2,${C - 2} L ${C},${C - 2}`} stroke={colorElegantGold} strokeWidth="1.5" fill="none" />
            <path d={`M 4,0 L 4,${C - 4} L ${C},${C - 4}`} stroke={colorChampagneGold} strokeWidth="0.8" fill="none" />
            <path d={`M ${B - 2},0 L ${B - 2},${C - B + 2} L ${C},${C - B + 2}`} stroke={colorElegantGold} strokeWidth="1.2" fill="none" />

            <g transform={`translate(${B / 2 + 3}, ${C - B / 2 - 3})`}>
              <circle cx="0" cy="0" r="23" fill={colorDarkForest} stroke={colorElegantGold} strokeWidth="1.2" />
              <circle cx="0" cy="0" r="20" fill="none" stroke={colorChampagneGold} strokeWidth="0.75" strokeDasharray="1.5, 1" />
              <circle cx="0" cy="0" r="16.5" fill={colorIslamicGreen} stroke={colorElegantGold} strokeWidth="1" />
              <circle cx="0" cy="0" r="12" fill="none" stroke={colorChampagneGold} strokeWidth="0.8" />
              <circle cx="0" cy="0" r="8" fill={colorDarkForest} stroke={colorElegantGold} strokeWidth="1" />

              {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((angle) => (
                <g key={angle} transform={`rotate(${angle})`}>
                  <line x1="0" y1="-12" x2="0" y2="-19.5" stroke={colorChampagneGold} strokeWidth="0.8" />
                  <circle cx="0" cy="-20" r="1.3" fill={colorChampagneGold} />
                </g>
              ))}

              <rect x="-5" y="-5" width="10" height="10" fill="none" stroke={colorChampagneGold} strokeWidth="1" />
              <rect x="-5" y="-5" width="10" height="10" fill="none" stroke={colorChampagneGold} strokeWidth="1" transform="rotate(45)" />

              <circle cx="0" cy="0" r="4" fill={colorIslamicGreen} stroke={colorElegantGold} strokeWidth="1" />
              <circle cx="0" cy="0" r="1.6" fill={colorChampagneGold} />
            </g>
          </svg>
        </div>

        {/* SUDUT KANAN BAWAH (BOTTOM-RIGHT CORNER) */}
        <div 
          className="absolute z-20"
          style={{ bottom: 0, right: 0, width: `${C}px`, height: `${C}px` }}
        >
          <svg width={C} height={C} viewBox={`0 0 ${C} ${C}`} xmlns="http://www.w3.org/2000/svg">
            <path d={`M ${C - B},0 L ${C},0 L ${C},${C} L 0,${C} L 0,${C - B} L ${C - B},${C - B} Z`} fill={colorDarkForest} />
            <path d={`M ${C - 2},0 L ${C - 2},${C - 2} L 0,${C - 2}`} stroke={colorElegantGold} strokeWidth="1.5" fill="none" />
            <path d={`M ${C - 4},0 L ${C - 4},${C - 4} L 0,${C - 4}`} stroke={colorChampagneGold} strokeWidth="0.8" fill="none" />
            <path d={`M ${C - B + 2},0 L ${C - B + 2},${C - B + 2} L 0,${C - B + 2}`} stroke={colorElegantGold} strokeWidth="1.2" fill="none" />

            <g transform={`translate(${C - B / 2 - 3}, ${C - B / 2 - 3})`}>
              <circle cx="0" cy="0" r="23" fill={colorDarkForest} stroke={colorElegantGold} strokeWidth="1.2" />
              <circle cx="0" cy="0" r="20" fill="none" stroke={colorChampagneGold} strokeWidth="0.75" strokeDasharray="1.5, 1" />
              <circle cx="0" cy="0" r="16.5" fill={colorIslamicGreen} stroke={colorElegantGold} strokeWidth="1" />
              <circle cx="0" cy="0" r="12" fill="none" stroke={colorChampagneGold} strokeWidth="0.8" />
              <circle cx="0" cy="0" r="8" fill={colorDarkForest} stroke={colorElegantGold} strokeWidth="1" />

              {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((angle) => (
                <g key={angle} transform={`rotate(${angle})`}>
                  <line x1="0" y1="-12" x2="0" y2="-19.5" stroke={colorChampagneGold} strokeWidth="0.8" />
                  <circle cx="0" cy="-20" r="1.3" fill={colorChampagneGold} />
                </g>
              ))}

              <rect x="-5" y="-5" width="10" height="10" fill="none" stroke={colorChampagneGold} strokeWidth="1" />
              <rect x="-5" y="-5" width="10" height="10" fill="none" stroke={colorChampagneGold} strokeWidth="1" transform="rotate(45)" />

              <circle cx="0" cy="0" r="4" fill={colorIslamicGreen} stroke={colorElegantGold} strokeWidth="1" />
              <circle cx="0" cy="0" r="1.6" fill={colorChampagneGold} />
            </g>
          </svg>
        </div>

        {/* =========================================================================
            4 MEDALLION DIAMOND ARABESQUE TENGAH (CENTER ORNAMENTS)
            Persis di tengah sisi Atas, Bawah, Kiri, dan Kanan
           ========================================================================= */}
        {/* MEDALLION TENGAH ATAS (TOP-CENTER) */}
        <div 
          className="absolute z-20 -translate-x-1/2"
          style={{ top: 0, left: '50%', width: '56px', height: `${B + 6}px` }}
        >
          <svg width="56" height={B + 6} viewBox={`0 0 56 ${B + 6}`} xmlns="http://www.w3.org/2000/svg">
            <path d={`M 0,0 L 56,0 L 46,${B} L 28,${B + 6} L 10,${B} Z`} fill={colorDarkForest} stroke={colorElegantGold} strokeWidth="1.2" />
            <g transform={`translate(28, ${B / 2 + 1})`}>
              <polygon points="0,-16 12,0 0,16 -12,0" fill={colorIslamicGreen} stroke={colorChampagneGold} strokeWidth="1" />
              <polygon points="0,-10 8,0 0,10 -8,0" fill={colorDarkForest} stroke={colorElegantGold} strokeWidth="0.8" />
              <circle cx="0" cy="0" r="3" fill={colorChampagneGold} />
              <circle cx="0" cy="0" r="1.2" fill={colorDarkForest} />
            </g>
          </svg>
        </div>

        {/* MEDALLION TENGAH BAWAH (BOTTOM-CENTER) */}
        <div 
          className="absolute z-20 -translate-x-1/2"
          style={{ bottom: 0, left: '50%', width: '56px', height: `${B + 6}px` }}
        >
          <svg width="56" height={B + 6} viewBox={`0 0 56 ${B + 6}`} xmlns="http://www.w3.org/2000/svg">
            <path d={`M 10,6 L 28,0 L 46,6 L 56,${B + 6} L 0,${B + 6} Z`} fill={colorDarkForest} stroke={colorElegantGold} strokeWidth="1.2" />
            <g transform={`translate(28, ${B / 2 + 5})`}>
              <polygon points="0,-16 12,0 0,16 -12,0" fill={colorIslamicGreen} stroke={colorChampagneGold} strokeWidth="1" />
              <polygon points="0,-10 8,0 0,10 -8,0" fill={colorDarkForest} stroke={colorElegantGold} strokeWidth="0.8" />
              <circle cx="0" cy="0" r="3" fill={colorChampagneGold} />
              <circle cx="0" cy="0" r="1.2" fill={colorDarkForest} />
            </g>
          </svg>
        </div>

        {/* MEDALLION TENGAH KIRI (LEFT-CENTER) */}
        <div 
          className="absolute z-20 -translate-y-1/2"
          style={{ left: 0, top: '50%', width: `${B + 6}px`, height: '56px' }}
        >
          <svg width={B + 6} height="56" viewBox={`0 0 ${B + 6} 56`} xmlns="http://www.w3.org/2000/svg">
            <path d={`M 0,0 L ${B},10 L ${B + 6},28 L ${B},46 L 0,56 Z`} fill={colorDarkForest} stroke={colorElegantGold} strokeWidth="1.2" />
            <g transform={`translate(${B / 2 + 1}, 28)`}>
              <polygon points="-16,0 0,-12 16,0 0,12" fill={colorIslamicGreen} stroke={colorChampagneGold} strokeWidth="1" />
              <polygon points="-10,0 0,-8 10,0 0,8" fill={colorDarkForest} stroke={colorElegantGold} strokeWidth="0.8" />
              <circle cx="0" cy="0" r="3" fill={colorChampagneGold} />
              <circle cx="0" cy="0" r="1.2" fill={colorDarkForest} />
            </g>
          </svg>
        </div>

        {/* MEDALLION TENGAH KANAN (RIGHT-CENTER) */}
        <div 
          className="absolute z-20 -translate-y-1/2"
          style={{ right: 0, top: '50%', width: `${B + 6}px`, height: '56px' }}
        >
          <svg width={B + 6} height="56" viewBox={`0 0 ${B + 6} 56`} xmlns="http://www.w3.org/2000/svg">
            <path d={`M ${B + 6},0 L 6,10 L 0,28 L 6,46 L ${B + 6},56 Z`} fill={colorDarkForest} stroke={colorElegantGold} strokeWidth="1.2" />
            <g transform={`translate(${B / 2 + 5}, 28)`}>
              <polygon points="-16,0 0,-12 16,0 0,12" fill={colorIslamicGreen} stroke={colorChampagneGold} strokeWidth="1" />
              <polygon points="-10,0 0,-8 10,0 0,8" fill={colorDarkForest} stroke={colorElegantGold} strokeWidth="0.8" />
              <circle cx="0" cy="0" r="3" fill={colorChampagneGold} />
              <circle cx="0" cy="0" r="1.2" fill={colorDarkForest} />
            </g>
          </svg>
        </div>

        {/* =========================================================================
            GARIS BATAS GANDA EMAS LUAR & DALAM (DOUBLE GOLD HAILINES)
           ========================================================================= */}
        {/* Garis Emas Paling Luar 1.5px */}
        <div 
          className="absolute"
          style={{ top: '1px', bottom: '1px', left: '1px', right: '1px', border: `1.5px solid ${colorElegantGold}`, pointerEvents: 'none' }}
        />
        {/* Garis Emas Kedua Luar 0.75px */}
        <div 
          className="absolute"
          style={{ top: '3.5px', bottom: '3.5px', left: '3.5px', right: '3.5px', border: `0.75px solid ${colorChampagneGold}`, pointerEvents: 'none' }}
        />

        {/* Garis Emas Dalam 1.5px */}
        <div 
          className="absolute"
          style={{ top: `${B}px`, bottom: `${B}px`, left: `${B}px`, right: `${B}px`, border: `1.5px solid ${colorElegantGold}`, pointerEvents: 'none' }}
        />
        {/* Garis Hijau Dalam Sekunder 0.75px */}
        <div 
          className="absolute"
          style={{ top: `${B + 3}px`, bottom: `${B + 3}px`, left: `${B + 3}px`, right: `${B + 3}px`, border: `0.75px solid ${colorIslamicGreen}`, pointerEvents: 'none' }}
        />
      </div>

      {/* =========================================================================
          AREA KONTEN RAPORT (DI DALAM BINGKAI BERSIH DENGAN ZONA AMAN)
          ========================================================================= */}
      <div
        className="w-full h-full box-border relative flex flex-col justify-between z-20"
        style={{
          padding: `${B + 4 + paddingTop}px ${B + 4 + paddingRight}px ${B + 4 + paddingBottom}px ${B + 4 + paddingLeft}px`,
          boxSizing: 'border-box',
          backgroundColor: 'transparent',
        }}
      >
        {/* =========================================================================
            EXCEL-STYLE 4-DIRECTIONAL BORDER RESIZE HANDLERS & BADGES (ATAS, BAWAH, KIRI, KANAN)
           ========================================================================= */}
        {isEditingMode && !isPrintOnly && onUpdateDesignConfig && designConfig && (
          <>
            {/* 1. ATAS: Drag Line & Quick Adjuster Badge */}
            <div
              data-editing-control="true"
              className="no-print absolute top-0 left-0 right-0 h-3 -mt-1.5 cursor-ns-resize z-40 flex items-center justify-center group/edge-top"
              onMouseDown={(e) => handleStartDrag('top', e)}
              title="Geser batas atas bingkai (Atas/Bawah) seperti Excel"
            >
              <div className="w-full h-[2px] bg-transparent group-hover/edge-top:bg-emerald-500/80 transition-colors" />
            </div>

            <div 
              data-editing-control="true"
              className="no-print absolute top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover/frame:opacity-100 hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-stone-900/95 text-white text-[9px] px-2 py-0.5 rounded-full shadow-lg border border-emerald-500/50 z-50 select-none"
            >
              <span className="text-emerald-300 font-bold">⬍ Padding Atas: {paddingTop}px</span>
              <button
                type="button"
                onClick={() => onUpdateDesignConfig({ ...designConfig, framePaddingTop: Math.max(0, paddingTop - 2) })}
                className="w-4 h-4 rounded bg-stone-800 hover:bg-emerald-600 flex items-center justify-center font-bold text-xs"
                title="Kurangi Padding Atas (-2px)"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => onUpdateDesignConfig({ ...designConfig, framePaddingTop: Math.min(60, paddingTop + 2) })}
                className="w-4 h-4 rounded bg-stone-800 hover:bg-emerald-600 flex items-center justify-center font-bold text-xs"
                title="Tambah Padding Atas (+2px)"
              >
                +
              </button>
            </div>

            {/* 2. BAWAH: Drag Line & Quick Adjuster Badge */}
            <div
              data-editing-control="true"
              className="no-print absolute bottom-0 left-0 right-0 h-3 -mb-1.5 cursor-ns-resize z-40 flex items-center justify-center group/edge-bottom"
              onMouseDown={(e) => handleStartDrag('bottom', e)}
              title="Geser batas bawah bingkai (Atas/Bawah) seperti Excel"
            >
              <div className="w-full h-[2px] bg-transparent group-hover/edge-bottom:bg-emerald-500/80 transition-colors" />
            </div>

            <div 
              data-editing-control="true"
              className="no-print absolute bottom-14 left-1/2 -translate-x-1/2 opacity-0 group-hover/frame:opacity-100 hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-stone-900/95 text-white text-[9px] px-2 py-0.5 rounded-full shadow-lg border border-emerald-500/50 z-50 select-none"
            >
              <span className="text-emerald-300 font-bold">⬍ Padding Bawah: {paddingBottom}px</span>
              <button
                type="button"
                onClick={() => onUpdateDesignConfig({ ...designConfig, framePaddingBottom: Math.max(0, paddingBottom - 2) })}
                className="w-4 h-4 rounded bg-stone-800 hover:bg-emerald-600 flex items-center justify-center font-bold text-xs"
                title="Kurangi Padding Bawah (-2px)"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => onUpdateDesignConfig({ ...designConfig, framePaddingBottom: Math.min(60, paddingBottom + 2) })}
                className="w-4 h-4 rounded bg-stone-800 hover:bg-emerald-600 flex items-center justify-center font-bold text-xs"
                title="Tambah Padding Bawah (+2px)"
              >
                +
              </button>
            </div>

            {/* 3. KIRI: Drag Line & Quick Adjuster Badge */}
            <div
              data-editing-control="true"
              className="no-print absolute top-0 bottom-0 left-0 w-3 -ml-1.5 cursor-ew-resize z-40 flex items-center justify-center group/edge-left"
              onMouseDown={(e) => handleStartDrag('left', e)}
              title="Geser batas kiri bingkai (Kiri/Kanan) seperti Excel"
            >
              <div className="h-full w-[2px] bg-transparent group-hover/edge-left:bg-emerald-500/80 transition-colors" />
            </div>

            <div 
              data-editing-control="true"
              className="no-print absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover/frame:opacity-100 hover:opacity-100 transition-opacity flex flex-col items-center gap-1 bg-stone-900/95 text-white text-[9px] px-1.5 py-2 rounded-xl shadow-lg border border-emerald-500/50 z-50 select-none"
            >
              <span className="text-emerald-300 font-bold [writing-mode:vertical-lr] rotate-180">Kiri {paddingLeft}px</span>
              <button
                type="button"
                onClick={() => onUpdateDesignConfig({ ...designConfig, framePaddingLeft: Math.max(0, paddingLeft - 2) })}
                className="w-4 h-4 rounded bg-stone-800 hover:bg-emerald-600 flex items-center justify-center font-bold text-xs"
                title="Kurangi Padding Kiri (-2px)"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => onUpdateDesignConfig({ ...designConfig, framePaddingLeft: Math.min(60, paddingLeft + 2) })}
                className="w-4 h-4 rounded bg-stone-800 hover:bg-emerald-600 flex items-center justify-center font-bold text-xs"
                title="Tambah Padding Kiri (+2px)"
              >
                +
              </button>
            </div>

            {/* 4. KANAN: Drag Line & Quick Adjuster Badge */}
            <div
              data-editing-control="true"
              className="no-print absolute top-0 bottom-0 right-0 w-3 -mr-1.5 cursor-ew-resize z-40 flex items-center justify-center group/edge-right"
              onMouseDown={(e) => handleStartDrag('right', e)}
              title="Geser batas kanan bingkai (Kiri/Kanan) seperti Excel"
            >
              <div className="h-full w-[2px] bg-transparent group-hover/edge-right:bg-emerald-500/80 transition-colors" />
            </div>

            <div 
              data-editing-control="true"
              className="no-print absolute right-14 top-1/2 -translate-y-1/2 opacity-0 group-hover/frame:opacity-100 hover:opacity-100 transition-opacity flex flex-col items-center gap-1 bg-stone-900/95 text-white text-[9px] px-1.5 py-2 rounded-xl shadow-lg border border-emerald-500/50 z-50 select-none"
            >
              <span className="text-emerald-300 font-bold [writing-mode:vertical-lr] rotate-180">Kanan {paddingRight}px</span>
              <button
                type="button"
                onClick={() => onUpdateDesignConfig({ ...designConfig, framePaddingRight: Math.max(0, paddingRight - 2) })}
                className="w-4 h-4 rounded bg-stone-800 hover:bg-emerald-600 flex items-center justify-center font-bold text-xs"
                title="Kurangi Padding Kanan (-2px)"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => onUpdateDesignConfig({ ...designConfig, framePaddingRight: Math.min(60, paddingRight + 2) })}
                className="w-4 h-4 rounded bg-stone-800 hover:bg-emerald-600 flex items-center justify-center font-bold text-xs"
                title="Tambah Padding Kanan (+2px)"
              >
                +
              </button>
            </div>
          </>
        )}

        {children}
      </div>
    </div>
  );
};
