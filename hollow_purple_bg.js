/**
 * Hollow Purple (Kyoshiki: Murasaki) - Full Cycle Canvas Animation Engine
 * 
 * Animation Cycle:
 * 1. Aka (Red) charges on the left, Ao (Blue) charges on the right (Thick, Large, Saturated).
 * 2. Anticipation pull-back.
 * 3. Direct head-on straight-line convergence (NO spinning/swirling).
 * 4. Violent collision at center -> Fuses into Massive Dense Purple (Murasaki) Core.
 * 5. Gravitational compression -> Cataclysmic FULL-SCREEN PURPLE DETONATION!
 * 6. Thick blast waves, high-velocity rays, and blinding ultraviolet flash.
 * 7. Smooth dissipation & seamless loop.
 * 
 * Performance: 60 FPS Locked on Android/Mobile using Hardware-Accelerated 2D Canvas.
 */

(function () {
  'use strict';

  // Setup background canvas
  let canvas = document.getElementById('hollowCanvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'hollowCanvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    document.body.prepend(canvas);
  }

  const ctx = canvas.getContext('2d', { alpha: false });
  let width = 0;
  let height = 0;
  let dpr = 1;
  let maxDiag = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    maxDiag = Math.hypot(width, height);
  }

  window.addEventListener('resize', resize);
  resize();

  // Animation Cycle Timings (Total: 9.6 seconds)
  const CYCLE_DURATION = 9.6;
  let startTime = performance.now();

  // Explosion Debris Rays
  const RAY_COUNT = 44;
  const explosionRays = Array.from({ length: RAY_COUNT }, (_, i) => ({
    angle: (i / RAY_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.12,
    speed: 8 + Math.random() * 16,
    dist: 0,
    length: 40 + Math.random() * 110,
    width: 3 + Math.random() * 4,
    alpha: 0
  }));

  function resetExplosionRays() {
    for (let i = 0; i < RAY_COUNT; i++) {
      const r = explosionRays[i];
      r.dist = 15;
      r.alpha = 1.0;
    }
  }

  // Draw Dense High-Intensity Plasma Orb (Lebih Tebal, Lebih Besar)
  function drawDenseGlowOrb(x, y, radius, innerColor, midColor, outerColor, alpha = 1.0, isThick = true) {
    if (radius <= 0.1 || alpha <= 0.01) return;

    const a = Math.min(1.0, alpha);

    // 1. Giant Outer Radiance Aura
    const auraGrad = ctx.createRadialGradient(x, y, radius * 0.15, x, y, radius * 1.5);
    auraGrad.addColorStop(0, midColor.replace('__A__', (a * 0.85).toFixed(3)));
    auraGrad.addColorStop(0.45, outerColor.replace('__A__', (a * 0.55).toFixed(3)));
    auraGrad.addColorStop(1, outerColor.replace('__A__', '0'));
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 2. Thick Dense Energy Body (Deep Saturation)
    const bodyGrad = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
    bodyGrad.addColorStop(0, midColor.replace('__A__', (a * 0.98).toFixed(3)));
    bodyGrad.addColorStop(0.65, midColor.replace('__A__', (a * 0.90).toFixed(3)));
    bodyGrad.addColorStop(1, outerColor.replace('__A__', '0'));
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // 3. Extra Saturated Inner Plasma Core (Membuat warna merah & ungu sangat padat/tebal)
    if (isThick) {
      const denseGrad = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.72);
      denseGrad.addColorStop(0, innerColor.replace('__A__', (a * 1.0).toFixed(3)));
      denseGrad.addColorStop(0.45, midColor.replace('__A__', (a * 0.98).toFixed(3)));
      denseGrad.addColorStop(0.85, midColor.replace('__A__', (a * 0.75).toFixed(3)));
      denseGrad.addColorStop(1, outerColor.replace('__A__', '0'));
      ctx.fillStyle = denseGrad;
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.72, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. White-Hot Intense Singularity Center
    const coreRadius = radius * 0.38;
    const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, coreRadius);
    coreGrad.addColorStop(0, innerColor.replace('__A__', a.toFixed(3)));
    coreGrad.addColorStop(0.55, midColor.replace('__A__', (a * 0.95).toFixed(3)));
    coreGrad.addColorStop(1, midColor.replace('__A__', '0'));
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(x, y, coreRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Smooth Easing Functions
  function easeInExpo(t) {
    return t === 0 ? 0 : Math.pow(2, 10 * t - 10);
  }
  function easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t);
  }

  let isTabActive = true;
  document.addEventListener('visibilitychange', () => {
    isTabActive = !document.hidden;
  });

  let prevExploded = false;

  function render(now) {
    requestAnimationFrame(render);
    if (!isTabActive) return;

    const elapsed = (now - startTime) / 1000;
    const t = elapsed % CYCLE_DURATION; // 0 to 9.6 seconds

    const cx = width * 0.5;
    const cy = height * 0.5;

    // Lebar dan besar yang ditingkatkan secara signifikan
    const minDim = Math.min(width, height);
    const redBaseRadius = minDim * 0.28;      // Lebih besar & tebal
    const blueBaseRadius = minDim * 0.24;
    const purpleBaseRadius = minDim * 0.40;    // Sangat besar & tebal
    const maxOrbDist = minDim * 0.38;

    // Clear dark background with deep cosmic tone
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#06020e';
    ctx.fillRect(0, 0, width, height);

    // Subtle cosmic vignette
    const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, maxDiag * 0.7);
    bgGrad.addColorStop(0, '#120522');
    bgGrad.addColorStop(0.6, '#080312');
    bgGrad.addColorStop(1, '#030108');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Switch to Screen blending for vibrant glowing anime energy
    ctx.globalCompositeOperation = 'screen';

    // ========================================================
    // TIMELINE PHASES
    // ========================================================
    // Phase 1: 0.0s - 3.0s -> Aka (Left) & Ao (Right) Charge & Hover
    // Phase 2: 3.0s - 3.4s -> Anticipation Pullback
    // Phase 3: 3.4s - 4.3s -> High-Speed Head-on Straight-line Collision (NO SPIN)
    // Phase 4: 4.3s - 5.1s -> Murasaki (Purple) Singularity Fusion & Compression
    // Phase 5: 5.1s - 7.3s -> CATACLYSMIC FULL SCREEN EXPLOSION!
    // Phase 6: 7.3s - 9.6s -> Dissipation & Smooth loop back
    // ========================================================

    let redX = cx - maxOrbDist;
    let redY = cy;
    let redRadius = redBaseRadius;
    let redAlpha = 0;

    let blueX = cx + maxOrbDist;
    let blueY = cy;
    let blueRadius = blueBaseRadius;
    let blueAlpha = 0;

    let purpleRadius = 0;
    let purpleAlpha = 0;
    let flashAlpha = 0;
    let blastRingRadius = 0;
    let blastRingAlpha = 0;

    if (t < 3.0) {
      // Phase 1: Charge & Hover
      const fadeIn = Math.min(t / 0.7, 1.0);
      const hoverA = Math.sin(t * 3.2) * 10;
      const hoverB = Math.cos(t * 3.2) * 10;
      const pulseRed = 1 + Math.sin(t * 5.0) * 0.09;
      const pulseBlue = 1 + Math.cos(t * 5.0) * 0.08;

      redX = cx - maxOrbDist;
      redY = cy + hoverA;
      redRadius = redBaseRadius * pulseRed;
      redAlpha = fadeIn * 1.0; // Maksimal tebal

      blueX = cx + maxOrbDist;
      blueY = cy + hoverB;
      blueRadius = blueBaseRadius * pulseBlue;
      blueAlpha = fadeIn * 0.95;
      prevExploded = false;

    } else if (t < 3.4) {
      // Phase 2: Anticipation Pullback
      const p = (t - 3.0) / 0.4;
      const pullDist = maxOrbDist * (1 + 0.10 * Math.sin(p * Math.PI));

      redX = cx - pullDist;
      redY = cy;
      redRadius = redBaseRadius * 1.08;
      redAlpha = 1.0;

      blueX = cx + pullDist;
      blueY = cy;
      blueRadius = blueBaseRadius * 1.08;
      blueAlpha = 1.0;

    } else if (t < 4.3) {
      // Phase 3: Straight-Line Head-On Convergence (TIDAK BERPUTAR, lurus saling tabrak)
      const p = (t - 3.4) / 0.9; // 0 to 1
      const easedP = easeInExpo(p);
      const currentDist = maxOrbDist * (1 - easedP);

      // Gerakan lurus horizontal head-on tanpa rotasi/swirl
      redX = cx - currentDist;
      redY = cy;
      redRadius = redBaseRadius * (1 - p * 0.2);
      redAlpha = 1.0;

      blueX = cx + currentDist;
      blueY = cy;
      blueRadius = blueBaseRadius * (1 - p * 0.2);
      blueAlpha = 1.0;

      // Ungu mulai membesar tebal di tengah saat merah dan biru bertabrakan
      purpleRadius = purpleBaseRadius * (0.35 + p * 0.75);
      purpleAlpha = p * 0.95;

    } else if (t < 5.1) {
      // Phase 4: Murasaki Fusion & Intense Gravitational Compression
      const p = (t - 4.3) / 0.8; // 0 to 1
      redAlpha = 0;
      blueAlpha = 0;

      if (p < 0.65) {
        // Inti ungu tumbuh membesar tebal dan bergetar hebat
        const growP = p / 0.65;
        purpleRadius = purpleBaseRadius * (1.1 + Math.sin(growP * Math.PI) * 0.4);
        purpleAlpha = 1.0;
      } else {
        // Kompresi ketat sesaat sebelum meledak
        const compP = (p - 0.65) / 0.35;
        const pinch = 1.0 - easeInExpo(compP) * 0.72;
        purpleRadius = purpleBaseRadius * pinch;
        purpleAlpha = 1.0;
      }

    } else if (t < 7.3) {
      // Phase 5: DETONATION! (Cataclysmic Full Screen Blast)
      const p = (t - 5.1) / 2.2; // 0 to 1

      if (!prevExploded) {
        resetExplosionRays();
        prevExploded = true;
      }

      // Blinding full-screen ultraviolet flash
      if (p < 0.28) {
        flashAlpha = (1 - p / 0.28) * 0.98;
      }

      // Massive Expanding Cataclysmic Blast Ring (Full Screen Cover)
      const blastP = easeOutQuad(p);
      blastRingRadius = blastP * (maxDiag * 0.88);
      blastRingAlpha = Math.max(0, 1 - p * 1.12);

      // Bola ledakan ungu yang sangat besar & tebal
      purpleRadius = purpleBaseRadius * (1 + p * 4.2);
      purpleAlpha = Math.max(0, (1 - p * 1.15) * 0.92);

      // Sinar ledakan berkecepatan tinggi
      for (let i = 0; i < RAY_COUNT; i++) {
        const ray = explosionRays[i];
        ray.dist += ray.speed * (1 + (1 - p) * 1.6);
        ray.alpha = Math.max(0, 1 - p * 1.2);

        const rx = cx + Math.cos(ray.angle) * ray.dist;
        const ry = cy + Math.sin(ray.angle) * ray.dist;
        const rxEnd = cx + Math.cos(ray.angle) * (ray.dist + ray.length);
        const ryEnd = cy + Math.sin(ray.angle) * (ray.dist + ray.length);

        // Tebal ungu luar
        ctx.strokeStyle = `rgba(217, 70, 239, ${(ray.alpha * 0.85).toFixed(3)})`;
        ctx.lineWidth = ray.width * 1.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rxEnd, ryEnd);
        ctx.stroke();

        // Inti putih terang
        ctx.strokeStyle = `rgba(255, 255, 255, ${ray.alpha.toFixed(3)})`;
        ctx.lineWidth = ray.width * 0.6;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rxEnd, ryEnd);
        ctx.stroke();
      }

    } else {
      // Phase 6: Dissipation & Rest before loop
      purpleAlpha = 0;
      redAlpha = 0;
      blueAlpha = 0;
      prevExploded = false;
    }

    // ========================================================
    // DRAW DENSE GLOWING ELEMENTS
    // ========================================================

    // 1. Aka (Red Orb - Lebih Tebal, Lebih Besar, Crimson Pekat)
    if (redAlpha > 0.01) {
      drawDenseGlowOrb(
        redX,
        redY,
        redRadius,
        'rgba(255, 255, 255, __A__)',
        'rgba(255, 0, 50, __A__)',
        'rgba(200, 0, 35, __A__)',
        redAlpha,
        true // Sangat tebal
      );
    }

    // 2. Ao (Blue Orb - Deep Neon Blue)
    if (blueAlpha > 0.01) {
      drawDenseGlowOrb(
        blueX,
        blueY,
        blueRadius,
        'rgba(220, 250, 255, __A__)',
        'rgba(0, 190, 255, __A__)',
        'rgba(0, 80, 220, __A__)',
        blueAlpha,
        false
      );
    }

    // 3. Murasaki (Purple Fusion Orb - Lebih Tebal, Sangat Besar)
    if (purpleAlpha > 0.01) {
      drawDenseGlowOrb(
        cx,
        cy,
        purpleRadius,
        'rgba(255, 255, 255, __A__)',
        'rgba(230, 60, 255, __A__)',
        'rgba(140, 10, 220, __A__)',
        purpleAlpha,
        true // Sangat tebal
      );
    }

    // 4. Expanding Full-Screen Shockwave Rings (Lebih Tebal)
    if (blastRingAlpha > 0.01 && blastRingRadius > 5) {
      // Outer purple blast wave
      ctx.beginPath();
      ctx.arc(cx, cy, blastRingRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(232, 121, 249, ${(blastRingAlpha * 0.95).toFixed(3)})`;
      ctx.lineWidth = Math.max(5, 26 * (1 - blastRingRadius / maxDiag));
      ctx.stroke();

      // Inner white-hot blast ring
      ctx.beginPath();
      ctx.arc(cx, cy, blastRingRadius * 0.93, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${(blastRingAlpha * 0.92).toFixed(3)})`;
      ctx.lineWidth = Math.max(3, 10 * (1 - blastRingRadius / maxDiag));
      ctx.stroke();

      // Deep ultraviolet aura ring
      ctx.beginPath();
      ctx.arc(cx, cy, blastRingRadius * 0.82, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(168, 85, 247, ${(blastRingAlpha * 0.65).toFixed(3)})`;
      ctx.lineWidth = Math.max(4, 38 * (1 - blastRingRadius / maxDiag));
      ctx.stroke();
    }

    // 5. Full Screen Blast Flash
    if (flashAlpha > 0.01) {
      ctx.fillStyle = `rgba(168, 85, 247, ${(flashAlpha * 0.82).toFixed(3)})`;
      ctx.fillRect(0, 0, width, height);

      const flashCore = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxDiag * 0.75);
      flashCore.addColorStop(0, `rgba(255, 255, 255, ${(flashAlpha * 0.96).toFixed(3)})`);
      flashCore.addColorStop(0.35, `rgba(230, 60, 255, ${(flashAlpha * 0.85).toFixed(3)})`);
      flashCore.addColorStop(0.7, `rgba(126, 34, 206, ${(flashAlpha * 0.55).toFixed(3)})`);
      flashCore.addColorStop(1, 'rgba(88, 28, 135, 0)');
      ctx.fillStyle = flashCore;
      ctx.fillRect(0, 0, width, height);
    }
  }

  // Start Animation Loop
  requestAnimationFrame(render);
})();
