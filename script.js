document.addEventListener("DOMContentLoaded", () => {
  const welcomeScreen = document.getElementById("welcomeScreen");
  const app = document.getElementById("app");

  // Показываем приветствие при загрузке
  welcomeScreen.classList.remove("hidden");
  app.classList.add("hidden");

  // Обработчик кнопки "Начать игру"
  document.getElementById("startGameButton").onclick = () => {
    welcomeScreen.classList.add("hidden");
    app.classList.remove("hidden");
    renderLocation();
  };

  // ===== ДАННЫЕ =====
  const characters = {
    "lord_winter": {
      name: "Лорд Винтер",
      description: "Хозяин поместья. Строгий и холодный, скрывает много тайн.",
      motive: "Опасался, что кто-то из слуг раскроет его финансовые махинации.",
      dialogueTree: {
        start: { text: "Вы хотите задать мне вопрос?", options: [{ text: "Расскажите о вашем алиби", next: "alibi" }, { text: "Кто мог быть убийцей?", next: "suspect" }] },
        alibi: { text: "Я был в библиотеке. Джеймс может это подтвердить.", options: [{ text: "А где была горничная?", next: "maid" }, { text: "Спасибо", next: "end" }] },
        suspect: { text: "Не могу сказать точно... но я бы проверил кухню.", options: [{ text: "Хорошо", next: "end" }] },
        maid: { text: "Она часто шлялась по ночам… не люблю это.", options: [{ text: "Спасибо", next: "end" }] },
        end: { text: "Если у вас больше нет вопросов — прощайте.", options: [] }
      }
    },
    "maid_anna": {
      name: "Горничная Анна",
      description: "Молодая и застенчивая, но внимательная к деталям.",
      motive: "Боялась потерять работу из-за тайных прогулок по ночам.",
      dialogueTree: {
        start: { text: "Здравствуйте, детектив.", options: [{ text: "Где вы были в ночь убийства?", next: "where" }, { text: "Что вы можете рассказать о хозяине?", next: "lord" }] },
        where: { text: "Я убиралась в сарае... ничего не видела.", options: [{ text: "Правда?", next: "doubt" }] },
        doubt: { text: "Ну... возможно, я что-то слышала...", options: [{ text: "Продолжайте", next: "continue" }] },
        continue: { text: "Кто-то двигал ящики... но я не стала подходить.", options: [{ text: "Хорошо", next: "end" }] },
        lord: { text: "Он всегда был строг... но он хороший человек.", options: [{ text: "Хорошо", next: "end" }] },
        end: { text: "Если будут ещё вопросы — спрашивайте.", options: [] }
      }
    },
    "cook_mary": {
      name: "Повар Мария",
      description: "Добродушная женщина с крепкими связями в округе.",
      motive: "Могла иметь секретные связи с местным контрабандистом.",
      dialogueTree: {
        start: { text: "Добрый день, детектив.", options: [{ text: "Вы заметили что-нибудь странное?", next: "strange" }, { text: "Кто убил Лорда?", next: "killer" }] },
        strange: { text: "Ночью кто-то заглядывал в кладовку.", options: [{ text: "Кто?", next: "who" }] },
        who: { text: "Не знаю... но слышала шаги.", options: [{ text: "Хорошо", next: "end" }] },
        killer: { text: "Не могу знать этого. Я просто повар.", options: [{ text: "Хорошо", next: "end" }] },
        end: { text: "Если будет нужно — я помогу.", options: [] }
      }
    },
    "butler_james": {
      name: "Дворецкий Джеймс",
      description: "Верный слуга с таинственным прошлым.",
      motive: "Хотел защитить семью от посторонних.",
      dialogueTree: {
        start: { text: "Вы хотели со мной поговорить?", options: [{ text: "Что вы делали в ночь убийства?", next: "night" }, { text: "Вы знаете что-нибудь важное?", next: "important" }] },
        night: { text: "Я осматривал окрестности. Ничего необычного не видел.", options: [{ text: "А кто-нибудь входил?", next: "entered" }] },
        entered: { text: "Не уверен... но кто-то был.", options: [{ text: "Хорошо", next: "end" }] },
        important: { text: "Да, но не уверен, стоит ли говорить об этом сейчас.", options: [{ text: "Прошу вас", next: "please" }] },
        please: { text: "Я нашёл старую записку в библиотеке... она может вам помочь.", options: [{ text: "Хорошо", next: "end" }] },
        end: { text: "Если нужно — я здесь.", options: [] }
      }
    },
    "gardener_tom": {
      name: "Садовник Том",
      description: "Тихий и незаметный, но всё знает о поместье.",
      motive: "Знал о тайном хранении документов в саду.",
      dialogueTree: {
        start: { text: "Вы ко мне?", options: [{ text: "Что вы делали в ночь убийства?", next: "night" }, { text: "Что вы можете рассказать о саду?", next: "garden" }] },
        night: { text: "Я работал в теплице. Видел свет в библиотеке.", options: [{ text: "Хорошо", next: "end" }] },
        garden: { text: "Там есть тайник... раньше там хранили документы.", options: [{ text: "Хорошо", next: "end" }] },
        end: { text: "Если нужно — я помогу.", options: [] }
      }
    }
  };

  const locations = [
    {
      id: "hall",
      title: "Главный зал",
      description: "Большой зал с камином и креслами. Тут проходят вечеринки.",
      sublocations: [
        { id: "table", description: "Около стола лежит записка с подозрительным текстом.", facts: ["записка у стола"], isOpen: true },
        { id: "fireplace", description: "Камин потушен, но на поленах есть следы.", facts: ["следы на поленах"], isOpen: false }
      ],
      characters: ["lord_winter", "butler_james"],
      unlocked: true
    },
    {
      id: "kitchen",
      title: "Кухня",
      description: "Тёплое место с запахом свежей выпечки.",
      sublocations: [
        { id: "pantry", description: "Кладовка с закрытой дверью.", facts: ["закрытая кладовка"], isOpen: false },
        { id: "stove", description: "Плита горячая, кто-то недавно готовил.", facts: ["горячая плита"], isOpen: true }
      ],
      characters: ["maid_anna", "cook_mary"],
      unlocked: false,
      unlockCondition: "dialogue_with_cook_mary"
    },
    {
      id: "garden",
      title: "Сад",
      description: "Тихое место, где можно найти много интересного.",
      sublocations: [
        { id: "bench", description: "На скамье валяется перчатка.", facts: ["перчатка на скамье"], isOpen: true },
        { id: "shed", description: "Сарай заперт, но ключ может быть где-то рядом.", facts: ["запертый сарай"], isOpen: false }
      ],
      characters: ["gardener_tom"],
      unlocked: false,
      unlockCondition: "dialogue_with_gardener_tom"
    }
  ];

  let currentLocationIndex = 0;
  let currentDialogNode = null;
  let currentDialogCharacter = null;
  let notes = JSON.parse(localStorage.getItem("notes")) || [];
  let facts = new Set();
  let discoveredClues = {
    suspects: [],
    times: [],
    weapons: [],
    motives: []
  };

  function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(notes));
  }

  function renderLocation() {
    const loc = locations[currentLocationIndex];
    document.getElementById("locationTitle").textContent = loc.title;
    document.getElementById("locationDescription").textContent = loc.description;

    const ul = document.getElementById("sublocationList");
    ul.innerHTML = "";
    loc.sublocations.forEach((sub) => {
      const li = document.createElement("li");
      li.className = "flex-1 basis-[45%] cursor-pointer";
      li.textContent = sub.description + (sub.isOpen ? " (открыто)" : " (закрыто)");
      li.onclick = () => {
        if (!sub.isOpen) {
          alert("Это место закрыто.");
          return;
        }
        sub.facts.forEach(f => facts.add(f));
        alert(sub.description + "\nФакты: " + sub.facts.join(", "));
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

  function startDialog(charId) {
    currentDialogCharacter = charId;
    currentDialogNode = characters[charId].dialogueTree.start;
    showDialog();

    // Открываем локацию после разговора
    if (charId === "cook_mary") {
      locations[1].unlocked = true;
    } else if (charId === "gardener_tom") {
      locations[2].unlocked = true;
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

    currentDialogNode.options.forEach((opt) => {
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

  function closeModal() {
    document.getElementById("modal").classList.add("hidden");
  }

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
        delBtn.className = "bg-gray-700 gold-text border-2 gold-border px-2 py-1 rounded-lg hover:gold-bg-hover transition ml-2";
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
    addBtn.className = "bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded-r-lg hover:gold-bg-hover transition";
    addBtn.textContent = "Добавить";
    addBtn.onclick = () => {
      const val = input.value.trim();
      if (val) {
        notes.push(val);
        saveNotes();
        openNotes();
      }
    };
    div.appendChild(input);
    div.appendChild(addBtn);
    contentDiv.appendChild(div);
  }

  function openInfo() {
    const modal = document.getElementById("modal");
    modal.classList.remove("hidden");
    document.getElementById("modalTitle").textContent = "Информация";
    const contentDiv = document.getElementById("modalContent");
    if (facts.size === 0) {
      contentDiv.innerHTML = "<p>Информация отсутствует.</p>";
    } else {
      contentDiv.innerHTML = "<ul class='list-disc pl-5'>" + Array.from(facts).map(f => `<li>${f}</li>`).join("") + "</ul>";
    }
  }

  function openLocationSelector() {
    const modal = document.getElementById("modal");
    modal.classList.remove("hidden");
    document.getElementById("modalTitle").textContent = "Выбор локации";
    const contentDiv = document.getElementById("modalContent");
    contentDiv.innerHTML = "";

    locations.forEach((loc, index) => {
      if (!loc.unlocked) return;
      const btn = document.createElement("button");
      btn.className = "bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded-lg hover:gold-bg-hover transition w-full mb-2";
      btn.textContent = loc.title;
      btn.onclick = () => {
        currentLocationIndex = index;
        facts.clear();
        renderLocation();
        closeModal();
      };
      contentDiv.appendChild(btn);
    });
  }

  function showVerdictForm() {
    const modal = document.getElementById("modal");
    modal.classList.remove("hidden");
    document.getElementById("modalTitle").textContent = "Вынести вердикт";
    const contentDiv = document.getElementById("modalContent");
    contentDiv.innerHTML = `
      <p class="mb-4">В ходе расследования было выяснено:</p>
      <label class="block mb-2">Преступление совершил:</label>
      <select id="verdict-suspect" class="w-full bg-gray-700 text-white px-3 py-2 rounded-lg mb-4">
        ${discoveredClues.suspects.map(s => `<option value="${s}">${characters[s].name}</option>`).join("")}
      </select>
      <label class="block mb-2">Преступление было совершено:</label>
      <select id="verdict-time" class="w-full bg-gray-700 text-white px-3 py-2 rounded-lg mb-4">
        ${discoveredClues.times.map(t => `<option value="${t}">${t}</option>`).join("")}
      </select>
      <label class="block mb-2">Орудием послужило:</label>
      <select id="verdict-weapon" class="w-full bg-gray-700 text-white px-3 py-2 rounded-lg mb-4">
        ${discoveredClues.weapons.map(w => `<option value="${w}">${w}</option>`).join("")}
      </select>
      <label class="block mb-2">Мотив:</label>
      <select id="verdict-motive" class="w-full bg-gray-700 text-white px-3 py-2 rounded-lg mb-4">
        ${discoveredClues.motives.map(m => `<option value="${m}">${m}</option>`).join("")}
      </select>
      <button id="confirm-verdict" class="bg-green-600 text-white px-4 py-2 rounded-lg w-full">Подтвердить</button>
    `;
  }

  document.getElementById("confirm-verdict")?.addEventListener("click", () => {
    const suspect = document.getElementById("verdict-suspect").value;
    const time = document.getElementById("verdict-time").value;
    const weapon = document.getElementById("verdict-weapon").value;
    const motive = document.getElementById("verdict-motive").value;

    if (suspect === "lord_winter" && time === "ночь" && weapon === "нож" && motive === "финансовые махинации") {
      alert("Дело раскрыто! Поздравляем!");
    } else {
      alert("Ваше предположение неверно. Продолжите расследование.");
    }
    closeModal();
  });

  function closeModalOnClickOutside(event) {
    const modal = document.getElementById("modal");
    if (event.target === modal) {
      closeModal();
    }
  }

  // ===== Обработчики событий =====
  document.getElementById("notesButton").onclick = openNotes;
  document.getElementById("infoButton").onclick = openInfo;
  document.getElementById("locationButton").onclick = openLocationSelector;
  document.getElementById("verdictButton").onclick = showVerdictForm;
  document.getElementById("modalClose").onclick = closeModal;
  window.onclick = closeModalOnClickOutside;

  // Делегирование удаления заметок
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

  renderLocation();
});
