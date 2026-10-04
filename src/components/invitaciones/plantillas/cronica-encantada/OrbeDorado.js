'use client';

import { useEffect, useRef } from 'react';

export default function OrbeDorado() {
  const canvas = useRef(null);

  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext('2d');
    if (!ctx) return undefined;
    let width; let height; let scale; let frameId; let last = performance.now(); let elapsed = 0;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = { x: -999, y: -999 };
    const sparks = [];
    const position = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, tilt: 0, next: 0, depth: 1 };

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      width = innerWidth; height = innerHeight;
      cv.width = width * dpr; cv.height = height * dpr;
      cv.style.width = `${width}px`; cv.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scale = Math.min(width, height) / 720;
      if (!position.x) Object.assign(position, { x: width * .7, y: height * .26, tx: width * .7, ty: height * .26 });
    };
    const move = event => { const point = event.touches?.[0] || event; pointer.x = point.clientX; pointer.y = point.clientY; };
    const feather = (length, featherWidth, gradient) => {
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(length * .45, -featherWidth, length, -featherWidth * .05); ctx.quadraticCurveTo(length * .5, featherWidth * .7, 0, 0); ctx.fillStyle = gradient; ctx.fill();
      ctx.strokeStyle = 'rgba(120,80,15,.35)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(length * .95, -featherWidth * .04); ctx.stroke();
    };
    const wing = (side, sweep, flip, alpha) => {
      ctx.save(); ctx.globalAlpha = alpha; ctx.translate(side * 21, -13); ctx.scale(side, 1); ctx.rotate(-.62 + sweep); ctx.scale(1, .35 + .65 * Math.abs(flip));
      const gradient = ctx.createLinearGradient(0, 0, 198, 0); gradient.addColorStop(0, '#ffe9a0'); gradient.addColorStop(.6, '#e0ab3e'); gradient.addColorStop(1, 'rgba(224,171,62,.5)');
      for (let index = 0; index < 6; index++) { const amount = index / 5; ctx.save(); ctx.rotate((amount - .4) * .42); feather(38 * (3.6 + Math.sin(amount * Math.PI) * 1.2 + (1 - amount) * .6), 38 * .13, gradient); ctx.restore(); }
      ctx.restore();
    };
    const orb = () => {
      const radius = 38; const glow = ctx.createRadialGradient(0, 0, radius * .6, 0, 0, radius * 3.2); glow.addColorStop(0, 'rgba(255,200,90,.28)'); glow.addColorStop(1, 'rgba(255,200,90,0)'); ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, radius * 3.2, 0, 7); ctx.fill();
      const metal = ctx.createRadialGradient(-radius * .35, -radius * .4, radius * .05, 0, 0, radius * 1.05); metal.addColorStop(0, '#fffbe6'); metal.addColorStop(.18, '#ffe08a'); metal.addColorStop(.55, '#c8932f'); metal.addColorStop(.85, '#7a4f12'); metal.addColorStop(1, '#3a2506'); ctx.fillStyle = metal; ctx.beginPath(); ctx.arc(0, 0, radius, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(60,35,5,.55)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(0, 0, radius, radius * .22, 0, 0, 7); ctx.stroke(); ctx.lineWidth = .8; [.35, .7].forEach(amount => { ctx.beginPath(); ctx.ellipse(0, 0, radius * amount, radius, 0, 0, 7); ctx.stroke(); });
      ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.ellipse(-radius * .38, -radius * .42, radius * .16, radius * .09, -.6, 0, 7); ctx.fill();
    };
    const draw = now => {
      const delta = Math.min((now - last) / 1000, .05); last = now; elapsed += delta;
      if (elapsed > position.next) { position.tx = width * (.2 + Math.random() * .6); position.ty = height * (.15 + Math.random() * .6); position.next = elapsed + (Math.random() < .4 ? .9 : 1.8 + Math.random() * 1.8); position.depth = .72 + Math.random() * .58; cv.style.zIndex = position.depth > 1.05 ? '3' : '0'; }
      let ax = (position.tx - position.x) * 5.5; let ay = (position.ty - position.y) * 5.5; const dx = position.x - pointer.x; const dy = position.y - pointer.y; const distance = Math.hypot(dx, dy); const radius = 190 * scale + 60;
      if (distance < radius && distance > 0) { const force = (radius - distance) / radius; ax += dx / distance * force * 5000; ay += dy / distance * force * 5000; }
      position.vx += ax * delta; position.vy += ay * delta; position.vx *= Math.pow(.02, delta); position.vy *= Math.pow(.02, delta); position.x += position.vx * delta; position.y += position.vy * delta; position.x = Math.max(60, Math.min(width - 60, position.x)); position.y = Math.max(60, Math.min(height - 60, position.y));
      const speed = Math.hypot(position.vx, position.vy); position.tilt += (position.vx * .0006 - position.tilt) * .12; ctx.clearRect(0, 0, width, height);
      if (!reduce && Math.random() < .5 + speed * .002) sparks.push({ x: position.x + (Math.random() - .5) * 50 * scale, y: position.y + (Math.random() - .5) * 40 * scale, vx: (Math.random() - .5) * 20, vy: 10 + Math.random() * 25, life: 1 });
      for (let index = sparks.length - 1; index >= 0; index--) { const spark = sparks[index]; spark.life -= delta * 1.1; if (spark.life <= 0) { sparks.splice(index, 1); continue; } spark.x += spark.vx * delta; spark.y += spark.vy * delta; ctx.fillStyle = `rgba(255,210,110,${spark.life * .8})`; ctx.beginPath(); ctx.arc(spark.x, spark.y, 1.6 * scale * spark.life + .4, 0, 7); ctx.fill(); }
      ctx.save(); ctx.translate(position.x + (reduce ? 0 : Math.sin(elapsed * 23) * .8), position.y + (reduce ? 0 : Math.sin(elapsed * 31) * 1.2 + Math.sin(elapsed * 2.1) * 3)); ctx.rotate(position.tilt); ctx.scale(scale * position.depth, scale * position.depth);
      const frequency = reduce ? 5 : speed > 120 ? 60 : 52; const amplitude = .4 + Math.min(speed / 1800, .1); const ghosts = reduce ? 1 : 9;
      for (const side of [-1, 1]) for (let index = ghosts - 1; index >= 0; index--) { const phase = elapsed * frequency * 2 * Math.PI - index * .34; wing(side, amplitude * Math.sin(phase), Math.cos(phase), index === 0 ? .95 : .1 + .05 * (ghosts - index) / ghosts); }
      orb(); ctx.restore(); frameId = requestAnimationFrame(draw);
    };

    resize(); addEventListener('resize', resize); addEventListener('pointermove', move); addEventListener('touchmove', move, { passive: true }); frameId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frameId); removeEventListener('resize', resize); removeEventListener('pointermove', move); removeEventListener('touchmove', move); };
  }, []);

  return <canvas ref={canvas} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} aria-hidden="true" />;
}
