document.addEventListener("DOMContentLoaded", () => {
  const welcomeScreen = document.getElementById("welcomeScreen");
  const app = document.getElementById("app");

  // === Система сохранения ===
  function loadProgress() {
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) notes = JSON.parse(savedNotes);

    const savedFacts = localStorage.getItem("facts");
    if (savedFacts) facts = new Set(JSON.parse(savedFacts));

    const savedUnlocked = localStorage.getItem("unlockedLocations");
    if (savedUnlocked) {
      const unlockedIds = JSON.parse(savedUnlocked);
      locations.forEach(loc => {
        loc.unlocked = unlockedIds.includes(loc.id);
      });
    }
  }

  function saveProgress() {
    localStorage.setItem("notes", JSON.stringify(notes));
    localStorage.setItem("facts", JSON.stringify(Array.from(facts)));
    localStorage.setItem("unlockedLocations", JSON.stringify(locations.filter(l => l.unlocked).map(l => l.id)));
  }

  // === Приветствие при запуске ===
  if (welcomeScreen && app) {
    welcomeScreen.classList.remove("hidden");
    app.classList.add("hidden");

    const startButton = document.getElementById("startGameButton");
    if (startButton) {
      startButton.addEventListener("click", () => {
        welcomeScreen.classList.add("hidden");
        app.classList.remove("hidden");
        loadProgress();
        renderLocation();
      });
    }
  }

  // === Персонажи ===
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
    },
    "gardener_tom": {
      name: "Садовник Том",
      description: "Тихий и незаметный, но всё знает о поместье.",
      motive: "Знал о тайном хранении документов в саду.",
      dialogueTree: {
        start: {
          text: "Вы ко мне?",
          options: [
            { text: "Что вы делали в ночь убийства?", next: "night" },
            { text: "Что вы можете рассказать о саду?", next: "garden" }
          ]
        },
        night: {
          text: "Я работал в теплице. Видел свет в библиотеке.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        garden: {
          text: "Там есть тайник... раньше там хранили документы.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        end: {
          text: "Если нужно — я помогу.",
          options: []
        }
      }
    },
    "librarian_emily": {
      name: "Библиотекарь Эмили",
      description: "Интроверт, живущий среди книг. Замкнутый, но умный.",
      motive: "Узнала о тайной переписке Лорда.",
      dialogueTree: {
        start: {
          text: "Зачем вы пришли в библиотеку?",
          options: [
            { text: "Что вы знаете о Лорде?", next: "know_lord" },
            { text: "Можно взглянуть на книги?", next: "books" }
          ]
        },
        know_lord: {
          text: "Он часто прятал документы между страницами.",
          options: [
            { text: "Интересно", next: "end" }
          ]
        },
        books: {
          text: "Только аккуратно. Книги — мой мир.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        end: {
          text: "Если понадобится помощь — я рядом.",
          options: []
        }
      }
    },
    "nurse_claire": {
      name: "Медсестра Клэр",
      description: "Женщина средних лет, работает в поместье много лет.",
      motive: "Знает о болезни Лорда Винтера.",
      dialogueTree: {
        start: {
          text: "Здравствуйте, детектив.",
          options: [
            { text: "Вы лечили Лорда?", next: "treated" },
            { text: "Как вы относились к нему?", next: "relationship" }
          ]
        },
        treated: {
          text: "Да, но он не слушал меня.",
          options: [
            { text: "Почему?", next: "why" }
          ]
        },
        why: {
          text: "Он считал себя выше медицины.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        relationship: {
          text: "Он платил хорошо, но не ценил людей.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        end: {
          text: "Если понадоблюсь — зовите.",
          options: []
        }
      }
    },
    "guest_henry": {
      name: "Гость Генри",
      description: "Друг семьи Винтера, приехал за день до убийства.",
      motive: "Хотел получить наследство.",
      dialogueTree: {
        start: {
          text: "Вы уже кого-то допросили?",
          options: [
            { text: "Что вы делали в ночь убийства?", next: "where" },
            { text: "Зачем вы приехали сюда?", next: "reason" }
          ]
        },
        where: {
          text: "Спокойно спал. Проверьте комнату.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        reason: {
          text: "Лорд просил совета. Но я не ожидал такого поворота.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        end: {
          text: "Если нужна помощь — обращайтесь.",
          options: []
        }
      }
    },
    "servant_george": {
      name: "Слуга Джордж",
      description: "Работает в поместье с юности.",
      motive: "Знал о планах Лорда Винтера.",
      dialogueTree: {
        start: {
          text: "Вы ищете убийцу?",
          options: [
            { text: "Вы видели что-нибудь?", next: "saw" },
            { text: "Кто был недоволен Лордом?", next: "angry" }
          ]
        },
        saw: {
          text: "Кто-то выходил из библиотеки около полуночи.",
          options: [
            { text: "Кто?", next: "who" }
          ]
        },
        who: {
          text: "Не разглядел. Было темно.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        angry: {
          text: "Многие. Особенно те, кто знал правду.",
          options: [
            { text: "Правду о чём?", next: "truth" }
          ]
        },
        truth: {
          text: "О финансовых махинациях. Это было опасно.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        end: {
          text: "Если нужно — я рядом.",
          options: []
        }
      }
    }
  };

  // === Локации ===
  const locations = [
    {
      id: "hall",
      title: "Главный зал",
      description: "Большой зал с камином и креслами. Тут проходят вечеринки.",
      sublocations: [
        { id: "table", description: "На столе валяется старый конверт.", infoType: "useful", isOpen: true },
        { id: "fireplace", description: "Камин потушен, но на поленах есть следы.", infoType: "useful", isOpen: false }
      ],
      characters: ["lord_winter", "butler_james"],
      unlocked: true
    },
    {
      id: "kitchen",
      title: "Кухня",
      description: "Тёплое место с запахом свежей выпечки.",
      sublocations: [
        { id: "pantry", description: "Кладовка с закрытой дверью.", infoType: "distraction", isOpen: false },
        { id: "stove", description: "Плита горячая, кто-то недавно готовил.", infoType: "useful", isOpen: true }
      ],
      characters: ["maid_anna", "cook_mary"],
      unlocked: true
    },
    {
      id: "library",
      title: "Библиотека",
      description: "Комната, забитая книгами. Здесь можно найти много интересного.",
      sublocations: [
        { id: "shelves", description: "На полках стоят старинные тома.", infoType: "useful", isOpen: true },
        { id: "desk", description: "За столом валяется исписанный лист бумаги.", infoType: "useful", isOpen: true }
      ],
      characters: ["librarian_emily"],
      unlocked: true
    },
    {
      id: "garden",
      title: "Сад",
      description: "Тихое место, где можно найти много интересного.",
      sublocations: [
        { id: "bench", description: "На скамье валяется перчатка.", infoType: "useful", isOpen: true },
        { id: "shed", description: "Сарай заперт, но ключ может быть где-то рядом.", infoType: "distraction", isOpen: false }
      },
      characters: ["gardener_tom"],
      unlocked: true
    },
    {
      id: "greenhouse",
      title: "Оранжерея",
      description: "Теплица с редкими растениями. Часто используется для встреч.",
      sublocations: [
        { id: "plants", description: "Цветы выглядят необычно — будто их трогали.", infoType: "useful", isOpen: true },
        { id: "bench_greenhouse", description: "На скамье лежит старый блокнот.", infoType: "useful", isOpen: true }
      },
      characters: ["gardener_tom"],
      unlocked: true
    },
    {
      id: "basement",
      title: "Подвал",
      description: "Темное помещение, в котором пахнет сыростью.",
      sublocations: [
        { id: "boxes", description: "В ящиках валяются старые вещи.", infoType: "useful", isOpen: true },
        { id: "key", description: "На стене висит ключ.", infoType: "useful", isOpen: true }
      },
      characters: ["servant_george"],
      unlocked: true
    },
    {
      id: "maid_room",
      title: "Комната горничной",
      description: "Маленькая, уютная комната с кроватью и шкафом.",
      sublocations: [
        { id: "bed", description: "Под подушкой лежит письмо.", infoType: "useful", isOpen: true },
        { id: "wardrobe", description: "В шкафу лежит красивое платье.", infoType: "distraction", isOpen: true }
      ],
      characters: ["maid_anna"],
      unlocked: true
    },
    {
      id: "secret_room",
      title: "Тайная комната",
      description: "Спрятанная за книжной полкой комната с документами.",
      sublocations: [
        { id: "documents", description: "На столе лежат финансовые документы.", infoType: "useful", isOpen: true }
      ],
      characters: ["butler_james"],
      unlocked: false,
      unlockCondition: "dialogue_with_butler"
    },
    {
      id: "attic",
      title: "Чёрдак",
      description: "Заброшенное место, полное пыли и воспоминаний.",
      sublocations: [
        { id: "trunk", description: "В углу стоит старый сундук.", infoType: "useful", isOpen: true }
      ],
      characters: ["nurse_claire"],
      unlocked: false,
      unlockCondition: "visited_library_and_kitchen"
    },
    {
      id: "cellar",
      title: "Погреб",
      description: "Запах сырости и старых бутылок вина.",
      sublocations: [
        { id: "wine", description: "На стене висит карта подземелья.", infoType: "useful", isOpen: true }
      ],
      characters: ["guest_henry"],
      unlocked: false,
      unlockCondition: "found_key_in_basement"
    }
  ];

  let currentLocationIndex = 0;
  let currentDialogNode = null;
  let currentDialogCharacter = null;
  let notes = JSON.parse(localStorage.getItem("notes")) || [];
  let facts = new Set(JSON.parse(localStorage.getItem("facts")) || []);
  let discoveredClues = {
    suspects: [],
    times: [],
    weapons: [],
    motives: []
  };

  // === Открытие локаций по условию ===
  function checkUnlockConditions() {
    const hasVisitedLibraryAndKitchen = facts.has("старинные книги") && facts.has("горячая плита");
    const foundKeyInBasement = facts.has("ключ от погреба");

    if (hasVisitedLibraryAndKitchen && !locations.find(l => l.id === "attic").unlocked) {
      locations.find(l => l.id === "attic").unlocked = true;
      alert("Открыт новый уровень: Чёрдак");
    }

    if (foundKeyInBasement && !locations.find(l => l.id === "cellar").unlocked) {
      locations.find(l => l.id === "cellar").unlocked = true;
      alert("Открыт новый уровень: Погреб");
    }
  }

  // === Рендер текущей локации ===
  function renderLocation() {
    checkUnlockConditions();

    const loc = locations[currentLocationIndex];
    document.getElementById("locationTitle").textContent = loc.title;
    document.getElementById("locationDescription").textContent = loc.description;

    const ul = document.getElementById("sublocationList");
    ul.innerHTML = "";
    loc.sublocations.forEach(sub => {
      const li = document.createElement("li");
      li.className = "flex-1 basis-[45%] cursor-pointer";
      li.textContent = sub.description + (sub.isOpen ? " (открыто)" : " (закрыто)");
      li.onclick = () => {
        if (!sub.isOpen) {
          alert("Это место закрыто.");
          return;
        }
        facts.add(sub.facts[0]);
        saveProgress();
        alert(`${sub.description} | Информация: ${sub.infoType}`);
      };
      ul.appendChild(li);
    });

    const charDiv = document.getElementById("characterInfo");
    charDiv.innerHTML = "";
    loc.characters.forEach(charId => {
      const c = characters[charId];
      const btn = document.createElement("button");
      btn.className = "bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded-lg hover:gold-bg-hover transition w-full mb-2";
      btn.textContent = c.name;
      btn.onclick = () => startDialog(charId);
      charDiv.appendChild(btn);
    });
  }

  // === Диалоги ===
  function startDialog(charId) {
    currentDialogCharacter = charId;
    currentDialogNode = characters[charId].dialogueTree.start;
    showDialog();

    // Открытие локаций после диалога
    if (charId === "butler_james") {
      unlockLocationById("secret_room");
    }
  }

  function showDialog() {
    const modal = document.getElementById("modal");
    modal.classList.remove("hidden");
    document.getElementById("modalTitle").textContent = characters[currentDialogCharacter].name;
    const contentDiv = document.getElementById("modalContent");
    contentDiv.innerHTML = "";

    const p = document.createElement("p");
    p.className = "mb-4";
    p.textContent = currentDialogNode.text;
    contentDiv.appendChild(p);

    currentDialogNode.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded-lg hover:gold-bg-hover transition w-full mb-2";
      btn.textContent = opt.text;
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

    if (currentDialogNode.options.length === 0) {
      const btn = document.createElement("button");
      btn.className = "bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded-lg hover:gold-bg-hover transition w-full";
      btn.textContent = "Закрыть";
      btn.onclick = () => closeModal();
      contentDiv.appendChild(btn);
    }
  }

  function unlockLocationById(id) {
    const location = locations.find(l => l.id === id);
    if (location && !location.unlocked) {
      location.unlocked = true;
      saveProgress();
      alert(`Открыта новая локация: ${location.title}`);
    }
  }

  function closeModal() {
    document.getElementById("modal").classList.add("hidden");
  }

  // === Выбор локации ===
  function openLocationSelector() {
    const modal = document.getElementById("modal");
    modal.classList.remove("hidden");
    document.getElementById("modalTitle").textContent = "Выбор локации";
    const contentDiv = document.getElementById("modalContent");
    contentDiv.innerHTML = "";
    locations.filter(l => l.unlocked).forEach((loc, i) => {
      const btn = document.createElement("button");
      btn.className = "bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded-lg hover:gold-bg-hover transition w-full mb-2";
      btn.textContent = loc.title;
      btn.onclick = () => {
        currentLocationIndex = locations.indexOf(loc);
        renderLocation();
        closeModal();
      };
      contentDiv.appendChild(btn);
    });
  }

  // === Вердикт ===
  function showVerdictForm() {
    const modal = document.getElementById("modal");
    modal.classList.remove("hidden");
    document.getElementById("modalTitle").textContent = "Вынести вердикт";
    document.getElementById("modalContent").innerHTML = `
      <form class="verdict-form">
        <label for="verdict-suspect">Преступление совершил:</label>
        <select id="verdict-suspect" class="w-full bg-gray-700 text-white px-3 py-2 rounded-lg mb-4">
          ${Object.values(characters).map(c => `<option value="${c.motive}">${c.name}</option>`).join("")}
        </select>
        <label for="verdict-time">Преступление было совершено:</label>
        <select id="verdict-time" class="w-full bg-gray-700 text-white px-3 py-2 rounded-lg mb-4">
          <option value="ночь">ночь</option>
          <option value="утро">утро</option>
          <option value="день">день</option>
        </select>
        <label for="verdict-weapon">Орудием послужило:</label>
        <select id="verdict-weapon" class="w-full bg-gray-700 text-white px-3 py-2 rounded-lg mb-4">
          <option value="нож">нож</option>
          <option value="отрава">отрава</option>
          <option value="пистолет">пистолет</option>
        </select>
        <label for="verdict-motive">Преступление было совершено из-за:</label>
        <select id="verdict-motive" class="w-full bg-gray-700 text-white px-3 py-2 rounded-lg mb-4">
          <option value="финансовые махинации">финансовые махинации</option>
          <option value="ревность">ревность</option>
          <option value="тайны прошлого">тайны прошлого</option>
        </select>
        <button type="button" id="confirm-verdict" class="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg w-full">Подтвердить</button>
      </form>
    `;
    document.getElementById("confirm-verdict").onclick = () => {
      const suspect = document.getElementById("verdict-suspect").value;
      const time = document.getElementById("verdict-time").value;
      const weapon = document.getElementById("verdict-weapon").value;
      const motive = document.getElementById("verdict-motive").value;

      if (
        suspect.includes("Винтер") &&
        time === "ночь" &&
        weapon === "нож" &&
        motive === "финансовые махинации"
      ) {
        alert("Дело раскрыто! Поздравляем!");
      } else {
        alert("Ваше предположение неверно. Продолжите расследование.");
      }
      closeModal();
    };
  }

  // === Открытие подлокаций ===
  function showSublocationDetails(sub) {
    const modal = document.getElementById("modal");
    modal.classList.remove("hidden");
    document.getElementById("modalTitle").textContent = sub.title;
    const contentDiv = document.getElementById("modalContent");
    contentDiv.innerHTML = `<p>${sub.description}</p><p class="text-xs mt-2 italic">${sub.infoType}</p>`;
  }

  // === Заметки ===
  function openNotes() {
    const modal = document.getElementById("modal");
    modal.classList.remove("hidden");
    document.getElementById("modalTitle").textContent = "Заметки";
    const contentDiv = document.getElementById("modalContent");
    contentDiv.innerHTML = "";
    if (notes.length === 0) {
      contentDiv.innerHTML = "<p>Заметок нет.</p>";
    } else {
      const ul = document.createElement("ul");
      notes.forEach((note, i) => {
        const li = document.createElement("li");
        li.className = "mb-2 flex items-center";
        li.textContent = note;
        const delBtn = document.createElement("button");
        delBtn.className = "bg-gray-700 gold-text border-2 gold-border px-2 py-1 rounded-lg ml-2";
        delBtn.textContent = "Удалить";
        delBtn.dataset.index = i;
        li.appendChild(delBtn);
        ul.appendChild(li);
      });
      contentDiv.appendChild(ul);
    }

    const div = document.createElement("div");
    div.className = "flex mt-4";
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Новая заметка";
    input.className = "flex-grow bg-gray-700 text-white px-3 py-2 rounded-l-lg focus:outline-none";
    const addBtn = document.createElement("button");
    addBtn.className = "bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded-r-lg";
    addBtn.textContent = "Добавить";
    addBtn.onclick = () => {
      const val = input.value.trim();
      if (val) {
        notes.push(val);
        saveProgress();
        openNotes();
      }
    };
    div.appendChild(input);
    div.appendChild(addBtn);
    contentDiv.appendChild(div);
  }

  // === Информация ===
  function openInfo() {
    const modal = document.getElementById("modal");
    modal.classList.remove("hidden");
    document.getElementById("modalTitle").textContent = "Информация";
    const contentDiv = document.getElementById("modalContent");
    if (facts.size === 0) {
      contentDiv.innerHTML = "<p>Информации пока нет.</p>";
    } else {
      contentDiv.innerHTML = "<ul class='list-disc pl-5'>" + Array.from(facts).map(f => `<li>${f}</li>`).join("") + "</ul>";
    }
  }

  // === Обработчики событий ===
  document.getElementById("notesButton").onclick = openNotes;
  document.getElementById("infoButton").onclick = openInfo;
  document.getElementById("locationButton").onclick = openLocationSelector;
  document.getElementById("verdictButton").onclick = showVerdictForm;
  document.getElementById("modalClose").onclick = closeModal;

  window.onclick = e => {
    const modal = document.getElementById("modal");
    if (e.target === modal) closeModal();
  };

  renderLocation();
});
