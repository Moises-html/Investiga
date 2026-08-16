/* DialogueBox
   Fila de mensagens do protagonista, com efeito de digitação letra a letra
   e um personagem PNG que aparece durante a fala. */
const DialogueBox = (() => {
  const box = document.getElementById('dialogue-box');
  const nameEl = document.getElementById('dialogue-name');
  const textEl = document.getElementById('dialogue-text');
  const btn = document.getElementById('dialogue-continue');

  let queue = [];
  let onDone = null;
  let typing = false;
  let typeTimer = null;

  function say(lines, { name = 'Moisés', onComplete = null } = {}) {
    queue = Array.isArray(lines) ? [...lines] : [lines];
    onDone = onComplete;
    nameEl.textContent = name;
    box.classList.add('visible');
    box.setAttribute('aria-hidden', 'false');
    next();
  }

  function next() {
    if (!queue.length) {
      close();
      if (typeof onDone === 'function') onDone();
      return;
    }
    const line = queue.shift();
    type(line);
  }

  function type(line) {
    typing = true;
    textEl.innerHTML = '';
    let i = 0;
    clearInterval(typeTimer);
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.textContent = '▍';

    typeTimer = setInterval(() => {
      textEl.textContent = line.slice(0, i + 1);
      textEl.appendChild(cursor);
      i++;
      if (i >= line.length) {
        clearInterval(typeTimer);
        typing = false;
      }
    }, 22);
  }

  function skipOrNext() {
    if (typing) {
      clearInterval(typeTimer);
      textEl.textContent = queue.length >= 0 ? textEl.textContent : textEl.textContent;
      typing = false;
      // completa a linha atual instantaneamente
      const full = textEl.textContent.replace('▍', '');
      textEl.textContent = full;
    } else {
      next();
    }
  }

  function close() {
    box.classList.remove('visible');
    box.setAttribute('aria-hidden', 'true');
  }

  btn.addEventListener('click', skipOrNext);
  box.addEventListener('click', (e) => { if (e.target === box) skipOrNext(); });

  return { say, close };
})();
