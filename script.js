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
    id: "library",
    name: "Библиотека",
    description: "Комната, полная древних книг и документов. Тут много пыли и запаха старой кожи.",
    sublocations: [
      { id: "desk", name: "Осмотреть письменный стол", description: "Стол покрыт бумагами и пером." },
      { id: "bookshelf", name: "Осмотреть книжный шкаф", description: "Шкаф полон фолиантов, некоторые книги выглядят недавно перелистнутыми." },
      { id: "window", name: "Осмотреть окно", description: "Окно с видом на сад, немного приоткрыто." }
    ],
    character: "lord_winter"
  },
  {
    id: "kitchen",
    name: "Кухня",
    description: "Большое помещение с множеством кухонных принадлежностей. Запах свежей выпечки наполняет воздух.",
    sublocations: [
      { id: "stove", name: "Осмотреть печь", description: "Печь все еще теплая." },
      { id: "cupboard", name: "Осмотреть шкаф", description: "В шкафу много посуды и банок с консервами." },
      { id: "door", name: "Осмотреть заднюю дверь", description: "Дверь ведет в сад." }
    ],
    character: "cook_mary"
  },
  {
    id: "garden",
    name: "Сад",
    description: "Большой ухоженный сад с цветами и кустарниками. Здесь тихо и спокойно.",
    sublocations: [
      { id: "bench", name: "Осмотреть скамейку", description: "На скамейке лежит записка." },
      { id: "fountain", name: "Осмотреть фонтан", description: "Фонтан тихо журчит." },
      { id: "path", name: "Осмотреть дорожку", description: "Дорожка ведет к калитке." }
    ],
    character: "neighbor_smith"
  }
];

// ========== ПЕРЕМЕННЫЕ ==========
let currentLocationIndex = 0;
let discoveredInfo = [];
let notes = [];
let currentDialogueCharacter = null;

// ========== ЭЛЕМЕНТЫ ==========
const mainContent = document.getElementById("mainContent");
const locationTitle = document.getElementById("locationTitle");
const locationDescription = document.getElementById("locationDescription");
const sublocationList = document.getElementById("sublocationList");
const characterInfo = document.getElementById("characterInfo");
const notesButton = document.getElementById("notesButton");
const infoButton = document.getElementById("infoButton");
const locationButton = document.getElementById("locationButton");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");
const modalClose = document.getElementById("modalClose");

// ========== ФУНКЦИИ ==========
function renderLocation() {
  const loc = locations[currentLocationIndex];
  locationTitle.textContent = loc.name;
  locationDescription.textContent = loc.description;
  sublocationList.innerHTML = "";
  loc.sublocations.forEach(subloc => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = subloc.name;
    btn.className = "btn";
    btn.onclick = () => showSublocationDetails(subloc);
    li.appendChild(btn);
    sublocationList.appendChild(li);
  });

  renderCharacter(loc.character);
}

function renderCharacter(charId) {
  if (!charId || !characters[charId]) {
    characterInfo.innerHTML = "<p>Нет персонажа в этой локации.</p>";
    return;
  }
  const char = characters[charId];
  characterInfo.innerHTML = `
    <h3>${char.name}</h3>
    <p>${char.description}</p>
    <p><b>Мотив:</b> ${char.motive}</p>
    <button class="btn" id="talkBtn">Поговорить</button>
  `;

  document.getElementById("talkBtn").onclick = () => {
    currentDialogueCharacter = charId;
    startDialogue(charId);
  };
}

function showSublocationDetails(subloc) {
  showModal(subloc.name, `
    <p>${subloc.description}</p>
  `);
  addDiscoveredInfo(`${subloc.name}: ${subloc.description}`);
}

function addDiscoveredInfo(info) {
  if (!discoveredInfo.includes(info)) {
    discoveredInfo.push(info);
  }
}

