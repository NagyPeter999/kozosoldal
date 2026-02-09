$(document).ready(function () {

  const envelope = $('#envelope');
  const btn_open = $("#open");
  const btn_reset = $("#reset");

  let isOpening = false;

  // Biztonsági reset betöltéskor
  const mainInit = document.getElementById("mainContent");
  const stageInit = document.getElementById("envelopeStage");
  if (mainInit) mainInit.classList.remove("show");
  if (stageInit) stageInit.style.opacity = "1";

  btn_open.on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    openLetter();
  });

  btn_reset.on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    closeLetter();
  });

  function openLetter() {

    if (isOpening) return;
    if (envelope.hasClass("open")) return;

    isOpening = true;

    // Boríték nyitása
    envelope.addClass("open").removeClass("close");

    // 👉 SZÍVEK KILÖVÉSE A BORÍTÉKBÓL
    burstHearts(24);

    setTimeout(function () {

      const main = document.getElementById("mainContent");
      const stage = document.getElementById("envelopeStage");

      if (!main || !stage) {
        isOpening = false;
        return;
      }

      // Boríték fade-out (csak a stage)
      stage.style.transition = "opacity 1s ease";
      stage.style.opacity = "0";

      // IGEN/NEM megjelenítése középen
      setTimeout(() => {
        main.classList.add("show");
        isOpening = false;
      }, 1100);

    }, 1800);
  }

  function closeLetter() {

    isOpening = false;

    envelope.addClass("close").removeClass("open");

    const main = document.getElementById("mainContent");
    const stage = document.getElementById("envelopeStage");

    if (main) main.classList.remove("show");
    if (stage) stage.style.opacity = "1";

    // oldalak reset
    document.querySelector("#valentinSection .first-page")?.classList.add("active");
    document.querySelector("#valentinSection .second-page")?.classList.remove("active");
    document.querySelector("#valentinSection .final-page")?.classList.remove("active");

    // IGEN reset
    const yesBtn = document.getElementById("yesBtn");
    if (yesBtn) yesBtn.style.transform = "scale(1)";

    // NEM reset
    const noBtn = document.getElementById("noBtn");
    if (noBtn) {
      noBtn.style.position = "relative";
      noBtn.style.left = "";
      noBtn.style.top = "";
      noBtn.style.zIndex = "";
    }
  }

  /* =========================
     KIREPÜLŐ SZÍVEK LOGIKA
  ========================= */

  function ensureBurstContainer() {
    const stage = document.getElementById("envelopeStage") || document.getElementById("letterPart");
    if (!stage) return null;

    const cs = window.getComputedStyle(stage);
    if (cs.position === "static") stage.style.position = "relative";

    let c = document.getElementById("burstHearts");
    if (!c) {
      c = document.createElement("div");
      c.id = "burstHearts";
      stage.appendChild(c);
    }
    return c;
  }

  function burstHearts(count = 24) {
    const container = ensureBurstContainer();
    const env = document.getElementById("envelope");
    if (!container || !env) return;

    const stage = container.parentElement;
    const envRect = env.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();

    const originX = (envRect.left + envRect.right) / 2 - stageRect.left;
    const originY = envRect.top - stageRect.top + 20;

    const emojis = ["💖", "💕", "💘", "❤️", "💗"];

    for (let i = 0; i < count; i++) {
      const heart = document.createElement("div");
      heart.className = "burst-heart";
      heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];

      const size = 16 + Math.random() * 18;
      const dx = (Math.random() - 0.5) * 220;
      const dy = -140 - Math.random() * 260;
      const rot = (Math.random() - 0.5) * 80;
      const dur = 900 + Math.random() * 700;

      heart.style.setProperty("--x", `${originX + (Math.random() - 0.5) * 30}px`);
      heart.style.setProperty("--y", `${originY + (Math.random() - 0.5) * 20}px`);
      heart.style.setProperty("--dx", `${dx}px`);
      heart.style.setProperty("--dy", `${dy}px`);
      heart.style.setProperty("--rot", `${rot}deg`);
      heart.style.setProperty("--dur", `${dur}ms`);
      heart.style.setProperty("--size", `${size}px`);

      container.appendChild(heart);

      heart.addEventListener("animationend", () => heart.remove());
    }
  }

});
