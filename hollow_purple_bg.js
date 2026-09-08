/**
 * Hollow Purple (Kyoshiki: Murasaki) & 1-Minute Solar System Cycle
 * 
 * Flow:
 * 1. [0.0s - 4.5s]: Merah & Biru meletup muncul di ujung samping layar, bergerak lurus pelan saling tabrak.
 * 2. [4.5s - 5.2s]: Bertabrakan di tengah -> Melebur jadi bola Ungu (Murasaki) masif & terkompresi.
 * 3. [5.2s - 7.0s]: MELEDAK 1 LAYAR PENUH! Gelombang ledakan membuka/menguak alam semesta.
 * 4. [7.0s - 67.0s (1 MENIT)]: Background TATA SURYA BERGERAK 60 FPS AKTIF:
 *    - Matahari bercahaya dengan korona api di pusat.
 *    - Planet-planet (Merkurius, Venus, Bumi + Bulan, Mars, Asteroid Belt, Jupiter, Saturnus + Cincin, Uranus, Neptunus) berotasi mengitari matahari pada orbitnya masing-masing.
 *    - Gugusan bintang berkelap-kelip (twinkling starfield).
 * 5. [66.0s - 67.0s]: Tata surya memudar halus kembali ke ruang gelap.
 * 6. Loop kembali ke awal (Merah & Biru meletup muncul lagi).
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

  // Total Cycle: 7.0s Hollow Purple + 60.0s Tata Surya = 67.0 seconds
  const HOLLOW_DURATION = 7.0;
  const SOLAR_DURATION = 60.0;
  const CYCLE_DURATION = HOLLOW_DURATION + SOLAR_DURATION; // 67.0 seconds
  let startTime = performance.now();
  let prevCycle = -1;

  // ========================================================
  // SOLAR SYSTEM DATA & PARTICLES
  // ========================================================
  const STAR_COUNT = 130;
  const stars = Array.from({ length: STAR_COUNT }, () => ({
    xRatio: Math.random(),
    yRatio: Math.random(),
    radius: 0.6 + Math.random() * 1.5,
    baseAlpha: 0.25 + Math.random() * 0.65,
    speed: 1.5 + Math.random() * 3.0,
    phase: Math.random() * Math.PI * 2
  }));

  // Planet definitions (orbital speeds, sizes, colors)
  const planets = [
    { name: 'Merkurius', distRatio: 0.12, radius: 3.2, speed: 0.55, color: '#d6d3d1', glow: 'rgba(214, 211, 209, 0.4)', initialAngle: 0.4 },
    { name: 'Venus', distRatio: 0.18, radius: 4.8, speed: 0.38, color: '#fde047', glow: 'rgba(253, 224, 71, 0.4)', initialAngle: 2.1 },
    { name: 'Bumi', distRatio: 0.25, radius: 5.5, speed: 0.28, color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.5)', initialAngle: 4.5, hasMoon: true },
    { name: 'Mars', distRatio: 0.32, radius: 4.0, speed: 0.21, color: '#f87171', glow: 'rgba(248, 113, 113, 0.4)', initialAngle: 1.2 },
    { name: 'Jupiter', distRatio: 0.46, radius: 11.5, speed: 0.12, color: '#fed7aa', glow: 'rgba(254, 215, 170, 0.4)', initialAngle: 3.6, hasBands: true },
    { name: 'Saturnus', distRatio: 0.60, radius: 9.2, speed: 0.08, color: '#fef08a', glow: 'rgba(254, 240, 138, 0.35)', initialAngle: 5.2, hasRings: true },
    { name: 'Uranus', distRatio: 0.72, radius: 6.8, speed: 0.055, color: '#67e8f9', glow: 'rgba(103, 232, 249, 0.4)', initialAngle: 0.9 },
    { name: 'Neptunus', distRatio: 0.84, radius: 6.5, speed: 0.042, color: '#60a5fa', glow: 'rgba(96, 165, 250, 0.4)', initialAngle: 2.8 }
  ];

  // Asteroid belt particles between Mars & Jupiter
  const ASTEROID_COUNT = 32;
  const asteroids = Array.from({ length: ASTEROID_COUNT }, () => ({
    distRatio: 0.37 + Math.random() * 0.04,
    angle: Math.random() * Math.PI * 2,
    speed: 0.14 + Math.random() * 0.05,
    size: 1.0 + Math.random() * 1.5,
    alpha: 0.3 + Math.random() * 0.4
  }));

  // ========================================================
  // HOLLOW PURPLE EXPLOSION PARTICLES
  // ========================================================
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

  // Spawn Ignition Sparks
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

  // Draw Dense High-Intensity Plasma Orb
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

    // 2. Thick Dense Energy Body
    const bodyGrad = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
    bodyGrad.addColorStop(0, midColor.replace('__A__', (a * 0.98).toFixed(3)));
    bodyGrad.addColorStop(0.65, midColor.replace('__A__', (a * 0.92).toFixed(3)));
    bodyGrad.addColorStop(1, outerColor.replace('__A__', '0'));
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // 3. Extra Saturated Inner Plasma Core
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

    if (currentCycle !== prevCycle) {
      resetSpawnSparks();
      prevCycle = currentCycle;
      prevExploded = false;
    }

    const t = elapsed % CYCLE_DURATION; // 0 to 67.0 seconds

    const cx = width * 0.5;
    const cy = height * 0.5;

    // Dimensions
    const minDim = Math.min(width, height);
    const redBaseRadius = Math.min(minDim * 0.28, width * 0.22);
    const blueBaseRadius = Math.min(minDim * 0.24, width * 0.19);
    const purpleBaseRadius = minDim * 0.42;
    const maxOrbDist = Math.max(width * 0.45, minDim * 0.56);

    // Clear dark background with deep cosmic tone
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#06020e';
    ctx.fillRect(0, 0, width, height);

    // Cosmic background vignette
    const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, maxDiag * 0.7);
    bgGrad.addColorStop(0, '#0f051e');
    bgGrad.addColorStop(0.6, '#06020e');
    bgGrad.addColorStop(1, '#020106');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // ========================================================
    // TATA SURYA LOGIC & RENDERING
    // ========================================================
    // Solar system emerges during purple explosion (t >= 5.2s) and stays for 1 minute (until 67.0s)
    let solarAlpha = 0;
    if (t >= 5.2 && t < 7.0) {
      // Fade in under the explosion flash
      solarAlpha = (t - 5.2) / 1.8;
    } else if (t >= 7.0 && t < 66.0) {
      // 100% active and orbiting for nearly a full minute
      solarAlpha = 1.0;
    } else if (t >= 66.0 && t < 67.0) {
      // Final 1 second: smooth dissolve to prepare for next cycle
      solarAlpha = 1.0 - (t - 66.0) / 1.0;
    }

    if (solarAlpha > 0.01) {
      // 1. Starfield
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < STAR_COUNT; i++) {
        const s = stars[i];
        const sx = s.xRatio * width;
        const sy = s.yRatio * height;
        const twinkle = Math.sin(elapsed * s.speed + s.phase);
        const sAlpha = Math.max(0, s.baseAlpha + twinkle * 0.3) * solarAlpha;

        ctx.beginPath();
        ctx.arc(sx, sy, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 245, 255, ${sAlpha.toFixed(3)})`;
        ctx.fill();
      }

      // 2. Solar System Center & Geometry (Elliptical perspective)
      const maxOrbitX = Math.min(width * 0.44, minDim * 0.48);
      const maxOrbitY = maxOrbitX * 0.68; // Tilted 3D perspective

      // Draw Orbit Paths
      ctx.lineWidth = 1;
      for (let i = 0; i < planets.length; i++) {
        const p = planets[i];
        const ox = maxOrbitX * p.distRatio;
        const oy = maxOrbitY * p.distRatio;

        ctx.beginPath();
        ctx.ellipse(cx, cy, ox, oy, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${(0.07 * solarAlpha).toFixed(3)})`;
        ctx.stroke();
      }

      // Draw Asteroid Belt
      for (let i = 0; i < ASTEROID_COUNT; i++) {
        const ast = asteroids[i];
        ast.angle += ast.speed * 0.008;
        const ax = cx + Math.cos(ast.angle) * (maxOrbitX * ast.distRatio);
        const ay = cy + Math.sin(ast.angle) * (maxOrbitY * ast.distRatio);

        ctx.beginPath();
        ctx.arc(ax, ay, ast.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(214, 211, 209, ${(ast.alpha * solarAlpha).toFixed(3)})`;
        ctx.fill();
      }

      // 3. Glowing Sun at Center
      const sunRadius = Math.max(16, minDim * 0.042);
      const sunPulse = 1 + Math.sin(elapsed * 2.5) * 0.06;

      // Sun Outer Corona
      const coronaGrad = ctx.createRadialGradient(cx, cy, sunRadius * 0.2, cx, cy, sunRadius * 3.0 * sunPulse);
      coronaGrad.addColorStop(0, `rgba(254, 240, 138, ${(0.85 * solarAlpha).toFixed(3)})`);
      coronaGrad.addColorStop(0.35, `rgba(249, 115, 22, ${(0.45 * solarAlpha).toFixed(3)})`);
      coronaGrad.addColorStop(0.7, `rgba(239, 68, 68, ${(0.18 * solarAlpha).toFixed(3)})`);
      coronaGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = coronaGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, sunRadius * 3.0 * sunPulse, 0, Math.PI * 2);
      ctx.fill();

      // Sun Intense Core
      const sunCoreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunRadius);
      sunCoreGrad.addColorStop(0, `rgba(255, 255, 255, ${solarAlpha.toFixed(3)})`);
      sunCoreGrad.addColorStop(0.4, `rgba(254, 240, 138, ${solarAlpha.toFixed(3)})`);
      sunCoreGrad.addColorStop(0.85, `rgba(245, 158, 11, ${(0.95 * solarAlpha).toFixed(3)})`);
      sunCoreGrad.addColorStop(1, `rgba(217, 119, 6, ${(0.8 * solarAlpha).toFixed(3)})`);
      ctx.fillStyle = sunCoreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, sunRadius, 0, Math.PI * 2);
      ctx.fill();

      // 4. Draw Orbiting Planets
      for (let i = 0; i < planets.length; i++) {
        const p = planets[i];
        const ox = maxOrbitX * p.distRatio;
        const oy = maxOrbitY * p.distRatio;

        // Current planetary position along orbit
        const pAngle = p.initialAngle + elapsed * p.speed;
        const px = cx + Math.cos(pAngle) * ox;
        const py = cy + Math.sin(pAngle) * oy;

        // Planet Atmosphere Glow
        ctx.beginPath();
        ctx.arc(px, py, p.radius * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = p.glow.replace(/[\d\.]+\)$/, `${(0.45 * solarAlpha).toFixed(3)})`);
        ctx.fill();

        // Saturn's Rings (drawn behind if in upper orbit half)
        if (p.hasRings) {
          ctx.beginPath();
          ctx.ellipse(px, py, p.radius * 2.5, p.radius * 0.85, Math.PI / 6, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(254, 240, 138, ${(0.6 * solarAlpha).toFixed(3)})`;
          ctx.lineWidth = 2.2;
          ctx.stroke();
        }

        // Planet Solid Body
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Earth's Moon
        if (p.hasMoon) {
          const moonDist = 11;
          const moonAngle = elapsed * 2.8;
          const mx = px + Math.cos(moonAngle) * moonDist;
          const my = py + Math.sin(moonAngle) * (moonDist * 0.6);

          ctx.beginPath();
          ctx.arc(mx, my, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(226, 232, 240, ${(0.9 * solarAlpha).toFixed(3)})`;
          ctx.fill();
        }
      }
    }

    // ========================================================
    // HOLLOW PURPLE LOGIC & RENDERING
    // ========================================================
    // Active during t < 7.5s (then yields to Solar System for 1 minute)
    if (t < 7.5) {
      ctx.globalCompositeOperation = 'screen';

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
        // Phase 1: Maju pelan di garis lurus
        const p = t / 4.5;
        const moveProgress = Math.pow(p, 1.25);
        const currentDist = maxOrbDist * (1 - moveProgress);

        redX = cx - currentDist;
        redY = cy;
        blueX = cx + currentDist;
        blueY = cy;

        // Animasi kemunculan (0.0s - 0.75s)
        let spawnScale = 1.0;
        if (t < 0.75) {
          const sp = t / 0.75;
          spawnScale = Math.min(1.0, Math.sin(sp * Math.PI * 0.5) * (1 + 0.32 * Math.sin(sp * Math.PI)));
          redAlpha = Math.min(1.0, sp * 1.6);
          blueAlpha = Math.min(1.0, sp * 1.6);
        } else {
          redAlpha = 1.0;
          blueAlpha = 1.0;
        }

        redRadius = redBaseRadius * spawnScale;
        blueRadius = blueBaseRadius * spawnScale;

        // Terbentuk ungu saat mendekati pusat
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
        if (p < 0.30) {
          flashAlpha = (1 - p / 0.30) * 0.98;
        }

        // Gelombang kejut ledakan ungu masif (Menutupi seluruh layar)
        const blastP = easeOutQuad(p);
        blastRingRadius = blastP * (maxDiag * 0.92);
        blastRingAlpha = Math.max(0, 1 - p * 1.12);

        // Bola ledakan ungu sangat besar & tebal
        purpleRadius = purpleBaseRadius * (1 + p * 4.5);
        purpleAlpha = Math.max(0, (1 - p * 1.15) * 0.95);

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
      }

      // Draw Red Orb
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

      // Draw Blue Orb
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

      // Efek Kemunculan (Rings & Sparks saat t < 0.75s)
      if (t < 0.75) {
        const ringP = t / 0.75;
        const ringAlpha = Math.max(0, 1 - ringP);

        ctx.beginPath();
        ctx.arc(redX, redY, ringP * redBaseRadius * 2.2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 40, 90, ${(ringAlpha * 0.95).toFixed(3)})`;
        ctx.lineWidth = Math.max(2, 7 * (1 - ringP));
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(blueX, blueY, ringP * blueBaseRadius * 2.2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 210, 255, ${(ringAlpha * 0.95).toFixed(3)})`;
        ctx.lineWidth = Math.max(2, 7 * (1 - ringP));
        ctx.stroke();

        const sparkAlpha = Math.max(0, 1 - ringP);
        for (let i = 0; i < SPAWN_SPARK_COUNT; i++) {
          const rsp = redSpawnSparks[i];
          rsp.dist += rsp.speed;
          const rx = redX + Math.cos(rsp.angle) * rsp.dist;
          const ry = redY + Math.sin(rsp.angle) * rsp.dist;
          ctx.beginPath();
          ctx.arc(rx, ry, rsp.size * sparkAlpha, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 120, 160, ${sparkAlpha.toFixed(3)})`;
          ctx.fill();

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

      // Draw Purple Fusion Orb
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

      // Expanding Shockwave Rings
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

      // Full Screen Blast Flash
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
  }

  // Start Animation Loop
  requestAnimationFrame(render);
})();
