'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

type AdSenseAdProps = {
  slot?: string;
  format?: string;
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  layout?: string;
  layoutKey?: string;
  adTest?: boolean;
};

export function AdSenseAd({
  slot,
  format = 'auto',
  responsive = true,
  className,
  style,
  layout,
  layoutKey,
  adTest,
}: AdSenseAdProps) {
  const insRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!slot) return;
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      initializedRef.current = false;
    }

    // Force transparent background on iframe after ad loads
    const checkIframe = setInterval(() => {
      if (insRef.current) {
        const iframes = insRef.current.querySelectorAll('iframe');
        iframes.forEach(iframe => {
          try {
            iframe.style.background = 'transparent';
            iframe.style.backgroundColor = 'transparent';
          } catch (e) {
            // Cross-origin restriction
          }
        });

        if (iframes.length > 0) {
          clearInterval(checkIframe);
        }
      }
    }, 500);

    return () => clearInterval(checkIframe);
  }, [slot]);

  if (!slot) return null;

  const isProd = process.env.NODE_ENV === 'production';
  const shouldAdTest = adTest ?? !isProd;

  return (
    <div
      className={`ad-wrapper ${className || ''}`}
      style={{
        background: 'transparent',
        backgroundColor: 'transparent',
        ...style,
      }}
    >
      <ins
        className='adsbygoogle'
        style={{
          display: 'block',
          background: 'transparent',
          backgroundColor: 'transparent',
          minHeight: '90px',
        }}
        data-ad-client='ca-pub-3173433370339000'
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
        {...(layout ? { 'data-ad-layout': layout } : {})}
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
        {...(shouldAdTest ? { 'data-adtest': 'on' } : {})}
        ref={insRef as any}
      />
    </div>
  );
}

export default AdSenseAd;
