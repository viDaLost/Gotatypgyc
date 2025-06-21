// ========== ДАННЫЕ ИГРЫ ==========
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
    events: [{ id: "footsteps", text: "Ты слышишь тихие шаги, но никого не видишь." }],
    dialogues: [{
      character: "butler_james",
      lines: [
        "Добро пожаловать, детектив. Помогу во всём, чем смогу.",
        "Я всегда был предан этой семье."
      ]
    }]
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
    events: [{ id: "whisper", text: "Ты слышишь шепот из кладовки." }],
    dialogues: [{
      character: "cook_mary",
      lines: [
        "Я готовлю для всех, но ночью слышала странные звуки.",
        "Кто-то частенько заглядывает в кладовку, но не я."
      ]
    }]
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
    events: [{ id: "rat", text: "Крыса быстро проскочила мимо тебя." }],
    dialogues: [{
      character: "maid_anna",
      lines: [
        "Я часто убиралась здесь, но в ночь происшествия слышала шум.",
        "Кто-то пытался что-то спрятать на полу."
      ]
    }]
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
    events: [{ id: "bird", text: "Птица взлетела с ветки, прервав тишину." }],
    dialogues: [{
      character: "neighbor_smith",
      lines: [
        "Я много видел в этом поместье, но не всё расскажу.",
        "Лорд Винтер всегда скрывает правду."
      ]
    }]
  }
];

// ========== СОСТОЯНИЕ ИГРЫ ==========
let discoveredInfo = [];
let playerNotes = "";
let currentLocationIndex = 0;
let currentSublocationIndex = null;
let usedHints = 0;
let finalUnlocked = false;

let currentDialogue = null;
let currentDialogueLine = 0;

// ========== ОСНОВНАЯ ЛОГИКА ==========
document.addEventListener("DOMContentLoaded", () => {
  loadProgress();
  renderMainMenu();
});

function hideAllScreens() {
  document.querySelectorAll("section").forEach(sec => sec.classList.add("hidden"));
}

function showMainScreen() {
  hideAllScreens();
  document.getElementById("main-screen").classList.remove("hidden");
}

function renderMainMenu() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <header><h1>Дело поместья Винтер</h1></header>
    <main class="content-box">
      <button class="btn" id="start-btn">Начать прохождение</button>
    </main>
  `;
  document.getElementById("start-btn").onclick = renderIntro;
}

function renderIntro() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <header><h1>Дело поместья Винтер</h1></header>
    <main class="content-box">
      <p>Добрый день, детектив! Сегодня нам предстоит расследовать дело.</p>
      <p>Цель: пройти игру с наименьшим количеством подсказок от помощника.</p>
      <button class="btn" id="begin-game-btn">Начать</button>
    </main>
  `;
  document.getElementById("begin-game-btn").onclick = () => renderLocation(currentLocationIndex);
}

function renderLocation(index) {
  const loc = locations[index];
  currentLocationIndex = index;
  currentSublocationIndex = null;
  currentDialogue = null;
  currentDialogueLine = 0;

  let subButtonsHTML = loc.sublocations.map((subloc, i) =>
    `<button class="btn" data-index="${i}">${subloc.name}</button>`
  ).join("");

  const dialogueArea = `<div id="dialogue-area" style="min-height:120px; margin-top: 1rem;"></div>`;
  const subLocBtns = `<div class="btn-group" id="sublocations-buttons">${subButtonsHTML}</div>`;
  const exploreBtn = `<button class="btn" id="explore-btn">Исследовать выбранное</button>`;
  const actionBtns = `
    <div class="btn-group" style="margin-top:1rem;">
      <button class="btn" id="notes-btn">Заметки</button>
      <button class="btn" id="info-btn">Информация</button>
      <button class="btn" id="location-select-btn">Выбор локации</button>
      <button class="btn" id="next-dialogue-btn">Следующий диалог</button>
      <button class="btn hidden" id="final-btn">Финал</button>
    </div>
  `;

  const app = document.getElementById("app");
  app.innerHTML = `
    <header><h1>${loc.name}</h1></header>
    <main>
      <div id="location-description">${loc.description}</div>
      ${subLocBtns}
      ${exploreBtn}
      ${dialogueArea}
      ${actionBtns}
    </main>
  `;

  // === Обработчики событий ===
  document.querySelectorAll("#sublocations-buttons .btn").forEach(btn => {
    btn.onclick = () => {
      currentSublocationIndex = parseInt(btn.dataset.index);
      updateDialogue(`Вы выбрали: ${loc.sublocations[currentSublocationIndex].name}`, false);
    };
  });

  document.getElementById("explore-btn").onclick = exploreSublocation;
  document.getElementById("notes-btn").onclick = renderNotes;
  document.getElementById("info-btn").onclick = renderInfo;
  document.getElementById("location-select-btn").onclick = renderLocationSelect;
  document.getElementById("next-dialogue-btn").onclick = showNextDialogueLine;
  document.getElementById("final-btn").onclick = renderFinal;

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
  const area = document.getElementById("dialogue-area");
  if (append) {
    area.innerHTML += "<p>" + text + "</p>";
  } else {
    area.innerHTML = "<p>" + text + "</p>";
  }
  area.scrollTop = area.scrollHeight;
}

