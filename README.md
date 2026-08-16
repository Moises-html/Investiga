# O Caso Helena — O Vídeo Perdido

SPA romântica de investigação, feita em HTML/CSS/JS puro (sem build, sem dependências).

## Como abrir

Basta abrir `index.html` no navegador, ou servir a pasta com qualquer servidor
estático (ex: `npx serve` ou a extensão "Live Server" do VS Code).

## Como adicionar seus arquivos reais

Troque os placeholders pelos arquivos finais, mantendo exatamente esses nomes
e caminhos (ou ajuste os caminhos correspondentes em `js/scenes.js` e
`js/character.js`):

```
assets/character/moises.png     → seu PNG com fundo transparente
assets/images/helena-01.jpg     → foto 1
assets/images/helena-02.jpg     → foto 2
assets/images/helena-03.jpg     → foto 3
assets/images/helena-04.jpg     → foto 4
assets/video/video-final.mp4    → o vídeo final
assets/audio/romantic.mp3       → música ambiente
assets/audio/click.mp3          → efeito de clique (opcional)
assets/audio/clue.mp3           → efeito ao encontrar pista (opcional)
assets/audio/unlock.mp3         → efeito de desbloqueio (opcional)
assets/audio/type.mp3           → efeito de digitação no teclado (opcional)
```

Enquanto os arquivos reais não existem, a experiência mostra placeholders
elegantes no lugar (sem quebrar o site).

## Senha do arquivo criptografado

A senha usada na Cena de código é **1402** (referência à pista da data
14/02). Para trocar, edite a constante `CODE_ANSWER` em `js/scenes.js`.

## Estrutura

```
index.html
css/style.css
js/
  storage.js     → LocalStorageManager (progresso salvo)
  audio.js       → AudioController (música + efeitos)
  particles.js   → ParticleSystem (atmosfera em canvas)
  character.js   → Character (PNG do protagonista)
  dialogue.js    → DialogueBox (mensagens com efeito de digitação)
  clues.js       → ClueSystem + Toast
  puzzle.js      → Puzzle (mini-jogo final)
  animations.js  → TransitionManager (troca de cenas)
  scenes.js      → SceneManager (toda a lógica de narrativa/estado)
  app.js         → bootstrap + easter eggs
assets/
  images/ character/ video/ audio/ icons/
```

## Progresso salvo

O progresso (pistas, fotos, puzzle, vídeo, easter eggs, som ligado/desligado)
é salvo em `localStorage`. Fechar o navegador e voltar depois continua de
onde parou. O botão "Reabrir o caso", no final, apaga o progresso e recomeça
— sempre pedindo confirmação antes.

## Personalização rápida

- Textos das falas do personagem: dentro de `DialogueBox.say([...])` em `js/scenes.js`.
- Mensagens das fotos: array `PHOTOS` em `js/scenes.js`.
- Frase do puzzle final: constante `ANSWER` em `js/puzzle.js`.
- Cores e tipografia: variáveis no topo de `css/style.css` (`:root`).