function showModal(title, content) {
  modalTitle.textContent = title;
  modalContent.innerHTML = content;
  modal.style.display = "block";
}

function closeModal() {
  modal.style.display = "none";
}

// ====== ЗАМЕТКИ ======
function openNotes() {
  let notesHtml = "";
  if (notes.length === 0) {
    notesHtml = "<p>Заметок пока нет.</p>";
  } else {
    notesHtml = "<ul>";
    notes.forEach((note, i) => {
      notesHtml += `<li>${note} <button class="btn" data-index="${i}" id="delNote${i}">Удалить</button></li>`;
    });
    notesHtml += "</ul>";
  }
  notesHtml += `
    <input type="text" id="newNoteInput" placeholder="Новая заметка" style="width:80%; margin-top:10px;">
    <button class="btn" id="addNoteBtn">Добавить заметку</button>
  `;

  showModal("Заметки", notesHtml);

  document.getElementById("addNoteBtn").onclick = () => {
    const input = document.getElementById("newNoteInput");
    const val = input.value.trim();
    if (val) {
      notes.push(val);
      input.value = "";
      openNotes(); // Обновить список
    }
  };

  notes.forEach((_, i) => {
    const delBtn = document.getElementById(`delNote${i}`);
    if (delBtn) {
      delBtn.onclick = () => {
        notes.splice(i, 1);
        openNotes();
      };
    }
  });
}

// ====== ИНФОРМАЦИЯ ======
function openInfo() {
  if (discoveredInfo.length === 0) {
    showModal("Информация", "<p>Вы пока ничего не изучили.</p>");
  } else {
    const infoHtml = "<ul>" + discoveredInfo.map(info => `<li>${info}</li>`).join("") + "</ul>";
    showModal("Информация", infoHtml);
  }
}

// ====== ВЫБОР ЛОКАЦИИ ======
function openLocationSelector() {
  let listHtml = "<ul>";
  locations.forEach((loc, idx) => {
    listHtml += `<li><button class="btn" data-idx="${idx}">${loc.name}</button></li>`;
  });
  listHtml += "</ul>";
  showModal("Выбор локации", listHtml);

  locations.forEach((_, idx) => {
    const btn = modalContent.querySelector(`button[data-idx="${idx}"]`);
    if (btn) {
      btn.onclick = () => {
        currentLocationIndex = idx;
        renderLocation();
        closeModal();
      };
    }
  });
}

// ====== ДИАЛОГИ ======
function startDialogue(charId) {
  showDialogue(charId, "start");
}

function showDialogue(charId, stateKey) {
  const char = characters[charId];
  const state = char.dialogueTree[stateKey];
  if (!state) {
    closeModal();
    return;
  }

  let optionsHtml = "";
  if (state.options.length > 0) {
    optionsHtml = state.options.map(opt =>
      `<button class="btn dialogue-option" data-next="${opt.next}">${opt.text}</button>`
    ).join("");
  } else {
    optionsHtml = `<button class="btn" id="endDialogueBtn">Закончить разговор</button>`;
  }

  showModal(char.name, `
    <p><b>${char.name}:</b> ${state.text}</p>
    <div>${optionsHtml}</div>
  `);

  const optionButtons = modalContent.querySelectorAll(".dialogue-option");
  optionButtons.forEach(btn => {
    btn.onclick = () => {
      const nextState = btn.getAttribute("data-next");
      showDialogue(charId, nextState);
    };
  });

  const endBtn = document.getElementById("endDialogueBtn");
  if (endBtn) {
    endBtn.onclick = () => {
      closeModal();
    };
  }
}

// ========== СОБЫТИЯ ==========
modalClose.onclick = closeModal;

window.onclick = function(event) {
  if (event.target == modal) {
    closeModal();
  }
};

notesButton.onclick = openNotes;
infoButton.onclick = openInfo;
locationButton.onclick = openLocationSelector;

// ========== ЗАПУСК ==========
renderLocation();
