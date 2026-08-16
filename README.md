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

## Foto corrigida

A primeira foto (`helena-01.jpg`) estava rotacionada — corrigi para ficar em
pé, na orientação certa.

## Música da cena bônus

Assim que a cena "O Último Recado" começa, toca automaticamente
`assets/audio/love-me.mp3` (Love Me) — e para sozinha quando você fecha a
cena (com "✕" ou chegando ao fim). É separada da música ambiente e da
música da declaração final.

## Deixando claro quem está falando

O retrato de quem está falando agora fica bem mais destacado (brilho
dourado para as versões presente, vermelho para as versões futuro) e o
outro retrato fica bem apagado — pra nunca ficar confuso quem é quem.

## Cena bônus — "O Último Recado"

Na tela final, depois que a declaração aparece, surge um botão flutuante no
canto inferior direito: **"✦ Mais uma coisa..."**. Ele abre uma cena extra
em estilo novela visual, com o roteiro que você mandou (o portal, as
versões do futuro etc.), trocando de retrato a cada fala:

- Personagens "presente" (sem aura) e "futuro" (cabelo/olhos vermelhos)
  para os dois — os quatro retratos ficam em `assets/character/`:
  `moises-presente.png`, `moises-futuro.png`, `helena-presente.png`,
  `helena-futuro.png`.
- O fundo muda entre duas imagens (`assets/images/cena4-bg1.jpg` e
  `cena4-bg2.jpg`) e ganha um brilho vermelho pulsante nos momentos do
  portal.
- Texto com efeito de máquina de escrever, toque em qualquer lugar para
  avançar (ou pular a digitação em andamento), e um "✕" no canto para
  sair a qualquer momento.
- Todo o roteiro está no array `SCRIPT` em `js/cena4.js` — dá pra editar
  falas, trocar quem fala cada linha, ou adicionar novos momentos com
  `bg: 1` / `bg: 2` para trocar o cenário e `portal: true` para o efeito
  vermelho.

## Fluxo completo (atualizado)

intro → investigação (5 pistas) → senha → fotos → puzzle "EU AMO VOCÊ" →
**vídeo 1** (`assets/video/video-01.mp4`) → botão **"Continuar investigação"**
→ **quiz** (3 perguntas sobre você) → **vídeo final**
(`assets/video/video-final.mp4`) → declaração final com música.

## Quiz "Continuar investigação"

Depois do primeiro vídeo, aparece um botão "Continuar investigação" que leva
a um quiz de 3 perguntas sobre você. Sem limite de tentativas — errar só
mostra um aviso e deixa tentar de novo. As perguntas (editáveis em
`js/quiz.js`, array `QUESTIONS`):

1. **Qual a minha cor favorita?** → Vermelho
2. **Qual a minha música brasileira favorita?** → Imprevisto
3. **Qual o meu esporte favorito?** (mais difícil, opções: Vôlei, Jiu-jitsu,
   Tênis de mesa, Futebol) → Tênis de mesa

Ao acertar as três, ela é levada ao arquivo final (segundo vídeo).

## Dois vídeos

Agora existem dois vídeos separados:

- `assets/video/video-01.mp4` — primeiro vídeo, aparece logo depois do puzzle.
- `assets/video/video-final.mp4` — vídeo da declaração, só abre depois do quiz.

## Declaração final e música

A frase final agora é **"Helena, eu amo você. ❤️"** (puzzle também foi
atualizado para formar EU / AMO / VOCÊ, com as palavras isca GOSTO, MUITO e
SEMPRE misturadas). Quando a declaração aparece, toca a música
`assets/audio/alianca-tribalistas.mp3` ("Aliança", Tribalistas) — troque o
arquivo placeholder por essa música.

## Senha do arquivo criptografado

A senha é **1382026**. No primeiro erro, o Moisés aparece com uma dica antes
de deixar a Helena tentar de novo. Para trocar a senha ou a dica, edite
`CODE_ANSWER` e o texto dentro de `DialogueBox.say(...)` na função
`gotoCode` em `js/scenes.js`.

## Mini-jogos das pistas (mais difícil agora)

As 5 pistas usam 3 mini-jogos diferentes, misturados e com dificuldade
crescente:

- **Raspar** (pistas 1 e 4): arrastar o dedo até raspar boa parte do
  quadrado. Pista 4 exige raspar mais (62%) com um "pincel" menor — mais difícil.
- **Segurar** (pistas 2 e 5): pressionar e manter até o anel dourado
  completar a volta. Pista 5 exige segurar por mais tempo (2,6s).
- **Precisão de tempo** (pista 3): tocar exatamente quando o pontinho
  passa pela faixa dourada, 3 vezes seguidas.

Para ajustar a dificuldade de cada uma, edite os parâmetros (`threshold`,
`brush`, `duration`, `hitsNeeded`, `targetWidth`) no array `CLUES` em
`js/clues.js`.

O puzzle final também ficou mais difícil: agora há 3 palavras "isca"
(`MUITO`, `SEMPRE`, `TANTO`) misturadas com as 4 palavras corretas — edite
`DECOYS` em `js/puzzle.js` para mudar.

## Reiniciar o progresso

Tem um botão **↺** fixo no canto superior direito, disponível em qualquer
cena, que apaga o progresso salvo e volta para o início (sempre pedindo
confirmação antes). O botão "Reabrir o caso" da tela final faz a mesma coisa.

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
