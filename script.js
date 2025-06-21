// ========== ДАННЫЕ ИГРЫ ==========
const characters = {
  "lord_winter": {
    name: "Лорд Винтер",
    description: "Хозяин поместья. Строгий и холодный, скрывает много тайн.",
    motive: "Опасался, что кто-то из слуг раскроет его финансовые махинации.",
    dialogueTree: {
      start: {
        text: "Вы хотите задать мне вопрос?",
        options: [
          { text: "Расскажите о вашем алиби", next: "alibi" },
          { text: "Кто мог быть убийцей?", next: "suspect" },
          { text: "Что вы думаете о поместье?", next: "neutral" }
        ]
      },
      alibi: {
        text: "Я был в библиотеке. Джеймс может это подтвердить.",
        options: [
          { text: "А где была горничная?", next: "maid" },
          { text: "Спасибо", next: "end" }
        ]
      },
      suspect: {
        text: "Не могу сказать точно... но я бы проверил кухню.",
        options: [
          { text: "Хорошо", next: "end" }
        ]
      },
      maid: {
        text: "Она часто шлялась по ночам… не люблю это.",
        options: [
          { text: "Спасибо", next: "end" }
        ]
      },
      neutral: {
        text: "Это дом моих предков. Он хранит много тайн.",
        options: [
          { text: "Понятно", next: "end" }
        ]
      },
      end: {
        text: "Если у вас больше нет вопросов — прощайте.",
        options: []
      }
    }
  },
  "maid_anna": {
    name: "Горничная Анна",
    description: "Молодая и застенчивая, но внимательная к деталям.",
    motive: "Боялась потерять работу из-за тайных прогулок по ночам.",
    dialogueTree: {
      start: {
        text: "Здравствуйте, детектив.",
        options: [
          { text: "Где вы были в ночь убийства?", next: "where" },
          { text: "Что вы можете рассказать о хозяине?", next: "lord" },
          { text: "Как дела на кухне?", next: "kitchen" }
        ]
      },
      where: {
        text: "Я убиралась в сарае... ничего не видела.",
        options: [
          { text: "Правда?", next: "doubt" }
        ]
      },
      doubt: {
        text: "Ну... возможно, я что-то слышала...",
        options: [
          { text: "Продолжайте", next: "continue" }
        ]
      },
      continue: {
        text: "Кто-то двигал ящики... но я не стала подходить.",
        options: [
          { text: "Хорошо", next: "end" }
        ]
      },
      lord: {
        text: "Он всегда был строг... но он хороший человек.",
        options: [
          { text: "Хорошо", next: "end" }
        ]
      },
      kitchen: {
        text: "Там всё как обычно. Мария готовила.",
        options: [
          { text: "Хорошо", next: "end" }
        ]
      },
      end: {
        text: "Если будут ещё вопросы — спрашивайте.",
        options: []
      }
    }
  },
  "cook_mary": {
    name: "Повар Мария",
    description: "Добродушная женщина с крепкими связями в округе.",
    motive: "Могла иметь секретные связи с местным контрабандистом.",
    dialogueTree: {
      start: {
        text: "Добрый день, детектив.",
        options: [
          { text: "Вы заметили что-нибудь странное?", next: "strange" },
          { text: "Кто убил Лорда?", next: "killer" },
          { text: "Как вы себя чувствуете?", next: "feelings" }
        ]
      },
      strange: {
        text: "Ночью кто-то заглядывал в кладовку.",
        options: [
          { text: "Кто?", next: "who" }
        ]
      },
      who: {
        text: "Не знаю... но слышала шаги.",
        options: [
          { text: "Хорошо", next: "end" }
        ]
      },
      killer: {
        text: "Не могу знать этого. Я просто повар.",
        options: [
          { text: "Хорошо", next: "end" }
        ]
      },
      feelings: {
        text: "Страшно... но я должна работать.",
        options: [
          { text: "Хорошо", next: "end" }
        ]
      },
      end: {
        text: "Если будет нужно — я помогу.",
        options: []
      }
    }
  },
  "butler_james": {
    name: "Дворецкий Джеймс",
    description: "Верный слуга с таинственным прошлым.",
    motive: "Хотел защитить семью от посторонних.",
    dialogueTree: {
      start: {
        text: "Вы хотели со мной поговорить?",
        options: [
          { text: "Что вы делали в ночь убийства?", next: "night" },
          { text: "Вы знаете что-нибудь важное?", next: "important" },
          { text: "Как вы относитесь к Лорду?", next: "relation" }
        ]
      },
      night: {
        text: "Я осматривал окрестности. Ничего необычного не видел.",
        options: [
          { text: "А кто-нибудь входил?", next: "entered" }
        ]
      },
      entered: {
        text: "Не уверен... но кто-то был.",
        options: [
          { text: "Хорошо", next: "end" }
        ]
      },
      important: {
        text: "Да, но не уверен, стоит ли говорить об этом сейчас.",
        options: [
          { text: "Прошу вас", next: "please" }
        ]
      },
      please: {
        text: "Я нашёл старую записку в библиотеке... она может вам помочь.",
        options: [
          { text: "Хорошо", next: "end" }
        ]
      },
      relation: {
        text: "Я ему предан. Он мой господин.",
        options: [
          { text: "Хорошо", next: "end" }
        ]
      },
      end: {
        text: "Если понадоблюсь — я здесь.",
        options: []
      }
    }
  },
  "neighbor_smith": {
    name: "Сосед Смит",
    description: "Любопытный и несколько завистливый мужчина.",
    motive: "Завидовал Лорду Винтеру и хотел получить его земли.",
    dialogueTree: {
      start: {
        text: "Здравствуйте, детектив.",
        options: [
          { text: "Вы были в поместье в ночь убийства?", next: "visited" },
          { text: "Что вы знаете о Лорде?", next: "know" },
          { text: "Вы его ненавидели?", next: "hate" }
        ]
      },
      visited: {
        text: "Нет, я был дома. Но видел, как кто-то выходил из сарая.",
        options: [
          { text: "Кто?", next: "who" }
        ]
      },
      who: {
        text: "Не разглядел... но это был высокий человек.",
        options: [
          { text: "Хорошо", next: "end" }
        ]
      },
      know: {
        text: "Он был жестоким, но умен. Его убили неспроста.",
        options: [
          { text: "Хорошо", next: "end" }
        ]
      },
      hate: {
        text: "Не ненавидел... просто хотел то же, что и у него.",
        options: [
          { text: "Хорошо", next: "end" }
        ]
      },
      end: {
        text: "Если будут ещё вопросы — обращайтесь.",
        options: []
      }
    }
  }
};

