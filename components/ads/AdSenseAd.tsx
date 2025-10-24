"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

type AdSenseAdProps = {
  slot?: string;
  format?: string; // e.g., "auto"
  responsive?: boolean; // true => data-full-width-responsive="true"
  className?: string;
  style?: React.CSSProperties;
  layout?: string; // data-ad-layout
  layoutKey?: string; // data-ad-layout-key
  adTest?: boolean; // true => data-adtest="on"
};

export function AdSenseAd({
  slot,
  format = "auto",
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
    if (!slot) return; // do not attempt if not configured
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      initializedRef.current = false;
    }
  }, [slot]);

  if (!slot) return null;

  const isProd = process.env.NODE_ENV === "production";
  const shouldAdTest = adTest ?? !isProd;

  return (
    <div className={className} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-3173433370339000"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
        {...(layout ? { "data-ad-layout": layout } : {})}
        {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
        {...(shouldAdTest ? { "data-adtest": "on" } : {})}
        ref={insRef as any}
      />
    </div>
  );
}

export default AdSenseAd;
