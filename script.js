<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Детективная игра</title>
<style>
  body { font-family: Arial, sans-serif; padding: 10px; background: #222; color: #eee; }
  button.btn { background: #5588cc; border: none; color: white; padding: 8px 12px; margin: 3px; cursor: pointer; border-radius: 4px;}
  button.btn:hover { background: #3366aa; }
  #modal { display: none; position: fixed; top: 10%; left: 50%; transform: translateX(-50%); 
           background: #333; padding: 20px; border-radius: 8px; max-width: 90%; max-height: 70vh; overflow-y: auto; z-index: 1000; }
  #modalClose { float: right; cursor: pointer; font-weight: bold; }
  ul { padding-left: 20px; }
  #characterInfo { margin-top: 15px; }
  #sublocationList li { margin-bottom: 5px; }
  #controls { margin-top: 15px; }
</style>
</head>
<body>

<h2 id="locationTitle"></h2>
<p id="locationDescription"></p>

<ul id="sublocationList"></ul>

<div id="characterInfo"></div>

<div id="controls">
  <button id="notesButton" class="btn">Заметки</button>
  <button id="infoButton" class="btn">Информация</button>
  <button id="locationButton" class="btn">Следующая локация</button>
</div>

<div id="modal">
  <span id="modalClose">&times;</span>
  <h3 id="modalTitle"></h3>
  <div id="modalContent"></div>
</div>

<script>
// ===== ДАННЫЕ (оставим как есть) =====

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
  // остальные персонажи как в вашем коде
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
        text: "Я служу этой семье много лет.",
        options: [
          { text: "Спасибо", next: "end" }
        ]
      },
      end: {
        text: "Если нужно — я здесь.",
        options: []
      }
    }
  }
};

const locations = [
  {
    id: "hall",
    title: "Главный зал",
    description: "Большой зал с камином и креслами. Тут проходят вечеринки.",
    sublocations: [
      {
        id: "table",
        description: "Около стола лежит записка с подозрительным текстом.",
        facts: ["записка у стола"],
        isOpen: true
      },
      {
        id: "fireplace",
        description: "Камин потушен, но на поленах есть следы.",
        facts: ["следы на поленах"],
        isOpen: false
      }
    ],
    characters: ["lord_winter", "butler_james"]
  },
  {
    id: "kitchen",
    title: "Кухня",
    description: "Тёплое место с запахом свежей выпечки.",
    sublocations: [
      {
        id: "pantry",
        description: "Кладовка с закрытой дверью.",
        facts: ["закрытая кладовка"],
        isOpen: false
      },
      {
        id: "stove",
        description: "Плита горячая, кто-то недавно готовил.",
        facts: ["горячая плита"],
        isOpen: true
      }
    ],
    characters: ["maid_anna", "cook_mary"]
  }
];

// ===== Глобальные переменные =====
let currentLocationIndex = 0;
let currentDialogNode = null;
let currentDialogCharacter = null;
let notes = JSON.parse(localStorage.getItem("notes")) || [];
let facts = new Set();

// ===== Функции =====

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

function renderLocation() {
  const loc = locations[currentLocationIndex];
  document.getElementById("locationTitle").textContent = loc.title;
  document.getElementById("locationDescription").textContent = loc.description;

  // Список подлокаций
  const ul = document.getElementById("sublocationList");
  ul.innerHTML = "";
  loc.sublocations.forEach((sub, i) => {
    const li = document.createElement("li");
    li.textContent = sub.description + (sub.isOpen ? " (открыто)" : " (закрыто)");
    li.style.cursor = "pointer";
    li.onclick = () => {
      if (!sub.isOpen) {
        alert("Это место закрыто.");
        return;
      }
      // Добавить факты из подлокации
      sub.facts.forEach(f => facts.add(f));
      alert(sub.description + "\nФакты: " + sub.facts.join(", "));
    };
    ul.appendChild(li);
  });

  // Показать персонажей
  const charDiv = document.getElementById("characterInfo");
  charDiv.innerHTML = "";
  loc.characters.forEach(charId => {
    const c = characters[charId];
    const btn = document.createElement("button");
    btn.textContent = c.name;
    btn.className = "btn";
    btn.onclick = () => startDialog(charId);
    charDiv.appendChild(btn);
  });
}