const locations = [
  {
    id: "hall",
    name: "Вестибюль поместья",
    description: "Великий зал с массивной лестницей и старинными портретами на стенах. Здесь всегда прохладно, и кажется, будто за вами наблюдают портреты.",
    sublocations: [
      { id: "portrait", name: "Осмотреть портреты", description: "Портреты разных поколений семьи Винтер." },
      { id: "stairs", name: "Подняться по лестнице", description: "Лестница ведёт на второй этаж." },
      { id: "door", name: "Осмотреть входную дверь", description: "Дверь крепкая, но с царапинами на ручке." }
    ],
    character: "butler_james"
  },
  {
    id: "kitchen",
    name: "Кухня",
    description: "Старомодная кухня с большим очагом и запахом пряностей. Здесь можно найти еду, но также легко спрятать что-то опасное.",
    sublocations: [
      { id: "stove", name: "Осмотреть очаг", description: "Очаг недавно топили, угли еще теплые." },
      { id: "pantry", name: "Осмотреть кладовку", description: "В кладовке много банок с вареньем и консервами." },
      { id: "window", name: "Посмотреть в окно", description: "Через окно виден сад и сарай." }
    ],
    character: "cook_mary"
  },
  {
    id: "barn",
    name: "Сарай",
    description: "Старый сарай с соломенным полом и несколькими ящиками. Пахнет плесенью и старыми вещами. Крысы бегают по углам, и кажется, что кто-то был здесь совсем недавно.",
    sublocations: [
      { id: "table", name: "Подойти к столу", description: "Стол завален бумагами и грязными инструментами." },
      { id: "window", name: "Осмотреть окно", description: "Окно выбито, ветер дует внутрь." },
      { id: "floor", name: "Осмотреть пол", description: "Пятна на полу похожи на кровь." }
    ],
    character: "maid_anna"
  },
  {
    id: "garden",
    name: "Сад",
    description: "Аккуратный сад с розами и фруктовыми деревьями. Фонтан давно не работает, но цветы ухожены. Отсюда хорошо видно окна дома.",
    sublocations: [
      { id: "bench", name: "Осмотреть скамейку", description: "Скамейка старая, на ней царапины." },
      { id: "fountain", name: "Осмотреть фонтан", description: "Фонтан не работает, вода застыла." },
      { id: "hedge", name: "Обойти живую изгородь", description: "Изгородь густая, с редкими пробелами." }
    ],
    character: "neighbor_smith"
  }
];

