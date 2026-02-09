// js/kepek_firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore, collection, addDoc, serverTimestamp,
  query, orderBy, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

/* =========================
   1) IDE MÁSOLD BE A SAJÁT FIREBASE CONFIGOD
========================= */
const firebaseConfig = {
  apiKey: "IDE_JON",
  authDomain: "IDE_JON",
  projectId: "IDE_JON",
  storageBucket: "IDE_JON",
  messagingSenderId: "IDE_JON",
  appId: "IDE_JON"
};

/* =========================
   2) INIT
========================= */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// UI elemek
const photoInput = document.getElementById("photoInput");
const uploadBtn = document.getElementById("uploadBtn");
const uploadStatus = document.getElementById("uploadStatus");
const galleryGrid = document.getElementById("galleryGrid");
const refreshGalleryBtn = document.getElementById("refreshGalleryBtn");

function setStatus(msg) {
  if (uploadStatus) uploadStatus.textContent = msg || "";
}

function fmtDate(date) {
  try {
    return new Intl.DateTimeFormat("hu-HU", { dateStyle: "medium", timeStyle: "short" }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

/* =========================
   3) FELTÖLTÉS
========================= */
async function uploadOneFile(file) {
  // Storage path: photos/<timestamp>_<random>_<originalname>
  const safeName = (file.name || "kep").replace(/[^\w.\-]+/g, "_");
  const filename = `${Date.now()}_${Math.random().toString(16).slice(2)}_${safeName}`;

  const storageRef = ref(storage, `photos/${filename}`);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);

  // Firestore: photos collection
  await addDoc(collection(db, "photos"), {
    url,
    name: file.name || "kép",
    createdAt: serverTimestamp()
  });
}

async function handleUpload() {
  if (!photoInput || !photoInput.files || photoInput.files.length === 0) {
    setStatus("Válassz ki legalább 1 képet. 🙈");
    return;
  }

  uploadBtn.disabled = true;
  photoInput.disabled = true;

  const files = Array.from(photoInput.files);

  try {
    setStatus("Feltöltés folyamatban... ⏳");

    // sorban töltjük (stabil)
    for (let i = 0; i < files.length; i++) {
      setStatus(`Feltöltés: ${i + 1}/${files.length}... ⏳`);
      await uploadOneFile(files[i]);
    }

    setStatus("✅ Feltöltve! 💖");
    photoInput.value = "";
    await loadGallery();
  } catch (err) {
    console.error(err);
    setStatus("❌ Hiba történt feltöltés közben. Nézd meg a konzolt (F12).");
  } finally {
    uploadBtn.disabled = false;
    photoInput.disabled = false;
  }
}

if (uploadBtn) uploadBtn.addEventListener("click", handleUpload);

/* =========================
   4) GALÉRIA BETÖLTÉS
========================= */
function renderGallery(items) {
  if (!galleryGrid) return;
  galleryGrid.innerHTML = "";

  if (!items || items.length === 0) {
    galleryGrid.innerHTML = `<p style="grid-column:1/-1;color:#b30059;">Még nincs kép feltöltve. 📸</p>`;
    return;
  }

  for (const item of items) {
    const card = document.createElement("div");
    card.className = "photoCard";

    const img = document.createElement("img");
    img.src = item.url;
    img.alt = item.name || "Kép";
    img.loading = "lazy";

    const meta = document.createElement("div");
    meta.className = "photoMeta";

    const created = item.createdAt ? fmtDate(item.createdAt) : "";
    meta.textContent = created ? `🕒 ${created}` : "";

    card.appendChild(img);
    card.appendChild(meta);
    galleryGrid.appendChild(card);
  }
}

async function loadGallery() {
  if (!galleryGrid) return;

  try {
    // 최신부터: createdAt desc
    const q = query(collection(db, "photos"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    const items = [];
    snap.forEach(doc => {
      const d = doc.data();
      const createdAt = d.createdAt?.toDate ? d.createdAt.toDate() : null;
      items.push({
        url: d.url,
        name: d.name,
        createdAt
      });
    });

    renderGallery(items);
  } catch (err) {
    console.error(err);
    if (galleryGrid) {
      galleryGrid.innerHTML = `<p style="grid-column:1/-1;color:#b30059;">❌ Nem sikerült betölteni a galériát. (F12 Console)</p>`;
    }
  }
}

if (refreshGalleryBtn) refreshGalleryBtn.addEventListener("click", loadGallery);

// Betöltéskor próbáljuk tölteni
loadGallery();
