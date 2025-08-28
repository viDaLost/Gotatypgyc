// script.js — детектив с реплеябельностью, сложностью, доверием, журналом и таймером (без звука/вибро)
document.addEventListener("DOMContentLoaded", () => {
  // ===== DOM (ожидается в HTML) =====
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalContent = document.getElementById("modalContent");
  const app = document.getElementById("app");

  // ===== Ключи LS =====
  const LS_NOTES = "notes";
  const LS_FACTS = "facts";
  const LS_FACT_LABELS = "factLabels";
  const LS_INVENTORY = "inventory";
  const LS_QUESTS = "quests";
  const LS_UNLOCKED = "unlockedLocations";
  const LS_LOCATION = "currentLocationIndex";
  const LS_TRUTH = "truth_v2";
  const LS_SETTINGS = "settings_v2";
  const LS_JOURNAL = "journal_v2";
  const LS_TRUST = "trust_v2";
  const LS_TIME = "time_v2";
  const LS_INSIGHT = "insight_v2";
  const LS_SAVE_SLOT = (n) => `save_slot_${n}_v2`;

  // ===== Параметры сложности =====
  const DIFFICULTY_PRESETS = {
    easy:   { actionsPerPhase: 10, fakeClues: 1, strictUnlocks: false, startInsight: 3 },
    normal: { actionsPerPhase: 7,  fakeClues: 2, strictUnlocks: true,  startInsight: 2 },
    hard:   { actionsPerPhase: 5,  fakeClues: 3, strictUnlocks: true,  startInsight: 1 }
  };
  // читаем ?difficulty=easy|normal|hard
  const urlParams = new URLSearchParams(location.search);
  const chosenDifficulty = (urlParams.get("difficulty") || "normal").toLowerCase();
  const DIFF = DIFFICULTY_PRESETS[chosenDifficulty] || DIFFICULTY_PRESETS.normal;

  // ===== Состояние =====
  let notes = [];
  let facts = new Set();
  let factLabels = {};
  let inventory = [];
  let currentLocationIndex = 0;
  let currentDialogCharacter = null;
  let currentDialogNode = null;

  // доверие/подозрение: 0–100 (старт 50)
  let trust = {}; // { charId: number }
  // журнал дедукции: массив записей с узлами и рёбрами
  let journal = []; // [{type:'fact'|'inference', key, label, from?: [keys], rule?: string, ts}]
  // тайминг
  const PHASES = ["evening", "night", "morning"]; // 3 фазы
  let timeState = { day: 1, phaseIndex: 0, actionsLeft: DIFF.actionsPerPhase };
  // подсказки
  let insight = DIFF.startInsight;

  // ===== Истина дела (генерируется каждый новый запуск игры) =====
  // пулы
  const POOL = {
    killers: ["librarian_emily", "guest_henry", "butler_james", "maid_anna"],
    times: ["ночь", "утро", "день"],
    weapons: ["отрава", "нож", "пистолет"],
    motives: ["тайны прошлого", "ревность", "финансовые махинации"]
  };
  let TRUTH = null; // {killer,time,weapon,motive,seed}

  // ===== Утилиты =====
  const toast = (msg) => alert(msg); // заменяй на свой UI-тост при желании
  const nowTs = () => Date.now();

  const save = () => {
    localStorage.setItem(LS_NOTES, JSON.stringify(notes));
    localStorage.setItem(LS_FACTS, JSON.stringify(Array.from(facts)));
    localStorage.setItem(LS_FACT_LABELS, JSON.stringify(factLabels));
    localStorage.setItem(LS_INVENTORY, JSON.stringify(inventory));
    localStorage.setItem(LS_QUESTS, JSON.stringify(quests));
    localStorage.setItem(LS_UNLOCKED, JSON.stringify(locations.filter(l => l.unlocked).map(l => l.id)));
    localStorage.setItem(LS_LOCATION, String(currentLocationIndex));
    localStorage.setItem(LS_TRUTH, JSON.stringify(TRUTH));
    localStorage.setItem(LS_SETTINGS, JSON.stringify({ difficulty: chosenDifficulty }));
    localStorage.setItem(LS_JOURNAL, JSON.stringify(journal));
    localStorage.setItem(LS_TRUST, JSON.stringify(trust));
    localStorage.setItem(LS_TIME, JSON.stringify(timeState));
    localStorage.setItem(LS_INSIGHT, String(insight));
  };
  const addFact = (key, label, fromKeys = []) => {
    if (!facts.has(key)) {
      facts.add(key);
      if (label) factLabels[key] = label;
      journal.push({ type: "fact", key, label: label || key, from: fromKeys, ts: nowTs() });
      save();
    }
  };
  const addInference = (key, label, fromKeys, rule = "") => {
    if (!facts.has(key)) {
      facts.add(key);
      if (label) factLabels[key] = label;
      journal.push({ type: "inference", key, label: label || key, from: fromKeys, rule, ts: nowTs() });
      save();
    }
  };
  const hasFacts = (...keys) => keys.every(k => facts.has(k));
  const addItem = (item) => {
    if (!inventory.includes(item)) {
      inventory.push(item);
      toast(`Получен предмет: ${item}`);
      save();
    }
  };
  const adjustTrust = (charId, delta) => {
    trust[charId] = Math.max(0, Math.min(100, (trust[charId] ?? 50) + delta));
    save();
  };
  const payAction = (cost = 1) => {
    if (timeState.actionsLeft < cost) {
      toast("У вас закончились действия в этой фазе. Переход к следующей фазе.");
      nextPhase();
      return false;
    }
    timeState.actionsLeft -= cost;
    save();
    return true;
  };
  const nextPhase = () => {
    timeState.phaseIndex++;
    if (timeState.phaseIndex >= PHASES.length) {
      timeState.phaseIndex = 0;
      timeState.day++;
    }
    timeState.actionsLeft = DIFF.actionsPerPhase;
    toast(`Наступила фаза: ${PHASES[timeState.phaseIndex]} (День ${timeState.day}).`);
    save();
  };

  // ===== Генерация дела и фальш-улики =====
  function randomPick(arr, rng) { return arr[(rng() * arr.length) | 0]; }
  function seededRNG(seed) {
    let s = seed >>> 0; // xorshift32
    return function() {
      s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
      return ((s >>> 0) / 0xFFFFFFFF);
    };
  }
  function initTruthOrLoad() {
    const stored = localStorage.getItem(LS_TRUTH);
    if (stored) {
      TRUTH = JSON.parse(stored);
      return;
    }
    const seed = (Math.random() * 1e9) | 0;
    const rng = seededRNG(seed);
    // чтобы пазл всегда решался логично — ограничим убийцу: у каждого есть реалистичный мотив и способ
    const killer = randomPick(POOL.killers, rng);
    const time = randomPick(POOL.times, rng);
    const weapon = randomPick(POOL.weapons, rng);
    // мотивы подбираем с приоритетами для правдоподобия
    let motive = "тайны прошлого";
    if (killer === "guest_henry") motive = "финансовые махинации";
    else if (killer === "maid_anna") motive = "тайны прошлого";
    else if (killer === "butler_james") motive = randomPick(["ревность","финансовые махинации"], rng);
    TRUTH = { killer, time, weapon, motive, seed };
    save();

    // Сгенерим фальш-улики: записываем их как факты, но они логически опровергаются контр-фактами
    // Кол-во зависит от сложности
    const candidates = [
      { key: "false:james_blood", label: "Кровавое пятно на перчатке Джеймса", against: "fact:no_fight" },
      { key: "false:henry_receipt", label: "Квитанция о покупке яда Генри", against: "fact:henry_meds" },
      { key: "false:anna_knife", label: "Нож в комнате Анны", against: "fact:weapon_poison_signs" },
      { key: "false:emily_gunpowder", label: "Сажа от выстрела у Эмили", against: "fact:weapon_poison_signs" }
    ];
    const rng2 = seededRNG(seed ^ 0x9E3779B9);
    for (let i = 0; i < DIFF.fakeClues; i++) {
      const pick = randomPick(candidates, rng2);
      addFact(pick.key, pick.label);
      // позже игрок может добыть контр-факт against и обнулить ложный след
    }
  }

  // ===== Персонажи =====
  const characters = {
    butler_james: {
      name: "Дворецкий Джеймс",
      motive: "Сомнительная роль в завещании.",
      dialogueTree: {
        start: {
          text: "Добрый вечер, детектив.",
          options: [
            { text: "Ваше алиби?", next: "alibi" },
            { text: "Ключ от кабинета?", next: "key" },
            { text: "Кого вы подозреваете?", next: "suspects" },
            { text: "Позже.", next: "end" }
          ]
        },
        alibi: {
          text: "Был на кухне у поставок. Повар подтвердит.",
          options: [
            { text: "Проверю у Марии.", next: "end", onChoose: () => addFact("fact:james_alibi", "Алиби Джеймса: был на кухне.") }
          ]
        },
        key: {
          text: () => trust["butler_james"] >= 55 ? "Возьмите ключ. Надеюсь, это поможет." : "Не уверен, стоит ли…",
          options: [
            { 
              text: "Дайте ключ (убедить)", 
              next: "end",
              condition: () => trust["butler_james"] >= 55 || hasFacts("fact:deliveries"),
              onChoose: () => { addItem("key_study"); adjustTrust("butler_james", 2); }
            }
          ]
        },
        suspects: {
          text: "Эмили и Генри имели причины.",
          options: [
            { text: "Почему Эмили?", next: "why_emily" },
            { text: "Почему Генри?", next: "why_henry" }
          ]
        },
        why_emily: {
          text: "Её могли уволить. Она была в отчаянии.",
          options: [
            { text: "Записал.", next: "end", onChoose: () => addFact("fact:emily_motive", "Эмили рисковала потерять работу.") }
          ]
        },
        why_henry: {
          text: "Завещание менялось не в его пользу.",
          options: [
            { text: "Понятно.", next: "end", onChoose: () => addFact("fact:henry_motive", "Генри мог лишиться наследства.") }
          ]
        },
        end: { text: "Я рядом, если понадоблюсь.", options: [] }
      }
    },

    maid_anna: {
      name: "Горничная Анна",
      motive: "Старые обиды семьи.",
      dialogueTree: {
        start: {
          text: () => trust["maid_anna"] >= 60 ? "Я скажу правду. Помогите мне." : "Здравствуйте…",
          options: [
            { text: "Где были ночью?", next: "night" },
            { text: "Слышали что-то?", next: "heard" },
            { text: "Есть тайники?", next: "secret", condition: () => inventory.includes("key_shed") || inventory.includes("key_study") }
          ]
        },
        night: {
          text: "У заднего входа. Слышала шорохи у сарая.",
          options: [
            { text: "Продолжайте", next: "night2" }
          ]
        },
        night2: {
          text: "Будто ящики двигали.",
          options: [
            { text: "Записал", next: "end", onChoose: () => { addFact("fact:shed_noises", "Ночью в сарае двигали ящики."); adjustTrust("maid_anna", +5); } }
          ]
        },
        heard: {
          text: "Последнее время Лорд получал угрозы.",
          options: [
            { text: "Где они?", next: "letters" }
          ]
        },
        letters: {
          text: "В кабинете. Но часть пропала.",
          options: [
            { text: "Хм…", next: "end", onChoose: () => addFact("fact:letters_missing", "Часть угроз исчезла из кабинета.") }
          ]
        },
        secret: {
          text: () => trust["maid_anna"] >= 60 ? "На втором ярусе шкафа есть полка." : "Не знаю, можно ли говорить…",
          options: [
            { text: "Мы на вашей стороне", next: "secret2", onChoose: () => adjustTrust("maid_anna", +5) }
          ]
        },
        secret2: {
          text: "Там подсказка о тайной комнате.",
          options: [
            { text: "Проверю.", next: "end", onChoose: () => addFact("fact:secret_room_hint", "Подсказка о тайной комнате за полкой.") }
          ]
        },
        end: { text: "Спасибо.", options: [] }
      }
    },

    guest_henry: {
      name: "Генри",
      motive: "Наследство под угрозой.",
      dialogueTree: {
        start: {
          text: "Вы хотите знать правду?",
          options: [
            { text: "Алиби?", next: "alibi" },
            { text: "Про завещание", next: "will" },
            { text: "Про Эльзу", next: "elsa" }
          ]
        },
        alibi: {
          text: "Спал. Слуга мог заметить.",
          options: [
            { text: "Проверю.", next: "end", onChoose: () => addFact("fact:henry_alibi", "Генри утверждает, что спал.") }
          ]
        },
        will: {
          text: "Последняя версия была не в мою пользу.",
          options: [
            { text: "Записал.", next: "end", onChoose: () => addFact("fact:will_changes", "Завещание менялось день убийства.") }
          ]
        },
        elsa: {
          text: () => trust["guest_henry"] >= 55 ? "Эльза — его дочь. Он хотел всё оставить ей." : "Не могу говорить об этом.",
          options: [
            { text: "Почему молчите?", next: "elsa2" }
          ]
        },
        elsa2: {
          text: "Слишком много слухов. Но это правда.",
          options: [
            { text: "Понял.", next: "end", onChoose: () => { addFact("fact:elsa_daughter", "Эльза — внебрачная дочь Лорда."); adjustTrust("guest_henry", +3); } }
          ]
        },
        end: { text: "Обратитесь, если что.", options: [] }
      }
    },

    librarian_emily: {
      name: "Эмили",
      motive: "Угроза увольнения/закрытия библиотеки.",
      dialogueTree: {
        start: {
          text: "Это ужасно…",
          options: [
            { text: "Алиби?", next: "alibi" },
            { text: "Письма с угрозами?", next: "letters" },
            { text: "Почему закрытие?", next: "closure" }
          ]
        },
        alibi: {
          text: "Была в каталоге — одна.",
          options: [
            { text: "Кто подтвердит?", next: "end", onChoose: () => addFact("fact:emily_weak_alibi", "У Эмили слабое алиби.") }
          ]
        },
        letters: {
          text: "Помогала раскладывать корреспонденцию. Часть исчезла.",
          options: [
            { text: "Где искать?", next: "end", onChoose: () => addFact("fact:letters_missing", "Из кабинета пропали письма с угрозами.") }
          ]
        },
        closure: {
          text: "Лорд считал библиотеку роскошью.",
          options: [
            { text: "Сочувствую.", next: "end", onChoose: () => addFact("fact:emily_motive2", "Закрытие библиотеки — удар для Эмили.") }
          ]
        },
        end: { text: "…", options: [] }
      }
    },

    gardener_tom: {
      name: "Том",
      motive: "Конфликт из-за бюджета и удобрений.",
      dialogueTree: {
        start: {
          text: "Сад требует терпения.",
          options: [
            { text: "Ночные звуки?", next: "noises" },
            { text: "Ключ от сарая?", next: "key" },
            { text: "Про окно в библиотеке", next: "window" }
          ]
        },
        noises: {
          text: "Да, ящики двигали.",
          options: [
            { text: "Кто?", next: "who" }
          ]
        },
        who: {
          text: "Следы маленькие, аккуратные.",
          options: [
            { text: "Записал", next: "end", onChoose: () => addFact("fact:small_footprints", "Маленькие аккуратные следы у сарая.") }
          ]
        },
        key: {
          text: () => trust["gardener_tom"] >= 55 ? "Держите ключ. Только аккуратно." : "Ключ должен быть в безопасности.",
          options: [
            { text: "Очень нужно (убеждение)", next: "end", onChoose: () => { if (trust["gardener_tom"] >= 55) { addItem("key_shed"); } else { adjustTrust("gardener_tom", +7); if (trust["gardener_tom"] >= 55) { addItem("key_shed"); } else toast("Том пока не доверяет вам ключ."); } } }
          ]
        },
        window: {
          text: "Из сада удобно попасть через библиотечное окно.",
          options: [
            { text: "Спасибо.", next: "end", onChoose: () => addFact("fact:library_window", "Через окно библиотеки легко проникнуть из сада.") }
          ]
        },
        end: { text: "Не затаптывайте клумбы.", options: [] }
      }
    },

    chef_maria: {
      name: "Мария",
      motive: "Сокращения бюджета коснулись кухни.",
      dialogueTree: {
        start: {
          text: "Вам что-то нужно? У меня мало времени.",
          options: [
            { text: "Подтвердите алиби Джеймса", next: "confirm" },
            { text: "Кто был на кухне ночью?", next: "night" }
          ]
        },
        confirm: {
          text: "Да, Джеймс проверял поставки.",
          options: [
            { text: "Спасибо.", next: "end", onChoose: () => addFact("fact:james_alibi_confirmed", "Повар подтвердила алиби Джеймса.") }
          ]
        },
        night: {
          text: "Ближе к полуночи видела Эмили — говорила про чай.",
          options: [
            { text: "Записал.", next: "end", onChoose: () => addFact("fact:emily_at_night", "Эмили видели около полуночи.") }
          ]
        },
        end: { text: "Дайте готовить.", options: [] }
      }
    },

    doctor_gray: {
      name: "Доктор Грей",
      motive: "—",
      dialogueTree: {
        start: {
          text: "Осмотр завершён.",
          options: [
            { text: "Время смерти?", next: "time" },
            { text: "Признаки борьбы?", next: "fight" },
            { text: "Признаки оружия?", next: "weapon" }
          ]
        },
        time: {
          text: "Около полуночи.",
          options: [
            { text: "Понял.", next: "end", onChoose: () => addFact("fact:time_midnight", "Время смерти — около полуночи.") }
          ]
        },
        fight: {
          text: "Следов борьбы почти нет.",
          options: [
            { text: "Записал.", next: "end", onChoose: () => addFact("fact:no_fight", "Следов борьбы нет — тихое убийство.") }
          ]
        },
        weapon: {
          text: "Симптоматика ближе к отравлению.",
          options: [
            { text: "Записал.", next: "end", onChoose: () => addFact("fact:weapon_poison_signs", "Признаки отравления.") }
          ]
        },
        end: { text: "Сообщу при новых данных.", options: [] }
      }
    },

    daughter_elsa: {
      name: "Эльза",
      motive: "Непризнание в прошлом.",
      dialogueTree: {
        start: {
          text: "Он хотел всё исправить…",
          options: [
            { text: "Где были ночью?", next: "alibi" },
            { text: "Он изменил завещание?", next: "will" }
          ]
        },
        alibi: {
          text: "В гостевой. Слышала лёгкие женские шаги.",
          options: [
            { text: "Чьи?", next: "end", onChoose: () => addFact("fact:light_steps", "Лёгкие женские шаги в коридоре ночью.") }
          ]
        },
        will: {
          text: "Да, он хотел всё оставить мне.",
          options: [
            { text: "Записал.", next: "end", onChoose: () => addFact("fact:elsa_beneficiary", "Эльза — бенефициар последней версии.") }
          ]
        },
        end: { text: "Я помогу, чем смогу.", options: [] }
      }
    }
  };

  // стартовое доверие
  Object.keys(characters).forEach(id => { trust[id] = trust[id] ?? 50; });

  // ===== Локации =====
  const locations = [
    {
      id: "hall",
      title: "Главный зал",
      description: "Здесь нашли тело Лорда Винтера.",
      sublocations: [
        { id: "portrait", title: "Портрет", description: "Насмешливый взгляд Лорда.", onInteract: () => addFact("fact:portrait", "Портрет с ухмылкой — тщеславие Лорда.") },
        { id: "fireplace", title: "Камин", description: "Угли догорают, на пепле травяные крупинки.", onInteract: () => addFact("fact:ash_spots", "У камина крупинки трав — намёк на настой.") },
        { id: "table", title: "Столик", description: "Конверт с травяным запахом.", onInteract: () => addFact("fact:herbal_smell", "Запах трав — возможный яд.") },
        { id: "rug", title: "Ковёр", description: "Сдвинут к кабинету.", onInteract: () => addFact("fact:drag_mark", "След волочения к кабинету.") }
      ],
      characters: ["butler_james", "doctor_gray"],
      unlocked: true
    },
    {
      id: "library",
      title: "Библиотека",
      description: "Старинные тома, пыль и тишина.",
      sublocations: [
        { id: "desk", title: "Стол", description: "Черновик: «Я знаю правду».", onInteract: () => addFact("fact:i_know_truth", "Записка: «Я знаю правду».") },
        { id: "shelves", title: "Полки", description: "Записка: «Он знал слишком много…».", onInteract: () => addFact("fact:too_much", "Кто-то знал слишком много.") },
        { id: "window", title: "Окно", description: "Грязь на подоконнике.", onInteract: () => addFact("fact:window_mud", "Через окно проникали из сада.") },
        { id: "secret_note", title: "Тайное послание", description: "Книга с письмом «Моей дочери — всё наследство».", hidden: true, onInteract: () => addFact("fact:note_daughter", "Письмо: «Моей дочери — всё наследство».") }
      ],
      characters: ["librarian_emily"],
      unlocked: true
    },
    {
      id: "garden",
      title: "Сад",
      description: "Кусты и дорожки.",
      sublocations: [
        { id: "bench", title: "Скамья", description: "Перчатка.", onInteract: () => addItem("glove") },
        { id: "shed", title: "Сарай", description: "Заперт, внутри химикаты.", onInteract: () => {
            if (!payAction()) return;
            if (inventory.includes("key_shed")) {
              addFact("fact:shed_chem", "В сарае — химикаты (яд).");
              addItem("vial_poison");
              completeQuest("find_key");
            } else toast("Нужен ключ от сарая.");
          } 
        },
        { id: "flowerbeds", title: "Цветники", description: "Некоторые растения вырваны.", onInteract: () => addFact("fact:plants_torn", "Вырваны травы — возможно, для настоя.") },
        { id: "gate", title: "Ворота", description: "Следы малых ботинок.", onInteract: () => addFact("fact:small_footprints_gate", "Малые следы у ворот ведут в дом.") }
      ],
      characters: ["gardener_tom"],
      unlocked: true
    },
    {
      id: "kitchen",
      title: "Кухня",
      description: "Запах пряностей и кипятка.",
      sublocations: [
        { id: "storeroom", title: "Кладовая", description: "Ящики с поставками.", onInteract: () => addFact("fact:deliveries", "Поставки вечером, Джеймс проверял.") },
        { id: "kettle", title: "Чайник", description: "Накипь свежая — ночью кипятили воду.", onInteract: () => addFact("fact:night_kettle", "Чайник включали ночью.") }
      ],
      characters: ["chef_maria"],
      unlocked: true
    },
    {
      id: "guest_room",
      title: "Гостевая",
      description: "Комната Генри.",
      sublocations: [
        { id: "bag", title: "Сумка", description: "Пустые лекарственные флаконы.", onInteract: () => addFact("fact:henry_meds", "Лекарства маскируют запах, но не яд.") }
      ],
      characters: ["guest_henry"],
      unlocked: true
    },
    {
      id: "study",
      title: "Кабинет",
      description: "Заперт. Нужен ключ.",
      sublocations: [
        { id: "safe", title: "Сейф", description: "Старые документы.", onInteract: () => addFact("fact:safe_docs", "Старые документы, завещания нет.") },
        { id: "desk_drawer", title: "Стол — ящик", description: "Пустая папка «Завещание».", onInteract: () => addFact("fact:will_folder_empty", "Папка «Завещание» пуста.") },
        { id: "letters", title: "Корреспонденция", description: "Часть угроз исчезла.", onInteract: () => addFact("fact:threats_gone", "Из кабинета исчезли угрозы.") }
      ],
      characters: ["butler_james"],
      unlocked: false,
      unlockCondition: () => inventory.includes("key_study")
    },
    {
      id: "maid_room",
      title: "Комната горничной",
      description: "Скромно и чисто.",
      sublocations: [
        { id: "pillow", title: "Под подушкой", description: "Письмо: «Тайник в сарае».", onInteract: () => {
            addFact("fact:note_shed", "Письмо: «Тайник в сарае».");
            if (!inventory.includes("key_shed")) addFact("fact:key_hint", "Где-то есть ключ от сарая.");
          } }
      ],
      characters: ["maid_anna"],
      unlocked: true
    },
    {
      id: "cellar",
      title: "Погреб",
      description: "Прохладно и сыро.",
      sublocations: [
        { id: "barrels", title: "Бочки", description: "Одна пахнет травами.", onInteract: () => addFact("fact:barrel_herbal", "Запах травяного настоя в бочке.") }
      ],
      characters: [],
      unlocked: false,
      unlockCondition: () => hasFacts("fact:night_kettle") || hasFacts("fact:barrel_herbal")
    },
    {
      id: "secret_room",
      title: "Тайная комната",
      description: "За книжной полкой.",
      sublocations: [
        { id: "documents", title: "Документы", description: "Запись: «Ребёнок вне брака, 1895».", onInteract: () => addFact("fact:illegitimate", "Запись о внебрачном ребёнке (Эльза).") },
        { id: "vial", title: "Флакон", description: "Пустой флакон с травами.", onInteract: () => addFact("fact:empty_vial", "Пустой флакон из-под настоя.") }
      ],
      characters: ["daughter_elsa"],
      unlocked: false,
      unlockCondition: () => hasFacts("fact:secret_room_hint") || (hasFacts("fact:letters_missing") && hasFacts("fact:window_mud"))
    }
  ];

  // ===== Квесты =====
  let quests = {
    find_key: { title: "Найти ключ", description: "Найти ключ от сарая.", completed: false, reward: "Доступ к сараю" },
    secret_note: { title: "Тайная комната", description: "Найти подсказку о тайной комнате.", completed: false, reward: "Открыть тайную комнату" }
  };
  const completeQuest = (id) => {
    if (quests[id] && !quests[id].completed) {
      quests[id].completed = true;
      toast(`Квест завершён: ${quests[id].title}`);
      save();
    }
  };

  // ===== Загрузка/инициализация =====
  function load() {
    try {
      notes = JSON.parse(localStorage.getItem(LS_NOTES) || "[]");
      facts = new Set(JSON.parse(localStorage.getItem(LS_FACTS) || "[]"));
      factLabels = JSON.parse(localStorage.getItem(LS_FACT_LABELS) || "{}");
      inventory = JSON.parse(localStorage.getItem(LS_INVENTORY) || "[]");
      const qs = JSON.parse(localStorage.getItem(LS_QUESTS) || "null");
      if (qs) quests = { ...quests, ...qs };
      const unlockedIds = JSON.parse(localStorage.getItem(LS_UNLOCKED) || "[]");
      locations.forEach(loc => { if (unlockedIds.includes(loc.id)) loc.unlocked = true; });
      const locIdx = parseInt(localStorage.getItem(LS_LOCATION) || "0", 10);
      if (!Number.isNaN(locIdx) && locations[locIdx]) currentLocationIndex = locIdx;
      const t = JSON.parse(localStorage.getItem(LS_TRUTH) || "null");
      if (t) TRUTH = t;
      journal = JSON.parse(localStorage.getItem(LS_JOURNAL) || "[]");
      trust = JSON.parse(localStorage.getItem(LS_TRUST) || "{}");
      const ts = JSON.parse(localStorage.getItem(LS_TIME) || "null");
      if (ts) timeState = ts;
      insight = parseInt(localStorage.getItem(LS_INSIGHT) || String(DIFF.startInsight), 10);
    } catch (e) { console.warn("Load error:", e); }
  }

  function checkUnlocks() {
    const study = locations.find(l => l.id === "study");
    if (study && !study.unlocked && study.unlockCondition && study.unlockCondition()) {
      if (!DIFF.strictUnlocks || inventory.includes("key_study")) {
        study.unlocked = true;
        toast(`Открыта локация: ${study.title}`);
      }
    }
    const cellar = locations.find(l => l.id === "cellar");
    if (cellar && !cellar.unlocked && cellar.unlockCondition && cellar.unlockCondition()) {
      cellar.unlocked = true;
      toast(`Открыта локация: ${cellar.title}`);
    }
    const secret = locations.find(l => l.id === "secret_room");
    if (secret && !secret.unlocked && secret.unlockCondition && secret.unlockCondition()) {
      secret.unlocked = true;
      toast(`Открыта локация: ${secret.title}`);
      completeQuest("secret_note");
    }
    save();
  }

  // ===== Рендер текущей локации =====
  function renderLocation() {
    checkUnlocks();
    const loc = locations[currentLocationIndex];
    document.getElementById("locationTitle").textContent = loc.title;
    document.getElementById("locationDescription").textContent = `${loc.description} · Фаза: ${PHASES[timeState.phaseIndex]} · Действий: ${timeState.actionsLeft} · Инсайты: ${insight}`;

    // Подлокации
    const ul = document.getElementById("sublocationList");
    ul.innerHTML = "";
    loc.sublocations.forEach(sub => {
      if (sub.hidden && !(hasFacts("fact:secret_room_hint") && sub.id === "secret_note")) return;
      const li = document.createElement("li");
      li.className = "flex-1 basis-[45%] cursor-pointer bg-gray-700 p-2 rounded hover:bg-gray-600";
      li.textContent = sub.title;
      li.onclick = () => {
        if (!payAction()) return;
        showSublocationDetails(sub);
      };
      ul.appendChild(li);
    });

    // Персонажи
    const charDiv = document.getElementById("characterInfo");
    charDiv.innerHTML = "";
    loc.characters.forEach(charId => {
      const c = characters[charId];
      if (!c) return;
      const btn = document.createElement("button");
      btn.className = "bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded w-full mb-2";
      const t = trust[charId] ?? 50;
      btn.textContent = `${c.name} · доверие ${t}`;
      btn.onclick = () => {
        if (!payAction()) return;
        startDialog(charId);
      };
      charDiv.appendChild(btn);
    });

    save();
  }

  function showSublocationDetails(sub) {
    modal.classList.remove("hidden");
    modalTitle.textContent = sub.title;
    modalContent.innerHTML = `
      <p class="mb-3">${sub.description}</p>
      <button class="mt-2 bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded w-full">Закрыть</button>
    `;
    if (typeof sub.onInteract === "function") sub.onInteract();
    modalContent.querySelector("button").onclick = () => { modal.classList.add("hidden"); checkUnlocks(); };
  }

  // ===== Диалоги =====
  function startDialog(charId) {
    currentDialogCharacter = charId;
    currentDialogNode = characters[charId]?.dialogueTree?.start;
    showDialog();
  }

  function showDialog() {
    if (!currentDialogNode) return;
    modal.classList.remove("hidden");
    modalTitle.textContent = characters[currentDialogCharacter].name;
    modalContent.innerHTML = "";

    const text = (typeof currentDialogNode.text === "function") ? currentDialogNode.text() : currentDialogNode.text;
    const p = document.createElement("p");
    p.className = "mb-4";
    p.textContent = text;
    modalContent.appendChild(p);

    (currentDialogNode.options || []).forEach(opt => {
      if (opt.condition && !opt.condition()) return;
      const btn = document.createElement("button");
      btn.className = "bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded w-full mb-2";
      btn.textContent = opt.text;
      btn.onclick = () => {
        if (typeof opt.onChoose === "function") opt.onChoose();
        // мелкая динамика доверия за корректный тон
        adjustTrust(currentDialogCharacter, +1);
        if (opt.next === "end" || !opt.next) {
          modal.classList.add("hidden");
          checkUnlocks();
        } else {
          currentDialogNode = characters[currentDialogCharacter].dialogueTree[opt.next];
          showDialog();
        }
      };
      modalContent.appendChild(btn);
    });

    const closeBtn = document.createElement("button");
    closeBtn.className = "mt-2 bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded w-full";
    closeBtn.textContent = "Закрыть";
    closeBtn.onclick = () => { modal.classList.add("hidden"); checkUnlocks(); };
    modalContent.appendChild(closeBtn);
  }

  // ===== Меню / функциональные модалки =====
  function openNotes() {
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
        delBtn.onclick = () => { notes.splice(i, 1); save(); openNotes(); };
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
    addBtn.onclick = () => { const v = input.value.trim(); if (v) { notes.push(v); input.value = ""; save(); openNotes(); } };
    modalContent.appendChild(addBtn);
  }

  function openInfo() {
    modal.classList.remove("hidden");
    modalTitle.textContent = "Информация";
    modalContent.innerHTML = "";

    if (facts.size === 0) {
      modalContent.innerHTML = "<p>Информации пока нет.</p>";
    } else {
      const ul = document.createElement("ul");
      Array.from(facts).forEach(k => {
        const li = document.createElement("li");
        li.className = "mb-1";
        li.textContent = factLabels[k] || k;
        ul.appendChild(li);
      });
      modalContent.appendChild(ul);
    }

    // кнопка: открыть журнал дедукции
    const btn = document.createElement("button");
    btn.className = "mt-3 bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded w-full";
    btn.textContent = "Журнал дедукции";
    btn.onclick = openJournal;
    modalContent.appendChild(btn);
  }

  function openInventory() {
    modal.classList.remove("hidden");
    modalTitle.textContent = "Инвентарь";
    modalContent.innerHTML = "";

    if (inventory.length === 0) {
      modalContent.innerHTML = "<p>Инвентарь пуст.</p>";
    } else {
      const ul = document.createElement("ul");
      inventory.forEach(item => {
        const li = document.createElement("li");
        li.className = "mb-1";
        li.textContent = item;
        ul.appendChild(li);
      });
      modalContent.appendChild(ul);
    }

    // обмен предмета на инсайт
    const tradeBtn = document.createElement("button");
    tradeBtn.className = "mt-3 bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded w-full";
    tradeBtn.textContent = "Обменять предмет на инсайт";
    tradeBtn.onclick = () => {
      if (inventory.length === 0) return toast("Обменять нечего.");
      const item = prompt("Введите точное название предмета для обмена (будет удалён):");
      const idx = inventory.indexOf(item);
      if (idx >= 0) {
        inventory.splice(idx, 1);
        insight += 1;
        toast(`Вы обменяли «${item}» на 1 инсайт. Текущие инсайты: ${insight}`);
        save();
        openInventory();
      } else {
        toast("Такого предмета нет.");
      }
    };
    modalContent.appendChild(tradeBtn);
  }

  function openJournal() {
    modal.classList.remove("hidden");
    modalTitle.textContent = "Журнал дедукции";
    modalContent.innerHTML = "";
    if (journal.length === 0) {
      modalContent.innerHTML = "<p>Журнал пуст.</p>";
      return;
    }
    const list = document.createElement("div");
    journal.forEach(entry => {
      const div = document.createElement("div");
      div.className = "mb-2 p-2 rounded border border-gray-600";
      const kind = entry.type === "inference" ? "Вывод" : "Факт";
      const from = entry.from && entry.from.length ? ` ← ${entry.from.map(k => factLabels[k]||k).join(", ")}` : "";
      const rule = entry.rule ? ` [правило: ${entry.rule}]` : "";
      div.textContent = `${kind}: ${entry.label}${from}${rule}`;
      list.appendChild(div);
    });
    modalContent.appendChild(list);
  }

  function openLocationSelector() {
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
        modal.classList.add("hidden");
      };
      modalContent.appendChild(btn);
    });
  }

  // ===== Подсказки за инсайты =====
  function openHints() {
    modal.classList.remove("hidden");
    modalTitle.textContent = "Подсказки";
    modalContent.innerHTML = `
      <p class="mb-2">Инсайты: ${insight}</p>
      <button id="hint-basic" class="bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded w-full mb-2">Купить подсказку (1 инсайт)</button>
      <button id="hint-strong" class="bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded w-full mb-2">Купить сильную подсказку (2 инсайта)</button>
      <button id="close" class="bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded w-full">Закрыть</button>
    `;
    modalContent.querySelector("#close").onclick = () => modal.classList.add("hidden");

    modalContent.querySelector("#hint-basic").onclick = () => {
      if (insight < 1) return toast("Не хватает инсайтов.");
      insight -= 1;
      const tip = basicHint();
      toast(`Подсказка: ${tip}`);
      save();
      openHints();
    };
    modalContent.querySelector("#hint-strong").onclick = () => {
      if (insight < 2) return toast("Не хватает инсайтов.");
      insight -= 2;
      const tip = strongHint();
      toast(`Сильная подсказка: ${tip}`);
      save();
      openHints();
    };
  }
  function basicHint() {
    // укажем направление: где ещё порыться
    if (!hasFacts("fact:time_midnight")) return "Поговорите с Доктором насчёт времени смерти.";
    if (!hasFacts("fact:weapon_poison_signs")) return "Установите тип оружия/отраву (Доктор, кухня, сад).";
    if (!hasFacts("fact:james_alibi_confirmed")) return "Подтвердите алиби Джеймса у повара.";
    if (!hasFacts("fact:emily_weak_alibi")) return "Проверьте алиби Эмили в библиотеке.";
    if (!hasFacts("fact:secret_room_hint")) return "Ищите подсказку о тайной комнате (Анна, библиотека).";
    return "Сопоставьте улики против ложных следов (сравнивайте факты и контр-факты).";
  }
  function strongHint() {
    // ближе к истине, но без полного раскрытия
    const k = TRUTH.killer;
    if (k === "librarian_emily") return "Кто чаще всего мелькал ночью у кухни и в библиотеке?";
    if (k === "guest_henry") return "У кого мотив связан с деньгами и завещанием?";
    if (k === "butler_james") return "Вы уверены, что подставные улики — не ловушка?";
    if (k === "maid_anna") return "Следы маленькие. С кем это соотносится?";
    return "Следуйте за мотивом и временем.";
  }

  // ===== Вердикт =====
  function showVerdictForm() {
    modal.classList.remove("hidden");
    modalTitle.textContent = "Вынести вердикт";

    const optionsSuspects = Object.entries(characters)
      .map(([id, c]) => `<option value="${id}">${c.name}</option>`)
      .join("");

    modalContent.innerHTML = `
      <form class="verdict-form space-y-3">
        <p class="opacity-80">Сопоставьте факты и выберите итог.</p>

        <label class="block">Преступник:</label>
        <select id="verdict-suspect" class="w-full bg-gray-700 text-white px-3 py-2 rounded mb-1">
          ${optionsSuspects}
        </select>

        <label class="block">Время:</label>
        <select id="verdict-time" class="w-full bg-gray-700 text-white px-3 py-2 rounded mb-1">
          <option value="ночь">ночь</option>
          <option value="утро">утро</option>
          <option value="день">день</option>
        </select>

        <label class="block">Орудие:</label>
        <select id="verdict-weapon" class="w-full bg-gray-700 text-white px-3 py-2 rounded mb-1">
          <option value="отрава">отрава</option>
          <option value="нож">нож</option>
          <option value="пистолет">пистолет</option>
        </select>

        <label class="block">Мотив:</label>
        <select id="verdict-motive" class="w-full bg-gray-700 text-white px-3 py-2 rounded mb-2">
          <option value="тайны прошлого">тайны прошлого</option>
          <option value="ревность">ревность</option>
          <option value="финансовые махинации">финансовые махинации</option>
        </select>

        <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded w-full">Подтвердить</button>
        <button type="button" id="close-verdict" class="bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded w-full mt-1">Закрыть</button>
      </form>
    `;

    modalContent.querySelector("#close-verdict").onclick = () => modal.classList.add("hidden");

    modalContent.querySelector("form").onsubmit = (e) => {
      e.preventDefault();
      const suspect = document.getElementById("verdict-suspect").value;
      const time = document.getElementById("verdict-time").value;
      const weapon = document.getElementById("verdict-weapon").value;
      const motive = document.getElementById("verdict-motive").value;

      let score = 0;
      if (suspect === TRUTH.killer) score++;
      if (time === TRUTH.time) score++;
      if (weapon === TRUTH.weapon) score++;
      if (motive === TRUTH.motive) score++;

      const hints = [];
      if (!hasFacts("fact:time_midnight")) hints.push("Не установлено точное время смерти.");
      if (!(hasFacts("fact:shed_chem") || hasFacts("fact:empty_vial") || hasFacts("fact:barrel_herbal"))) hints.push("Нет твёрдых улик об отраве.");
      if (!hasFacts("fact:emily_weak_alibi") && !hasFacts("fact:emily_at_night")) hints.push("Слабое алиби Эмили/её перемещения не подтверждены.");
      if (!hasFacts("fact:james_alibi_confirmed")) hints.push("Алиби Джеймса не подтверждено у повара.");
      // опровержение ложных следов
      if (facts.has("false:james_blood") && !hasFacts("fact:no_fight")) hints.push("Подтвердите отсутствие борьбы, чтобы опровергнуть «кровь» Джеймса.");
      if (facts.has("false:henry_receipt") && !hasFacts("fact:henry_meds")) hints.push("Осмотрите сумку Генри с лекарствами — не яд.");
      if ((facts.has("false:anna_knife") || facts.has("false:emily_gunpowder")) && !hasFacts("fact:weapon_poison_signs")) hints.push("Докажите, что орудие — отрава, а не нож/пистолет.");

      if (score === 4) {
        alert(`Вы разгадали дело!\nУбийца — ${characters[TRUTH.killer].name}. Время — ${TRUTH.time}. Орудие — ${TRUTH.weapon}. Мотив — ${TRUTH.motive}.`);
      } else {
        const mislead = (suspect === "butler_james") ? "Вероятно, вы поддались на подставные улики против Джеймса.\n" : "";
        alert(`Вердикт неполный (${score}/4).\n${mislead}${hints.length ? "Подсказки:\n- " + hints.join("\n- ") : "Соберите больше подтверждений и попробуйте снова."}`);
      }
      modal.classList.add("hidden");
    };
  }

  // ===== Слоты сохранений / экспорт-импорт =====
  function saveToSlot(n) {
    const snapshot = {
      notes, facts: Array.from(facts), factLabels, inventory, currentLocationIndex, TRUTH,
      quests, unlocked: locations.filter(l => l.unlocked).map(l => l.id),
      journal, trust, timeState, insight, settings: { difficulty: chosenDifficulty }
    };
    localStorage.setItem(LS_SAVE_SLOT(n), JSON.stringify(snapshot));
    toast(`Сохранено в слот ${n}`);
  }
  function loadFromSlot(n) {
    const raw = localStorage.getItem(LS_SAVE_SLOT(n));
    if (!raw) return toast(`Слот ${n} пуст.`);
    try {
      const s = JSON.parse(raw);
      notes = s.notes || [];
      facts = new Set(s.facts || []);
      factLabels = s.factLabels || {};
      inventory = s.inventory || [];
      currentLocationIndex = s.currentLocationIndex || 0;
      TRUTH = s.TRUTH || TRUTH;
      quests = s.quests || quests;
      locations.forEach(l => l.unlocked = (s.unlocked || []).includes(l.id) || l.unlocked);
      journal = s.journal || [];
      trust = s.trust || trust;
      timeState = s.timeState || timeState;
      insight = s.insight ?? insight;
      save();
      renderLocation();
      toast(`Загружено из слота ${n}`);
    } catch (e) {
      toast("Не удалось загрузить слот.");
    }
  }
  function exportJSON() {
    const data = {
      notes, facts: Array.from(facts), factLabels, inventory, currentLocationIndex, TRUTH,
      quests, unlocked: locations.filter(l => l.unlocked).map(l => l.id),
      journal, trust, timeState, insight, settings: { difficulty: chosenDifficulty }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "detective_save.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  function importJSON() {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "application/json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const s = JSON.parse(reader.result);
          notes = s.notes || [];
          facts = new Set(s.facts || []);
          factLabels = s.factLabels || {};
          inventory = s.inventory || [];
          currentLocationIndex = s.currentLocationIndex || 0;
          TRUTH = s.TRUTH || TRUTH;
          quests = s.quests || quests;
          locations.forEach(l => l.unlocked = (s.unlocked || []).includes(l.id) || l.unlocked);
          journal = s.journal || [];
          trust = s.trust || trust;
          timeState = s.timeState || timeState;
          insight = s.insight ?? insight;
          save();
          renderLocation();
          toast("Импорт завершён.");
        } catch (e) { toast("Ошибка импорта."); }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  // ===== Навигация =====
  function goPrevLocation() {
    const unlocked = locations.filter(l => l.unlocked);
    const idx = unlocked.indexOf(locations[currentLocationIndex]);
    const next = (idx - 1 + unlocked.length) % unlocked.length;
    currentLocationIndex = locations.indexOf(unlocked[next]);
    renderLocation();
  }
  function goNextLocation() {
    const unlocked = locations.filter(l => l.unlocked);
    const idx = unlocked.indexOf(locations[currentLocationIndex]);
    const next = (idx + 1) % unlocked.length;
    currentLocationIndex = locations.indexOf(unlocked[next]);
    renderLocation();
  }

  // ===== Сброс =====
  function resetProgress() {
    if (!confirm("Сбросить прогресс?")) return;
    [LS_NOTES,LS_FACTS,LS_FACT_LABELS,LS_INVENTORY,LS_QUESTS,LS_UNLOCKED,LS_LOCATION,LS_TRUTH,LS_SETTINGS,LS_JOURNAL,LS_TRUST,LS_TIME,LS_INSIGHT]
      .forEach(k => localStorage.removeItem(k));
    location.reload();
  }

  // ===== Публичное API для кнопок в HTML =====
  window.GameAPI = {
    openNotes,
    openInfo,
    openInventory,
    openLocationSelector,
    openHints,
    openJournal,
    showVerdictForm,
    goPrevLocation,
    goNextLocation,
    nextPhase,
    saveToSlot,
    loadFromSlot,
    exportJSON,
    importJSON,
    resetProgress
  };

  // ===== Запуск =====
  load();
  initTruthOrLoad();
  checkUnlocks();
  renderLocation();
});
