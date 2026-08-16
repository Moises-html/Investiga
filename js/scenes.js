/* SceneManager
   Controla qual cena está ativa, monta o HTML de cada cena dinamicamente
   e conecta os componentes (ClueSystem, DialogueBox, Character, Puzzle...).
   Nenhuma navegação usa location.reload() — tudo é baseado em estado. */
const SceneManager = (() => {
  const root = document.getElementById('app');
  let state = LocalStorageManager.load();
  let currentEl = null;
  const CODE_ANSWER = '1402';

  const PHOTOS = [
    { id: 'p1', src: 'assets/images/helena-01.jpg', msg: 'Algumas pessoas passam pela nossa vida.' },
    { id: 'p2', src: 'assets/images/helena-02.jpg', msg: 'Outras fazem a gente querer guardar cada detalhe.' },
    { id: 'p3', src: 'assets/images/helena-03.jpg', msg: 'Eu não sabia que um sorriso podia virar rotina de saudade.' },
    { id: 'p4', src: 'assets/images/helena-04.jpg', msg: 'Toda vez que eu ia dizer, eu guardava para depois.' },
  ];

  function persist() { LocalStorageManager.save(state); }

  function makeScene(id, { withBg = true } = {}) {
    const el = document.createElement('section');
    el.className = 'scene';
    el.id = `scene-${id}`;
    if (withBg) {
      const bg = document.createElement('div');
      bg.className = 'scene-bg';
      el.appendChild(bg);
    }
    root.appendChild(el);
    return el;
  }

  async function goto(id, renderFn) {
    const next = makeScene(id);
    renderFn(next);
    await TransitionManager.crossFade(currentEl, next);
    if (currentEl) currentEl.remove();
    currentEl = next;
    state.currentScene = id;
    persist();
  }

  /* ---------------- INTRO ---------------- */
  function sceneIntro(el) {
    el.innerHTML = `
      <p class="eyebrow">Arquivo Confidencial</p>
      <h1 class="title-xl">ARQUIVO CONFIDENCIAL</h1>
      <p class="case-tag">CASO #H-01</p>
      <p class="desc">Um arquivo foi perdido.<br>Mas talvez você seja a única pessoa capaz de encontrá-lo.</p>
      <div class="intro-actions">
        <button class="btn pulse" id="btn-start">Iniciar Investigação</button>
      </div>
    `;
    el.querySelector('#btn-start').addEventListener('click', () => {
      AudioController.unlock();
      AudioController.playSfx('click');
      gotoInvestigation();
    });
  }

  /* ---------------- INVESTIGATION + CLUE_SYSTEM ---------------- */
  function gotoInvestigation() {
    goto('investigation', (el) => {
      el.innerHTML = `
        <p class="eyebrow">Caso Helena</p>
        <div class="file-panel">
          <div class="file-panel-header">
            <h2 style="font-size:1.2rem;">Ficha do caso</h2>
            <span class="status-pill" id="status-pill">Incompleto</span>
          </div>
          <div class="file-row"><span>Investigador</span><b>Moisés</b></div>
          <div class="file-row"><span>Caso</span><b>Helena</b></div>
          <div class="file-row"><span>Objetivo</span><b>Encontrar o arquivo perdido</b></div>
          <div class="file-row"><span>Status</span><b>Em andamento</b></div>
        </div>
        <p class="clue-counter" id="clue-counter">Pistas encontradas: ${state.cluesFound.length}/${ClueSystem.total()}</p>
        <div id="clue-grid-slot"></div>
      `;

      ClueSystem.render(el.querySelector('#clue-grid-slot'), state.cluesFound, (clue) => {
        state.cluesFound.push(clue.id);
        persist();
        el.querySelector('#clue-counter').textContent = `Pistas encontradas: ${state.cluesFound.length}/${ClueSystem.total()}`;
        if (state.cluesFound.length === ClueSystem.total()) {
          el.querySelector('#status-pill').textContent = 'Completo';
          setTimeout(() => {
            DialogueBox.say(
              ['Você encontrou tudo o que eu escondi aqui.', 'Só falta uma coisa: a senha.'],
              { onComplete: gotoCode }
            );
          }, 500);
        }
      });

      const charWrap = Character.render(el, { pose: 'enter-left' });

      setTimeout(() => {
        DialogueBox.say(
          [
            'Helena... acho que você encontrou uma coisa que eu não queria que ninguém encontrasse.',
            'Mas já que chegou até aqui...',
            'Talvez seja tarde demais para voltar.',
          ],
          { onComplete: () => Character.remove(charWrap) }
        );
      }, 700);
    });
  }

  /* ---------------- CÓDIGO / SENHA ---------------- */
  function gotoCode() {
    goto('code', (el) => {
      el.innerHTML = `
        <p class="eyebrow">Arquivo Criptografado</p>
        <h2 style="text-align:center;">Digite a senha encontrada</h2>
        <div class="code-panel">
          <div class="code-display" id="code-display" aria-live="polite">&nbsp;</div>
          <div class="code-keypad" id="code-keypad"></div>
          <p class="code-msg" id="code-msg"></p>
        </div>
      `;
      const display = el.querySelector('#code-display');
      const msg = el.querySelector('#code-msg');
      const pad = el.querySelector('#code-keypad');
      let input = '';

      const keys = ['1','2','3','4','5','6','7','8','9','⌫','0','OK'];
      keys.forEach((k) => {
        const b = document.createElement('button');
        b.className = 'code-key';
        b.type = 'button';
        b.textContent = k;
        b.addEventListener('click', () => {
          AudioController.playSfx('type');
          if (k === '⌫') { input = input.slice(0, -1); }
          else if (k === 'OK') { check(); return; }
          else if (input.length < 6) { input += k; }
          display.textContent = input || '\u00A0';
        });
        pad.appendChild(b);
      });

      function check() {
        if (input === CODE_ANSWER) {
          msg.classList.remove('error');
          msg.textContent = 'Correto.';
          AudioController.playSfx('unlock');
          state.codeSolved = true; persist();
          setTimeout(gotoPhotoMemories, 900);
        } else {
          msg.classList.remove('error'); void msg.offsetWidth; msg.classList.add('error');
          msg.textContent = 'Hmm... essa não parece ser a resposta.';
          input = '';
          display.textContent = '\u00A0';
        }
      }

      el.addEventListener('keydown', (e) => {
        if (/^[0-9]$/.test(e.key) && input.length < 6) { input += e.key; display.textContent = input; }
        if (e.key === 'Backspace') { input = input.slice(0, -1); display.textContent = input || '\u00A0'; }
        if (e.key === 'Enter') check();
      });
    });
  }

  /* ---------------- FOTOS / MEMÓRIAS ---------------- */
  function gotoPhotoMemories() {
    goto('photos', (el) => {
      el.innerHTML = `
        <p class="eyebrow">Memórias recuperadas</p>
        <h2 style="text-align:center;">Mural de memórias</h2>
        <div class="photo-grid" id="photo-grid"></div>
        <div id="photos-continue" style="margin-top:2rem; display:none;">
          <button class="btn" id="btn-photos-continue">Continuar</button>
        </div>
      `;
      const grid = el.querySelector('#photo-grid');
      const modal = ensurePhotoModal();

      PHOTOS.forEach((p) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'photo-card';
        const unlocked = state.photosUnlocked.includes(p.id);
        card.innerHTML = unlocked
          ? `<img src="${p.src}" alt="Memória de Helena" onerror="this.parentElement.innerHTML='<div class=photo-fallback'>Substitua por<br><b>${p.src}</b></div>'">`
          : `<div class="locked-overlay">📷</div>`;
        card.addEventListener('click', () => openPhoto(p, modal, () => {
          if (!state.photosUnlocked.includes(p.id)) {
            state.photosUnlocked.push(p.id); persist();
            card.innerHTML = `<img src="${p.src}" alt="Memória de Helena" onerror="this.parentElement.innerHTML='<div class=photo-fallback>Substitua por<br><b>${p.src}</b></div>'">`;
          }
          checkAllPhotos(el);
        }));
        grid.appendChild(card);
      });

      checkAllPhotos(el);

      el.querySelector('#btn-photos-continue').addEventListener('click', gotoPuzzle);

      const charWrap = Character.render(el, { pose: 'enter-right' });
      setTimeout(() => {
        DialogueBox.say(
          [
            'Eu poderia simplesmente ter escrito uma carta.',
            'Mas você merece algo um pouco mais complicado.',
            'Então eu transformei o que eu queria dizer em uma pequena investigação.',
            'E ainda falta encontrar uma coisa.',
          ],
          { onComplete: () => Character.remove(charWrap) }
        );
      }, 500);
    });
  }

  function checkAllPhotos(el) {
    if (state.photosUnlocked.length === PHOTOS.length) {
      const box = el.querySelector('#photos-continue');
      if (box) box.style.display = 'block';
    }
  }

  function ensurePhotoModal() {
    let modal = document.getElementById('photo-modal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'photo-modal';
    modal.className = 'photo-modal';
    modal.innerHTML = `
      <div class="photo-modal-inner">
        <img id="photo-modal-img" alt="Memória ampliada">
        <p class="photo-modal-msg" id="photo-modal-msg"></p>
        <div style="margin-top:1.6rem;"><button class="btn small ghost" id="photo-modal-close">Fechar</button></div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#photo-modal-close').addEventListener('click', () => {
      modal.classList.remove('visible', 'focused');
    });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('visible', 'focused'); });
    return modal;
  }

  function openPhoto(p, modal, onOpened) {
    const img = modal.querySelector('#photo-modal-img');
    const msg = modal.querySelector('#photo-modal-msg');
    img.src = p.src;
    img.onerror = () => { img.style.display = 'none'; };
    img.onload = () => { img.style.display = 'block'; };
    msg.textContent = p.msg;
    modal.classList.add('visible');
    modal.classList.remove('focused');
    requestAnimationFrame(() => setTimeout(() => modal.classList.add('focused'), 60));
    AudioController.playSfx('unlock');
    if (typeof onOpened === 'function') onOpened();
  }

  /* ---------------- PUZZLE ---------------- */
  function gotoPuzzle(el) {
    goto('puzzle', (el) => {
      el.innerHTML = `
        <p class="eyebrow">Última peça</p>
        <h2 style="text-align:center;">Reorganize as palavras</h2>
        <p class="desc">Toque nas palavras na ordem que fizer sentido para você.</p>
        <div id="puzzle-slot"></div>
      `;
      Puzzle.render(el.querySelector('#puzzle-slot'), () => {
        state.puzzleSolved = true; persist();
        AudioController.playSfx('unlock');
        setTimeout(gotoVideoLocked, 1200);
      });
    });
  }

  /* ---------------- VIDEO LOCKED ---------------- */
  function gotoVideoLocked() {
    goto('video-locked', (el) => {
      el.innerHTML = `
        <p class="eyebrow">Arquivo #05</p>
        <p class="scan-text" id="scan-text">Localização desconhecida</p>
        <div class="scan-bar"><div class="scan-bar-fill" id="scan-fill"></div></div>
      `;
      const text = el.querySelector('#scan-text');
      const fill = el.querySelector('#scan-fill');
      const steps = [
        [400, 'Procurando...', 0],
        [700, 'Procurando... 23%', 23],
        [1100, 'Procurando... 61%', 61],
        [1500, 'Procurando... 89%', 89],
        [2000, 'Erro.', 89],
      ];
      steps.forEach(([delay, label, pct]) => {
        setTimeout(() => { text.textContent = label; fill.style.width = pct + '%'; }, delay);
      });

      setTimeout(() => {
        text.textContent = 'O arquivo está protegido.';
        const charWrap = Character.render(el, { pose: 'enter-left' });
        DialogueBox.say(
          ['Claro que eu tinha que complicar.', 'Mas acho que você já sabe o que fazer.'],
          {
            onComplete: () => {
              Character.remove(charWrap);
              const btn = document.createElement('button');
              btn.className = 'btn';
              btn.style.marginTop = '2rem';
              btn.textContent = 'Tentar recuperar arquivo';
              btn.addEventListener('click', gotoVideoPlayer);
              el.appendChild(btn);
            },
          }
        );
      }, 2600);
    });
  }

  /* ---------------- VIDEO PLAYER ---------------- */
  function gotoVideoPlayer() {
    state.videoUnlocked = true; persist();
    goto('video-unlock', (el) => {
      el.innerHTML = `
        <p class="eyebrow">Vídeo Final</p>
        <h2 style="text-align:center;">VIDEO_FINAL.mp4</h2>
        <p class="desc">Arquivo recuperado.</p>
        <button class="btn pulse" id="btn-play" style="margin-top:2rem;">▶ Reproduzir arquivo</button>
      `;
      el.querySelector('#btn-play').addEventListener('click', openVideoOverlay);
    });
  }

  function openVideoOverlay() {
    let wrap = document.getElementById('video-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'video-wrap';
      wrap.className = 'video-wrap';
      wrap.innerHTML = `
        <video id="final-video" controls playsinline
          onerror="document.getElementById('video-fallback-msg').style.display='block'">
          <source src="assets/video/video-final.mp4" type="video/mp4">
        </video>
        <div class="video-fallback" id="video-fallback-msg" style="display:none;">
          Substitua por <b>assets/video/video-final.mp4</b> para o vídeo aparecer aqui.
        </div>
      `;
      document.body.appendChild(wrap);
    }
    requestAnimationFrame(() => wrap.classList.add('visible'));
    const video = wrap.querySelector('#final-video');
    video.currentTime = 0;
    video.play().catch(() => {});
    video.onended = () => {
      wrap.classList.remove('visible');
      setTimeout(gotoFinal, 600);
    };
  }

  /* ---------------- FINAL ---------------- */
  function gotoFinal() {
    goto('final', (el) => {
      el.innerHTML = `
        <p class="eyebrow">Caso Encerrado</p>
        <h2 style="text-align:center;">CASO ENCERRADO.</h2>
        <img class="final-photo" src="assets/images/helena-01.jpg" alt="Helena"
          onerror="this.style.display='none'">
        <p class="final-line" id="fl1">Mas talvez essa nunca tenha sido uma investigação.</p>
        <p class="final-line" id="fl2">Talvez tenha sido só uma desculpa para te dizer uma coisa.</p>
        <p class="final-declaration" id="fl3" style="opacity:0;">Helena, eu gosto de você. ❤️</p>
        <div id="final-actions" style="margin-top:2rem; opacity:0; transition:opacity 1s ease;">
          <button class="btn" id="btn-reopen">Reabrir o caso</button>
        </div>
      `;
      const charWrap = Character.render(el, { pose: 'enter-right', float: false });
      const t = (id, delay) => setTimeout(() => { const n = el.querySelector(id); if (n) n.classList.add('show'); }, delay);
      t('#fl1', 800);
      t('#fl2', 2400);
      setTimeout(() => {
        const decl = el.querySelector('#fl3');
        decl.style.transition = 'opacity 1.4s ease';
        decl.style.opacity = '1';
        AudioController.playSfx('unlock');
      }, 4200);
      setTimeout(() => {
        Character.remove(charWrap);
        el.querySelector('#final-actions').style.opacity = '1';
      }, 5600);

      el.querySelector('#btn-reopen').addEventListener('click', () => {
        if (confirm('Isso vai apagar seu progresso e recomeçar a investigação. Continuar?')) {
          state = LocalStorageManager.reset();
          root.innerHTML = '';
          currentEl = null;
          document.getElementById('video-wrap')?.remove();
          document.getElementById('photo-modal')?.remove();
          boot();
        }
      });
    });
  }

  /* ---------------- BOOT ---------------- */
  function boot() {
    // Retoma de onde parou, exceto cenas transitórias (code/puzzle/video-locked)
    // que dependem de fluxo — nesses casos volta ao início dessa etapa.
    const scene = state.currentScene;
    if (scene === 'final' && state.videoUnlocked) return gotoFinal();
    if (state.puzzleSolved) return gotoVideoLocked();
    if (state.codeSolved) return gotoPhotoMemories();
    if (state.cluesFound.length === ClueSystem.total()) return gotoCode();
    if (scene === 'investigation' || state.cluesFound.length) return gotoInvestigation();
    goto('intro', sceneIntro);
  }

  return { boot, get state() { return state; } };
})();
