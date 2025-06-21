// ========== ДАННЫЕ ИГРЫ ==========

// Персонажи с характерами и мотивами
const characters = {
  "lord_winter": {
    name: "Лорд Винтер",
    description: "Хозяин поместья. Строгий и холодный, скрывает много тайн.",
    motive: "Опасался, что кто-то из слуг раскроет его финансовые махинации."
  },
  "maid_anna": {
    name: "Горничная Анна",
    description: "Молодая и застенчивая, но внимательная к деталям.",
    motive: "Боялась потерять работу из-за тайных прогулок по ночам."
  },
  "butler_james": {
    name: "Дворецкий Джеймс",
    description: "Верный слуга с таинственным прошлым.",
    motive: "Хотел защитить семью от посторонних."
  },
  "cook_mary": {
    name: "Повар Мария",
    description: "Добродушная женщина с крепкими связями в округе.",
    motive: "Могла иметь секретные связи с местным контрабандистом."
  },
  "neighbor_smith": {
    name: "Сосед Смит",
    description: "Любопытный и несколько завистливый мужчина.",
    motive: "Завидовал Лорду Винтеру и хотел получить его земли."
  }
};

// Локации с описаниями, подлокациями, событиями
const locations = [
  {
    id: "hall",
    name: "Вестибюль поместья",
    description: "Великий зал с массивной лестницей и старинными портретами на стенах.",
    sublocations: [
      { id: "portrait", name: "Осмотреть портреты", description: "Портреты разных поколений семьи Винтер." },
      { id: "stairs", name: "Подняться по лестнице", description: "Лестница ведёт на второй этаж." },
      { id: "door", name: "Осмотреть входную дверь", description: "Дверь крепкая, но с царапинами на ручке." }
    ],
    events: [
      { id: "footsteps", text: "Ты слышишь тихие шаги, но никого не видишь." }
    ],
    dialogues: [
      {
        character: "butler_james",
        lines: [
          "Добро пожаловать, детектив. Помогу во всём, чем смогу.",
          "Я всегда был предан этой семье."
        ]
      }
    ]
  },
  {
    id: "kitchen",
    name: "Кухня",
    description: "Старомодная кухня с большим очагом и запахом пряностей.",
    sublocations: [
      { id: "stove", name: "Осмотреть очаг", description: "Очаг недавно топили, угли еще теплые." },
      { id: "pantry", name: "Осмотреть кладовку", description: "В кладовке много банок с вареньем и консервами." },
      { id: "window", name: "Посмотреть в окно", description: "Через окно виден сад и сарай." }
    ],
    events: [
      { id: "whisper", text: "Ты слышишь шепот из кладовки." }
    ],
    dialogues: [
      {
        character: "cook_mary",
        lines: [
          "Я готовлю для всех, но ночью слышала странные звуки.",
          "Кто-то частенько заглядывает в кладовку, но не я."
        ]
      }
    ]
  },
  {
    id: "barn",
    name: "Сарай",
    description: "Старый сарай с соломенным полом и несколькими ящиками.",
    sublocations: [
      { id: "table", name: "Подойти к столу", description: "Стол завален бумагами и грязными инструментами." },
      { id: "window", name: "Осмотреть окно", description: "Окно выбито, ветер дует внутрь." },
      { id: "floor", name: "Осмотреть пол", description: "Пятна на полу похожи на кровь." }
    ],
    events: [
      { id: "rat", text: "Крыса быстро проскочила мимо тебя." }
    ],
    dialogues: [
      {
        character: "maid_anna",
        lines: [
          "Я часто убиралась здесь, но в ночь происшествия слышала шум.",
          "Кто-то пытался что-то спрятать на полу."
        ]
      }
    ]
  },
  {
    id: "garden",
    name: "Сад",
    description: "Аккуратный сад с розами и фруктовыми деревьями.",
    sublocations: [
      { id: "bench", name: "Осмотреть скамейку", description: "Скамейка старая, на ней царапины." },
      { id: "fountain", name: "Осмотреть фонтан", description: "Фонтан не работает, вода застыла." },
      { id: "hedge", name: "Обойти живую изгородь", description: "Изгородь густая, с редкими пробелами." }
    ],
    events: [
      { id: "bird", text: "Птица взлетела с ветки, прервав тишину." }
    ],
    dialogues: [
      {
        character: "neighbor_smith",
        lines: [
          "Я много видел в этом поместье, но не всё расскажу.",
          "Лорд Винтер всегда скрывает правду."
        ]
      }
    ]
  }
];