let discoveredInfo = [];
let playerNotes = "";
let currentLocationIndex = 0;
let currentSublocationIndex = null;
let currentDialogueCharacter = null;
let currentDialogueNode = "start";
let finalUnlocked = false;

const app = document.getElementById("app");

function updateDialogue(text, append = true) {
  const area = document.getElementById("dialogue-area");
  if (append) {
    area.innerHTML += "<p>" + text + "</p>";
  } else {
    area.innerHTML = "<p>" + text + "</p>";
  }
  area.scrollTop = area.scrollHeight;
}

function showDialogue(charId, nodeId) {
  const char = characters[charId];
  const node = char.dialogueTree[nodeId];
  if (!node) return;
  let optionsHTML = node.options.map(opt => 
    `<button class="btn" data-next="${opt.next}">${opt.text}</button>`
  ).join('');
  app.innerHTML += `
    <div class="content-box" style="margin-top:1rem;" id="dialogue-options">
      <p><b>${char.name}:</b> ${node.text}</p>
      <div class="btn-group">${optionsHTML}</div>
    </div>
  `;
  document.querySelectorAll("#dialogue-options .btn").forEach(btn => {
    btn.onclick = () => {
      const nextNode = btn.dataset.next;
      app.querySelector("#dialogue-options").remove();
      if (nextNode !== "end") {
        showDialogue(charId, nextNode);
      } else {
        updateDialogue(`<b>${char.name}:</b> ${char.dialogueTree.end.text}`);
      }
    };
  });
}

function renderLocation(index) {
  const loc = locations[index];
  currentLocationIndex = index;
  currentSublocationIndex = null;

  // Подлокации
  let sublocationsHTML = "";
  if (loc.sublocations) {
    sublocationsHTML = loc.sublocations.map((subloc, i) =>
      `<button class="btn" data-index="${i}">${subloc.name}</button>`
    ).join('');
  }

  // Персонаж
  let characterHTML = "";
  if (loc.character) {
    const char = characters[loc.character];
    characterHTML = `
      <div style="margin-top:1rem;">
        <p>Здесь находится: <b>${char.name}</b> — ${char.description}</p>
        <button class="btn" id="talk-btn">Поговорить с ${char.name}</button>
      </div>`;
  }

  // Основной интерфейс
  app.innerHTML = `
    <header><h1>${loc.name}</h1></header>
    <main>
      <div id="location-description">${loc.description}</div>
      <div class="btn-group" id="sublocations-buttons">${sublocationsHTML}</div>
      ${characterHTML}
      <div id="dialogue-area" style="min-height:120px; margin-top:1rem;"></div>
      <div class="btn-group" style="margin-top:1rem;">
        <button class="btn" id="notes-btn">Заметки</button>
        <button class="btn" id="info-btn">Информация</button>
        <button class="btn" id="location-select-btn">Выбор локации</button>
        <button class="btn hidden" id="final-btn">Финал</button>
      </div>
    </main>
  `;

  // Обработчики подлокаций
  const subBtns = document.querySelectorAll('#sublocations-buttons .btn');
  subBtns.forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.index);
      currentSublocationIndex = idx;
      updateDialogue(`Вы выбрали: ${loc.sublocations[idx].description}`, false);
    };
  });

  // Обработчики кнопок
  document.getElementById('notes-btn').onclick = renderNotes;
  document.getElementById('info-btn').onclick = renderInfo;
  document.getElementById('location-select-btn').onclick = renderLocationSelect;
  document.getElementById('final-btn').onclick = renderFinal;

  // Диалог
  if (loc.character) {
    document.getElementById('talk-btn').onclick = () => {
      currentDialogueCharacter = loc.character;
      showDialogue(loc.character, "start");
    };
  }

  checkFinalUnlock();
}

function renderNotes() {
  app.innerHTML = `
    <header><h1>Заметки</h1></header>
    <main>
      <textarea id="notes-textarea" placeholder="Ваши заметки...">${playerNotes}</textarea>
      <div style="margin-top:1rem;">
        <button class="btn" id="save-notes-btn">Сохранить</button>
        <button class="btn" id="back-btn">Назад</button>
      </div>
    </main>
  `;
  document.getElementById('save-notes-btn').onclick = () => {
    playerNotes = document.getElementById('notes-textarea').value;
    saveProgress();
    alert("Заметки сохранены.");
  };
  document.getElementById('back-btn').onclick = () => {
    loadProgress();
    renderLocation(currentLocationIndex);
  };
}

