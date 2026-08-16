/* Puzzle
   Mini-jogo final: reorganizar peças (arrastar ou tocar em ordem) até
   formar "EU GOSTO DE VOCÊ". Funciona por clique sequencial — mais
   confiável em celular do que drag-and-drop puro. */
const Puzzle = (() => {
  const ANSWER = ['EU', 'GOSTO', 'DE', 'VOCÊ'];

  function render(container, onSolved) {
    const shuffled = [...ANSWER].sort(() => Math.random() - 0.5);
    const slots = [];

    const board = document.createElement('div');
    board.className = 'puzzle-board';
    ANSWER.forEach((_, i) => {
      const slot = document.createElement('div');
      slot.className = 'puzzle-slot';
      slot.dataset.index = i;
      board.appendChild(slot);
      slots.push(slot);
    });

    const tray = document.createElement('div');
    tray.className = 'puzzle-tray';

    let placedCount = 0;
    let nextSlot = 0;

    shuffled.forEach((word) => {
      const piece = document.createElement('button');
      piece.type = 'button';
      piece.className = 'puzzle-piece';
      piece.textContent = word;
      piece.setAttribute('aria-label', `Palavra: ${word}`);

      piece.addEventListener('click', () => {
        if (piece.classList.contains('placed')) return;
        const slot = slots[nextSlot];
        if (!slot) return;
        slot.textContent = word;
        slot.classList.add('filled');
        piece.classList.add('placed');
        placedCount++;
        nextSlot++;

        const correctSoFar = slots.every((s, i) => !s.textContent || s.textContent === ANSWER[i]);
        if (!correctSoFar) {
          // ordem errada: devolve tudo após um instante, sem travar a experiência
          setTimeout(() => {
            slots.forEach(s => { s.textContent = ''; s.classList.remove('filled'); });
            tray.querySelectorAll('.puzzle-piece').forEach(p => p.classList.remove('placed'));
            placedCount = 0; nextSlot = 0;
            Toast.show('Quase... tente outra ordem.');
          }, 500);
          return;
        }

        if (placedCount === ANSWER.length) {
          setTimeout(() => { if (typeof onSolved === 'function') onSolved(); }, 500);
        }
      });

      tray.appendChild(piece);
    });

    container.appendChild(board);
    container.appendChild(tray);
  }

  return { render };
})();
