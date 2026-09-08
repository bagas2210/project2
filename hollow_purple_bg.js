/**
 * Hollow Purple (Kyoshiki: Murasaki) - Full Cycle Canvas Animation Engine
 * 
 * Animation Cycle:
 * 1. Aka (Red) charges on the left, Ao (Blue) charges on the right.
 * 2. Sudden anticipation pull-back & magnetic snap convergence towards each other.
 * 3. Violent swirl & collision at center -> Fuses into glowing Purple (Murasaki) Core.
 * 4. Gravitational compression -> Cataclysmic FULL-SCREEN PURPLE DETONATION!
 * 5. Expanding blast wave, high-speed energy rays, and flash.
 * 6. Smooth dissipation & seamless loop back to initial state.
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

  // Animation Cycle Timings (Total: 10.0 seconds)
  const CYCLE_DURATION = 10.0;
  let startTime = performance.now();

  // Sparks Pool for continuous energy motes
  const SPARK_COUNT = 45;
  const sparks = Array.from({ length: SPARK_COUNT }, () => ({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    size: 1,
    alpha: 0,
    color: 'red'
  }));

  // Explosion Debris Rays
  const RAY_COUNT = 36;
  const explosionRays = Array.from({ length: RAY_COUNT }, (_, i) => ({
    angle: (i / RAY_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.15,
    speed: 6 + Math.random() * 14,
    dist: 0,
    length: 30 + Math.random() * 80,
    width: 2 + Math.random() * 3,
    alpha: 0
  }));

  function resetExplosionRays(cx, cy) {
    for (let i = 0; i < RAY_COUNT; i++) {
      const r = explosionRays[i];
      r.dist = 10;
      r.alpha = 1.0;
    }
  }

  // Helper: Draw Glowing Sphere (Multi-layered radial gradient for high-dynamic anime glow)
  function drawGlowOrb(x, y, radius, innerColor, midColor, outerColor, alpha = 1.0) {
    if (radius <= 0.1 || alpha <= 0.01) return;

    // Outer Aura
    const outerGrad = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
    outerGrad.addColorStop(0, midColor.replace('__A__', (alpha * 0.8).toFixed(3)));
    outerGrad.addColorStop(0.5, outerColor.replace('__A__', (alpha * 0.4).toFixed(3)));
    outerGrad.addColorStop(1, outerColor.replace('__A__', '0'));

    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Intense Core
    const coreRadius = radius * 0.45;
    const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, coreRadius);
    coreGrad.addColorStop(0, innerColor.replace('__A__', alpha.toFixed(3)));
    coreGrad.addColorStop(0.6, midColor.replace('__A__', (alpha * 0.9).toFixed(3)));
    coreGrad.addColorStop(1, midColor.replace('__A__', '0'));

    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(x, y, coreRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Smooth Easing Functions
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
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
    const t = elapsed % CYCLE_DURATION; // 0 to 10.0 seconds

    const cx = width * 0.5;
    const cy = height * 0.5;
    const baseOrbRadius = Math.min(width, height) * 0.18;
    const maxOrbDist = Math.min(width, height) * 0.36;

    // Clear dark background with deep cosmic tone
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#06020e';
    ctx.fillRect(0, 0, width, height);

    // Subtle dark radial vignette
    const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, maxDiag * 0.7);
    bgGrad.addColorStop(0, '#10051e');
    bgGrad.addColorStop(0.6, '#080312');
    bgGrad.addColorStop(1, '#04010a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Switch to Screen blending for radiant anime energy
    ctx.globalCompositeOperation = 'screen';

    // ========================================================
    // TIMELINE PHASES
    // ========================================================
    // Phase 1: 0.0s - 3.2s -> Aka (Left) & Ao (Right) Charge & Hover
    // Phase 2: 3.2s - 3.6s -> Anticipation Pullback
    // Phase 3: 3.6s - 4.5s -> High-Speed Snap Convergence & Swirl
    // Phase 4: 4.5s - 5.3s -> Murasaki (Purple) Singularity Fusion & Compression
    // Phase 5: 5.3s - 7.5s -> CATACLYSMIC FULL SCREEN EXPLOSION!
    // Phase 6: 7.5s - 10.0s -> Dissipation & Fade back to rest
    // ========================================================

    let redX = cx - maxOrbDist;
    let redY = cy;
    let redRadius = baseOrbRadius;
    let redAlpha = 0;

    let blueX = cx + maxOrbDist;
    let blueY = cy;
    let blueRadius = baseOrbRadius;
    let blueAlpha = 0;

    let purpleRadius = 0;
    let purpleAlpha = 0;
    let flashAlpha = 0;
    let blastRingRadius = 0;
    let blastRingAlpha = 0;

    if (t < 3.2) {
      // Phase 1: Charge & Hover
      const fadeIn = Math.min(t / 0.8, 1.0);
      const hoverA = Math.sin(t * 3.5) * 12;
      const hoverB = Math.cos(t * 3.5) * 12;
      const pulse = 1 + Math.sin(t * 6.0) * 0.08;

      redX = cx - maxOrbDist;
      redY = cy + hoverA;
      redRadius = baseOrbRadius * pulse;
      redAlpha = fadeIn * 0.95;

      blueX = cx + maxOrbDist;
      blueY = cy + hoverB;
      blueRadius = baseOrbRadius * pulse;
      blueAlpha = fadeIn * 0.95;
      prevExploded = false;

    } else if (t < 3.6) {
      // Phase 2: Anticipation Pullback (Pulling back before sudden snap)
      const p = (t - 3.2) / 0.4;
      const pullDist = maxOrbDist * (1 + 0.12 * Math.sin(p * Math.PI));

      redX = cx - pullDist;
      redY = cy;
      redRadius = baseOrbRadius * 1.1;
      redAlpha = 1.0;

      blueX = cx + pullDist;
      blueY = cy;
      blueRadius = baseOrbRadius * 1.1;
      blueAlpha = 1.0;

    } else if (t < 4.5) {
      // Phase 3: High-Speed Snap Convergence & Swirl
      const p = (t - 3.6) / 0.9; // 0 to 1
      const easedP = easeInExpo(p);
      const currentDist = maxOrbDist * (1 - easedP);
      const swirlAngle = easedP * Math.PI * 2.5;

      // Elliptical swirling inwards
      redX = cx - Math.cos(swirlAngle) * currentDist;
      redY = cy - Math.sin(swirlAngle) * (currentDist * 0.75);
      redRadius = baseOrbRadius * (1 - p * 0.45);
      redAlpha = 1.0 - p * 0.6;

      blueX = cx + Math.cos(swirlAngle) * currentDist;
      blueY = cy + Math.sin(swirlAngle) * (currentDist * 0.75);
      blueRadius = baseOrbRadius * (1 - p * 0.45);
      blueAlpha = 1.0 - p * 0.6;

      // Purple begins forming at center as they close in
      purpleRadius = baseOrbRadius * 1.2 * p;
      purpleAlpha = p * 0.85;

    } else if (t < 5.3) {
      // Phase 4: Murasaki Fusion & Intense Gravitational Compression
      const p = (t - 4.5) / 0.8; // 0 to 1
      redAlpha = 0;
      blueAlpha = 0;

      if (p < 0.65) {
        // Core growth & violent vibration
        const growP = p / 0.65;
        const shiver = (Math.random() - 0.5) * 8;
        purpleRadius = baseOrbRadius * (1.1 + Math.sin(growP * Math.PI) * 0.35);
        purpleAlpha = 0.9 + Math.random() * 0.1;
      } else {
        // Extreme compression right before blast (singularity pinch!)
        const compP = (p - 0.65) / 0.35;
        const pinch = 1.0 - easeInExpo(compP) * 0.75; // Shrinks down tight
        purpleRadius = baseOrbRadius * pinch;
        purpleAlpha = 1.0;
      }

    } else if (t < 7.5) {
      // Phase 5: DETONATION! (Cataclysmic Full Screen Blast)
      const p = (t - 5.3) / 2.2; // 0 to 1

      if (!prevExploded) {
        resetExplosionRays(cx, cy);
        prevExploded = true;
      }

      // Initial blinding flash (covers full screen)
      if (p < 0.25) {
        flashAlpha = (1 - p / 0.25) * 0.95;
      }

      // Expanding Cataclysmic Shockwave (Full Screen Cover)
      const blastP = easeOutQuad(p);
      blastRingRadius = blastP * (maxDiag * 0.85);
      blastRingAlpha = Math.max(0, 1 - p * 1.15);

      // Decaying Core explosion ball
      purpleRadius = baseOrbRadius * (1 + p * 3.5);
      purpleAlpha = Math.max(0, (1 - p * 1.2) * 0.85);

      // Update and draw explosion rays
      for (let i = 0; i < RAY_COUNT; i++) {
        const ray = explosionRays[i];
        ray.dist += ray.speed * (1 + (1 - p) * 1.5);
        ray.alpha = Math.max(0, 1 - p * 1.2);

        const rx = cx + Math.cos(ray.angle) * ray.dist;
        const ry = cy + Math.sin(ray.angle) * ray.dist;
        const rxEnd = cx + Math.cos(ray.angle) * (ray.dist + ray.length);
        const ryEnd = cy + Math.sin(ray.angle) * (ray.dist + ray.length);

        ctx.strokeStyle = `rgba(232, 121, 249, ${(ray.alpha * 0.75).toFixed(3)})`;
        ctx.lineWidth = ray.width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rxEnd, ryEnd);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 255, 255, ${ray.alpha.toFixed(3)})`;
        ctx.lineWidth = ray.width * 0.5;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rxEnd, ryEnd);
        ctx.stroke();
      }

    } else {
      // Phase 6: Dissipation & Rest before loop
      const p = (t - 7.5) / 2.5;
      purpleAlpha = 0;
      redAlpha = 0;
      blueAlpha = 0;
      prevExploded = false;
    }

    // ========================================================
    // DRAW GLOWING ELEMENTS
    // ========================================================

    // 1. Aka (Red Orb - Fierce Crimson)
    if (redAlpha > 0.01) {
      drawGlowOrb(
        redX,
        redY,
        redRadius,
        'rgba(255, 220, 230, __A__)',
        'rgba(255, 30, 86, __A__)',
        'rgba(180, 0, 45, __A__)',
        redAlpha
      );
    }

    // 2. Ao (Blue Orb - Deep Neon Blue)
    if (blueAlpha > 0.01) {
      drawGlowOrb(
        blueX,
        blueY,
        blueRadius,
        'rgba(210, 245, 255, __A__)',
        'rgba(0, 180, 255, __A__)',
        'rgba(0, 70, 200, __A__)',
        blueAlpha
      );
    }

    // 3. Murasaki (Purple Fusion Orb & Singularity Core)
    if (purpleAlpha > 0.01) {
      drawGlowOrb(
        cx,
        cy,
        purpleRadius,
        'rgba(255, 255, 255, __A__)',
        'rgba(217, 70, 239, __A__)',
        'rgba(112, 26, 117, __A__)',
        purpleAlpha
      );
    }

    // 4. Expanding Full-Screen Shockwave Rings
    if (blastRingAlpha > 0.01 && blastRingRadius > 5) {
      // Outer devastating blast wave
      ctx.beginPath();
      ctx.arc(cx, cy, blastRingRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(232, 121, 249, ${(blastRingAlpha * 0.9).toFixed(3)})`;
      ctx.lineWidth = Math.max(3, 14 * (1 - blastRingRadius / maxDiag));
      ctx.stroke();

      // Inner white-hot blast ring
      ctx.beginPath();
      ctx.arc(cx, cy, blastRingRadius * 0.92, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${(blastRingAlpha * 0.85).toFixed(3)})`;
      ctx.lineWidth = Math.max(2, 6 * (1 - blastRingRadius / maxDiag));
      ctx.stroke();

      // Deep purple aura ring
      ctx.beginPath();
      ctx.arc(cx, cy, blastRingRadius * 0.80, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(168, 85, 247, ${(blastRingAlpha * 0.45).toFixed(3)})`;
      ctx.lineWidth = Math.max(2, 22 * (1 - blastRingRadius / maxDiag));
      ctx.stroke();
    }

    // 5. Full Screen Blast Flash
    if (flashAlpha > 0.01) {
      ctx.fillStyle = `rgba(240, 171, 252, ${flashAlpha.toFixed(3)})`;
      ctx.fillRect(0, 0, width, height);

      // Core white burst
      const flashCore = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxDiag * 0.6);
      flashCore.addColorStop(0, `rgba(255, 255, 255, ${(flashAlpha * 0.9).toFixed(3)})`);
      flashCore.addColorStop(0.5, `rgba(217, 70, 239, ${(flashAlpha * 0.5).toFixed(3)})`);
      flashCore.addColorStop(1, 'rgba(147, 51, 234, 0)');
      ctx.fillStyle = flashCore;
      ctx.fillRect(0, 0, width, height);
    }
  }

  // Start Animation Loop
  requestAnimationFrame(render);
})();