// Информация, которую игрок узнаёт по ходу расследования
let discoveredInfo = [];

// Заметки игрока
let playerNotes = "";

// Текущий прогресс
let currentLocationIndex = 0;
let currentSublocationIndex = null;
let currentDialogueIndex = 0;
let usedHints = 0;

// Состояние финала
let finalUnlocked = false;

// Состояние диалога
let currentDialogue = null;
let currentDialogueLine = 0;
let currentDialogueCharacter = null;

// ========== ЛОГИКА ПРИЛОЖЕНИЯ ==========

const app = document.getElementById('app');

// === РЕНДЕР ИНТЕРФЕЙСА ===

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

function renderLocation(index) {
  const loc = locations[index];
  currentLocationIndex = index;
  currentSublocationIndex = null;
  currentDialogueIndex = 0;
  currentDialogue = null;
  currentDialogueLine = 0;

  // Основной интерфейс локации
  app.innerHTML = `
  <header><h1>${loc.name}</h1></header>
  <main>
    <div id="location-description">${loc.description}</div>

    <div class="btn-group" id="sublocations-buttons">
      ${loc.sublocations.map((subloc, i) => 
        `<button class="btn" data-index="${i}">${subloc.name}</button>`
      ).join('')}
    </div>

    <button class="btn" id="explore-btn">Исследовать выбранное</button>
    <div id="dialogue-area" style="min-height:120px; margin-top: 1rem;"></div>

    <div class="btn-group" id="action-buttons" style="margin-top: 1rem;">
      <button class="btn" id="notes-btn">Заметки</button>
      <button class="btn" id="info-btn">Информация</button>
      <button class="btn" id="location-select-btn">Выбор локации</button>
      <button class="btn" id="next-dialogue-btn">Следующий диалог</button>
      <button class="btn" id="final-btn" style="display:none;">Финал</button>
    </div>
  </main>
  `;

  // Установка обработчиков

  // Выбор подлокации
  const sublocBtns = document.querySelectorAll('#sublocations-buttons .btn');
  sublocBtns.forEach(btn => btn.onclick = () => {
    const idx = parseInt(btn.dataset.index);
    currentSublocationIndex = idx;
    updateDialogue(`Вы выбрали: ${locations[currentLocationIndex].sublocations[idx].name}`, false);
  });

  document.getElementById('explore-btn').onclick = () => {
    if (currentSublocationIndex === null) {
      updateDialogue("Сначала выберите, что хотите исследовать.");
      return;
    }
    exploreSublocation(currentLocationIndex, currentSublocationIndex);
  };

  document.getElementById('notes-btn').onclick = () => {
    renderNotes();
  };

  document.getElementById('info-btn').onclick = () => {
    renderInfo();
  };

  document.getElementById('location-select-btn').onclick = () => {
    renderLocationSelect();
  };

  document.getElementById('next-dialogue-btn').onclick = () => {
    showNextDialogueLine();
  };

  document.getElementById('final-btn').onclick = () => {
    renderFinal();
  };

  // Автоматически показать первый диалог
  if (loc.dialogues.length > 0) {
    currentDialogue = loc.dialogues[0];
    currentDialogueLine = 0;
    showNextDialogueLine();
  } else {
    updateDialogue("Диалогов в этой локации нет.");
  }

  checkFinalUnlock();
}