function renderInfo() {
  app.innerHTML = `
    <header><h1>Информация</h1></header>
    <main>
      <div class="content-box">
        ${discoveredInfo.length > 0 ? discoveredInfo.map(info => `<p>• ${info}</p>`).join('') : "<p>Информация пока не собрана.</p>"}
      </div>
      <button class="btn" id="back-btn">Назад</button>
    </main>
  `;
  document.getElementById('back-btn').onclick = () => {
    renderLocation(currentLocationIndex);
  };
}

function renderLocationSelect() {
  app.innerHTML = `
    <header><h1>Выбор локации</h1></header>
    <main>
      <div class="content-box">
        ${locations.map((loc, i) => 
          `<button class="btn" data-index="${i}">${loc.name}</button>`
        ).join('')}
      </div>
      <button class="btn" id="back-btn">Назад</button>
    </main>
  `;
  document.querySelectorAll('button[data-index]').forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.index);
      renderLocation(idx);
    };
  });
  document.getElementById('back-btn').onclick = () => {
    renderLocation(currentLocationIndex);
  };
}

function checkFinalUnlock() {
  if (discoveredInfo.length >= 5) {
    finalUnlocked = true;
    document.getElementById('final-btn').classList.remove("hidden");
  }
}

function renderFinal() {
  if (!finalUnlocked) {
    alert("Финал откроется после сбора достаточного количества улик.");
    return;
  }
  app.innerHTML = `
    <header><h1>Финал</h1></header>
    <main>
      <div class="content-box" style="max-width: 600px;">
        <p>Выберите версию преступления, которую хотите представить:</p>
        <select id="final-version-select" style="width:100%; padding:0.5rem; margin-bottom: 1rem;">
          <option value="">-- Выберите версию --</option>
          <option value="lord_winter">Лорд Винтер виновен</option>
          <option value="maid_anna">Горничная Анна виновна</option>
          <option value="butler_james">Дворецкий Джеймс виновен</option>
          <option value="cook_mary">Повар Мария виновна</option>
          <option value="neighbor_smith">Сосед Смит виновен</option>
        </select>
        <button class="btn" id="submit-final-btn">Подтвердить</button>
        <button class="btn" id="back-btn">Назад</button>
        <div id="final-result" style="margin-top: 1rem;"></div>
      </div>
    </main>
  `;
  document.getElementById('submit-final-btn').onclick = () => {
    const val = document.getElementById('final-version-select').value;
    if (!val) {
      alert("Пожалуйста, выберите версию.");
      return;
    }
    checkFinalAnswer(val);
  };
  document.getElementById('back-btn').onclick = () => {
    renderLocation(currentLocationIndex);
  };
}

function checkFinalAnswer(chosen) {
  const correct = "maid_anna";
  const resultDiv = document.getElementById('final-result');
  if (chosen === correct) {
    resultDiv.innerHTML = `<p style="color:green;"><b>Верно!</b> Горничная Анна была виновна. Поздравляем, вы раскрыли дело!</p>`;
  } else {
    resultDiv.innerHTML = `<p style="color:red;"><b>Неверно.</b> Это не правильный подозреваемый. Попробуйте снова или просмотрите заметки и информацию.</p>`;
  }
}

function saveProgress() {
  const saveData = {
    discoveredInfo,
    playerNotes,
    currentLocationIndex,
    finalUnlocked
  };
  localStorage.setItem('detectiveGameSave', JSON.stringify(saveData));
}

function loadProgress() {
  const data = localStorage.getItem('detectiveGameSave');
  if (data) {
    const saveData = JSON.parse(data);
    discoveredInfo = saveData.discoveredInfo || [];
    playerNotes = saveData.playerNotes || "";
    currentLocationIndex = saveData.currentLocationIndex || 0;
    finalUnlocked = saveData.finalUnlocked || false;
  }
}

function renderMainMenu() {
  app.innerHTML = `
    <header><h1>Дело поместья Винтер</h1></header>
    <main>
      <div class="content-box">
        <button class="btn" id="start-btn">Начать прохождение</button>
      </div>
    </main>
  `;
  document.getElementById('start-btn').onclick = () => {
    renderIntro();
  };
}

function renderIntro() {
  app.innerHTML = `
    <header><h1>Дело поместья Винтер</h1></header>
    <main>
      <div class="content-box" style="max-width:400px;">
        <p>Добрый день, детектив! Сегодня нам предстоит расследовать дело.</p>
        <p>Цель: пройти игру с наименьшим количеством подсказок от помощника.</p>
        <button class="btn" id="begin-game-btn">Начать</button>
      </div>
    </main>
  `;
  document.getElementById('begin-game-btn').onclick = () => {
    loadProgress();
    renderLocation(currentLocationIndex);
  };
}

// Запуск игры
renderMainMenu();
