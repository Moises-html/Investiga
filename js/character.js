/* Character
   Controla a aparição do PNG do protagonista (Moisés) nas cenas.
   Usa exatamente o arquivo fornecido em assets/character/moises.png,
   sem distorcer — apenas fade/posição/flutuação via CSS. */
const Character = (() => {
  const SRC = 'assets/character/moises.png';

  function render(container, { pose = 'enter-left', float = true } = {}) {
    const wrap = document.createElement('div');
    wrap.className = `character ${pose}${float ? ' float' : ''}`;

    const img = document.createElement('img');
    img.src = SRC;
    img.alt = 'Moisés';
    img.onerror = () => {
      // Placeholder elegante enquanto o PNG real não é adicionado.
      wrap.innerHTML = `<div class="character-fallback">
        Substitua por<br><b>assets/character/moises.png</b><br>
        (PNG com fundo transparente)
      </div>`;
    };
    wrap.appendChild(img);
    container.appendChild(wrap);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      wrap.classList.add('visible');
    }));

    return wrap;
  }

  function remove(wrap) {
    if (!wrap) return;
    wrap.classList.remove('visible');
    setTimeout(() => wrap.remove(), 850);
  }

  return { render, remove };
})();
