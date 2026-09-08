/**
 * Hollow Purple (Kyoshiki: Murasaki) - Full Cycle Canvas Animation Engine
 * 
 * Flow:
 * 1. Pas muncul: Ada animasi letupan kemunculan (Singularity Ignition, Expanding Shockwave Ring & Spark Burst).
 * 2. Setelah meletup muncul, langsung bergerak maju pelan saling mendekat di sumbu lurus tanpa goyang.
 * 3. Bertabrakan di tengah -> Melebur menjadi bola Ungu (Murasaki) yang sangat besar dan tebal.
 * 4. Kompresi singularitas sesaat -> MELEDAK 1 LAYAR PENUH!
 * 5. Memudar halus dan kembali ke semula (looping mulus dengan animasi muncul kembali).
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

  // Animation Cycle Timings (Total: 8.8 seconds)
  const CYCLE_DURATION = 8.8;
  let startTime = performance.now();
  let prevCycle = -1;

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

  // Spawn Ignition Sparks (Animasi letupan partikel saat merah & biru muncul)
  const SPAWN_SPARK_COUNT = 16;
  const redSpawnSparks = Array.from({ length: SPAWN_SPARK_COUNT }, (_, i) => ({
    angle: (i / SPAWN_SPARK_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.2,
    speed: 3 + Math.random() * 7,
    dist: 0,
    size: 2.2 + Math.random() * 2.8
  }));
  const blueSpawnSparks = Array.from({ length: SPAWN_SPARK_COUNT }, (_, i) => ({
    angle: (i / SPAWN_SPARK_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.2,
    speed: 3 + Math.random() * 7,
    dist: 0,
    size: 2.2 + Math.random() * 2.8
  }));

  function resetSpawnSparks() {
    for (let i = 0; i < SPAWN_SPARK_COUNT; i++) {
      redSpawnSparks[i].dist = 0;
      blueSpawnSparks[i].dist = 0;
    }
  }

  // Draw Dense High-Intensity Plasma Orb (Lebih Tebal, Lebih Besar, Padat)
  function drawDenseGlowOrb(x, y, radius, innerColor, midColor, outerColor, alpha = 1.0, isThick = true) {
    if (radius <= 0.1 || alpha <= 0.01) return;

    const a = Math.min(1.0, alpha);

    // 1. Giant Outer Radiance Aura
    const auraGrad = ctx.createRadialGradient(x, y, radius * 0.15, x, y, radius * 1.55);
    auraGrad.addColorStop(0, midColor.replace('__A__', (a * 0.85).toFixed(3)));
    auraGrad.addColorStop(0.45, outerColor.replace('__A__', (a * 0.55).toFixed(3)));
    auraGrad.addColorStop(1, outerColor.replace('__A__', '0'));
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.55, 0, Math.PI * 2);
    ctx.fill();

    // 2. Thick Dense Energy Body (Deep Saturation)
    const bodyGrad = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
    bodyGrad.addColorStop(0, midColor.replace('__A__', (a * 0.98).toFixed(3)));
    bodyGrad.addColorStop(0.65, midColor.replace('__A__', (a * 0.92).toFixed(3)));
    bodyGrad.addColorStop(1, outerColor.replace('__A__', '0'));
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // 3. Extra Saturated Inner Plasma Core (Membuat warna merah & ungu sangat padat/tebal)
    if (isThick) {
      const denseGrad = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.75);
      denseGrad.addColorStop(0, innerColor.replace('__A__', (a * 1.0).toFixed(3)));
      denseGrad.addColorStop(0.45, midColor.replace('__A__', (a * 0.98).toFixed(3)));
      denseGrad.addColorStop(0.85, midColor.replace('__A__', (a * 0.80).toFixed(3)));
      denseGrad.addColorStop(1, outerColor.replace('__A__', '0'));
      ctx.fillStyle = denseGrad;
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.75, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. White-Hot Intense Singularity Center
    const coreRadius = radius * 0.40;
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
    const currentCycle = Math.floor(elapsed / CYCLE_DURATION);

    // Reset partikel kemunculan setiap siklus baru dimulai
    if (currentCycle !== prevCycle) {
      resetSpawnSparks();
      prevCycle = currentCycle;
      prevExploded = false;
    }

    const t = elapsed % CYCLE_DURATION; // 0 to 8.8 seconds

    const cx = width * 0.5;
    const cy = height * 0.5;

    // Dimensi orbs (Besar dan Tebal)
    const minDim = Math.min(width, height);
    const redBaseRadius = minDim * 0.30;       // Sangat besar & tebal
    const blueBaseRadius = minDim * 0.25;      // Seimbang dengan merah
    const purpleBaseRadius = minDim * 0.42;    // Masif & tebal
    const maxOrbDist = minDim * 0.42;          // Jarak mulai dari pinggir

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

    // Switch to Screen blending for radiant anime energy
    ctx.globalCompositeOperation = 'screen';

    // ========================================================
    // TIMELINE PHASES
    // ========================================================
    // Phase 1: 0.0s - 4.5s -> MUNCUL DENGAN ANIMASI lalu langsung maju pelan (Lurus)
    // Phase 2: 4.5s - 5.2s -> Melebur jadi Ungu Masif & Kompresi Singularitas
    // Phase 3: 5.2s - 7.4s -> CATACLYSMIC FULL SCREEN EXPLOSION!
    // Phase 4: 7.4s - 8.8s -> Memudar halus & Loop kembali ke awal
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

    if (t < 4.5) {
      // Phase 1: Berjalan maju perlahan di garis lurus
      const p = t / 4.5; // 0 to 1 (pelan & dramatis)
      const moveProgress = Math.pow(p, 1.25);
      const currentDist = maxOrbDist * (1 - moveProgress);

      redX = cx - currentDist;
      redY = cy;
      blueX = cx + currentDist;
      blueY = cy;

      // ANIMASI KEMUNCULAN (SPAWN ANIMATION saat 0.0s - 0.75s):
      // Muncul dari titik cahaya meletup membesar (elastic ignition) lalu stabil
      let spawnScale = 1.0;
      if (t < 0.75) {
        const sp = t / 0.75;
        // Meletup dari 0 -> membesar melebihi ukuran (1.25x) -> stabil di 1.0x
        spawnScale = Math.min(1.0, Math.sin(sp * Math.PI * 0.5) * (1 + 0.32 * Math.sin(sp * Math.PI)));
        redAlpha = Math.min(1.0, sp * 1.6);
        blueAlpha = Math.min(1.0, sp * 1.6);
      } else {
        redAlpha = 1.0;
        blueAlpha = 1.0;
      }

      redRadius = redBaseRadius * spawnScale;
      blueRadius = blueBaseRadius * spawnScale;

      // Saat sudah sangat dekat di tengah, warna ungu mulai terbentuk dan membesar
      if (p > 0.6) {
        const mergeP = (p - 0.6) / 0.4;
        purpleRadius = purpleBaseRadius * (0.2 + mergeP * 0.8);
        purpleAlpha = mergeP * 0.95;
      }

    } else if (t < 5.2) {
      // Phase 2: Tabrakan Penuh -> Melebur Menjadi Ungu Masif & Kompresi Singularitas
      const p = (t - 4.5) / 0.7;
      redAlpha = 0;
      blueAlpha = 0;

      if (p < 0.6) {
        const growP = p / 0.6;
        purpleRadius = purpleBaseRadius * (1.0 + Math.sin(growP * Math.PI) * 0.35);
        purpleAlpha = 1.0;
      } else {
        const compP = (p - 0.6) / 0.4;
        const pinch = 1.0 - easeInExpo(compP) * 0.72;
        purpleRadius = purpleBaseRadius * pinch;
        purpleAlpha = 1.0;
      }

    } else if (t < 7.4) {
      // Phase 3: DETONATION! (Cataclysmic Full Screen Blast)
      const p = (t - 5.2) / 2.2;

      if (!prevExploded) {
        resetExplosionRays();
        prevExploded = true;
      }

      // Kilatan ultraviolet satu layar penuh
      if (p < 0.28) {
        flashAlpha = (1 - p / 0.28) * 0.98;
      }

      // Gelombang kejut ledakan ungu masif (Menutupi seluruh layar)
      const blastP = easeOutQuad(p);
      blastRingRadius = blastP * (maxDiag * 0.88);
      blastRingAlpha = Math.max(0, 1 - p * 1.12);

      // Bola ledakan ungu sangat besar & tebal
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

        ctx.strokeStyle = `rgba(217, 70, 239, ${(ray.alpha * 0.85).toFixed(3)})`;
        ctx.lineWidth = ray.width * 1.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rxEnd, ryEnd);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 255, 255, ${ray.alpha.toFixed(3)})`;
        ctx.lineWidth = ray.width * 0.6;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rxEnd, ryEnd);
        ctx.stroke();
      }

    } else {
      // Phase 4: Memudar halus dan siap kembali ke semula
      purpleAlpha = 0;
      redAlpha = 0;
      blueAlpha = 0;
      prevExploded = false;
    }

    // ========================================================
    // DRAW DENSE GLOWING ELEMENTS
    // ========================================================

    // 1. Aka (Red Orb - Sangat Tebal, Sangat Besar, Crimson Padat)
    if (redAlpha > 0.01) {
      drawDenseGlowOrb(
        redX,
        redY,
        redRadius,
        'rgba(255, 255, 255, __A__)',
        'rgba(255, 0, 50, __A__)',
        'rgba(200, 0, 35, __A__)',
        redAlpha,
        true
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

    // 3. EFEK ANIMASI KEMUNCULAN (Rings & Sparks saat t < 0.75s)
    if (t < 0.75) {
      const ringP = t / 0.75;
      const ringAlpha = Math.max(0, 1 - ringP);

      // Cincin gelombang letupan kemunculan Merah
      ctx.beginPath();
      ctx.arc(redX, redY, ringP * redBaseRadius * 2.2, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 40, 90, ${(ringAlpha * 0.95).toFixed(3)})`;
      ctx.lineWidth = Math.max(2, 7 * (1 - ringP));
      ctx.stroke();

      // Cincin gelombang letupan kemunculan Biru
      ctx.beginPath();
      ctx.arc(blueX, blueY, ringP * blueBaseRadius * 2.2, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 210, 255, ${(ringAlpha * 0.95).toFixed(3)})`;
      ctx.lineWidth = Math.max(2, 7 * (1 - ringP));
      ctx.stroke();

      // Percikan api/energi saat letupan kemunculan
      const sparkAlpha = Math.max(0, 1 - ringP);
      for (let i = 0; i < SPAWN_SPARK_COUNT; i++) {
        // Red sparks
        const rsp = redSpawnSparks[i];
        rsp.dist += rsp.speed;
        const rx = redX + Math.cos(rsp.angle) * rsp.dist;
        const ry = redY + Math.sin(rsp.angle) * rsp.dist;
        ctx.beginPath();
        ctx.arc(rx, ry, rsp.size * sparkAlpha, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 120, 160, ${sparkAlpha.toFixed(3)})`;
        ctx.fill();

        // Blue sparks
        const bsp = blueSpawnSparks[i];
        bsp.dist += bsp.speed;
        const bx = blueX + Math.cos(bsp.angle) * bsp.dist;
        const by = blueY + Math.sin(bsp.angle) * bsp.dist;
        ctx.beginPath();
        ctx.arc(bx, by, bsp.size * sparkAlpha, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(140, 240, 255, ${sparkAlpha.toFixed(3)})`;
        ctx.fill();
      }
    }

    // 4. Murasaki (Purple Fusion Orb - Sangat Tebal & Masif)
    if (purpleAlpha > 0.01) {
      drawDenseGlowOrb(
        cx,
        cy,
        purpleRadius,
        'rgba(255, 255, 255, __A__)',
        'rgba(230, 60, 255, __A__)',
        'rgba(140, 10, 220, __A__)',
        purpleAlpha,
        true
      );
    }

    // 5. Expanding Full-Screen Shockwave Rings (Lebih Tebal)
    if (blastRingAlpha > 0.01 && blastRingRadius > 5) {
      ctx.beginPath();
      ctx.arc(cx, cy, blastRingRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(232, 121, 249, ${(blastRingAlpha * 0.95).toFixed(3)})`;
      ctx.lineWidth = Math.max(5, 26 * (1 - blastRingRadius / maxDiag));
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, blastRingRadius * 0.93, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${(blastRingAlpha * 0.92).toFixed(3)})`;
      ctx.lineWidth = Math.max(3, 10 * (1 - blastRingRadius / maxDiag));
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, blastRingRadius * 0.82, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(168, 85, 247, ${(blastRingAlpha * 0.65).toFixed(3)})`;
      ctx.lineWidth = Math.max(4, 38 * (1 - blastRingRadius / maxDiag));
      ctx.stroke();
    }

    // 6. Full Screen Blast Flash
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
