"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer, EffectPass, RenderPass, Effect } from "postprocessing";

type PixelBlastVariant = "square" | "circle" | "triangle" | "diamond";

type PixelBlastProps = {
  variant?: PixelBlastVariant;
  pixelSize?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  antialias?: boolean;
  patternScale?: number;
  patternDensity?: number;
  liquid?: boolean;
  liquidStrength?: number;
  liquidRadius?: number;
  pixelSizeJitter?: number;
  enableRipples?: boolean;
  rippleIntensityScale?: number;
  rippleThickness?: number;
  rippleSpeed?: number;
  liquidWobbleSpeed?: number;
  autoPauseOffscreen?: boolean;
  speed?: number;
  transparent?: boolean;
  edgeFade?: number;
  noiseAmount?: number;
};

const createTouchTexture = () => {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context not available");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.Texture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const trail: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    force: number;
    age: number;
  }[] = [];

  let last: { x: number; y: number } | null = null;
  const maxAge = 64;
  let radius = 0.1 * size;
  const speed = 1 / maxAge;

  const clear = () => {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const drawPoint = (p: typeof trail[0]) => {
    const pos = { x: p.x * size, y: (1 - p.y) * size };
    let intensity = 1;
    const easeOutSine = (t: number) => Math.sin((t * Math.PI) / 2);
    const easeOutQuad = (t: number) => -t * (t - 2);

    if (p.age < maxAge * 0.3) intensity = easeOutSine(p.age / (maxAge * 0.3));
    else
      intensity =
        easeOutQuad(1 - (p.age - maxAge * 0.3) / (maxAge * 0.7)) || 0;

    intensity *= p.force;

    // Color based on direction + speed
    const hue = (Math.atan2(p.vy, p.vx) * 180) / Math.PI + 180;
    const lightness = 50 + 30 * intensity;
    const color = `hsl(${hue}, 80%, ${lightness}%)`;

    // Liquid wobble effect
    let wobbleX = 0;
    let wobbleY = 0;
    if (p.liquidWobbleSpeed) {
      const wobble = Math.sin(Date.now() / 1000 * (p.liquidWobbleSpeed || 1)) * 0.02;
      wobbleX = wobble;
      wobbleY = wobble;
    }

    ctx.save();
    ctx.translate(pos.x + wobbleX, pos.y + wobbleY);
    const angle = p.age / maxAge * Math.PI * 2; // rotation for triangles/diamonds
    ctx.rotate(angle);

    ctx.beginPath();
    switch (p.variant) {
      case "triangle":
        ctx.moveTo(0, -radius);
        ctx.lineTo(radius, radius);
        ctx.lineTo(-radius, radius);
        ctx.closePath();
        break;
      case "diamond":
        ctx.moveTo(0, -radius);
        ctx.lineTo(radius, 0);
        ctx.lineTo(0, radius);
        ctx.lineTo(-radius, 0);
        ctx.closePath();
        break;
      case "square":
        ctx.rect(-radius, -radius, 2 * radius, 2 * radius);
        break;
      default:
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
    }

    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = radius * 0.8;
    ctx.fill();
    ctx.restore();
  };

  const addTouch = (norm: { x: number; y: number }) => {
    let force = 0;
    let vx = 0;
    let vy = 0;

    if (last) {
      const dx = norm.x - last.x;
      const dy = norm.y - last.y;
      if (dx === 0 && dy === 0) return;

      const dd = dx * dx + dy * dy;
      const d = Math.sqrt(dd);
      vx = dx / (d || 1);
      vy = dy / (d || 1);
      // faster swipes = stronger
      force = Math.min(dd * 20000, 1);
    } else {
      force = 0.5; // tap/click default
    }

    last = { x: norm.x, y: norm.y };
    trail.push({ x: norm.x, y: norm.y, age: 0, force, vx, vy });
  };

  const update = () => {
    clear();
    for (let i = trail.length - 1; i >= 0; i--) {
      const point = trail[i];
      const f = point.force * speed * (1 - point.age / maxAge);
      point.x += point.vx * f;
      point.y += point.vy * f;
      point.age++;
      if (point.age > maxAge) trail.splice(i, 1);
    }
    for (let i = 0; i < trail.length; i++) drawPoint(trail[i]);
    texture.needsUpdate = true;
  };

  return {
    canvas,
    texture,
    addTouch,
    update,
    set radiusScale(v: number) {
      radius = 0.1 * size * v;
    },
    get radiusScale() {
      return radius / (0.1 * size);
    },
    size,
  };
};

export default PixelBlast;
