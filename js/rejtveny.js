document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     FEBRUÁR 14. 00:00 – KAPU + VISSZASZÁMLÁLÓ
  ========================= */

  const countdownWrapper = document.getElementById("countdownWrapper");
  const crosswordWrapper = document.getElementById("crosswordWrapper");

  const cdDays = document.getElementById("cdDays");
  const cdHours = document.getElementById("cdHours");
  const cdMinutes = document.getElementById("cdMinutes");
  const cdSeconds = document.getElementById("cdSeconds");

  // 👉 CÉLIDŐ: 2026. február 14. 00:00 (ha más év kell, itt átírod)
  const target = new Date("2026-02-09T14:00:00");

  function updateCountdown() {
    const now = new Date();
    let diff = target - now;

    if (diff <= 0) {
      // Feb 14 eljött → rejtvény megnyílik
      if (countdownWrapper) countdownWrapper.style.display = "none";
      if (crosswordWrapper) crosswordWrapper.style.display = "block";
      clearInterval(timer);
      initCrossword(); // csak ekkor generáljuk a rácsot
      return;
    }

    // amíg nem jött el: rejtvény rejtve, számláló látszik
    if (countdownWrapper) countdownWrapper.style.display = "block";
    if (crosswordWrapper) crosswordWrapper.style.display = "none";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (cdDays) cdDays.textContent = String(days).padStart(2, "0");
    if (cdHours) cdHours.textContent = String(hours).padStart(2, "0");
    if (cdMinutes) cdMinutes.textContent = String(minutes).padStart(2, "0");
    if (cdSeconds) cdSeconds.textContent = String(seconds).padStart(2, "0");
  }

  const timer = setInterval(updateCountdown, 1000);
  updateCountdown();

  // Ha már megnyílt (pl. betöltéskor már Feb 14 után vagyunk), init
  if (new Date() >= target) {
    initCrossword();
  }

  /* =========================
     KERESZTREJTVÉNY – LOGIKA
  ========================= */

  function initCrossword() {
    // Védelem: ne inicializálja kétszer
    if (window.__crosswordInitialized) return;
    window.__crosswordInitialized = true;

    // ÉKEZETES MEGOLDÁSOK (a user írhat ékezet nélkül is)
    const data = [
      { initial: "s", answer: "SUSHI", clue: "Kedvenc közös ételünk" },
      { initial: "z", answer: "ZSIRÁF", clue: "Nyugatihoz közeli hely" },
      { initial: "i", answer: "INDEX", clue: "Mit rakunk ki, ha kanyarodunk?" },
      { initial: "g", answer: "GETTÓ", clue: "… Csirke – Pogány Induló" },
      { initial: "e", answer: "EPOSZ", clue: "Zrínyi Miklós – Szigeti veszedelem művének műfaja" },
      { initial: "t", answer: "TÜKÖRTEREM", clue: "Égjen a Szabadság híd is el végül" },
    ];

    const grid = document.getElementById("crosswordGrid") || document.querySelector(".crossword-grid");
    const clues = document.getElementById("crosswordClues") || document.querySelector(".crossword-clues");
    const result = document.getElementById("crosswordResult") || document.querySelector(".crossword-result");
    const checkBtn = document.getElementById("checkCrosswordBtn") || document.querySelector(".crossword-actions button");

    if (!grid || !clues || !result || !checkBtn) return;

    // ===== Segéd: ékezetek eltávolítása (összehasonlításhoz) =====
    function normalizeHU(str) {
      return (str || "")
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }

    // Clue lista
    clues.innerHTML = "";
    data.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item.clue;
      clues.appendChild(li);
    });

    // Grid generálás (soronként egy szó)
    grid.innerHTML = "";
    const allInputs = [];

    data.forEach((item, rowIdx) => {
      const row = document.createElement("div");
      row.className = "crossword-row";

      const letters = [...item.answer];

      letters.forEach((char, colIdx) => {
        const inp = document.createElement("input");
        inp.className = "crossword-cell";
        inp.maxLength = 1;
        inp.inputMode = "text";
        inp.autocomplete = "off";
        inp.spellcheck = false;

        inp.dataset.row = String(rowIdx);
        inp.dataset.col = String(colIdx);
        inp.dataset.correct = char; // lehet ékezetes

        if (colIdx === 0) inp.classList.add("initial");

        row.appendChild(inp);
        allInputs.push(inp);
      });

      grid.appendChild(row);
    });

    // Helper: input index
    function getInputByRC(r, c) {
      return allInputs.find(x => x.dataset.row === String(r) && x.dataset.col === String(c)) || null;
    }

    function focusRC(r, c) {
      const el = getInputByRC(r, c);
      if (el) el.focus();
    }

    // Input viselkedés
    allInputs.forEach((inp, i) => {
      inp.addEventListener("input", () => {
        inp.value = (inp.value || "").toUpperCase().slice(0, 1);
        if (inp.value && allInputs[i + 1]) allInputs[i + 1].focus();
        inp.style.borderColor = ""; // gépeléskor reseteljük
      });

      inp.addEventListener("keydown", (e) => {
        const r = Number(inp.dataset.row);
        const c = Number(inp.dataset.col);

        if (e.key === "Backspace") {
          if (!inp.value && allInputs[i - 1]) allInputs[i - 1].focus();
          return;
        }

        if (e.key === "Enter") {
          e.preventDefault();
          if (allInputs[i + 1]) allInputs[i + 1].focus();
          return;
        }

        if (e.key === "ArrowLeft") { e.preventDefault(); focusRC(r, c - 1); return; }
        if (e.key === "ArrowRight") { e.preventDefault(); focusRC(r, c + 1); return; }
        if (e.key === "ArrowUp") { e.preventDefault(); focusRC(r - 1, c); return; }
        if (e.key === "ArrowDown") { e.preventDefault(); focusRC(r + 1, c); return; }
      });
    });

    // Ellenőrzés
    checkBtn.addEventListener("click", () => {
      let ok = true;

      allInputs.forEach(inp => {
        const wantN = normalizeHU(inp.dataset.correct);
        const gotN = normalizeHU(inp.value);

        const cellOk = gotN === wantN && gotN !== "";
        if (!cellOk) ok = false;

        // jelzés ellenőrzéskor
        inp.style.borderColor = cellOk
          ? "rgba(0, 128, 0, 0.45)"
          : "rgba(200, 0, 0, 0.55)";
      });

      if (ok) {
        sessionStorage.setItem("valentinUnlocked", "1");
        result.textContent = "✅ Vár egy kis meglepetés a Valentin-nap oldalon 💖";
      } else {
        result.textContent = "❌ Próbálkozz újra! 🙈";
      }
    });
  }

});

