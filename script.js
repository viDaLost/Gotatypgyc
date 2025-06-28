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
});
