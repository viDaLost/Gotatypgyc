// === Инициализация данных ===

let currentLocation = null;
let facts = [];
let notes = localStorage.getItem("notes") || "";
let gameState = JSON.parse(localStorage.getItem("gameState")) || {
  visited: [],
  completed: false,
};

const locations = [
  {
    title: "Гостиная",
    desc: "Тёмная комната с пыльными портретами на стенах. Ковёр в центре залит чем-то тёмным.",
    sublocs: [
      { name: "подойти к столу", action: () => showFact("На столе следы крови.") },
      { name: "осмотреть пол", action: () => showFact("Пол покрыт странными бороздами.") },
    ],
    dialogue: "Слуга говорит, что слышал шум около полуночи."
  },
  {
    title: "Библиотека",
    desc: "Стеллажи до потолка, запах старых книг и сигар. Свет едва пробивается сквозь плотные шторы.",
    sublocs: [
      { name: "открыть книгу", action: () => showFact("Записка с угрозами внутри.") },
      { name: "осмотреть камин", action: () => showFact("Обгоревшие остатки бумаги.") },
    ],
    dialogue: "Хозяйка дома нервничает и не хочет отвечать на вопросы."
  },
  {
    title: "Оранжерея",
    desc: "Полутемная комната с тропическими растениями. Запах гнили и цветов смешивается.",
    sublocs: [
      { name: "пройти к фонтану", action: () => showFact("У фонтана застряло перчатка.") },
      { name: "проверить дверь", action: () => showFact("Дверь была взломана изнутри.") },
    ],
    dialogue: "Садовник говорит, что видел свет в библиотеке ночью."
  },
];

// === Основные функции ===

function hideAllScreens() {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
}

function showScreen(id) {
  hideAllScreens();
  document.getElementById(id).classList.remove("hidden");
}

// === Обработчики экранов ===

function showWelcome() {
  showScreen("welcome-screen");
}

function showIntro() {
  showScreen("intro-screen");
}

function startGame() {
  if (!gameState.visited.length) {
    currentLocation = locations[0];
    gameState.visited.push(currentLocation.title);
    localStorage.setItem("gameState", JSON.stringify(gameState));
  }
  renderGame();
  showScreen("game-screen");
}

function renderGame() {
  document.getElementById("location-title").textContent = currentLocation.title;
  document.getElementById("location-desc").textContent = currentLocation.desc;
  document.getElementById("dialogue-area").innerHTML = `<p>${currentLocation.dialogue}</p>`;
}

function showLocations() {
  const list = document.getElementById("locations-list");
  list.innerHTML = "";
  locations.forEach(loc => {
    const btn = document.createElement("button");
    btn.textContent = loc.title;
    btn.disabled = !gameState.visited.includes(loc.title);
    btn.onclick = () => {
      currentLocation = loc;
      renderGame();
      showScreen("game-screen");
    };
    const li = document.createElement("li");
    li.appendChild(btn);
    list.appendChild(li);
  });
  showScreen("locations-screen");
}

function showNotes() {
  updateNotesArea();
  showScreen("notes-screen");
}

function saveNotes() {
  notes = document.getElementById("notes-textarea").value;
  localStorage.setItem("notes", notes);
}

function updateNotesArea() {
  const area = document.getElementById("notes-textarea");
  if (area) area.value = notes;
}

function showFacts() {
  updateFactsList();
  showScreen("facts-screen");
}

function updateFactsList() {
  const list = document.getElementById("facts-list");
  list.innerHTML = "";
  facts.forEach(f => {
    const li = document.createElement("li");
    li.textContent = f;
    list.appendChild(li);
  });
}

function showInvestigation() {
  const area = document.getElementById("dialogue-area");
  area.innerHTML = "<p>Что вы хотите исследовать?</p>";
  currentLocation.sublocs.forEach(sub => {
    const btn = document.createElement("button");
    btn.textContent = sub.name;
    btn.onclick = () => {
      sub.action();
      // Открываем следующую локацию после всех действий
      if (currentLocation.sublocs.every(s => facts.some(f => f.includes(s.name)))) {
        const nextIndex = locations.findIndex(l => l.title === currentLocation.title) + 1;
        if (nextIndex < locations.length && !gameState.visited.includes(locations[nextIndex].title)) {
          gameState.visited.push(locations[nextIndex].title);
          localStorage.setItem("gameState", JSON.stringify(gameState));
        }
      }
    };
    area.appendChild(btn);
  });
}

function checkFinal(e) {
  e.preventDefault();
  const killer = document.getElementById("killer-input").value.toLowerCase();
  const method = document.getElementById("method-input").value.toLowerCase();
  const motive = document.getElementById("motive-input").value.toLowerCase();

  let result = "";

  if (killer.includes("хозяйка") && method.includes("отравленный чай") && motive.includes("наследство")) {
    result = "Правильно! Хозяйка отравила жертву ради наследства.";
  } else {
    result = "Ошибка. Подумайте ещё...";
    if (!killer.includes("хозяйка")) result += " Неправильный убийца.";
    if (!method.includes("отравленный чай")) result += " Неправильный метод.";
    if (!motive.includes("наследство")) result += " Неправильный мотив.";
  }

  document.getElementById("final-result").textContent = result;
}

function restartGame() {
  gameState = { visited: [], completed: false };
  facts = [];
  notes = "";
  localStorage.removeItem("gameState");
  localStorage.removeItem("notes");
  showWelcome();
}

// === Инициализация событий при загрузке DOM ===

document.addEventListener("DOMContentLoaded", function () {
  // Привязываем обработчики к кнопкам
  window.showWelcome = showWelcome;
  window.showIntro = showIntro;
  window.startGame = startGame;
  window.showLocations = showLocations;
  window.showNotes = showNotes;
  window.saveNotes = saveNotes;
  window.showFacts = showFacts;
  window.showInvestigation = showInvestigation;
  window.checkFinal = checkFinal;
  window.restartGame = restartGame;

  // Показываем начальный экран
  showWelcome();
});
