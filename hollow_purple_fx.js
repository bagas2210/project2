/**
 * Hollow Purple (Kyoshiki: Murasaki) - Atmospheric Motion & Particle System
 * Jujutsu Kaisen Animated FX:
 * - Swirling Red (Aka) & Blue (Ao) cursed energy spirals into the singularity
 * - Murasaki (Purple) core sparks ejection
 * - Anti-gravity floating concrete debris
 * - Electric cursed lightning arcs
 * - Gravitational shockwave pulses
 * 
 * Performance: 60 FPS locked, hardware-accelerated Canvas 2D, zero CSS blur recalculation.
 */

(function () {
  'use strict';

  // Create canvas if not exists
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
    canvas.style.zIndex = '1';
    document.body.prepend(canvas);
  }

  const ctx = canvas.getContext('2d', { alpha: true });
  let width = 0;
  let height = 0;
  let dpr = 1;

  // Singularity Center
  let vortexX = 0;
  let vortexY = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Singularity center aligns with the background artwork
    if (width >= 992) {
      vortexX = width * 0.74;
      vortexY = height * 0.50;
    } else {
      vortexX = width * 0.50;
      vortexY = height * 0.45;
    }
  }

  window.addEventListener('resize', resize);
  resize();

  // Optimized Particle Counts
  const isMobile = width < 768;
  const SWIRL_COUNT = isMobile ? 32 : 65;
  const DEBRIS_COUNT = isMobile ? 12 : 24;

  // 1. Swirling Cursed Energy (Red & Blue converging into Purple)
  class EnergyParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      // 50% Red (Aka), 50% Blue (Ao)
      this.isRed = Math.random() > 0.5;
      this.angle = Math.random() * Math.PI * 2;
      this.distance = initial 
        ? 60 + Math.random() * (Math.max(width, height) * 0.45)
        : Math.max(width, height) * 0.4 + Math.random() * 80;
      
      this.speed = (0.015 + Math.random() * 0.02) * (this.isRed ? 1 : -1);
      this.pull = 0.6 + Math.random() * 1.4;
      this.size = 1.2 + Math.random() * 2.4;
      this.alpha = 0.2 + Math.random() * 0.7;
      this.history = [];
      this.maxHistory = isMobile ? 4 : 7;
    }

    update() {
      this.angle += this.speed * (1 + 180 / (this.distance + 20));
      this.distance -= this.pull * (1 + 100 / (this.distance + 15));

      const x = vortexX + Math.cos(this.angle) * this.distance;
      const y = vortexY + Math.sin(this.angle) * (this.distance * 0.75); // Slight 3D elliptical tilt

      this.history.unshift({ x, y });
      if (this.history.length > this.maxHistory) {
        this.history.pop();
      }

      // Sucked into core -> trigger small spark & reset
      if (this.distance < 18) {
        spawnPurpleSpark(vortexX, vortexY);
        this.reset();
      }
    }

    draw() {
      if (this.history.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(this.history[0].x, this.history[0].y);
      for (let i = 1; i < this.history.length; i++) {
        ctx.lineTo(this.history[i].x, this.history[i].y);
      }

      ctx.strokeStyle = this.isRed 
        ? `rgba(255, 45, 85, ${this.alpha * 0.8})` 
        : `rgba(0, 210, 255, ${this.alpha * 0.8})`;
      ctx.lineWidth = this.size;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Glowing head spark
      ctx.beginPath();
      ctx.arc(this.history[0].x, this.history[0].y, this.size * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = this.isRed 
        ? `rgba(255, 120, 150, ${this.alpha})` 
        : `rgba(160, 240, 255, ${this.alpha})`;
      ctx.fill();
    }
  }

  // 2. Purple Singularity Ejection Sparks
  const purpleSparks = [];
  function spawnPurpleSpark(x, y) {
    if (purpleSparks.length > (isMobile ? 25 : 50)) return;
    const count = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      purpleSparks.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 2.2,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.03
      });
    }
  }

  // 3. Anti-Gravity Floating Concrete & Rock Debris
  class DebrisParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = vortexX + (Math.random() - 0.5) * (width * 0.65);
      this.y = initial ? Math.random() * height : height + 20 + Math.random() * 50;
      this.size = 3 + Math.random() * 9;
      this.vy = -(0.3 + Math.random() * 0.9); // Float upward
      this.vx = (Math.random() - 0.5) * 0.4;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.02;
      this.points = 4 + Math.floor(Math.random() * 3);
      this.alpha = 0.35 + Math.random() * 0.45;
      
      // Irregular polygon vertex offsets
      this.vertices = [];
      for (let i = 0; i < this.points; i++) {
        const rad = (Math.PI * 2 * i) / this.points;
        const dist = this.size * (0.6 + Math.random() * 0.7);
        this.vertices.push({ x: Math.cos(rad) * dist, y: Math.sin(rad) * dist });
      }
    }

    update() {
      this.y += this.vy;
      this.x += this.vx;
      this.rotation += this.rotSpeed;

      // Slight gravitational drift toward singularity
      const dx = vortexX - this.x;
      const dy = vortexY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 450) {
        this.x += (dx / dist) * 0.35;
        this.y += (dy / dist) * 0.35;
      }

      if (this.y < -30 || dist < 20) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      ctx.beginPath();
      ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
      for (let i = 1; i < this.vertices.length; i++) {
        ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
      }
      ctx.closePath();

      // Dark rock silhouette with subtle purple edge reflection
      ctx.fillStyle = `rgba(16, 8, 28, ${this.alpha})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(192, 132, 252, ${this.alpha * 0.5})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }
  }

  // 4. Electric Cursed Lightning Arcs
  const lightningBolts = [];
  let nextLightningTime = Date.now() + 1500;

  function triggerLightning() {
    const startAngle = Math.random() * Math.PI * 2;
    const startDist = 15 + Math.random() * 30;
    let currX = vortexX + Math.cos(startAngle) * startDist;
    let currY = vortexY + Math.sin(startAngle) * startDist;

    const targetAngle = startAngle + (Math.random() - 0.5) * 1.8;
    const targetDist = 70 + Math.random() * 140;
    const targetX = vortexX + Math.cos(targetAngle) * targetDist;
    const targetY = vortexY + Math.sin(targetAngle) * targetDist;

    const segments = 6 + Math.floor(Math.random() * 5);
    const points = [{ x: currX, y: currY }];

    for (let i = 1; i <= segments; i++) {
      const progress = i / segments;
      const nx = currX + (targetX - currX) * progress + (Math.random() - 0.5) * 26;
      const ny = currY + (targetY - currY) * progress + (Math.random() - 0.5) * 26;
      points.push({ x: nx, y: ny });
    }

    lightningBolts.push({
      points,
      alpha: 1.0,
      width: 1.5 + Math.random() * 1.5
    });
  }

  // 5. Singularity Shockwave Distortion Pulses
  const shockwaves = [];
  let nextPulseTime = Date.now() + 3000;

  function triggerShockwave() {
    shockwaves.push({
      x: vortexX,
      y: vortexY,
      radius: 12,
      maxRadius: Math.min(width, height) * 0.42,
      speed: 2.8 + Math.random() * 1.2,
      alpha: 0.75
    });
  }

  // Initialize Collections
  const energyParticles = Array.from({ length: SWIRL_COUNT }, () => new EnergyParticle());
  const debrisParticles = Array.from({ length: DEBRIS_COUNT }, () => new DebrisParticle());

  // Main 60 FPS Render Loop
  let isTabActive = true;
  document.addEventListener('visibilitychange', () => {
    isTabActive = !document.hidden;
  });

  function render() {
    requestAnimationFrame(render);
    if (!isTabActive) return;

    ctx.clearRect(0, 0, width, height);

    // Global blending for vibrant glowing cursed energy
    ctx.globalCompositeOperation = 'screen';

    // Update & Draw Shockwaves
    const now = Date.now();
    if (now > nextPulseTime) {
      triggerShockwave();
      nextPulseTime = now + 3500 + Math.random() * 2000;
    }

    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.radius += sw.speed;
      sw.alpha -= 0.012;

      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        shockwaves.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(192, 132, 252, ${sw.alpha * 0.6})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Inner faint ring
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius * 0.85, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(232, 121, 249, ${sw.alpha * 0.35})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Update & Draw Energy Particles (Aka & Ao)
    for (let i = 0; i < energyParticles.length; i++) {
      energyParticles[i].update();
      energyParticles[i].draw();
    }

    // Update & Draw Purple Ejection Sparks
    for (let i = purpleSparks.length - 1; i >= 0; i--) {
      const sp = purpleSparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.vx *= 0.96;
      sp.vy *= 0.96;
      sp.life -= sp.decay;

      if (sp.life <= 0) {
        purpleSparks.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.size * sp.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(217, 70, 239, ${sp.life * 0.9})`;
      ctx.fill();
    }

    // Update & Draw Cursed Lightning Arcs
    if (now > nextLightningTime) {
      triggerLightning();
      nextLightningTime = now + 1600 + Math.random() * 2200;
    }

    for (let i = lightningBolts.length - 1; i >= 0; i--) {
      const bolt = lightningBolts[i];
      bolt.alpha -= 0.14; // Quick discharge (approx 6-7 frames)

      if (bolt.alpha <= 0) {
        lightningBolts.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
      for (let j = 1; j < bolt.points.length; j++) {
        ctx.lineTo(bolt.points[j].x, bolt.points[j].y);
      }

      // Outer violet glow
      ctx.strokeStyle = `rgba(168, 85, 247, ${bolt.alpha * 0.7})`;
      ctx.lineWidth = bolt.width * 2.2;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Inner intense core
      ctx.strokeStyle = `rgba(255, 255, 255, ${bolt.alpha})`;
      ctx.lineWidth = bolt.width;
      ctx.stroke();
    }

    // Switch back to normal blend mode for solid debris silhouettes
    ctx.globalCompositeOperation = 'source-over';

    // Update & Draw Anti-Gravity Rocks
    for (let i = 0; i < debrisParticles.length; i++) {
      debrisParticles[i].update();
      debrisParticles[i].draw();
    }
  }

  // Start Animation
  requestAnimationFrame(render);
})();
