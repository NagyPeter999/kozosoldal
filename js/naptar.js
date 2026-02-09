document.addEventListener("DOMContentLoaded", () => {
  const calGrid = document.getElementById("calendarGrid");
  const calTitle = document.getElementById("calTitle");
  const btnPrev = document.getElementById("calPrev");
  const btnNext = document.getElementById("calNext");

  const selectedTitle = document.getElementById("selectedDateTitle");
  const eventInput = document.getElementById("eventInput");
  const addEventBtn = document.getElementById("addEventBtn");
  const eventsList = document.getElementById("eventsList");

  if (!calGrid || !calTitle || !btnPrev || !btnNext || !selectedTitle || !eventInput || !addEventBtn || !eventsList) {
    return;
  }

  const STORAGE_KEY = "our_calendar_events_v1";

  function loadEvents() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveEvents(obj) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  }

  function pad2(n){ return String(n).padStart(2, "0"); }

  function toKey(d) {
    const y = d.getFullYear();
    const m = pad2(d.getMonth() + 1);
    const day = pad2(d.getDate());
    return `${y}-${m}-${day}`;
  }

  function huMonthTitle(d) {
    return new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "long" }).format(d);
  }

  function huDateTitle(d) {
    return new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "long", day: "numeric", weekday: "long" }).format(d);
  }

  let viewDate = new Date();              // aktuális hónap nézet
  viewDate.setDate(1);
  let selectedDate = null;               // kiválasztott nap

  function renderEventsForSelected() {
    eventsList.innerHTML = "";

    if (!selectedDate) {
      selectedTitle.textContent = "Válassz egy napot";
      return;
    }

    const key = toKey(selectedDate);
    const all = loadEvents();
    const arr = Array.isArray(all[key]) ? all[key] : [];

    selectedTitle.textContent = huDateTitle(selectedDate);

    if (arr.length === 0) {
      const p = document.createElement("p");
      p.style.color = "#b30059";
      p.style.opacity = "0.9";
      p.textContent = "Még nincs program erre a napra. 💖";
      eventsList.appendChild(p);
      return;
    }

    arr.forEach((text, idx) => {
      const row = document.createElement("div");
      row.className = "eventItem";

      const t = document.createElement("div");
      t.className = "eventText";
      t.textContent = text;

      const del = document.createElement("button");
      del.className = "eventDel";
      del.textContent = "✖";
      del.title = "Törlés";

      del.addEventListener("click", () => {
        const all2 = loadEvents();
        const arr2 = Array.isArray(all2[key]) ? all2[key] : [];
        arr2.splice(idx, 1);
        all2[key] = arr2;
        saveEvents(all2);
        renderCalendar();
        renderEventsForSelected();
      });

      row.appendChild(t);
      row.appendChild(del);
      eventsList.appendChild(row);
    });
  }

  function renderCalendar() {
    calTitle.textContent = huMonthTitle(viewDate);
    calGrid.innerHTML = "";

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    // hétfő legyen az első (0=vasárnap → átalakítjuk)
    const startWeekday = (first.getDay() + 6) % 7; // 0..6 (H..V)

    const totalDays = last.getDate();
    const cells = startWeekday + totalDays;
    const rows = Math.ceil(cells / 7);
    const totalCells = rows * 7;

    const all = loadEvents();

    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement("div");
      cell.className = "calDay";

      const dayNum = i - startWeekday + 1;

      if (dayNum < 1 || dayNum > totalDays) {
        cell.classList.add("muted");
        calGrid.appendChild(cell);
        continue;
      }

      const d = new Date(year, month, dayNum);
      const key = toKey(d);

      const num = document.createElement("div");
      num.className = "dayNum";
      num.textContent = String(dayNum);
      cell.appendChild(num);

      // 8-a kiemelés
      if (dayNum === 8) {
        cell.classList.add("ourDay");
        const badge = document.createElement("div");
        badge.className = "ourBadge";
        badge.textContent = "A mi napunk! 💖";
        cell.appendChild(badge);
      }

      // van-e esemény
      const arr = Array.isArray(all[key]) ? all[key] : [];
      if (arr.length > 0) cell.classList.add("hasEvent");

      // kiválasztott nap jelölése
      if (selectedDate && toKey(selectedDate) === key) {
        cell.classList.add("selected");
      }

      cell.addEventListener("click", () => {
        selectedDate = d;
        renderCalendar();
        renderEventsForSelected();
      });

      calGrid.appendChild(cell);
    }
  }

  btnPrev.addEventListener("click", () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    renderCalendar();
  });

  btnNext.addEventListener("click", () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    renderCalendar();
  });

  addEventBtn.addEventListener("click", () => {
    if (!selectedDate) {
      selectedTitle.textContent = "Előbb válassz egy napot 🙂";
      return;
    }

    const text = (eventInput.value || "").trim();
    if (!text) return;

    const key = toKey(selectedDate);
    const all = loadEvents();
    const arr = Array.isArray(all[key]) ? all[key] : [];
    arr.unshift(text);
    all[key] = arr;
    saveEvents(all);

    eventInput.value = "";
    renderCalendar();
    renderEventsForSelected();
  });

  eventInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addEventBtn.click();
  });

  // első render
  renderCalendar();
  renderEventsForSelected();
});
