/* SceneManager
   Controla qual cena está ativa, monta o HTML de cada cena dinamicamente
   e conecta os componentes (ClueSystem, DialogueBox, Character, Puzzle...).
   Nenhuma navegação usa location.reload() — tudo é baseado em estado. */
const SceneManager = (() => {
  const root = document.getElementById('app');
  let state = LocalStorageManager.load();
  let currentEl = null;
  const CODE_ANSWER = '1382026';

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
        <p class="clue-instructions">Toque em cada quadrado: raspe, segure ou toque no ritmo certo para revelar.</p>
        <div id="clue-grid-slot"></div>
      `;

      try {
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
      } catch (err) {
        console.error('Falha ao montar as pistas:', err);
      }

      setTimeout(() => {
        DialogueBox.say([
          'Helena... acho que você encontrou uma coisa que eu não queria que ninguém encontrasse.',
          'Mas já que chegou até aqui...',
          'Talvez seja tarde demais para voltar.',
        ]);
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
      const MAX_LEN = CODE_ANSWER.length;
      let input = '';
      let wrongAttempts = 0;
      let locked = false; // trava o teclado enquanto a dica do Moisés é exibida

      const keys = ['1','2','3','4','5','6','7','8','9','⌫','0','OK'];
      keys.forEach((k) => {
        const b = document.createElement('button');
        b.className = 'code-key';
        b.type = 'button';
        b.textContent = k;
        b.addEventListener('click', () => {
          if (locked) return;
          AudioController.playSfx('type');
          if (k === '⌫') { input = input.slice(0, -1); }
          else if (k === 'OK') { check(); return; }
          else if (input.length < MAX_LEN) { input += k; }
          display.textContent = input || '\u00A0';
        });
        pad.appendChild(b);
      });

      function check() {
        if (locked) return;
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
          wrongAttempts++;

          if (wrongAttempts === 1) {
            locked = true;
            setTimeout(() => {
              DialogueBox.say(
                ['Foi nesse dia que nós dois choramos sem saber se realmente era recíproco.', 'E no final... era.'],
                { onComplete: () => { locked = false; } }
              );
            }, 500);
          }
        }
      }

      el.addEventListener('keydown', (e) => {
        if (locked) return;
        if (/^[0-9]$/.test(e.key) && input.length < MAX_LEN) { input += e.key; display.textContent = input; }
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

      setTimeout(() => {
        DialogueBox.say([
          'Eu poderia simplesmente ter escrito uma carta.',
          'Mas você merece algo um pouco mais complicado.',
          'Então eu transformei o que eu queria dizer em uma pequena investigação.',
          'E ainda falta encontrar uma coisa.',
        ]);
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
        DialogueBox.say(
          ['Claro que eu tinha que complicar.', 'Mas acho que você já sabe o que fazer.'],
          {
            onComplete: () => {
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

  /* ---------------- VIDEO 1 (arquivo #05) ---------------- */
  function gotoVideoPlayer() {
    state.videoUnlocked = true; persist();
    goto('video-unlock', (el) => {
      el.innerHTML = `
        <p class="eyebrow">Arquivo #05</p>
        <h2 style="text-align:center;">VIDEO_01.mp4</h2>
        <p class="desc">Arquivo recuperado.</p>
        <button class="btn pulse" id="btn-play" style="margin-top:2rem;">▶ Reproduzir arquivo</button>
      `;
      el.querySelector('#btn-play').addEventListener('click', () => {
        openVideoOverlay('assets/video/video-01.mp4', gotoContinueInvestigation);
      });
    });
  }

  function openVideoOverlay(src, onEndedCallback) {
    let wrap = document.getElementById('video-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'video-wrap';
      wrap.className = 'video-wrap';
      wrap.innerHTML = `
        <video id="final-video" controls playsinline
          onerror="document.getElementById('video-fallback-msg').style.display='block'"></video>
        <div class="video-fallback" id="video-fallback-msg" style="display:none;">
          Substitua pelo vídeo correto dentro de <b>assets/video/</b> para aparecer aqui.
        </div>
      `;
      document.body.appendChild(wrap);
    }
    const video = wrap.querySelector('#final-video');
    const fallback = document.getElementById('video-fallback-msg');
    fallback.style.display = 'none';
    video.innerHTML = `<source src="${src}" type="video/mp4">`;
    video.load();
    requestAnimationFrame(() => wrap.classList.add('visible'));
    video.currentTime = 0;
    video.play().catch(() => {});
    video.onended = () => {
      wrap.classList.remove('visible');
      setTimeout(onEndedCallback, 600);
    };
  }

  /* ---------------- CONTINUAR INVESTIGAÇÃO (ponte para o quiz) ---------------- */
  function gotoContinueInvestigation() {
    goto('continue-investigation', (el) => {
      el.innerHTML = `
        <p class="eyebrow">Caso Helena</p>
        <h2 style="text-align:center;">Isso ainda não é tudo.</h2>
        <p class="desc" style="text-align:center;">
          Tem uma última parte do arquivo. Mas essa só abre se você provar
          que presta atenção em mim tanto quanto eu presto em você.
        </p>
        <div style="text-align:center; margin-top:2rem;">
          <button class="btn pulse" id="btn-continue-investigation">Continuar investigação</button>
        </div>
      `;
      el.querySelector('#btn-continue-investigation').addEventListener('click', gotoQuiz);
    });
  }

  /* ---------------- QUIZ ---------------- */
  function gotoQuiz() {
    goto('quiz', (el) => {
      el.innerHTML = `
        <p class="eyebrow">Teste rápido</p>
        <div id="quiz-slot"></div>
      `;
      Quiz.render(el.querySelector('#quiz-slot'), () => {
        state.quizSolved = true; persist();
        AudioController.playSfx('unlock');
        setTimeout(gotoVideo2Locked, 800);
      });
    });
  }

  /* ---------------- VÍDEO FINAL (declaração) ---------------- */
  function gotoVideo2Locked() {
    goto('video2-locked', (el) => {
      el.innerHTML = `
        <p class="eyebrow">Arquivo #09</p>
        <p class="scan-text" id="scan-text">Descriptografando...</p>
        <div class="scan-bar"><div class="scan-bar-fill" id="scan-fill"></div></div>
      `;
      const text = el.querySelector('#scan-text');
      const fill = el.querySelector('#scan-fill');
      const steps = [
        [400, 'Descriptografando...', 10],
        [900, 'Descriptografando... 47%', 47],
        [1500, 'Descriptografando... 82%', 82],
        [2000, 'Descriptografando... 100%', 100],
      ];
      steps.forEach(([delay, label, pct]) => {
        setTimeout(() => { text.textContent = label; fill.style.width = pct + '%'; }, delay);
      });

      setTimeout(() => {
        text.textContent = 'Arquivo final desbloqueado.';
        DialogueBox.say(
          ['Essa é a parte que eu realmente queria que você visse.'],
          {
            onComplete: () => {
              const btn = document.createElement('button');
              btn.className = 'btn pulse';
              btn.style.marginTop = '2rem';
              btn.textContent = '▶ Abrir arquivo final';
              btn.addEventListener('click', gotoVideo2Player);
              el.appendChild(btn);
            },
          }
        );
      }, 2600);
    });
  }

  function gotoVideo2Player() {
    state.video2Unlocked = true; persist();
    goto('video2-unlock', (el) => {
      el.innerHTML = `
        <p class="eyebrow">Arquivo Final</p>
        <h2 style="text-align:center;">VIDEO_FINAL.mp4</h2>
        <p class="desc">Arquivo recuperado.</p>
        <button class="btn pulse" id="btn-play2" style="margin-top:2rem;">▶ Reproduzir arquivo</button>
      `;
      el.querySelector('#btn-play2').addEventListener('click', () => {
        openVideoOverlay('assets/video/video-final.mp4', gotoFinal);
      });
    });
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
        <p class="final-declaration" id="fl3" style="opacity:0;">Helena, eu amo você. ❤️</p>
        <div id="final-actions" style="margin-top:2rem; opacity:0; transition:opacity 1s ease;">
          <button class="btn" id="btn-reopen">Reabrir o caso</button>
        </div>
        <button class="btn-cena4" id="btn-cena4">✦ Mais uma coisa...</button>
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
        AudioController.playFinalMusic();
      }, 4200);
      setTimeout(() => {
        Character.remove(charWrap);
        el.querySelector('#final-actions').style.opacity = '1';
        el.querySelector('#btn-cena4').classList.add('show');
      }, 5600);

      el.querySelector('#btn-reopen').addEventListener('click', resetAll);
      el.querySelector('#btn-cena4').addEventListener('click', () => Cena4.start(() => {}));
    });
  }

  function resetAll() {
    if (!confirm('Isso vai apagar seu progresso e recomeçar a investigação. Continuar?')) return;
    state = LocalStorageManager.reset();
    root.innerHTML = '';
    currentEl = null;
    DialogueBox.close();
    document.getElementById('video-wrap')?.remove();
    document.getElementById('photo-modal')?.remove();
    document.querySelector('.cena4-overlay')?.remove();
    document.querySelectorAll('.character-portrait').forEach((n) => n.remove());
    boot();
  }

  /* ---------------- BOOT ---------------- */
  function boot() {
    // Retoma de onde parou, exceto cenas transitórias (code/puzzle/video-locked)
    // que dependem de fluxo — nesses casos volta ao início dessa etapa.
    const scene = state.currentScene;
    if (scene === 'final' && state.video2Unlocked) return gotoFinal();
    if (state.quizSolved) return gotoVideo2Locked();
    if (state.videoUnlocked) return gotoContinueInvestigation();
    if (state.puzzleSolved) return gotoVideoLocked();
    if (state.codeSolved) return gotoPhotoMemories();
    if (state.cluesFound.length === ClueSystem.total()) return gotoCode();
    if (scene === 'investigation' || state.cluesFound.length) return gotoInvestigation();
    goto('intro', sceneIntro);
  }

  return { boot, resetAll, get state() { return state; } };
})();
