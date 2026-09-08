/**
 * Hollow Purple (Kyoshiki: Murasaki) & 1-Minute 3D Solar System with Dimensional Warp Transition
 * 
 * Flow:
 * 1. [0.0s - 4.5s]: Merah (kiri) & Biru (kanan) meletup muncul di ujung samping layar, bergerak lurus pelan saling tabrak.
 * 2. [4.5s - 5.2s]: Bertabrakan di tengah -> Melebur jadi bola Ungu (Murasaki) masif & terkompresi.
 * 3. [5.2s - 7.0s]: MELEDAK 1 LAYAR PENUH! Gelombang ledakan menguak alam semesta.
 * 4. [7.0s - 64.5s]: Background TATA SURYA 3D REALISTIK BERGERAK (Sesuai Gambar Referensi):
 *    - Matahari besar menyala dengan korona api dan tekstur magma.
 *    - Garis orbit putih tegas melengkung 3D tilted mengitari matahari.
 *    - Planet 3D shaded (Bumi bersamudra & berawan, Jupiter bergaris di latar depan, Saturnus bercincin, Mars, Venus, Merkurius, Uranus, Neptunus).
 *    - Bintang-bintang kosmik berkilau & debu nebula.
 * 5. [64.5s - 67.0s]: ANIMASI TRANSISI DIMENSIONAL (Space-Time Warp & Rift):
 *    - Garis orbit memancarkan petir energi kutukan ungu.
 *    - Planet & bintang tertarik melesat cepat membentuk pusaran distorsi ruang-waktu.
 *    - Kilatan petir merah di kiri & biru di kanan merobek alam semesta menuju awal siklus.
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
  // SOLAR SYSTEM DATA & PARTICLES (Reference Image Accurate)
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

  // Realistic Planets matching user's reference image
  const planets = [
    { name: 'Merkurius', distRatio: 0.14, radius: 4.2, speed: 0.52, color: '#d6d3d1', glow: 'rgba(214, 211, 209, 0.4)', initialAngle: 0.8 },
    { name: 'Venus', distRatio: 0.22, radius: 6.2, speed: 0.36, color: '#fef08a', glow: 'rgba(254, 240, 138, 0.4)', initialAngle: 2.4 },
    { name: 'Bumi', distRatio: 0.31, radius: 8.5, speed: 0.25, color: '#1d4ed8', glow: 'rgba(56, 189, 248, 0.6)', initialAngle: 4.2, isEarth: true },
    { name: 'Mars', distRatio: 0.41, radius: 5.8, speed: 0.19, color: '#ea580c', glow: 'rgba(234, 88, 12, 0.4)', initialAngle: 5.7 },
    { name: 'Jupiter', distRatio: 0.56, radius: 17.0, speed: 0.11, color: '#e7dfd5', glow: 'rgba(254, 215, 170, 0.45)', initialAngle: 3.1, isJupiter: true },
    { name: 'Saturnus', distRatio: 0.72, radius: 12.0, speed: 0.075, color: '#fef08a', glow: 'rgba(254, 240, 138, 0.35)', initialAngle: 1.5, hasRings: true },
    { name: 'Uranus', distRatio: 0.86, radius: 8.8, speed: 0.05, color: '#67e8f9', glow: 'rgba(103, 232, 249, 0.4)', initialAngle: 0.4 },
    { name: 'Neptunus', distRatio: 0.98, radius: 8.2, speed: 0.038, color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', initialAngle: 2.1 }
  ];

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

  // Draw 3D Shaded Planet Matching Reference Image
  function drawPlanet3D(px, py, radius, planet, sunX, sunY, solarAlpha, elapsed, warpDistort = 0) {
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
      // Earth Continents (Green & Brown landmasses)
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(px - radius * 0.25, py + radius * 0.15, radius * 0.55, 0, Math.PI * 2);
      ctx.arc(px + radius * 0.35, py - radius * 0.25, radius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#a16207';
      ctx.beginPath();
      ctx.arc(px - radius * 0.1, py + radius * 0.3, radius * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric Cloud Swirls
      ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.beginPath();
      ctx.ellipse(px - radius * 0.1, py - radius * 0.25, radius * 0.75, radius * 0.22, Math.PI / 7, 0, Math.PI * 2);
      ctx.ellipse(px + radius * 0.15, py + radius * 0.32, radius * 0.65, radius * 0.18, -Math.PI / 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (planet.isJupiter) {
      // Jupiter Atmospheric Bands
      const bandCount = 6;
      for (let b = -bandCount; b <= bandCount; b++) {
        const by = py + (b / bandCount) * radius * 0.9;
        const bHeight = radius * 0.18;
        ctx.fillStyle = b % 2 === 0 ? '#9a3412' : '#fed7aa';
        ctx.fillRect(px - radius, by, radius * 2, bHeight);
      }
      // Great Red Spot
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.ellipse(px + radius * 0.28, py + radius * 0.22, radius * 0.3, radius * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Photorealistic 3D Spherical Shadow (Facing Sun is lit, opposite is shadowed)
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
    shadowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.48)'); // Sun specular reflection
    shadowGrad.addColorStop(0.42, 'rgba(0, 0, 0, 0)');
    shadowGrad.addColorStop(0.82, 'rgba(0, 0, 0, 0.82)'); // Day/night terminator
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.97)'); // Pitch black night

    ctx.fillStyle = shadowGrad;
    ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);
    ctx.restore();

    // 4. Saturn's Rings
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
    // TATA SURYA LOGIC (Reference Image Perspective & 1-Minute Run)
    // ========================================================
    // Solar system: Active from t >= 5.2s until 67.0s (60 full seconds).
    // At t >= 64.5s (last 2.5 seconds), ANIMASI TRANSISI KEMBALI KE HOLLOW PURPLE!
    let solarAlpha = 0;
    let transitionProgress = 0;

    if (t >= 5.2 && t < 7.0) {
      solarAlpha = (t - 5.2) / 1.8;
    } else if (t >= 7.0 && t < 64.5) {
      solarAlpha = 1.0;
    } else if (t >= 64.5 && t < 67.0) {
      // 2.5s Transition Animation back to Hollow Purple!
      transitionProgress = (t - 64.5) / 2.5; // 0 to 1
      solarAlpha = Math.max(0, 1.0 - Math.pow(transitionProgress, 1.5));
    }

    if (solarAlpha > 0.005) {
      // 1. Starfield with Cosmic Nebulae
      ctx.globalCompositeOperation = 'screen';

      // Soft nebula gas clouds (matching reference image)
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

        // Transition warp: stars stretch toward edges as dimensional rift opens
        if (transitionProgress > 0) {
          const warpAmt = transitionProgress * 80;
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

      // 2. Solar System Geometry & Central Sun (Berada Tepat di Tengah Layar)
      const sunX = cx;
      const sunY = cy;
      const maxOrbitX = Math.min(width * 0.46, minDim * 0.58);
      const maxOrbitY = maxOrbitX * 0.58; // Symmetrical 3D Elliptical tilt
      const orbitTilt = -Math.PI * 0.10; // 3D angle

      // 3. Draw Orbit Paths (Crisp, Glowing White 3D Wireframe Tracks)
      ctx.save();
      ctx.translate(sunX, sunY);
      ctx.rotate(orbitTilt);

      for (let i = 0; i < planets.length; i++) {
        const p = planets[i];
        const ox = maxOrbitX * p.distRatio;
        const oy = maxOrbitY * p.distRatio;

        ctx.beginPath();
        ctx.ellipse(0, 0, ox, oy, 0, 0, Math.PI * 2);

        // If in transition phase, orbits turn into crackling purple energy lines!
        if (transitionProgress > 0) {
          ctx.strokeStyle = `rgba(217, 70, 239, ${(0.85 * (1 - transitionProgress)).toFixed(3)})`;
          ctx.lineWidth = 2.5 + Math.random() * 2;
        } else {
          // White glowing orbital tracks matching reference picture
          ctx.strokeStyle = `rgba(255, 255, 255, ${(0.68 * solarAlpha).toFixed(3)})`;
          ctx.lineWidth = 1.6;
        }
        ctx.stroke();
      }
      ctx.restore();

      // 4. Large Blazing Sun (Fiery surface & corona like photo)
      const sunRadius = Math.max(34, minDim * 0.082);
      const sunPulse = 1 + Math.sin(elapsed * 2.8) * 0.04;

      // Fiery outer glow
      const coronaGrad = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.3, sunX, sunY, sunRadius * 2.6 * sunPulse);
      coronaGrad.addColorStop(0, `rgba(255, 255, 220, ${(0.98 * solarAlpha).toFixed(3)})`);
      coronaGrad.addColorStop(0.3, `rgba(251, 146, 60, ${(0.82 * solarAlpha).toFixed(3)})`);
      coronaGrad.addColorStop(0.65, `rgba(239, 68, 68, ${(0.42 * solarAlpha).toFixed(3)})`);
      coronaGrad.addColorStop(1, 'rgba(185, 28, 28, 0)');
      ctx.fillStyle = coronaGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * 2.6 * sunPulse, 0, Math.PI * 2);
      ctx.fill();

      // Granulated Sun molten core
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

      // 5. Draw 3D Shaded Moving Planets
      ctx.globalCompositeOperation = 'source-over';

      for (let i = 0; i < planets.length; i++) {
        const p = planets[i];
        const ox = maxOrbitX * p.distRatio;
        const oy = maxOrbitY * p.distRatio;

        // Angle along tilted ellipse
        const speedMultiplier = 1 + transitionProgress * 3.5; // Accelerate during transition!
        const pAngle = p.initialAngle + elapsed * p.speed * speedMultiplier;

        // Position in tilted 3D space
        const localX = Math.cos(pAngle) * ox;
        const localY = Math.sin(pAngle) * oy;

        // Apply orbit tilt matrix
        const cosT = Math.cos(orbitTilt);
        const sinT = Math.sin(orbitTilt);
        const px = sunX + (localX * cosT - localY * sinT);
        const py = sunY + (localX * sinT + localY * cosT);

        drawPlanet3D(px, py, p.radius, p, sunX, sunY, solarAlpha, elapsed);
      }

      // ========================================================
      // TRANSITION ANIMATION: SPACE-TIME WARP & DIMENSIONAL RIFT
      // ========================================================
      if (transitionProgress > 0) {
        ctx.globalCompositeOperation = 'screen';

        // 1. Expanding Purple Gravitational Shockwave
        const riftRadius = transitionProgress * maxDiag * 0.9;
        ctx.beginPath();
        ctx.arc(cx, cy, riftRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(217, 70, 239, ${(0.9 * (1 - transitionProgress)).toFixed(3)})`;
        ctx.lineWidth = 8 * (1 - transitionProgress) + 2;
        ctx.stroke();

        // 2. Crackling Lightning at Left (Red - Aka) and Right (Blue - Ao)
        // Herals the imminent arrival of Aka and Ao!
        const boltCount = 5;
        const leftX = cx - maxOrbDist;
        const rightX = cx + maxOrbDist;

        for (let b = 0; b < boltCount; b++) {
          // Red Lightning at Left
          ctx.beginPath();
          ctx.moveTo(leftX + (Math.random() - 0.5) * 30, cy + (Math.random() - 0.5) * 60);
          ctx.lineTo(leftX + (Math.random() - 0.5) * 90, cy + (Math.random() - 0.5) * 120);
          ctx.strokeStyle = `rgba(255, 45, 85, ${(transitionProgress * 0.9).toFixed(3)})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Blue Lightning at Right
          ctx.beginPath();
          ctx.moveTo(rightX + (Math.random() - 0.5) * 30, cy + (Math.random() - 0.5) * 60);
          ctx.lineTo(rightX + (Math.random() - 0.5) * 90, cy + (Math.random() - 0.5) * 120);
          ctx.strokeStyle = `rgba(0, 210, 255, ${(transitionProgress * 0.9).toFixed(3)})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // 3. Dimensional Flash Wipe right at the end of the transition
        if (transitionProgress > 0.75) {
          const flashP = (transitionProgress - 0.75) / 0.25;
          ctx.fillStyle = `rgba(217, 70, 239, ${(flashP * 0.7).toFixed(3)})`;
          ctx.fillRect(0, 0, width, height);
        }
      }
    }

    // ========================================================
    // HOLLOW PURPLE LOGIC & RENDERING (Active t < 7.0s)
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

      } else if (t < 7.0) {
        // Phase 3: DETONATION! (Cataclysmic Full Screen Blast)
        const p = (t - 5.2) / 1.8;

        if (!prevExploded) {
          resetExplosionRays();
          prevExploded = true;
        }

        // Kilatan ultraviolet satu layar penuh
        if (p < 0.35) {
          flashAlpha = (1 - p / 0.35) * 0.98;
        }

        // Gelombang kejut ledakan ungu masif (Menutupi seluruh layar)
        const blastP = easeOutQuad(p);
        blastRingRadius = blastP * (maxDiag * 0.92);
        blastRingAlpha = Math.max(0, 1 - p * 1.15);

        // Bola ledakan ungu sangat besar & tebal
        purpleRadius = purpleBaseRadius * (1 + p * 4.5);
        purpleAlpha = Math.max(0, (1 - p * 1.18) * 0.95);

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
