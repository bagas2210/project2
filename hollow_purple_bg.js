/**
 * Hollow Purple (Kyoshiki: Murasaki) & Complete 3D Solar System (Semua Planet Lengkap)
 * 
 * Solar System Content:
 * 1. Matahari (Sun) di tengah dengan korona berapi.
 * 2. Merkurius (Mercury)
 * 3. Venus
 * 4. Bumi (Earth) lengkap dengan Bulan (Moon) yang mengitarinya.
 * 5. Mars (dengan kutub es putih)
 * 6. Sabuk Asteroid (Asteroid Belt & Ceres)
 * 7. Jupiter (raksasa bergaris & bintik merah)
 * 8. Saturnus (lengkap dengan cincin elips spektakuler)
 * 9. Uranus (dengan cincin vertikal & atmosfer sian es)
 * 10. Neptunus (raksasa biru kobalt)
 * 11. Pluto (planet kerdil es di orbit terluar)
 * 
 * Flow:
 * - 0.0s - 4.5s: Merah & Biru meletup muncul di tepi layar, maju lurus pelan saling tabrak.
 * - 4.5s - 5.2s: Melebur jadi Ungu Masif & terkompresi di tengah.
 * - 5.2s - 7.0s: MELEDAK 1 LAYAR PENUH! Gelombang ledakan menguak seluruh tata surya.
 * - 7.0s - 64.5s: TATA SURYA LENGKAP 3D BERGERAK (Aktif selama 1 Menit).
 * - 64.5s - 67.0s: ANIMASI TRANSISI DIMENSIONAL (Warp & Retakan Dimensi kembali ke Hollow Purple).
 * - 67.0s: Loop kembali ke awal secara mulus.
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
  // SOLAR SYSTEM DATA - SEMUA PLANET LENGKAP DI TATA SURYA
  // ========================================================
  const STAR_COUNT = 160;
  const stars = Array.from({ length: STAR_COUNT }, () => ({
    xRatio: Math.random(),
    yRatio: Math.random(),
    radius: 0.7 + Math.random() * 1.8,
    baseAlpha: 0.3 + Math.random() * 0.65,
    speed: 1.5 + Math.random() * 3.5,
    phase: Math.random() * Math.PI * 2
  }));

  // SEMUA PLANET TATA SURYA LENGKAP (Merkurius s/d Pluto)
  const planets = [
    { name: 'Merkurius', distRatio: 0.13, radius: 4.0, speed: 0.55, color: '#d6d3d1', glow: 'rgba(214, 211, 209, 0.4)', initialAngle: 0.8 },
    { name: 'Venus', distRatio: 0.20, radius: 5.8, speed: 0.38, color: '#fef08a', glow: 'rgba(254, 240, 138, 0.4)', initialAngle: 2.4 },
    { name: 'Bumi', distRatio: 0.28, radius: 7.8, speed: 0.27, color: '#1d4ed8', glow: 'rgba(56, 189, 248, 0.6)', initialAngle: 4.2, isEarth: true },
    { name: 'Mars', distRatio: 0.36, radius: 5.2, speed: 0.20, color: '#ea580c', glow: 'rgba(234, 88, 12, 0.4)', initialAngle: 5.7, isMars: true },
    { name: 'Ceres', distRatio: 0.44, radius: 2.8, speed: 0.16, color: '#a8a29e', glow: 'rgba(168, 162, 158, 0.3)', initialAngle: 1.1, isCeres: true },
    { name: 'Jupiter', distRatio: 0.54, radius: 16.5, speed: 0.11, color: '#e7dfd5', glow: 'rgba(254, 215, 170, 0.45)', initialAngle: 3.1, isJupiter: true },
    { name: 'Saturnus', distRatio: 0.67, radius: 11.5, speed: 0.075, color: '#fef08a', glow: 'rgba(254, 240, 138, 0.35)', initialAngle: 1.5, hasRings: true },
    { name: 'Uranus', distRatio: 0.79, radius: 8.5, speed: 0.052, color: '#67e8f9', glow: 'rgba(103, 232, 249, 0.4)', initialAngle: 0.4, hasUranusRing: true },
    { name: 'Neptunus', distRatio: 0.89, radius: 8.0, speed: 0.038, color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', initialAngle: 2.1, isNeptune: true },
    { name: 'Pluto', distRatio: 0.99, radius: 3.4, speed: 0.026, color: '#cbd5e1', glow: 'rgba(203, 213, 225, 0.35)', initialAngle: 4.8 }
  ];

  // Sabuk Asteroid (Asteroid Belt) antara Mars dan Jupiter
  const ASTEROID_COUNT = 45;
  const asteroids = Array.from({ length: ASTEROID_COUNT }, () => ({
    distRatio: 0.42 + Math.random() * 0.045,
    angle: Math.random() * Math.PI * 2,
    speed: 0.15 + Math.random() * 0.05,
    size: 1.0 + Math.random() * 1.6,
    alpha: 0.25 + Math.random() * 0.45
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

  // Draw Dense High-Intensity Plasma Orb (Hollow Purple)
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

  // Draw 3D Shaded Planet dengan Label Nama
  function drawPlanet3D(px, py, radius, planet, sunX, sunY, solarAlpha, elapsed) {
    const dx = sunX - px;
    const dy = sunY - py;
    const sunAngle = Math.atan2(dy, dx);

    ctx.save();

    // 1. Atmosphere Glow
    ctx.beginPath();
    ctx.arc(px, py, radius * 1.3, 0, Math.PI * 2);
    ctx.fillStyle = planet.glow.replace(/[\d\.]+\)$/, `${(0.45 * solarAlpha).toFixed(3)})`);
    ctx.fill();

    // 2. Planet Surface Texture (Clipped Sphere)
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = planet.color;
    ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);

    if (planet.isEarth) {
      // Bumi: Benua Hijau & Cokelat
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(px - radius * 0.25, py + radius * 0.15, radius * 0.55, 0, Math.PI * 2);
      ctx.arc(px + radius * 0.35, py - radius * 0.25, radius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#a16207';
      ctx.beginPath();
      ctx.arc(px - radius * 0.1, py + radius * 0.3, radius * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Awan Putih Berputar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.beginPath();
      ctx.ellipse(px - radius * 0.1, py - radius * 0.25, radius * 0.75, radius * 0.22, Math.PI / 7, 0, Math.PI * 2);
      ctx.ellipse(px + radius * 0.15, py + radius * 0.32, radius * 0.65, radius * 0.18, -Math.PI / 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (planet.isJupiter) {
      // Jupiter: Pita Atmosfer Horizontal & Bintik Merah Raksasa
      const bandCount = 6;
      for (let b = -bandCount; b <= bandCount; b++) {
        const by = py + (b / bandCount) * radius * 0.9;
        const bHeight = radius * 0.18;
        ctx.fillStyle = b % 2 === 0 ? '#9a3412' : '#fed7aa';
        ctx.fillRect(px - radius, by, radius * 2, bHeight);
      }
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.ellipse(px + radius * 0.28, py + radius * 0.22, radius * 0.3, radius * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (planet.isMars) {
      // Mars: Kutub Es Putih
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(px, py - radius * 0.8, radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (planet.isNeptune) {
      // Neptunus: Bintik Badai Gelap
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.ellipse(px + radius * 0.2, py - radius * 0.1, radius * 0.35, radius * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Photorealistic 3D Spherical Shadow (Terminator Bayangan Siang-Malam)
    const lightOffsetX = Math.cos(sunAngle) * (radius * 0.45);
    const lightOffsetY = Math.sin(sunAngle) * (radius * 0.45);

    const shadowGrad = ctx.createRadialGradient(
      px + lightOffsetX,
      py + lightOffsetY,
      radius * 0.15,
      px - lightOffsetX * 0.6,
      py - lightOffsetY * 0.6,
      radius * 1.25
    );
    shadowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.48)'); // Highlight matahari
    shadowGrad.addColorStop(0.42, 'rgba(0, 0, 0, 0)');
    shadowGrad.addColorStop(0.82, 'rgba(0, 0, 0, 0.82)'); // Garis terminator
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.97)'); // Sisi malam gelap

    ctx.fillStyle = shadowGrad;
    ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);
    ctx.restore();

    // 4. Cincin Saturnus
    if (planet.hasRings) {
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-Math.PI / 6);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 2.8, radius * 0.9, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(254, 240, 138, ${(0.85 * solarAlpha).toFixed(3)})`;
      ctx.lineWidth = 3.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 2.1, radius * 0.68, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(217, 119, 6, ${(0.55 * solarAlpha).toFixed(3)})`;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.restore();
    }

    // 5. Cincin Tipis Vertikal Uranus
    if (planet.hasUranusRing) {
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(Math.PI * 0.42);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.9, radius * 0.5, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(165, 243, 252, ${(0.6 * solarAlpha).toFixed(3)})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }

    // 6. Bulan Mengitari Bumi
    if (planet.isEarth) {
      const moonDist = radius * 2.4;
      const moonAngle = elapsed * 3.2;
      const mx = px + Math.cos(moonAngle) * moonDist;
      const my = py + Math.sin(moonAngle) * (moonDist * 0.65);

      ctx.beginPath();
      ctx.arc(mx, my, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(226, 232, 240, ${(0.95 * solarAlpha).toFixed(3)})`;
      ctx.fill();
    }

    // 7. Label Nama Planet (Gaya Infografis Astronomi)
    ctx.save();
    ctx.font = "600 10px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(255, 255, 255, ${(0.82 * solarAlpha).toFixed(3)})`;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 4;
    ctx.fillText(planet.name, px, py + radius + 11);
    ctx.restore();
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

    // Clear dark background
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#06020e';
    ctx.fillRect(0, 0, width, height);

    // Cosmic background vignette
    const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, maxDiag * 0.7);
    bgGrad.addColorStop(0, '#0d041c');
    bgGrad.addColorStop(0.6, '#06020e');
    bgGrad.addColorStop(1, '#020106');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // ========================================================
    // TATA SURYA LOGIC (TEPAT DI TENGAH LAYAR & SEMUA PLANET LENGKAP)
    // ========================================================
    let solarAlpha = 0;
    let transitionProgress = 0;

    if (t >= 5.2 && t < 7.0) {
      solarAlpha = (t - 5.2) / 1.8;
    } else if (t >= 7.0 && t < 64.5) {
      solarAlpha = 1.0;
    } else if (t >= 64.5 && t < 67.0) {
      transitionProgress = (t - 64.5) / 2.5; // 0 to 1
      solarAlpha = Math.max(0, 1.0 - Math.pow(transitionProgress, 1.5));
    }

    if (solarAlpha > 0.005) {
      // 1. Starfield & Cosmic Nebulae
      ctx.globalCompositeOperation = 'screen';

      const nebGrad1 = ctx.createRadialGradient(width * 0.25, height * 0.35, 10, width * 0.25, height * 0.35, minDim * 0.45);
      nebGrad1.addColorStop(0, `rgba(148, 163, 184, ${(0.18 * solarAlpha).toFixed(3)})`);
      nebGrad1.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = nebGrad1;
      ctx.fillRect(0, 0, width, height);

      const nebGrad2 = ctx.createRadialGradient(width * 0.75, height * 0.65, 10, width * 0.75, height * 0.65, minDim * 0.40);
      nebGrad2.addColorStop(0, `rgba(59, 130, 246, ${(0.14 * solarAlpha).toFixed(3)})`);
      nebGrad2.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = nebGrad2;
      ctx.fillRect(0, 0, width, height);

      // Stars
      for (let i = 0; i < STAR_COUNT; i++) {
        const s = stars[i];
        let sx = s.xRatio * width;
        let sy = s.yRatio * height;

        if (transitionProgress > 0) {
          sx += (sx - cx) * (transitionProgress * 0.4);
          sy += (sy - cy) * (transitionProgress * 0.4);
        }

        const twinkle = Math.sin(elapsed * s.speed + s.phase);
        const sAlpha = Math.max(0, s.baseAlpha + twinkle * 0.35) * solarAlpha;

        ctx.beginPath();
        ctx.arc(sx, sy, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${sAlpha.toFixed(3)})`;
        ctx.fill();
      }

      // 2. Solar System Center (Tepat di Tengah Layar: sunX = cx, sunY = cy)
      const sunX = cx;
      const sunY = cy;
      const maxOrbitX = Math.min(width * 0.47, minDim * 0.72);
      const maxOrbitY = maxOrbitX * 0.58; // 3D Perspective Tilt
      const orbitTilt = -Math.PI * 0.10;

      // 3. Draw Orbit Paths (Garis Putih Tegas untuk Setiap Planet)
      ctx.save();
      ctx.translate(sunX, sunY);
      ctx.rotate(orbitTilt);

      for (let i = 0; i < planets.length; i++) {
        const p = planets[i];
        const ox = maxOrbitX * p.distRatio;
        const oy = maxOrbitY * p.distRatio;

        ctx.beginPath();
        ctx.ellipse(0, 0, ox, oy, 0, 0, Math.PI * 2);

        if (transitionProgress > 0) {
          ctx.strokeStyle = `rgba(217, 70, 239, ${(0.85 * (1 - transitionProgress)).toFixed(3)})`;
          ctx.lineWidth = 2.5 + Math.random() * 2;
        } else {
          ctx.strokeStyle = `rgba(255, 255, 255, ${(0.68 * solarAlpha).toFixed(3)})`;
          ctx.lineWidth = 1.6;
        }
        ctx.stroke();
      }

      // Draw Sabuk Asteroid Orbit Path
      for (let i = 0; i < ASTEROID_COUNT; i++) {
        const ast = asteroids[i];
        ast.angle += ast.speed * 0.007;
        const ax = Math.cos(ast.angle) * (maxOrbitX * ast.distRatio);
        const ay = Math.sin(ast.angle) * (maxOrbitY * ast.distRatio);

        ctx.beginPath();
        ctx.arc(ax, ay, ast.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(214, 211, 209, ${(ast.alpha * solarAlpha).toFixed(3)})`;
        ctx.fill();
      }
      ctx.restore();

      // 4. Large Blazing Sun at Center (Matahari Menyala di Pusat)
      const sunRadius = Math.max(34, minDim * 0.082);
      const sunPulse = 1 + Math.sin(elapsed * 2.8) * 0.04;

      const coronaGrad = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.3, sunX, sunY, sunRadius * 2.6 * sunPulse);
      coronaGrad.addColorStop(0, `rgba(255, 255, 220, ${(0.98 * solarAlpha).toFixed(3)})`);
      coronaGrad.addColorStop(0.3, `rgba(251, 146, 60, ${(0.82 * solarAlpha).toFixed(3)})`);
      coronaGrad.addColorStop(0.65, `rgba(239, 68, 68, ${(0.42 * solarAlpha).toFixed(3)})`);
      coronaGrad.addColorStop(1, 'rgba(185, 28, 28, 0)');
      ctx.fillStyle = coronaGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * 2.6 * sunPulse, 0, Math.PI * 2);
      ctx.fill();

      const sunCoreGrad = ctx.createRadialGradient(sunX - sunRadius * 0.25, sunY - sunRadius * 0.25, 0, sunX, sunY, sunRadius);
      sunCoreGrad.addColorStop(0, `rgba(255, 255, 255, ${solarAlpha.toFixed(3)})`);
      sunCoreGrad.addColorStop(0.28, `rgba(254, 240, 138, ${solarAlpha.toFixed(3)})`);
      sunCoreGrad.addColorStop(0.62, `rgba(249, 115, 22, ${solarAlpha.toFixed(3)})`);
      sunCoreGrad.addColorStop(0.92, `rgba(220, 38, 38, ${(0.95 * solarAlpha).toFixed(3)})`);
      sunCoreGrad.addColorStop(1, `rgba(153, 27, 27, ${(0.85 * solarAlpha).toFixed(3)})`);
      ctx.fillStyle = sunCoreGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      ctx.fill();

      // Label Nama Matahari
      ctx.save();
      ctx.font = "700 11px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(254, 240, 138, ${(0.9 * solarAlpha).toFixed(3)})`;
      ctx.shadowColor = 'rgba(234, 88, 12, 0.9)';
      ctx.shadowBlur = 5;
      ctx.fillText('Matahari', sunX, sunY + sunRadius + 15);
      ctx.restore();

      // 5. Draw 3D Shaded Moving Planets (Semua Planet)
      ctx.globalCompositeOperation = 'source-over';

      for (let i = 0; i < planets.length; i++) {
        const p = planets[i];
        const ox = maxOrbitX * p.distRatio;
        const oy = maxOrbitY * p.distRatio;

        const speedMultiplier = 1 + transitionProgress * 3.5;
        const pAngle = p.initialAngle + elapsed * p.speed * speedMultiplier;

        const localX = Math.cos(pAngle) * ox;
        const localY = Math.sin(pAngle) * oy;

        const cosT = Math.cos(orbitTilt);
        const sinT = Math.sin(orbitTilt);
        const px = sunX + (localX * cosT - localY * sinT);
        const py = sunY + (localX * sinT + localY * cosT);

        drawPlanet3D(px, py, p.radius, p, sunX, sunY, solarAlpha, elapsed);
      }

      // ========================================================
      // TRANSITION ANIMATION: WARP & DIMENSIONAL RIFT
      // ========================================================
      if (transitionProgress > 0) {
        ctx.globalCompositeOperation = 'screen';

        const riftRadius = transitionProgress * maxDiag * 0.9;
        ctx.beginPath();
        ctx.arc(cx, cy, riftRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(217, 70, 239, ${(0.9 * (1 - transitionProgress)).toFixed(3)})`;
        ctx.lineWidth = 8 * (1 - transitionProgress) + 2;
        ctx.stroke();

        const boltCount = 5;
        const leftX = cx - maxOrbDist;
        const rightX = cx + maxOrbDist;

        for (let b = 0; b < boltCount; b++) {
          ctx.beginPath();
          ctx.moveTo(leftX + (Math.random() - 0.5) * 30, cy + (Math.random() - 0.5) * 60);
          ctx.lineTo(leftX + (Math.random() - 0.5) * 90, cy + (Math.random() - 0.5) * 120);
          ctx.strokeStyle = `rgba(255, 45, 85, ${(transitionProgress * 0.9).toFixed(3)})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(rightX + (Math.random() - 0.5) * 30, cy + (Math.random() - 0.5) * 60);
          ctx.lineTo(rightX + (Math.random() - 0.5) * 90, cy + (Math.random() - 0.5) * 120);
          ctx.strokeStyle = `rgba(0, 210, 255, ${(transitionProgress * 0.9).toFixed(3)})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        if (transitionProgress > 0.75) {
          const flashP = (transitionProgress - 0.75) / 0.25;
          ctx.fillStyle = `rgba(217, 70, 239, ${(flashP * 0.7).toFixed(3)})`;
          ctx.fillRect(0, 0, width, height);
        }
      }
    }

    // ========================================================
    // HOLLOW PURPLE LOGIC (Active t < 7.0s)
    // ========================================================
    if (t < 7.0) {
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
        const p = t / 4.5;
        const moveProgress = Math.pow(p, 1.25);
        const currentDist = maxOrbDist * (1 - moveProgress);

        redX = cx - currentDist;
        redY = cy;
        blueX = cx + currentDist;
        blueY = cy;

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

        if (p > 0.6) {
          const mergeP = (p - 0.6) / 0.4;
          purpleRadius = purpleBaseRadius * (0.2 + mergeP * 0.8);
          purpleAlpha = mergeP * 0.95;
        }

      } else if (t < 5.2) {
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

      } else if (t < 7.0) {
        const p = (t - 5.2) / 1.8;

        if (!prevExploded) {
          resetExplosionRays();
          prevExploded = true;
        }

        if (p < 0.35) {
          flashAlpha = (1 - p / 0.35) * 0.98;
        }

        const blastP = easeOutQuad(p);
        blastRingRadius = blastP * (maxDiag * 0.92);
        blastRingAlpha = Math.max(0, 1 - p * 1.15);

        purpleRadius = purpleBaseRadius * (1 + p * 4.5);
        purpleAlpha = Math.max(0, (1 - p * 1.18) * 0.95);

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

      // Spawn Rings & Sparks
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
