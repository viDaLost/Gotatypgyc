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
  document.getElementById("start-btn").onclick = showWelcomeScreen;
  document.getElementById("begin-game-btn").onclick = startGame;
  document.getElementById("explore-btn").onclick = exploreSublocation;
  document.getElementById("notes-btn").onclick = showNotesScreen;
  document.getElementById("info-btn").onclick = showInfoScreen;
  document.getElementById("change-location-btn").onclick = showLocationSelectScreen;
  document.getElementById("save-notes-btn").onclick = saveNotes;
  document.getElementById("close-notes-btn").onclick = backToGame;
  document.getElementById("close-info-btn").onclick = backToGame;
  document.getElementById("close-location-select-btn").onclick = backToGame;
  document.getElementById("final-submit-btn").onclick = submitFinalAnswer;

  const locationList = document.getElementById("location-list");
  locations.forEach((loc, index) => {
    const li = document.createElement("li");
    li.textContent = loc.name;
    li.onclick = () => selectLocation(index);
    locationList.appendChild(li);
  });

  loadProgress();
  showMainScreen();
});

function hideAllScreens() {
  document.querySelectorAll("section").forEach(sec => sec.classList.add("hidden"));
}

function showMainScreen() {
  hideAllScreens();
  document.getElementById("main-screen").classList.remove("hidden");
}

function showWelcomeScreen() {
  hideAllScreens();
  document.getElementById("welcome-screen").classList.remove("hidden");
}

function startGame() {
  hideAllScreens();
  document.getElementById("game-screen").classList.remove("hidden");
  renderLocation(currentLocationIndex);
}

function renderLocation(index) {
  const loc = locations[index];
  currentLocationIndex = index;
  currentSublocationIndex = null;
  currentDialogue = null;
  currentDialogueLine = 0;

  document.getElementById("location-title").textContent = loc.name;
  document.getElementById("location-description").textContent = loc.description;

  const subButtons = document.getElementById("sub-location-buttons");
  subButtons.innerHTML = "";
  loc.sublocations.forEach((subloc, i) => {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = subloc.name;
    btn.onclick = () => currentSublocationIndex = i;
    subButtons.appendChild(btn);
  });

  if (loc.dialogues.length > 0) {
    currentDialogue = loc.dialogues[0];
    showNextDialogueLine();
  } else {
    updateDialogue("Диалогов нет.");
  }

  checkFinalUnlock();
}

function updateDialogue(text, append = true) {
  const area = document.getElementById("dialogue-area");
  area.innerHTML += `<p>${text}</p>`;
  area.scrollTop = area.scrollHeight;
}

function showNextDialogueLine() {
  if (!currentDialogue || currentDialogueLine >= currentDialogue.lines.length) return;
  const char = characters[currentDialogue.character];
  const line = currentDialogue.lines[currentDialogueLine++];
  updateDialogue(`<b>${char.name}:</b> ${line}`);
}

function exploreSublocation() {
  if (currentSublocationIndex === null) {
    updateDialogue("Сначала выберите подлокацию.");
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
  updateDialogue(`Исследование: ${finding}`);

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

function showNotesScreen() {
  hideAllScreens();
  document.getElementById("notes-screen").classList.remove("hidden");
  document.getElementById("notes-textarea").value = playerNotes;
}

function saveNotes() {
  playerNotes = document.getElementById("notes-textarea").value;
  saveProgress();
  alert("Заметки сохранены.");
  backToGame();
}

function showInfoScreen() {
  hideAllScreens();
  document.getElementById("info-screen").classList.remove("hidden");
  const list = document.getElementById("info-list");
  list.innerHTML = "";
  discoveredInfo.forEach(info => {
    const li = document.createElement("li");
    li.textContent = info;
    list.appendChild(li);
  });
}

function showLocationSelectScreen() {
  hideAllScreens();
  document.getElementById("location-select-screen").classList.remove("hidden");
}

function selectLocation(index) {
  backToGame();
  renderLocation(index);
}

function backToGame() {
  hideAllScreens();
  document.getElementById("game-screen").classList.remove("hidden");
}

function checkFinalUnlock() {
  if (discoveredInfo.length >= 5) {
    finalUnlocked = true;
    document.getElementById("final-main-menu-btn").classList.remove("hidden");
    document.getElementById("final-submit-btn").disabled = false;
  }
}

function submitFinalAnswer() {
  const selected = document.querySelector('input[name="final-choice"]:checked');
  if (!selected) {
    alert("Выберите версию!");
    return;
  }

  const resultDiv = document.getElementById("final-result");
  const correct = "maid_anna";

  if (selected.value === correct) {
    resultDiv.innerHTML = "<p style='color:green;'>Правильно! Горничная Анна была виновна.</p>";
  } else {
    resultDiv.innerHTML = "<p style='color:red;'>Неверно. Попробуйте снова!</p>";
  }

  document.getElementById("final-result").classList.remove("hidden");
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
