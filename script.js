const app = document.getElementById('app');

let state = JSON.parse(localStorage.getItem('detective_state')) || {
  stage: 'menu',
  loc: null,
  clues: [],
  notes: '',
  errors: 0,
  start: null,
  finalStep: 0
};

const characters = {
  "Иван Фёдоров": "замкнутый фермер, что-то скрывает",
  "Мария Лесная": "охотница, кажется испуганной",
  "Пётр Круглов": "сын хозяина, грубый и нервный"
};

const locations = {
  "Ферма": {
    desc: "Старая ферма с покосившимся забором. Запах навоза и чего-то горелого.",
    found: false,
    clue: "обгоревший ключ",
    person: "Иван Фёдоров"
  },
  "Лес": {
    desc: "Мрачный лес, тропинки путаются. Что-то блестит в траве.",
    found: false,
    clue: "клочок ткани",
    person: "Мария Лесная"
  },
  "Сарай": {
    desc: "Развалившийся сарай. На полу тёмное пятно.",
    found: false,
    clue: "разбитая лампа",
    person: "Пётр Круглов"
  }
};

function saveState() {
  localStorage.setItem('detective_state', JSON.stringify(state));
}
function render() {
  app.innerHTML = '';

  if (state.stage === 'menu') return renderMenu();
  if (state.stage === 'map') return renderMap();
  if (state.stage === 'location') return renderLocation(state.loc);
  if (state.stage === 'journal') return renderJournal();
  if (state.stage === 'final') return renderFinal();
}

function renderMenu() {
  state.start = Date.now();
  app.innerHTML = `
    <h1>Тайна Старого Проклятия</h1>
    <button onclick="startGame()">Начать прохождение</button>
  `;
}

function startGame() {
  state.stage = 'map';
  saveState();
  render();
}
function renderMap() {
  let html = `<h2>Карта Локаций</h2><img src="assets/map.png" alt="Карта" class="map">`;
  for (let loc in locations) {
    html += `<button onclick="goToLocation('${loc}')">${loc}</button>`;
  }
  html += `<button onclick="renderJournal()">Журнал</button>`;
  html += `<button onclick="beginFinal()">Финал</button>`;
  app.innerHTML = html;
}

function goToLocation(loc) {
  state.loc = loc;
  state.stage = 'location';
  saveState();
  render();
}

function renderLocation(loc) {
  const data = locations[loc];
  let html = `<h2>${loc}</h2><div class="panel"><p>${data.desc}</p>`;

  if (!data.found) {
    html += `<button onclick="findClue('${loc}')">Осмотреть</button>`;
  } else {
    html += `<p>Улика найдена: ${data.clue}</p>`;
  }

  html += `<button onclick="talk('${data.person}')">Поговорить с ${data.person}</button>`;
  html += `<button onclick="backToMap()">Назад</button></div>`;
  app.innerHTML = html;
}

function findClue(loc) {
  const clue = locations[loc].clue;
  if (!state.clues.includes(clue)) {
    state.clues.push(clue);
  }
  locations[loc].found = true;
  saveState();
  render();
}

function talk(name) {
  alert(`${name} (${characters[name]}): "Мне нечего сказать..."`);
  if (!state.clues.includes(`разговор с ${name}`)) {
    state.clues.push(`разговор с ${name}`);
  }
  saveState();
}
function renderJournal() {
  let html = `<h2>Журнал</h2><div class="panel"><p><strong>Улики:</strong></p><ul>`;
  for (let clue of state.clues) {
    html += `<li>${clue}</li>`;
  }
  html += `</ul><p><strong>Заметки:</strong></p>
    <textarea id="notes">${state.notes}</textarea>
    <button onclick="saveNotes()">Сохранить</button>
    <button onclick="backToMap()">Назад</button></div>`;
  app.innerHTML = html;
}

function saveNotes() {
  state.notes = document.getElementById('notes').value;
  saveState();
  alert("Заметки сохранены.");
}

function backToMap() {
  state.stage = 'map';
  saveState();
  render();
}

const finale = [
  { q: "Где было совершено преступление?", correct: "Сарай" },
  { q: "Кто виновен?", correct: "Пётр Круглов" },
  { q: "Что было орудием преступления?", correct: "разбитая лампа" }
];

function beginFinal() {
  state.stage = 'final';
  state.finalStep = 0;
  render();
}

function renderFinal() {
  if (state.finalStep >= finale.length) {
    const time = Math.floor((Date.now() - state.start) / 1000);
    app.innerHTML = `<h2>Вы раскрыли дело!</h2><div class="panel">
      <p>Время: ${time} сек.</p>
      <p>Ошибок: ${state.errors}</p>
      <button onclick="resetGame()">В главное меню</button></div>`;
    return;
  }

  const step = finale[state.finalStep];
  let html = `<h2>Финал</h2><div class="panel"><p>${step.q}</p>`;
  const options = Object.keys(locations).concat(Object.keys(characters), state.clues);
  for (let o of options) {
    html += `<button onclick="chooseFinal('${o}')">${o}</button>`;
  }
  html += `</div>`;
  app.innerHTML = html;
}

function chooseFinal(choice) {
  const correct = finale[state.finalStep].correct;
  if (choice === correct) {
    state.finalStep++;
  } else {
    state.errors++;
    alert("Помощник: Подумай ещё раз.");
  }
  saveState();
  render();
}

function resetGame() {
  localStorage.removeItem('detective_state');
  location.reload();
}

render();
