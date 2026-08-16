/* Cena4 — "O Último Recado"
   Cena bônus, estilo novela visual: diálogo dinâmico entre as versões
   "presente" e "futuro" dos dois personagens, com troca animada de
   retrato a cada fala. Acessada por um botão na tela final. */
const Cena4 = (() => {
  const ART = {
    boyPresente: 'assets/character/moises-presente.png',
    boyFuturo: 'assets/character/moises-futuro.png',
    girlPresente: 'assets/character/helena-presente.png',
    girlFuturo: 'assets/character/helena-futuro.png',
  };
  const NAMES = {
    boyPresente: 'Moisés (Presente)',
    boyFuturo: 'Moisés (Futuro)',
    girlPresente: 'Helena (Presente)',
    girlFuturo: 'Helena (Futuro)',
  };

  const SCRIPT = [
    { t: 'n', text: 'O portal vermelho começa a surgir novamente.' },
    { t: 'n', text: 'Dessa vez, ele é maior.' },
    { t: 'n', text: 'A luz vermelha envolve lentamente os dois do futuro, enquanto o vento começa a soprar ao redor deles.', portal: true },
    { t: 'n', text: 'O garoto do futuro olha para sua versão mais jovem.' },
    { t: 'l', who: 'boyFuturo', text: 'Quando chegar a hora...' },
    { t: 'n', text: 'Ele olha para a garota.' },
    { t: 'l', who: 'boyFuturo', text: 'Escolha ela.' },
    { t: 'n', text: 'A garota do futuro olha para sua versão mais jovem.' },
    { t: 'l', who: 'girlFuturo', text: 'E quando tiver medo...' },
    { t: 'n', text: 'Ela sorri.' },
    { t: 'l', who: 'girlFuturo', text: 'Segure a mão dele.' },
    { t: 'n', text: 'Os dois do presente se aproximam e seguram as mãos um do outro.' },
    { t: 'n', text: 'O garoto olha para os dois.' },
    { t: 'l', who: 'boyPresente', text: 'Espera...' },
    { t: 'n', text: 'O casal do futuro para por um instante.' },
    { t: 'l', who: 'boyPresente', text: 'A gente vai se encontrar de novo?' },
    { t: 'l', who: 'boyFuturo', text: 'Talvez.' },
    { t: 'n', text: 'A garota do futuro completa:' },
    { t: 'l', who: 'girlFuturo', text: 'Mas não precisamos nos encontrar novamente.' },
    { t: 'n', text: 'Ele olha para sua versão mais jovem.' },
    { t: 'l', who: 'boyFuturo', text: 'Porque nós já sabemos como essa história termina.' },
    { t: 'n', text: 'A garota olha para o casal.' },
    { t: 'l', who: 'girlFuturo', text: 'Agora é a vez de vocês começarem a escrevê-la.' },
    { t: 'n', text: 'O portal fica cada vez mais intenso.', portal: true },
    { t: 'n', text: 'O garoto dá um último passo.' },
    { t: 'l', who: 'boyPresente', text: 'Obrigado.' },
    { t: 'l', who: 'boyFuturo', text: 'Não agradeça.' },
    { t: 'n', text: 'Ele olha para a garota ao seu lado.' },
    { t: 'l', who: 'boyFuturo', text: 'Só não desperdice o que vocês têm.' },
    { t: 'n', text: 'A garota do futuro segura a mão de Helena.' },
    { t: 'l', who: 'girlFuturo', text: 'Cuide dele.' },
    { t: 'n', text: 'A garota sorri emocionada.' },
    { t: 'l', who: 'girlPresente', text: 'Eu vou.' },
    { t: 'l', who: 'boyPresente', text: 'E eu vou cuidar dela.' },
    { t: 'n', text: 'Os dois do futuro sorriem.' },
    { t: 'n', text: 'Então eles se viram.' },
    { t: 'n', text: 'Caminham juntos em direção ao portal vermelho.', portal: true },
    { t: 'n', text: 'Antes de atravessarem, o garoto do futuro olha uma última vez para trás.' },
    { t: 'l', who: 'boyFuturo', text: 'Nos vemos... no futuro.' },
    { t: 'n', text: 'Eles atravessam.' },
    { t: 'n', text: 'O PORTAL SE FECHA.', heading: true, bg: 2 },
    { t: 'n', text: 'Tudo fica em silêncio.' },
    { t: 'n', text: 'As folhas voltam a se mover.' },
    { t: 'n', text: 'O céu volta lentamente às suas cores normais.' },
    { t: 'n', text: 'Os dois ficam sozinhos.' },
    { t: 'n', text: 'Ele olha para ela.' },
    { t: 'n', text: 'Ela olha para ele.' },
    { t: 'l', who: 'boyPresente', text: 'Então...' },
    { t: 'l', who: 'girlPresente', text: 'Então?' },
    { t: 'n', text: 'Ele sorri.' },
    { t: 'l', who: 'boyPresente', text: 'Acho que temos um futuro para construir.' },
    { t: 'n', text: 'Ela segura a mão dele.' },
    { t: 'l', who: 'girlPresente', text: 'Juntos?' },
    { t: 'n', text: 'Ele aperta sua mão.' },
    { t: 'l', who: 'boyPresente', text: 'Juntos.' },
    { t: 'n', text: 'Ela encosta a cabeça no ombro dele.' },
    { t: 'n', text: 'Os dois começam a caminhar pelo mesmo caminho por onde chegaram.', together: true },
    { t: 'n', text: 'O sol desaparece lentamente no horizonte.', together: true },
    { t: 'n', text: 'NARRAÇÃO FINAL', heading: true },
    { t: 'n', text: 'Alguns amores não precisam conhecer o futuro para saber que pertencem um ao outro.' },
    { t: 'n', text: 'Eles simplesmente continuam caminhando.' },
    { t: 'n', text: 'E enquanto as versões do futuro voltam para o mundo que lhes pertence...' },
    { t: 'n', text: 'os dois permanecem no presente.' },
    { t: 'n', text: 'Porque o futuro deles ainda não foi escrito.' },
    { t: 'n', text: 'E talvez essa seja a parte mais bonita de todas.' },
    { t: 'n', text: 'Eles não precisam saber exatamente o que vai acontecer.' },
    { t: 'n', text: 'Só precisam continuar escolhendo um ao outro.' },
    { t: 'n', text: 'Até que, um dia...' },
    { t: 'n', text: 'o presente deles se torne o futuro que um dia conheceram.' },
    { t: 'end', text: 'FIM.' },
  ];

  const BACKGROUNDS = {
    1: 'assets/images/cena4-bg1.jpg',
    2: 'assets/images/cena4-bg2.jpg',
  };

  let overlay, boyImg, girlImg, nameEl, textEl, hintEl, bgEl;
  let index = 0;
  let typing = null;
  let currentBoy = null, currentGirl = null;

  function build(onExit) {
    overlay = document.createElement('div');
    overlay.className = 'cena4-overlay';
    overlay.innerHTML = `
      <div class="cena4-bg" id="cena4-bg" style="background-image:url('${BACKGROUNDS[1]}');"></div>
      <div class="cena4-portal" id="cena4-portal" aria-hidden="true"></div>
      <div class="cena4-vignette" aria-hidden="true"></div>
      <button class="cena4-close" id="cena4-close" aria-label="Fechar">✕</button>
      <div class="cena4-stage">
        <img class="cena4-portrait left" id="cena4-boy" alt="">
        <img class="cena4-portrait right" id="cena4-girl" alt="">
        <img class="cena4-together" id="cena4-together" alt="Moisés e Helena indo embora juntos"
          src="assets/character/casal-futuro-costas.png">
      </div>
      <div class="cena4-box" id="cena4-box">
        <p class="cena4-name" id="cena4-name"></p>
        <p class="cena4-text" id="cena4-text"></p>
        <p class="cena4-hint" id="cena4-hint">toque para continuar</p>
      </div>
    `;
    document.body.appendChild(overlay);

    bgEl = overlay.querySelector('#cena4-bg');
    boyImg = overlay.querySelector('#cena4-boy');
    girlImg = overlay.querySelector('#cena4-girl');
    nameEl = overlay.querySelector('#cena4-name');
    textEl = overlay.querySelector('#cena4-text');
    hintEl = overlay.querySelector('#cena4-hint');

    overlay.querySelector('#cena4-close').addEventListener('click', (e) => {
      e.stopPropagation();
      close(onExit);
    });
    overlay.addEventListener('click', advance);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    index = 0;
    currentBoy = null; currentGirl = null;
    AudioController.playCena4Music();
    showStep();
  }

  function typeText(text, cb) {
    clearInterval(typing);
    textEl.textContent = '';
    hintEl.style.opacity = '0';
    let i = 0;
    typing = setInterval(() => {
      textEl.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(typing);
        typing = null;
        hintEl.style.opacity = '1';
        if (typeof cb === 'function') cb();
      }
    }, 22);
  }

  function setPortrait(img, src, active, isFuturo) {
    if (img.dataset.src !== src) {
      img.dataset.src = src;
      img.style.opacity = '0';
      img.src = src;
      requestAnimationFrame(() => { img.style.opacity = active ? '1' : '0.001'; });
    }
    img.classList.toggle('active', active);
    img.classList.toggle('dim', !active && !!img.dataset.src);
    img.classList.toggle('era-futuro', !!isFuturo);
    img.classList.toggle('era-presente', !isFuturo);
  }

  function showStep() {
    const step = SCRIPT[index];
    if (!step) return;

    overlay.querySelector('#cena4-portal').classList.toggle('active', !!step.portal);
    if (step.bg) {
      bgEl.style.backgroundImage = `url('${BACKGROUNDS[step.bg]}')`;
    }

    if (step.t === 'l') {
      const isBoy = step.who.startsWith('boy');
      if (isBoy) { currentBoy = step.who; } else { currentGirl = step.who; }
      overlay.querySelector('#cena4-together').classList.remove('show');
      if (currentBoy) setPortrait(boyImg, ART[currentBoy], isBoy, currentBoy.endsWith('Futuro'));
      if (currentGirl) setPortrait(girlImg, ART[currentGirl], !isBoy, currentGirl.endsWith('Futuro'));
      overlay.querySelector('#cena4-box').classList.remove('narration');
      nameEl.textContent = NAMES[step.who];
      nameEl.style.opacity = '1';
      nameEl.classList.toggle('futuro', step.who.endsWith('Futuro'));
    } else if (step.together) {
      boyImg.classList.add('dim');
      girlImg.classList.add('dim');
      overlay.querySelector('#cena4-together').classList.add('show');
      overlay.querySelector('#cena4-box').classList.add('narration');
      nameEl.textContent = '';
      nameEl.style.opacity = '0';
    } else {
      overlay.querySelector('#cena4-together').classList.remove('show');
      if (currentBoy) setPortrait(boyImg, ART[currentBoy], false);
      if (currentGirl) setPortrait(girlImg, ART[currentGirl], false);
      overlay.querySelector('#cena4-box').classList.add('narration');
      nameEl.textContent = '';
      nameEl.style.opacity = '0';
    }

    overlay.querySelector('#cena4-box').classList.toggle('heading', !!step.heading);
    overlay.querySelector('#cena4-box').classList.toggle('is-end', step.t === 'end');

    typeText(step.text, () => {
      if (step.t === 'end') {
        hintEl.textContent = 'toque para voltar';
      } else {
        hintEl.textContent = 'toque para continuar';
      }
    });
  }

  function advance() {
    if (typing) {
      clearInterval(typing);
      typing = null;
      textEl.textContent = SCRIPT[index].text;
      hintEl.style.opacity = '1';
      return;
    }
    const wasEnd = SCRIPT[index] && SCRIPT[index].t === 'end';
    if (wasEnd) { close(overlay._onExit); return; }
    index++;
    if (index >= SCRIPT.length) { close(overlay._onExit); return; }
    showStep();
  }

  function close(onExit) {
    if (!overlay) return;
    overlay.classList.remove('visible');
    clearInterval(typing);
    AudioController.stopCena4Music();
    setTimeout(() => {
      overlay?.remove();
      overlay = null;
      if (typeof onExit === 'function') onExit();
    }, 500);
  }

  function start(onExit) {
    build(onExit);
    overlay._onExit = onExit;
  }

  return { start };
})();