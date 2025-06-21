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

let discoveredInfo = [];
let playerNotes = "";
let currentLocationIndex = 0;
let currentSublocationIndex = null;
let usedHints = 0;
let finalUnlocked = false;
let currentDialogue = null;
let currentDialogueLine = 0;

// === ОСНОВНЫЕ ФУНКЦИИ ===

function hideAllScreens() {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
}

function showScreen(id) {
  hideAllScreens();
  document.getElementById(id).classList.remove("hidden");
}

document.getElementById("start-btn").addEventListener("click", () => {
  showScreen("welcome-screen");
});

document.getElementById("begin-game-btn").addEventListener("click", () => {
  loadProgress();
  renderLocation(currentLocationIndex);
});

function renderLocation(index) {
  const loc = locations[index];
  currentLocationIndex = index;
  currentSublocationIndex = null;
  currentDialogue = loc.dialogues.length > 0 ? loc.dialogues[0] : null;
  currentDialogueLine = 0;

  document.getElementById("location-title").innerHTML = `<h2>${loc.name}</h2>`;
  document.getElementById("location-description").textContent = loc.description;

  // Очистка кнопок подлокаций
  const sublocBtns = document.getElementById("sub-location-buttons");
  sublocBtns.innerHTML = "";
  loc.sublocations.forEach((subloc, i) => {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = subloc.name;
    btn.onclick = () => {
      currentSublocationIndex = i;
      updateDialogue(`Вы выбрали: ${subloc.name}`);
    };
    sublocBtns.appendChild(btn);
  });

  // Диалог
  if (currentDialogue) {
    updateDialogue(`<b>${characters[currentDialogue.character].name}:</b> ${currentDialogue.lines[0]}`, false);
    currentDialogueLine++;
  } else {
    updateDialogue("Диалогов нет.", false);
  }

  // Кнопки действий
  document.getElementById("explore-btn").onclick = exploreSublocation;
  document.getElementById("notes-btn").onclick = showNotes;
  document.getElementById("info-btn").onclick = showInfo;
  document.getElementById("change-location-btn").onclick = showLocationSelect;

  checkFinalUnlock();

  showScreen("game-screen");
}

function updateDialogue(text, append = true) {
  const area = document.getElementById("dialogue-area");
  if (append) {
    area.innerHTML += `<p>${text}</p>`;
  } else {
    area.innerHTML = `<p>${text}</p>`;
  }
  area.scrollTop = area.scrollHeight;
}

function exploreSublocation() {
  if (currentSublocationIndex === null) {
    updateDialogue("Выберите подлокацию.");
    return;
  }

  const loc = locations[currentLocationIndex];
  const subloc = loc.sublocations[currentSublocationIndex];

  const findings = [
    "Вы нашли старую записку.",
    "На стене царапины.",
    "Пятна похожи на кровь.",
    "Предмет одежды остался в углу.",
    "Здесь ничего необычного.",
    "Кто-то спрятал документы.",
    "Следы борьбы на полу.",
    "Здесь давно никто не был."
  ];

  const finding = findings[Math.floor(Math.random() * findings.length)];
  updateDialogue(`Исследуя "${subloc.name}": ${finding}`);

  if (finding.includes("кровь") || finding.includes("записка") || finding.includes("документы")) {
    addDiscoveredInfo(finding);
  }
}

function addDiscoveredInfo(text) {
  if (!discoveredInfo.includes(text)) {
    discoveredInfo.push(text);
    saveProgress();
  }
}

function showNotes() {
  document.getElementById("notes-textarea").value = playerNotes;
  showScreen("notes-screen");
}

document.getElementById("save-notes-btn").addEventListener("click", () => {
  playerNotes = document.getElementById("notes-textarea").value;
  saveProgress();
  alert("Заметки сохранены.");
});

document.getElementById("close-notes-btn").addEventListener("click", () => {
  showScreen("game-screen");
});

function showInfo() {
  const list = document.getElementById("info-list");
  list.innerHTML = "";
  if (discoveredInfo.length === 0) {
    list.innerHTML = "<li>Информация пока не собрана.</li>";
  } else {
    discoveredInfo.forEach(info => {
      const li = document.createElement("li");
      li.textContent = info;
      list.appendChild(li);
    });
  }
  showScreen("info-screen");
}

document.getElementById("close-info-btn").addEventListener("click", () => {
  showScreen("game-screen");
});

function showLocationSelect() {
  const list = document.getElementById("location-list");
  list.innerHTML = "";
  locations.forEach((loc, i) => {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = loc.name;
    btn.disabled = !isLocationAvailable(i);
    btn.onclick = () => {
      renderLocation(i);
    };
    const li = document.createElement("li");
    li.appendChild(btn);
    list.appendChild(li);
  });
  showScreen("location-select-screen");
}

function isLocationAvailable(index) {
  return index <= currentLocationIndex;
}

document.getElementById("close-location-select-btn").addEventListener("click", () => {
  showScreen("game-screen");
});

function checkFinalUnlock() {
  if (discoveredInfo.length >= 3) {
    finalUnlocked = true;
    document.getElementById("final-submit-btn").disabled = false;
  }
}

document.getElementById("final-submit-btn").addEventListener("click", checkFinalAnswer);

function checkFinalAnswer() {
  const resultDiv = document.getElementById("final-result");
  const chosen = prompt("Введите имя преступника:");

  if (!chosen) {
    alert("Введите имя преступника.");
    return;
  }

  if (chosen.toLowerCase().includes("анна")) {
    resultDiv.innerHTML = `<p style="color:green;">Правильно! Горничная Анна была виновна.</p>`;
  } else {
    resultDiv.innerHTML = `<p style="color:red;">Ошибка. Это не преступник.</p>`;
  }

  document.getElementById("final-main-menu-btn").classList.remove("hidden");
  resultDiv.classList.remove("hidden");
}

document.getElementById("final-main-menu-btn").addEventListener("click", () => {
  showScreen("welcome-screen");
});

// === СОХРАНЕНИЕ И ЗАГРУЗКА ===

function saveProgress() {
  const data = {
    discoveredInfo,
    playerNotes,
    currentLocationIndex,
    finalUnlocked
  };
  localStorage.setItem("detectiveGameSave", JSON.stringify(data));
}

function loadProgress() {
  const saved = localStorage.getItem("detectiveGameSave");
  if (saved) {
    const data = JSON.parse(saved);
    discoveredInfo = data.discoveredInfo || [];
    playerNotes = data.playerNotes || "";
    currentLocationIndex = data.currentLocationIndex || 0;
    finalUnlocked = data.finalUnlocked || false;
  }
}
