import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCFxn1ZUhd6HIF2Wj-dt6ohV2ZRH_EK4Uo",
  authDomain: "our13wedding.firebaseapp.com",
  projectId: "our13wedding",
  storageBucket: "our13wedding.firebasestorage.app",
  messagingSenderId: "365371427127",
  appId: "1:365371427127:web:0efb39f2e5f05d0eefb2b2",
  measurementId: "G-TXRVCYNGQQ",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentGuestId = null;

// --- CUENTA ATRÁS ---
const countdownElement = document.getElementById("countdown");
const weddingDate = new Date("June 13, 2026 18:00:00").getTime();

setInterval(() => {
  const now = new Date().getTime();
  const distance = weddingDate - now;
  if (distance < 0) {
    countdownElement.innerHTML = "¡Es hoy!";
    return;
  }
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m`;
}, 1000);

// --- ACCESO ---
const showInvitation = (nombre) => {
  document.getElementById("welcome-message").innerText =
    `BIENVENIDO/A, ${nombre}`;
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("main-content").style.display = "block";
  window.scrollTo(0, 0); // Para empezar siempre arriba
};

window.addEventListener("load", async () => {
  const savedCode = sessionStorage.getItem("guestCode");
  if (savedCode) {
    const docRef = doc(db, "invitados", savedCode);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      currentGuestId = savedCode;
      showInvitation(docSnap.data().name);
    }
  }
});

const btnLogin = document.getElementById("btn-login");
btnLogin.addEventListener("click", async () => {
  const code = document.getElementById("guest-code-input").value.trim();
  if (!code) return;

  btnLogin.innerText = "Abriendo...";
  btnLogin.disabled = true;
  document.getElementById("login-error").style.display = "none";

  try {
    const docRef = doc(db, "invitados", code);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      currentGuestId = code;
      sessionStorage.setItem("guestCode", code);
      showInvitation(docSnap.data().name);
    } else {
      document.getElementById("login-error").style.display = "block";
      btnLogin.innerText = "Acceder";
      btnLogin.disabled = false;
    }
  } catch (e) {
    console.error(e);
    alert("Error de conexión. Inténtalo de nuevo.");
    btnLogin.disabled = false;
    btnLogin.innerText = "Acceder";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. OBSERVADOR DE TARJETAS (Efecto Textos) ---
  const bloomObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        } else {
          entry.target.classList.remove("active");
        }
      });
    },
    {
      root: null,
      threshold: 0.3,
    },
  );

  document.querySelectorAll(".sticky-card").forEach((card) => {
    bloomObserver.observe(card);
  });

  // --- 2. OBSERVADOR DEL TIMELINE ---
  const timelineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("timeline-active");
        } else {
          entry.target.classList.remove("timeline-active");
        }
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.2,
    },
  );

  document.querySelectorAll(".timeline-item").forEach((item) => {
    timelineObserver.observe(item);
  });

  // --- CONFIRMACIÓN (RSVP) ---
  const asistenciaSelect = document.getElementById("asistencia");
  const extraFields = document.getElementById("extra-fields");

  asistenciaSelect.addEventListener("change", (e) => {
    // Solo muestra los campos extra si dice que SÍ asiste
    extraFields.style.display = e.target.value === "si" ? "block" : "none";
  });

  document.getElementById("rsvp-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btnSubmit = e.target.querySelector("button");
    const asiste = asistenciaSelect.value;
    const telefono = document.getElementById("telefono").value;
    const menu = document.getElementById("menu").value;

    if (!asiste) {
      alert("Por favor, indícanos si asistirás.");
      return;
    }

    btnSubmit.disabled = true;
    btnSubmit.innerText = "Enviando...";

    try {
      const guestRef = doc(db, "invitados", currentGuestId);
      await updateDoc(guestRef, {
        confirmed: true,
        asiste: asiste === "si",
        telefono: asiste === "si" ? telefono : "",
        menu: asiste === "si" ? menu : "No asiste",
      });
      const formMsg = document.getElementById("form-message");
      formMsg.innerText = "¡Confirmación guardada con éxito!";
      formMsg.style.color = "var(--burgundy)";
      btnSubmit.innerText = "✓ Enviado";
    } catch (e) {
      alert("Hubo un error al guardar. Por favor, avísanos por teléfono.");
      btnSubmit.disabled = false;
      btnSubmit.innerText = "Confirmar";
    }
  });

  // --- 4. LÓGICA DEL POP-UP DEL MAPA ---
  const mapModal = document.getElementById("map-modal");
  const mapIframe = document.getElementById("map-iframe");
  const modalTitle = document.getElementById("modal-title");
  const closeModalBtn = document.getElementById("close-modal");
  const mapButtons = document.querySelectorAll(".btn-map-popup");

  mapButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const title = btn.getAttribute("data-title");
      const url = btn.getAttribute("data-map-url");

      modalTitle.textContent = title;
      mapIframe.src = url;
      mapModal.classList.add("active");
    });
  });

  const closeModal = () => {
    mapModal.classList.remove("active");
    setTimeout(() => {
      mapIframe.src = "";
    }, 400); // Limpia tras la animación
  };

  closeModalBtn.addEventListener("click", closeModal);
  mapModal.addEventListener("click", (e) => {
    if (e.target === mapModal) {
      closeModal();
    }
  });

  // --- 5. LÓGICA DEL CARRUSEL DE UBICACIÓN (Flechas y Dots) ---
  const locationContainer = document.querySelector(".location-container");
  const locationBoxes = document.querySelectorAll(".location-box");
  const dots = document.querySelectorAll(".dot");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");

  if (locationContainer && dots.length > 0) {
    // Observador para los puntitos
    const dotObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(locationBoxes).indexOf(entry.target);
            dots.forEach((dot) => dot.classList.remove("active"));
            if (dots[index]) dots[index].classList.add("active");
          }
        });
      },
      {
        root: locationContainer,
        threshold: 0.6,
      },
    );

    locationBoxes.forEach((box) => dotObserver.observe(box));

    // Lógica para las flechas de navegación
    if (prevBtn && nextBtn) {
      nextBtn.addEventListener("click", () => {
        locationContainer.scrollBy({
          left: locationContainer.clientWidth,
          behavior: "smooth",
        });
      });

      prevBtn.addEventListener("click", () => {
        locationContainer.scrollBy({
          left: -locationContainer.clientWidth,
          behavior: "smooth",
        });
      });
    }
  }
});





