(() => {
  const app = document.getElementById('app');
  let startTime;
  let hintsUsed = 0;

  const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const load = key => JSON.parse(localStorage.getItem(key));

  const game = {
    title: "Детектив: Лампа в сарае",
    intro: "Добрый день, детектив – сегодня нам предстоит расследовать дело.",
    tip: "Цель: пройти игру с наименьшим количеством подсказок от помощника.",
    locations: [
      {
        name: "Дом",
        dialog: "Ты осматриваешь дом. На полу пыль, но следов нет. Письмо на столе подтверждает ссору между владельцем и соседом."
      },
      {
        name: "Сарай",
        dialog: "В сарае — запах керосина, разбитая лампа, следы обуви. Это может быть местом преступления."
      },
      {
        name: "Лавка",
        dialog: "Продавщица говорит, что сын тракториста был взволнован утром и купил бинт. Странно?"
      }
    ],
    finale: [
      {
        question: "Где было событие?",
        options: ["Лес", "Сарай", "Домик"],
        correct: 1,
        hint: "В сарае ты нашёл сломанную лампу и следы."
      },
      {
        question: "Кто причастен?",
        options: ["Сын тракториста", "Вдова", "Лесник"],
        correct: 0,
        hint: "Сын тракториста отрицал своё алиби."
      },
      {
        question: "Мотив?",
        options: ["Ревность", "Преступление из-за денег", "Случайно"],
        correct: 1,
        hint: "Он задолжал крупную сумму за трактор."
      }
    ]
  };

  function showMain() {
    app.innerHTML = `
      <h1>${game.title}</h1>
      <button class="button" id="btn-start">Начать</button>
    `;
    document.getElementById('btn-start').onclick = () => {
      startTime = Date.now();
      hintsUsed = 0;
      save('progress', { stage: 'intro', hintsUsed: 0, startTime });
      showIntro();
    };
  }

  function showIntro() {
    app.innerHTML = `
      <div class="dialog">
        <p>${game.intro}</p>
        <p><strong>${game.tip}</strong></p>
        <button class="button" id="btn-play">Начать расследование</button>
      </div>
    `;
    document.getElementById('btn-play').onclick = () => {
      save('progress', { stage: 'locations', current: 0, hintsUsed, startTime });
      showLocations(0);
    };
  }

  function showLocations(index) {
    const loc = game.locations[index];
    app.innerHTML = `
      <div class="dialog">
        <h3>${loc.name}</h3>
        <p>${loc.dialog}</p>
        <button class="button" id="btn-next">${index < game.locations.length - 1 ? 'Далее' : 'К финалу'}</button>
      </div>
    `;
    document.getElementById('btn-next').onclick = () => {
      const nextIndex = index + 1;
      if (nextIndex < game.locations.length) {
        save('progress', { stage: 'locations', current: nextIndex, hintsUsed, startTime });
        showLocations(nextIndex);
      } else {
        save('progress', { stage: 'finale', index: 0, answers: [], hintsUsed, startTime });
        showFinale(0, []);
      }
    };
  }

  function showFinale(idx, answers) {
    if (idx >= game.finale.length) {
      showResult();
      return;
    }
    const s = game.finale[idx];
    app.innerHTML = `
      <div class="dialog">
        <p>${s.question}</p>
        ${s.options.map((opt, i) => `<div class="choice"><button class="button" data-id="${i}">${opt}</button></div>`).join('')}
      </div>
    `;
    document.querySelectorAll('.choice button').forEach(b => {
      b.onclick = () => {
        const chosen = +b.dataset.id;
        if (chosen !== s.correct) {
          hintsUsed++;
          alert("Помощник: " + s.hint);
        }
        answers.push({ question: s.question, chosen: s.options[chosen] });
        save('progress', { stage: 'finale', index: idx + 1, answers, hintsUsed, startTime });
        showFinale(idx + 1, answers);
      };
    });
  }

  function showResult() {
    const elapsed = Math.ceil((Date.now() - startTime) / 1000);
    app.innerHTML = `
      <div id="final">
        <h2>Вы раскрыли дело!</h2>
        <p>Время: ${elapsed} с</p>
        <p>Подсказок использовано: ${hintsUsed}</p>
        <button class="button" id="btn-menu">Главное меню</button>
      </div>
    `;
    localStorage.removeItem('progress');
    document.getElementById('btn-menu').onclick = showMain;
  }

  // Восстановление прогресса
  const saved = load('progress');
  if (saved) {
    startTime = saved.startTime || Date.now();
    hintsUsed = saved.hintsUsed || 0;
    if (saved.stage === 'intro') showIntro();
    else if (saved.stage === 'locations') showLocations(saved.current);
    else if (saved.stage === 'finale') showFinale(saved.index, saved.answers || []);
  } else {
    showMain();
  }
})();
