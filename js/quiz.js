/* Quiz
   Mini-jogo de perguntas pessoais sobre Moisés, entre os dois vídeos.
   Sem limite de tentativas — errar só mostra um aviso e deixa tentar de
   novo, nunca trava a experiência. Edite QUESTIONS para mudar perguntas,
   opções ou a resposta certa. */
const Quiz = (() => {
  const QUESTIONS = [
    {
      q: 'Qual a minha cor favorita?',
      options: ['Vermelho', 'Azul', 'Verde', 'Preto'],
      answer: 'Vermelho',
    },
    {
      q: 'Qual a minha música brasileira favorita?',
      options: ['Imprevisto', 'Águas de Março', 'Anna Júlia', 'Como Nossos Pais'],
      answer: 'Imprevisto',
    },
    {
      q: 'Qual o meu esporte favorito?',
      options: ['Tênis de mesa', 'Vôlei', 'Jiu-jitsu', 'Futebol'],
      answer: 'Tênis de mesa',
    },
  ];

  function render(container, onComplete) {
    let index = 0;

    function shuffledOptions(opts) {
      return [...opts].sort(() => Math.random() - 0.5);
    }

    function renderQuestion() {
      container.innerHTML = '';
      const current = QUESTIONS[index];

      const progress = document.createElement('p');
      progress.className = 'quiz-progress';
      progress.textContent = `Pergunta ${index + 1} de ${QUESTIONS.length}`;
      container.appendChild(progress);

      const qEl = document.createElement('h2');
      qEl.className = 'quiz-question';
      qEl.textContent = current.q;
      container.appendChild(qEl);

      const optsWrap = document.createElement('div');
      optsWrap.className = 'quiz-options';

      shuffledOptions(current.options).forEach((opt) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option';
        btn.textContent = opt;
        btn.addEventListener('click', () => {
          if (opt === current.answer) {
            btn.classList.add('correct');
            AudioController.playSfx('unlock');
            optsWrap.querySelectorAll('button').forEach((b) => (b.disabled = true));
            setTimeout(() => {
              index++;
              if (index >= QUESTIONS.length) {
                if (typeof onComplete === 'function') onComplete();
              } else {
                renderQuestion();
              }
            }, 700);
          } else {
            btn.classList.add('wrong');
            setTimeout(() => btn.classList.remove('wrong'), 500);
            Toast.show('Não foi essa... tenta de novo.');
          }
        });
        optsWrap.appendChild(btn);
      });

      container.appendChild(optsWrap);
    }

    renderQuestion();
  }

  return { render };
})();
