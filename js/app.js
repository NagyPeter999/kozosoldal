// =========================
// TAB / FÜLVÁLTÁS (JAVÍTOTT – NEM TÖRI MEG A NAPTÁRT)
// =========================
const sections = document.querySelectorAll(".section");

function showSection(id) {
  sections.forEach(s => s.classList.remove("active-section"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active-section");
}

// ✅ CSAK azok a gombok váltsanak fület, AMIKNEK VAN data-target
document.querySelectorAll(".tabBtn[data-target]").forEach(btn => {
  btn.addEventListener("click", () => {
    showSection(btn.dataset.target);
  });
});

document.querySelectorAll(".backBtn[data-target]").forEach(btn => {
  btn.addEventListener("click", () => {
    showSection(btn.dataset.target);
  });
});



// ===== JELSZÓ BEÁLLÍTÁS =====
const PASSWORD = "sziget"; // <-- EZ A JELSZÓ
const VALENTIN_ID = "valentinSection";

// Modal elemek
const passwordModal = document.getElementById("passwordModal");
const passwordInput = document.getElementById("valentinPasswordInput");
const passwordConfirm = document.getElementById("passwordConfirm");
const passwordCancel = document.getElementById("passwordCancel");
const passwordError = document.getElementById("passwordError");

// Ellenőrzi, hogy már feloldottuk-e ebben a böngésző fülben
const isUnlocked = () => sessionStorage.getItem("valentinUnlocked") === "1";

// TAB GOMBOK KEZELÉSE (JELSZÓVAL A VALENTINHOZ)
document.querySelectorAll(".tabBtn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const target = btn.dataset.target;

    if (target !== VALENTIN_ID) {
      showSection(target);
      return;
    }

    if (isUnlocked()) {
      showSection(target);
      return;
    }

    // Megállítjuk a váltást és megnyitjuk a modalt
    e.preventDefault();
    e.stopPropagation();

    passwordInput.value = "";
    passwordError.style.display = "none";
    passwordModal.classList.add("show");
  }, true);
});

// MEGNYITÁS gomb a modalban
passwordConfirm.addEventListener("click", () => {
  if (passwordInput.value === PASSWORD) {
    sessionStorage.setItem("valentinUnlocked", "1");
    passwordModal.classList.remove("show");
    showSection(VALENTIN_ID);
  } else {
    passwordError.style.display = "block";
  }
});

// Mégse gomb
passwordCancel.addEventListener("click", () => {
  passwordModal.classList.remove("show");
});

// Ha az overlayre kattint, zárjon be
passwordModal.addEventListener("click", (e) => {
  if (e.target === passwordModal) {
    passwordModal.classList.remove("show");
  }
});

// VISSZA GOMBOK (ha főoldalra megyünk, újra kérje)
document.querySelectorAll(".backBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    showSection(btn.dataset.target);

    if (btn.dataset.target === "homeSection") {
      sessionStorage.removeItem("valentinUnlocked");
    }
  });
});

// =========================
// "ENNYI IDEJE VAGYUNK EGYÜTT" SZÁMLÁLÓ
// Kezdet: 2025-08-08 18:25
// =========================
const startDate = new Date("2025-08-08T17:25:00");

function pad2(n) {
  return String(n).padStart(2, "0");
}

function updateCounter() {
  const now = new Date();
  let diffMs = now - startDate;

  if (diffMs < 0) diffMs = 0;

  const totalSeconds = Math.floor(diffMs / 1000);

  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  const line1 = `${days} nap, ${pad2(hours)} óra, ${pad2(minutes)} perc`;
  const line2 = `${pad2(seconds)} másodperc`;

  const c1 = document.getElementById("counterLine1");
  const c2 = document.getElementById("counterLine2");
  if (c1) c1.textContent = line1;
  if (c2) c2.textContent = line2;
}

updateCounter();
setInterval(updateCounter, 1000);
