const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const reallyBtn = document.getElementById("reallyBtn");
const music = document.getElementById("music");

let yesScale = 1;
let isFloating = false;

// =========================
// MENEKÜLŐ NEM + NÖVEKVŐ IGEN
// =========================
if (noBtn) {
    noBtn.addEventListener("click", () => {

        yesScale += 0.2;
        yesBtn.style.transform = `scale(${yesScale})`;

        if (!isFloating) {
            noBtn.style.position = "fixed";
            noBtn.style.zIndex = "999";

            const rect = noBtn.getBoundingClientRect();
            noBtn.style.left = rect.left + "px";
            noBtn.style.top = rect.top + "px";

            isFloating = true;
        }

        moveNoButton();
    });
}

function moveNoButton() {
    const padding = 20;

    const btnWidth = noBtn.offsetWidth;
    const btnHeight = noBtn.offsetHeight;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const maxX = screenWidth - btnWidth - padding;
    const maxY = screenHeight - btnHeight - padding;

    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;

    noBtn.style.left = randomX + "px";
    noBtn.style.top = randomY + "px";
}

// =========================
// IGEN → 2. OLDAL
// =========================
if (yesBtn) {
    yesBtn.addEventListener("click", () => {
        document.querySelector("#valentinSection .first-page").classList.remove("active");
        document.querySelector("#valentinSection .second-page").classList.add("active");
        music.play();
    });
}

// =========================
// TÉNYLEEEG?? → VÉGSŐ OLDAL + KONFETTI
// =========================
if (reallyBtn) {
    reallyBtn.addEventListener("click", () => {
        document.querySelector("#valentinSection .second-page").classList.remove("active");
        document.querySelector("#valentinSection .final-page").classList.add("active");

        setInterval(() => {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                shapes: ['heart'],
                colors: ['#ff4d88', '#ffb6c1', '#fff']
            });
        }, 500);
    });
}
