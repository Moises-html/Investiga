/* ParticleSystem
   Pequenas partículas flutuantes (poeira de luz / estrelas) desenhadas em canvas,
   leves o suficiente para não pesar em celulares. */
const ParticleSystem = (() => {
  let canvas, ctx, particles = [], raf, running = false, reduced = false;

  function init() {
    canvas = document.getElementById('particles');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    reduced = document.body.classList.contains('reduced-motion');
    seed();
    if (!reduced) start();
  }

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function seed() {
    const count = window.innerWidth < 500 ? 26 : 46;
    particles = Array.from({ length: count }, () => spawn());
  }

  function spawn() {
    return {
      x: Math.random() * (canvas ? canvas.width : window.innerWidth),
      y: Math.random() * (canvas ? canvas.height : window.innerHeight),
      r: Math.random() * 1.6 + 0.4,
      vy: -(Math.random() * 0.25 + 0.05),
      vx: (Math.random() - 0.5) * 0.08,
      a: Math.random() * 0.5 + 0.1,
      hue: Math.random() > 0.5 ? '201,161,90' : '242,198,208',
    };
  }

  function tick() {
    if (!running || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.hue},${p.a})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (running || reduced) return;
    running = true;
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
  }

  function burstAt(clientX, clientY, color = '201,161,90') {
    // pequeno burst decorativo em coordenadas de tela (usado ao encontrar pistas)
    if (!ctx || reduced) return;
    for (let i = 0; i < 14; i++) {
      particles.push({
        x: clientX, y: clientY,
        r: Math.random() * 2 + 0.6,
        vx: (Math.random() - 0.5) * 2.2,
        vy: (Math.random() - 0.5) * 2.2,
        a: 1, hue: color, decay: true,
      });
    }
  }

  return { init, start, stop, burstAt };
})();