function startDialog(charId) {
  currentDialogCharacter = charId;
  currentDialogNode = characters[charId].dialogueTree.start;
  showDialog();
}

function showDialog() {
  const modal = document.getElementById("modal");
  modal.style.display = "block";

  document.getElementById("modalTitle").textContent = characters[currentDialogCharacter].name;
  const contentDiv = document.getElementById("modalContent");

  // Текст реплики
  contentDiv.innerHTML = `<p>${currentDialogNode.text}</p>`;

  // Кнопки вариантов
  currentDialogNode.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.textContent = opt.text;
    btn.className = "btn";
    btn.onclick = () => {
      if (opt.next === "end") {
        closeModal();
        return;
      }
      currentDialogNode = characters[currentDialogCharacter].dialogueTree[opt.next];
      showDialog();
    };
    contentDiv.appendChild(btn);
  });

  // Если нет опций, добавить кнопку закрытия
  if (currentDialogNode.options.length === 0) {
    const btn = document.createElement("button");
    btn.textContent = "Закрыть";
    btn.className = "btn";
    btn.onclick = () => closeModal();
    contentDiv.appendChild(btn);
  }
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "none";
}

// Функция показа заметок с делегированием
function openNotes() {
  const modal = document.getElementById("modal");
  modal.style.display = "block";
  document.getElementById("modalTitle").textContent = "Заметки";
  const contentDiv = document.getElementById("modalContent");

  if (notes.length === 0) {
    contentDiv.innerHTML = "<p>Заметок нет.</p>";
  } else {
    contentDiv.innerHTML = "";
    const ul = document.createElement("ul");
    notes.forEach((note, i) => {
      const li = document.createElement("li");
      li.textContent = note;

      const delBtn = document.createElement("button");
      delBtn.textContent = "Удалить";
      delBtn.className = "btn";
      delBtn.style.marginLeft = "10px";
      delBtn.dataset.index = i; // сохраним индекс
      li.appendChild(delBtn);

      ul.appendChild(li);
    });
    contentDiv.appendChild(ul);
  }

  // Добавим поле для новой заметки
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Новая заметка";
  input.style.width = "70%";
  input.style.marginRight = "10px";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Добавить";
  addBtn.className = "btn";

  addBtn.onclick = () => {
    const val = input.value.trim();
    if (val) {
      notes.push(val);
      saveNotes();
      openNotes(); // перерисовать заново
    }
  };

  contentDiv.appendChild(input);
  contentDiv.appendChild(addBtn);
}

// Делегирование на кнопки удаления заметок
document.getElementById("modalContent").addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON" && e.target.textContent === "Удалить") {
    const idx = e.target.dataset.index;
    if (idx !== undefined) {
      notes.splice(idx, 1);
      saveNotes();
      openNotes();
    }
  }
});

// Показ информации о найденных фактах
function openInfo() {
  const modal = document.getElementById("modal");
  modal.style.display = "block";
  document.getElementById("modalTitle").textContent = "Информация";
  const contentDiv = document.getElementById("modalContent");

  if (facts.size === 0) {
    contentDiv.innerHTML = "<p>Информация отсутствует.</p>";
  } else {
    contentDiv.innerHTML = "<ul>" + Array.from(facts).map(f => `<li>${f}</li>`).join("") + "</ul>";
  }
}

// Переход к следующей локации
function nextLocation() {
  currentLocationIndex = (currentLocationIndex + 1) % locations.length;
  facts.clear();
  renderLocation();
}

// Обработчики кнопок
document.getElementById("notesButton").onclick = openNotes;
document.getElementById("infoButton").onclick = openInfo;
document.getElementById("locationButton").onclick = nextLocation;
document.getElementById("modalClose").onclick = closeModal;

// Закрыть модал, если кликнули вне контента
window.onclick = function(event) {
  const modal = document.getElementById("modal");
  if (event.target === modal) {
    closeModal();
  }
}

// Инициализация
renderLocation();

</script>

</body>
</html>