function updateDialogue(text, append = true) {
  const dialogueArea = document.getElementById('dialogue-area');
  if (append) {
    dialogueArea.innerHTML += "<p>" + text + "</p>";
  } else {
    dialogueArea.innerHTML = "<p>" + text + "</p>";
  }
  dialogueArea.scrollTop = dialogueArea.scrollHeight;
}

// Исследование подлокации
function exploreSublocation(locIdx, sublocIdx) {
  const loc = locations[locIdx];
  const subloc = loc.sublocations[sublocIdx];
  // Для запутывающей информации и полезной смешиваем
  const possibleFindings = [
    `Вы нашли заметку с фразой "Тайна под снегом".`,
    `Ничего необычного здесь нет.`,
    `Пятна на полу выглядят подозрительно, возможно кровь.`,
    `Что-то застряло в углу, похоже на часть одежды.`,
    `На столе лежит старая фотография поместья.`,
    `В углу вы видите странные царапины на стене.`,
    `Звук шагов прерывается резким шорохом.`,
    `Никаких следов не обнаружено.`
  ];
  // Случайный выбор для простоты, можно связать с локацией
  const finding = possibleFindings[Math.floor(Math.random() * possibleFindings.length)];

  updateDialogue(`Исследуя "${subloc.name}": ${finding}`);

  // Если находка полезная, добавим в информацию
  if (finding.includes("пятна") || finding.includes("заметка") || finding.includes("фотография") || finding.includes("царапины")) {
    addDiscoveredInfo(finding);
  }
}

// Добавить информацию в список
function addDiscoveredInfo(text) {
  if (!discoveredInfo.includes(text)) {
    discoveredInfo.push(text);
    saveProgress();
  }
}

// Отобразить заметки
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
    renderLocation(currentLocationIndex);
  };
}

// Отобразить информацию
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

// Выбор локации
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

// Показать следующий диалог в текущей локации
function showNextDialogueLine() {
  if (!currentDialogue) {
    updateDialogue("Диалогов нет.");
    return;
  }
  const lines = currentDialogue.lines;
  if (currentDialogueLine >= lines.length) {
    updateDialogue("Диалог окончен.");
    return;
  }
  const char = characters[currentDialogue.character];
  updateDialogue(`<b>${char.name}:</b> ${lines[currentDialogueLine]}`);
  currentDialogueLine++;
}

// Проверка открытия финала
function checkFinalUnlock() {
  // Условие — собраны все ключевые улики (пример)
  if (discoveredInfo.length >= 5) {
    finalUnlocked = true;
    const finalBtn = document.getElementById('final-btn');
    if (finalBtn) finalBtn.style.display = 'inline-block';
  }
}

// Финал игры — диалог с выбором версий
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

// Проверка ответа финала и вывод результата
function checkFinalAnswer(chosen) {
  const correct = "maid_anna"; // Правильный преступник
  const resultDiv = document.getElementById('final-result');

  if (chosen === correct) {
    resultDiv.innerHTML = `<p style="color:green;"><b>Верно!</b> Горничная Анна была виновна. Поздравляем, вы раскрыли дело!</p>`;
  } else {
    resultDiv.innerHTML = `<p style="color:red;"><b>Неверно.</b> Это не правильный подозреваемый. Попробуйте снова или просмотрите заметки и информацию.</p>`;
  }
}

// Сохранение прогресса в localStorage
function saveProgress() {
  const saveData = {
    discoveredInfo,
    playerNotes,
    currentLocationIndex,
    usedHints,
    finalUnlocked
  };
  localStorage.setItem('detectiveGameSave', JSON.stringify(saveData));
}

// Загрузка прогресса из localStorage
function loadProgress() {
  const data = localStorage.getItem('detectiveGameSave');
  if (data) {
    const saveData = JSON.parse(data);
    discoveredInfo = saveData.discoveredInfo || [];
    playerNotes = saveData.playerNotes || "";
    currentLocationIndex = saveData.currentLocationIndex || 0;
    usedHints = saveData.usedHints || 0;
    finalUnlocked = saveData.finalUnlocked || false;
  }
}

// Запуск игры
renderMainMenu();
