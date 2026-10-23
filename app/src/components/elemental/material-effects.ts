import type { ElementId } from '@/constants';

const TAU = Math.PI * 2;
const fract = (value: number) => value - Math.floor(value);
const seed = (index: number) => fract(Math.sin(index * 127.1 + 311.7) * 43758.5453);
const envelope = (age: number) => Math.sin(Math.PI * age) ** 2;

/** Transparent effects only. The underlying artwork is never resampled or warped. */
export function createMaterialEffect(canvas: HTMLCanvasElement, id: ElementId, texture: HTMLImageElement | null) {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return null;
  let size = 1;
  const resize = () => {
    const width = canvas.getBoundingClientRect().width;
    size = Math.max(1, Math.round(width * Math.min(window.devicePixelRatio || 1, 2)));
    if (canvas.width !== size || canvas.height !== size) {
      canvas.width = size;
      canvas.height = size;
    }
  };
  resize();

  function water(t: number) {
    // Curved caustic ribbons travel over a spherical surface, not through its outline.
    ctx!.save();
    ctx!.beginPath();
    ctx!.arc(50, 50, 40, 0, TAU);
    ctx!.clip();
    ctx!.globalCompositeOperation = 'screen';
    for (let band = 0; band < 7; band++) {
      const age = fract(t * .12 + band / 7);
      const latitude = (age - .5) * Math.PI;
      const radius = Math.cos(latitude) * 38;
      const cy = 50 + Math.sin(latitude) * 37;
      ctx!.beginPath();
      for (let j = 0; j <= 32; j++) {
        const a = Math.PI * (.12 + j / 32 * .76);
        const x = 50 + Math.cos(a) * radius;
        const y = cy + Math.sin(a) * radius * .2 + Math.sin(a * 3 + t * .8 + band) * 1.2;
        if (j === 0) ctx!.moveTo(x, y); else ctx!.lineTo(x, y);
      }
      ctx!.strokeStyle = `rgba(200,246,255,${envelope(age) * .48})`;
      ctx!.lineWidth = .65;
      ctx!.stroke();
    }
    // Moving glints, softened by a radial falloff instead of a flashing brightness filter.
    for (let i = 0; i < 3; i++) {
      const a = t * .43 + i * 2.1;
      const x = 50 + Math.cos(a) * 24;
      const y = 46 + Math.sin(a * .8 + i) * 22;
      const light = ctx!.createRadialGradient(x, y, 0, x, y, 9);
      light.addColorStop(0, '#e2fcff66'); light.addColorStop(.25, '#99edff2e'); light.addColorStop(1, '#74dfff00');
      ctx!.fillStyle = light; ctx!.fillRect(x - 9, y - 9, 18, 18);
    }
    ctx!.restore();
    for (let i = 0; i < 5; i++) {
      const a = t * .55 + i * TAU / 5;
      const depth = Math.sin(a);
      const x = 50 + Math.cos(a) * 43;
      const y = 50 + depth * 26;
      const r = 1.2 + (depth + 1) * .5;
      ctx!.globalAlpha = .55 + (depth + 1) * .2;
      const drop = ctx!.createRadialGradient(x - r * .3, y - r * .4, .1, x, y, r);
      drop.addColorStop(0, '#ecffff'); drop.addColorStop(.4, '#8fe9ff'); drop.addColorStop(1, '#147cba');
      ctx!.fillStyle = drop; ctx!.beginPath(); ctx!.arc(x, y, r, 0, TAU); ctx!.fill();
    }
  }

  function fire(t: number) {
    ctx!.globalCompositeOperation = 'screen';
    // Each plume rises, narrows, then dissipates. Squared-sine opacity joins loop endpoints.
    for (let i = 0; i < 18; i++) {
      const age = fract(t / (1.8 + seed(i) * 1.5) + seed(i + 30));
      const lane = seed(i + 60) * 2 - 1;
      const x = 50 + lane * 29 + Math.sin(t * .8 + i) * 2;
      const y = 75 - age * 54 - Math.abs(lane) * 8;
      const width = (2.8 + seed(i + 90) * 3) * (1 - age * .65);
      const height = 12 + age * 15;
      const bend = Math.sin(t * 1.1 + i * 1.7) * (2 + age * 3);
      const opacity = envelope(age) * .62;
      const glow = ctx!.createLinearGradient(x, y, x + bend, y - height);
      glow.addColorStop(0, `rgba(255,75,8,${opacity * .25})`);
      glow.addColorStop(.4, `rgba(255,145,25,${opacity})`);
      glow.addColorStop(.72, `rgba(255,224,125,${opacity * .8})`);
      glow.addColorStop(1, 'rgba(255,180,35,0)');
      ctx!.fillStyle = glow;
      ctx!.beginPath();
      ctx!.moveTo(x - width, y);
      ctx!.bezierCurveTo(x - width * 1.3, y - height * .35, x + bend - width * .4, y - height * .7, x + bend, y - height);
      ctx!.bezierCurveTo(x + bend + width * .15, y - height * .55, x + width * 1.2, y - height * .3, x + width, y);
      ctx!.quadraticCurveTo(x, y + width, x - width, y);
      ctx!.fill();
    }
    for (let i = 0; i < 10; i++) {
      const age = fract(t / (2.2 + seed(i + 120) * 1.4) + seed(i + 150));
      const x = 50 + (seed(i + 180) - .5) * 60 + Math.sin(age * 5 + i) * 3;
      const y = 65 - age * 61;
      ctx!.globalAlpha = envelope(age) * .85;
      ctx!.fillStyle = '#ffdb81';
      ctx!.beginPath(); ctx!.ellipse(x, y, .55, 1.3 - age * .5, .2, 0, TAU); ctx!.fill();
    }
  }

  function air(t: number) {
    ctx!.globalCompositeOperation = 'screen';
    // Same handedness, varied speed: continuous currents rather than two spinning discs.
    for (let ribbon = 0; ribbon < 6; ribbon++) {
      const phase = t * (.65 + ribbon * .035) + ribbon * TAU / 6;
      const radius = 26 + ribbon * 2.5;
      for (let j = 0; j < 24; j++) {
        const a = phase + j / 24 * 1.7;
        const next = a + 1.7 / 24;
        const point = (angle: number) => ({ x: 50 + Math.cos(angle) * radius, y: 50 + Math.sin(angle) * radius * .55 - Math.cos(angle) * 8 });
        const p = point(a); const q = point(next);
        ctx!.strokeStyle = `rgba(214,246,255,${Math.sin(j / 24 * Math.PI) * (.25 + (Math.sin(a) + 1) * .2)})`;
        ctx!.lineWidth = .55 + (Math.sin(a) + 1) * .4;
        ctx!.beginPath(); ctx!.moveTo(p.x, p.y); ctx!.lineTo(q.x, q.y); ctx!.stroke();
      }
    }
  }

  function earth(t: number) {
    const fragments = Array.from({ length: 6 }, (_, i) => {
      const a = t * .24 + i * TAU / 6;
      return { i, depth: Math.sin(a), x: 50 + Math.cos(a) * 43, y: 50 + Math.sin(a) * 27 + Math.sin(t * .7 + i) * 1.2 };
    }).sort((a, b) => a.depth - b.depth);
    for (const { i, depth, x, y } of fragments) {
      // Hide the rear fragments while they pass through the solid core.
      if (depth < 0 && Math.abs(x - 50) < 31) continue;
      const r = 2.2 + seed(i + 230) * 2 + (depth + 1) * .6;
      ctx!.save(); ctx!.translate(x, y); ctx!.rotate(t * .12 + i);
      ctx!.globalAlpha = .8 + (depth + 1) * .1;
      ctx!.beginPath(); ctx!.moveTo(-r, -r * .55); ctx!.lineTo(-r * .2, -r); ctx!.lineTo(r * .8, -r * .6); ctx!.lineTo(r, r * .3); ctx!.lineTo(r * .1, r); ctx!.lineTo(-r * .8, r * .6); ctx!.closePath();
      ctx!.fillStyle = '#77664c'; ctx!.fill(); ctx!.clip();
      if (texture?.complete && texture.naturalWidth > 0) {
        const sourceSize = texture.naturalWidth * .18;
        ctx!.drawImage(texture, texture.naturalWidth * (.3 + seed(i + 260) * .2), texture.naturalHeight * .4, sourceSize, sourceSize, -r, -r, r * 2, r * 2);
      }
      const shade = ctx!.createLinearGradient(-r, -r, r, r);
      shade.addColorStop(0, '#e7d6a33d'); shade.addColorStop(1, '#00000066');
      ctx!.fillStyle = shade; ctx!.fillRect(-r, -r, r * 2, r * 2);
      ctx!.restore();
    }
  }

  const draw = { agua: water, fogo: fire, ar: air, terra: earth }[id];
  return {
    resize,
    clear() { ctx.clearRect(0, 0, size, size); },
    paint(time: number) {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, size, size);
      ctx.save(); ctx.scale(size / 100, size / 100); draw(time); ctx.restore();
    },
  };
}
