document.addEventListener("DOMContentLoaded", () => {
  const welcomeScreen = document.getElementById("welcomeScreen");
  const app = document.getElementById("app");
  
  // === Система сохранения ===
  function loadProgress() {
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) notes = JSON.parse(savedNotes);
    
    const savedFacts = localStorage.getItem("facts");
    if (savedFacts) facts = new Set(JSON.parse(savedFacts));
    
    const savedInventory = localStorage.getItem("inventory");
    if (savedInventory) inventory = JSON.parse(savedInventory);
    
    const savedQuests = localStorage.getItem("quests");
    if (savedQuests) quests = JSON.parse(savedQuests);
    
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
    localStorage.setItem("inventory", JSON.stringify(inventory));
    localStorage.setItem("quests", JSON.stringify(quests));
    localStorage.setItem("unlockedLocations", JSON.stringify(locations.filter(l => l.unlocked).map(l => l.id)));
  }
  
  // === Персонажи ===
  const characters = {
    "maid_anna": {
      name: "Горничная Анна",
      description: "Молодая и застенчивая, но внимательная к деталям.",
      motive: "Лорд Винтер бросил её мать, когда она была маленькой. Мать умерла от нищеты.",
      dialogueTree: {
        start: {
          text: "Здравствуйте, детектив.",
          options: [
            { text: "Где вы были в ночь убийства?", next: "where" },
            { text: "Что вы думаете о хозяине?", next: "lord" },
            { text: "Покажи тайник", next: "show_secret", condition: () => inventory.includes("key") }
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
        show_secret: {
          text: "Взгляните в шкаф... Там что-то есть.",
          options: [
            { text: "Проверить", next: "check_secret" }
          ],
          onShow: () => facts.add("secret_note")
        },
        check_secret: {
          text: "Под подушкой лежит письмо: 'Тайник в сарае'",
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
    
    // Другие персонажи с обновленными диалогами...
    
    "guest_henry": {
      name: "Гость Генри",
      description: "Друг семьи Винтера, приехал за день до убийства.",
      motive: "Хотел получить наследство.",
      dialogueTree: {
        start: {
          text: "Вы уже кого-то допросили?",
          options: [
            { text: "Что вы делали в ночь убийства?", next: "where" },
            { text: "Зачем вы приехали сюда?", next: "reason" },
            { text: "Что вы знаете о наследстве?", next: "inheritance" }
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
        inheritance: {
          text: "Лорд говорил о завещании... но оно изменялось несколько раз.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        end: {
          text: "Если нужна помощь — обращайтесь.",
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
      description: "Огромный зал с высоким потолком и роскошной люстрой. Здесь царит величие поместья. В зале находится дворецкий Джеймс. Тело Лорда Винтера было найдено здесь.",
      sublocations: [
        { id: "portrait", title: "Портрет", description: "На портрете Лорд Винтер смотрит на вас с ухмылкой." },
        { id: "fireplace", title: "Камин", description: "В камине догорают угли. На полу следы крови." },
        { id: "mirror", title: "Зеркало", description: "На раме зеркала видны царапины, будто кто-то пытался что-то стереть." },
        { id: "table", title: "Столик", description: "На столике валяется старый конверт." },
        { id: "rug", title: "Ковёр", description: "Ковёр частично задран, под ним виднеется деревянный люк." }
      ],
      characters: ["butler_james"],
      unlocked: true
    },
    
    // Другие локации...
    
    {
      id: "library",
      title: "Библиотека",
      description: "Просторная библиотека, заполненная старинными томами. Здесь пахнет кожей и древесиной. В библиотеке находится библиотекарь Эмили.",
      sublocations: [
        { id: "desk", title: "Письменный стол", description: "На столе лежит исписанный лист бумаги: 'Я знаю правду'." },
        { id: "shelves", title: "Книжные полки", description: "На одной из полок спрятана записка: 'Он знал слишком много...' — возможно, это часть какой-то переписки." },
        { id: "filing_cabinet", title: "Картотека", description: "В ящике найдены документы о продаже земель поместья. Возможно, Лорд готовил крупную сделку." },
        { id: "cabinet", title: "Шкаф", description: "В шкафу лежит красивое платье — не относится к делу." },
        { id: "sofa", title: "За диваном", description: "Под диваном валяется платок с вышитыми инициалами 'А'." },
        { id: "window", title: "Окно", description: "На подоконнике следы грязи, будто кто-то недавно пролез внутрь." },
        { id: "secret_note", title: "Тайное послание", description: "Книга с застрявшим письмом: 'Моей дочери — всё наследство'.", hidden: true }
      ],
      characters: ["librarian_emily"],
      unlocked: true
    },
    
    {
      id: "garden",
      title: "Сад",
      description: "Тенистый сад с аккуратно подстриженными кустами и цветниками. Здесь легко забыть обо всём плохом. В саду находится садовник Том.",
      sublocations: [
        { id: "bench", title: "Скамья", description: "На скамье валяется перчатка." },
        { id: "shed", title: "Сарай", description: "Сарай заперт, но ключ может быть где-то рядом. Внутри — банка с химикатами.", onInteract: () => {
          if (inventory.includes("key")) {
            facts.add("Шкатулка с документами");
          }
        }},
        { id: "flowerbeds", title: "Цветники", description: "Некоторые цветы вырваны с корнем." },
        { id: "statue", title: "Статуя", description: "Статуя покрыта пятнами, похожими на кровь." },
        { id: "gate", title: "Ворота", description: "Ворота были взломаны. Следы ведут внутрь." }
      ],
      characters: ["gardener_tom"],
      unlocked: true
    },
    
    {
      id: "secret_room",
      title: "Тайная комната",
      description: "Спрятанная за книжной полкой комната с документами. Здесь можно узнать много нового.",
      sublocations: [
        { id: "documents", title: "Документы", description: "На столе лежит старый документ: 'Ребёнок вне брака, рождённый в 1895 году'." }
      ],
      characters: ["butler_james"],
      unlocked: false,
      unlockCondition: "dialogue_with_butler"
    }
  ];
  
  // === Система квестов ===
  const quests = {
    find_key: {
      title: "Найди ключ",
      description: "Найди ключ от сарая в комнате горничной",
      completed: false,
      reward: "Открыть сарай"
    },
    secret_note: {
      title: "Тайное послание",
      description: "Найди тайное послание в библиотеке",
      completed: false,
      reward: "Узнать мотив Анны"
    }
  };
  
  function updateQuest(questId) {
    quests[questId].completed = true;
    saveProgress();
    alert(`Квест завершён: ${quests[questId].title}`);
  }
  
  // === Система инвентаря ===
  let inventory = JSON.parse(localStorage.getItem("inventory")) || [];
  
  function addToInventory(item) {
    if (!inventory.includes(item)) {
      inventory.push(item);
      saveProgress();
      alert(`Добавлено в инвентарь: ${item}`);
    }
  }
  
  // === Логика открытия локаций ===
  function checkUnlockConditions() {
    const hasLibraryNote = facts.has("Тайное послание");
    const hasGardenDocuments = facts.has("Шкатулка с документами");
    
    if (hasLibraryNote && hasGardenDocuments && !locations.find(l => l.id === "secret_room").unlocked) {
      locations.find(l => l.id === "secret_room").unlocked = true;
      alert("Открыта новая локация: Тайная комната");
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
      li.className = "flex-1 basis-[45%] cursor-pointer bg-gray-700 p-2 rounded hover:bg-gray-600";
      li.textContent = sub.title;
      li.onclick = () => showSublocationDetails(sub);
      ul.appendChild(li);
    });
    
    const charDiv = document.getElementById("characterInfo");
    charDiv.innerHTML = "";
    loc.characters.forEach(charId => {
      const c = characters[charId];
      const btn = document.createElement("button");
      btn.className = "bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded w-full mb-2";
      btn.textContent = c.name;
      btn.onclick = () => startDialog(charId);
      charDiv.appendChild(btn);
    });
  }
  
  // === Открытие модального окна с подлокацией ===
  function showSublocationDetails(sub) {
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalContent = document.getElementById("modalContent");
    modal.classList.remove("hidden");
    modalTitle.textContent = sub.title;
    
    if (sub.hidden) {
      if (facts.has("secret_note") && sub.id === "secret_note") {
        sub.hidden = false;
        sub.description = "Книга с застрявшим письмом: 'Моей дочери — всё наследство'.";
      } else {
        return;
      }
    }
    
    modalContent.innerHTML = `
      <p>${sub.description}</p>
      <button class="mt-4 bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded w-full">Закрыть</button>
    `;
    
    if (sub.onInteract) sub.onInteract();
    
    modalContent.querySelector("button").onclick = () => {
      facts.add(sub.description);
      saveProgress();
      closeModal();
    };
  }
  
  // === Диалоги ===
  function startDialog(charId) {
    currentDialogCharacter = charId;
    currentDialogNode = characters[charId].dialogueTree.start;
    showDialog();
  }
  
  function showDialog() {
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const contentDiv = document.getElementById("modalContent");
    modal.classList.remove("hidden");
    modalTitle.textContent = characters[currentDialogCharacter].name;
    contentDiv.innerHTML = "";
    
    const p = document.createElement("p");
    p.className = "mb-4";
    p.textContent = currentDialogNode.text;
    contentDiv.appendChild(p);
    
    if (currentDialogNode.onShow && typeof currentDialogNode.onShow === "function") {
      currentDialogNode.onShow();
    }
    
    currentDialogNode.options?.forEach(opt => {
      if (opt.condition && !opt.condition()) return;
      
      const btn = document.createElement("button");
      btn.className = "bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded w-full mb-2";
      btn.textContent = opt.text;
      btn.onclick = () => {
        if (opt.next === "end") {
          closeModal();
        } else {
          currentDialogNode = characters[currentDialogCharacter].dialogueTree[opt.next];
          showDialog();
        }
      };
      contentDiv.appendChild(btn);
    });
    
    const closeBtn = document.createElement("button");
    closeBtn.className = "mt-2 bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded w-full";
    closeBtn.textContent = "Закрыть";
    closeBtn.onclick = closeModal;
    contentDiv.appendChild(closeBtn);
  }
  
  // === Открытие локации после диалога ===
  function unlockLocationById(id) {
    const location = locations.find(l => l.id === id);
    if (location && !location.unlocked) {
      location.unlocked = true;
      saveProgress();
      alert(`Открыта новая локация: ${location.title}`);
    }
  }
  
  // === Закрытие модального окна ===
  function closeModal() {
    document.getElementById("modal").classList.add("hidden");
  }
  
  // === Функции для кнопок ===
  function openNotes() {
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalContent = document.getElementById("modalContent");
    modal.classList.remove("hidden");
    modalTitle.textContent = "Заметки";
    modalContent.innerHTML = "";
    
    if (notes.length === 0) {
      modalContent.innerHTML = "<p>Заметок пока нет.</p>";
    } else {
      const ul = document.createElement("ul");
      notes.forEach((note, i) => {
        const li = document.createElement("li");
        li.className = "mb-2 flex items-center justify-between";
        li.textContent = note;
        const delBtn = document.createElement("button");
        delBtn.className = "bg-red-600 text-white px-2 py-1 rounded ml-2 text-sm";
        delBtn.textContent = "Удалить";
        delBtn.onclick = () => {
          notes.splice(i, 1);
          saveProgress();
          openNotes();
        };
        li.appendChild(delBtn);
        ul.appendChild(li);
      });
      modalContent.appendChild(ul);
    }
    
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Новая заметка";
    input.className = "w-full bg-gray-700 text-white px-3 py-2 rounded mt-4";
    modalContent.appendChild(input);
    
    const addBtn = document.createElement("button");
    addBtn.className = "mt-2 bg-green-600 text-white px-4 py-2 rounded w-full";
    addBtn.textContent = "Добавить заметку";
    addBtn.onclick = () => {
      const val = input.value.trim();
      if (val) {
        notes.push(val);
        saveProgress();
        openNotes();
      }
    };
    modalContent.appendChild(addBtn);
  }
  
  function openInfo() {
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalContent = document.getElementById("modalContent");
    modal.classList.remove("hidden");
    modalTitle.textContent = "Информация";
    modalContent.innerHTML = "";
    
    if (facts.size === 0) {
      modalContent.innerHTML = "<p>Информации пока нет.</p>";
    } else {
      const ul = document.createElement("ul");
      Array.from(facts).forEach(f => {
        const li = document.createElement("li");
        li.textContent = f;
        ul.appendChild(li);
      });
      modalContent.appendChild(ul);
    }
  }
  
  function openInventory() {
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalContent = document.getElementById("modalContent");
    modal.classList.remove("hidden");
    modalTitle.textContent = "Инвентарь";
    modalContent.innerHTML = "";
    
    if (inventory.length === 0) {
      modalContent.innerHTML = "<p>Инвентарь пуст.</p>";
    } else {
      const ul = document.createElement("ul");
      inventory.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        ul.appendChild(li);
      });
      modalContent.appendChild(ul);
    }
  }
  
  function openLocationSelector() {
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalContent = document.getElementById("modalContent");
    modal.classList.remove("hidden");
    modalTitle.textContent = "Выбор локации";
    modalContent.innerHTML = "";
    locations.filter(l => l.unlocked).forEach(loc => {
      const btn = document.createElement("button");
      btn.className = "bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded w-full mb-2";
      btn.textContent = loc.title;
      btn.onclick = () => {
        currentLocationIndex = locations.indexOf(loc);
        renderLocation();
        closeModal();
      };
      modalContent.appendChild(btn);
    });
  }
  
  function showVerdictForm() {
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalContent = document.getElementById("modalContent");
    modal.classList.remove("hidden");
    modalTitle.textContent = "Вынести вердикт";
    modalContent.innerHTML = `
      <form class="verdict-form">
        <label for="verdict-suspect">Преступление совершил:</label>
        <select id="verdict-suspect" class="w-full bg-gray-700 text-white px-3 py-2 rounded mb-4">
          ${Object.values(characters).map(c => `<option value="${c.motive}">${c.name}</option>`).join("")}
        </select>
        
        <label for="verdict-time">Преступление было совершено:</label>
        <select id="verdict-time" class="w-full bg-gray-700 text-white px-3 py-2 rounded mb-4">
          <option value="ночь">ночь</option>
          <option value="утро">утро</option>
          <option value="день">день</option>
        </select>
        
        <label for="verdict-weapon">Орудием послужило:</label>
        <select id="verdict-weapon" class="w-full bg-gray-700 text-white px-3 py-2 rounded mb-4">
          <option value="нож">нож</option>
          <option value="отрава">отрава</option>
          <option value="пистолет">пистолет</option>
        </select>
        
        <label for="verdict-motive">Преступление было совершено из-за:</label>
        <select id="verdict-motive" class="w-full bg-gray-700 text-white px-3 py-2 rounded mb-4">
          <option value="финансовые махинации">финансовые махинации</option>
          <option value="ревность">ревность</option>
          <option value="тайны прошлого">тайны прошлого</option>
        </select
