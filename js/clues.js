/* ClueSystem
   Controla o painel "PISTAS ENCONTRADAS". Cada uma das 5 pistas usa um
   mini-jogo diferente para ser revelada (raspar, segurar ou precisão de
   tempo), com dificuldade crescente — nunca só um clique. */
const ClueSystem = (() => {
  const CLUES = [
    { id: 'c1', icon: '🔎', label: 'Pista 01', reveal: 'Uma data circulada em vermelho: 14/02.', type: 'scratch', threshold: 0.5, brush: 6.5 },
    { id: 'c2', icon: '📷', label: 'Pista 02', reveal: 'Uma fotografia dobrada ao meio.', type: 'hold', duration: 1900 },
    { id: 'c3', icon: '💌', label: 'Pista 03', reveal: 'Um envelope nunca aberto.', type: 'timing', hitsNeeded: 3, targetWidth: 26 },
    { id: 'c4', icon: '🕰️', label: 'Pista 04', reveal: 'Um relógio parado às 21:11.', type: 'scratch', threshold: 0.62, brush: 5 },
    { id: 'c5', icon: '🎬', label: 'Pista 05', reveal: 'Um rolo de filme com uma etiqueta rasurada.', type: 'hold', duration: 2600 },
  ];

  const SCRATCH_RES = 64; // resolução interna do canvas (perf em celular)

  const HINTS = {
    scratch: 'arraste para raspar',
    hold: 'segure para revelar',
    timing: 'toque no ponto certo',
  };

  function render(container, foundIds, onFound) {
    const grid = document.createElement('div');
    grid.className = 'clue-grid';
    grid.setAttribute('role', 'list');

    CLUES.forEach((clue) => {
      const found = foundIds.includes(clue.id);
      const item = document.createElement('div');
      item.className = 'clue-item' + (found ? ' found' : '');
      item.dataset.id = clue.id;
      item.tabIndex = 0;
      item.setAttribute('role', 'button');
      item.setAttribute(
        'aria-label',
        found ? `${clue.label} — encontrada` : `Pista oculta — ${HINTS[clue.type]}`
      );

      const revealed = document.createElement('div');
      revealed.className = 'clue-revealed';
      revealed.innerHTML = `<span class="spark"></span><span>${clue.icon}</span>`;
      item.appendChild(revealed);

      function finishReveal() {
        item.classList.add('found', 'just-found');
        item.setAttribute('aria-label', `${clue.label} — encontrada`);
        AudioController.playSfx('clue');
        const rect = item.getBoundingClientRect();
        ParticleSystem.burstAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
        setTimeout(() => item.classList.remove('just-found'), 800);
        if (typeof onFound === 'function') onFound(clue);
      }

      if (found) {
        item.addEventListener('click', () => Toast.show(clue.reveal));
      } else {
        const hint = document.createElement('span');
        hint.className = 'clue-hint';
        hint.textContent = HINTS[clue.type];
        item.appendChild(hint);

        // Acessibilidade: teclado sempre revela direto, qualquer que seja o mini-jogo.
        item.addEventListener('keydown', (e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !item.classList.contains('found')) {
            e.preventDefault();
            cleanupAndReveal();
          }
        });

        let cleanupAndReveal = () => finishReveal();

        try {
          if (clue.type === 'scratch') cleanupAndReveal = setupScratch(item, hint, clue, finishReveal);
          else if (clue.type === 'hold') cleanupAndReveal = setupHold(item, hint, clue, finishReveal);
          else if (clue.type === 'timing') cleanupAndReveal = setupTiming(item, hint, clue, finishReveal);
        } catch (err) {
          // Segurança: se algo no mini-jogo falhar neste aparelho, a pista
          // nunca fica impossível de encontrar — vira um toque simples.
          console.error('Mini-jogo falhou, usando toque simples como alternativa:', err);
          item.querySelectorAll('canvas, .clue-hold-icon, .clue-hold-bar-wrap, .clue-timing-track').forEach(n => n.remove());
          hint.textContent = 'toque para revelar';
          item.addEventListener('click', () => { if (!item.classList.contains('found')) finishReveal(); });
        }
      }

      grid.appendChild(item);
    });

    container.appendChild(grid);
    return grid;
  }

  /* -------- Mini-jogo 1: raspadinha -------- */
  function setupScratch(item, hint, clue, finishReveal) {
    const canvas = document.createElement('canvas');
    canvas.className = 'clue-scratch';
    canvas.width = SCRATCH_RES;
    canvas.height = SCRATCH_RES;
    item.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#3a1826';
    ctx.fillRect(0, 0, SCRATCH_RES, SCRATCH_RES);
    ctx.strokeStyle = 'rgba(201,161,90,.55)';
    ctx.lineWidth = 1.4;
    for (let i = 8; i < SCRATCH_RES; i += 10) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(SCRATCH_RES, i); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(242,198,208,.85)';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👆', SCRATCH_RES / 2, SCRATCH_RES / 2 - 4);

    let scratching = false;
    let throttle = 0;

    function toCanvasPoint(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / rect.width) * SCRATCH_RES,
        y: ((clientY - rect.top) / rect.height) * SCRATCH_RES,
      };
    }

    function scratchAt(clientX, clientY) {
      const p = toCanvasPoint(clientX, clientY);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(p.x, p.y, clue.brush, 0, Math.PI * 2);
      ctx.fill();
    }

    function checkRevealed() {
      const data = ctx.getImageData(0, 0, SCRATCH_RES, SCRATCH_RES).data;
      let cleared = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] < 100) cleared++;
      return cleared / (SCRATCH_RES * SCRATCH_RES);
    }

    function complete() {
      canvas.style.opacity = '0';
      setTimeout(() => canvas.remove(), 500);
      hint.style.opacity = '0';
      finishReveal();
    }

    function onMove(clientX, clientY) {
      if (item.classList.contains('found')) return;
      hint.style.opacity = '0';
      scratchAt(clientX, clientY);
      throttle++;
      if (throttle % 4 === 0 && checkRevealed() > clue.threshold) complete();
    }

    canvas.addEventListener('pointerdown', (e) => {
      scratching = true;
      canvas.setPointerCapture(e.pointerId);
      onMove(e.clientX, e.clientY);
    });
    canvas.addEventListener('pointermove', (e) => { if (scratching) onMove(e.clientX, e.clientY); });
    canvas.addEventListener('pointerup', () => { scratching = false; });
    canvas.addEventListener('pointercancel', () => { scratching = false; });

    return complete;
  }

  /* -------- Mini-jogo 2: segurar para revelar -------- */
  function setupHold(item, hint, clue, finishReveal) {
    const icon = document.createElement('div');
    icon.className = 'clue-hold-icon';
    icon.textContent = '✋';
    item.appendChild(icon);

    const barWrap = document.createElement('div');
    barWrap.className = 'clue-hold-bar-wrap';
    const bar = document.createElement('div');
    bar.className = 'clue-hold-bar-fill';
    barWrap.appendChild(bar);
    item.appendChild(barWrap);

    let holding = false, start = 0, raf = null;

    function setPct(pct) { bar.style.width = (pct * 100) + '%'; }

    function tick() {
      if (!holding) return;
      const pct = Math.min((performance.now() - start) / clue.duration, 1);
      setPct(pct);
      if (pct >= 1) { complete(); return; }
      raf = requestAnimationFrame(tick);
    }

    function complete() {
      holding = false;
      cancelAnimationFrame(raf);
      barWrap.style.opacity = '0'; icon.style.opacity = '0';
      setTimeout(() => { barWrap.remove(); icon.remove(); }, 400);
      hint.style.opacity = '0';
      finishReveal();
    }

    function cancel() {
      if (!holding) return;
      holding = false;
      cancelAnimationFrame(raf);
      setPct(0);
    }

    item.addEventListener('pointerdown', (e) => {
      if (item.classList.contains('found')) return;
      e.preventDefault();
      holding = true; start = performance.now(); hint.style.opacity = '0';
      raf = requestAnimationFrame(tick);
    });
    item.addEventListener('pointerup', cancel);
    item.addEventListener('pointerleave', cancel);
    item.addEventListener('pointercancel', cancel);

    return complete;
  }

  /* -------- Mini-jogo 3: precisão de tempo -------- */
  function setupTiming(item, hint, clue, finishReveal) {
    const track = document.createElement('div');
    track.className = 'clue-timing-track';
    const targetW = clue.targetWidth;
    const target = document.createElement('div');
    target.className = 'clue-timing-target';
    target.style.left = (50 - targetW / 2) + '%';
    target.style.width = targetW + '%';
    const dot = document.createElement('div');
    dot.className = 'clue-timing-dot';
    track.appendChild(target);
    track.appendChild(dot);
    item.appendChild(track);

    let pos = 0, dir = 1, hits = 0, raf = null;
    const speed = 2.1;

    function tick() {
      pos += dir * speed;
      if (pos >= 100) { pos = 100; dir = -1; }
      if (pos <= 0) { pos = 0; dir = 1; }
      dot.style.left = pos + '%';
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    function complete() {
      cancelAnimationFrame(raf);
      track.style.opacity = '0';
      setTimeout(() => track.remove(), 400);
      hint.style.opacity = '0';
      finishReveal();
    }

    function onTap(e) {
      if (item.classList.contains('found')) return;
      e.stopPropagation();
      hint.style.opacity = '0';
      const half = targetW / 2;
      const inTarget = pos >= 50 - half && pos <= 50 + half;
      if (inTarget) {
        hits++;
        dot.classList.add('hit'); setTimeout(() => dot.classList.remove('hit'), 150);
        if (hits >= clue.hitsNeeded) complete();
      } else {
        hits = 0;
        dot.classList.add('miss'); setTimeout(() => dot.classList.remove('miss'), 150);
      }
    }
    track.addEventListener('pointerdown', onTap);

    return complete;
  }

  function total() { return CLUES.length; }
  function all() { return CLUES; }

  return { render, total, all };
})();

/* Toast — pequenas mensagens (também usado pelos easter eggs) */
const Toast = (() => {
  let el, timer;
  function ensure() {
    if (el) return el;
    el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
    return el;
  }
  function show(msg, duration = 2600) {
    const t = ensure();
    t.textContent = msg;
    t.classList.add('visible');
    clearTimeout(timer);
    timer = setTimeout(() => t.classList.remove('visible'), duration);
  }
  return { show };
})();