function exploreSublocation() {
  if (currentSublocationIndex === null) {
    updateDialogue("Сначала выберите, что хотите исследовать.");
    return;
  }

  const possibleFindings = [
    "Вы нашли заметку с фразой 'Тайна под снегом'.",
    "Ничего необычного здесь нет.",
    "Пятна на полу выглядят подозрительно, возможно кровь.",
    "Что-то застряло в углу, похоже на часть одежды.",
    "На столе лежит старая фотография поместья.",
    "В углу вы видите странные царапины на стене.",
    "Звук шагов прерывается резким шорохом.",
    "Никаких следов не обнаружено."
  ];

  const finding = possibleFindings[Math.floor(Math.random() * possibleFindings.length)];
  updateDialogue(`Исследуя "${locations[currentLocationIndex].sublocations[currentSublocationIndex].name}": ${finding}`);

  if (finding.includes("пятна") || finding.includes("заметка") || finding.includes("фотография") || finding.includes("царапины")) {
    addDiscoveredInfo(finding);
  }
}

function addDiscoveredInfo(text) {
  if (!discoveredInfo.includes(text)) {
    discoveredInfo.push(text);
    saveProgress();
  }
}

function renderNotes() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <header><h1>Заметки</h1></header>
    <main class="content-box">
      <textarea id="notes-textarea" placeholder="Ваши заметки...">${playerNotes}</textarea>
      <div style="margin-top:1rem;">
        <button class="btn" id="save-notes-btn">Сохранить</button>
        <button class="btn" id="back-btn">Назад</button>
      </div>
    </main>
  `;
  document.getElementById("save-notes-btn").onclick = () => {
    playerNotes = document.getElementById("notes-textarea").value;
    saveProgress();
    alert("Заметки сохранены.");
  };
  document.getElementById("back-btn").onclick = () => renderLocation(currentLocationIndex);
}

function renderInfo() {
  const infoList = discoveredInfo.length ? discoveredInfo.map(info => `<p>• ${info}</p>`).join("") : "<p>Информация пока не собрана.</p>";
  const app = document.getElementById("app");
  app.innerHTML = `
    <header><h1>Информация</h1></header>
    <main class="content-box">
      ${infoList}
      <button class="btn" id="back-btn">Назад</button>
    </main>
  `;
  document.getElementById("back-btn").onclick = () => renderLocation(currentLocationIndex);
}

function renderLocationSelect() {
  const locationList = locations.map((loc, i) => `<button class="btn" data-index="${i}">${loc.name}</button>`).join("");
  const app = document.getElementById("app");
  app.innerHTML = `
    <header><h1>Выбор локации</h1></header>
    <main class="content-box">
      ${locationList}
      <button class="btn" id="back-btn">Назад</button>
    </main>
  `;
  document.querySelectorAll("button[data-index]").forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.index);
      renderLocation(idx);
    };
  });
  document.getElementById("back-btn").onclick = () => renderLocation(currentLocationIndex);
}

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

function checkFinalUnlock() {
  if (discoveredInfo.length >= 5) {
    finalUnlocked = true;
    document.getElementById("final-btn").classList.remove("hidden");
  }
}

function renderFinal() {
  if (!finalUnlocked) {
    alert("Финал откроется после сбора достаточного количества улик.");
    return;
  }

  const options = Object.entries(characters).map(([key, ch]) => 
    `<option value="${key}">${ch.name} виновен</option>`
  ).join("");

  const app = document.getElementById("app");
  app.innerHTML = `
    <header><h1>Финал</h1></header>
    <main class="content-box">
      <p>Выберите версию преступления, которую хотите представить:</p>
      <select id="final-version-select" style="width:100%; padding:0.5rem; margin-bottom: 1rem;">
        <option value="">-- Выберите версию --</option>
        ${options}
      </select>
      <button class="btn" id="submit-final-btn">Подтвердить</button>
      <button class="btn" id="back-btn">Назад</button>
      <div id="final-result" style="margin-top: 1rem;"></div>
    </main>
  `;

  document.getElementById("submit-final-btn").onclick = () => {
    const val = document.getElementById("final-version-select").value;
    if (!val) {
      alert("Пожалуйста, выберите версию.");
      return;
    }
    checkFinalAnswer(val);
  };

  document.getElementById("back-btn").onclick = () => renderLocation(currentLocationIndex);
}

function checkFinalAnswer(chosen) {
  const correct = "maid_anna";
  const resultDiv = document.getElementById("final-result");
  if (chosen === correct) {
    resultDiv.innerHTML = `<p style="color:green;"><b>Верно!</b> Горничная Анна была виновна. Поздравляем, вы раскрыли дело!</p>`;
  } else {
    resultDiv.innerHTML = `<p style="color:red;"><b>Неверно.</b> Это не правильный подозреваемый. Попробуйте снова или просмотрите заметки и информацию.</p>`;
  }
}

function saveProgress() {
  localStorage.setItem("detectiveGameSave", JSON.stringify({
    discoveredInfo,
    playerNotes,
    currentLocationIndex,
    usedHints,
    finalUnlocked
  }));
}

function loadProgress() {
  const data = localStorage.getItem("detectiveGameSave");
  if (data) {
    const saveData = JSON.parse(data);
    discoveredInfo = saveData.discoveredInfo || [];
    playerNotes = saveData.playerNotes || "";
    currentLocationIndex = saveData.currentLocationIndex || 0;
    usedHints = saveData.usedHints || 0;
    finalUnlocked = saveData.finalUnlocked || false;
  }
}
